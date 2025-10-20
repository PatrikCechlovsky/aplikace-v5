# 📋 STANDARDIZAČNÍ NÁVOD – Aplikace v5

## 🎯 Úvod a účel

Tento dokument obsahuje **podrobný návod pro sjednocení všech modulů** aplikace podle jednotné struktury a principů. Cílem je zajistit, aby všechny moduly fungovaly stejně, používaly stejné komponenty a poskytovaly konzistentní uživatelský zážitek.

### Co tento návod obsahuje:
- ✅ Přehled aktuálního stavu a identifikovaných problémů
- ✅ Přesné šablony a struktury pro dlaždice (tiles) a formuláře (forms)
- ✅ Požadavky na jednotlivé komponenty (sidebar, commonActions, breadcrumbs, atd.)
- ✅ Kontrolní checklist pro každý modul
- ✅ Příklady správného kódu pro každou komponentu

---

## 🔍 Aktuální stav aplikace

### Moduly v aplikaci:
```
✅ 000-sablona      (šablona/vzor)
✅ 010-sprava-uzivatelu (referenční implementace - NEJLEPŠÍ PŘÍKLAD)
✅ 020-muj-ucet
✅ 030-pronajimatel
⚠️  040-nemovitost   (obsahuje prázdné soubory!)
✅ 050-najemnik
❌ 060-smlouva      (zakomentováno v modules.index.js)
❌ 070-sluzby       (zakomentováno v modules.index.js)
❌ 080-platby       (zakomentováno v modules.index.js)
❌ 090-finance      (zakomentováno v modules.index.js)
❌ 100-energie      (zakomentováno v modules.index.js)
❌ 110-udrzba       (zakomentováno v modules.index.js)
❌ 120-dokumenty    (zakomentováno v modules.index.js)
❌ 130-komunikace   (zakomentováno v modules.index.js)
❌ 900-nastaveni    (zakomentováno v modules.index.js)
❌ 990-help         (zakomentováno v modules.index.js)
```

### Identifikované problémy:

#### 1. **Nejednotná implementace dlaždic (tiles/prehled.js)**
- ✅ **Modul 010**: Plná implementace s breadcrumbs, commonActions, filtrací, výběrem řádků
- ⚠️ **Moduly 030, 050**: Zjednodušené seznamy bez breadcrumbs a commonActions
- ❌ **Modul 040**: Prázdné soubory (prehled.js má pouze 1 byte)

#### 2. **Chybějící historie změn**
- ✅ **Modul 010**: Má implementovanou historii změn (history.js, ukládání do profiles_history)
- ❌ **Všechny ostatní moduly**: Nemají historii změn

#### 3. **Nekonzistentní CommonActions**
- ✅ **Modul 010**: Správně používá `renderCommonActions` v `#commonactions` kontejneru
- ⚠️ **Moduly 030, 050**: CommonActions chybí nebo jsou implementovány nesprávně

#### 4. **Chybějící breadcrumbs**
- ✅ **Modul 010**: Má správné breadcrumbs (Domů › Uživatelé › Přehled)
- ⚠️ **Moduly 030, 050**: Breadcrumbs nejsou implementovány

#### 5. **Nejednotné formuláře**
- ✅ **Modul 010**: Detailní formulář s history, attachments, sekcemi, readonly poli
- ⚠️ **Moduly 030, 050**: Zjednodušené formuláře bez plné funkcionality

#### 6. **Chybějící filtrace v seznamech**
- ✅ **Modul 010**: Plná filtrace + možnost zobrazit archivované
- ⚠️ **Moduly 030, 050**: Základní filtrace, ale bez rozšířených možností

---

## 📐 STANDARDY – Co musí obsahovat KAŽDÝ modul

### 1. Struktura složek modulu

```
src/modules/<NNN-nazev>/
├── module.config.js         ← Manifest modulu (POVINNÉ)
├── tiles/                   ← Dlaždice/Přehledy
│   ├── prehled.js          ← Hlavní seznam (POVINNÉ)
│   ├── osoba.js            ← Specifické přehledy (volitelné)
│   └── ...
├── forms/                   ← Formuláře
│   ├── form.js             ← Hlavní formulář pro edit/detail (DOPORUČENÉ)
│   ├── create.js           ← Formulář pro vytvoření nového (volitelné)
│   ├── history.js          ← Historie změn (POVINNÉ pro hlavní entity)
│   └── ...
├── services/                ← Business logika (volitelné)
│   └── ...
└── assets/                  ← Obrázky, ikony (volitelné)
    └── ...
```

### 2. Soubor module.config.js

**ŠABLONA:**
```javascript
// module.config.js
export async function getManifest() {
  return {
    id: 'XXX-nazev-modulu',           // ID: tři čísla + kebab-case
    title: 'Název modulu',             // Název zobrazený v UI
    icon: 'icon-name',                 // Ikona z ui/icons.js
    defaultTile: 'prehled',            // Výchozí dlaždice při otevření
    tiles: [                           // Seznam dlaždic
      { id: 'prehled', title: 'Přehled', icon: 'list' },
      // další dlaždice...
    ],
    forms: [                           // Seznam formulářů
      { id: 'form', title: 'Formulář', icon: 'form' },
      { id: 'create', title: 'Nový záznam', icon: 'add' },
      // další formuláře...
    ],
  };
}

export default { getManifest };
```

**KONTROLA:**
- [ ] ID modulu je ve formátu `NNN-nazev` (tři číslice + kebab-case)
- [ ] `defaultTile` odpovídá existující dlaždici v `tiles/`
- [ ] Všechny položky v `tiles` mají odpovídající soubory v `tiles/`
- [ ] Všechny položky v `forms` mají odpovídající soubory v `forms/`
- [ ] Ikony existují v `src/ui/icons.js`

---

## 🎨 ŠABLONA: Dlaždice s přehledem (tiles/prehled.js)

### Referenční implementace: `010-sprava-uzivatelu/tiles/prehled.js`

### CO MUSÍ OBSAHOVAT každá dlaždice/přehled:

#### ✅ 1. Importy
```javascript
import { renderTable } from '../../../ui/table.js';
import { renderCommonActions } from '../../../ui/commonActions.js';
import { setBreadcrumb } from '../../../ui/breadcrumb.js';
import { navigateTo, route } from '../../../app.js';
import { getUserPermissions } from '../../../security/permissions.js';
import { showAttachmentsModal } from '../../../ui/attachments.js';
// Import DB funkcí pro načítání dat
import { listXXX, archiveXXX } from '../../../db.js';
// nebo specificky:
// import { listXXX } from '../../../db/xxx.js';
```

#### ✅ 2. Stav komponenty (state)
```javascript
let selectedRow = null;      // Aktuálně vybraný řádek
let showArchived = false;    // Zobrazit archivované záznamy?
let filterValue = '';        // Hodnota filtru
```

#### ✅ 3. Funkce render() - STRUKTURA

```javascript
export async function render(root) {
  // KROK 1: Nastavit breadcrumbs
  setBreadcrumb(document.getElementById('crumb'), [
    { icon: 'home',  label: 'Domů',      href: '#/' },
    { icon: 'xxx',   label: 'Název modulu', href: '#/m/XXX-modul' },
    { icon: 'list',  label: 'Přehled' }
  ]);

  // KROK 2: Připravit kontejner pro tabulku
  root.innerHTML = `<div id="xxx-table"></div>`;

  // KROK 3: Načíst data z databáze
  const { data: items, error } = await listXXX();
  if (error) {
    root.querySelector('#xxx-table').innerHTML = 
      `<div class="p-4 text-red-600">Chyba při načítání: ${error.message}</div>`;
    return;
  }

  // KROK 4: Připravit data pro tabulku (filtrovat archivované)
  const rows = (items || [])
    .filter(r => showArchived ? true : !r.archived)
    .map(r => ({
      id: r.id,
      // mapování polí...
      archived: r.archived,
      archivedLabel: r.archived ? 'Ano' : ''
    }));

  // KROK 5: Definovat sloupce tabulky
  const columns = [
    { key: 'nazev',   label: 'Název',   sortable: true, width: '30%' },
    { key: 'email',   label: 'E-mail',  sortable: true, width: '25%' },
    // další sloupce...
    { key: 'archivedLabel', label: 'Archivován', sortable: true, width: '10%' }
  ];

  // KROK 6: Funkce pro vykreslení akcí (CommonActions)
  function drawActions() {
    const ca = document.getElementById('commonactions');
    if (!ca) return;
    
    const hasSel = !!selectedRow && !selectedRow.archived;
    const userRole = window.currentUserRole || 'admin';
    const canArchive = getUserPermissions(userRole).includes('archive');
    
    renderCommonActions(ca, {
      moduleActions: ['add', 'edit', 'archive', 'attach', 'refresh'],
      handlers: {
        onAdd:    () => navigateTo('#/m/XXX-modul/f/create'),
        onEdit:   !!selectedRow ? () => navigateTo(`#/m/XXX-modul/f/form?id=${selectedRow.id}&mode=edit`) : undefined,
        onArchive: canArchive && hasSel ? () => handleArchive(selectedRow) : undefined,
        onAttach: !!selectedRow ? () => showAttachmentsModal({ entity: 'xxx', entityId: selectedRow.id }) : undefined,
        onRefresh: () => route()
      }
    });
  }

  // KROK 7: Handler pro archivaci
  async function handleArchive(row) {
    if (!row) return;
    const hasVazby = await hasActiveVazby(row.id);
    if (hasVazby) {
      alert('Nelze archivovat, existují aktivní vazby!');
      return;
    }
    await archiveXXX(row.id);
    selectedRow = null;
    await render(root);
  }

  // KROK 8: Kontrola vazeb (implementuj podle potřeby)
  async function hasActiveVazby(id) {
    // TODO: dotaz na DB - zkontrolovat vazby
    return false;
  }

  // KROK 9: Vykreslit akce
  drawActions();

  // KROK 10: Vykreslit tabulku
  renderTable(root.querySelector('#xxx-table'), {
    columns,
    rows,
    options: {
      moduleId: 'XXX-modul',
      filterValue: filterValue,
      customHeader: ({ filterInputHtml }) => `
        <div class="flex items-center gap-4">
          ${filterInputHtml}
          <label class="flex items-center gap-1 text-sm cursor-pointer ml-2">
            <input type="checkbox" id="toggle-archived" ${showArchived ? 'checked' : ''}/>
            Zobrazit archivované
          </label>
        </div>
      `,
      onRowSelect: row => {
        selectedRow = (selectedRow && selectedRow.id === row.id) ? null : row;
        drawActions();
      },
      onRowDblClick: row => {
        selectedRow = row;
        navigateTo(`#/m/XXX-modul/f/form?id=${row.id}&mode=edit`);
      }
    }
  });

  // KROK 11: Event listener pro checkbox "Zobrazit archivované"
  root.querySelector('#xxx-table').addEventListener('change', (e) => {
    if (e.target && e.target.id === 'toggle-archived') {
      showArchived = e.target.checked;
      render(root);
    }
  });
}

export default { render };
```

### KONTROLNÍ CHECKLIST pro dlaždice:

- [ ] **Breadcrumbs** jsou nastaveny pomocí `setBreadcrumb()`
- [ ] **Tabulka** je vykreslena pomocí `renderTable()`
- [ ] **CommonActions** jsou vykresleny do `#commonactions` kontejneru
- [ ] **Filtr** funguje (fulltext + archivované)
- [ ] **Výběr řádku** mění dostupné akce (edit, archive)
- [ ] **Dvojklik** otevírá detail/editaci
- [ ] **Refresh** znovu načte data
- [ ] **Archivace** kontroluje vazby před archivací
- [ ] **Data se načítají** z Supabase přes db.js funkce
- [ ] **Sloupce** odpovídají datům v databázi

---

## 📝 ŠABLONA: Formulář (forms/form.js)

### Referenční implementace: `010-sprava-uzivatelu/forms/form.js`

### CO MUSÍ OBSAHOVAT každý formulář:

#### ✅ 1. Importy
```javascript
import { setBreadcrumb } from '../../../ui/breadcrumb.js';
import { renderForm } from '../../../ui/form.js';
import { renderCommonActions } from '../../../ui/commonActions.js';
import { navigateTo } from '../../../app.js';
import { getXXX, updateXXX, archiveXXX } from '../../../db.js';
import { useUnsavedHelper } from '../../../ui/unsaved-helper.js';
import { showAttachmentsModal } from '../../../ui/attachments.js';
import { showHistoryModal } from './history.js';  // POVINNÉ!
import { setUnsaved } from '../../../app.js';
```

#### ✅ 2. Pomocné funkce
```javascript
// Získání parametrů z URL hash
function getHashParams() {
  const q = (location.hash.split('?')[1] || '');
  return Object.fromEntries(new URLSearchParams(q));
}

// Formátování českého data+času
function formatCzechDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return '';
  return d.toLocaleDateString('cs-CZ') + ' ' + d.toLocaleTimeString('cs-CZ');
}
```

#### ✅ 3. Definice polí
```javascript
const FIELDS = [
  // Základní pole
  { key: 'nazev',    label: 'Název',    type: 'text', required: true },
  { key: 'email',    label: 'E-mail',   type: 'email', required: true },
  { key: 'telefon',  label: 'Telefon',  type: 'text' },
  
  // Adresní pole
  { key: 'street',       label: 'Ulice',         type: 'text' },
  { key: 'house_number', label: 'Číslo popisné', type: 'text' },
  { key: 'city',         label: 'Město',         type: 'text' },
  { key: 'zip',          label: 'PSČ',           type: 'text' },
  
  // Systémová pole
  { key: 'archived', label: 'Archivní', type: 'checkbox' },
  { key: 'note',     label: 'Poznámka', type: 'textarea', fullWidth: true },
  
  // READONLY auditní pole (POVINNÉ!)
  { key: 'last_login',  label: 'Poslední přihlášení', type: 'label', readOnly: true, format: formatCzechDate },
  { key: 'updated_at',  label: 'Poslední úprava',     type: 'label', readOnly: true, format: formatCzechDate },
  { key: 'updated_by',  label: 'Upravil',             type: 'label', readOnly: true },
  { key: 'created_at',  label: 'Vytvořen',            type: 'label', readOnly: true, format: formatCzechDate }
];
```

#### ✅ 4. Hlavní renderovací funkce

```javascript
export async function render(root) {
  const { id, mode: modeParam } = getHashParams();
  const mode = (modeParam === 'read') ? 'read' : 'edit';

  // KROK 1: Načíst data
  let data = {};
  if (id) {
    const { data: entityData, error } = await getXXX(id);
    if (error) {
      root.innerHTML = `<div class="p-4 text-red-600">Chyba: ${error.message}</div>`;
      return;
    }
    if (!entityData) {
      root.innerHTML = `<div class="p-4 text-red-600">Záznam nenalezen.</div>`;
      return;
    }
    data = { ...entityData };
    
    // Formátování readonly polí
    for (const f of FIELDS) {
      if (f.readOnly) {
        if (f.format && data[f.key]) {
          data[f.key] = f.format(data[f.key]);
        }
        if (!data[f.key]) {
          data[f.key] = '--';
        }
      }
    }
    
    // Konverze archived
    if (typeof data.archived === 'undefined') data.archived = false;
  }

  // KROK 2: Breadcrumbs
  const jmeno = data.nazev || data.email || id || 'Záznam';
  setBreadcrumb(document.getElementById('crumb'), [
    { icon: 'home',  label: 'Domů',         href: '#/' },
    { icon: 'xxx',   label: 'Název modulu', href: '#/m/XXX-modul' },
    { icon: 'form',  label: 'Formulář' },
    { icon: 'account', label: jmeno }
  ]);

  // KROK 3: Definovat akce podle módu
  const myRole = window.currentUserRole || 'user';
  const actionsByMode = {
    read:   ['edit', 'reject', 'attach', 'history'],
    edit:   ['save', 'attach', 'archive', 'reject', 'history']
  };
  const moduleActions = actionsByMode[mode];
  const handlers = {};

  // KROK 4: Handlery pro READ mód
  if (mode === 'read') {
    handlers.onEdit = () => navigateTo(`#/m/XXX-modul/f/form?id=${id||''}&mode=edit`);
    handlers.onReject = () => navigateTo('#/m/XXX-modul/t/prehled');
  }

  // KROK 5: Handlery pro EDIT mód
  if (mode === 'edit') {
    handlers.onSave = async () => {
      const values = grabValues(root);
      
      // Nastavit updated_by
      if (window.currentUser) {
        values.updated_by =
          window.currentUser.display_name ||
          window.currentUser.username ||
          window.currentUser.email;
      }
      
      const { data: updated, error } = await updateXXX(id, values, window.currentUser);
      if (error) {
        alert('Chyba při ukládání: ' + error.message);
        return;
      }
      
      alert('Uloženo.');
      setUnsaved(false);
      
      // Znovu načíst data
      const { data: refreshed } = await getXXX(id);
      if (refreshed) {
        // Formátování readonly polí
        for (const f of FIELDS) {
          if (f.readOnly) {
            if (f.format && refreshed[f.key]) {
              refreshed[f.key] = f.format(refreshed[f.key]);
            }
            if (!refreshed[f.key]) {
              refreshed[f.key] = '--';
            }
          }
        }
        renderForm(root, FIELDS, refreshed, async () => true, {
          readOnly: false,
          showSubmit: false,
          layout: { columns: { base: 1, md: 2, xl: 3 }, density: 'compact' },
          sections: [
            { id: 'zakladni', label: 'Základní údaje', fields: ['nazev', 'email', 'telefon'] },
            { id: 'system', label: 'Systém', fields: ['archived', 'note', 'updated_at', 'updated_by', 'created_at'] },
          ]
        });
      }
    };
    
    handlers.onReject = () => navigateTo('#/m/XXX-modul/t/prehled');
    
    // Archivace
    if (['admin', 'editor'].includes(myRole) && id && !data.archived) {
      handlers.onArchive = async () => {
        const hasVazby = await hasActiveVazby(id);
        if (hasVazby) {
          alert('Nelze archivovat, existují vazby!');
          return;
        }
        await archiveXXX(id, window.currentUser);
        alert('Záznam byl archivován.');
        navigateTo('#/m/XXX-modul/t/prehled');
      };
    }
  }

  // KROK 6: Přílohy a historie (POVINNÉ!)
  handlers.onAttach = () => id && showAttachmentsModal({ entity: 'xxx', entityId: id });
  handlers.onHistory = () => id && showHistoryModal(id);

  // KROK 7: Vykreslit CommonActions
  renderCommonActions(document.getElementById('commonactions'), {
    moduleActions,
    userRole: myRole,
    handlers
  });

  // KROK 8: Vykreslit formulář
  renderForm(root, FIELDS, data, async () => true, {
    readOnly: (mode === 'read'),
    showSubmit: false,
    layout: { columns: { base: 1, md: 2, xl: 3 }, density: 'compact' },
    sections: [
      { id: 'zakladni', label: 'Základní údaje', fields: ['nazev', 'email', 'telefon', 'street', 'house_number', 'city', 'zip'] },
      { id: 'system', label: 'Systém', fields: ['archived', 'note', 'updated_at', 'updated_by', 'created_at'] },
    ]
  });

  // KROK 9: Unsaved helper
  const formEl = root.querySelector("form");
  if (formEl) useUnsavedHelper(formEl);
}

// KROK 10: Pomocné funkce
function grabValues(scopeEl) {
  const obj = {};
  for (const f of FIELDS) {
    if (f.readOnly) continue; // NIKDY neukládat readonly pole!
    const el = scopeEl.querySelector(`[name="${f.key}"]`);
    if (!el) continue;
    obj[f.key] = (el.type === 'checkbox') ? !!el.checked : el.value;
  }
  return obj;
}

async function hasActiveVazby(id) {
  // TODO: implementovat kontrolu vazeb
  return false;
}

export default { render };
```

### KONTROLNÍ CHECKLIST pro formuláře:

- [ ] **Breadcrumbs** jsou nastaveny
- [ ] **CommonActions** obsahují: save, reject, attach, history, archive
- [ ] **Historie změn** je dostupná přes tlačítko (history.js existuje)
- [ ] **Přílohy** jsou dostupné přes tlačítko
- [ ] **Readonly pole** (created_at, updated_at, updated_by) jsou formátované
- [ ] **Updated_by** se automaticky nastavuje při ukládání
- [ ] **Unsaved helper** chrání před ztátou dat
- [ ] **Archivace** kontroluje vazby
- [ ] **Sekce** rozdělují pole do logických celků
- [ ] **grabValues()** NIKDY neukládá readonly pole

---

## 📜 ŠABLONA: Historie změn (forms/history.js)

### POVINNÉ pro každý hlavní formulář!

```javascript
// forms/history.js
import { supabase } from '../../../db.js';

// Přehled českých názvů polí
const FIELD_LABELS = {
  nazev: 'Název',
  email: 'E-mail',
  telefon: 'Telefon',
  street: 'Ulice',
  house_number: 'Číslo popisné',
  city: 'Město',
  zip: 'PSČ',
  archived: 'Archivován',
  note: 'Poznámka',
  updated_at: 'Poslední úprava',
  updated_by: 'Upravil',
  created_at: 'Vytvořen'
};

export async function showHistoryModal(entityId) {
  // POZOR: Změň název tabulky podle entity!
  const { data, error } = await supabase
    .from('xxx_history')  // <-- ZMĚŇ NÁZEV TABULKY!
    .select('*')
    .eq('entity_id', entityId)
    .order('changed_at', { ascending: false });

  if (error) {
    alert("Chyba při načítání historie: " + error.message);
    return;
  }
  if (!Array.isArray(data) || data.length === 0) {
    alert("Žádná historie změn zatím neexistuje.");
    return;
  }

  let html = `
    <h2 style="margin-bottom:1em;">Historie změn</h2>
    <table style="width:100%;border-collapse:collapse;">
      <thead>
        <tr>
          <th style="text-align:left;">Pole</th>
          <th style="text-align:left;">Původní hodnota</th>
          <th style="text-align:left;">Nová hodnota</th>
          <th style="text-align:left;">Upravil</th>
          <th style="text-align:left;">Kdy</th>
        </tr>
      </thead>
      <tbody>
        ${data.map(row => `
          <tr>
            <td>${FIELD_LABELS[row.field] || row.field}</td>
            <td>${row.old_value ?? '-'}</td>
            <td>${row.new_value ?? '-'}</td>
            <td>${row.changed_by ?? '-'}</td>
            <td>${new Date(row.changed_at).toLocaleString('cs-CZ')}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  // Modal s křížkem
  let modal = document.createElement('div');
  modal.id = 'history-modal';
  modal.style.position = 'fixed';
  modal.style.left = '0'; modal.style.top = '0';
  modal.style.width = '100vw'; modal.style.height = '100vh';
  modal.style.background = 'rgba(0,0,0,0.6)';
  modal.style.zIndex = '1000';
  modal.style.display = 'flex'; 
  modal.style.justifyContent = 'center'; 
  modal.style.alignItems = 'center';
  modal.innerHTML = `
    <div style="background:#fff;max-width:900px;width:95vw;max-height:90vh;overflow:auto;padding:2em;border-radius:12px;position:relative;">
      <button onclick="document.getElementById('history-modal').remove()" 
        style="position:absolute;top:12px;right:16px;font-size:26px;background:none;border:none;cursor:pointer;" 
        title="Zavřít">&times;</button>
      ${html}
    </div>
  `;
  document.body.appendChild(modal);
}
```

### Databázová struktura pro historii:

**Pro každou hlavní entitu vytvoř tabulku `xxx_history`:**

```sql
CREATE TABLE IF NOT EXISTS public.xxx_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_id uuid NOT NULL,              -- ID změněného záznamu
  field text NOT NULL,                  -- Název pole které se změnilo
  old_value text,                       -- Stará hodnota
  new_value text,                       -- Nová hodnota
  changed_by text,                      -- Kdo změnil (display_name)
  changed_at timestamptz DEFAULT now(), -- Kdy se změnilo
  FOREIGN KEY (entity_id) REFERENCES public.xxx(id) ON DELETE CASCADE
);

-- Index pro rychlé vyhledávání
CREATE INDEX IF NOT EXISTS idx_xxx_history_entity 
  ON public.xxx_history(entity_id);
```

### Trigger pro automatické ukládání historie:

```sql
-- Funkce pro ukládání historie
CREATE OR REPLACE FUNCTION track_xxx_changes()
RETURNS TRIGGER AS $$
DECLARE
  col text;
  old_val text;
  new_val text;
  user_name text;
BEGIN
  -- Získat jméno uživatele
  user_name := COALESCE(NEW.updated_by, current_user);
  
  -- Projít všechny sloupce a uložit změny
  FOR col IN 
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'xxx' 
      AND table_schema = 'public'
      AND column_name NOT IN ('id', 'created_at', 'updated_at', 'updated_by')
  LOOP
    -- Porovnat starou a novou hodnotu
    EXECUTE format('SELECT ($1).%I::text, ($2).%I::text', col, col) 
      INTO old_val, new_val 
      USING OLD, NEW;
    
    -- Pokud se změnilo, ulož do historie
    IF old_val IS DISTINCT FROM new_val THEN
      INSERT INTO public.xxx_history 
        (entity_id, field, old_value, new_value, changed_by, changed_at)
      VALUES 
        (NEW.id, col, old_val, new_val, user_name, now());
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
CREATE TRIGGER xxx_history_trigger
  AFTER UPDATE ON public.xxx
  FOR EACH ROW
  EXECUTE FUNCTION track_xxx_changes();
```

**KONTROLA:**
- [ ] Tabulka `xxx_history` existuje v databázi
- [ ] Trigger `track_xxx_changes()` je vytvořen
- [ ] `showHistoryModal()` načítá data ze správné tabulky
- [ ] FIELD_LABELS obsahuje všechny pole z formuláře
- [ ] Historie je přístupná z formuláře přes tlačítko

---

## 🎛️ CommonActions – Jednotná lišta akcí

### Umístění:
- **VŽDY** v kontejneru `#commonactions` (definováno v app.html)
- **NIKDY** v breadcrumbs nebo jinde!

### Podporované akce:
```javascript
const AKCE = [
  'add',      // Přidat nový
  'edit',     // Upravit vybraný
  'delete',   // Smazat vybraný
  'archive',  // Archivovat vybraný
  'attach',   // Přílohy
  'refresh',  // Obnovit data
  'search',   // Hledat/filtrovat
  'save',     // Uložit (formulář)
  'reject',   // Zpět bez uložení
  'invite',   // Pozvat (specifické)
  'send',     // Odeslat
  'export',   // Export dat
  'import',   // Import dat
  'print',    // Tisk
  'star',     // Oblíbené
  'history',  // Historie změn (POVINNÉ!)
  'detail'    // Detail záznamu
];
```

### Příklad použití:
```javascript
renderCommonActions(document.getElementById('commonactions'), {
  moduleActions: ['add', 'edit', 'archive', 'attach', 'history', 'refresh'],
  userRole: myRole,
  handlers: {
    onAdd: () => navigateTo('#/m/XXX/f/create'),
    onEdit: selectedRow ? () => navigateTo(`#/m/XXX/f/form?id=${selectedRow.id}`) : undefined,
    onArchive: selectedRow && !selectedRow.archived ? () => handleArchive(selectedRow) : undefined,
    onAttach: selectedRow ? () => showAttachmentsModal({...}) : undefined,
    onHistory: selectedRow ? () => showHistoryModal(selectedRow.id) : undefined,
    onRefresh: () => route()
  }
});
```

**PRAVIDLA:**
- Akce bez handleru se nezobrazí (disabled)
- Akce se povolují/zakazují podle stavu (vybraný řádek)
- Ikony a tooltipy jsou automatické (z katalog u)

---

## 🥖 Breadcrumbs – Navigační drobečková cesta

### Použití:
```javascript
import { setBreadcrumb } from '../../../ui/breadcrumb.js';

setBreadcrumb(document.getElementById('crumb'), [
  { icon: 'home',  label: 'Domů',      href: '#/' },
  { icon: 'users', label: 'Uživatelé', href: '#/m/010-sprava-uzivatelu' },
  { icon: 'list',  label: 'Přehled' }  // Poslední položka bez href
]);
```

**PRAVIDLA:**
- První položka je VŽDY "Domů" s `href: '#/'`
- Druhá položka je název modulu s odkazem na modul
- Třetí položka je aktuální sekce (NIKDY href!)
- Čtvrtá položka (volitelně) je konkrétní záznam (např. jméno)

---

## 🔧 Sidebar – Boční menu modulů

### Kde se generuje:
- V `app.js` funkce `renderSidebar()`
- Automaticky z registry modulů

### Co musíš udělat:
- **NIC!** Sidebar se generuje automaticky z `module.config.js`
- Pokud chceš skrýt dlaždici, odstraň ji z `tiles[]` v manifestu

---

## 🗂️ Filtrace a seznamy

### Požadavky na každý seznam:

#### ✅ 1. Fulltext filtr (bez diakritiky)
```javascript
renderTable(root, {
  columns,
  rows,
  options: {
    filterValue: filterValue,  // předej aktuální hodnotu
    filterPlaceholder: 'Hledat...'
  }
});
```

#### ✅ 2. Zobrazení archivovaných
```javascript
options: {
  customHeader: ({ filterInputHtml }) => `
    <div class="flex items-center gap-4">
      ${filterInputHtml}
      <label class="flex items-center gap-1 text-sm cursor-pointer ml-2">
        <input type="checkbox" id="toggle-archived" ${showArchived ? 'checked' : ''}/>
        Zobrazit archivované
      </label>
    </div>
  `
}
```

#### ✅ 3. Výběr řádku
```javascript
options: {
  onRowSelect: row => {
    selectedRow = (selectedRow && selectedRow.id === row.id) ? null : row;
    drawActions();  // Aktualizuj dostupné akce
  }
}
```

#### ✅ 4. Dvojklik pro editaci
```javascript
options: {
  onRowDblClick: row => {
    selectedRow = row;
    navigateTo(`#/m/XXX/f/form?id=${row.id}&mode=edit`);
  }
}
```

---

## 📊 KONTROLNÍ CHECKLIST pro KAŽDÝ modul

Použij tento checklist pro kontrolu každého modulu:

### Obecné
- [ ] Modul je odkomentován v `src/app/modules.index.js`
- [ ] `module.config.js` existuje a má správnou strukturu
- [ ] Všechny dlaždice z manifestu mají odpovídající soubory
- [ ] Všechny formuláře z manifestu mají odpovídající soubory
- [ ] Ikony existují v `src/ui/icons.js`

### Dlaždice/Přehled (tiles/prehled.js)
- [ ] Importuje všechny potřebné komponenty
- [ ] Nastavuje breadcrumbs pomocí `setBreadcrumb()`
- [ ] Vykresluje tabulku pomocí `renderTable()`
- [ ] Vykresluje commonActions do `#commonactions`
- [ ] Má fulltext filtr
- [ ] Má checkbox "Zobrazit archivované"
- [ ] Podporuje výběr řádku (onRowSelect)
- [ ] Podporuje dvojklik (onRowDblClick)
- [ ] Akce se mění podle vybraného řádku
- [ ] Refresh načítá data znovu

### Formulář (forms/form.js)
- [ ] Importuje všechny potřebné komponenty
- [ ] Nastavuje breadcrumbs
- [ ] Definuje FIELDS (včetně readonly polí)
- [ ] Vykresluje renderForm()
- [ ] Vykresluje commonActions
- [ ] Má tlačítko Historie (onHistory)
- [ ] Má tlačítko Přílohy (onAttach)
- [ ] Má tlačítko Uložit (onSave)
- [ ] Má tlačítko Zpět (onReject)
- [ ] Má tlačítko Archivovat (onArchive) s kontrolou vazeb
- [ ] grabValues() NEUKLÁDÁ readonly pole
- [ ] updated_by se automaticky nastavuje
- [ ] Použije useUnsavedHelper()
- [ ] Formátuje readonly pole (created_at, updated_at)

### Historie (forms/history.js)
- [ ] Soubor history.js existuje
- [ ] Funkce showHistoryModal() je exportována
- [ ] FIELD_LABELS obsahuje všechny pole
- [ ] Tabulka xxx_history existuje v DB
- [ ] Trigger pro ukládání historie je vytvořen
- [ ] Historie se zobrazuje v modalu
- [ ] Historie je dostupná z formuláře

### Databáze
- [ ] Tabulka xxx existuje
- [ ] Tabulka xxx_history existuje
- [ ] Sloupec `archived` existuje (boolean)
- [ ] Sloupce `created_at`, `updated_at`, `updated_by` existují
- [ ] RLS pravidla jsou nastavená
- [ ] Trigger pro historii funguje

---

## 🚀 POSTUP pro standardizaci modulu

### Krok 1: Odkomentuj modul v modules.index.js
```javascript
// src/app/modules.index.js
export const MODULE_SOURCES = [
  // ...
  () => import('../modules/XXX-nazev/module.config.js'),  // <-- Odkomentuj
  // ...
];
```

### Krok 2: Zkontroluj module.config.js
- Ověř správnou strukturu
- Ověř že defaultTile existuje
- Ověř že všechny tiles a forms mají soubory

### Krok 3: Standardizuj hlavní přehled (tiles/prehled.js)
- Použij šablonu výše
- Přidej breadcrumbs
- Přidej commonActions
- Přidej filtry
- Přidej výběr řádku
- Přidej dvojklik

### Krok 4: Standardizuj hlavní formulář (forms/form.js)
- Použij šablonu výše
- Přidej breadcrumbs
- Přidej commonActions
- Přidej všechna pole včetně readonly
- Přidej tlačítko Historie
- Přidej tlačítko Přílohy

### Krok 5: Vytvoř historii (forms/history.js)
- Zkopíruj šablonu
- Uprav název tabulky
- Uprav FIELD_LABELS
- Vytvoř tabulku v DB
- Vytvoř trigger

### Krok 6: Otestuj
- [ ] Modul se zobrazí v sidebaru
- [ ] Přehled načte data
- [ ] Filtr funguje
- [ ] Výběr řádku funguje
- [ ] Dvojklik otevře formulář
- [ ] Formulář načte data
- [ ] Uložení funguje
- [ ] Historie se zobrazuje
- [ ] Archivace funguje

---

## 📝 PŘÍKLADY – Konkrétní moduly

### Modul 040-nemovitost (vyžaduje kompletní reimplementaci)

**Problém:** Soubory `prehled.js`, `detail.js`, `edit.js` jsou prázdné (1 byte)

**Řešení:**
1. Smaž prázdné soubory
2. Vytvoř nové podle šablon výše
3. Definuj strukturu dat (jaké sloupce má nemovitost?)
4. Vytvoř DB funkce (listNemovitosti, getNemovitost, updateNemovitost)
5. Implementuj historii

### Moduly 030-pronajimatel, 050-najemnik (vyžadují rozšíření)

**Problém:** Mají základní implementaci, ale chybí:
- Breadcrumbs
- CommonActions v správném místě
- Historie změn
- Plná funkcionalita formulářů

**Řešení:**
1. Rozšiř tiles/prehled.js podle šablony
2. Rozšiř forms/form.js podle šablony
3. Přidej forms/history.js
4. Vytvoř tabulku xxx_history a trigger

---

## 🎯 PRIORITIZACE – Co dělat nejdříve

### Priorita 1 (KRITICKÉ):
1. ✅ **Modul 040-nemovitost** – Reimplementovat prázdné soubory
2. ✅ **Historie změn** – Přidat do všech hlavních modulů (030, 050)

### Priorita 2 (DŮLEŽITÉ):
3. ✅ **CommonActions** – Standardizovat ve všech modulech
4. ✅ **Breadcrumbs** – Přidat všude kde chybí
5. ✅ **Filtrace** – Sjednotit včetně "Zobrazit archivované"

### Priorita 3 (ŽÁDOUCÍ):
6. ✅ **Odkomentovat moduly** – 060-990 (postupně podle potřeby)
7. ✅ **Rozšířit ikony** – Doplnit chybějící do icons.js
8. ✅ **Dokumentace** – Vytvořit checklist pro každý modul

---

## 💡 TIPY a TRIKY

### 1. Kopírování mezi moduly
- Použij modul 010 jako REFERENČNÍ implementaci
- Při vytváření nového modulu:
  1. Zkopíruj strukturu z 010
  2. Přejmenuj entity a pole
  3. Uprav DB funkce
  4. Otestuj

### 2. Debugging
- Kontroluj console v prohlížeči
- Zkontroluj `window.registry` - musí obsahovat tvůj modul
- Zkontroluj že cesty k souborům sedí
- Použij `console.log()` pro debugging renderování

### 3. Databázové operace
- Používej VŽDY RLS pravidla
- Testuj oprávnění pro různé role
- Používej transakce při složitějších operacích
- Loguj změny do history tabulky

### 4. Performance
- Neděl zbytečné rerendery
- Cache data kde je to možné
- Používej lazy loading pro moduly
- Optimalizuj DB dotazy (select jen potřebné sloupce)

---

## 🔗 Odkazy na dokumentaci

- **Checklist**: `/docs/app-v5_kontrolni-checklist.md`
- **Návod**: `/docs/navod.md`
- **Pravidla**: `/docs/rules.md`
- **UI Komponenty**: `/src/ui/`
- **Referenční modul**: `/src/modules/010-sprava-uzivatelu/`

---

## ❓ FAQ

### Q: Co když moje entita nepotřebuje archivaci?
A: I tak přidej sloupec `archived` a tlačítko. Uživatel ho může nikdy nepoužít, ale konzistence je důležitá.

### Q: Musím mít historii změn pro každý modul?
A: Ano, pro hlavní entity (users, nemovitosti, smlouvy). Pro drobnosti (nastavení, poznámky) není nutná.

### Q: Jak přidat nové pole do formuláře?
A: 1) Přidej sloupec do DB, 2) Přidej do FIELDS v form.js, 3) Přidej do FIELD_LABELS v history.js

### Q: Kde najdu ikony?
A: V `/src/ui/icons.js` - pokud chybí, přidej ji tam

### Q: Jak odladit prázdný seznam?
A: 1) Zkontroluj console, 2) Zkontroluj DB dotaz, 3) Zkontroluj RLS pravidla, 4) Zkontroluj že sloupce odpovídají databázi

---

## ✅ ZÁVĚR

Tento návod ti poskytuje **kompletní standardizaci** pro všechny moduly. 

**Zapamatuj si:**
- Modul 010 je VZOR
- Každý modul musí mít breadcrumbs, commonActions, filtry, historii
- Formuláře mají readonly pole a updated_by
- Historie se ukládá automaticky přes trigger
- CommonActions jsou VŽDY v `#commonactions`

**Při vytváření nového modulu:**
1. Zkopíruj strukturu z 010
2. Uprav názvy entity
3. Vytvoř DB tabulky
4. Vytvoř historii
5. Otestuj

**Při opravě existujícího modulu:**
1. Použij checklist výše
2. Doplň chybějící části
3. Otestuj

Držíme se tohoto návodu a aplikace bude **konzistentní, funkční a krásná**! 🎉
