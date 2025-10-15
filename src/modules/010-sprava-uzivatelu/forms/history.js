// history.js
// Zobrazí historii změn vybraného uživatele

import { supabase } from '../db.js'; // nebo cesta podle tvého projektu

export async function showHistoryModal(profileId) {
  // Načti historii změn z DB
  const { data, error } = await supabase
    .from('profiles_history')
    .select('*')
    .eq('profile_id', profileId)
    .order('changed_at', { ascending: false });

  if (error) {
    alert("Chyba při načítání historie: " + error.message);
    return;
  }
  if (!Array.isArray(data) || data.length === 0) {
    alert("Žádná historie změn zatím neexistuje.");
    return;
  }

  // Vytvoř HTML tabulku
  let html = `
    <h2>Historie změn</h2>
    <table style="width:100%;border-collapse:collapse;">
      <thead>
        <tr>
          <th>Pole</th>
          <th>Původní hodnota</th>
          <th>Nová hodnota</th>
          <th>Změnil</th>
          <th>Kdy</th>
        </tr>
      </thead>
      <tbody>
        ${data.map(row => `
          <tr>
            <td>${row.field}</td>
            <td>${row.old_value ?? '-'}</td>
            <td>${row.new_value ?? '-'}</td>
            <td>${row.changed_by ?? '-'}</td>
            <td>${new Date(row.changed_at).toLocaleString('cs-CZ')}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <button onclick="document.getElementById('history-modal').remove()">Zavřít</button>
  `;

  // Vlož modální okno do DOM
  let modal = document.createElement('div');
  modal.id = 'history-modal';
  modal.style.position = 'fixed';
  modal.style.left = '0'; modal.style.top = '0';
  modal.style.width = '100vw'; modal.style.height = '100vh';
  modal.style.background = 'rgba(0,0,0,0.6)';
  modal.style.zIndex = '1000';
  modal.style.display = 'flex'; modal.style.justifyContent = 'center'; modal.style.alignItems = 'center';
  modal.innerHTML = `<div style="background:#fff;max-width:900px;width:95vw;max-height:90vh;overflow:auto;padding:2em;border-radius:7px;">${html}</div>`;
  document.body.appendChild(modal);
}
