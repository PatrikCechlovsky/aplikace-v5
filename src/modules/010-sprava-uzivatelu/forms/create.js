import { inviteUserByEmail } from '../../../db.js';
export default async function renderCreateForm(root){
  const url = new URL(location.href);
  const preEmail = url.hash.includes('?') ? new URLSearchParams(url.hash.split('?')[1]).get('email') : '';
  root.innerHTML = `
    <form class="p-4 bg-white rounded-2xl border space-y-3">
      <h3 class="font-medium">Nový uživatel / pozvánka</h3>
      <label class="block">
        <span class="text-xs text-slate-500">E‑mail (pro pozvánku)</span>
        <input name="email" type="email" required class="w-full border rounded p-2" value="${'${preEmail}'}" placeholder="user@example.com" />
      </label>
      <label class="block">
        <span class="text-xs text-slate-500">Jméno (volitelné)</span>
        <input name="display_name" class="w-full border rounded p-2" />
      </label>
      <label class="block">
        <span class="text-xs text-slate-500">Role</span>
        <select name="role" class="w-full border rounded p-2">
          <option value="user" selected>user</option>
          <option value="admin">admin</option>
        </select>
      </label>
      <div class="flex gap-2">
        <button class="px-3 py-2 bg-slate-900 text-white rounded" type="submit">Odeslat pozvánku</button>
        <a class="px-3 py-2 border rounded" href="#/m/010-uzivatele/t/prehled">Zpět</a>
      </div>
    </form>`;
  root.querySelector('form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get('email') || '').trim();
    const display_name = String(fd.get('display_name') || '').trim();
    const role = String(fd.get('role') || 'user');
    const { error } = await inviteUserByEmail({ email, display_name, role });
    if (error) { alert('Pozvánku se nepodařilo odeslat: ' + error.message); return; }
    alert('Pozvánka odeslána.');
    navigateTo('#/m/010-uzivatele/t/prehled');
  });
}