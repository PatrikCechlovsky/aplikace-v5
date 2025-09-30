import { getMyProfile, updateProfile } from '../../../db.js';
import { setBreadcrumb } from '../../../ui/breadcrumb.js';

export async function render(root){
  const { data:me, error } = await getMyProfile();
  if (error) { root.innerHTML = `<div class="p-4 text-red-600">${error.message}</div>`; return; }
  setBreadcrumb(document.getElementById('crumb'), [
    { icon:'home', label:'Domů', href:'#/' },
    { icon:'user', label:'Můj účet', href:'#/m/020-muj-ucet' },
    { icon:'edit', label:'Upravit' },
  ]);

  root.innerHTML = `
    <form class="p-4 bg-white rounded-2xl border space-y-3">
      <h3 class="font-medium">Upravit profil</h3>
      <label class="block">
        <span class="text-xs text-slate-500">Zobrazované jméno</span>
        <input name="display_name" class="w-full border rounded p-2" value="${me.display_name || ''}" />
      </label>
      <label class="block">
        <span class="text-xs text-slate-500">E‑mail</span>
        <input class="w-full border rounded p-2 bg-slate-100" value="${me.email || ''}" readonly />
      </label>
      <div class="flex gap-2">
        <button class="px-3 py-2 bg-slate-900 text-white rounded" type="submit">Uložit</button>
        <a class="px-3 py-2 border rounded" href="#/m/020-muj-ucet/t/prehled">Zpět</a>
      </div>
    </form>
  `;

  root.querySelector('form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const display_name = String(fd.get('display_name') || '').trim();
    const { error } = await updateProfile(me.id, { display_name });
    if (error) alert(error.message);
    else navigateTo('#/m/020-muj-ucet/t/prehled');
  });
}
export default { render };
