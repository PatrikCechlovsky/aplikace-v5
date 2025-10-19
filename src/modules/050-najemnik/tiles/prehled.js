import { renderTable } from '/src/ui/table.js';
import { listSubjects } from '/src/db/subjects.js';
import { formatDate } from '/src/app/utils.js';

export async function render(root) {
  root.innerHTML = '<h2>Všichni nájemníci</h2>';
  const profileId = (window.currentUser && window.currentUser.id) || null;
  // POZOR: odstraněn role filter -> ukáže všechny subjekty přiřazené k profilu (osoba, firma, ...)
  const { data, error } = await listSubjects({ profileId, limit: 500 });
  if (error) {
    root.innerHTML += `<div class="error">Chyba: ${error.message || JSON.stringify(error)}</div>`;
    return;
  }
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'display_name', label: 'Název / Jméno' },
    { key: 'typ_subjektu', label: 'Typ' },
    { key: 'primary_email', label: 'Email' },
    { key: 'primary_phone', label: 'Telefon' },
    { key: 'city', label: 'Město' },
    { key: 'created_at', label: 'Vytvořeno', render: r => r.created_at ? formatDate(r.created_at) : '' }
  ];
  renderTable(root, { columns, rows: data || [] });
}
