import { icon } from '../../../ui/icons.js';

export default async function renderSeznam(root) {
  root.innerHTML = `
    <div class="p-4 bg-white rounded-2xl border">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold">${icon('users')} Seznam uživatelů</h2>
        <div class="text-sm text-slate-500">placeholder • bez DB</div>
      </div>

      <div class="mt-4 border rounded-lg overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 text-slate-600">
            <tr>
              <th class="text-left p-2">Jméno</th>
              <th class="text-left p-2">Email</th>
              <th class="text-left p-2">Role</th>
              <th class="text-right p-2">Akce</th>
            </tr>
          </thead>
          <tbody id="u-rows"></tbody>
        </table>
      </div>
    </div>
  `;

  const rows = root.querySelector('#u-rows');

  // zatím statický mock (ať máme UI), DB přidáme v další fázi
  const data = [
    { name: 'Alice Nováková', email: 'alice@example.com', role: 'admin' },
    { name: 'Bob Svoboda',    email: 'bob@example.com',   role: 'user'  },
  ];

  rows.innerHTML = data.map(u => `
    <tr class="border-t">
      <td class="p-2">${u.name}</td>
      <td class="p-2">${u.email}</td>
      <td class="p-2">
        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs
          ${u.role === 'admin' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-700 border border-slate-200'}">
          ${u.role}
        </span>
      </td>
      <td class="p-2 text-right">
        <button class="px-2 py-1 text-sm border rounded hover:bg-slate-50" data-act="open">Otevřít</button>
      </td>
    </tr>
  `).join('');

  // dvojklik otevře detail (zatím jen hláška), označíme rozdělanou práci při editaci
  rows.addEventListener('dblclick', (e) => {
    const tr = e.target.closest('tr');
    if (!tr) return;
    alert('Zobrazím čtecí formulář (placeholder).');
  });
  rows.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-act="open"]');
    if (!btn) return;
    alert('Zobrazím detail (placeholder).');
  });
}
