// Přehled uživatelů — univerzální tabulka + dynamické CommonActions podle výběru řádku
import { renderTable } from '../../../ui/table.js';
import { renderCommonActions } from '../../../ui/commonActions.js';
import { listProfiles, listRoles } from '../../../db.js';
import { setBreadcrumb } from '../../../ui/breadcrumb.js';
import { navigateTo, route } from '../../../app.js';

// aktuálně vybraný řádek (kvůli Edit/Archiv/Přílohy)
let selectedRow = null;

export async function render(root) {
  // Breadcrumbs
  setBreadcrumb(document.getElementById('crumb'), [
    { icon: 'home',  label: 'Domů',      href: '#/' },
    { icon: 'users', label: 'Uživatelé', href: '#/m/010-sprava-uzivatelu' },
    { icon: 'list',  label: 'Přehled' }
  ]);

  // Načti seznam uživatelů
  const { data: users, error } = await listProfiles();
  if (error) {
    root.innerHTML = `<div class="p-4 text-red-600">Chyba při načítání: ${error.message}</div>`;
    return;
  }

  // Načti role z DB (včetně barvy)
  const { data: roles = [] } = await listRoles();

  // Mapování pro rychlý lookup podle slug
  const roleMap = Object.fromEntries(roles.map(r => [r.slug, r]));

  // Připrav data pro tabulku
  const rows = (users || []).map(r => ({
    id: r.id,
    display_name: r.display_name,
    email: r.email,
    role: r.role,
    archived: r.archived ? 'Ano' : ''
  }));

  // Sloupce tabulky: Role (barevný badge, první), Jméno, E-mail, Archivován
  const columns = [
    {
      key: 'role',
      label: 'Role',
      width: '15%',
      sortable: true,
      render: (row) => {
        const role = roleMap[row.role];
        if (!role) return `<span>${row.role}</span>`;
        // Lepší badge: barevné podbarvení, tmavý text, zaoblení, decentní font
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
    { key: 'archived',     label: 'Archivován', sortable: true, width: '10%' }
  ];

  // Helper pro akční tlačítka – dynamicky podle toho, zda je něco vybráno
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

  // Init actions (bez výběru)
  drawActions();

  // Tabulka
  root.innerHTML = `<div id="user-table"></div>`;
  renderTable(root.querySelector('#user-table'), {
    columns,
    rows,
    options: {
      moduleId: '010-sprava-uzivatelu',
      // klik = vybere/odznačí a překreslí akce
      onRowSelect: row => {
        selectedRow = (selectedRow && selectedRow.id === row.id) ? null : row;
        drawActions();
      },
      // dvojklik = otevři edit formulář
      onRowDblClick: row => {
        selectedRow = row;
        navigateTo(`#/m/010-sprava-uzivatelu/f/form?id=${row.id}&mode=edit`);
      }
    }
  });
}

export default { render };
