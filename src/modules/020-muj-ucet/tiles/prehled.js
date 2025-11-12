import { getMyProfile } from '../../../db.js';
import { setBreadcrumb } from '../../../ui/breadcrumb.js';
import { icon } from '../../../ui/icons.js';

export async function render(root){
  const { data, error } = await getMyProfile();
  if (error) { root.innerHTML = `<div class="p-4 text-red-600">${error.message}</div>`; return; }
  const me = data || {};
  setBreadcrumb(document.getElementById('crumb'), [
    { icon:'home', label:'Domů', href:'#/' },
    { icon:'user', label:'Můj účet' },
  ]);
  root.innerHTML = `
    <div class="p-4 bg-white rounded-2xl border space-y-3">
      <div><span class="text-xs text-slate-500">Jméno</span><div>${me.display_name || '—'}</div></div>
      <div><span class="text-xs text-slate-500">E‑mail</span><div>${me.email || '—'}</div></div>
      <div><span class="text-xs text-slate-500">Role</span><div>${me.role || 'user'}</div></div>
      <div class="pt-2 flex gap-2">
        <a class="px-3 py-2 border rounded inline-flex items-center gap-1" href="#/m/020-muj-ucet/f/edit">${icon('edit')} Upravit</a>
        <a class="px-3 py-2 bg-blue-600 text-white border rounded inline-flex items-center gap-1 hover:bg-blue-700" href="#/m/020-muj-ucet/f/detail">${icon('view')} Přehled entit</a>
      </div>
    </div>
  `;
}
export default { render };
