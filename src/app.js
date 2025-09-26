// Fáze 1 – čisté přepínání sekcí + burger + zobrazení uživatele
// Žádné routery ani DB

// Aktivní sekce
let current = "dashboard";

const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const $ = (sel, root = document) => root.querySelector(sel);

function setActiveSection(section) {
  if (!section) return;
  current = section;

  // přepnout viditelnost sekcí
  $$(".section").forEach(sec => {
    sec.classList.toggle("hidden", sec.dataset.section !== section);
  });

  // aktivní vzhled v menu
  $$(".menu-link").forEach(btn => {
    const active = btn.dataset.section === section;
    btn.classList.toggle("bg-gray-900", active);
    btn.classList.toggle("text-white", active);
    btn.classList.toggle("hover:bg-gray-100", !active);
  });

  // breadcrumb / title v headeru
  const pretty = sectionName(section);
  $("#activeSectionName").textContent = pretty;

  // na mobilu po kliknutí sekce schovej sidebar
  const sidebar = $("#sidebar");
  if (sidebar && window.innerWidth < 768) {
    sidebar.classList.add("hidden");
  }
}

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

function initMenu() {
  $$(".menu-link").forEach(btn => {
    btn.addEventListener("click", () => setActiveSection(btn.dataset.section));
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
  // auth.js už řeší ochranu app.html (redirect nepřihlášených)
  // Tady jen vytáhneme e-mail do headeru (pokud je k dispozici).
  try {
    // auth.js typicky exportuje getSession() / getUser();
    // Pokud máš jinak, klidně změním – teď to řešíme obrácenou závislostí:
    const { supabase } = await import("./supabase.js");
    const { data: { user } } = await supabase.auth.getUser();
    const emailEl = $("#userEmail");
    if (emailEl) emailEl.textContent = user?.email ?? "Přihlášený uživatel";
  } catch (e) {
    // Tiše ignorovat (nechceme blokovat layout)
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
  setActiveSection(current);
});
