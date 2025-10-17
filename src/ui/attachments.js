// Univerzální modal pro správu příloh k jakémukoliv záznamu
import { listAttachments, uploadAttachment, archiveAttachment, updateAttachmentDescription } from '../db.js';

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

/**
 * Otevře modal se správou příloh pro konkrétní entitu.
 * @param { entity: string, entityId: string|number }
 */
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

    // Sestav HTML pro seznam a přidej data-id pro ovladače
    root.querySelector('#attachments-list').innerHTML = `
      <ul>
        ${files.map(f => `
          <li class="flex items-center gap-2 mb-2" data-id="${f.id}">
            <a href="${f.url}" target="_blank" class="underline">${f.filename}</a>
            <span class="attachment-desc text-xs text-slate-600" style="min-width:160px;">${f.description || ''}</span>
            <button class="edit-desc-btn text-xs px-2 py-1 border rounded" data-action="edit">Upravit popis</button>
            <button class="archive-attachment text-xs px-2 py-1 border rounded"${f.archived ? ' disabled' : ''} data-action="archive">Archivovat</button>
            ${f.archived ? '<span class="text-xs text-slate-400">(archivováno)</span>' : ''}
          </li>
        `).join('')}
      </ul>
    `;

    // Delegace: připoj handlery
    root.querySelectorAll('li[data-id]').forEach(li => {
      const id = li.getAttribute('data-id');

      // Archivovat
      const archiveBtn = li.querySelector('[data-action="archive"]');
      if (archiveBtn) {
        archiveBtn.onclick = async () => {
          await archiveAttachment(id);
          renderList(root.querySelector('#show-archived-attachments').checked);
        };
      }

      // Upravit popis (inline)
      const editBtn = li.querySelector('[data-action="edit"]');
      const descSpan = li.querySelector('.attachment-desc');
      if (editBtn && descSpan) {
        editBtn.onclick = () => {
          // Vytvoř input + save + cancel v rámci li
          const current = descSpan.textContent || '';
          const input = document.createElement('input');
          input.type = 'text';
          input.value = current;
          input.className = 'px-2 py-1 border rounded text-xs';
          input.style.width = '220px';

          const save = document.createElement('button');
          save.textContent = 'Uložit';
          save.className = 'px-2 py-1 border rounded text-xs bg-emerald-100';
          const cancel = document.createElement('button');
          cancel.textContent = 'Zpět';
          cancel.className = 'px-2 py-1 border rounded text-xs bg-slate-100';

          // Skryj span a edit button, vlož input+save+cancel
          descSpan.style.display = 'none';
          editBtn.style.display = 'none';
          li.insertBefore(input, archiveBtn);
          li.insertBefore(save, archiveBtn);
          li.insertBefore(cancel, archiveBtn);

          cancel.onclick = () => {
            input.remove();
            save.remove();
            cancel.remove();
            descSpan.style.display = '';
            editBtn.style.display = '';
          };

          save.onclick = async () => {
            const newDesc = input.value || '';
            const res = await updateAttachmentDescription(id, newDesc);
            if (res.error) {
              alert('Chyba při ukládání popisu: ' + res.error.message);
              console.error(res.error);
              return;
            }
            // reload list
            renderList(root.querySelector('#show-archived-attachments').checked);
          };
        };
      }
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
    // vyčistit input
    root.querySelector('#attachment-description').value = '';
    renderList(root.querySelector('#show-archived-attachments').checked);
  };
}

export default { showAttachmentsModal };
