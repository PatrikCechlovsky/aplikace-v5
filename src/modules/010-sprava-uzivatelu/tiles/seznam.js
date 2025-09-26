// Uživatelé – Seznam (řazení, filtr, dblclick → detail; žádný sloupec Akce)
import { renderCommonActions } from '../../../ui/commonActions.js';
import { renderTable } from '../../../ui/table.js';

const rows = [
  { id: 1, name: 'Alena Procházková', email: 'alena.proch@example.cz', role: 'guest', city: 'Plzeň'  },
  { id: 2, name: 'Jan Novák',         email: 'jan.novak@example.cz',   role: 'admin', city: 'Praha'  },
  { id: 3, name: 'Marie Svobodová',   email: 'marie.svobodova@example.cz', role: 'user', city: 'Brno' },
  { id: 4, name: 'Petr Dvořák',       email: 'petr.dvorak@example.cz', role: 'user',  city: 'Ostrava' },
];

const roleBadge = (role) => {
  const map = {
    admin: 'bg-red-600/10 text-red-700 border-red-600/20',
    user:  'bg-emerald-600/10 text-emerald-700 border-emerald-600/20',
    guest: 'bg-slate-600/10 text-slate-700 border-slate-600/20',
  };
  const cls = map[role] || 'bg-slate-600/10 text-slate-700 border-slate-600/20';
  return `<span class="inline-block px-2 py-0.5 border rounded-full text-xs ${cls}">${role}</span>`;
};

export default async function renderUsersList(root) {
  // Tři tlačítka vpravo na řádku s breadcrumbs (jak chceš)
  renderCommonActions(document.getElementById('crumb-actions'), {
    onAdd:    () => alert('Přidat uživatele (form create)'),
    onEdit:   () => alert('Hromadná úprava'),
    onArchive:() => alert('Archivace'),
  });

  const columns = [
    { key: 'name',  label: 'Jméno',  width: '22rem' },
    { key: 'email', label: 'Email',  width: '22rem' },
    { key: 'role',  label: 'Role',   width: '8rem', render: r => roleBadge(r.role), sortable: true, className: 'whitespace-nowrap' },
    { key: 'city',  label: 'Město',  width: '12rem' },
  ];

  // ŽÁDNÉ per-row akce → prázdné pole
  const rowActions = [];

  const columnsOrder = ['name','email','role','city'];

  renderTable(root, {
    columns,
    rows,
    rowActions,
    options: {
      filterPlaceholder: 'Filtrovat uživatele…',
      columnsOrder,
      onRowDblClick: async (r) => {
        const { default: readForm } = await import('../forms/read.js');
        readForm(root, r); // dvojklik → čtecí formulář
      }
    }
  });
}
