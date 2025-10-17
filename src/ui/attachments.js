// Univerzální modal pro správu příloh k jakémukoliv záznamu
import { listAttachments, uploadAttachment, archiveAttachment, unarchiveAttachment, updateAttachmentMetadata } from '../db.js';

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
 * Umožňuje:
 * - upravit název souboru před uploadem
 * - volit automatickou sanitizaci názvu (auto-přejmenovat)
 * - zadat popisek před uploadem
 * - editovat metadata (název + popisek) u existujících položek
 * - archivovat i od-archivovat položky
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
        <input type="text" id="attachment-filename" class="px-2 py-1 border rounded" placeholder="Název souboru (před uploadem)" style="width:260px"/>
        <input type="text" id="attachment-description" class="px-2 py-1 border rounded" placeholder="Popis přílohy" style="width:220px"/>
        <label title="Pokud povolíte, aplikace automaticky upraví název souboru (odstraní diakritiku a nahradí nepovolené znaky).">
          <input type="checkbox" id="attachment-autosan" />
          Auto-přejmenovat
        </label>
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
          <li class="flex items-center gap-2 mb-2" data-id="${f.id}">
            <a href="${f.url}" target="_blank" class="underline">${f.filename}</a>
            <span class="attachment-desc text-xs text-slate-600" style="min-width:180px;">${f.description || ''}</span>
            <button class="edit-desc-btn text-xs px-2 py-1 border rounded" data-action="edit">Upravit</button>
            <button class="archive-attachment text-xs px-2 py-1 border rounded" data-action="${f.archived ? 'unarchive' : 'archive'}">${f.archived ? 'Obnovit' : 'Archivovat'}</button>
            ${f.archived ? '<span class="text-xs text-slate-400">(archivováno)</span>' : ''}
          </li>
        `).join('')}
      </ul>
    `;

    // Delegované handlery pro každý li[data-id]
    root.querySelectorAll('li[data-id]').forEach(li => {
      const id = li.getAttribute('data-id');
      const editBtn = li.querySelector('[data-action="edit"]');
      const archiveBtn = li.querySelector('[data-action="archive"], [data-action="unarchive"]');
      const descSpan = li.querySelector('.attachment-desc');

      if (archiveBtn) {
        archiveBtn.onclick = async () => {
          if (archiveBtn.getAttribute('data-action') === 'archive') {
            await archiveAttachment(id);
          } else {
            await unarchiveAttachment(id);
          }
          renderList(root.querySelector('#show-archived-attachments').checked);
        };
      }

      if (editBtn && descSpan) {
        editBtn.onclick = () => {
          const currentDesc = descSpan.textContent || '';
          const currentName = li.querySelector('a')?.textContent || '';
          // vytvoř pole pro úpravy
          const nameInput = document.createElement('input');
          nameInput.type = 'text';
          nameInput.value = currentName;
          nameInput.className = 'px-2 py-1 border rounded text-xs';
          nameInput.style.width = '220px';

          const descInput = document.createElement('input');
          descInput.type = 'text';
          descInput.value = currentDesc;
          descInput.className = 'px-2 py-1 border rounded text-xs';
          descInput.style.width = '220px';

          const save = document.createElement('button');
          save.textContent = 'Uložit';
          save.className = 'px-2 py-1 border rounded text-xs bg-emerald-100';
          const cancel = document.createElement('button');
          cancel.textContent = 'Zpět';
          cancel.className = 'px-2 py-1 border rounded text-xs bg-slate-100';

          // schovej původní prvky
          descSpan.style.display = 'none';
          li.querySelector('a').style.display = 'none';
          editBtn.style.display = 'none';

          // vlož nové prvky
          li.insertBefore(nameInput, archiveBtn);
          li.insertBefore(descInput, archiveBtn);
          li.insertBefore(save, archiveBtn);
          li.insertBefore(cancel, archiveBtn);

          cancel.onclick = () => {
            nameInput.remove();
            descInput.remove();
            save.remove();
            cancel.remove();
            descSpan.style.display = '';
            li.querySelector('a').style.display = '';
            editBtn.style.display = '';
          };

          save.onclick = async () => {
            const newName = nameInput.value?.trim() || '';
            const newDesc = descInput.value?.trim() || '';
            // Zavolat updateAttachmentMetadata (pouze metadata v DB)
            const res = await updateAttachmentMetadata(id, { filename: newName, description: newDesc });
            if (res.error) {
              alert('Chyba při ukládání: ' + (res.error.message || res.error));
              console.error(res.error);
              return;
            }
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

  // Upload: použije uživatelem zadaný název (pokud vyplněn) nebo původní název souboru
  root.querySelector('#attachment-upload').onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // použít upravený název před uploadem (pokud vyplněn)
    const desiredName = root.querySelector('#attachment-filename')?.value?.trim();
    const description = root.querySelector('#attachment-description')?.value?.trim() || '';
    const autoSan = !!root.querySelector('#attachment-autosan')?.checked;

    // Jestli chceš poslat upravený název do storage, musíme vytvořit nový Blob/File s upraveným jménem.
    // V JS lze zkopírovat file do nového File s jiným name:
    let fileToUpload = file;
    if (desiredName) {
      try {
        // zachovat typ a data, ale s novým názvem
        fileToUpload = new File([file], desiredName, { type: file.type });
      } catch (err) {
        // V některých prostředích (staré prohlížeče) nemusí File constructor fungovat — fallback na původní file
        console.warn('Nepodařilo se vytvořit File s novým jménem, použije se původní.', err);
        fileToUpload = file;
      }
    }

    const result = await uploadAttachment({ entity, entityId, file: fileToUpload, description, autoSanitize: autoSan });
    if (result.error) {
      alert('Chyba při nahrávání souboru: ' + result.error.message);
      console.error('Attachment upload error:', result.error);
    } else {
      // vyčistit políčka
      root.querySelector('#attachment-filename').value = '';
      root.querySelector('#attachment-description').value = '';
      root.querySelector('#attachment-autosan').checked = false;
    }
    renderList(root.querySelector('#show-archived-attachments').checked);
  };
}

export default { showAttachmentsModal };
