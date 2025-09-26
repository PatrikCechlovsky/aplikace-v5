// v5 – Fáze 1: layout podle v4 + dynamické načítání 6 komponent (lazy import)
// Bez DB, bez formulářů. Chráníme app.html a máme „nezničitelné“ odhlášení.

let current = "dashboard";
const cache = new Map();

const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const $  = (sel, root = document) => root.querySelector(sel);

// Mapování sekcí -> moduly (lazy)
const routes = {
  dashboard:   () => import("./components/dashboard.js"),
  pronajimatel:() => import("./components/pronajimatel.js"),
  najemnici:   () => import("./components/najemnici.js"),
  sluzby:      () => import("./components/sluzby.js"),
  finance:     () => import("./components/finance.js"),
  nastaveni:   () => import("./components/nastaveni.js"),
};

function titleOf(section){
  switch(section){
    case "dashboard":    return "Dashboard";
    case "pronajimatel": return "Pronajímatel";
    case "najemnici":    return "Nájemníci";
    case "sluzby":       return "Služby";
    case "finance":      return "Finance";
    case "nastaveni":    return "Nastavení";
    default:             return section;
  }
}

// --- Auth guard + odhlášení (funguje i při 403) ---
async function ensureSignedIn(){
  try{
    const { supabase } = await import("./supabase.js");
    const { data: { session } } = await supabase.auth.getSession();
    if (!session){ location.replace("./index.html"); return null; }
    return { supabase, session };
  }catch(e){
    console.debug("Auth guard:", e?.message || e);
    location.replace("./index.html");
    return null;
  }
}

async function hardLogout(){
  try{
    const { supabase } = await import("./supabase.js");
    try { await supabase.auth.signOut({ scope: "local" }); } catch(_){}
    try { await supabase.auth.signOut(); } catch(e){ console.debug("Server signOut skipped:", e?.message || e); }
    // pro jistotu smažeme všechny sb-* klíče
    try{
      const purge = (store)=>{
        const ks = [];
        for(let i=0;i<store.length;i++){ const k = store.key(i); if(k && k.startsWith("sb-")) ks.push(k); }
        ks.forEach(k=>store.removeItem(k));
      };
      purge(localStorage); purge(sessionStorage);
    }catch(_){}
    const url = new URL("./index.html", location.href);
    url.searchParams.set("_", Date.now().toString());
    location.replace(url.toString());
  }catch(e){
    location.replace("./index.html");
  }
}

// --- UI init ---
function initMenu(){
  $$(".menu-link").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const s = btn.dataset.section;
      if (!s || s===current) return;
      current = s;
      mountSection(s);
    });
  });
}

function setActiveInSidebar(section){
  $$(".menu-link").forEach(btn=>{
    const active = btn.dataset.section === section;
    btn.classList.toggle("bg-slate-900", active);
    btn.classList.toggle("text-white", active);
    btn.classList.toggle("hover:bg-slate-100", !active);
  });
}

async function mountSection(section){
  const container = $("#content");
  if (!container) return;

  // aktivní položka + breadcrumbs (ID jako ve v4)
  setActiveInSidebar(section);
  $("#breadcrumbs").textContent = titleOf(section);

  // lazy import modulu
  container.innerHTML = `<div class="p-4 bg-white rounded-2xl border">Načítám ${titleOf(section)}…</div>`;
  try{
    let mod = cache.get(section);
    if(!mod){
      const loader = routes[section];
      if(!loader) throw new Error(`Neznámá sekce: ${section}`);
      mod = await loader();
      cache.set(section, mod);
    }
    if (typeof mod.default === "function"){
      await mod.default(container);
    }else{
      container.innerHTML = `<div class="p-4 bg-white rounded-2xl border text-red-600">Modul „${titleOf(section)}“ nemá výchozí export.</div>`;
    }
  }catch(err){
    console.error(err);
    container.innerHTML = `<div class="p-4 bg-white rounded-2xl border text-red-600">Chyba načítání sekce.</div>`;
  }
}

function wireHeader(user){
  const nameEl = $("#userName");
  if (nameEl) nameEl.textContent = user?.email ?? "—";
  $("#logoutBtn")?.addEventListener("click", hardLogout);
  $("#home-link")?.addEventListener("click", ()=>{ /* rezervované pro budoucí chování */ });
}

window.addEventListener("DOMContentLoaded", async ()=>{
  const auth = await ensureSignedIn();
  if (!auth) return;

  // UI
  initMenu();

  // doplnit e-mail do headeru
  try{
    const { data: { user } } = await auth.supabase.auth.getUser();
    wireHeader(user);
  }catch(_){ wireHeader(null); }

  // první mount
  mountSection(current);
});
