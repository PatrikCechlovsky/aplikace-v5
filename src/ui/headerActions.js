import { icon } from './icons.js';

// Pokud potřebuješ profilové info, můžeš použít async (případně odkomentovat níže)
// import { supabase } from '../supabase.js'; // pokud používáš supabase
// import { getMyProfile } from '../db.js';   // pokud máš vlastní profil fetch

export function renderHeaderActions(root) {
  if (!root) return;
  root.innerHTML = '';

  const box = document.createElement('div');
  box.className = 'flex items-center gap-3';

  // Příklad: Zobrazit uživatelské jméno (volitelné)
  // async funkci můžeš použít později dle potřeby
  /*
  (async () => {
    try {
      const { data: profile } = await getMyProfile();
      if (profile?.display_name) {
        const hello = document.createElement('span');
        hello.className = 'text-slate-600 text-sm';
        hello.textContent = `Ahoj ${profile.display_name}`;
        box.appendChild(hello);
      }
    } catch {}
  })();
  */

  // Tlačítka – můžeš libovolně rozšířit/změnit
  const mkIconBtn = (title, key, onClick) => {
    const b = document.createElement('button');
    b.className = 'p-2 rounded hover:bg-slate-100 text-slate-700';
    b.title = title;
    b.innerHTML = icon(key);
    if (onClick) b.onclick = onClick;
    return b;
  };

  // Demo tlačítek:
  box.appendChild(mkIconBtn('Hledat', 'search', () => alert('Hledat')));
  box.appendChild(mkIconBtn('Notifikace', 'bell', () => alert('Notifikace')));
  box.appendChild(mkIconBtn('Můj účet', 'account', () => alert('Můj účet')));

  // Odhlásit (může být i textové tlačítko)
  const logout = document.createElement('button');
  logout.className = 'px-3 py-1 border rounded text-slate-700 hover:bg-slate-50 ml-2';
  logout.textContent = 'Odhlásit';
  logout.onclick = () => {
    alert('Odhlásit');
    // zde doplň skutečnou logiku odhlášení (supabase, api, apod.)
  };
  box.appendChild(logout);

  root.appendChild(box);
}
