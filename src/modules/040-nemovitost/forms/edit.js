import { setBreadcrumb } from '/src/ui/breadcrumb.js';
import { renderCommonActions } from '/src/ui/commonActions.js';
import { navigateTo } from '/src/app.js';

export async function render(root, params) {
  const { id } = params || {};
  
  try {
    setBreadcrumb(document.getElementById('crumb'), [
      { icon: 'home', label: 'Domů', href: '#/' },
      { icon: 'building', label: 'Nemovitosti', href: '#/m/040-nemovitost' },
      { icon: 'edit', label: id ? 'Úprava nemovitosti' : 'Nová nemovitost' }
    ]);
  } catch (e) {}

  root.innerHTML = `
    <div id="commonactions" class="mb-4"></div>
    <div class="p-4 bg-white rounded-2xl shadow">
      <h2 class="text-xl font-semibold mb-4">${id ? 'Úprava nemovitosti' : 'Nová nemovitost'}</h2>
      <p class="text-slate-600 mb-4">Formulář pro ${id ? 'úpravu' : 'vytvoření'} nemovitosti.</p>
      <p class="text-sm text-slate-500">Modul nemovitostí je připraven k implementaci. Prozatím není možné vytvářet ani upravovat nemovitosti.</p>
      <div class="mt-4">
        <button onclick="location.hash='#/m/040-nemovitost/t/prehled'" class="px-4 py-2 bg-slate-200 text-slate-900 rounded">
          Zpět na přehled
        </button>
      </div>
    </div>
  `;

  // Common actions
  const ca = document.getElementById('commonactions');
  if (ca) {
    const userRole = window.currentUserRole || 'admin';
    renderCommonActions(ca, {
      moduleActions: ['save'],
      userRole,
      handlers: {
        onSave: () => {
          alert('Modul nemovitostí je připraven k implementaci.');
        }
      }
    });
  }
}

export default { render };
