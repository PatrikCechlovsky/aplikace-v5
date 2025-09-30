import { renderCommonActions } from '../../../ui/commonActions.js';
import { setBreadcrumb } from '../../../ui/breadcrumb.js';
import { getProfile, archiveProfile, listAttachments, uploadAttachment, removeAttachment } from '../../../db.js';

export async function render(root){
  const id = new URLSearchParams(location.hash.split('?')[1] || '').get('id');
  if (!id) { root.innerHTML = '<div class="p-4 text-red-600">Chybí id.</div>'; return; }

  setBreadcrumb(document.getElementById('crumb'), [
    { icon:'home',  label:'Domů', href:'#/' },
    { icon:'users', label:'Uživatelé', href:'#/m/010-uzivatele' },
    { icon:'detail',label:'Detail' },
  ]);
  renderCommonActions(document.getElementById('crumb-actions'), {
    onAdd:    () => navigateTo('#/m/010-uzivatele/f/create'),
    onEdit:   () => navigateTo(`#/m/010-uzivatele/f/edit?id=${id}`),
    onArchive: async () => {
      const ok = confirm('Opravdu archivovat tohoto uživatele?');
      if (!ok) return;
      const { error } = await archiveProfile(id);
      if (error) alert(error.message);
      else navigateTo('#/m/010-uzivatele/t/prehled');
    },
    onAttach: () => root.querySelector('#file')?.click(),
  });

  const { data:rec, error } = await getProfile(id);
  if (error) { root.innerHTML = `<div class="p-4 text-red-600">Chyba: ${error.message}</div>`; return; }

  root.innerHTML = `
    <div class="p-4 bg-white rounded-2xl border space-y-4">
      <input id="file" type="file" class="hidden" />
      <div class="grid sm:grid-cols-2 gap-3">
        <div><div class="text-xs text-slate-500">Jméno</div><div>${rec.display_name || '—'}</div></div>
        <div><div class="text-xs text-slate-500">E‑mail</div><div>${rec.email || '—'}</div></div>
        <div><div class="text-xs text-slate-500">Role</div><div>${rec.role || 'user'}</div></div>
        <div><div class="text-xs text-slate-500">Archiv</div><div>${rec.archived ? 'Ano' : 'Ne'}</div></div>
      </div>
      <div>
        <div class="font-medium mb-1">Přílohy</div>
        <ul id="att-list" class="list-disc pl-5 text-sm"></ul>
      </div>
    </div>
  `;

  const folder = `profiles/${id}`;
  async function refreshAtt() {
    const { data, error } = await listAttachments(folder);
    const ul = root.querySelector('#att-list');
    if (error) { ul.innerHTML = `<li class="text-red-600">${error.message}</li>`; return; }
    ul.innerHTML = (data || []).map(f => `
      <li class="flex items-center justify-between">
        <span>${f.name}</span>
        <button data-del="${folder}/${f.name}" class="text-red-600 hover:underline">Smazat</button>
      </li>
    `).join('') || '<li class="text-slate-500">Žádné přílohy</li>';
  }
  await refreshAtt();

  root.querySelector('#file')?.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { error } = await uploadAttachment(folder, file);
    if (error) alert(error.message);
    await refreshAtt();
    e.target.value = '';
  });
  root.querySelector('#att-list')?.addEventListener('click', async (e) => {
    const btn = e.target.closest('button[data-del]');
    if (!btn) return;
    const ok = confirm('Smazat přílohu?');
    if (!ok) return;
    const { error } = await removeAttachment(btn.dataset.del);
    if (error) alert(error.message);
    await refreshAtt();
  });
}
export default { render };
