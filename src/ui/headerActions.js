// src/ui/headerActions.js
import { icon } from './icons.js';
import { hardLogout, getUserSafe } from '../auth.js';

export async function renderHeaderActions(root) {
  if (!root) return;
  root.innerHTML = '';

  const box = document.createElement('div');
  box.className = 'flex items-center gap-3';

  // Volitelně: pozdrav / identifikace uživatele
  try {
    const user = await getUserSafe();
    if (user?.email) {
      const hello = document.createElement('span');
      hello.className = 'text-slate-600 text-sm hidden sm:inline';
      hello.textContent = user.email;
      box.appendChild(hello);
    }
  } catch (_) {}

  const mkIconBtn = (title, key, onClick) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'p-2 rounded hover:bg-slate-100 text-slate-700';
    b.title = title;
    b.innerHTML = icon(key);
    if (onClick) b.onclick = onClick;
    return b;
  };

  // Ikony vpravo
  box.appendChild(mkIconBtn('Hledat', 'search', () => {
    window.dispatchEvent(new CustomEvent('openSearch'));
  }));
  box.appendChild(mkIconBtn('Notifikace', 'bell', () => {
    window.dispatchEvent(new CustomEvent('openNotifications'));
  }));
  box.appendChild(mkIconBtn('Můj účet', 'account', () => {
    // můžeš později přesměrovat na vlastní modul účtu
    alert('Můj účet (placeholder)');
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
