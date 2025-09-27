// Decentní header akce: Ahoj {display_name}, Home, Bell, Search, Account, Odhlásit (outlined)

import { supabase } from '../supabase.js';
import { getMyProfile } from '../db.js';
import { icon } from './icons.js';

export async function renderHeaderActions(root) {
  if (!root) return;
  root.innerHTML = '';

  const box = document.createElement('div');
  box.className = 'flex items-center gap-3';

  try {
    const { data: profile } = await getMyProfile();
    if (profile?.display_name) {
      const hello = document.createElement('span');
      hello.className = 'text-slate-600 text-sm';
      hello.textContent = `Ahoj ${profile.display_name}`;
      box.appendChild(hello);
    }
  } catch {}

  const mkIconBtn = (title, key, onClick) => {
    const b = document.createElement('button');
    b.className = 'p-2 rounded hover:bg-slate-100 text-slate-700';
    b.title = title;
    b.innerHTML = icon(key);
    if (onClick) b.onclick = onClick;
    return b;
  };

  box.appendChild(mkIconBtn('Domů', 'home', () => { location.hash = '#/dashboard'; }));

  box.appendChild(mkIconBtn('Notifikace', 'bell'));
  box.appendChild(mkIconBtn('Hledat', 'search'));
  box.appendChild(mkIconBtn('Můj účet', 'account', () => {
    location.hash = '#/m/020-muj-ucet/t/profil';
  }));

  const logout = document.createElement('button');
  logout.className = 'px-3 py-1 border rounded text-slate-700 hover:bg-slate-50';
  logout.textContent = 'Odhlásit';
  logout.onclick = async () => {
    try { await supabase.auth.signOut(); } catch {}
    location.href = 'index.html';
  };
  box.appendChild(logout);

  root.appendChild(box);
}
