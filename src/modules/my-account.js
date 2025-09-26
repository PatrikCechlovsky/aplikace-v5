// src/modules/my-account.js
import { initThemeUI } from '../ui/theme.js';

export default async function renderMyAccount(root, { session }) {
  const email = session?.user?.email || '—';

  root.innerHTML = `
    <section class="space-y-4">
      <div class="p-4 bg-white rounded-2xl border">
        <h2 class="font-semibold mb-2">Můj účet</h2>
        <p class="text-sm">Přihlášený e-mail: <b>${email}</b></p>
      </div>

      <div class="p-4 bg-white rounded-2xl border">
        <h3 class="font-medium mb-2">Nastavení vzhledu</h3>
        <div id="themeBox"></div>
      </div>
    </section>
  `;

  const box = root.querySelector('#themeBox');
  initThemeUI(box);
}
