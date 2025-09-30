import { getProfile, updateProfile } from '../../../db.js';

export async function render(root){
  const id = new URLSearchParams(location.hash.split('?')[1] || '').get('id');
  if (!id) { root.innerHTML = '<div class="p-4 text-red-600">Chybí id.</div>'; return; }
  const { data:rec, error } = await getProfile(id);
  if (error) { root.innerHTML = `<div class="p-4 text-red-600">${error.message}</div>`; return; }

  root.innerHTML = `
    <form class="p-4 bg-white rounded-2xl border space-y-3">
      <h3 class="font-medium">Upravit uživatele</h3>
      <label class="block">
        <span class="text-xs text-slate-500">E‑mail</span>
        <input class="w-full border rounded p-2 bg-slate-100" value="${rec.email || ''}" readonly />
      </label>
      <label class="block">
        <span class="text-xs text-slate-500">Jméno</span>
        <input name="display_name" class="w-full border rounded p-2" value="${rec.display_name || ''}" />
      </label>
      <label class="block">
        <span class="text-xs text-slate-500">Role</span>
        <select name="role" class="w-full border rounded p-2">
          <option value="user" ${rec.role==='user'?'selected':''}>user</option>
          <option value="admin" ${rec.role==='admin'?'selected':''}>admin</option>
        </select>
      </label>
      <div class="flex gap-2">
        <button class="px-3 py-2 bg-slate-900 text-white rounded" type="submit">Uložit</button>
        <a class="px-3 py-2 border rounded" href="#/m/010-uzivatele/f/read?id=${id}">Zpět</a>
      </div>
    </form>
  `;

  root.querySelector('form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      display_name: String(fd.get('display_name') || '').trim(),
      role: String(fd.get('role') || 'user')
    };
    const { error } = await updateProfile(id, payload);
    if (error) alert(error.message);
    else navigateTo(`#/m/010-uzivatele/f/read?id=${id}`);
  });
}