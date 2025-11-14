// src/modules/090-finance/tiles/dashboard.js
// Dashboard s widgety pro finanční přehledy

import { setBreadcrumb } from '/src/ui/breadcrumb.js';
import { renderCommonActions } from '/src/ui/commonActions.js';

export default async function render(root) {
  try {
    setBreadcrumb(document.getElementById('crumb'), [
      { icon: 'home', label: 'Domů', href: '#/' },
      { icon: 'account_balance', label: 'Finance', href: '#/m/090-finance' },
      { icon: 'dashboard', label: 'Přehledy' }
    ]);
  } catch (e) { /* ignore */ }

  root.innerHTML = `
    <div class="p-6 bg-white rounded-lg shadow">
      <h2 class="text-2xl font-bold mb-6 text-slate-800">Finanční přehledy</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Nájem vs Náklady -->
        <div class="p-4 border border-slate-200 rounded-lg">
          <h3 class="font-semibold mb-3 text-lg">📊 Nájem vs Náklady</h3>
          <div class="h-64 flex items-center justify-center bg-slate-50 rounded">
            <p class="text-slate-500">Graf bude implementován</p>
          </div>
        </div>
        
        <!-- Cashflow měsíční -->
        <div class="p-4 border border-slate-200 rounded-lg">
          <h3 class="font-semibold mb-3 text-lg">📈 Cashflow měsíční</h3>
          <div class="h-64 flex items-center justify-center bg-slate-50 rounded">
            <p class="text-slate-500">Graf bude implementován</p>
          </div>
        </div>
        
        <!-- Dlužníci -->
        <div class="p-4 border border-slate-200 rounded-lg">
          <h3 class="font-semibold mb-3 text-lg">⚠️ Dlužníci</h3>
          <div class="h-64 flex items-center justify-center bg-slate-50 rounded">
            <p class="text-slate-500">Tabulka dlužníků bude implementována</p>
          </div>
        </div>
        
        <!-- Obsazenost -->
        <div class="p-4 border border-slate-200 rounded-lg">
          <h3 class="font-semibold mb-3 text-lg">🏠 Obsazenost</h3>
          <div class="h-64 flex items-center justify-center bg-slate-50 rounded text-center">
            <div>
              <div class="text-4xl font-bold text-green-600">---%</div>
              <p class="text-slate-500 mt-2">Obsazenost jednotek</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  try {
    renderCommonActions(document.getElementById('commonactions'), [
      {
        label: 'Obnovit',
        icon: 'refresh',
        onClick: () => location.reload()
      }
    ]);
  } catch (e) { /* ignore */ }
}
