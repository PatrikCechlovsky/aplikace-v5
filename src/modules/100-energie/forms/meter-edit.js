import { setBreadcrumb } from '/src/ui/breadcrumb.js';
export default async function render(root, params) {
  setBreadcrumb(document.getElementById('crumb'), [
    { icon: 'home', label: 'Domů', href: '#/' },
    { icon: 'bolt', label: 'Energie', href: '#/m/100-energie' },
    { icon: 'edit', label: 'Editace měřidla' }
  ]);
  root.innerHTML = `<div class="p-6"><h2 class="text-2xl font-bold">Editace měřidla</h2><p>Formulář bude implementován.</p></div>`;
}
