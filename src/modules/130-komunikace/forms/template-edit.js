import { setBreadcrumb } from '/src/ui/breadcrumb.js';
export default async function render(root, params) {
  setBreadcrumb(document.getElementById('crumb'), [
    { icon: 'home', label: 'Domů', href: '#/' },
    { icon: 'email', label: 'Komunikace', href: '#/m/130-komunikace' },
    { icon: 'edit', label: 'Editace šablony' }
  ]);
  root.innerHTML = `<div class="p-6"><h2 class="text-2xl font-bold">Editace šablony komunikace</h2><p>Formulář bude implementován.</p></div>`;
}
