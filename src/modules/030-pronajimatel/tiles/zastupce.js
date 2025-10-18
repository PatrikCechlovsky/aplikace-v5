import { renderTable } from '/src/ui/table.js';
import { listSubjects } from '/src/db/subjects.js';

export async function render(root) {
  root.innerHTML = '<h2>Zástupci</h2>';
  const profileId = (window.currentUser && window.currentUser.id) || null;
  const { data, error } = await listSubjects({ type: 'zastupce', profileId, limit: 500 });
  if (error) {
    root.innerHTML += `<div class="error">Chyba: ${error.message || error}</div>`;
    return;
  }
  const columns = [
    { key: 'display_name', label: 'Jméno zástupce' },
    { key: 'primary_email', label: 'Email' },
    { key: 'zastupuje_id', label: 'Zastupuje (ID)' }
  ];
  renderTable(root, { columns, rows: data || [] });
}
