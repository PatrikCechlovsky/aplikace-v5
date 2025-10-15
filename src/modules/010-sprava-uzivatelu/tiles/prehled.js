import { renderTable } from '../../../ui/table.js';
import { renderCommonActions } from '../../../ui/commonActions.js';
import { listProfiles, listRoles, archiveProfile } from '../../../db.js';
import { setBreadcrumb } from '../../../ui/breadcrumb.js';
import { navigateTo, route } from '../../../app.js';

// Zde stub, oprav dle své business logiky!
async function hasActiveVazby(userId) {
  // TODO: napojit na kontrolu vazeb (např. dotaz na aktivní smlouvy/budovy usera)
  // return true pokud existují; false pokud neexistují
  return false;
}

let selectedRow = null;
let showArchived = false;

export async function render(root) {
  setBreadcrumb(document.getElementById('crumb'), [
    { icon: 'home',  label: 'Domů',      href: '#/' },
    { icon: 'users', label: 'Uživatelé', href: '#/m/010-sprava-uzivatelu' },
    { icon: 'list',  label: 'Přehled' }
  ]);

  root.innerHTML = `
    <div class="mb-2 flex items-center gap-3">
      <label class="flex items-center gap-1 text-sm cursor-pointer">
        <input type="checkbox" id="toggle-archived" ${showArchived ? 'checked' : ''}/>
        Zobrazit archivované
      </label>
    </div>
    <div id="user-table"></div>
  `;

  // Načtení uživatelů podle filtru
  const { data: users, error } = await listProfiles();
  if (error) {
    root.querySelector('#user-table').innerHTML = `<div class="p-4 text-red-600">Chyba při načítání: ${error.message}</div>`;
    return;
  }

  // Načti role z DB (včetně barvy)
  const { data: roles = [] } = await listRoles();
  const roleMap = Object.fromEntries(roles.map(r => [r.slug, r]));

  // Filtrovaná data podle archivace
  const rows = (users || [])
    .filter(r => showArchived ? true : !r.archived)
    .map(r => ({
      id: r.id,
      display_name: r.display_name,
      email: r.email,
      role: r.role,
      archived: r.archived ? 'Ano' : ''
    }));

  // Sloupce tabulky včetně barevné role a tlačítka Archivovat
  const columns = [
    {
      key: 'role',
      label: 'Role',
      width: '15%',
      sortable: true,
      render: (row) => {
        const role = roleMap[row.role];
        if (!role) return `<span>${row.role}</span>`;
        return `<span style="
          background:${role.color};
          color:#222;
          padding:2px 12px;
          border-radius:14px;
          font-size:0.97em;
          font-weight:600;
          display:inline-block;
          min-width:60px;
          text-align:center;
          box-shadow:0 1px 3px 0 #0001;
          letter-spacing:0.01em;
        ">${role.label}</span>`;
      }
    },
    { key: 'display_name', label: 'Jméno', sortable: true, width: '25%' },
    { key: 'email',        label: 'E-mail', sortable: true, width: '25%' },
    { key: 'archived',     label: 'Archivován', sortable: true, width: '10%' },
    {
      key: 'actions',
      label: 'Akce',
      width: '13%',
      render: (row) => {
        if (row.archived === 'Ano') return '';
        return `<button class="btn-archive px-2 py-1 rounded border text-xs text-amber-900 bg-amber-100 hover:bg-amber-200" data-id="${row.id}">Archivovat</button>`;
      }
    }
  ];

  // Akce dynamicky podle výběru
  function drawActions() {
    const ca = document.getElementById('commonactions');
    if (!ca) return;
    const hasSel = !!selectedRow;
    renderCommonActions(ca, {
      onAdd:       () => navigateTo('#/m/010-sprava-uzivatelu/f/create'),
      ...(hasSel && {
        onEdit:    () => navigateTo(`#/m/010-sprava-uzivatelu/f/form?id=${selectedRow.id}&mode=edit`),
        onArchive: () => alert(`Archivace uživatele: ${selectedRow.display_name}`),
        onAttach:  () => alert(`Přílohy k uživateli: ${selectedRow.display_name}`),
      }),
      onRefresh:   () => route()
    });
  }
  drawActions();

  renderTable(root.querySelector('#user-table'), {
    columns,
    rows,
    options: {
      moduleId: '010-sprava-uzivatelu',
      onRowSelect: row => {
        selectedRow = (selectedRow && selectedRow.id === row.id) ? null : row;
        drawActions();
      },
      onRowDblClick: row => {
        selectedRow = row;
        navigateTo(`#/m/010-sprava-uzivatelu/f/form?id=${row.id}&mode=edit`);
      }
    }
  });

  // Přepínač zobrazit archivované
  root.querySelector('#toggle-archived').onchange = (e) => {
    showArchived = e.target.checked;
    render(root);
  };

  // Delegovaný handler pro tlačítka Archivovat
  root.querySelector('#user-table').addEventListener('click', async (e) => {
    const btn = e.target.closest('.btn-archive');
    if (!btn) return;
    const id = btn.dataset.id;
    // Ověření vazeb (napoj na své skutečné pravidlo)
    const hasVazby = await hasActiveVazby(id);
    if (hasVazby) {
      alert('Nelze archivovat, existují aktivní vazby!');
      return;
    }
    await archiveProfile(id);
    render(root);
  });
}

export default { render };
