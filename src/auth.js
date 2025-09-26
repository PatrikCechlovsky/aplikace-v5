// Robustní Auth helper pro v5
// - Zajistí ochranu app.html (redirect nepřihlášených)
// - Odhlášení je "nezničitelné": nejdřív local signout, pak best-effort serverové revoke
// - Bez chyb blokujících UI

import { supabase } from "./supabase.js";

export async function getUserSafe() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user ?? null;
  } catch (e) {
    console.debug("getUserSafe:", e?.message || e);
    return null;
  }
}

export async function requireAuthOnApp() {
  // Volat na app.html – pokud není user, jdeme na index.html (login)
  const user = await getUserSafe();
  if (!user) {
    window.location.replace("./index.html");
    return false;
  }
  return true;
}

export async function hardLogout() {
  // 1) Lokální odhlášení (nikdy nehází 403) – spolehlivě tě odpojí v prohlížeči
  try {
    await supabase.auth.signOut({ scope: "local" });
  } catch (_) {}

  // 2) Best-effort serverové odhlášení (může spadnout na 403 – nevadí)
  try {
    await supabase.auth.signOut(); // defaultně se pokusí "global"
  } catch (e) {
    console.debug("Server signOut skipped:", e?.message || e);
  }

  // 3) Vždy přesměruj na login
  window.location.replace("./index.html");
}

// Auto-init podle stránky
document.addEventListener("DOMContentLoaded", async () => {
  const here = location.pathname.split("/").pop();

  // Ochrana app.html
  if (here === "app.html") {
    const ok = await requireAuthOnApp();
    if (!ok) return;
  }

  // Tlačítko odhlásit (app.html)
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", hardLogout);
  }

  // Na index.html zobraz info o uživateli (pokud je přihlášen)
  const emailEl = document.getElementById("userEmail");
  const gotoAppBtn = document.getElementById("gotoAppBtn");
  if (emailEl || gotoAppBtn) {
    const user = await getUserSafe();
    if (user && emailEl) emailEl.textContent = user.email ?? "Přihlášený uživatel";
    if (gotoAppBtn) gotoAppBtn.disabled = !user;
  }
});
