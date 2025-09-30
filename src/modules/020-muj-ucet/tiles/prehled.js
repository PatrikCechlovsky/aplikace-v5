import { getMyProfile } from '../../../db.js';
import { icon } from '../../../ui/icons.js';

export async function render(root){
  const { data, error } = await getMyProfile();
  if (error) { root.innerHTML = `<div class="p-4 text-red-600">${error.message}</div>`; return; }
  const me = data || {};
  root.innerHTML = `
    <div class="p-4 bg-white rounded-2xl border space-y-3">
      <div class="flex items-center gap-2 text-sm text-slate-500 mb-2">${icon('home')} Můj účet</div>
      <div><span class="text-xs text-slate-500">Jméno</span><div>${me.display_name || '—'}</div></div>
      <div><span class="text-xs text-slate-500">E‑mail</span><div>${me.email || '—'}</div></div>
      <div><span class="text-xs text-slate-500">Role</span><div>${me.role || 'user'}</div></div>
      <div class="pt-2">
        <a class="px-3 py-2 border rounded inline-flex items-center gap-1" href="#/m/020-muj-ucet/f/edit">${icon('edit')} Upravit</a>
      </div>
    </div>
  `;
}