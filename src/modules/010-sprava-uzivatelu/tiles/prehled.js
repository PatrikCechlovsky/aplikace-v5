import { icon } from '../../../ui/icons.js';
import { renderActions, ACTIONS } from '../../../ui/actionButtons.js';
import { listProfiles } from '../../../db.js';

// helper badge pro roli
const roleBadge = (role) => {
  const cls =
    role === 'admin' ? 'bg-amber-100 text-amber-800 border-amber-200' :
    'bg-emerald-100 text-emerald-800 border-emerald-200';
  return `<span class="inline-block text-xs px-2 py-0.5 rounded border ${cls}">${role||'user'}</span>`;
};

export default async function renderUsersOverview(root, { qName='', qEmail='', qRole='' } = {}) {
  // actions vpravo
  const head = document.getElementById('crumb-actions');
  if (head) {
    head.innerHTML = '';
    renderActions(head, [
      ACTIONS.add({ onClick: () => navigateTo('#/m/010-uzivatele/f/create'), label:'Nový' }),
      { key:'invite', label:'Pozvat e-mailem', icon:'mail', onClick: () => {
        const email = prompt('E-mail pro pozvánku:'); if (!email) return;
        navigateTo(`#/m/010-uzivatele/f/create?email=${encodeURIComponent(email)}`);
      }},
      ACTIONS.refresh({ onClick: () => route() })
    ]);
  }

  // načti data (zatím bez serverových filtrů – filtrovat budeme klientsky)
  const { data, error } = await listProfiles();
  if (error) {
    root.innerHTML = `<div class="p-4 text-red-600">Chyba: ${error.message}</div>`;
    return;
  }

  // klientské filtry
  const rows = (data||[]).filter(r =>
    (qName  ? (r.display_name||'').toLowerCase().includes(qName.toLowerCase())   : true) &&
    (qEmail ? (r.email||'').toLowerCase().includes(qEmail.toLowerCase())         : true) &&
    (qRole  ? (r.role||'').toLowerCase().includes(qRole.toLowerCase())           : true)
  );

  root.innerHTML = `
    <div class="p-4 bg-white rounded-2xl border">
      <div class="flex items-center gap-2 mb-3 text-sm text-slate-500">
        <span>${icon('home')} Uživatelé</span>
        <span class="mx-1">›</span>
        <span class="opacity-70">${icon('list')} Přehled</span>
      </div>

      <div class="overflow-auto">
        <table class="min-w-full text-sm">
          <thead class="border-b bg-slate-50">
            <tr>
              <th class="text-left p-2 w-10">ID</th>
              <th class="text-left p-2">Jméno</th>
              <th class="text-left p-2">E-mail</th>
              <th class="text-left p-2">Role</th>
              <th class="text-right p-2">Akce</th>
            </tr>
            <tr class="border-b text-xs bg-slate-50/60">
              <th class="p-1"></th>
              <th class="p-1"><input id="f-name"  class="w-full border rounded p-1" placeholder="Filtr jméno"  value="${qName}"  /></th>
              <th class="p-1"><input id="f-email" class="w-full border rounded p-1" placeholder="Filtr e-mail" value="${qEmail}" /></th>
              <th class="p-1"><input id="f-role"  class="w-full border rounded p-1" placeholder="Filtr role"   value="${qRole}"  /></th>
              <th class="p-1 text-right">
                <button id="btn-clear" class="px-2 py-1 border rounded bg-white">${icon('close')} Zrušit filtry</button>
              </th>
            </tr>
          </thead>
          <tbody id="rows"></tbody>
        </table>
      </div>
      ${rows.length ? '' : `<div class="p-4 text-slate-500 text-sm">Žádná data (zkontroluj RLS / vlož test uživatele).</div>`}
    </div>
  `;

  const tbody = root.querySelector('#rows');
  tbody.innerHTML = rows.map((r, i) => `
    <tr data-id="${r.id}" class="border-b hover:bg-slate-50 cursor-pointer">
      <td class="p-2">${i+1}</td>
      <td class="p-2">${r.display_name || '—'}</td>
      <td class="p-2">${r.email || '—'}</td>
      <td class="p-2">${roleBadge(r.role)}</td>
      <td class="p-2 text-right">
        <button data-act="detail" class="inline-flex items-center gap-1 px-2 py-1 border rounded bg-white">${icon('detail')} Zobrazit</button>
        <button data-act="edit"   class="inline-flex items-center gap-1 ml-1 px-2 py-1 border rounded bg-white">${icon('edit')} Upravit</button>
        <button data-act="archive"class="inline-flex items-center gap-1 ml-1 px-2 py-1 border rounded bg-white">${icon('archive')} Archivovat</button>
        <button data-act="attach" class="inline-flex items-center gap-1 ml-1 px-2 py-1 border rounded bg-white">${icon('paperclip')} Přidat dokument</button>
      </td>
    </tr>
  `).join('');

  // chování jako dvojklik na řádek
  tbody.addEventListener('dblclick', (ev) => {
    const tr = ev.target.closest('tr[data-id]'); if (!tr) return;
    navigateTo(`#/m/010-uzivatele/f/read?id=${tr.dataset.id}`);
  });
  // tlačítka řádků (jen routují; samotné operace řeší formy)
  tbody.addEventListener('click', (ev) => {
    const btn = ev.target.closest('button[data-act]'); if (!btn) return;
    const tr = ev.target.closest('tr[data-id]'); const id = tr?.dataset.id; if (!id) return;
    if (btn.dataset.act==='detail') navigateTo(`#/m/010-uzivatele/f/read?id=${id}`);
    if (btn.dataset.act==='edit')   navigateTo(`#/m/010-uzivatele/f/edit?id=${id}`);
    if (btn.dataset.act==='archive') navigateTo(`#/m/010-uzivatele/f/read?id=${id}`); // vlastní archiv je v detailu
    if (btn.dataset.act==='attach')  navigateTo(`#/m/010-uzivatele/f/read?id=${id}`); // sponka je v detailu
  });

  // filtry
  const goFilter = () => {
    const name  = root.querySelector('#f-name').value.trim();
    const email = root.querySelector('#f-email').value.trim();
    const role  = root.querySelector('#f-role').value.trim();
    navigateTo(`#/m/010-uzivatele/t/prehled?qName=${encodeURIComponent(name)}&qEmail=${encodeURIComponent(email)}&qRole=${encodeURIComponent(role)}`);
  };
  root.querySelector('#f-name') .addEventListener('keydown', e=>{ if(e.key==='Enter') goFilter(); });
  root.querySelector('#f-email').addEventListener('keydown', e=>{ if(e.key==='Enter') goFilter(); });
  root.querySelector('#f-role') .addEventListener('keydown', e=>{ if(e.key==='Enter') goFilter(); });
  root.querySelector('#btn-clear').addEventListener('click', ()=> navigateTo('#/m/010-uzivatele/t/prehled'));
}
