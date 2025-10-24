// Minimalní placeholder pro stránku "Jednotky", aby se dynamický import neskončil chybou
import { setBreadcrumb } from '/src/ui/breadcrumb.js';
export async function render(root, params = {}) {
  try {
    setBreadcrumb(document.getElementById('crumb'), [
      { icon: 'home', label: 'Domů', href: '#/' },
      { icon: 'building', label: 'Nemovitosti', href: '#/m/040-nemovitost' },
      { icon: 'grid', label: 'Jednotky' }
    ]);
  } catch (e) {}
  root.innerHTML = `<div class="p-4 text-slate-700">Zde bude seznam jednotek. (Dočasný placeholder)</div>`;
}
export default { render };
