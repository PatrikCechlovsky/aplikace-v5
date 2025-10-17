// src/ui/headerActions.js
import { icon } from './icons.js';
import { hardLogout, getUserSafe } from '../auth.js';
import { getMyProfile } from '../db.js';
import { navigateTo } from '../app.js';

export async function renderHeaderActions(root) {
  if (!root) return;
  root.innerHTML = '';

  const box = document.createElement('div');
  box.className = 'flex items-center gap-3';

  // Zobraz jméno, nebo e-mail přihlášeného uživatele
  try {
    let display = '';
    const prof = await getMyProfile().catch(() => null);
    if (prof && prof.data && prof.data.display_name) {
      display = prof.data.display_name;
    } else {
      const user = await getUserSafe();
      if (user?.email) display = user.email;
    }
    if (display) {
      const hello = document.createElement('span');
      hello.className = 'text-slate-600 text-sm hidden sm:inline';
      hello.textContent = display;
      box.appendChild(hello);
    }
  } catch (_) {}

  // utility
  const mkIconBtn = (title, key, onClick) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'p-2 rounded hover:bg-slate-100 text-slate-700';
    b.title = title;
    b.innerHTML = icon(key);
    if (onClick) b.onclick = onClick;
    return b;
  };

  // akční ikonky
  box.appendChild(mkIconBtn('Hledat', 'search', () => {
    window.dispatchEvent(new CustomEvent('openSearch'));
  }));
  box.appendChild(mkIconBtn('Notifikace', 'bell', () => {
    window.dispatchEvent(new CustomEvent('openNotifications'));
  }));

  // Můj účet - přesměrujeme na stránku modulu "Můj účet"
  // (nahrazuje původní placeholder alert)
  box.appendChild(mkIconBtn('Můj účet', 'account', () => {
    // navigace do modulu "Můj účet" (sekce formuláře)
    // uprav tvůj modId/sekci pokud v registry používáš jiný identifikátor
    navigateTo('#/m/020-muj-ucet/f/form');
  }));

  // Odhlásit – skutečná akce přes Supabase
  const logout = document.createElement('button');
  logout.type = 'button';
  logout.className = 'px-3 py-1 border rounded text-slate-700 hover:bg-slate-50 ml-2';
  logout.textContent = 'Odhlásit';
  logout.onclick = hardLogout;
  box.appendChild(logout);

  root.appendChild(box);
}
