import { renderTable } from '/src/ui/table.js';
import { listSubjects } from '/src/db/subjects.js';

export async function render(root) {
  root.innerHTML = '<h2>Spolky / Skupiny</h2>';
  const profileId = (window.currentUser && window.currentUser.id) || null;
  const { data, error } = await listSubjects({ type: 'spolek', profileId, limit: 500 });
  if (error) {
    root.innerHTML += `<div class="error">Chyba: ${error.message || error}</div>`;
    return;
  }
  const columns = [
    { key: 'display_name', label: 'Název' },
    { key: 'primary_email', label: 'Email' },
    { key: 'city', label: 'Město' }
  ];
  renderTable(root, { columns, rows: data || [] });
}
