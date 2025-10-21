import { renderTable } from '/src/ui/table.js';
import { listSubjects } from '/src/db/subjects.js';
import { setBreadcrumb } from '/src/ui/breadcrumb.js';

export async function render(root) {
  try {
    setBreadcrumb(document.getElementById('crumb'), [
      { icon: 'home', label: 'Domů', href: '#/' },
      { icon: 'building', label: 'Nemovitosti', href: '#/m/040-nemovitost' },
      { icon: 'bank', label: 'Státní organizace' }
    ]);
  } catch (e) {}
  
  root.innerHTML = '<div class="p-4 bg-white rounded-2xl shadow"><h2 class="text-xl font-semibold mb-4">Státní organizace</h2><div id="table-content"></div></div>';
  const { data, error } = await listSubjects({ type: 'stat', limit: 500 });
  if (error) {
    root.querySelector('#table-content').innerHTML = `<div class="text-red-600">Chyba: ${error.message || error}</div>`;
    return;
  }
  const columns = [
    { key: 'display_name', label: 'Organizace' },
    { key: 'ico', label: 'IČO' },
    { key: 'primary_email', label: 'Email' }
  ];
  renderTable(root.querySelector('#table-content'), { columns, rows: data || [] });
}

export default { render };

