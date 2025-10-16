// Zobrazí historii změn vybraného uživatele

import { supabase } from '../../../db.js'; // nebo cesta podle tvého projektu

// Přehled českých názvů polí z formuláře
const FIELD_LABELS = {
  first_name: 'Jméno',
  last_name: 'Příjmení',
  display_name: 'Uživatelské jméno',
  email: 'E-mail',
  phone: 'Telefon',
  street: 'Ulice',
  house_number: 'Číslo popisné',
  city: 'Město',
  zip: 'PSČ',
  role: 'Role',
  active: 'Aktivní',
  birth_number: 'Rodné číslo',
  note: 'Poznámka',
  last_login: 'Poslední přihlášení',
  updated_at: 'Poslední úprava',
  updated_by: 'Upravil',
  created_at: 'Vytvořen'
};

export async function showHistoryModal(profileId) {
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

  let html = `
    <h2 style="margin-bottom:1em;">Historie změn</h2>
    <table style="width:100%;border-collapse:collapse;">
      <thead>
        <tr>
          <th style="text-align:left;">Pole</th>
          <th style="text-align:left;">Původní hodnota</th>
          <th style="text-align:left;">Nová hodnota</th>
          <th style="text-align:left;">Změnil</th>
          <th style="text-align:left;">Kdy</th>
        </tr>
      </thead>
      <tbody>
        ${data.map(row => `
          <tr>
            <td>${FIELD_LABELS[row.field] || row.field}</td>
            <td>${row.old_value ?? '-'}</td>
            <td>${row.new_value ?? '-'}</td>
            <td>${row.changed_by ?? '-'}</td>
            <td>${new Date(row.changed_at).toLocaleString('cs-CZ')}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  // Modal s křížkem vpravo nahoře
  let modal = document.createElement('div');
  modal.id = 'history-modal';
  modal.style.position = 'fixed';
  modal.style.left = '0'; modal.style.top = '0';
  modal.style.width = '100vw'; modal.style.height = '100vh';
  modal.style.background = 'rgba(0,0,0,0.6)';
  modal.style.zIndex = '1000';
  modal.style.display = 'flex'; modal.style.justifyContent = 'center'; modal.style.alignItems = 'center';
  modal.innerHTML = `
    <div style="background:#fff;max-width:900px;width:95vw;max-height:90vh;overflow:auto;padding:2em;border-radius:12px;position:relative;">
      <button onclick="document.getElementById('history-modal').remove()" 
        style="position:absolute;top:12px;right:16px;font-size:26px;background:none;border:none;cursor:pointer;" 
        title="Zavřít">&times;</button>
      ${html}
    </div>
  `;
  document.body.appendChild(modal);
}
