// src/ui/headerActions.js
import { supabase } from '../supabase.js';
import { getMyProfile } from '../db.js';
import { icon } from './icons.js';

export async function renderHeaderActions(root) {
  root.innerHTML = '';

  // Načteme profil (jméno, role, email)
  const { data: profile } = await getMyProfile();

  const actions = document.createElement('div');
  actions.className = 'flex items-center gap-4';

  // Oslovení (jen když máme display_name)
  if (profile?.display_name) {
    const hello = document.createElement('span');
    hello.className = 'text-slate-600 text-sm';
    hello.textContent = `Ahoj ${profile.display_name}`;
    actions.appendChild(hello);
  }

  // Home button
  const homeBtn = document.createElement('button');
  homeBtn.className = 'p-2 hover:bg-slate-100 rounded';
  homeBtn.innerHTML = icon('home');
  homeBtn.onclick = () => {
    if (confirm('Pozor: Máš rozdělanou práci. Odejít bez uložení?')) {
      window.location.href = 'app.html'; // návrat na výchozí
    }
  };
  actions.appendChild(homeBtn);

  // Notifications
  const bellBtn = document.createElement('button');
  bellBtn.className = 'p-2 hover:bg-slate-100 rounded relative';
  bellBtn.innerHTML = icon('bell');
  actions.appendChild(bellBtn);

  // Search
  const searchBtn = document.createElement('button');
  searchBtn.className = 'p-2 hover:bg-slate-100 rounded';
  searchBtn.innerHTML = icon('search');
  actions.appendChild(searchBtn);

  // Account
  const accountBtn = document.createElement('button');
  accountBtn.className = 'p-2 hover:bg-slate-100 rounded';
  accountBtn.innerHTML = icon('user');
  actions.appendChild(accountBtn);

  // Logout
  const logoutBtn = document.createElement('button');
  logoutBtn.className = 'px-3 py-1 bg-slate-800 text-white rounded hover:bg-slate-700';
  logoutBtn.innerHTML = `${icon('logout')} Odhlásit`;
  logoutBtn.onclick = async () => {
    await supabase.auth.signOut();
    window.location.href = 'index.html';
  };
  actions.appendChild(logoutBtn);

  root.appendChild(actions);
}
