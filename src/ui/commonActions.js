import { icon } from './icons.js';

export function renderCommonActions(
  root,
  { onAdd, onEdit, onArchive, onRefresh, onAttach, onStar, isStarred } = {}
) {
  if (!root) return;
  root.innerHTML = `
    <div class="flex items-center gap-2">
      ${onAdd     ? `<button id="ca-add"     class="px-2 py-1 border rounded bg-white"  title="Přidat">${icon('add')}</button>` : ''}
      ${onEdit    ? `<button id="ca-edit"    class="px-2 py-1 border rounded bg-white"  title="Upravit">${icon('edit')}</button>` : ''}
      ${onArchive ? `<button id="ca-arch"    class="px-2 py-1 border rounded bg-white"  title="Archivovat">${icon('archive')}</button>` : ''}
      ${onAttach  ? `<button id="ca-attach"  class="px-2 py-1 border rounded bg-white"  title="Příloha">${icon('paperclip')}</button>` : ''}
      ${onStar    ? `<button id="ca-star"    class="px-2 py-1 border rounded bg-white"  title="${isStarred?'Odebrat z oblíbených':'Přidat do oblíbených'}">
                       <span class="text-xl ${isStarred?'text-yellow-400':'text-slate-400'}">${isStarred?'★':'☆'}</span>
                     </button>` : ''}
      ${onRefresh ? `<button id="ca-refresh" class="px-2 py-1 border rounded bg-white"  title="Obnovit">${icon('refresh')}</button>` : ''}
    </div>`;
  root.querySelector('#ca-add')    ?.addEventListener('click', () => onAdd?.());
  root.querySelector('#ca-edit')   ?.addEventListener('click', () => onEdit?.());
  root.querySelector('#ca-arch')   ?.addEventListener('click', () => onArchive?.());
  root.querySelector('#ca-attach') ?.addEventListener('click', () => onAttach?.());
  root.querySelector('#ca-star')   ?.addEventListener('click', () => onStar?.());
  root.querySelector('#ca-refresh')?.addEventListener('click', () => onRefresh?.());
}
