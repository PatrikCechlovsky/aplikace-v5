# Aplikace v5 - Kompletní detailní dokumentace stavu

> **Datum vytvoření:** 2025-11-07  
> **Verze aplikace:** v5  
> **Účel:** Kompletní a detailní popis všech aspektů aplikace pro přípravu nové verze

---

## �� Obsah

1. [Úvod a přehled aplikace](#1-úvod-a-přehled-aplikace)
2. [Architektura a technologie](#2-architektura-a-technologie)
3. [Struktura souborů a adresářů](#3-struktura-souborů-a-adresářů)
4. [Systém modulů](#4-systém-modulů)
5. [UI komponenty a layout](#5-ui-komponenty-a-layout)
6. [Routing a navigace](#6-routing-a-navigace)
7. [Databázové entity a schéma](#7-databázové-entity-a-schéma)
8. [Bezpečnost a oprávnění](#8-bezpečnost-a-oprávnění)
9. [Vzory a šablony](#9-vzory-a-šablony)
10. [CommonActions - akční lišta](#10-commonactions---akční-lišta)
11. [Header - hlavička aplikace](#11-header---hlavička-aplikace)
12. [Sidebar - boční menu](#12-sidebar---boční-menu)
13. [Breadcrumb - navigace](#13-breadcrumb---navigace)
14. [Tabulky](#14-tabulky)
15. [Formuláře](#15-formuláře)
16. [Historie změn](#16-historie-změn)
17. [Přílohy](#17-přílohy)
18. [Dashboard a oblíbené](#18-dashboard-a-oblíbené)
19. [Existující moduly - detailní rozbor](#19-existující-moduly---detailní-rozbor)
20. [Připravené moduly](#20-připravené-moduly)
21. [Závěr a doporučení](#21-závěr-a-doporučení)

---

## 1. Úvod a přehled aplikace

### 1.1 Účel aplikace

**Aplikace v5 "Pronajímatel"** je komplexní webový systém pro správu pronájmů nemovitostí. Aplikace je určena pro:
- **Správce nemovitostí** - hlavní uživatelé
- **Pronajímatele** - vlastníky nemovitostí
- **Účetní** - finanční reporting
- **Nájemníky** - samoobsluha (plánováno)

### 1.2 Hlavní funkcionalita

Aplikace pokrývá celý životní cyklus správy pronájmů:
- ✅ Správa uživatelů a oprávnění
- ✅ Evidence pronajímatelů a nájemníků
- ✅ Správa nemovitostí a jednotek (byty, kanceláře)
- 🔄 Smlouvy (částečně implementováno)
- 🔄 Služby (připraveno)
- 🔄 Platby a faktury (připraveno)
- ❌ Finance (zakomentováno)
- ❌ Energie (zakomentováno)
- ❌ Údržba (zakomentováno)
- ❌ Dokumenty (zakomentováno)
- ❌ Komunikace (zakomentováno)

### 1.3 Charakteristiky aplikace

**Typ:** Single Page Application (SPA)  
**Frontend:** Vanilla JavaScript (ES6 modules)  
**Backend:** Supabase (PostgreSQL + Auth + Storage)  
**Styling:** TailwindCSS (CDN)  
**Architektura:** Modulární, event-driven  
**Přístup:** Webový prohlížeč, responzivní design

---

## 2. Architektura a technologie

### 2.1 Technologický stack

#### Frontend
```javascript
- JavaScript ES6+ (modules, async/await, dynamic imports)
- TailwindCSS 3.x (utility-first CSS framework)
- Vanilla JS (bez frameworků jako React/Vue)
- SortableJS 1.15.0 (drag & drop)
```

#### Backend (Supabase)
```
- PostgreSQL databáze
- Supabase Auth (autentizace a autorizace)
- Supabase Storage (ukládání souborů)
- Row Level Security (RLS) policies
- Database triggers a funkce
```

#### Build & Deploy
```
- Žádný build proces (vanilla JS)
- Statické HTML soubory
- CDN pro dependencies
- Git-based deployment
```

### 2.2 Architektonické vzory

#### 2.2.1 Modulární architektura
Každý modul je samostatná jednotka s:
- **module.config.js** - manifest modulu
- **tiles/** - sekce se seznamy (přehledy)
- **forms/** - formuláře (detail, edit, create)
- **db/** - databázové operace (volitelně)

#### 2.2.2 Lazy loading
```javascript
// Moduly se načítají dynamicky podle potřeby
const imported = await import(`${path}?v=${Date.now()}`);
```

#### 2.2.3 Event-driven komunikace
```javascript
// Hash-based routing
window.addEventListener('hashchange', route);

// Custom events
window.dispatchEvent(new CustomEvent('openSearch'));
```

#### 2.2.4 Repository pattern
```javascript
// Centralizovaná databázová vrstva
import { listProfiles, updateProfile } from './db.js';
```

### 2.3 Datový tok

```
User Action → Hash Change → Router → Load Module → Render UI
     ↓                                      ↓
  Events                              DB Operations
     ↓                                      ↓
Update UI ← ← ← ← ← ← ← ← ← ← ← ← ← Response
```

---

## 3. Struktura souborů a adresářů

### 3.1 Kořenová úroveň

```
aplikace-v5/
├── index.html              # Přihlašovací stránka
├── app.html                # Hlavní aplikace
├── recover.html            # Reset hesla
├── styles.css              # Globální styly
├── package.json            # DevDependencies (ExcelJS)
├── .gitignore             # Git ignorované soubory
│
├── src/                    # Zdrojové kódy aplikace
├── docs/                   # Dokumentace
├── NEW/                    # Nová dokumentace
├── archive/                # Archivní dokumenty
└── README.md              # Hlavní dokumentace
```

### 3.2 Adresář src/ - detailní struktura

```
src/
├── app.js                  # Hlavní vstupní bod aplikace
├── supabase.js            # Inicializace Supabase klienta
├── auth.js                # Autentizační logika
├── db.js                  # Centrální databázová vrstva
│
├── app/                   # Aplikační jádro
│   ├── modules.index.js   # Registry modulů (seznam všech modulů)
│   └── app.render-shim.js # Pomocné renderovací funkce
│
├── modules/               # Všechny moduly aplikace
│   ├── 000-sablona/       # Šablona pro nové moduly
│   ├── 010-sprava-uzivatelu/
│   ├── 020-muj-ucet/
│   ├── 030-pronajimatel/
│   ├── 040-nemovitost/
│   ├── 050-najemnik/
│   ├── 060-smlouva/
│   ├── 070-sluzby/
│   └── 080-platby/
│
├── ui/                    # UI komponenty (přepoužitelné)
│   ├── actionButtons.js   # Akční tlačítka
│   ├── aresButton.js      # Integrace s ARES
│   ├── attachments.js     # Správa příloh
│   ├── breadcrumb.js      # Breadcrumb navigace
│   ├── commonActions.js   # Akční lišta (hlavní komponenta)
│   ├── content.js         # Dashboard a dlaždice
│   ├── form.js            # Univerzální formulář
│   ├── header.js          # Hlavička (deprecated)
│   ├── headerActions.js   # Akce v hlavičce
│   ├── history.js         # Historie změn (modal)
│   ├── homebutton.js      # Domovské tlačítko
│   ├── icons.js           # Ikony (emoji + SVG)
│   ├── masterTabsDetail.js # Master-detail tabs
│   ├── roles.js           # UI pro role
│   ├── sidebar.js         # Boční menu
│   ├── table.js           # Univerzální tabulka
│   ├── tabs.js            # Záložky
│   ├── theme.js           # Správa tématu
│   ├── unsaved-helper.js  # Ochrana neuložených změn
│   └── utils.js           # Pomocné funkce
│
├── db/                    # Databázové moduly
│   └── subjects.js        # DB operace pro subjekty
│
├── logic/                 # Business logika
│   └── actions.config.js  # Konfigurace akcí
│
├── security/              # Bezpečnost
│   └── permissions.js     # Systém oprávnění
│
└── services/              # Externí služby
    └── (prázdné)
```

### 3.3 Struktura typického modulu

```
modules/010-sprava-uzivatelu/
├── module.config.js       # Manifest modulu (POVINNÉ)
├── tiles/                 # Sekce se seznamy
│   └── prehled.js        # Přehledová tabulka
└── forms/                 # Formuláře
    ├── form.js           # Edit/Detail formulář
    ├── create.js         # Vytvoření nového záznamu
    └── role.js           # Správa rolí
```

---

## 4. Systém modulů

### 4.1 Koncept modulů

Modul je **samostatná funkční jednotka** aplikace, která:
- Má svůj **vlastní adresář** v `src/modules/`
- Má **manifest** (`module.config.js`)
- Obsahuje **tiles** (seznamy) a **forms** (formuláře)
- Je **registrován** v `src/app/modules.index.js`
- Je **lazy-loaded** při prvním použití

### 4.2 Module manifest (module.config.js)

Každý modul MUSÍ exportovat `getManifest()` funkci:

```javascript
// src/modules/010-sprava-uzivatelu/module.config.js
export async function getManifest() {
  return {
    id: '010-sprava-uzivatelu',    // Unikátní ID (= název adresáře)
    title: 'Uživatelé',             // Zobrazovaný název
    icon: 'users',                  // Ikona (emoji nebo SVG key)
    defaultTile: 'prehled',         // Výchozí sekce při otevření
    
    tiles: [                        // Seznamy/přehledy
      { id: 'prehled', title: 'Přehled', icon: 'list' }
    ],
    
    forms: [                        // Formuláře
      { id: 'form',   title: 'Formulář',      icon: 'form' },
      { id: 'create', title: 'Nový / Pozvat', icon: 'add'  },
      { id: 'role',   title: 'Role & barvy',  icon: 'settings' }
    ]
  };
}

export default { getManifest };
```

**Důležité vlastnosti:**
- `id` - musí odpovídat názvu adresáře
- `defaultTile` - ID výchozí sekce (ne defaultTitle!)
- `tiles` - pole objektů `{id, title, icon}`
- `forms` - pole objektů `{id, title, icon, showInSidebar?}`

### 4.3 Vnořené a kolapsibilní tiles

Moduly mohou mít **hierarchické seznamy**:

```javascript
tiles: [
  {
    id: 'prehled',
    title: 'Přehled pronajímatelů',
    icon: 'list',
    collapsible: true,         // Kolapsibilní sekce
    children: [                // Vnořené položky
      { id: 'osoba',  title: 'Osoba (15)', icon: 'person' },
      { id: 'osvc',   title: 'OSVČ (8)',   icon: 'briefcase' },
      { id: 'firma',  title: 'Firma (23)', icon: 'building' }
    ]
  }
]
```

### 4.4 Dynamické počty v manifestu

Manifest může načítat data z DB pro zobrazení počtů:

```javascript
export async function getManifest() {
  // Načti typy subjektů
  const { data: types } = await listSubjectTypes();
  
  // Načti počty
  const { data: counts } = await getSubjectsCountsByType({
    role: 'pronajimatel',
    showArchived: false
  });
  
  const countsMap = Object.fromEntries(
    (counts || []).map(c => [c.type, c.count])
  );
  
  // Vygeneruj children s počty
  const children = types.map(t => ({
    id: t.slug,
    title: `${t.label} (${countsMap[t.slug] || 0})`,
    icon: t.icon || 'person',
    count: countsMap[t.slug] || 0
  }));
  
  return { id: '030-pronajimatel', tiles: [/*...*/], /*...*/ };
}
```

### 4.5 Registry modulů

**Soubor:** `src/app/modules.index.js`

```javascript
export const MODULE_SOURCES = [
  () => import('../modules/010-sprava-uzivatelu/module.config.js'),
  () => import('../modules/020-muj-ucet/module.config.js'),
  () => import('../modules/030-pronajimatel/module.config.js'),
  () => import('../modules/040-nemovitost/module.config.js'),
  () => import('../modules/050-najemnik/module.config.js'),
  () => import('../modules/060-smlouva/module.config.js'),
  () => import('../modules/070-sluzby/module.config.js'),
  () => import('../modules/080-platby/module.config.js'),
  
  // Zakomentované (připravené k aktivaci):
  // () => import('../modules/090-finance/module.config.js'),
  // () => import('../modules/100-energie/module.config.js'),
  // () => import('../modules/110-udrzba/module.config.js'),
  // () => import('../modules/120-dokumenty/module.config.js'),
  // () => import('../modules/130-komunikace/module.config.js'),
  // () => import('../modules/900-nastaveni/module.config.js'),
  // () => import('../modules/990-help/module.config.js'),
];
```

**Proces inicializace:**

```javascript
// src/app.js
async function initModules() {
  for (const src of MODULE_SOURCES) {
    const mod = await src();               // Načti module.config.js
    const manifest = await mod.getManifest(); // Získej manifest
    
    registry.set(manifest.id, {           // Zaregistruj
      ...manifest,
      baseDir: '/src/modules/' + manifest.id
    });
  }
}
```

### 4.6 Tiles (sekce se seznamy)

**Účel:** Zobrazení přehledů, tabulek, seznamů

**Umístění:** `src/modules/{modul-id}/tiles/{tile-id}.js`

**Struktura:**

```javascript
// src/modules/010-sprava-uzivatelu/tiles/prehled.js
import { renderTable } from '../../../ui/table.js';
import { renderCommonActions } from '../../../ui/commonActions.js';
import { setBreadcrumb } from '../../../ui/breadcrumb.js';
import { listProfiles, archiveProfile } from '../../../db.js';

let selectedRow = null;
let showArchived = false;

export async function render(root) {
  // 1. Nastav breadcrumb
  setBreadcrumb(document.getElementById('crumb'), [
    { icon: 'home',  label: 'Domů',      href: '#/' },
    { icon: 'users', label: 'Uživatelé', href: '#/m/010-sprava-uzivatelu' },
    { icon: 'list',  label: 'Přehled' }
  ]);

  // 2. Připrav kontejner
  root.innerHTML = `<div id="user-table"></div>`;
  
  // 3. Načti data z DB
  const { data: users, error } = await listProfiles();
  if (error) {
    root.innerHTML = `<div class="p-4 text-red-600">Chyba: ${error.message}</div>`;
    return;
  }
  
  // 4. Filtruj archivované
  const rows = (users || []).filter(r => showArchived ? true : !r.archived);
  
  // 5. Definuj sloupce
  const columns = [
    { key: 'display_name', label: 'Jméno',  sortable: true },
    { key: 'email',        label: 'E-mail', sortable: true },
    { key: 'role',         label: 'Role',   sortable: true }
  ];
  
  // 6. Render tabulky
  renderTable(document.getElementById('user-table'), {
    columns,
    rows,
    options: {
      filterPlaceholder: 'Hledat uživatele…',
      onRowSelect: (row) => {
        selectedRow = row;
        drawActions();
      },
      onRowDblClick: (row) => {
        navigateTo(`#/m/010-sprava-uzivatelu/f/form?id=${row.id}`);
      }
    }
  });
  
  // 7. Render akcí
  drawActions();
}

function drawActions() {
  const ca = document.getElementById('commonactions');
  renderCommonActions(ca, {
    moduleActions: ['add', 'edit', 'archive', 'refresh'],
    handlers: {
      onAdd:     () => navigateTo('#/m/010-sprava-uzivatelu/f/create'),
      onEdit:    selectedRow ? () => navigateTo(`#/m/010-sprava-uzivatelu/f/form?id=${selectedRow.id}`) : undefined,
      onArchive: selectedRow ? () => handleArchive(selectedRow) : undefined,
      onRefresh: () => route()
    }
  });
}
```

### 4.7 Forms (formuláře)

**Účel:** Detail, editace, vytváření záznamů

**Umístění:** `src/modules/{modul-id}/forms/{form-id}.js`

**Struktura:**

```javascript
// src/modules/010-sprava-uzivatelu/forms/form.js
import { renderForm } from '../../../ui/form.js';
import { renderCommonActions } from '../../../ui/commonActions.js';
import { setBreadcrumb } from '../../../ui/breadcrumb.js';
import { getProfile, updateProfile } from '../../../db.js';
import { getMyProfile } from '../../../db.js';

export async function render(root, params = {}) {
  const userId = params.id;
  const mode = params.mode || 'read';  // read, edit
  
  // 1. Breadcrumb
  setBreadcrumb(document.getElementById('crumb'), [
    { icon: 'home',  label: 'Domů',      href: '#/' },
    { icon: 'users', label: 'Uživatelé', href: '#/m/010-sprava-uzivatelu/t/prehled' },
    { icon: 'form',  label: mode === 'edit' ? 'Úprava' : 'Detail' }
  ]);

  // 2. Načti data
  const { data: user, error } = await getProfile(userId);
  if (error || !user) {
    root.innerHTML = `<div class="p-4 text-red-600">Uživatel nenalezen</div>`;
    return;
  }
  
  // 3. Definuj pole formuláře
  const fields = [
    { key: 'display_name', label: 'Zobrazované jméno', type: 'text', required: true },
    { key: 'first_name',   label: 'Křestní jméno',      type: 'text' },
    { key: 'last_name',    label: 'Příjmení',           type: 'text' },
    { key: 'email',        label: 'E-mail',             type: 'email', required: true },
    { key: 'phone',        label: 'Telefon',            type: 'tel' },
    { key: 'role',         label: 'Role',               type: 'select', options: [
      { value: 'admin', label: 'Administrator' },
      { value: 'user',  label: 'Uživatel' },
      { value: 'viewer', label: 'Pouze prohlížení' }
    ]},
    { key: 'active',       label: 'Aktivní účet',       type: 'checkbox' },
    { key: 'created_at',   label: 'Vytvořeno',          type: 'datetime-local', readOnly: true },
    { key: 'updated_at',   label: 'Upraveno',           type: 'datetime-local', readOnly: true }
  ];
  
  // 4. Render formuláře
  root.innerHTML = '<div id="user-form"></div>';
  
  renderForm(
    document.getElementById('user-form'),
    fields,
    user,
    async (formData) => {
      const currentUser = await getMyProfile();
      const { data, error } = await updateProfile(userId, formData, currentUser.data);
      if (error) {
        alert('Chyba při ukládání: ' + error.message);
        return false;
      }
      alert('Uloženo');
      return true;
    },
    {
      mode: mode,
      showSubmit: mode === 'edit',
      sections: [
        { id: 'basic', label: 'Základní údaje', fields: ['display_name', 'first_name', 'last_name'] },
        { id: 'contact', label: 'Kontakty', fields: ['email', 'phone'] },
        { id: 'settings', label: 'Nastavení', fields: ['role', 'active'] },
        { id: 'audit', label: 'Audit', fields: ['created_at', 'updated_at'] }
      ]
    }
  );
  
  // 5. Akce
  renderCommonActions(document.getElementById('commonactions'), {
    moduleActions: mode === 'read' ? ['edit', 'history', 'attach'] : ['save', 'reject'],
    handlers: {
      onEdit: () => {
        const url = new URL(location.href);
        url.searchParams.set('mode', 'edit');
        location.href = url.toString();
      },
      onSave: () => {
        document.querySelector('#user-form form')?.requestSubmit();
      },
      onReject: () => history.back(),
      onHistory: () => showHistoryModal(getProfileHistory, userId),
      onAttach: () => showAttachmentsModal({ entity: 'users', entityId: userId })
    }
  });
}
```

---

## 5. UI komponenty a layout

### 5.1 Hlavní layout aplikace

**Soubor:** `app.html`

```html
<!doctype html>
<html lang="cs">
<head>
  <meta charset="utf-8" />
  <title>Pronajímatel – App</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="./styles.css" />
</head>
<body class="bg-slate-50 text-slate-900">

  <!-- ČERVENÁ: Horní pruh (header) -->
  <header class="flex items-center w-full px-6 pt-6 pb-2">
    <!-- Home button vlevo -->
    <div id="homebtnbox" class="w-72"></div>
    <div class="flex-1"></div>
    <!-- Header actions vpravo -->
    <div id="headeractions" class="flex items-center gap-3 pr-6"></div>
  </header>

  <div class="flex min-h-[calc(100vh-72px)] px-6 pb-6">
    <!-- ZELENÁ: Sidebar -->
    <aside class="flex flex-col items-start pt-2 w-72">
      <div id="sidebarbox" class="w-full"></div>
    </aside>

    <!-- MODRÁ + HNĚDÁ: Main panel -->
    <main class="flex-1 pl-6">
      <!-- MODRÁ: Breadcrumb + common actions -->
      <div class="flex items-start gap-4 mb-4">
        <div id="crumb" class="flex-1"></div>
        <div id="commonactions" class=""></div>
      </div>
      <!-- HNĚDÁ: Content panel -->
      <div id="content"></div>
    </main>
  </div>

  <script type="module" src="./src/app.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/Sortable.min.js"></script>
</body>
</html>
```

**Vysvětlení layoutu:**

```
┌──────────────────────────────────────────────────────────────┐
│ HEADER                                                        │
│ ┌──────────────┐                    ┌──────────────────────┐ │
│ │ 🏠 Domů btn  │    (flex-1)        │ Header Actions       │ │
│ └──────────────┘                    └──────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────────┐
│ ┌─────────────┐ ┌────────────────────────────────────────── │
│ │             │ │ BREADCRUMB               │ COMMON ACTIONS │ │
│ │             │ │ ───────────────────────────────────────── │
│ │   SIDEBAR   │ │                                           │ │
│ │             │ │                                           │ │
│ │   (w-72)    │ │          CONTENT AREA                     │ │
│ │             │ │          (flex-1)                         │ │
│ │             │ │                                           │ │
│ │             │ │                                           │ │
│ │             │ │                                           │ │
│ └─────────────┘ └────────────────────────────────────────── │
└──────────────────────────────────────────────────────────────┘
```

### 5.2 Kontejnery a jejich role

| Kontejner | ID | Účel | Renderuje |
|-----------|-----|------|-----------|
| **Header** | `#homebtnbox` | Domovské tlačítko | `renderHomeButton()` |
| **Header** | `#headeractions` | Akce v hlavičce (Hledat, Notif., Účet, Odhlásit) | `renderHeaderActions()` |
| **Sidebar** | `#sidebarbox` | Boční menu s moduly | `renderSidebar()` |
| **Main** | `#crumb` | Breadcrumb navigace | `setBreadcrumb()` |
| **Main** | `#commonactions` | Akční lišta (Add, Edit, Delete...) | `renderCommonActions()` |
| **Main** | `#content` | Hlavní obsah (tabulky, formuláře) | Dynamicky dle modulu |

---


## 6. Routing a navigace

### 6.1 Hash-based routing

Aplikace používá **hash-based routing** (SPA routing):

```
Formát URL:
#/m/{moduleId}/{type}/{sectionId}?{queryParams}

Příklady:
#/                                          → Dashboard
#/m/010-sprava-uzivatelu/t/prehled         → Tile (seznam)
#/m/010-sprava-uzivatelu/f/form?id=123     → Form s parametrem
#/m/040-nemovitost/t/prehled?type=osoba    → Tile s filtrem
```

### 6.2 Router implementace

**Soubor:** `src/app.js`

```javascript
export async function route() {
  const c = document.getElementById('content');
  const hash = location.hash || '#/';
  
  // Regex pro parsování hash
  const m = hash.match(/^#\/m\/([^/]+)\/(t|f)\/([^/?]+)(?:\?(.*))?$/);
  
  if (!m) {
    // Žádný match → Dashboard
    setBreadcrumb(crumb, [{ icon: 'home', label: 'Domů' }]);
    renderCommonActions(commonActions, {});
    renderDashboardTiles(c, Array.from(registry.values()));
    return;
  }
  
  // Extrakce parametrů
  const modId = m[1];      // '010-sprava-uzivatelu'
  const kind = m[2];       // 't' (tile) nebo 'f' (form)
  const section = m[3];    // 'prehled', 'form', ...
  const query = m[4] || '';
  
  // Najdi modul v registry
  const mod = registry.get(modId);
  if (!mod) {
    c.innerHTML = `<div class="text-red-600">Modul ${modId} nenalezen</div>`;
    return;
  }
  
  // Sestav cestu k souboru
  const rel = kind === 'f' ? `forms/${section}.js` : `tiles/${section}.js`;
  const path = `${mod.baseDir}/${rel}`;
  const pathWithCb = path + '?v=' + Date.now(); // Cache buster
  
  // Parsuj query parametry
  const params = { modId, kind, section };
  if (query) {
    for (const [k, v] of new URLSearchParams(query)) {
      params[k] = v;
    }
  }
  
  try {
    // Dynamicky načti modul
    const imported = await import(pathWithCb);
    
    // Najdi render funkci (různé formáty exportu)
    let renderFn = null;
    if (imported && typeof imported.render === 'function') {
      renderFn = imported.render;
    } else if (imported && typeof imported.default === 'function') {
      renderFn = imported.default;
    } else if (imported && imported.default && typeof imported.default.render === 'function') {
      renderFn = imported.default.render;
    }
    
    if (!renderFn) {
      c.innerHTML = `<div class="text-red-600">Render funkce nenalezena</div>`;
      return;
    }
    
    // Zavolej render s parametry
    await renderFn(c, params);
    
  } catch (err) {
    console.error('Route error:', err);
    c.innerHTML = `<div class="text-red-600">Chyba: ${err.message}</div>`;
  }
}

// Inicializace routingu
window.addEventListener('hashchange', route);
window.addEventListener('load', route);
```

### 6.3 Navigační funkce

```javascript
// Funkce pro navigaci (exportovaná globálně)
export function navigateTo(hash) {
  if (typeof hash !== 'string') return;
  location.hash = hash;
}

// Použití:
navigateTo('#/m/010-sprava-uzivatelu/t/prehled');
navigateTo('#/m/040-nemovitost/f/detail?id=abc-123');
```

### 6.4 Query parametry

Parametry se předávají v objektu `params`:

```javascript
export async function render(root, params = {}) {
  const id = params.id;          // z ?id=123
  const mode = params.mode;      // z ?mode=edit
  const filter = params.filter;  // z ?filter=osoba
  
  // Použij parametry...
}
```

---

## 7. Databázové entity a schéma

### 7.1 Přehled tabulek

| Tabulka | Modul | Účel | Sloupců | RLS |
|---------|-------|------|---------|-----|
| `profiles` | 010 | Uživatelské profily | ~19 | ✅ |
| `profiles_history` | 010 | Historie změn profilů | ~7 | ✅ |
| `user_permissions` | 010 | Granulární oprávnění | ~5 | ✅ |
| `roles` | 010 | Definice rolí | ~8 | ✅ |
| `subjects` | 030, 050 | Pronajímatelé, nájemníci | ~30 | ✅ |
| `subject_types` | 030, 050 | Typy subjektů | ~6 | ✅ |
| `subject_history` | 030, 050 | Historie změn subjektů | ~8 | ✅ |
| `user_subjects` | 030, 050 | Vazby uživatelů na subjekty | ~5 | ✅ |
| `properties` | 040 | Nemovitosti | ~35 | ✅ |
| `property_types` | 040 | Typy nemovitostí | ~5 | ✅ |
| `units` | 040 | Jednotky (byty, kanceláře) | ~30 | ✅ |
| `unit_types` | 040 | Typy jednotek | ~5 | ✅ |
| `attachments` | * | Přílohy k entitám | ~12 | ✅ |
| `audit_log` | * | Audit log | ~8 | ✅ |

### 7.2 Tabulka: profiles

**Účel:** Uživatelské profily (rozšíření Supabase Auth)

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(255),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  avatar_url TEXT,
  role VARCHAR(50) DEFAULT 'user',
  active BOOLEAN DEFAULT true,
  archived BOOLEAN DEFAULT false,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by VARCHAR(255),
  last_login TIMESTAMPTZ,
  -- Adresní údaje
  street VARCHAR(255),
  house_number VARCHAR(20),
  city VARCHAR(100),
  zip VARCHAR(10),
  birth_number VARCHAR(20),
  note TEXT
);

-- Indexy
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_active ON profiles(active);
CREATE INDEX idx_profiles_archived ON profiles(archived);
```

**RLS Policies:**

```sql
-- Čtení: všichni přihlášení
CREATE POLICY profiles_select ON profiles 
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Úprava: pouze vlastní profil nebo admin
CREATE POLICY profiles_update ON profiles 
  FOR UPDATE USING (
    auth.uid() = id 
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### 7.3 Tabulka: subjects

**Účel:** Pronajímatelé (030), Nájemníci (050), Zástupci

```sql
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  typ_subjektu VARCHAR(50) NOT NULL,  -- osoba, osvc, firma, spolek, stat, zastupce
  role VARCHAR(50) NOT NULL,          -- pronajimatel, najemnik, zastupce
  display_name VARCHAR(255) NOT NULL,
  
  -- Fyzická osoba
  jmeno VARCHAR(100),
  prijmeni VARCHAR(100),
  rodne_cislo VARCHAR(20),
  datum_narozeni DATE,
  
  -- Právnická osoba
  nazev_firmy VARCHAR(255),
  ico VARCHAR(20),
  dic VARCHAR(20),
  
  -- Kontakty
  primary_email VARCHAR(255),
  secondary_email VARCHAR(255),
  telefon VARCHAR(20),
  telefon_2 VARCHAR(20),
  
  -- Adresa
  ulice VARCHAR(255),
  cislo_popisne VARCHAR(20),
  mesto VARCHAR(100),
  psc VARCHAR(10),
  stat VARCHAR(100) DEFAULT 'ČR',
  
  -- Meta
  poznamka TEXT,
  archived BOOLEAN DEFAULT false,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by VARCHAR(255)
);

-- Indexy
CREATE INDEX idx_subjects_typ ON subjects(typ_subjektu);
CREATE INDEX idx_subjects_role ON subjects(role);
CREATE INDEX idx_subjects_archived ON subjects(archived);
CREATE INDEX idx_subjects_display_name ON subjects(display_name);
```

### 7.4 Tabulka: properties

**Účel:** Nemovitosti (budovy, pozemky)

```sql
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  typ_nemovitosti VARCHAR(50) NOT NULL,  -- bytovy-dum, rodinny-dum, ...
  nazev VARCHAR(255) NOT NULL,
  
  -- Adresa
  ulice VARCHAR(255),
  cislo_popisne VARCHAR(20),
  cislo_orientacni VARCHAR(20),
  mesto VARCHAR(100),
  cast_obce VARCHAR(100),
  psc VARCHAR(10),
  stat VARCHAR(100) DEFAULT 'ČR',
  
  -- Katastrální údaje
  katastralni_uzemi VARCHAR(255),
  cislo_parcely VARCHAR(50),
  cislo_listu_vlastnictvi VARCHAR(50),
  
  -- Technické údaje
  celkova_plocha DECIMAL(10,2),
  pocet_podlazi INTEGER,
  rok_vystavby INTEGER,
  rok_rekonstrukce INTEGER,
  
  -- Vazby
  vlastnik_id UUID REFERENCES subjects(id),  -- Vazba na pronajímatele
  
  -- Poznámky
  popis TEXT,
  poznamka TEXT,
  
  -- Meta
  archived BOOLEAN DEFAULT false,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by VARCHAR(255)
);

-- Indexy
CREATE INDEX idx_properties_typ ON properties(typ_nemovitosti);
CREATE INDEX idx_properties_vlastnik ON properties(vlastnik_id);
CREATE INDEX idx_properties_archived ON properties(archived);
```

### 7.5 Tabulka: units

**Účel:** Jednotky nemovitostí (byty, kanceláře, garáže)

```sql
CREATE TABLE units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  typ_jednotky VARCHAR(50) NOT NULL,  -- byt, kancelar, garaz, ...
  
  -- Identifikace
  cislo_jednotky VARCHAR(50),
  nazev VARCHAR(255),
  
  -- Parametry
  dispozice VARCHAR(50),      -- 2+kk, 3+1, ...
  plocha DECIMAL(10,2),        -- m²
  podlazi INTEGER,
  stav VARCHAR(50),            -- volny, obsazeny, rekonstrukce
  
  -- Nájemní údaje
  najemnik_id UUID REFERENCES subjects(id),
  smlouva_id UUID,  -- Vazba na smlouvu (připraveno)
  mesicni_najem DECIMAL(10,2),
  kauce DECIMAL(10,2),
  datum_zahajeni_najmu DATE,
  datum_ukonceni_najmu DATE,
  
  -- Poznámky
  popis TEXT,
  poznamka TEXT,
  
  -- Meta
  archived BOOLEAN DEFAULT false,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by VARCHAR(255)
);

-- Indexy
CREATE INDEX idx_units_property ON units(property_id);
CREATE INDEX idx_units_typ ON units(typ_jednotky);
CREATE INDEX idx_units_najemnik ON units(najemnik_id);
CREATE INDEX idx_units_stav ON units(stav);
CREATE INDEX idx_units_archived ON units(archived);
```

### 7.6 Tabulka: attachments

**Účel:** Přílohy k jakékoli entitě

```sql
CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity VARCHAR(100) NOT NULL,      -- 'users', 'subjects', 'properties', ...
  entity_id UUID NOT NULL,
  
  -- Soubor
  filename VARCHAR(500) NOT NULL,
  original_filename VARCHAR(500),
  file_path TEXT,                     -- Cesta ve Storage
  file_size BIGINT,
  mime_type VARCHAR(100),
  
  -- Metadata
  description TEXT,
  category VARCHAR(100),              -- 'smlouva', 'foto', 'dokument', ...
  
  -- Meta
  archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);

-- Indexy
CREATE INDEX idx_attachments_entity ON attachments(entity, entity_id);
CREATE INDEX idx_attachments_archived ON attachments(archived);
```

### 7.7 Historie změn (pattern)

**Princip:** Pro každou hlavní entitu existuje tabulka `{entity}_history`

```sql
CREATE TABLE profiles_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  field VARCHAR(100) NOT NULL,
  old_value TEXT,
  new_value TEXT,
  changed_by VARCHAR(255),
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Obdobně:
-- subject_history
-- property_history (připraveno)
-- unit_history (připraveno)
```

---

## 8. Bezpečnost a oprávnění

### 8.1 Systém oprávnění

**Soubor:** `src/security/permissions.js`

### 8.1.1 Role-based permissions (RBAC)

```javascript
// Výchozí oprávnění podle role
const ROLE_PERMISSIONS = {
  admin: [
    'add', 'edit', 'archive', 'attach', 'refresh',
    'detail', 'search', 'print', 'export', 'import',
    'delete', 'approve', 'reject',
    'save', 'invite', 'history', 'units'
  ],
  pronajimatel: [
    'add', 'edit', 'attach', 'refresh', 
    'detail', 'search', 'print', 'units'
  ],
  najemnik: [
    'detail', 'refresh', 'search'
  ],
  servisak: [
    'detail', 'refresh', 'attach'
  ]
};
```

### 8.1.2 Dynamické načítání oprávnění

```javascript
// Registrace loaderu
registerPermissionsLoader(async (role) => {
  const { data } = await getRolePermissions(role);
  return data; // pole stringů ['add', 'edit', ...]
});

// Načtení oprávnění pro roli
const perms = await loadPermissionsForRole('admin');
// → ['add', 'edit', 'archive', ...]
```

### 8.1.3 Kontrola oprávnění

```javascript
// Získání povolených akcí
const allowed = getAllowedActions(userRole, ['add', 'edit', 'delete']);
// → [{ key: 'add', icon: 'add', label: 'Přidat' }, ...]

// Kontrola jednotlivého oprávnění
const canEdit = getUserPermissions(userRole).includes('edit');
```

### 8.2 Row Level Security (RLS)

Supabase databáze používá RLS policies pro zabezpečení dat:

```sql
-- Příklad: profiles tabulka

-- Všichni přihlášení mohou číst profily
CREATE POLICY profiles_select ON profiles 
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Pouze admin nebo vlastník může upravit
CREATE POLICY profiles_update ON profiles 
  FOR UPDATE USING (
    auth.uid() = id 
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Pouze admin může smazat
CREATE POLICY profiles_delete ON profiles 
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### 8.3 Autentizace

**Soubor:** `index.html` + `src/auth.js`

```javascript
// Přihlášení
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
});

// Registrace
const { data, error } = await supabase.auth.signUp({
  email,
  password
});

// Resetování hesla
const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: location.origin + '/recover.html'
});

// Odhlášení (hard logout s purge)
async function hardLogout() {
  // Lokální signOut
  await supabase.auth.signOut({ scope: 'local' });
  
  // Globální signOut (best effort)
  try {
    await supabase.auth.signOut();
  } catch (e) {}
  
  // Vyčisti localStorage/sessionStorage
  const purge = (store) => {
    const keys = [];
    for (let i = 0; i < store.length; i++) {
      const k = store.key(i);
      if (k && k.startsWith('sb-')) keys.push(k);
    }
    keys.forEach(k => store.removeItem(k));
  };
  purge(localStorage);
  purge(sessionStorage);
  
  // Reload na index
  window.location.replace('./index.html?_=' + Date.now());
}
```

### 8.4 Ochrana neuložených změn

**Soubor:** `src/ui/unsaved-helper.js`

```javascript
// Aktivace ochrany při změně formuláře
const form = document.querySelector('form');
let hasChanges = false;

form.addEventListener('input', () => {
  hasChanges = true;
});

window.addEventListener('beforeunload', (e) => {
  if (hasChanges) {
    e.preventDefault();
    e.returnValue = 'Máte neuložené změny. Opravdu chcete odejít?';
  }
});

// Deaktivace po uložení
form.addEventListener('submit', () => {
  hasChanges = false;
});
```

---

## 9. Vzory a šablony

### 9.1 Šablonový modul

**Umístění:** `src/modules/000-sablona/`

Slouží jako **vzor pro nové moduly**. Obsahuje:
- `module.config.js` - vzorový manifest
- `tiles/prehled.js` - vzorový seznam
- `forms/form.js` - vzorový formulář
- `forms/detail.js` - vzorový detail
- `db.js` - vzorové DB operace

### 9.2 Referenční modul

**Modul 010 - Správa uživatelů** je **referenční implementace**:
- ✅ Kompletní manifest
- ✅ Seznam s filtrem a archivací
- ✅ Formulář s validací
- ✅ Historie změn
- ✅ Přílohy
- ✅ CommonActions
- ✅ Breadcrumbs
- ✅ Oprávnění

**Doporučení:** Při tvorbě nového modulu použij 010 jako vzor.

### 9.3 Vzorové struktury

#### 9.3.1 Vzor: Seznam (tile)

```javascript
import { renderTable } from '../../../ui/table.js';
import { renderCommonActions } from '../../../ui/commonActions.js';
import { setBreadcrumb } from '../../../ui/breadcrumb.js';
import { listEntities, archiveEntity } from '../../../db.js';

let selectedRow = null;
let showArchived = false;

export async function render(root) {
  // 1. Breadcrumb
  setBreadcrumb(document.getElementById('crumb'), [
    { icon: 'home', label: 'Domů', href: '#/' },
    { icon: 'module', label: 'Modul', href: '#/m/module-id' },
    { icon: 'list', label: 'Přehled' }
  ]);

  // 2. Načti data
  const { data, error } = await listEntities();
  if (error) {
    root.innerHTML = `<div class="p-4 text-red-600">Chyba: ${error.message}</div>`;
    return;
  }

  // 3. Filtruj archivované
  const rows = (data || []).filter(r => showArchived ? true : !r.archived);

  // 4. Definuj sloupce
  const columns = [
    { key: 'name', label: 'Název', sortable: true },
    { key: 'email', label: 'E-mail', sortable: true }
  ];

  // 5. Render
  root.innerHTML = '<div id="table-container"></div>';
  renderTable(document.getElementById('table-container'), {
    columns,
    rows,
    options: {
      filterPlaceholder: 'Hledat...',
      onRowSelect: (row) => { selectedRow = row; drawActions(); },
      onRowDblClick: (row) => navigateTo(`#/m/module-id/f/detail?id=${row.id}`)
    }
  });

  drawActions();
}

function drawActions() {
  renderCommonActions(document.getElementById('commonactions'), {
    moduleActions: ['add', 'edit', 'archive', 'refresh'],
    handlers: {
      onAdd: () => navigateTo('#/m/module-id/f/create'),
      onEdit: selectedRow ? () => navigateTo(`#/m/module-id/f/form?id=${selectedRow.id}`) : undefined,
      onArchive: selectedRow ? () => handleArchive(selectedRow) : undefined,
      onRefresh: () => route()
    }
  });
}

async function handleArchive(row) {
  if (!confirm('Opravdu archivovat?')) return;
  await archiveEntity(row.id);
  route();
}
```

#### 9.3.2 Vzor: Formulář (form)

```javascript
import { renderForm } from '../../../ui/form.js';
import { renderCommonActions } from '../../../ui/commonActions.js';
import { setBreadcrumb } from '../../../ui/breadcrumb.js';
import { getEntity, updateEntity } from '../../../db.js';

export async function render(root, params = {}) {
  const id = params.id;
  const mode = params.mode || 'read';

  // 1. Breadcrumb
  setBreadcrumb(document.getElementById('crumb'), [
    { icon: 'home', label: 'Domů', href: '#/' },
    { icon: 'module', label: 'Modul', href: '#/m/module-id/t/prehled' },
    { icon: 'form', label: mode === 'edit' ? 'Úprava' : 'Detail' }
  ]);

  // 2. Načti data
  const { data, error } = await getEntity(id);
  if (error || !data) {
    root.innerHTML = `<div class="p-4 text-red-600">Záznam nenalezen</div>`;
    return;
  }

  // 3. Pole formuláře
  const fields = [
    { key: 'name', label: 'Název', type: 'text', required: true },
    { key: 'email', label: 'E-mail', type: 'email', required: true },
    { key: 'phone', label: 'Telefon', type: 'tel' },
    { key: 'created_at', label: 'Vytvořeno', type: 'datetime-local', readOnly: true }
  ];

  // 4. Render formuláře
  root.innerHTML = '<div id="form-container"></div>';
  renderForm(
    document.getElementById('form-container'),
    fields,
    data,
    async (formData) => {
      const { data, error } = await updateEntity(id, formData);
      if (error) {
        alert('Chyba: ' + error.message);
        return false;
      }
      alert('Uloženo');
      return true;
    },
    {
      mode: mode,
      showSubmit: mode === 'edit',
      sections: [
        { id: 'basic', label: 'Základní údaje', fields: ['name', 'email', 'phone'] },
        { id: 'audit', label: 'Audit', fields: ['created_at'] }
      ]
    }
  );

  // 5. Akce
  renderCommonActions(document.getElementById('commonactions'), {
    moduleActions: mode === 'read' ? ['edit', 'history'] : ['save', 'reject'],
    handlers: {
      onEdit: () => {
        location.hash += (location.hash.includes('?') ? '&' : '?') + 'mode=edit';
      },
      onSave: () => document.querySelector('form')?.requestSubmit(),
      onReject: () => history.back(),
      onHistory: () => showHistoryModal(getEntityHistory, id)
    }
  });
}
```

---


## 10. CommonActions - akční lišta

### 10.1 Účel a umístění

**CommonActions** je **hlavní akční lišta** zobrazující dostupné akce nad daty.

**Soubor:** `src/ui/commonActions.js`  
**Kontejner:** `#commonactions` (v hlavním panelu vedle breadcrumb)

### 10.2 Katalog akcí

```javascript
const CATALOG = {
  detail:  { key: 'detail',  icon: 'detail',     label: 'Detail',    title: 'Zobrazit detail' },
  add:     { key: 'add',     icon: 'add',        label: 'Přidat',    title: 'Přidat nový záznam' },
  edit:    { key: 'edit',    icon: 'edit',       label: 'Upravit',   title: 'Upravit záznam' },
  delete:  { key: 'delete',  icon: 'delete',     label: 'Smazat',    title: 'Smazat záznam' },
  archive: { key: 'archive', icon: 'archive',    label: 'Archivovat',title: 'Přesunout do archivu' },
  attach:  { key: 'attach',  icon: 'paperclip',  label: 'Přílohy',   title: 'Zobrazit přílohy' },
  refresh: { key: 'refresh', icon: 'refresh',    label: 'Obnovit',   title: 'Obnovit data' },
  search:  { key: 'search',  icon: 'search',     label: 'Hledat',    title: 'Hledat / filtrovat' },
  approve: { key: 'approve', icon: 'save',       label: 'Uložit',    title: 'Uložit a zůstat' },
  reject:  { key: 'reject',  icon: 'reject',     label: 'Zpět',      title: 'Zpět bez uložení' },
  invite:  { key: 'invite',  icon: 'invite',     label: 'Pozvat',    title: 'Odeslat pozvánku' },
  send:    { key: 'send',    icon: 'send',       label: 'Odeslat',   title: 'Odeslat dokument' },
  export:  { key: 'export',  icon: 'export',     label: 'Export',    title: 'Exportovat' },
  import:  { key: 'import',  icon: 'import',     label: 'Import',    title: 'Importovat' },
  print:   { key: 'print',   icon: 'print',      label: 'Tisk',      title: 'Vytisknout' },
  star:    { key: 'star',    icon: 'star',       label: 'Oblíbené',  title: 'Přidat/odebrat' },
  history: { key: 'history', icon: 'history',    label: 'Historie',  title: 'Historie změn' },
  units:   { key: 'units',   icon: 'grid',       label: 'Jednotky',  title: 'Správa jednotek' },
  wizard:  { key: 'wizard',  icon: 'compass',    label: 'Průvodce',  title: 'Spustit průvodce' }
};
```

### 10.3 Použití

```javascript
renderCommonActions(rootElement, {
  moduleActions: ['add', 'edit', 'archive', 'refresh'],  // Požadované akce
  userRole: 'admin',                                      // Role uživatele
  handlers: {                                             // Event handlery
    onAdd: () => navigateTo('#/m/module-id/f/create'),
    onEdit: () => navigateTo('#/m/module-id/f/form?id=123'),
    onArchive: () => handleArchive(),
    onRefresh: () => route()
  },
  isStarred: false                                        // Pro akci 'star'
});
```

### 10.4 Automatické odvození akcí

Pokud nepředáš `moduleActions`, odvozují se z názvů handlerů:

```javascript
// Automaticky odvozeno: ['add', 'edit', 'archive']
renderCommonActions(rootElement, {
  handlers: {
    onAdd: () => {},
    onEdit: () => {},
    onArchive: () => {}
  }
});
```

### 10.5 Řazení akcí

Akce se řadí podle preferovaného pořadí:

```javascript
const PREFERRED_ORDER = [
  'save', 'approve', 'add', 'edit', 'invite', 'send', 'attach', 'units', 'history',
  'refresh', 'search', 'print', 'export', 'import', 'archive', 'delete',
  'reject', 'exit', 'star', 'detail'
];
```

Akce `reject` a `exit` jsou **vždy poslední**.

### 10.6 Integrace s oprávněními

CommonActions automaticky kontroluje oprávnění:

```javascript
const allowed = getAllowedActions(userRole, wantedKeys);
// Pouze povolené akce se zobrazí jako aktivní
```

### 10.7 Vizuální reprezentace

```
┌────────────────────────────────────────────────────────┐
│ Domů › Uživatelé › Přehled    [+] [✎] [📦] [↻] [⭐]    │
│                                 │   │   │    │   │      │
│                             Přidat Edit Arch Reload Star│
└────────────────────────────────────────────────────────┘
```

- Aktivní akce: **bílé pozadí, tmavá ikona**
- Neaktivní: **šedá, opacity 40%, disabled**
- Hover: **světle modrá**

---

## 11. Header - hlavička aplikace

### 11.1 Struktura

**Kontejnery:**
- `#homebtnbox` - Domovské tlačítko (vlevo)
- `#headeractions` - Akce (vpravo)

### 11.2 Home Button

**Soubor:** `src/ui/homebutton.js`

```javascript
renderHomeButton(container, {
  appName: 'Pronajímatel',
  onHome: () => {
    setBreadcrumb(crumb, [{ icon: 'home', label: 'Domů' }]);
    renderCommonActions(commonactions, {});
    renderDashboardTiles(content, Array.from(registry.values()));
  }
});
```

**Vzhled:**
```
┌────────────────────┐
│ 🏠 Pronajímatel    │
└────────────────────┘
```

### 11.3 Header Actions

**Soubor:** `src/ui/headerActions.js`

**Zobrazuje:**
1. **Jméno uživatele** (display_name nebo email)
2. **Ikona Hledat** (🔍) - spustí event `openSearch`
3. **Ikona Notifikace** (🔔) - spustí event `openNotifications`
4. **Ikona Účet** (👤) - navigace na `#/m/020-muj-ucet/f/form`
5. **Tlačítko Odhlásit** - zavolá `hardLogout()`

**Vizuální reprezentace:**
```
┌──────────────────────────────────────────────┐
│ Jan Novák   🔍  🔔  👤  [Odhlásit]          │
└──────────────────────────────────────────────┘
```

---

## 12. Sidebar - boční menu

### 12.1 Účel

Sidebar zobrazuje **navigaci mezi moduly a sekcemi**.

**Soubor:** `src/ui/sidebar.js`  
**Kontejner:** `#sidebarbox`

### 12.2 Struktura

```
┌─────────────────────┐
│ ▶️ 👥 Uživatelé      │ ← Modul (tlačítko)
│   📋 Přehled         │ ← Tile (odkaz)
│   📝 Nový/Pozvat     │ ← Form (odkaz)
│                     │
│ ▼ 🏠 Pronajímatel   │ ← Rozbalený modul
│   ▶️ Přehled pronaj. │ ← Kolapsibilní tile
│     👤 Osoba (15)    │ ← Vnořený child tile
│     💼 OSVČ (8)      │
│     🏢 Firma (23)    │
│   ⚙️ Správa typů     │ ← Form
│                     │
│ ▶️ 🏢 Nemovitost     │ ← Sbalený modul
└─────────────────────┘
```

### 12.3 Stavy

1. **Sbalený modul** - zobrazuje jen název a ikonu
2. **Rozbalený modul** - zobrazuje tiles a forms
3. **Aktivní sekce** - zvýrazněna modrou
4. **Kolapsibilní tiles** - lze rozkliknout na children

### 12.4 Interakce

- **Klik na modul** → rozbalí a otevře defaultTile
- **Klik na tile** → navigace na `#/m/{modId}/t/{tileId}`
- **Klik na form** → navigace na `#/m/{modId}/f/{formId}`
- **Klik na kolapsibilní tile** → toggle children

### 12.5 Automatické otevření

Sidebar automaticky rozbalí aktivní modul podle URL hash:

```javascript
// URL: #/m/030-pronajimatel/t/osoba
// → Rozbalí modul '030-pronajimatel'
// → Zvýrazní tile 'osoba'
// → Rozbalí parent tile, pokud je 'osoba' child
```

### 12.6 Vnořené struktury

```javascript
tiles: [
  {
    id: 'prehled',
    title: 'Přehled',
    icon: 'list',
    collapsible: true,      // Umožní collapse/expand
    children: [
      { id: 'osoba', title: 'Osoba (15)', icon: 'person' },
      { id: 'firma', title: 'Firma (23)', icon: 'building' }
    ]
  }
]
```

---

## 13. Breadcrumb - navigace

### 13.1 Účel

Breadcrumb zobrazuje **navigační cestu** od domovské stránky k aktuální sekci.

**Soubor:** `src/ui/breadcrumb.js`  
**Kontejner:** `#crumb`

### 13.2 Použití

```javascript
setBreadcrumb(container, [
  { icon: 'home',  label: 'Domů',      href: '#/' },
  { icon: 'users', label: 'Uživatelé', href: '#/m/010-sprava-uzivatelu' },
  { icon: 'list',  label: 'Přehled' }
]);
```

**Výsledek:**
```
🏠 Domů › 👥 Uživatelé › 📋 Přehled
```

### 13.3 Vlastnosti položek

| Vlastnost | Povinné | Popis |
|-----------|---------|-------|
| `icon` | ❌ | Ikona (emoji nebo SVG key) |
| `label` | ✅ | Text položky |
| `href` | ❌ | Odkaz (pokud není, není klikací) |

### 13.4 Styling

- **Aktivní položka** (poslední): opacity 70%, není klikací
- **Ostatní položky**: klikací odkazy s `hover:underline`
- **Separator**: `›` mezi položkami

---

## 14. Tabulky

### 14.1 Účel

Univerzální komponenta pro zobrazení **tabulek s daty**.

**Soubor:** `src/ui/table.js`

### 14.2 Funkce

- ✅ Řazení podle sloupců
- ✅ Fulltextové filtrování (bez diakritiky)
- ✅ Výběr řádku (single selection)
- ✅ Dvojklik na řádek
- ✅ Vlastní renderování buněk
- ✅ Custom header
- ✅ Konfigurovatelné pořadí sloupců

### 14.3 Použití

```javascript
renderTable(rootElement, {
  columns: [
    { 
      key: 'name', 
      label: 'Jméno', 
      sortable: true,
      width: '30%',
      render: (row) => `<strong>${row.name}</strong>`
    },
    { key: 'email', label: 'E-mail', sortable: true },
    { key: 'role', label: 'Role', sortable: false }
  ],
  rows: [
    { id: 1, name: 'Jan Novák', email: 'jan@example.com', role: 'admin' },
    { id: 2, name: 'Eva Smith', email: 'eva@example.com', role: 'user' }
  ],
  options: {
    filterPlaceholder: 'Hledat...',
    showFilter: true,
    filterValue: '',
    selectedRow: null,
    onRowSelect: (row) => {
      console.log('Vybrán:', row);
    },
    onRowDblClick: (row) => {
      navigateTo(`#/m/module/f/detail?id=${row.id}`);
    },
    columnsOrder: ['name', 'role', 'email'],  // Vlastní pořadí
    customHeader: ({ filterInputHtml }) => `
      <div class="flex gap-2">
        ${filterInputHtml}
        <button>Export</button>
      </div>
    `
  }
});
```

### 14.4 Struktura

```
┌────────────────────────────────────────────┐
│ [Filtrovat...]                    [Export] │ ← Header
├────────────────────────────────────────────┤
│ Jméno ▲      │ E-mail       │ Role         │ ← Thead (klikací)
├──────────────┼──────────────┼──────────────┤
│ Jan Novák    │ jan@ex.com   │ admin        │ ← Tbody
│ Eva Smith    │ eva@ex.com   │ user         │
└────────────────────────────────────────────┘
```

### 14.5 Interní stav

```javascript
const state = {
  sortKey: 'name',      // Aktuální klíč pro řazení
  sortDir: 'asc',       // 'asc' nebo 'desc'
  filter: '',           // Aktuální filtr
  selectedId: null      // ID vybraného řádku
};
```

### 14.6 Filtrování bez diakritiky

```javascript
function normalize(str) {
  return (str ?? '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

// 'Čeština' → 'cestina'
```

---

## 15. Formuláře

### 15.1 Účel

Univerzální komponenta pro **renderování formulářů**.

**Soubor:** `src/ui/form.js`

### 15.2 Funkce

- ✅ Responsive grid layout (1-2 sloupce)
- ✅ Záložky (tabs) pro sekce
- ✅ Podpora read-only režimu
- ✅ Automatická konverze prázdných stringů na `null`
- ✅ Filtrace auditních polí při submitu
- ✅ Validace (HTML5 + custom)

### 15.3 Použití

```javascript
renderForm(
  rootElement,
  fields,           // Pole definic polí
  initialData,      // Počáteční data
  onSubmit,         // Callback při submitu
  options           // Konfigurační možnosti
);
```

### 15.4 Definice polí

```javascript
const fields = [
  {
    key: 'display_name',
    label: 'Zobrazované jméno',
    type: 'text',
    required: true,
    placeholder: 'Zadejte jméno',
    helpText: 'Toto jméno se zobrazí všude v aplikaci'
  },
  {
    key: 'email',
    label: 'E-mail',
    type: 'email',
    required: true,
    pattern: '[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$'
  },
  {
    key: 'role',
    label: 'Role',
    type: 'select',
    required: true,
    options: [
      { value: 'admin', label: 'Administrator' },
      { value: 'user', label: 'Uživatel' }
    ]
  },
  {
    key: 'active',
    label: 'Aktivní účet',
    type: 'checkbox'
  },
  {
    key: 'birth_date',
    label: 'Datum narození',
    type: 'date'
  },
  {
    key: 'note',
    label: 'Poznámka',
    type: 'textarea',
    rows: 4
  },
  {
    key: 'created_at',
    label: 'Vytvořeno',
    type: 'datetime-local',
    readOnly: true  // Jen pro čtení
  }
];
```

### 15.5 Typy polí

| Type | HTML element | Poznámka |
|------|--------------|----------|
| `text` | `<input type="text">` | Základní text |
| `email` | `<input type="email">` | E-mail s validací |
| `tel` | `<input type="tel">` | Telefon |
| `number` | `<input type="number">` | Číslo |
| `date` | `<input type="date">` | Datum |
| `datetime-local` | `<input type="datetime-local">` | Datum + čas |
| `time` | `<input type="time">` | Čas |
| `checkbox` | `<input type="checkbox">` | Zaškrtávátko |
| `select` | `<select>` | Výběr z možností |
| `textarea` | `<textarea>` | Víceřádkový text |

### 15.6 Options

```javascript
{
  readOnly: false,           // Celý formulář jen pro čtení
  mode: 'edit',              // 'read', 'edit', 'create'
  showSubmit: true,          // Zobrazit tlačítko Uložit
  submitLabel: 'Uložit',     // Text tlačítka
  
  layout: {
    columns: {               // Počet sloupců podle breakpointu
      base: 1,               // Mobile
      md: 2,                 // Tablet
      xl: 2                  // Desktop
    },
    density: 'compact'       // 'compact' nebo 'comfortable'
  },
  
  sections: [                // Záložky
    { 
      id: 'basic', 
      label: 'Základní údaje', 
      fields: ['display_name', 'email'] 
    },
    { 
      id: 'settings', 
      label: 'Nastavení', 
      fields: ['role', 'active'] 
    }
  ]
}
```

### 15.7 OnSubmit callback

```javascript
async function onSubmit(formData) {
  // formData obsahuje pouze non-audit pole
  // prázdné stringy jsou konvertovány na null
  
  const { data, error } = await updateEntity(id, formData);
  
  if (error) {
    alert('Chyba: ' + error.message);
    return false;  // Zůstat ve formuláři
  }
  
  alert('Uloženo');
  return true;     // Úspěch
}
```

### 15.8 Auditní pole (filtrována při submitu)

```javascript
const AUDIT_FIELDS = [
  'created_at',
  'updated_at',
  'last_login',
  'updated_by'
];

// Tato pole se NEZASÍLAJÍ na server při uložení
```

---

## 16. Historie změn

### 16.1 Účel

Zobrazení **historie změn** pro konkrétní entitu.

**Soubor:** `src/ui/history.js`

### 16.2 Použití

```javascript
import { showHistoryModal } from '/src/ui/history.js';
import { getProfileHistory } from '/src/db.js';

// Zobraz historii
showHistoryModal(
  getProfileHistory,  // Funkce pro načtení historie
  userId,             // ID entity
  {                   // Překlad názvů polí (volitelné)
    display_name: 'Zobrazované jméno',
    email: 'E-mail',
    role: 'Role'
  }
);
```

### 16.3 Struktura dat

Historie očekává pole objektů:

```javascript
[
  {
    field: 'display_name',
    old_value: 'Jan Novák',
    new_value: 'Jan Novák ml.',
    changed_by: 'admin@example.com',
    changed_at: '2025-11-07T10:30:00Z'
  },
  {
    field: 'role',
    old_value: 'user',
    new_value: 'admin',
    changed_by: 'superadmin',
    changed_at: '2025-11-07T11:00:00Z'
  }
]
```

### 16.4 Vizuální reprezentace

```
┌─────────────────────────────────────────────────────┐
│ Historie změn                               [×]     │
├─────────────────────────────────────────────────────┤
│ Pole         │ Původní  │ Nová      │ Upravil │ Kdy │
├──────────────┼──────────┼───────────┼─────────┼─────┤
│ Jméno        │ Jan Novák│ Jan Novák │ admin   │ ... │
│              │          │ ml.       │         │     │
│ Role         │ user     │ admin     │ super   │ ... │
└─────────────────────────────────────────────────────┘
```

### 16.5 Databázové funkce

```javascript
// db.js
export async function logProfileHistory(profileId, currentUser, oldData, newData) {
  const inserts = [];
  
  for (const key of Object.keys(newData)) {
    if (oldData[key] !== newData[key]) {
      inserts.push({
        profile_id: profileId,
        field: key,
        old_value: String(oldData[key] ?? ''),
        new_value: String(newData[key] ?? ''),
        changed_by: currentUser?.display_name || currentUser?.email,
        changed_at: new Date().toISOString()
      });
    }
  }
  
  if (inserts.length) {
    const { data, error } = await supabase
      .from('profiles_history')
      .insert(inserts);
    return { data, error };
  }
  
  return { data: null, error: null };
}
```

---

## 17. Přílohy

### 17.1 Účel

Správa **příloh** (souborů) přiřazených k entitám.

**Soubor:** `src/ui/attachments.js`

### 17.2 Použití

```javascript
import { showAttachmentsModal } from '../../../ui/attachments.js';

// Zobraz modal s přílohami
showAttachmentsModal({
  entity: 'users',       // Název entity ('users', 'subjects', 'properties', ...)
  entityId: userId       // ID entity
});
```

### 17.3 Funkce

- ✅ Nahrání souborů
- ✅ Auto-přejmenování (sanitizace názvů)
- ✅ Úprava metadat (popis, kategorie)
- ✅ Archivace příloh
- ✅ Zobrazení archivovaných
- ✅ Stahování souborů
- ✅ Tabulkový přehled

### 17.4 Vizuální reprezentace

```
┌──────────────────────────────────────────────────────┐
│ Přílohy                                      [×]     │
├──────────────────────────────────────────────────────┤
│ [Přidat přílohu] ☑ Auto-přejmenovat ☐ Archivované   │
│                           [Upravit] [Archivovat]     │
├──────────────────────────────────────────────────────┤
│ ☐│ Název souboru  │ Popis        │ Vloženo   │ Stav │
├──┼────────────────┼──────────────┼───────────┼──────┤
│ ☑│ smlouva.pdf    │ Nájemní smlo │ 7.11.2025 │ OK   │
│ ☐│ foto.jpg       │ Foto bytu    │ 6.11.2025 │ OK   │
└──────────────────────────────────────────────────────┘
```

### 17.5 Flow nahrání souboru

```
1. Uživatel vybere soubor
   ↓
2. createTempUpload()
   → Nahrání do Supabase Storage (bucket: 'temp-uploads')
   ↓
3. Auto-sanitizace názvu (volitelné)
   → 'Smlouva č. 123.pdf' → 'smlouva-c-123.pdf'
   ↓
4. createAttachmentFromUpload()
   → Přesun z temp do finální bucket
   → Vytvoření záznamu v tabulce attachments
   ↓
5. Zobrazení v tabulce
```

### 17.6 Databázové funkce

```javascript
// Nahrání temporary upload
export async function createTempUpload(file) {
  const tempPath = `temp/${Date.now()}_${file.name}`;
  
  const { data, error } = await supabase.storage
    .from('temp-uploads')
    .upload(tempPath, file);
  
  return { data, error };
}

// Finalizace = přesun do finální bucket + záznam v DB
export async function createAttachmentFromUpload(tempPath, metadata) {
  // 1. Přesun souboru
  const finalPath = `attachments/${metadata.entity}/${metadata.entity_id}/${filename}`;
  await supabase.storage.from('temp-uploads').move(tempPath, finalPath);
  
  // 2. Vytvoř záznam
  const { data, error } = await supabase
    .from('attachments')
    .insert({
      entity: metadata.entity,
      entity_id: metadata.entity_id,
      filename: filename,
      file_path: finalPath,
      description: metadata.description,
      created_by: currentUser.id
    });
  
  return { data, error };
}
```

---

## 18. Dashboard a oblíbené

### 18.1 Účel

Dashboard zobrazuje **oblíbené dlaždice** modulů.

**Soubor:** `src/ui/content.js`

### 18.2 Funkce

- ✅ Zobrazení oblíbených sekcí jako dlaždic
- ✅ Drag & Drop pro změnu pořadí
- ✅ Přidání/odebrání oblíbených
- ✅ Uložení v localStorage

### 18.3 Správa oblíbených

```javascript
// Načtení oblíbených
const favs = loadFavorites();
// → ['010-sprava-uzivatelu/prehled', '030-pronajimatel/osoba']

// Přidání do oblíbených
setFavorite('040-nemovitost/prehled', true);

// Odebrání z oblíbených
setFavorite('040-nemovitost/prehled', false);

// Načtení pořadí
const order = loadFavoriteOrder();

// Nastavení pořadí
setFavoriteOrder(['040-nemovitost/prehled', '010-sprava-uzivatelu/prehled']);
```

### 18.4 Vizuální reprezentace

```
┌─────────────────────────────────────────────────────┐
│ 🏠 Domů                                              │
├─────────────────────────────────────────────────────┤
│ ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│ │ 👥 Uživatelé │  │ 🏠 Pronajímat│  │ 🏢 Nemovit │ │
│ │ ────────────  │  │ ────────────  │  │ ────────── │ │
│ │ Přehled      │  │ Osoba        │  │ Přehled    │ │
│ │ Seznam       │  │ Seznam       │  │ Seznam     │ │
│ └──────────────┘  └──────────────┘  └────────────┘ │
└─────────────────────────────────────────────────────┘
     (dlaždice jsou draggable)
```

### 18.5 Drag & Drop implementace

Používá **SortableJS**:

```javascript
if (typeof Sortable !== 'undefined') {
  Sortable.create(gridElement, {
    animation: 150,
    ghostClass: 'opacity-50',
    onEnd: (evt) => {
      // Uložit nové pořadí
      const newOrder = Array.from(evt.to.children)
        .map(el => el.dataset.id);
      setFavoriteOrder(newOrder);
    }
  });
}
```

---


## 19. Existující moduly - detailní rozbor

### 19.1 Modul 010 - Správa uživatelů

**ID:** `010-sprava-uzivatelu`  
**Stav:** ✅ KOMPLETNÍ (referenční modul)

**Manifest:**
```javascript
{
  id: '010-sprava-uzivatelu',
  title: 'Uživatelé',
  icon: 'users',
  defaultTile: 'prehled',
  tiles: [
    { id: 'prehled', title: 'Přehled', icon: 'list' }
  ],
  forms: [
    { id: 'form',   title: 'Formulář',      icon: 'form' },
    { id: 'create', title: 'Nový / Pozvat', icon: 'add' },
    { id: 'role',   title: 'Role & barvy',  icon: 'settings' }
  ]
}
```

**Funkce:**
- ✅ Seznam uživatelů s filtrem
- ✅ Zobrazení rolí s barevným označením
- ✅ Detail/úprava uživatele
- ✅ Pozvání nového uživatele e-mailem
- ✅ Správa rolí a jejich barev
- ✅ Historie změn
- ✅ Přílohy
- ✅ Archivace

**Databázové tabulky:**
- `profiles` - uživatelské profily
- `profiles_history` - historie změn
- `user_permissions` - granulární oprávnění
- `roles` - definice rolí

**Soubory:**
```
src/modules/010-sprava-uzivatelu/
├── module.config.js
├── tiles/
│   └── prehled.js        # Seznam uživatelů
└── forms/
    ├── form.js           # Detail/edit uživatele
    ├── create.js         # Pozvání nového uživatele
    └── role.js           # Správa rolí
```

---

### 19.2 Modul 020 - Můj účet

**ID:** `020-muj-ucet`  
**Stav:** ✅ FUNKČNÍ (potřebuje rozšíření)

**Manifest:**
```javascript
{
  id: '020-muj-ucet',
  title: 'Můj účet',
  icon: 'account',
  defaultTile: 'form',  // Rovnou otevře formulář
  tiles: [],
  forms: [
    { id: 'form', title: 'Můj profil', icon: 'account' }
  ]
}
```

**Funkce:**
- ✅ Úprava vlastního profilu
- ✅ Změna osobních údajů
- ❌ Změna hesla (TODO)
- ❌ Nastavení notifikací (TODO)

**Databázové tabulky:**
- `profiles`

---

### 19.3 Modul 030 - Pronajímatel

**ID:** `030-pronajimatel`  
**Stav:** ⚠️ FUNKČNÍ (potřebuje doplnit historii, breadcrumbs)

**Manifest:**
```javascript
{
  id: '030-pronajimatel',
  title: 'Pronajímatel',
  icon: 'home',
  defaultTile: 'prehled',
  tiles: [
    {
      id: 'prehled',
      title: 'Přehled pronajímatelů',
      icon: 'list',
      collapsible: true,
      children: [
        { id: 'osoba',  title: 'Osoba (N)',  icon: 'person' },
        { id: 'osvc',   title: 'OSVČ (N)',   icon: 'briefcase' },
        { id: 'firma',  title: 'Firma (N)',  icon: 'building' },
        { id: 'spolek', title: 'Spolek (N)', icon: 'group' },
        { id: 'stat',   title: 'Stát (N)',   icon: 'flag' }
      ]
    }
  ],
  forms: [
    { id: 'chooser',      title: 'Nový subjekt',  icon: 'add', showInSidebar: false },
    { id: 'detail',       title: 'Detail',        icon: 'view', showInSidebar: false },
    { id: 'form',         title: 'Formulář',      icon: 'form', showInSidebar: false },
    { id: 'subject-type', title: 'Správa typů',   icon: 'settings', showInSidebar: true }
  ]
}
```

**Funkce:**
- ✅ Seznam pronajímatelů (fyzické i právnické osoby)
- ✅ Filtrování podle typu subjektu
- ✅ Detail/úprava pronajímatele
- ✅ Vytvoření nového subjektu (wizard chooser)
- ✅ Správa typů subjektů
- ✅ Vazba na nemovitosti
- ⚠️ Historie změn (částečně)
- ✅ Přílohy
- ✅ Archivace

**Typy subjektů:**
- **Osoba** - fyzická osoba (jméno, příjmení, rodné číslo)
- **OSVČ** - osoba samostatně výdělečně činná (IČO)
- **Firma** - právnická osoba (IČO, DIČ, název)
- **Spolek** - občanské sdružení
- **Stát** - státní organizace
- **Zástupce** - osoba jednající za jinou osobu

**Databázové tabulky:**
- `subjects` (role = 'pronajimatel')
- `subject_types`
- `subject_history`
- `user_subjects` - vazba uživatelů na subjekty

**Soubory:**
```
src/modules/030-pronajimatel/
├── module.config.js
├── tiles/
│   ├── prehled.js        # Hlavní přehled
│   ├── osoba.js          # Seznam osob
│   ├── osvc.js           # Seznam OSVČ
│   ├── firma.js          # Seznam firem
│   ├── spolek.js         # Seznam spolků
│   └── stat.js           # Seznam státních organizací
└── forms/
    ├── chooser.js        # Wizard pro výběr typu
    ├── detail.js         # Detail pronajímatele
    ├── form.js           # Úprava pronajímatele
    └── subject-type.js   # Správa typů subjektů
```

---

### 19.4 Modul 040 - Nemovitost

**ID:** `040-nemovitost`  
**Stav:** ✅ KOMPLETNÍ (dokončeno 2025-10-24)

**Manifest:**
```javascript
{
  id: '040-nemovitost',
  title: 'Nemovitost',
  icon: 'building',
  defaultTile: 'prehled',
  tiles: [
    { id: 'prehled',           title: 'Přehled',          icon: 'list' },
    { id: 'bytovy-dum',        title: 'Bytové domy',      icon: 'building' },
    { id: 'rodinny-dum',       title: 'Rodinné domy',     icon: 'home' },
    { id: 'prumyslovy-objekt', title: 'Průmysl. objekty', icon: 'factory' },
    { id: 'pozemek',           title: 'Pozemky',          icon: 'terrain' },
    { id: 'jiny-objekt',       title: 'Jiné objekty',     icon: 'other' },
    
    // Vnořené tiles pro jednotky
    { id: 'unit-byt',      title: 'Byty',      icon: 'apartment', collapsible: true },
    { id: 'unit-kancelar', title: 'Kanceláře', icon: 'office' },
    { id: 'unit-garaz',    title: 'Garáže',    icon: 'garage' }
    // ... další typy jednotek
  ],
  forms: [
    { id: 'detail',       title: 'Detail nemovitosti', icon: 'view', showInSidebar: false },
    { id: 'edit',         title: 'Úprava',             icon: 'edit', showInSidebar: false },
    { id: 'chooser',      title: 'Nová nemovitost',    icon: 'add',  showInSidebar: false },
    
    { id: 'unit-detail',  title: 'Detail jednotky',    icon: 'view', showInSidebar: false },
    { id: 'unit-edit',    title: 'Úprava jednotky',    icon: 'edit', showInSidebar: false },
    { id: 'unit-chooser', title: 'Nová jednotka',      icon: 'add',  showInSidebar: false },
    
    { id: 'property-type', title: 'Typy nemovitostí',  icon: 'settings', showInSidebar: true },
    { id: 'unit-type',     title: 'Typy jednotek',     icon: 'settings', showInSidebar: true }
  ]
}
```

**Funkce:**
- ✅ Seznam nemovitostí (všechny typy)
- ✅ Filtrování podle typu nemovitosti
- ✅ Detail/úprava nemovitosti
- ✅ Vytvoření nové nemovitosti (wizard chooser)
- ✅ **Správa jednotek** (byty, kanceláře, garáže, ...)
- ✅ Detail/úprava jednotky
- ✅ Vytvoření nové jednotky
- ✅ Vazba jednotky na nájemníka
- ✅ Vazba nemovitosti na pronajímatele
- ✅ Správa typů nemovitostí a jednotek
- ✅ Přílohy (k nemovitosti i jednotce)
- ✅ Archivace

**Typy nemovitostí:**
- **Bytový dům** - vícepodlažní budova s byty
- **Rodinný dům** - samostatný dům
- **Administrativní budova** - kanceláře
- **Průmyslový objekt** - sklady, výrobní haly
- **Pozemek** - stavební, zemědělský
- **Jiný objekt** - garáže, sklepy, ...

**Typy jednotek:**
- **Byt** - bytová jednotka (1+kk, 2+1, ...)
- **Kancelář** - kancelářský prostor
- **Garáž** - garážové stání
- **Sklad** - skladovací prostor
- **Obchodní prostor** - prodejna, restaurace
- **Půda** - půdní prostor
- **Sklep** - sklepní kóje

**Databázové tabulky:**
- `properties`
- `property_types`
- `units`
- `unit_types`

**Soubory:**
```
src/modules/040-nemovitost/
├── module.config.js
├── tiles/
│   ├── prehled.js             # Hlavní přehled
│   ├── bytovy-dum.js          # Seznam bytových domů
│   ├── rodinny-dum.js         # Seznam rodinných domů
│   ├── prumyslovy-objekt.js   # Seznam průmyslových objektů
│   ├── pozemek.js             # Seznam pozemků
│   ├── jiny-objekt.js         # Seznam jiných objektů
│   ├── unit-byt.js            # Seznam bytů
│   ├── unit-kancelar.js       # Seznam kanceláří
│   ├── unit-garaz.js          # Seznam garáží
│   └── ... (další typy jednotek)
└── forms/
    ├── detail.js              # Detail nemovitosti
    ├── edit.js                # Úprava nemovitosti
    ├── chooser.js             # Wizard pro novou nemovitost
    ├── fields.js              # Definice polí formulářů
    ├── unit-detail.js         # Detail jednotky
    ├── unit-edit.js           # Úprava jednotky
    ├── unit-chooser.js        # Wizard pro novou jednotku
    ├── property-type.js       # Správa typů nemovitostí
    └── unit-type.js           # Správa typů jednotek
```

---

### 19.5 Modul 050 - Nájemník

**ID:** `050-najemnik`  
**Stav:** ⚠️ FUNKČNÍ (podobný 030, potřebuje doplnit historii)

**Manifest:**
```javascript
{
  id: '050-najemnik',
  title: 'Nájemník',
  icon: 'person',
  defaultTile: 'prehled',
  tiles: [
    {
      id: 'prehled',
      title: 'Přehled nájemníků',
      icon: 'list',
      collapsible: true,
      children: [
        { id: 'osoba', title: 'Osoba (N)', icon: 'person' },
        { id: 'firma', title: 'Firma (N)', icon: 'building' }
      ]
    }
  ],
  forms: [
    { id: 'chooser', title: 'Nový nájemník', icon: 'add', showInSidebar: false },
    { id: 'detail',  title: 'Detail',        icon: 'view', showInSidebar: false },
    { id: 'form',    title: 'Formulář',      icon: 'form', showInSidebar: false }
  ]
}
```

**Funkce:**
- ✅ Seznam nájemníků (fyzické i právnické osoby)
- ✅ Filtrování podle typu subjektu
- ✅ Detail/úprava nájemníka
- ✅ Vytvoření nového nájemníka (wizard chooser)
- ✅ Vazba na jednotky (byty, kanceláře)
- ✅ Vazba na smlouvy (připraveno)
- ⚠️ Historie změn (částečně)
- ✅ Přílohy
- ✅ Archivace

**Databázové tabulky:**
- `subjects` (role = 'najemnik')
- `subject_types`
- `subject_history`

---

### 19.6 Modul 060 - Smlouvy

**ID:** `060-smlouva`  
**Stav:** 🔄 PŘIPRAVENO (částečná implementace)

**Plánované funkce:**
- ❌ Seznam smluv
- ❌ Detail smlouvy
- ❌ Vytvoření smlouvy z šablony
- ❌ Generování smluv (PDF)
- ❌ Elektronický podpis
- ❌ Upozornění na expiraci
- ❌ Dodatky ke smlouvě
- ❌ Historie verzí

**Databázové tabulky (připraveno):**
- `contracts` - smlouvy
- `contract_templates` - šablony smluv
- `contract_versions` - verze smluv

---

### 19.7 Modul 070 - Služby

**ID:** `070-sluzby`  
**Stav:** 🔄 PŘIPRAVENO (zakomentováno)

**Plánované funkce:**
- ❌ Seznam služeb (voda, elektřina, plyn, ...)
- ❌ Sazby služeb
- ❌ Výpočet nákladů
- ❌ Přiřazení služeb k jednotkám
- ❌ Měření spotřeby

---

### 19.8 Modul 080 - Platby

**ID:** `080-platby`  
**Stav:** 🔄 PŘIPRAVENO (zakomentováno)

**Plánované funkce:**
- ❌ Seznam plateb
- ❌ Evidence příjmů a výdajů
- ❌ Fakturace
- ❌ Upomínky
- ❌ Evidence dluhů
- ❌ Platební kalendář

---

### 19.9 Zakomentované moduly (090-990)

Následující moduly jsou **připraveny k aktivaci**, ale zatím jsou zakomentovány v `modules.index.js`:

| ID | Název | Stav | Poznámka |
|----|-------|------|----------|
| `090-finance` | Finance | ❌ Nepřipraveno | Finanční reporting, výkazy |
| `100-energie` | Energie | ❌ Nepřipraveno | Spotřeba energií, rozúčtování |
| `110-udrzba` | Údržba | ❌ Nepřipraveno | Požadavky na údržbu, servis |
| `120-dokumenty` | Dokumenty | ❌ Nepřipraveno | Správa dokumentů, archiv |
| `130-komunikace` | Komunikace | ❌ Nepřipraveno | E-maily, SMS, notifikace |
| `900-nastaveni` | Nastavení | ❌ Nepřipraveno | Globální nastavení aplikace |
| `990-help` | Nápověda | ❌ Nepřipraveno | Nápověda, dokumentace |

---

## 20. Připravené moduly

### 20.1 Šablona (000-sablona)

**Umístění:** `src/modules/000-sablona/`

Obsahuje **vzorové soubory** pro rychlé vytvoření nového modulu:
- Vzorový `module.config.js`
- Vzorový tile (`tiles/prehled.js`)
- Vzorový formulář (`forms/form.js`)
- Vzorové DB operace (`db.js`)

### 20.2 Návody na vytváření modulů

**Dokumentace:**
- `docs/how-to-create-module.md` - Detailní krok-za-krokem (600+ řádků)
- `docs/module-quick-reference.md` - Rychlá reference (code snippets)
- `docs/RYCHLY-PRUVODCE.md` - Vytvoř nový modul za 30 minut

**Obsahuje:**
- ✅ Kompletní příklady kódu
- ✅ SQL migrace
- ✅ Kontrolní checklisty
- ✅ Best practices
- ✅ Troubleshooting

---

## 21. Závěr a doporučení

### 21.1 Silné stránky aplikace

✅ **Modulární architektura** - snadné přidávání nových funkcí  
✅ **Jednotný UI pattern** - konzistentní uživatelská zkušenost  
✅ **Lazy loading** - rychlé načítání (pouze potřebné moduly)  
✅ **Oprávnění** - RBAC + RLS pro bezpečnost  
✅ **Historie změn** - audit trail pro všechny entity  
✅ **Přílohy** - univerzální systém pro soubory  
✅ **Responzivní design** - funguje na mobile i desktopu  
✅ **Žádný build proces** - rychlý vývoj, snadné nasazení  
✅ **Referenční modul 010** - vzor pro další moduly  
✅ **Kompletní dokumentace** - ~2000+ řádků návodu  

### 21.2 Oblasti k vylepšení

⚠️ **Historie změn** - není u všech modulů (030, 050)  
⚠️ **Breadcrumbs** - občas chybí (především v modulech 030, 050)  
⚠️ **Testy** - chybí automatizované testy  
⚠️ **Validace** - především HTML5, chybí komplexnější validace  
⚠️ **Notifikace** - chybí systém pro upozornění (expirace smluv, ...)  
⚠️ **Export/Import** - chybí hromadný import dat  
⚠️ **Offline podpora** - chybí Service Worker pro offline přístup  

### 21.3 Doporučení pro novou verzi

#### 21.3.1 Priorita 1 - Doplnit existující moduly

1. **Modul 030, 050** - doplnit historii změn a breadcrumbs
2. **Modul 060** - dokončit smlouvy (generování z šablon)
3. **Modul 070** - implementovat služby a rozúčtování
4. **Modul 080** - implementovat platby a faktury

#### 21.3.2 Priorita 2 - Automatizace a notifikace

1. **Notifikační systém** - upozornění na expiraci smluv, neuhrazené faktury
2. **Generování dokumentů** - PDF smlouvy, faktury, protokoly
3. **E-mailový systém** - automatické e-maily (upomínky, potvrzení)
4. **Kalendář** - platební kalendář, termíny údržby

#### 21.3.3 Priorita 3 - Reporting a analytika

1. **Dashboardy** - finanční přehled, obsazenost, dluhy
2. **Grafy** - vizualizace dat (příjmy vs výdaje, obsazenost)
3. **Exporty** - Excel, PDF reporty
4. **Analytika** - trendy, predikce

#### 21.3.4 Priorita 4 - Rozšíření funkcí

1. **Samoobsluha pro nájemníky** - portál pro nájemníky
2. **Mobilní aplikace** - nativní nebo PWA
3. **Integrace s bankou** - automatické párování plateb
4. **Integrace s ARES** - automatické vyplnění IČO, DIČ

#### 21.3.5 Technická vylepšení

1. **Testy** - unit testy (Vitest), E2E testy (Playwright)
2. **CI/CD** - GitHub Actions pro automatické testy a deploy
3. **Type safety** - TypeScript nebo JSDoc
4. **Build proces** - Vite pro optimalizaci
5. **Offline podpora** - Service Worker, IndexedDB cache

### 21.4 Kontrolní checklist pro novou verzi

Před spuštěním nové verze zkontroluj:

**Funkčnost:**
- [ ] Všechny moduly mají breadcrumbs
- [ ] Všechny hlavní entity mají historii změn
- [ ] CommonActions fungují korektně ve všech sekcích
- [ ] Formuláře mají validaci
- [ ] Tabulky mají filtry a řazení
- [ ] Přílohy fungují ve všech modulech
- [ ] Archivace funguje konzistentně

**Bezpečnost:**
- [ ] RLS policies jsou správně nastavené
- [ ] Oprávnění fungují podle rolí
- [ ] Validace na straně serveru (Supabase funkce)
- [ ] XSS ochrana (escapování HTML)
- [ ] CSRF ochrana (Supabase poskytuje)

**UX:**
- [ ] Responzivní design na mobile
- [ ] Loading states (spinner při načítání)
- [ ] Error states (zobrazení chyb)
- [ ] Toast notifikace pro feedback
- [ ] Unsaved helper (ochrana neuložených změn)
- [ ] Keyboard shortcuts (volitelné)

**Dokumentace:**
- [ ] README aktualizován
- [ ] Database schema aktualizováno
- [ ] Návody na vytváření modulů aktualizovány
- [ ] Changelog vytvořen

**Performance:**
- [ ] Lazy loading modulů
- [ ] Optimalizované dotazy do DB
- [ ] Indexy na všech FK a často filtrovaných sloupcích
- [ ] Cache strategii (localStorage pro UI preferences)

### 21.5 Migrační strategie

Pokud vytváříš **novou verzi** (v6):

1. **Zachovej databázi** - nepřejmenovávej tabulky
2. **Postupná migrace modulů** - modul po modulu
3. **Paralelní běh** - nechej v5 dostupnou, dokud není v6 hotová
4. **Data migrace** - SQL scripty pro případné změny schématu
5. **Rollback plán** - možnost vrátit se k v5

### 21.6 Použité zdroje a vzory

**Kde hledat vzory:**
- **Modul 010** - referenční implementace (použij jako vzor)
- **Modul 040** - komplexní modul s vnořenými tiles a propojením entit
- **`src/ui/`** - všechny přepoužitelné komponenty
- **`docs/`** - kompletní dokumentace (~2000 řádků)
- **`NEW/`** - nová dokumentace pro moduly 030-080

**Klíčové soubory:**
- `src/app.js` - router, inicializace
- `src/app/modules.index.js` - registry modulů
- `src/db.js` - centrální DB vrstva
- `src/security/permissions.js` - oprávnění
- `src/ui/commonActions.js` - akční lišta
- `src/ui/table.js` - univerzální tabulka
- `src/ui/form.js` - univerzální formulář

---

## Přílohy

### A. Struktura URL

```
Formát:
#/m/{moduleId}/{type}/{sectionId}?{params}

Příklady:
#/
  → Dashboard (oblíbené dlaždice)

#/m/010-sprava-uzivatelu/t/prehled
  → Modul: 010-sprava-uzivatelu
  → Type: t (tile)
  → Section: prehled

#/m/010-sprava-uzivatelu/f/form?id=abc-123&mode=edit
  → Modul: 010-sprava-uzivatelu
  → Type: f (form)
  → Section: form
  → Params: id=abc-123, mode=edit

#/m/030-pronajimatel/t/osoba?filter=archivovane
  → Modul: 030-pronajimatel
  → Type: t (tile)
  → Section: osoba
  → Params: filter=archivovane
```

### B. Databázové konvence

**Názvy tabulek:**
- Množné číslo: `profiles`, `subjects`, `properties`
- Snake case: `user_permissions`, `subject_types`

**Názvy sloupců:**
- Snake case: `display_name`, `created_at`
- ID sloupce: `id` (UUID)
- Foreign keys: `{table}_id` (např. `property_id`)
- Časové razítko: `created_at`, `updated_at`, `archived_at`
- Boolean: `active`, `archived`

**Indexy:**
- `idx_{table}_{column}` (např. `idx_subjects_role`)
- `idx_{table}_{col1}_{col2}` pro composite indexy

**Policies (RLS):**
- `{table}_{operation}` (např. `profiles_select`, `subjects_update`)

### C. Konvence kódování

**Názvy souborů:**
- Kebab case: `module.config.js`, `common-actions.js`
- Tile: `tiles/{id}.js` kde {id} odpovídá tile.id v manifestu
- Form: `forms/{id}.js` kde {id} odpovídá form.id v manifestu

**Funkce:**
- Camel case: `renderTable`, `getUserProfile`
- Export: `export async function render(root, params) {}`
- Async kde je potřeba: `async function fetchData() {}`

**Konstanty:**
- UPPER SNAKE CASE: `MODULE_SOURCES`, `AUDIT_FIELDS`

**Komentáře:**
- JSDoc pro veřejné API:
```javascript
/**
 * Renderuje tabulku s daty
 * @param {HTMLElement} root - kontejner
 * @param {Object} options - konfigurace
 */
export function renderTable(root, options) {}
```

### D. Git workflow

**Branches:**
- `main` - produkční verze
- `develop` - vývojová větev
- `feature/{name}` - nové funkce
- `fix/{name}` - opravy bugů

**Commit messages:**
```
feat: přidán modul 060-smlouva
fix: oprava breadcrumbs v modulu 030
docs: aktualizace database schema
refactor: zjednodušení commonActions
style: formátování kódu v ui/table.js
```

**Pull requests:**
- Popis změn
- Screenshot UI změn
- Checklist před merge:
  - [ ] Kód funguje lokálně
  - [ ] Žádné console.log v produkci
  - [ ] Dokumentace aktualizována
  - [ ] RLS policies zkontrolovány

---

## Poslední slova

Tato aplikace je **robustní základ** pro správu pronájmů. Architektura je **modulární a rozšiřitelná**. 

**Klíčové silné stránky:**
1. Jasná separace UI komponent
2. Jednotný pattern pro moduly
3. Kompletní dokumentace
4. Referenční implementace (modul 010)

**Pro úspěšný start nové verze:**
1. Proč existující moduly (010, 040)
2. Použij šablony a návody v `docs/`
3. Dodržuj konvence
4. Testuj průběžně
5. Dokumentuj změny

**Kontakt a podpora:**
- Dokumentace: `docs/` a `NEW/`
- Příklady: `src/modules/010-sprava-uzivatelu/`
- Vzory: `src/modules/000-sablona/`

---

**Konec dokumentu**  
**Vytvořeno:** 2025-11-07  
**Autor:** Automatická analýza aplikace v5  
**Verze dokumentu:** 1.0  
**Počet řádků:** ~2500+  
**Velikost:** ~150 KB

