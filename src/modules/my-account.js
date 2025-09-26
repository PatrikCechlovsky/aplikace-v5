// src/modules/my-account.js
import { initThemeUI, applyTheme } from '../ui/theme.js';
import { getSessionSafe, getMyProfile, upsertMyProfile } from '../db.js';

export default async function renderMyAccount(root) {
  const session = await getSessionSafe();
  const email = session?.user?.email || '—';

  // 1) Načti profil (může být null u starších účtů – pak ho vytvoříme)
  let profile = await getMyProfile().catch(() => null);
  if (!profile) {
    profile = await upsertMyProfile({ email, theme: 'light' });
  }

  root.innerHTML = `
    <section class="space-y-4">
      <div class="p-4 bg-white rounded-2xl border">
        <h2 class="font-semibold mb-2">Můj účet</h2>
        <p class="text-sm">Přihlášený e-mail: <b>${email}</b></p>
        <p class="text-sm mt-1">Role: <b>${profile?.role || 'user'}</b></p>
      </div>

      <div class="p-4 bg-white rounded-2xl border">
        <h3 class="font-medium mb-2">Nastavení vzhledu</h3>
        <div id="themeBox"></div>
        <p id="themeSaved" class="text-xs text-slate-500 mt-2"></p>
      </div>
    </section>
  `;

  // 2) Inicializace UI + sync s DB
  const box = root.querySelector('#themeBox');
  initThemeUI(box);                        // UI select (čte a zapisuje do localStorage)
  applyTheme(profile?.theme || 'light');   // aplikuj, co je v DB

  // Přepíšu chování selectu tak, aby ukládal také do DB
  const sel = box.querySelector('#themeSelect');
  sel.value = profile?.theme || sel.value;

  sel.addEventListener('change', async () => {
    const t = sel.value;
    try {
      await upsertMyProfile({ theme: t });
      applyTheme(t);
      root.querySelector('#themeSaved').textContent = 'Uloženo do profilu ✓';
    } catch (e) {
      root.querySelector('#themeSaved').textContent = 'Uložení selhalo';
      console.error(e);
    }
  });
}
