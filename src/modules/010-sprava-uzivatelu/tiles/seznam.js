import { icon } from '../../../ui/icons.js';
import { renderActions, ACTIONS } from '../../../ui/actionButtons.js';
import { listProfiles } from '../../../db.js';

export default async function renderUsersList(root, { q='' } = {}) {
  // Head actions
  const head = document.getElementById('crumb-actions');
  if (head) {
    head.innerHTML = '';
    renderActions(head, [
      ACTIONS.add({ onClick: () => navigateTo('#/m/010-uzivatele/f/create') }),
      { key:'invite', label:'Pozvat e‑mailem', icon:'mail', onClick: openInviteDialog }
    ]);
  }

  // Search + table
  const { data, error } = await listProfiles({ q });
  if (error) {
    root.innerHTML = `<div class="p-4 text-red-600">Chyba načítání: ${error.message}</div>`;
    return;
  }

  root.innerHTML = `
    <div class="p-4 bg-white rounded-2xl border">
      <div class="flex items-center gap-2 mb-3">
        <input id="q" class="border rounded p-2 flex-1" placeholder="Hledat jméno…" value="${q || ''}" />
        <button id="btn-q" class="px-3 py-2 border rounded bg-white">Hledat</button>
      </div>
      <table class="w-full text-sm">
        <thead class="border-b bg-slate-50">
          <tr>
            <th class="text-left p-2">Jméno</th>
            <th class="text-left p-2">E‑mail</th>
            <th class="text-left p-2">Role</th>
            <th class="text-right p-2">Akce</th>
          </tr>
        </thead>
        <tbody id="rows"></tbody>
      </table>
    </div>
  `;

  const tbody = root.querySelector('#rows');
  tbody.innerHTML = data.map(r => `
    <tr data-id="${r.id}" class="border-b hover:bg-slate-50 cursor-pointer">
      <td class="p-2">${r.display_name || '—'}</td>
      <td class="p-2">${r.email || '—'}</td>
      <td class="p-2">${r.role || 'user'}</td>
      <td class="p-2 text-right">
        <a data-act="detail" class="text-indigo-600 hover:underline">Detail</a>
        <span class="mx-1 opacity-30">|</span>
        <a data-act="edit" class="text-slate-700 hover:underline">Upravit</a>
      </td>
    </tr>
  `).join('');

  // dblclick -> detail
  tbody.addEventListener('dblclick', (ev) => {
    const tr = ev.target.closest('tr[data-id]');
    if (!tr) return;
    navigateTo(`#/m/010-uzivatele/f/read?id=${tr.dataset.id}`);
  });
  // row action links
  tbody.addEventListener('click', (ev) => {
    const a = ev.target.closest('a[data-act]');
    if (!a) return;
    const tr = ev.target.closest('tr[data-id]');
    const id = tr?.dataset.id;
    if (!id) return;
    if (a.dataset.act === 'detail') navigateTo(`#/m/010-uzivatele/f/read?id=${id}`);
    if (a.dataset.act === 'edit')   navigateTo(`#/m/010-uzivatele/f/edit?id=${id}`);
  });

  root.querySelector('#btn-q')?.addEventListener('click', () => {
    const val = root.querySelector('#q').value.trim();
    navigateTo(val ? `#/m/010-uzivatele/t/seznam?q=${encodeURIComponent(val)}` : '#/m/010-uzivatele/t/seznam');
  });
  root.querySelector('#q')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') root.querySelector('#btn-q').click();
  });
}

function openInviteDialog() {
  const email = prompt('Zadejte e‑mail uživatele pro pozvánku:');
  if (!email) return;
  navigateTo(`#/m/010-uzivatele/f/create?email=${encodeURIComponent(email)}`);
}
