import { renderTable } from '/src/ui/table.js';
import { listSubjects } from '/src/db/subjects.js';

export async function render(root) {
  root.innerHTML = '<h2>Pronajímatelé — Seznam</h2>';
  const profileId = (window.currentUser && window.currentUser.id) || null;
  const { data, error } = await listSubjects({ role: 'pronajimatel', profileId, limit: 500 });
  if (error) {
    root.innerHTML += `<div class="error">Chyba: ${error.message || error}</div>`;
    return;
  }
  const columns = [
    { key: 'display_name', label: 'Název/Jméno' },
    { key: 'typ_subjektu', label: 'Typ' },
    { key: 'primary_email', label: 'Email' },
    { key: 'primary_phone', label: 'Telefon' },
    { key: 'city', label: 'Město' }
  ];
  renderTable(root, { columns, rows: data || [] });
}
