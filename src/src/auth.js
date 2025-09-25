import { supabase } from './supabase.js';

// nastav si cílovou URL pro e-maily (musí být v Redirect URLs)
const REDIRECT = location.origin + "/recover.html";

const msg  = document.getElementById('msg');
const who  = document.getElementById('who');
const btnL = document.getElementById('btn-login');
const btnS = document.getElementById('btn-signup');
const btnF = document.getElementById('btn-forgot');
const btnO = document.getElementById('btn-logout');

function setWho(s){ who.textContent = JSON.stringify(s, null, 2); }
async function refresh(){ const { data } = await supabase.auth.getSession(); setWho(data); btnO.classList.toggle('hidden', !data.session); }
refresh();

btnL.onclick = async () => {
  msg.textContent = 'Přihlašuji…';
  const email = document.getElementById('email').value.trim();
  const pass  = document.getElementById('pass').value.trim();
  const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
  msg.textContent = error ? 'Chyba: '+error.message : 'OK';
  refresh();
};

btnS.onclick = async () => {
  msg.textContent = 'Zakládám účet…';
  const email = document.getElementById('email').value.trim();
  const pass  = document.getElementById('pass').value.trim();
  const { error } = await supabase.auth.signUp({ email, password: pass });
  msg.textContent = error ? 'Chyba: '+error.message : 'OK – zkontroluj e-mail, pokud vyžaduješ potvrzení.';
  refresh();
};

btnF.onclick = async () => {
  msg.textContent = 'Posílám odkaz…';
  const email = document.getElementById('email').value.trim();
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: REDIRECT });
  msg.textContent = error ? 'Chyba: '+error.message : 'Hotovo – zkontroluj e-mail.';
};

btnO.onclick = async () => {
  await supabase.auth.signOut();
  msg.textContent = 'Odhlášeno.';
  refresh();
};
