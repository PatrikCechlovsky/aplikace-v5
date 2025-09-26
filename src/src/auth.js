import { supabase } from './supabase.js';

const REDIRECT = location.origin + "/recover.html";

// UI prvky
const authBox  = document.getElementById('authBox');
const appBox   = document.getElementById('appBox');
const userEmail= document.getElementById('userEmail');

const msg  = document.getElementById('msg');
const btnL = document.getElementById('btn-login');
const btnS = document.getElementById('btn-signup');
const btnF = document.getElementById('btn-forgot');
const btnO = document.getElementById('btn-logout');

// Přepnutí obrazovek
function render(session) {
  const signedIn = !!session;
  authBox.classList.toggle('hidden', signedIn);
  appBox .classList.toggle('hidden', !signedIn);
  userEmail && (userEmail.textContent = session?.user?.email || '—');
}

// Načtení aktuální session při startu
async function refresh() {
  const { data } = await supabase.auth.getSession();
  render(data.session);
}
await refresh();

// Reakce na změnu stavu (přihlášení, odhlášení, recovery…)
supabase.auth.onAuthStateChange((_event, session) => render(session));

// Přihlášení
btnL.onclick = async () => {
  msg.textContent = 'Přihlašuji…';
  const email = (document.getElementById('email').value || '').trim();
  const pass  = (document.getElementById('pass').value  || '').trim();
  const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
  msg.textContent = error ? ('Chyba: ' + error.message) : 'OK';
  await refresh();
};

// Registrace
btnS.onclick = async () => {
  msg.textContent = 'Zakládám účet…';
  const email = (document.getElementById('email').value || '').trim();
  const pass  = (document.getElementById('pass').value  || '').trim();
  const { error } = await supabase.auth.signUp({ email, password: pass });
  msg.textContent = error ? ('Chyba: ' + error.message)
                          : 'OK – zkontroluj e-mail, pokud je vyžadováno potvrzení.';
};

// Zapomenuté heslo
btnF.onclick = async () => {
  msg.textContent = 'Posílám odkaz…';
  const email = (document.getElementById('email').value || '').trim();
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: REDIRECT });
  msg.textContent = error ? ('Chyba: ' + error.message) : 'Hotovo – zkontroluj e-mail.';
};

// Odhlášení
btnO.onclick = async () => {
  await supabase.auth.signOut();
  await refresh();
};
