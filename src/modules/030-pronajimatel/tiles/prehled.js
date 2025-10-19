import { renderTable } from '/src/ui/table.js';
import { listSubjects } from '/src/db/subjects.js';
import { formatDate } from '/src/app/utils.js';

function escapeHtml(s='') {
  return (''+s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

export async function render(root) {
  root.innerHTML = '<h2>Všechni subjekty</h2>';
  const profileId = (window.currentUser && window.currentUser.id) || null;
  const { data, error } = await listSubjects({ profileId, limit: 500 });
  if (error) {
    root.innerHTML += `<div class="error">Chyba: ${error.message || JSON.stringify(error)}</div>`;
    return;
  }
  const columns = [
    { key: 'id', label: 'ID' },
    {
      key: 'display_name', label: 'Název / Jméno', render: (r) => {
        const name = escapeHtml(r.display_name || '—');
        // odkaz na edit form ve stejném modulu 030 (pokud chceš jiný modul, upravíme)
        return `<a href="#/m/030-pronajimatel/f/form?type=${encodeURIComponent(r.typ_subjektu||'osoba')}&id=${encodeURIComponent(r.id)}">${name}</a>`;
      }
    },
    { key: 'typ_subjektu', label: 'Typ' },
    { key: 'ico', label: 'IČO' },
    { key: 'primary_phone', label: 'Telefon' },
    { key: 'primary_email', label: 'Email' },
    { key: 'city', label: 'Město' },
    { key: 'created_at', label: 'Vytvořeno', render: r => r.created_at ? formatDate(r.created_at) : '' }
  ];
  renderTable(root, { columns, rows: data || [] });
}
