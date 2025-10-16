import { listAttachments, uploadAttachment, archiveAttachment } from '../db.js';

// Nová funkce pro změnu popisu přílohy
import { updateAttachmentDescription } from '../db.js';

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
    <div class="bg-white rounded-xl p-6 w-full max-w-xl relative shadow-xl">
      <button class="absolute top-3 right-3 text-xl" id="close-attachments-modal">&times;</button>
      <h2 class="font-bold text-lg mb-4">Přílohy</h2>
      <div id="attachments-list">Načítám přílohy…</div>
      <div class="mt-4 flex gap-2 items-center">
        <input type="file" id="attachment-upload" style="display:none"/>
        <button id="add-attachment" class="px-4 py-2 bg-amber-100 rounded border border-amber-300">Přidat přílohu</button>
        <input type="text" id="attachment-description" class="px-2 py-1 border rounded" placeholder="Popis přílohy" style="width:200px"/>
        <label class="ml-2">
          <input type="checkbox" id="show-archived-attachments"/>
          Zobrazit archivované
        </label>
      </div>
    </div>
  </div>`;

  async function renderList(showArchived = false) {
    root.querySelector('#attachments-list').innerHTML = 'Načítám…';
    const { data: files = [] } = await listAttachments({ entity, entityId, showArchived });
    if (!files.length) {
      root.querySelector('#attachments-list').innerHTML = '<div class="text-slate-400 text-sm">Žádné přílohy.</div>';
      return;
    }
    root.querySelector('#attachments-list').innerHTML = `
      <ul>
        ${files.map(f => `
          <li class="flex items-center gap-2 mb-2">
            <a href="${f.url}" target="_blank" class="underline">${f.filename}</a>
            ${
              f.editing
                ? `<input type="text" value="${f.description || ''}" style="width:160px" data-edit-description="${f.id}" class="px-2 py-1 border rounded text-xs"/>
                   <button data-save-desc="${f.id}" class="px-2 py-1 border rounded text-xs bg-emerald-100">Uložit</button>
                   <button data-cancel-desc="${f.id}" class="px-2 py-1 border rounded text-xs bg-slate-100">Zpět</button>`
                : `<span class="text-xs text-slate-600" style="min-width:100px;">${f.description || ''}</span>
                   <button data-edit-desc="${f.id}" class="px-2 py-1 border rounded text-xs">Upravit popis</button>`
            }
            ${f.archived ? '<span class="text-xs text-slate-400">(archivováno)</span>' : ''}
            ${!f.archived ? `<button data-id="${f.id}" class="archive-attachment text-xs px-2 py-1 border rounded">Archivovat</button>` : ''}
          </li>
        `).join('')}
      </ul>
    `;
    // Archive
    root.querySelectorAll('.archive-attachment').forEach(btn => {
      btn.onclick = async () => {
        await archiveAttachment(btn.dataset.id);
        renderList(root.querySelector('#show-archived-attachments').checked);
      };
    });

    // Edit popis
    root.querySelectorAll('[data-edit-desc]').forEach(btn => {
      btn.onclick = () => {
        files.forEach(x => x.editing = (x.id === btn.dataset.editDesc));
        renderList(root.querySelector('#show-archived-attachments').checked);
      };
    });

    // Save popis
    root.querySelectorAll('[data-save-desc]').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.dataset.saveDesc;
        const input = root.querySelector(`[data-edit-description="${id}"]`);
        await updateAttachmentDescription(id, input.value);
        files.forEach(x => x.editing = false);
        renderList(root.querySelector('#show-archived-attachments').checked);
      };
    });

    // Cancel edit
    root.querySelectorAll('[data-cancel-desc]').forEach(btn => {
      btn.onclick = () => {
        files.forEach(x => x.editing = false);
        renderList(root.querySelector('#show-archived-attachments').checked);
      };
    });
  }

  renderList();

  root.querySelector('#close-attachments-modal').onclick = () => { root.innerHTML = ''; };
  root.querySelector('#add-attachment').onclick = () => root.querySelector('#attachment-upload').click();
  root.querySelector('#show-archived-attachments').onchange = (e) => renderList(e.target.checked);

  root.querySelector('#attachment-upload').onchange = async (e) => {
    const file = e.target.files[0];
    const description = root.querySelector('#attachment-description')?.value || '';
    if (!file) return;
    const result = await uploadAttachment({ entity, entityId, file, description });
    if (result.error) {
      alert('Chyba při nahrávání souboru: ' + result.error.message);
      console.error('Attachment upload error:', result.error);
    }
    root.querySelector('#attachment-description').value = '';
    renderList(root.querySelector('#show-archived-attachments').checked);
  };
}

export default { showAttachmentsModal };
