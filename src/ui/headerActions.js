// Odolný header actions – i když selže DB/Profil, UI se vykreslí.
import { supabase } from '../supabase.js';
import { getMyProfile } from '../db.js';
import { icon } from './icons.js';

export async function renderHeaderActions(root) {
  if (!root) return;
  root.innerHTML = '';

  const box = document.createElement('div');
  box.className = 'flex items-center gap-3';

  // 1) Pozdrav (bezpečný – nepadá, když profil nejde načíst)
  try {
    const { data: profile } = await getMyProfile();
    if (profile?.display_name) {
      const hello = document.createElement('span');
      hello.className = 'text-slate-600 text-sm';
      hello.textContent = `Ahoj ${profile.display_name}`;
      box.appendChild(hello);
    }
  } catch (e) {
    console.warn('[headerActions] profile load failed:', e);
  }

  // 2) Home
  const home = document.createElement('button');
  home.className = 'p-2 hover:bg-slate-100 rounded';
  home.title = 'Domů';
  home.textContent = icon('home');
  home.onclick = () => {
    // pokud někdy přidáme AppState.isDirty(), můžeme ho sem zapojit
    location.href = 'app.html?v=home';
  };
  box.appendChild(home);

  // 3) Notifikace
  const bell = document.createElement('button');
  bell.className = 'p-2 hover:bg-slate-100 rounded';
  bell.title = 'Notifikace';
  bell.textContent = icon('bell');
  box.appendChild(bell);

  // 4) Hledání
  const search = document.createElement('button');
  search.className = 'p-2 hover:bg-slate-100 rounded';
  search.title = 'Hledat';
  search.textContent = icon('search');
  box.appendChild(search);

  // 5) Můj účet (použijeme existující klíč „account“, ne „user“)
  const account = document.createElement('button');
  account.className = 'p-2 hover:bg-slate-100 rounded';
  account.title = 'Můj účet';
  account.textContent = icon('account');
  account.onclick = () => {
    // dočasně – později přepneme na modul/sekci Můj účet
    alert('Můj účet (placeholder)');
  };
  box.appendChild(account);

  // 6) Odhlásit (ikonu „logout“ v registry nemáme – použijeme text)
  const logout = document.createElement('button');
  logout.className = 'px-3 py-1 bg-slate-800 text-white rounded hover:bg-slate-700';
  logout.textContent = 'Odhlásit';
  logout.onclick = async () => {
    try { await supabase.auth.signOut(); } catch(e) { console.warn(e); }
    location.href = 'index.html';
  };
  box.appendChild(logout);

  root.appendChild(box);
}
