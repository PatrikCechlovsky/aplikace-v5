// v5 – Fáze 1: dynamické načítání komponent (lazy import)
// Žádné DB, žádné formuláře. Jen layout + mount jednotlivých modulů.

let current = "dashboard";
const cache = new Map(); // cache načtených modulů

const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const $ = (sel, root = document) => root.querySelector(sel);

const routes = {
  dashboard: () => import("./components/dashboard.js"),
  pronajimatel: () => import("./components/pronajimatel.js"),
  najemnici: () => import("./components/najemnici.js"),
  sluzby: () => import("./components/sluzby.js"),
  finance: () => import("./components/finance.js"),
  nastaveni: () => import("./components/nastaveni.js"),
};

function sectionName(key) {
  switch (key) {
    case "dashboard": return "Dashboard";
    case "pronajimatel": return "Pronajímatel";
    case "najemnici": return "Nájemníci";
    case "sluzby": return "Služby";
    case "finance": return "Finance";
    case "nastaveni": return "Nastavení";
    default: return key;
  }
}

async function mountSection(section) {
  const container = $("#content");
  if (!container) return;

  // UI: aktivní položka menu
  $$(".menu-link").forEach(btn => {
    const active = btn.dataset.section === section;
    btn.classList.toggle("bg-gray-900", active);
    btn.classList.toggle("text-white", active);
    btn.classList.toggle("hover:bg-gray-100", !active);
  });
  $("#activeSectionName").textContent = sectionName(section);

  // Lazy import modulu
  try {
    container.innerHTML = `<div class="p-4 rounded-xl border bg-white">Načítám ${sectionName(section)}…</div>`;

    let mod = cache.get(section);
    if (!mod) {
      const loader = routes[section];
      if (!loader) throw new Error(`Neznámá sekce: ${section}`);
      mod = await loader();
      cache.set(section, mod);
    }

    // Každý modul exportuje default funkci mount(root)
    if (typeof mod.default === "function") {
      await mod.default(container);
    } else {
      container.innerHTML = `<div class="p-4 rounded-xl border bg-white">Modul „${section}“ nemá výchozí export funkce.</div>`;
    }

    // Na mobilu po volbě sekce schovej sidebar
    const sidebar = $("#sidebar");
    if (sidebar && window.innerWidth < 768) sidebar.classList.add("hidden");

  } catch (err) {
    console.error(err);
    container.innerHTML = `
      <div class="p-4 rounded-xl border bg-white text-red-600">
        Chyba načítání sekce „${sectionName(section)}“. Zkuste to znovu.
      </div>`;
  }
}

function initMenu() {
  $$(".menu-link").forEach(btn => {
    btn.addEventListener("click", () => {
      const section = btn.dataset.section;
      if (!section || section === current) return;
      current = section;
      mountSection(section);
    });
  });
}

function initBurger() {
  const burger = $("#burger");
  const sidebar = $("#sidebar");
  if (!burger || !sidebar) return;
  burger.addEventListener("click", () => {
    sidebar.classList.toggle("hidden");
  });
}

async function initAuthUI() {
  try {
    const { supabase } = await import("./supabase.js");
    const { data: { user } } = await supabase.auth.getUser();
    const emailEl = $("#userEmail");
    if (emailEl) emailEl.textContent = user?.email ?? "Přihlášený uživatel";
  } catch (e) {
    console.debug("Auth UI note:", e?.message || e);
  }

  const logoutBtn = $("#logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        const { supabase } = await import("./supabase.js");
        await supabase.auth.signOut();
        window.location.href = "./index.html";
      } catch (e) {
        alert("Odhlášení selhalo. Zkuste to prosím znovu.");
        console.error(e);
      }
    });
  }
}

// Start
document.addEventListener("DOMContentLoaded", async () => {
  initMenu();
  initBurger();
  await initAuthUI();
  // První mount
  mountSection(current);
});
