# ✅ KONTROLNÍ CHECKLIST PRO MODUL

> **Použití:** Tento checklist použij při vytváření nebo opravě KAŽDÉHO modulu

## Identifikace modulu

- **ID modulu:** `___-_________`
- **Název:** `_________________`
- **Datum kontroly:** `__________`
- **Kontroloval:** `_____________`

---

## 📁 STRUKTURA SLOŽEK

- [ ] Složka `src/modules/XXX-nazev/` existuje
- [ ] Soubor `module.config.js` existuje
- [ ] Složka `tiles/` existuje
- [ ] Složka `forms/` existuje (pokud má formuláře)
- [ ] Složka `services/` existuje (volitelné)
- [ ] Složka `assets/` existuje (volitelné)

---

## ⚙️ MODULE.CONFIG.JS

- [ ] Export funkce `getManifest()`
- [ ] Pole `id` je ve formátu `NNN-nazev` (3 číslice + kebab-case)
- [ ] Pole `title` je vyplněné
- [ ] Pole `icon` odpovídá ikoně v `/src/ui/icons.js`
- [ ] Pole `defaultTile` odpovídá existující dlaždici
- [ ] Pole `tiles` obsahuje seznam všech dlaždic
- [ ] Všechny dlaždice z `tiles[]` mají odpovídající soubory v `tiles/`
- [ ] Pole `forms` obsahuje seznam všech formulářů
- [ ] Všechny formuláře z `forms[]` mají odpovídající soubory v `forms/`
- [ ] Export `export default { getManifest }`

---

## 🎨 DLAŽDICE/PŘEHLED (tiles/prehled.js)

### Importy
- [ ] `renderTable` z ui/table.js
- [ ] `renderCommonActions` z ui/commonActions.js
- [ ] `setBreadcrumb` z ui/breadcrumb.js
- [ ] `navigateTo`, `route` z app.js
- [ ] `getUserPermissions` z security/permissions.js
- [ ] `showAttachmentsModal` z ui/attachments.js
- [ ] DB funkce (listXXX, archiveXXX)

### State proměnné
- [ ] `selectedRow = null`
- [ ] `showArchived = false`
- [ ] `filterValue = ''`

### Funkce render()
- [ ] Nastavuje breadcrumbs pomocí `setBreadcrumb()`
  - [ ] První položka: Domů (s href)
  - [ ] Druhá položka: Název modulu (s href)
  - [ ] Třetí položka: Přehled (bez href)
- [ ] Vytváří kontejner pro tabulku (`<div id="xxx-table"></div>`)
- [ ] Načítá data z databáze
- [ ] Zobrazuje chyby pokud načítání selže
- [ ] Filtruje archivované záznamy podle `showArchived`
- [ ] Mapuje data do `rows[]`
- [ ] Definuje `columns[]` pro tabulku
  - [ ] Obsahuje sloupec pro archivaci (archivedLabel)
  - [ ] Sloupce mají `sortable: true` kde je to vhodné
  - [ ] Sloupce mají nastavené šířky (`width`)

### Funkce drawActions()
- [ ] Získává element `#commonactions`
- [ ] Kontroluje stav vybraného řádku (`hasSel`)
- [ ] Získává roli uživatele (`userRole`)
- [ ] Kontroluje oprávnění (`getUserPermissions`)
- [ ] Volá `renderCommonActions()` se správnými parametry
- [ ] Handlers:
  - [ ] `onAdd` - navigace na create
  - [ ] `onEdit` - navigace na edit (pokud je vybraný řádek)
  - [ ] `onArchive` - archivace (pokud je vybraný řádek a není archivovaný)
  - [ ] `onAttach` - přílohy (pokud je vybraný řádek)
  - [ ] `onRefresh` - reload dat

### Funkce handleArchive()
- [ ] Kontroluje parametr `row`
- [ ] Volá `hasActiveVazby()` před archivací
- [ ] Zobrazuje alert pokud existují vazby
- [ ] Volá `archiveXXX()` pro archivaci
- [ ] Ruší výběr (`selectedRow = null`)
- [ ] Znovu vykresluje přehled (`render(root)`)

### Funkce hasActiveVazby()
- [ ] Je implementována (nebo placeholder s `return false`)
- [ ] Kontroluje vazby v databázi (pokud relevantní)

### Volání renderTable()
- [ ] Má správné parametry (columns, rows, options)
- [ ] `options.moduleId` je nastaven
- [ ] `options.filterValue` je předán
- [ ] `options.customHeader` obsahuje:
  - [ ] `filterInputHtml` (filtr)
  - [ ] Checkbox "Zobrazit archivované"
- [ ] `options.onRowSelect` mění `selectedRow` a volá `drawActions()`
- [ ] `options.onRowDblClick` naviguje na edit formulář

### Event listeners
- [ ] Listener pro checkbox "Zobrazit archivované"
- [ ] Při změně checkboxu se volá `render(root)`

### Export
- [ ] `export async function render(root)`
- [ ] `export default { render }`

---

## 📝 FORMULÁŘ (forms/form.js)

### Importy
- [ ] `setBreadcrumb` z ui/breadcrumb.js
- [ ] `renderForm` z ui/form.js
- [ ] `renderCommonActions` z ui/commonActions.js
- [ ] `navigateTo` z app.js
- [ ] DB funkce (getXXX, updateXXX, archiveXXX)
- [ ] `useUnsavedHelper` z ui/unsaved-helper.js
- [ ] `showAttachmentsModal` z ui/attachments.js
- [ ] `showHistoryModal` z ./history.js ⚠️ DŮLEŽITÉ!
- [ ] `setUnsaved` z app.js

### Pomocné funkce
- [ ] `getHashParams()` - parsování URL parametrů
- [ ] `formatCzechDate()` - formátování datumů

### Definice FIELDS
- [ ] Všechna základní pole entity
- [ ] Adresní pole (pokud relevantní): street, house_number, city, zip
- [ ] Systémová pole: archived, note
- [ ] **READONLY auditní pole:**
  - [ ] `last_login` (pokud relevantní)
  - [ ] `updated_at` (POVINNÉ)
  - [ ] `updated_by` (POVINNÉ)
  - [ ] `created_at` (POVINNÉ)
- [ ] Všechna readonly pole mají `type: 'label'` a `readOnly: true`
- [ ] Readonly pole s datumy mají `format: formatCzechDate`

### Funkce render() - Struktura
- [ ] Získává parametry z URL (`getHashParams()`)
- [ ] Určuje mód (read/edit)
- [ ] **NAČÍTÁNÍ DAT:**
  - [ ] Kontroluje zda existuje `id`
  - [ ] Volá `getXXX(id)` pro načtení dat
  - [ ] Zobrazuje chybu pokud načítání selže
  - [ ] Zobrazuje chybu pokud záznam neexistuje
  - [ ] Formátuje readonly pole pomocí `format` funkce
  - [ ] Nahrazuje null v readonly polích za '--'
  - [ ] Nastavuje default hodnotu pro `archived` (false)
- [ ] **BREADCRUMBS:**
  - [ ] První položka: Domů
  - [ ] Druhá položka: Název modulu
  - [ ] Třetí položka: Formulář
  - [ ] Čtvrtá položka: Jméno/název záznamu
- [ ] **DEFINICE AKCÍ:**
  - [ ] `actionsByMode` pro read a edit
  - [ ] Prázdný objekt `handlers`
- [ ] **READ MÓD handlers:**
  - [ ] `onEdit` - přepne do edit módu
  - [ ] `onReject` - návrat na přehled
- [ ] **EDIT MÓD handlers:**
  - [ ] `onSave` - uložení změn
    - [ ] Volá `grabValues(root)`
    - [ ] Nastavuje `updated_by` z `window.currentUser`
    - [ ] Volá `updateXXX()`
    - [ ] Zobrazuje chybu nebo úspěch
    - [ ] Volá `setUnsaved(false)`
    - [ ] Znovu načítá a vykresluje data
  - [ ] `onReject` - návrat na přehled
  - [ ] `onArchive` - archivace záznamu
    - [ ] Kontroluje roli uživatele
    - [ ] Kontroluje že záznam není již archivován
    - [ ] Volá `hasActiveVazby()`
    - [ ] Volá `archiveXXX()`
    - [ ] Naviguje na přehled
- [ ] **SPOLEČNÉ handlers:**
  - [ ] `onAttach` - přílohy (pokud existuje id)
  - [ ] `onHistory` - historie změn (pokud existuje id) ⚠️ DŮLEŽITÉ!
- [ ] **VYKRESLENÍ:**
  - [ ] Volá `renderCommonActions()` se správnými parametry
  - [ ] Volá `renderForm()` se správnými parametry
    - [ ] Správný `readOnly` podle módu
    - [ ] `showSubmit: false`
    - [ ] Layout s columns a density
    - [ ] Sekce pro logické rozdělení polí
  - [ ] Volá `useUnsavedHelper()` pro ochran u dat

### Funkce grabValues()
- [ ] Vytváří prázdný objekt
- [ ] Prochází všechna FIELDS
- [ ] **PŘESKAKUJE readonly pole!** ⚠️ KRITICKÉ!
- [ ] Hledá elementy podle `name`
- [ ] Správně zpracovává checkboxy (boolean)
- [ ] Vrací objekt s hodnotami

### Funkce hasActiveVazby()
- [ ] Je implementována (nebo placeholder)
- [ ] Kontroluje vazby v databázi

### Export
- [ ] `export async function render(root)`
- [ ] `export default { render }`

---

## 📜 HISTORIE (forms/history.js)

⚠️ **POVINNÉ PRO HLAVNÍ ENTITY!**

- [ ] Soubor `forms/history.js` existuje
- [ ] Import `supabase` z db.js
- [ ] Definice `FIELD_LABELS` s českými názvy všech polí
  - [ ] Obsahuje VŠECHNA pole z FIELDS v form.js
- [ ] Funkce `showHistoryModal(entityId)`
  - [ ] Volá `supabase.from('xxx_history')`  ⚠️ SPRÁVNÝ NÁZEV TABULKY!
  - [ ] Filtruje podle `entity_id`
  - [ ] Řadí podle `changed_at` sestupně
  - [ ] Zobrazuje alert při chybě
  - [ ] Zobrazuje alert pokud není historie
  - [ ] Vytváří HTML tabulku s historií
  - [ ] Vytváří modal s křížkem pro zavření
- [ ] Export `export async function showHistoryModal()`

---

## 💾 DATABÁZE

### Hlavní tabulka
- [ ] Tabulka `xxx` existuje v Supabase
- [ ] Sloupec `id` (uuid, primary key)
- [ ] Sloupec `archived` (boolean, default false)
- [ ] Sloupec `created_at` (timestamptz, default now())
- [ ] Sloupec `updated_at` (timestamptz)
- [ ] Sloupec `updated_by` (text)
- [ ] Další specifické sloupce entity
- [ ] RLS pravidla jsou nastavená

### Tabulka historie
- [ ] Tabulka `xxx_history` existuje
- [ ] Sloupce:
  - [ ] `id` (uuid, primary key)
  - [ ] `entity_id` (uuid, foreign key)
  - [ ] `field` (text)
  - [ ] `old_value` (text)
  - [ ] `new_value` (text)
  - [ ] `changed_by` (text)
  - [ ] `changed_at` (timestamptz, default now())
- [ ] Index `idx_xxx_history_entity` na `entity_id`
- [ ] Foreign key s `ON DELETE CASCADE`

### Trigger pro historii
- [ ] Funkce `track_xxx_changes()` existuje
- [ ] Trigger `xxx_history_trigger` je vytvořen
- [ ] Trigger se spouští `AFTER UPDATE`
- [ ] Trigger správně ukládá změny do historie

### DB funkce (v db.js nebo db/xxx.js)
- [ ] `listXXX()` - načtení seznamu
- [ ] `getXXX(id)` - načtení jednoho záznamu
- [ ] `updateXXX(id, values, user)` - aktualizace
- [ ] `archiveXXX(id, user)` - archivace (nastavení archived=true)
- [ ] Funkce správně pracují s RLS
- [ ] Funkce vracejí `{ data, error }` formát

---

## 🎛️ COMMON ACTIONS

- [ ] CommonActions jsou vykresleny do `#commonactions` (NIKDY jinde!)
- [ ] **V přehledu (tiles):**
  - [ ] `add` - přidání nového
  - [ ] `edit` - editace vybraného
  - [ ] `archive` - archivace vybraného
  - [ ] `attach` - přílohy vybraného
  - [ ] `refresh` - reload dat
- [ ] **Ve formuláři (read):**
  - [ ] `edit` - přepnutí do edit módu
  - [ ] `reject` - návrat zpět
  - [ ] `attach` - přílohy
  - [ ] `history` - historie změn ⚠️ POVINNÉ!
- [ ] **Ve formuláři (edit):**
  - [ ] `save` - uložení
  - [ ] `reject` - návrat zpět
  - [ ] `attach` - přílohy
  - [ ] `archive` - archivace (s kontrolou vazeb)
  - [ ] `history` - historie změn ⚠️ POVINNÉ!
- [ ] Akce bez handleru se nezobrazují (disabled)
- [ ] Akce se povolují/zakazují podle stavu (vybraný řádek, role)

---

## 🥖 BREADCRUMBS

- [ ] Breadcrumbs jsou nastaveny ve VŠECH views (tiles i forms)
- [ ] První položka je vždy "Domů" s `href: '#/'` a `icon: 'home'`
- [ ] Druhá položka je název modulu s href na modul
- [ ] Další položky dle kontextu (přehled, formulář, jméno)
- [ ] Poslední položka NIKDY nemá href

---

## 🗂️ FILTRACE A SEZNAMY

- [ ] Fulltext filtr funguje (bez diakritiky)
- [ ] Placeholder pro filtr je nastaven
- [ ] Checkbox "Zobrazit archivované" funguje
- [ ] Výběr řádku mění barvu řádku
- [ ] Výběr řádku aktualizuje dostupné akce
- [ ] Dvojklik otevírá editaci
- [ ] Sloupce jsou řaditelné (sortable: true)
- [ ] Sloupce mají vhodné šířky
- [ ] Data se načítají z databáze
- [ ] Chyby při načítání se zobrazují

---

## 🔧 SIDEBAR

- [ ] Modul se zobrazuje v sidebaru (automaticky z registry)
- [ ] Ikona modulu se zobrazuje správně
- [ ] Kliknutí na modul přesměruje na defaultTile
- [ ] Submenu (tiles) se zobrazuje po rozbalen í
- [ ] Všechny tiles jsou dostupné v submenu

---

## 🎨 UI A UX

- [ ] Formuláře mají sekce pro logické rozdělení polí
- [ ] Readonly pole jsou vizuálně odlišená (disabled)
- [ ] Requiredé pole jsou označené
- [ ] Tlačítka mají správné ikony
- [ ] Tooltipy jsou nastavené
- [ ] Loading stavy jsou ošetřené
- [ ] Chyby se zobrazují srozumitelně
- [ ] Úspěšné akce mají feedback (alert, toast)

---

## 🔒 BEZPEČNOST

- [ ] RLS pravidla jsou nastavená v Supabase
- [ ] Oprávnění jsou kontrolována v UI (`getUserPermissions`)
- [ ] Sensitive akce (archive, delete) kontrolují oprávnění
- [ ] Updated_by se automaticky nastavuje
- [ ] Historie změn loguje kdo co změnil

---

## ✅ TESTOVÁNÍ

### Manuální testy
- [ ] Modul se zobrazuje v sidebaru
- [ ] Kliknutí na modul načte defaultTile
- [ ] Přehled načte data z databáze
- [ ] Filtr funguje (zkus vyhledat konkrétní záznam)
- [ ] Checkbox "Zobrazit archivované" přepíná viditelnost
- [ ] Výběr řádku aktivuje tlačítka (edit, archive, attach)
- [ ] Dvojklik otevře formulář v edit módu
- [ ] Formulář načte data vybraného záznamu
- [ ] Readonly pole jsou zobrazená a nelze je editovat
- [ ] Změna hodnoty aktivuje "unsaved changes" varování
- [ ] Uložení funguje a aktualizuje data
- [ ] Tlačítko Historie otevře modal s historií změn
- [ ] Tlačítko Přílohy otevře modal s přílohami
- [ ] Archivace funguje a skryje záznam (pokud není zaškrtnuto "Zobrazit archivované")
- [ ] Refresh znovu načte data

### Automatické testy (pokud existují)
- [ ] Unit testy pro DB funkce
- [ ] Integration testy pro UI komponenty
- [ ] E2E testy pro kritické workflow

---

## 📊 VÝSLEDEK

### Počet splněných položek:
- Struktura složek: ___/6
- module.config.js: ___/10
- tiles/prehled.js: ___/40
- forms/form.js: ___/50
- forms/history.js: ___/8
- Databáze: ___/20
- Common Actions: ___/10
- Breadcrumbs: ___/4
- Filtrace: ___/9
- Sidebar: ___/4
- UI a UX: ___/8
- Bezpečnost: ___/5
- Testování: ___/15

### CELKEM: ___/189

### Stav modulu:
- [ ] ✅ **KOMPLETNÍ** (180-189 bodů) - Modul je plně standardizovaný
- [ ] ⚠️ **TÉMĚŘ HOTOVO** (150-179 bodů) - Chybí jen detaily
- [ ] 🔧 **VYŽADUJE PRÁCI** (100-149 bodů) - Základní funkcionalita OK, chybí rozšíření
- [ ] ❌ **NEKOMPLETNÍ** (0-99 bodů) - Modul vyžaduje zásadní přepracování

### Poznámky:
```
_____________________________________________
_____________________________________________
_____________________________________________
```

---

## 📝 AKČNÍ PLÁN

### Co je potřeba dodělat:
1. ___________________________________
2. ___________________________________
3. ___________________________________
4. ___________________________________
5. ___________________________________

### Priorita:
- [ ] KRITICKÉ (blokuje funkčnost)
- [ ] VYSOKÁ (důležité pro UX)
- [ ] STŘEDNÍ (žádoucí vylepšení)
- [ ] NÍZKÁ (nice to have)

### Odhadovaný čas: _____ hodin

### Zodpovědná osoba: ___________________

### Termín dokončení: ___________________

---

**Datum vytvoření checklistu:** ___________
**Verze aplikace:** v5
**Verze checklistu:** 1.0
