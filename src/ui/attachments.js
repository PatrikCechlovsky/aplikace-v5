// src/ui/attachments.js — upravené UI: upload -> temp upload -> vyplnit název a popisek -> uložit,
// single-selection, tlačítka Upravit / Archivovat fungují pro vybraný řádek
import {
  listAttachments,
  createTempUpload,
  cancelTemporaryUpload,
  createAttachmentFromUpload,
  updateAttachmentMetadata,
  archiveAttachment,
  unarchiveAttachment
} from '../db.js';

// Vloží modal do body (pokud tam ještě není)
function ensureModalRoot() {
  let modal = document.getElementById('attachments-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'attachments-modal';
    document.body.appendChild(modal);
  }
  return modal;
}

export async function showAttachmentsModal({ entity, entityId }) {
  const root = ensureModalRoot();
  root.innerHTML = `<div class="fixed inset-0 bg-black/50 z-40 flex items-center justify-center">
    <div class="bg-white rounded-xl p-6 w-full max-w-2xl relative shadow-xl">
      <button class="absolute top-3 right-3 text-xl" id="close-attachments-modal">&times;</button>
      <h2 class="font-bold text-lg mb-4">Přílohy</h2>
      <div id="attachments-list">Načítám přílohy…</div>

      <!-- upload area -->
      <div class="mt-4 flex gap-2 items-center">
        <input type="file" id="attachment-upload" style="display:none"/>
        <button id="add-attachment" class="px-4 py-2 bg-amber-100 rounded border border-amber-300">Přidat přílohu</button>

        <!-- Dočasné políčko pro název a popisek, vyplní se až po vybrání souboru -->
        <input type="text" id="attachment-displayname" class="px-2 py-1 border rounded" placeholder="Název (po nahrání)" style="width:280px; display:none"/>
        <input type="text" id="attachment-description" class="px-2 py-1 border rounded" placeholder="Popis přílohy (po nahrání)" style="width:260px; display:none"/>
        <button id="save-temp-attachment" class="px-3 py-1 bg-emerald-100 border rounded text-sm" style="display:none" disabled>Uložit</button>
        <button id="cancel-temp-attachment" class="px-3 py-1 bg-slate-100 border rounded text-sm" style="display:none">Zrušit</button>

        <label title="Pokud povolíte, aplikace automaticky upraví název souboru (odstraní diakritiku a nahradí nepovolené znaky).">
          <input type="checkbox" id="attachment-autosan" checked />
          Auto-přejmenovat
        </label>

        <label class="ml-4">
          <input type="checkbox" id="show-archived-attachments"/>
          Zobrazit archivované
        </label>
      </div>

      <!-- single action toolbar -->
      <div class="mt-3 flex gap-2">
        <button id="edit-selected" class="px-3 py-1 border rounded" disabled>Upravit</button>
        <button id="archive-selected" class="px-3 py-1 border rounded" disabled>Archivovat</button>
      </div>
    </div>
  </div>`;

  let selectedId = null;
  let tempUpload = null; // { path, publicUrl, originalName }

  // RENDER LIST
  async function renderList(showArchived = false) {
    root.querySelector('#attachments-list').innerHTML = 'Načítám…';
    const { data: files = [] } = await listAttachments({ entity, entityId, showArchived });

    if (!files.length) {
      root.querySelector('#attachments-list').innerHTML = '<div class="text-slate-400 text-sm">Žádné přílohy.</div>';
      selectedId = null;
      updateToolbar();
      return;
    }

    root.querySelector('#attachments-list').innerHTML = `
      <ul>
        ${files.map(f => `
          <li class="attachment-row flex items-center gap-3 mb-2 p-2 rounded cursor-pointer ${f.id === selectedId ? 'bg-slate-100' : ''}" data-id="${f.id}" data-archived="${f.archived}">
            <div style="min-width:220px;">
              <a href="${f.url}" target="_blank" class="underline attachment-link">${f.filename}</a>
            </div>
            <div class="text-xs text-slate-600" style="flex:1">${f.description || ''}</div>
            ${f.archived ? '<div class="text-xs text-slate-400">(archivováno)</div>' : ''}
          </li>
        `).join('')}
      </ul>
    `;

    // attach click handlers to rows for selection
    root.querySelectorAll('.attachment-row').forEach(li => {
      li.onclick = () => {
        const id = li.getAttribute('data-id');
        if (selectedId === id) selectedId = null;
        else selectedId = id;
        // re-render selection highlighting
        root.querySelectorAll('.attachment-row').forEach(r => r.classList.remove('bg-slate-100'));
        if (selectedId) {
          const el = root.querySelector(`.attachment-row[data-id="${selectedId}"]`);
          if (el) el.classList.add('bg-slate-100');
        }
        updateToolbar();
      };
    });

    updateToolbar(files);
  }

  function updateToolbar(files = null) {
    const editBtn = root.querySelector('#edit-selected');
    const archiveBtn = root.querySelector('#archive-selected');

    if (!selectedId) {
      editBtn.disabled = true;
      archiveBtn.disabled = true;
      editBtn.textContent = 'Upravit';
      archiveBtn.textContent = 'Archivovat';
      return;
    }

    // find selected item's archived status
    if (!files) {
      // fetch briefly
      listAttachments({ entity, entityId, showArchived: root.querySelector('#show-archived-attachments').checked }).then(res => {
        const f = res.data?.find(x => String(x.id) === String(selectedId));
        const isArchived = !!f?.archived;
        editBtn.disabled = false;
        archiveBtn.disabled = false;
        archiveBtn.textContent = isArchived ? 'Obnovit' : 'Archivovat';
      });
    } else {
      const f = files.find(x => String(x.id) === String(selectedId));
      const isArchived = !!f?.archived;
      editBtn.disabled = false;
      archiveBtn.disabled = false;
      archiveBtn.textContent = isArchived ? 'Obnovit' : 'Archivovat';
    }
  }

  // EDIT selected: opens a small inline form replacing the row content
  root.querySelector('#edit-selected').onclick = async () => {
    if (!selectedId) return;
    // load current metadata for selected row
    const { data: files = [] } = await listAttachments({ entity, entityId, showArchived: root.querySelector('#show-archived-attachments').checked });
    const row = files.find(x => String(x.id) === String(selectedId));
    if (!row) return;
    // find element
    const li = root.querySelector(`.attachment-row[data-id="${selectedId}"]`);
    if (!li) return;
    // hide content and insert form
    li.innerHTML = '';
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

    li.appendChild(nameInput);
    li.appendChild(descInput);
    li.appendChild(save);
    li.appendChild(cancel);

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

  // ARCHIVE / UNARCHIVE selected
  root.querySelector('#archive-selected').onclick = async () => {
    if (!selectedId) return;
    // find selected row to know archived flag
    const { data: files = [] } = await listAttachments({ entity, entityId, showArchived: true });
    const row = files.find(x => String(x.id) === String(selectedId));
    if (!row) return;
    if (row.archived) await unarchiveAttachment(selectedId);
    else await archiveAttachment(selectedId);
    selectedId = null;
    await renderList(root.querySelector('#show-archived-attachments').checked);
  };

  // Add / upload handlers
  root.querySelector('#add-attachment').onclick = () => root.querySelector('#attachment-upload').click();

  root.querySelector('#attachment-upload').onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const autoSan = !!root.querySelector('#attachment-autosan')?.checked;
    // upload to storage first (sanitized key)
    const folder = `${entity}/${entityId}`;
    const res = await createTempUpload(folder, file, { autoSanitize: autoSan });
    if (res.error) {
      alert('Chyba při nahrávání souboru: ' + (res.error.message || res.error));
      console.error('Temp upload error:', res.error);
      return;
    }
    tempUpload = res.data; // { path, publicUrl, originalName }

    // show temp fields
    const disp = root.querySelector('#attachment-displayname');
    const desc = root.querySelector('#attachment-description');
    const saveBtn = root.querySelector('#save-temp-attachment');
    const cancelBtn = root.querySelector('#cancel-temp-attachment');

    disp.style.display = '';
    desc.style.display = '';
    saveBtn.style.display = '';
    cancelBtn.style.display = '';

    // prefill display name (original name without extension)
    const orig = tempUpload.originalName || file.name;
    const dotIdx = orig.lastIndexOf('.');
    const baseName = dotIdx > 0 ? orig.slice(0, dotIdx) : orig;
    disp.value = baseName;
    desc.value = '';

    // require both fields
    function validateSaveForm() {
      saveBtn.disabled = !(disp.value.trim() && desc.value.trim());
    }
    disp.oninput = validateSaveForm;
    desc.oninput = validateSaveForm;
    validateSaveForm();

    // save -> finalize metadata into DB
    saveBtn.onclick = async () => {
      const filename = disp.value.trim();
      const description = desc.value.trim();
      // call createAttachmentFromUpload
      const finalize = await createAttachmentFromUpload({ entity, entityId, path: tempUpload.path, filename, description });
      if (finalize.error) {
        alert('Chyba při ukládání metadat: ' + (finalize.error.message || finalize.error));
        console.error(finalize.error);
        return;
      }
      // cleanup temp UI
      tempUpload = null;
      disp.style.display = 'none';
      desc.style.display = 'none';
      saveBtn.style.display = 'none';
      cancelBtn.style.display = 'none';
      disp.value = '';
      desc.value = '';
      // refresh list
      await renderList(root.querySelector('#show-archived-attachments').checked);
    };

    // cancel -> delete temp file from storage
    cancelBtn.onclick = async () => {
      if (tempUpload && tempUpload.path) {
        await cancelTemporaryUpload(tempUpload.path);
      }
      tempUpload = null;
      disp.style.display = 'none';
      desc.style.display = 'none';
      saveBtn.style.display = 'none';
      cancelBtn.style.display = 'none';
      disp.value = '';
      desc.value = '';
      // refresh list (no change expected)
      await renderList(root.querySelector('#show-archived-attachments').checked);
    };
  };

  root.querySelector('#show-archived-attachments').onchange = (e) => renderList(e.target.checked);
  root.querySelector('#close-attachments-modal').onclick = () => { root.innerHTML = ''; };

  // initial render
  await renderList();
}

export default { showAttachmentsModal };
