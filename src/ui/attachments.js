// src/ui/attachments.js — tabulkové UI pro přílohy: tlačítka nahoře, datum vložení, přehledné sloupce
import {
  listAttachments,
  createTempUpload,
  cancelTemporaryUpload,
  createAttachmentFromUpload,
  updateAttachmentMetadata,
  archiveAttachment,
  unarchiveAttachment
} from '../db.js';

function ensureModalRoot() {
  let modal = document.getElementById('attachments-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'attachments-modal';
    document.body.appendChild(modal);
  }
  return modal;
}

function formatDate(dt) {
  if (!dt) return '';
  try {
    const d = new Date(dt);
    return d.toLocaleString('cs-CZ');
  } catch {
    return dt;
  }
}

export async function showAttachmentsModal({ entity, entityId }) {
  const root = ensureModalRoot();
  root.innerHTML = `
    <div class="fixed inset-0 bg-black/50 z-40 flex items-center justify-center">
      <div class="bg-white rounded-xl p-6 w-full max-w-3xl relative shadow-xl">
        <button class="absolute top-3 right-3 text-xl" id="close-attachments-modal">&times;</button>
        <h2 class="font-bold text-lg mb-4">Přílohy</h2>

        <!-- Toolbar -->
        <div class="mb-3 flex gap-2 items-center">
          <input type="file" id="attachment-upload" style="display:none"/>
          <button id="add-attachment" class="px-4 py-2 bg-amber-100 rounded border border-amber-300">Přidat přílohu</button>
          <label class="flex items-center gap-1">
            <input type="checkbox" id="attachment-autosan" checked />
            Auto-přejmenovat
          </label>
          <label class="flex items-center gap-1">
            <input type="checkbox" id="show-archived-attachments"/>
            Zobrazit archivované
          </label>

          <div style="flex:1"></div>

          <button id="edit-selected" class="px-3 py-1 border rounded" disabled>Upravit</button>
          <button id="archive-selected" class="px-3 py-1 border rounded" disabled>Archivovat</button>
        </div>

        <!-- Table -->
        <div id="attachments-table-wrapper" class="overflow-auto border rounded p-2" style="max-height:420px">
          <table id="attachments-table" class="w-full text-sm">
            <thead>
              <tr class="text-left text-xs text-slate-600">
                <th style="width:40px"></th>
                <th>Název souboru</th>
                <th>Popis</th>
                <th style="width:160px">Datum vložení</th>
                <th style="width:100px">Stav</th>
              </tr>
            </thead>
            <tbody id="attachments-tbody">
              <tr><td colspan="5" class="text-slate-400 text-sm p-3">Načítám přílohy…</td></tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  `;

  let selectedId = null;
  let tempUpload = null; // { path, publicUrl, originalName, uploadedAt }

  const tbody = root.querySelector('#attachments-tbody');
  const editBtn = root.querySelector('#edit-selected');
  const archiveBtn = root.querySelector('#archive-selected');

  function setToolbarState(isEnabled, isArchived = false) {
    editBtn.disabled = !isEnabled;
    archiveBtn.disabled = !isEnabled;
    archiveBtn.textContent = isArchived ? 'Obnovit' : 'Archivovat';
  }

  async function renderList(showArchived = false) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-slate-400 text-sm p-3">Načítám…</td></tr>';
    const { data: files = [], error } = await listAttachments({ entity, entityId, showArchived });
    if (error) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-red-600 p-3">Chyba při načítání: ${error.message || error}</td></tr>`;
      return;
    }

    // If there's an active tempUpload, show it first as an editable row
    const rows = [];
    if (tempUpload) {
      rows.push({
        id: '__temp__',
        filename: tempUpload.originalName || 'nahraný soubor',
        description: '',
        created_at: tempUpload.uploadedAt || new Date().toISOString(),
        archived: false,
        isTemp: true,
        path: tempUpload.path,
        publicUrl: tempUpload.publicUrl
      });
    }

    files.forEach(f => rows.push(f));

    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-slate-400 text-sm p-3">Žádné přílohy.</td></tr>';
      selectedId = null;
      setToolbarState(false);
      return;
    }

    tbody.innerHTML = rows.map(r => `
      <tr class="attachment-row ${String(r.id) === String(selectedId) ? 'bg-slate-100' : ''}" data-id="${r.id}" data-temp="${r.isTemp ? '1' : '0'}" data-archived="${r.archived ? '1' : '0'}">
        <td class="p-2"><input type="radio" name="attachment-select" ${String(r.id) === String(selectedId) ? 'checked' : ''} /></td>
        <td class="p-2">
          ${r.isTemp ? `<input class="filename-input px-2 py-1 border rounded w-full" value="${escapeHtml(r.filename)}" />` : `<a href="${r.url || '#'}" target="_blank" class="underline attachment-link">${escapeHtml(r.filename)}</a>`}
        </td>
        <td class="p-2">
          ${r.isTemp ? `<input class="desc-input px-2 py-1 border rounded w-full" value="${escapeHtml(r.description || '')}" />` : `<span class="text-xs text-slate-600">${escapeHtml(r.description || '')}</span>`}
        </td>
        <td class="p-2 text-xs">${formatDate(r.created_at)}</td>
        <td class="p-2 text-xs">${r.archived ? '<span class="text-slate-400">(archivováno)</span>' : ''}${r.isTemp ? '<span class="text-emerald-600"> (nové)</span>' : ''}</td>
      </tr>
    `).join('');

    // attach event handlers
    root.querySelectorAll('.attachment-row').forEach(tr => {
      const id = tr.getAttribute('data-id');
      const isTemp = tr.getAttribute('data-temp') === '1';
      const isArchived = tr.getAttribute('data-archived') === '1';

      // row select (radio)
      const radio = tr.querySelector('input[type="radio"]');
      radio.onclick = () => {
        selectedId = id === '__temp__' ? null : id; // temp row not selectable for toolbar actions
        // visually mark selection
        root.querySelectorAll('.attachment-row').forEach(r => r.classList.remove('bg-slate-100'));
        if (selectedId) {
          const el = root.querySelector(`.attachment-row[data-id="${selectedId}"]`);
          if (el) el.classList.add('bg-slate-100');
        }
        setToolbarState(!!selectedId, !!isArchived);
      };

      // if temp row, wire inline save/cancel using top buttons Save/Cancel
      if (isTemp) {
        // nothing extra here; save/cancel controlled by upload UI handlers
      }
    });

    // toolbar initial state
    setToolbarState(!!selectedId, false);
  }

  function escapeHtml(s) {
    if (!s) return '';
    return String(s).replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  // OPEN/CLOSE
  root.querySelector('#close-attachments-modal').onclick = () => { root.innerHTML = ''; };

  // Toolbar buttons
  root.querySelector('#add-attachment').onclick = () => root.querySelector('#attachment-upload').click();

  root.querySelector('#show-archived-attachments').onchange = (e) => {
    renderList(e.target.checked);
  };

  root.querySelector('#edit-selected').onclick = async () => {
    if (!selectedId) return;
    // replace selected row with inline editor (we reuse render behavior by transforming DOM)
    const tr = root.querySelector(`.attachment-row[data-id="${selectedId}"]`);
    if (!tr) return;

    // fetch current data from listAttachments to be safe
    const { data: files = [] } = await listAttachments({ entity, entityId, showArchived: root.querySelector('#show-archived-attachments').checked });
    const row = files.find(x => String(x.id) === String(selectedId));
    if (!row) return;

    tr.innerHTML = '';
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.value = row.filename || '';
    nameInput.className = 'px-2 py-1 border rounded';
    nameInput.style.width = '260px';

    const descInput = document.createElement('input');
    descInput.type = 'text';
    descInput.value = row.description || '';
    descInput.className = 'px-2 py-1 border rounded';
    descInput.style.width = '320px';

    const save = document.createElement('button');
    save.textContent = 'Uložit';
    save.className = 'px-2 py-1 border rounded bg-emerald-100 ml-2';
    const cancel = document.createElement('button');
    cancel.textContent = 'Zpět';
    cancel.className = 'px-2 py-1 border rounded ml-2';

    const td1 = document.createElement('td'); td1.colSpan = 5;
    td1.appendChild(nameInput);
    td1.appendChild(descInput);
    td1.appendChild(save);
    td1.appendChild(cancel);
    tr.appendChild(td1);

    cancel.onclick = () => renderList(root.querySelector('#show-archived-attachments').checked);
    save.onclick = async () => {
      const res = await updateAttachmentMetadata(selectedId, { filename: nameInput.value.trim(), description: descInput.value.trim() });
      if (res.error) {
        alert('Chyba při ukládání: ' + (res.error.message || res.error));
        console.error(res.error);
        return;
      }
      await renderList(root.querySelector('#show-archived-attachments').checked);
    };
  };

  root.querySelector('#archive-selected').onclick = async () => {
    if (!selectedId) return;
    const { data: files = [] } = await listAttachments({ entity, entityId, showArchived: true });
    const row = files.find(x => String(x.id) === String(selectedId));
    if (!row) return;
    if (row.archived) await unarchiveAttachment(selectedId);
    else await archiveAttachment(selectedId);
    selectedId = null;
    await renderList(root.querySelector('#show-archived-attachments').checked);
  };

  // Upload handling: create temp upload, then show temp row inputs on top of table
  root.querySelector('#attachment-upload').onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const autoSan = !!root.querySelector('#attachment-autosan')?.checked;
    const folder = `${entity}/${entityId}`;
    // temp upload
    const res = await createTempUpload(folder, file, { autoSanitize: autoSan });
    console.log('Temp upload:', res);
    if (res.error) {
      alert('Chyba při nahrávání souboru: ' + (res.error.message || res.error));
      console.error(res.error);
      return;
    }

    tempUpload = {
      path: res.data.path,
      publicUrl: res.data.publicUrl,
      originalName: res.data.originalName,
      uploadedAt: new Date().toISOString()
    };

    // show temp row then allow user to fill display name and description
    await renderList(root.querySelector('#show-archived-attachments').checked);

    // find temp row inputs and wire save/cancel
    const tempRow = root.querySelector('.attachment-row[data-id="__temp__"]');
    if (!tempRow) return;
    const filenameInput = tempRow.querySelector('.filename-input');
    const descInput = tempRow.querySelector('.desc-input');

    // create floating buttons under toolbar (Save / Cancel) or reuse header buttons
    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Uložit přílohu';
    saveBtn.className = 'px-3 py-1 bg-emerald-100 border rounded ml-2';
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Zrušit';
    cancelBtn.className = 'px-3 py-1 bg-slate-100 border rounded ml-2';

    // attach under toolbar
    const toolbar = root.querySelector('.mb-3');
    toolbar.appendChild(saveBtn);
    toolbar.appendChild(cancelBtn);

    function validateTemp() {
      saveBtn.disabled = !(filenameInput.value.trim() && descInput.value.trim());
    }
    filenameInput.oninput = validateTemp;
    descInput.oninput = validateTemp;
    validateTemp();

    saveBtn.onclick = async () => {
      const filename = filenameInput.value.trim();
      const description = descInput.value.trim();
      const finalize = await createAttachmentFromUpload({ entity, entityId, path: tempUpload.path, filename, description });
      if (finalize.error) {
        alert('Chyba při ukládání metadat: ' + (finalize.error.message || finalize.error));
        console.error(finalize.error);
        return;
      }
      // cleanup
      tempUpload = null;
      saveBtn.remove();
      cancelBtn.remove();
      await renderList(root.querySelector('#show-archived-attachments').checked);
    };

    cancelBtn.onclick = async () => {
      if (tempUpload && tempUpload.path) {
        await cancelTemporaryUpload(tempUpload.path);
      }
      tempUpload = null;
      saveBtn.remove();
      cancelBtn.remove();
      await renderList(root.querySelector('#show-archived-attachments').checked);
    };
  };

  // initial render
  await renderList();
}

export default { showAttachmentsModal };
