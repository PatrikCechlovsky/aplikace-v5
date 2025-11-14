import { setBreadcrumb } from '/src/ui/breadcrumb.js';
export default async function render(root, params) {
  setBreadcrumb(document.getElementById('crumb'), [
    { icon: 'home', label: 'Domů', href: '#/' },
    { icon: 'description', label: 'Dokumenty', href: '#/m/120-dokumenty' },
    { icon: 'visibility', label: 'Detail šablony' }
  ]);
  root.innerHTML = `<div class="p-6"><h2 class="text-2xl font-bold">Detail šablony</h2><p>Formulář bude implementován.</p></div>`;
}
