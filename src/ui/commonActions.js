// src/ui/commonActions.js
export function renderCommonActions(root, { onAdd, onEdit, onArchive } = {}) {
  if (!root) return;
  import('./icons.js').then(({ icon }) => {
    root.innerHTML = `
      <div class="flex items-center gap-2">
        <button id="ca-add"  class="px-2 py-1 border rounded bg-white text-sm inline-flex items-center gap-1" title="Přidat">${icon('add')} Přidat</button>
        <button id="ca-edit" class="px-2 py-1 border rounded bg-white text-sm inline-flex items-center gap-1" title="Upravit">${icon('edit')} Upravit</button>
        <button id="ca-arch" class="px-2 py-1 border rounded bg-white text-sm inline-flex items-center gap-1" title="Archiv">${icon('archive')} Archiv</button>
      </div>
    `;
    root.querySelector('#ca-add') ?.addEventListener('click', () => onAdd?.());
    root.querySelector('#ca-edit')?.addEventListener('click', () => onEdit?.());
    root.querySelector('#ca-arch')?.addEventListener('click', () => onArchive?.());
  });
  root.querySelector('#ca-add')?.addEventListener('click', () => onAdd?.());
  root.querySelector('#ca-edit')?.addEventListener('click', () => onEdit?.());
  root.querySelector('#ca-arch')?.addEventListener('click', () => onArchive?.());
}
