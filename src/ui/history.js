// Generic history modal helper (subjects / profiles / entities)
// Usage: import { showHistoryModal } from '/src/ui/history.js'; then call showHistoryModal(getHistoryFn, id)
// getHistoryFn should accept id and return { data, error } where data is array of history rows
export function renderHistoryTable(rows, fieldLabels = {}) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return `<div class="p-4">Žádná historie změn zatím neexistuje.</div>`;
  }
  const html = `
    <h2 style="margin-bottom:1em;">Historie změn</h2>
    <table style="width:100%;border-collapse:collapse;">
      <thead>
        <tr>
          <th style="text-align:left;padding:6px;border-bottom:1px solid #eee;">Pole</th>
          <th style="text-align:left;padding:6px;border-bottom:1px solid #eee;">Původní hodnota</th>
          <th style="text-align:left;padding:6px;border-bottom:1px solid #eee;">Nová hodnota</th>
          <th style="text-align:left;padding:6px;border-bottom:1px solid #eee;">Upravil</th>
          <th style="text-align:left;padding:6px;border-bottom:1px solid #eee;">Kdy</th>
        </tr>
      </thead>
      <tbody>
        ${rows.map(row => `
          <tr>
            <td style="padding:6px;border-bottom:1px solid #fafafa;">${fieldLabels[row.field] || row.field}</td>
            <td style="padding:6px;border-bottom:1px solid #fafafa;">${row.old_value ?? '-'}</td>
            <td style="padding:6px;border-bottom:1px solid #fafafa;">${row.new_value ?? '-'}</td>
            <td style="padding:6px;border-bottom:1px solid #fafafa;">${row.changed_by ?? '-'}</td>
            <td style="padding:6px;border-bottom:1px solid #fafafa;">${new Date(row.changed_at).toLocaleString('cs-CZ')}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  return html;
}

export async function showHistoryModal(getHistoryFn, id, fieldLabels = {}) {
  if (!getHistoryFn || !id) {
    alert('Chybí parametry pro zobrazení historie.');
    return;
  }
  const { data, error } = await getHistoryFn(id);
  if (error) {
    alert('Chyba při načítání historie: ' + (error.message || JSON.stringify(error)));
    return;
  }
  const rows = data || [];
  const content = renderHistoryTable(rows, fieldLabels);

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
      <button id="history-close" 
        style="position:absolute;top:12px;right:16px;font-size:26px;background:none;border:none;cursor:pointer;" 
        title="Zavřít">&times;</button>
      ${content}
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById('history-close').addEventListener('click', () => modal.remove());
}
