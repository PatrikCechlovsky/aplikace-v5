// src/ui/commonActions.js
export function renderCommonActions(root, { onAdd, onEdit, onArchive } = {}) {
  if (!root) return;
  root.innerHTML = `
    <div class="flex items-center gap-2">
      <button id="ca-add" class="px-2 py-1 border rounded bg-white text-sm" title="Přidat">➕ Přidat</button>
      <button id="ca-edit" class="px-2 py-1 border rounded bg-white text-sm" title="Upravit">✏️ Upravit</button>
      <button id="ca-arch" class="px-2 py-1 border rounded bg-white text-sm" title="Archiv">🗂️ Archiv</button>
    </div>
  `;
  root.querySelector('#ca-add')?.addEventListener('click', () => onAdd?.());
  root.querySelector('#ca-edit')?.addEventListener('click', () => onEdit?.());
  root.querySelector('#ca-arch')?.addEventListener('click', () => onArchive?.());
}
