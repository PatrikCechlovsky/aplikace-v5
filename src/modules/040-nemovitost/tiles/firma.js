import { renderTable } from '/src/ui/table.js';
import { listSubjects } from '/src/db/subjects.js';
import { setBreadcrumb } from '/src/ui/breadcrumb.js';

export async function render(root) {
  try {
    setBreadcrumb(document.getElementById('crumb'), [
      { icon: 'home', label: 'Domů', href: '#/' },
      { icon: 'building', label: 'Nemovitosti', href: '#/m/040-nemovitost' },
      { icon: 'briefcase', label: 'Firma' }
    ]);
  } catch (e) {}
  
  root.innerHTML = '<div class="p-4 bg-white rounded-2xl shadow"><h2 class="text-xl font-semibold mb-4">Firmy</h2><div id="table-content"></div></div>';
  const { data, error } = await listSubjects({ type: 'firma', limit: 500 });
  if (error) {
    root.querySelector('#table-content').innerHTML = `<div class="text-red-600">Chyba: ${error.message || error}</div>`;
    return;
  }
  const columns = [
    { key: 'display_name', label: 'Firma' },
    { key: 'ico', label: 'IČO' },
    { key: 'primary_email', label: 'Email' },
    { key: 'primary_phone', label: 'Telefon' },
    { key: 'city', label: 'Město' }
  ];
  renderTable(root.querySelector('#table-content'), { columns, rows: data || [] });
}

export default { render };

