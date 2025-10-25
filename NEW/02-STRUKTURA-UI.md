# 02 - Struktura UI (Uživatelského Rozhraní)

> **Tento dokument detailně popisuje všechny části uživatelského rozhraní aplikace, jejich chování a propojení.**

---

## 📖 Obsah

1. [Layout Aplikace](#layout-aplikace)
2. [Home Button](#home-button)
3. [Sidebar (Boční Menu)](#sidebar-boční-menu)
4. [Breadcrumb (Navigační Cesta)](#breadcrumb-navigační-cesta)
5. [Header Actions](#header-actions)
6. [Common Actions](#common-actions)
7. [Content (Hlavní Obsah)](#content-hlavní-obsah)
8. [Interakce a Chování](#interakce-a-chování)

---

## 🏗️ Layout Aplikace

### Struktura HTML (app.html)

```html
<!DOCTYPE html>
<html>
<head>
  <title>Pronajímatel v5</title>
  <link href="https://cdn.tailwindcss.com" rel="stylesheet">
  <link href="styles.css" rel="stylesheet">
</head>
<body class="bg-slate-50 min-h-screen">
  
  <!-- Hlavní kontejner -->
  <div class="flex h-screen">
    
    <!-- SIDEBAR (vlevo) -->
    <aside class="w-80 bg-white border-r border-slate-200 overflow-y-auto">
      <!-- Home Button -->
      <div id="homebtnbox" class="p-4 border-b border-slate-200"></div>
      
      <!-- Sidebar Menu -->
      <div id="sidebarbox" class="p-4"></div>
    </aside>
    
    <!-- HLAVNÍ OBSAH (vpravo) -->
    <main class="flex-1 flex flex-col overflow-hidden">
      
      <!-- HEADER -->
      <header class="bg-white border-b border-slate-200 px-6 py-4">
        <div class="flex items-center justify-between">
          <!-- Breadcrumb -->
          <div id="crumb" class="text-sm text-slate-600"></div>
          
          <!-- Header Actions (logout, profil) -->
          <div id="headeractions"></div>
        </div>
      </header>
      
      <!-- COMMON ACTIONS (akční lišta) -->
      <div class="bg-slate-50 border-b border-slate-200 px-6 py-3">
        <div id="commonactions" class="flex gap-2"></div>
      </div>
      
      <!-- CONTENT (hlavní obsah) -->
      <div id="content" class="flex-1 overflow-y-auto p-6">
        <!-- Sem se vykreslují tiles/forms -->
      </div>
      
    </main>
  </div>
  
  <script type="module" src="./src/app.js"></script>
</body>
</html>
```

### Vizualizace layoutu

```
┌─────────────────────────────────────────────────────────────┐
│  APLIKACE                                                   │
├────────────────┬────────────────────────────────────────────┤
│                │  HEADER                                     │
│                ├────────────────────────────────────────────┤
│  SIDEBAR       │  Breadcrumb          │  Header Actions    │
│                │  Domů › Modul › ...  │  👤 Logout         │
│  ┌──────────┐  ├────────────────────────────────────────────┤
│  │ 🏠 Domů  │  │  COMMON ACTIONS                           │
│  │ ✕ Zavřít │  │  👁️ Detail │ ➕ Přidat │ ✏️ Upravit │ ...  │
│  └──────────┘  ├────────────────────────────────────────────┤
│                │                                            │
│  📂 Uživatelé  │                                            │
│  ▶  📋 Přehled │                                            │
│                │         CONTENT                            │
│  📂 Nemovitost │         (Sem se vykresluje obsah)          │
│  ▶  📋 Přehled │                                            │
│      🏢 Byty   │                                            │
│      🏠 Domy   │                                            │
│                │                                            │
│  ...           │                                            │
│                │                                            │
└────────────────┴────────────────────────────────────────────┘
```

---

## 🏠 Home Button

**Umístění:** `#homebtnbox` (vlevo nahoře v sidebaru)

**Účel:** Návrat na domovskou obrazovku (dashboard) a zavření všech otevřených modulů.

### Kód (ui/homebutton.js)

```javascript
export function renderHomeButton(root, { appName, onHome, onCloseAll }) {
  root.innerHTML = `
    <div class="space-y-2">
      <!-- Tlačítko Domů -->
      <button id="homeBtn" 
        class="w-full flex items-center gap-2 px-4 py-3 
               bg-blue-600 hover:bg-blue-700 text-white 
               rounded-lg transition font-semibold">
        <span>🏠</span>
        <span>${appName}</span>
      </button>
      
      <!-- Tlačítko Zavřít vše -->
      <button id="closeAllBtn"
        class="w-full flex items-center gap-2 px-4 py-2
               bg-slate-100 hover:bg-slate-200 text-slate-700
               rounded-lg transition text-sm">
        <span>✕</span>
        <span>Zavřít vše</span>
      </button>
    </div>
  `;
  
  // Event listenery
  root.querySelector('#homeBtn').addEventListener('click', () => {
    location.hash = '#/';
    if (onHome) onHome();
  });
  
  root.querySelector('#closeAllBtn').addEventListener('click', () => {
    location.hash = '#/';
    if (onCloseAll) onCloseAll();
  });
}
```

### Chování

| Akce | Výsledek |
|------|----------|
| Klik na "Domů" | Přesměruje na `#/`, zobrazí dashboard s dlaždicemi modulů |
| Klik na "Zavřít vše" | Přesměruje na `#/`, zavře všechny otevřené sekce v sidebaru |

---

## 📂 Sidebar (Boční Menu)

**Umístění:** `#sidebarbox` (vlevo pod home buttonem)

**Účel:** Navigace mezi moduly a jejich sekcemi (tiles/forms).

### Struktura

```
📂 Uživatelé (010-sprava-uzivatelu)
▶  📋 Přehled (tile)
   📝 Formulář (form)
   ➕ Nový/Pozvat (form)

📂 Pronajímatel (030-pronajimatel)
▶  📋 Přehled (tile)
   📝 Formulář (form)

📂 Nemovitost (040-nemovitost)
▼  📋 Přehled (tile)
   🏢 Bytové domy (tile)
   🏠 Rodinné domy (tile)
   🏢 Admin budovy (tile)
   🏭 Průmyslové (tile)
   🌳 Pozemky (tile)
   🏚️ Jiné objekty (tile)
   🔲 Jednotky (tile)
```

### Kód (ui/sidebar.js)

```javascript
export function renderSidebar(root, modules = [], opts = {}) {
  let openModId = null; // ID aktuálně otevřeného modulu
  
  function render() {
    const hash = location.hash || '';
    const match = hash.match(/^#\/m\/([^/]+)\/([tf])\/([^/?]+)/);
    const activeMod = match ? match[1] : null;      // ID modulu
    const activeKind = match ? match[2] : null;      // 't' nebo 'f'
    const activeSection = match ? match[3] : null;   // ID sekce
    
    root.innerHTML = `
      <nav>
        <ul class="space-y-1 py-2">
          ${modules.map(m => {
            const isOpen = openModId === m.id;
            
            // Tiles
            const tileLinks = (m.tiles || []).map(t => {
              const isActive = m.id === activeMod && activeKind === 't' && t.id === activeSection;
              return `
                <a href="#/m/${m.id}/t/${t.id}"
                  class="block text-sm rounded px-2 py-1 transition font-medium
                    ${isActive 
                      ? 'bg-blue-100 text-blue-900 font-semibold border border-blue-200' 
                      : 'text-slate-600 hover:bg-blue-50 hover:text-blue-900'}"
                >
                  ${icon(t.icon || 'list')} ${t.title}
                </a>
              `;
            }).join('');
            
            // Forms
            const formLinks = (m.forms || []).map(f => {
              const isActive = m.id === activeMod && activeKind === 'f' && f.id === activeSection;
              return `
                <a href="#/m/${m.id}/f/${f.id}"
                  class="block text-sm rounded px-2 py-1 transition font-medium
                    ${isActive 
                      ? 'bg-blue-100 text-blue-900 font-semibold border border-blue-200' 
                      : 'text-slate-600 hover:bg-blue-50 hover:text-blue-900'}"
                >
                  ${icon(f.icon || 'form')} ${f.title}
                </a>
              `;
            }).join('');
            
            return `
              <li>
                <!-- Hlavní tlačítko modulu -->
                <button class="flex items-center gap-2 w-full px-4 py-2 
                               rounded-lg font-semibold transition
                               ${isOpen 
                                 ? 'bg-blue-50 border border-blue-300 text-blue-900' 
                                 : 'hover:bg-blue-100'}"
                        data-mod="${m.id}">
                  <span class="transition-transform ${isOpen ? 'rotate-90' : ''}">
                    ${icon('chevron-right')}
                  </span>
                  <span>${icon(m.icon)}</span>
                  <span>${m.title}</span>
                </button>
                
                <!-- Rozbalené sekce -->
                <div class="${isOpen ? '' : 'hidden'} ml-8 mt-1 mb-2">
                  ${tileLinks}
                  ${formLinks}
                </div>
              </li>
            `;
          }).join('')}
        </ul>
      </nav>
    `;
    
    // Event listener na tlačítka modulů
    root.querySelectorAll('[data-mod]').forEach(btn => {
      btn.addEventListener('click', () => {
        const modId = btn.dataset.mod;
        openModId = openModId === modId ? null : modId; // Toggle
        render();
      });
    });
  }
  
  render();
  
  // Re-render při změně hash
  window.addEventListener('hashchange', render);
}
```

### Chování

| Akce | Výsledek |
|------|----------|
| Klik na modul | Rozbalí/zabalí sekce modulu |
| Klik na tile/form | Načte a zobrazí danou sekci v #content |
| Aktivní sekce | Zvýrazněna modrou barvou |
| Hash změna | Automaticky aktualizuje UI |

### Stavy

```
Zabalený modul:
▶ 📂 Uživatelé

Rozbalený modul:
▼ 📂 Uživatelé
  📋 Přehled
  📝 Formulář

Aktivní sekce:
▼ 📂 Uživatelé
  📋 Přehled ← (modrá, tučná)
  📝 Formulář
```

---

## 🍞 Breadcrumb (Navigační Cesta)

**Umístění:** `#crumb` (vlevo v headeru)

**Účel:** Zobrazuje aktuální pozici v aplikaci, umožňuje rychlý návrat.

### Struktur

```
Domů

Domů › Uživatelé › Přehled

Domů › Nemovitost › Přehled › Detail #123

Domů › Pronajímatel › Přehled › Editace: Jan Novák
```

### Kód (ui/breadcrumb.js)

```javascript
import { icon } from './icons.js';

export function setBreadcrumb(root, items = []) {
  if (!root) return;
  
  root.innerHTML = items.map((it, i) => {
    const isLast = i === items.length - 1;
    const className = isLast ? 'opacity-70' : '';
    
    const body = `${it.icon ? icon(it.icon) + ' ' : ''}${it.label ?? ''}`;
    
    const piece = it.href
      ? `<a href="${it.href}" class="hover:underline">${body}</a>`
      : `<span class="${className}">${body}</span>`;
    
    // První položka bez oddělovače, ostatní s ›
    return i ? `<span class="mx-1">›</span>${piece}` : piece;
  }).join('');
}
```

### Použití

```javascript
// Dashboard
setBreadcrumb(crumbEl, [
  { icon: 'home', label: 'Domů' }
]);

// Přehled
setBreadcrumb(crumbEl, [
  { icon: 'home', label: 'Domů', href: '#/' },
  { icon: 'users', label: 'Uživatelé' },
  { icon: 'list', label: 'Přehled' }
]);

// Detail
setBreadcrumb(crumbEl, [
  { icon: 'home', label: 'Domů', href: '#/' },
  { icon: 'users', label: 'Uživatelé', href: '#/m/010-sprava-uzivatelu/t/prehled' },
  { icon: 'list', label: 'Přehled', href: '#/m/010-sprava-uzivatelu/t/prehled' },
  { label: 'Detail: Jan Novák' }
]);
```

### Pravidla

1. **První položka = vždy "Domů"** s ikonou 🏠
2. **Druhá položka = název modulu** (Uživatelé, Nemovitost, ...)
3. **Třetí položka = název sekce** (Přehled, Formulář, ...)
4. **Čtvrtá položka = detail** (Detail: Jan Novák, ID: 123, ...)
5. **Poslední položka = neaktivní** (opacity-70, bez linku)
6. **Předchozí položky = odkazy** (kliknutelné, vrátí tě zpět)

---

## 🔧 Header Actions

**Umístění:** `#headeractions` (vpravo v headeru)

**Účel:** Globální akce (profil, nastavení, odhlášení).

### Kód (ui/headerActions.js)

```javascript
export function renderHeaderActions(root) {
  root.innerHTML = `
    <div class="flex items-center gap-3">
      <!-- Vyhledávání (plánováno) -->
      <!-- <button class="p-2 hover:bg-slate-100 rounded">
        ${icon('search')}
      </button> -->
      
      <!-- Notifikace (plánováno) -->
      <!-- <button class="p-2 hover:bg-slate-100 rounded relative">
        ${icon('bell')}
        <span class="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
      </button> -->
      
      <!-- Profil -->
      <a href="#/m/020-muj-ucet/f/profil" 
         class="p-2 hover:bg-slate-100 rounded"
         title="Můj účet">
        ${icon('user')}
      </a>
      
      <!-- Odhlášení -->
      <button id="logoutBtn" 
        class="px-4 py-2 bg-red-600 hover:bg-red-700 
               text-white rounded-lg transition text-sm font-medium">
        Odhlásit se
      </button>
    </div>
  `;
  
  // Event listener pro odhlášení je v auth.js
}
```

---

## ⚡ Common Actions

**Umístění:** `#commonactions` (pod headerem)

**Účel:** Akce specifické pro aktuální view (tile/form).

### Dostupné akce

| Klíč | Ikona | Label | Popis |
|------|-------|-------|-------|
| `detail` | 👁️ | Detail | Zobrazit detail záznamu |
| `add` | ➕ | Přidat | Vytvořit nový záznam |
| `edit` | ✏️ | Upravit | Upravit záznam |
| `delete` | 🗑️ | Smazat | Smazat záznam |
| `archive` | 📦 | Archivovat | Přesunout do archivu |
| `attach` | 📎 | Přílohy | Zobrazit přílohy |
| `refresh` | 🔄 | Obnovit | Načíst data znovu |
| `search` | 🔍 | Hledat | Hledat/filtrovat |
| `approve` | ✅ | Uložit | Uložit změny |
| `reject` | ❌ | Zpět | Zpět bez uložení |
| `invite` | 📧 | Pozvat | Odeslat pozvánku |
| `history` | 📜 | Historie | Zobrazit historii změn |
| `units` | 🔲 | Jednotky | Správa jednotek |
| `export` | 📤 | Export | Exportovat data |
| `import` | 📥 | Import | Importovat data |
| `print` | 🖨️ | Tisk | Vytisknout |

### Kód (ui/commonActions.js)

```javascript
export function renderCommonActions(root, { 
  moduleActions = [],   // Jaké akce modul podporuje
  userRole = 'admin',   // Role uživatele
  handlers = {},        // Funkce pro jednotlivé akce
  isStarred = false     // Je položka oblíbená?
}) {
  if (!root) return;
  
  // Získej povolené akce pro danou roli
  const allowedActions = getAllowedActions(userRole, moduleActions);
  
  // Vykreslí tlačítka
  root.innerHTML = allowedActions.map(action => {
    const { key, icon, label, title } = action;
    return `
      <button data-action="${key}"
        class="flex items-center gap-2 px-3 py-2 
               bg-white hover:bg-blue-50 border border-slate-200
               rounded-lg transition text-sm font-medium"
        title="${title}">
        <span>${icon}</span>
        <span class="hidden sm:inline">${label}</span>
      </button>
    `;
  }).join('');
  
  // Připoj event listenery
  root.querySelectorAll('[data-action]').forEach(btn => {
    const action = btn.dataset.action;
    const handler = handlers[`on${capitalize(action)}`]; // onAdd, onEdit, ...
    
    if (handler) {
      btn.addEventListener('click', () => handler());
    }
  });
}
```

### Použití

```javascript
// V tiles/prehled.js
renderCommonActions(document.getElementById('commonactions'), {
  moduleActions: ['add', 'edit', 'archive', 'attach', 'refresh'],
  userRole: window.currentUser.role,
  handlers: {
    onAdd: () => navigateTo('#/m/010-sprava-uzivatelu/f/create'),
    onEdit: () => {
      if (!selectedRow) {
        toast('Vyberte řádek', 'warning');
        return;
      }
      navigateTo(`#/m/010-sprava-uzivatelu/f/form?id=${selectedRow.id}`);
    },
    onArchive: async () => {
      if (!selectedRow) return;
      await archiveUser(selectedRow.id);
      toast('Archivováno', 'success');
      refresh();
    },
    onAttach: () => { /* ... */ },
    onRefresh: () => refresh()
  }
});
```

### Pravidla

1. **Akce se zobrazují podle oprávnění** - admin vidí vše, nájemník jen omezené
2. **Ikona + text** - na mobilu jen ikona
3. **Disabled stav** - pokud nelze provést (např. Edit bez vybraného řádku)
4. **Tooltip** - každá akce má title s popisem

---

## 📄 Content (Hlavní Obsah)

**Umístění:** `#content` (hlavní plocha vpravo)

**Účel:** Zobrazení tiles (přehledy) nebo forms (formuláře).

### Typy obsahu

#### 1. Dashboard (domovská obrazovka)

```javascript
// Dlaždice modulů
renderDashboardTiles(contentEl, modules);
```

**Zobrazení:**
```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ 👥 Uživatelé │  │ 🏠 Nemovitost│  │ 💰 Platby   │
│              │  │              │  │              │
│ 25 aktivních │  │ 12 nemovit.  │  │ 3 dlužné     │
│              │  │              │  │              │
│ [Otevřít]    │  │ [Otevřít]    │  │ [Otevřít]    │
└──────────────┘  └──────────────┘  └──────────────┘
```

#### 2. Tile (Přehled/Seznam)

```javascript
// src/modules/010-sprava-uzivatelu/tiles/prehled.js
export async function render(root, manifest, { userRole }) {
  // 1. Načti data
  const { data, error } = await getUsers();
  
  // 2. Vykresli tabulku
  renderTable(root, {
    columns: [
      { key: 'display_name', label: 'Jméno', sortable: true },
      { key: 'email', label: 'E-mail', sortable: true },
      { key: 'role', label: 'Role', sortable: true }
    ],
    data: data,
    onRowClick: (row) => {
      navigateTo(`#/m/010-sprava-uzivatelu/f/form?id=${row.id}`);
    }
  });
}
```

#### 3. Form (Formulář)

```javascript
// src/modules/010-sprava-uzivatelu/forms/form.js
export async function render(root, manifest, { query }) {
  const userId = query.id;
  const { data: user } = await getUserById(userId);
  
  root.innerHTML = `
    <form id="userForm" class="space-y-6">
      <section class="bg-white p-6 rounded-lg shadow">
        <h3 class="font-semibold mb-4">Profil</h3>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label>Jméno</label>
            <input type="text" name="display_name" value="${user.display_name}">
          </div>
          <div>
            <label>E-mail</label>
            <input type="email" name="email" value="${user.email}">
          </div>
        </div>
      </section>
      
      <section class="bg-white p-6 rounded-lg shadow">
        <h3 class="font-semibold mb-4">Systém</h3>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label>Vytvořeno</label>
            <input type="text" value="${formatDate(user.created_at)}" readonly>
          </div>
          <div>
            <label>Upraveno</label>
            <input type="text" value="${formatDate(user.updated_at)}" readonly>
          </div>
        </div>
      </section>
    </form>
  `;
}
```

---

## 🖱️ Interakce a Chování

### Navigace

```javascript
// URL hash formát
#/                                    // Dashboard
#/m/<module-id>/t/<tile-id>          // Tile (přehled)
#/m/<module-id>/f/<form-id>          // Form
#/m/<module-id>/f/<form-id>?id=123   // Form s parametrem

// Příklady
#/m/010-sprava-uzivatelu/t/prehled
#/m/030-pronajimatel/f/form?id=abc-123
#/m/040-nemovitost/t/jednotky?property_id=xyz
```

### Router (app.js)

```javascript
export async function route() {
  const hash = location.hash || '#/';
  const match = hash.match(/^#\/m\/([^/]+)\/(t|f)\/([^/?]+)(?:\?(.*))?$/);
  
  if (!match) {
    // Dashboard
    renderDashboard();
    return;
  }
  
  const [, moduleId, kind, sectionId, queryString] = match;
  const query = parseQueryString(queryString);
  
  // Najdi modul
  const module = registry.get(moduleId);
  if (!module) {
    console.error('Modul nenalezen:', moduleId);
    return;
  }
  
  // Načti tile nebo form
  const path = kind === 't' 
    ? `${module.baseDir}/tiles/${sectionId}.js`
    : `${module.baseDir}/forms/${sectionId}.js`;
  
  const renderer = await import(path);
  
  // Vykresli
  await renderer.render(contentEl, module, { 
    query, 
    userRole: window.currentUser.role 
  });
  
  // Nastav breadcrumb
  setBreadcrumb(crumbEl, [
    { icon: 'home', label: 'Domů', href: '#/' },
    { icon: module.icon, label: module.title },
    { label: getSectionTitle(module, kind, sectionId) }
  ]);
}
```

### Event Flow

```
User Action
  ↓
Event Handler (onClick, onSubmit, ...)
  ↓
Business Logic (validace, transformace, ...)
  ↓
API Call (db.js → Supabase)
  ↓
Response
  ↓
UI Update (re-render, toast, ...)
  ↓
Navigation (optional)
```

### Příklad: Klik na tlačítko "Přidat"

```
1. User: Klikne na "Přidat" v CommonActions
2. Handler: onAdd() funkce
3. Navigation: navigateTo('#/m/010-sprava-uzivatelu/f/create')
4. Router: Parsuje hash, načte forms/create.js
5. Render: Vykreslí formulář
6. Breadcrumb: Aktualizuje na "Domů › Uživatelé › Nový"
7. CommonActions: Vykreslí akce pro formulář (Uložit, Zpět)
```

---

## 🎨 Responsive Design

### Breakpoints

```css
/* Mobile */
@media (max-width: 640px) {
  /* Sidebar schován, burger menu */
  /* CommonActions jen ikony */
  /* Tabulka scrolluje horizontálně */
}

/* Tablet */
@media (min-width: 641px) and (max-width: 1024px) {
  /* Sidebar zabalený, na kliknutí se rozbalí */
  /* CommonActions ikony + text */
}

/* Desktop */
@media (min-width: 1025px) {
  /* Sidebar vždy viditelný */
  /* CommonActions full */
}
```

### Priorita

1. **Desktop first** - primární vývoj pro PC
2. **Tablet second** - omezená funkcionalita
3. **Mobile later** - samoobsluha pro nájemníky (PWA)

---

## ✅ Checklist UI Komponent

### Pro každý nový modul zkontroluj:

- [ ] Home Button funguje (návrat na dashboard)
- [ ] Sidebar obsahuje všechny tiles/forms
- [ ] Breadcrumb je správně nastavena na všech view
- [ ] Header Actions fungují (profil, logout)
- [ ] Common Actions jsou správně definované
- [ ] Content se vykresluje bez chyb
- [ ] Navigace mezi view funguje
- [ ] Hash URL je správný formát
- [ ] Responsivita (desktop, tablet)
- [ ] Accessibility (klavesnice, screen reader)

---

## 📚 Další Čtení

- **[04-VZOROVE-FORMULARE.md](./04-VZOROVE-FORMULARE.md)** - Jak vytvořit formuláře
- **[05-VZOROVE-PREHLEDY.md](./05-VZOROVE-PREHLEDY.md)** - Jak vytvořit přehledy
- **[08-SABLONA-MODULU.md](./08-SABLONA-MODULU.md)** - Kompletní šablona modulu

---

**Konec dokumentu - Struktura UI** ✅
