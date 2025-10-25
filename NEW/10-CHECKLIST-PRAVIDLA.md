# 10 - Checklist a Pravidla Vývoje

> **Tento dokument obsahuje kontrolní seznamy, pravidla a standardy pro vývoj aplikace.**

---

## 📖 Obsah

1. [Globální Pravidla](#globální-pravidla)
2. [Checklist před Commitem](#checklist-před-commitem)
3. [Checklist Nového Modulu](#checklist-nového-modulu)
4. [Checklist Formuláře](#checklist-formuláře)
5. [Checklist Přehledu](#checklist-přehledu)
6. [Coding Standards](#coding-standards)
7. [Git Workflow](#git-workflow)

---

## 🌍 Globální Pravidla

### VŽDY dělat:

✅ **Používat modul 010 jako vzor**
- Je to referenční modul s nejlepšími praktikami
- Všechny nové moduly by měly následovat jeho strukturu

✅ **Dodržovat strukturu souborů**
```
src/modules/XXX-nazev/
├── module.config.js
├── db.js
├── tiles/
│   └── prehled.js
└── forms/
    ├── detail.js
    ├── edit.js
    └── create.js
```

✅ **Aktualizovat dokumentaci**
- Při změně kódu aktualizuj dokumentaci
- Při přidání modulu aktualizuj README.md
- Při změně DB aktualizuj 07-DATABASE-SCHEMA.md

✅ **Testovat změny**
- Otevři aplikaci v prohlížeči
- Projdi všechny view nového modulu
- Zkus všechny akce (add, edit, archive, ...)
- Zkontroluj console (nesmí být errory)

✅ **Commitovat často**
- Malé, logické commity
- Popisné commit zprávy
- Jeden úkol = jeden commit

### NIKDY nedělat:

❌ **Mazat funkční kód**
- Pokud něco funguje, neměň to bez důvodu

❌ **Měnit strukturu bez konzultace**
- Struktura je konzistentní v celé aplikaci
- Změna struktury = změna ve všech modulech

❌ **Commitovat secrets**
- API klíče, hesla, tokeny NIKDY do gitu
- Používej environment variables

❌ **Ignorovat bezpečnost**
- Vždy validuj input
- Vždy používej RLS v databázi
- Vždy escapuj HTML

❌ **Odstraňovat testy**
- Testy jsou důležité
- Pokud test selže, oprav kód, ne test

---

## ✅ Checklist před Commitem

### Kód:

- [ ] Kód funguje lokálně (otestováno v prohlížeči)
- [ ] Žádné console errory
- [ ] Žádné console.log() (nebo smysluplné)
- [ ] Kód je čitelný a má komentáře (kde potřeba)
- [ ] Použity správné naming conventions
- [ ] Žádné dead code (nepoužívaný kód)
- [ ] Žádné TODO bez plánu (nebo vyřešené)

### Struktura:

- [ ] Dodržena struktura modulů
- [ ] Soubory na správných místech
- [ ] Názvy souborů konzistentní (lowercase, pomlčky)

### Dokumentace:

- [ ] README.md aktualizován (pokud nový modul)
- [ ] Databázové schéma aktualizováno (pokud DB změny)
- [ ] Komentáře v kódu (kde potřeba)
- [ ] JSDoc pro veřejné funkce

### Git:

- [ ] Commit message je popisná
- [ ] Commit obsahuje logickou změnu
- [ ] Žádné velké soubory (buildy, node_modules, ...)
- [ ] .gitignore správně nastaven

### Bezpečnost:

- [ ] Žádné secrets v kódu
- [ ] Input validace provedena
- [ ] RLS policies nastaveny (pokud DB změny)
- [ ] Escapování HTML (kde potřeba)

---

## 📦 Checklist Nového Modulu

### 1. Plánování (před začátkem):

- [ ] Jasný účel modulu
- [ ] Databázové schéma navrženo
- [ ] Seznam tiles a forms
- [ ] Oprávnění definována

### 2. Struktura:

- [ ] Složka vytvořena: `src/modules/XXX-nazev/`
- [ ] `module.config.js` vytvořen
- [ ] `db.js` vytvořen
- [ ] Složky `tiles/` a `forms/` vytvořeny

### 3. module.config.js:

- [ ] `id` správně nastaveno (XXX-nazev)
- [ ] `title` zadán
- [ ] `icon` vybráno
- [ ] `defaultTile` nastaven
- [ ] `tiles` array vyplněn
- [ ] `forms` array vyplněn
- [ ] Export: `export async function getManifest()`

### 4. db.js:

- [ ] `getAll[Entity]()` implementováno
- [ ] `get[Entity]ById(id)` implementováno
- [ ] `create[Entity](data)` implementováno
- [ ] `update[Entity](id, data)` implementováno
- [ ] `archive[Entity](id)` implementováno (pokud potřeba)
- [ ] Všechny funkce vrací `{data, error}` formát

### 5. Tiles (přehledy):

- [ ] Alespoň 1 tile (prehled.js)
- [ ] Breadcrumb nastaven
- [ ] CommonActions vykresleny
- [ ] Tabulka vykreslena
- [ ] Filtr implementován (search + archived checkbox)
- [ ] onRowClick navigace na detail
- [ ] onRowSelect uložení vybraného řádku

### 6. Forms:

- [ ] `detail.js` vytvořen (read-only view)
- [ ] `edit.js` nebo `create.js` vytvořen
- [ ] Breadcrumb nastaven
- [ ] CommonActions vykresleny
- [ ] Sekce (minimálně: Základní údaje, Systém)
- [ ] Readonly pole v samostatné sekci
- [ ] Validace implementována
- [ ] Unsaved helper aktivován (edit/create)
- [ ] Historie dostupná (pokud entita má history)

### 7. Databáze:

- [ ] Tabulka vytvořena
- [ ] Sloupce správně definované
- [ ] Primary key (UUID)
- [ ] Foreign keys (pokud potřeba)
- [ ] Indexy na často vyhledávané sloupce
- [ ] RLS policies nastaveny
- [ ] Trigger pro updated_at
- [ ] Historie tabulka (optional, ale doporučeno)

### 8. Registrace:

- [ ] Modul přidán do `src/app/modules.index.js`
- [ ] Modul se objeví v sidebaru
- [ ] Navigace funguje

### 9. Testování:

- [ ] Modul se načte bez chyb
- [ ] Breadcrumb správný na všech view
- [ ] CommonActions fungují
- [ ] Lze vytvořit nový záznam
- [ ] Lze upravit záznam
- [ ] Lze archivovat záznam (pokud potřeba)
- [ ] Historie funguje (pokud implementována)
- [ ] Přílohy fungují (pokud implementovány)

### 10. Dokumentace:

- [ ] README.md aktualizován (přidán modul do seznamu)
- [ ] Databázové schéma aktualizováno
- [ ] Komentáře v kódu

---

## 📝 Checklist Formuláře

### Struktura:

- [ ] Sekce logicky rozdělené
- [ ] Grid layout (2 sloupce na desktopu)
- [ ] Readonly pole v samostatné sekci (Systém)
- [ ] Konzistentní spacing (gap-4, space-y-6)

### Pole:

- [ ] Všechna povinná pole označena `*`
- [ ] Labels přítomny u všech polí
- [ ] Placeholder text (kde vhodné)
- [ ] Správný type (email, number, date, ...)
- [ ] Validace (required, min, max, pattern, ...)

### Akce:

- [ ] CommonActions správně nastaveny
- [ ] Save handler implementován
- [ ] Reject/Cancel handler implementován
- [ ] Historie dostupná (pokud entita má history)
- [ ] Přílohy dostupné (pokud entita má attachments)

### UX:

- [ ] Unsaved helper aktivován (varování při odchodu)
- [ ] Loading stav při ukládání (optional)
- [ ] Toast notifikace po akci (success/error)
- [ ] Error handling (zobrazení chyb)
- [ ] Responsive (2 sloupce → 1 na mobilu)

### Bezpečnost:

- [ ] Input validace (frontend)
- [ ] RLS policies (backend)
- [ ] XSS protection (escape user input)

---

## 📊 Checklist Přehledu (Tile)

### Struktura:

- [ ] Filtr header (search + archived checkbox)
- [ ] Tabulka s daty
- [ ] Paginace (pokud potřeba)

### Tabulka:

- [ ] Sloupce správně definované (key, label, width)
- [ ] Sortovatelné sloupce (sortable: true)
- [ ] onRowClick navigace na detail
- [ ] onRowSelect uložení vybraného řádku
- [ ] Vizuální feedback při výběru řádku

### Filtry:

- [ ] Fulltext search implementován
- [ ] "Zobrazit archivované" checkbox
- [ ] Další filtry (pokud potřeba)
- [ ] Filtry se aplikují okamžitě

### Akce:

- [ ] CommonActions správně nastaveny
- [ ] Add handler (navigace na create)
- [ ] Edit handler (s kontrolou vybraného řádku)
- [ ] Archive handler (s potvrzením)
- [ ] Refresh handler (reload dat)

### UX:

- [ ] Loading stav při načítání (optional)
- [ ] Empty state (žádná data)
- [ ] Error handling
- [ ] Toast notifikace po akci

---

## 💻 Coding Standards

### Naming Conventions:

```javascript
// Soubory: lowercase, pomlčky
prehled.js
detail-view.js

// Funkce: camelCase
function getUserById(id) {}
async function createContract(data) {}

// Konstanty: UPPER_SNAKE_CASE
const API_URL = 'https://...';
const MAX_ITEMS = 100;

// Komponenty: PascalCase (pokud budeme používat)
class UserCard {}

// Private funkce: _camelCase (convention)
function _internalHelper() {}
```

### Komentáře:

```javascript
// ✅ DOBRÉ: Vysvětluje PROČ, ne CO
// Používáme timeout kvůli race condition v Supabase
await delay(100);

// ✅ DOBRÉ: JSDoc pro veřejné funkce
/**
 * Vytvoří novou smlouvu
 * @param {Object} data - Data smlouvy
 * @returns {Promise<{data, error}>}
 */
export async function createContract(data) {}

// ❌ ŠPATNÉ: Vysvětluje zřejmé
// Vytvoř proměnnou jméno
const jmeno = 'Jan';
```

### Error Handling:

```javascript
// ✅ DOBRÉ: Vrať {data, error}
try {
  const result = await supabase.from('users').select();
  return { data: result.data, error: null };
} catch (err) {
  return { data: null, error: err };
}

// ✅ DOBRÉ: Zobraz uživateli
if (error) {
  toast('Chyba při načítání dat', 'error');
  console.error(error);
  return;
}

// ❌ ŠPATNÉ: Tiché selhání
try {
  await saveData();
} catch {}
```

### Async/Await:

```javascript
// ✅ DOBRÉ: Async/await
async function loadData() {
  const { data, error } = await getAllUsers();
  if (error) {
    // handle error
    return;
  }
  // use data
}

// ❌ ŠPATNÉ: Promise chains (pokud lze použít async/await)
getAllUsers()
  .then(result => {
    // ...
  })
  .catch(err => {
    // ...
  });
```

---

## 🔄 Git Workflow

### Branch Strategy:

```bash
# main - produkční branch (stable)
# develop - vývojový branch
# feature/xxx - feature branches

# Vytvoř feature branch
git checkout -b feature/modul-smlouvy

# Pracuj na feature
git add .
git commit -m "Add contracts module structure"

# Push do remote
git push origin feature/modul-smlouvy

# Vytvoř Pull Request
# Po review → merge do develop
# Po testování → merge do main
```

### Commit Messages:

```bash
# ✅ DOBRÉ: Popisné, stručné
git commit -m "Add contracts module with basic CRUD"
git commit -m "Fix breadcrumb navigation in properties module"
git commit -m "Update database schema documentation"

# ❌ ŠPATNÉ: Nepopisné
git commit -m "fix"
git commit -m "wip"
git commit -m "changes"
```

### Formát commit message:

```
<type>: <short description>

<optional longer description>

<optional footer>

Typy:
- feat: Nová funkcionalita
- fix: Oprava chyby
- docs: Dokumentace
- style: Formátování (bez změny logiky)
- refactor: Refactoring kódu
- test: Přidání testů
- chore: Údržba (build, dependencies, ...)
```

Příklady:
```bash
git commit -m "feat: Add contracts module with CRUD operations"
git commit -m "fix: Resolve breadcrumb navigation issue in properties"
git commit -m "docs: Update database schema with contracts table"
git commit -m "refactor: Extract table rendering to separate component"
```

---

## 🎯 Prioritizace Úkolů

### Kritické (ihned):

1. Bezpečnostní chyby
2. Blocker bugs (aplikace nefunguje)
3. Data loss problémy

### Vysoké (tento týden):

1. Dokončení rozpracovaných modulů
2. Významné bugy
3. Standardizace (breadcrumbs, historie)

### Střední (tento měsíc):

1. Nové moduly (podle plánu)
2. Menší bugy
3. UX vylepšení

### Nízké (časem):

1. Nice-to-have features
2. Optimalizace
3. Refactoring

---

## ✅ Závěrečný Checklist

### Před nasazením do produkce:

- [ ] Všechny moduly otestovány
- [ ] Žádné console errory
- [ ] Bezpečnostní review proveden
- [ ] RLS policies na všech tabulkách
- [ ] Dokumentace kompletní
- [ ] Backup databáze nastaven
- [ ] SSL certifikát aktivní
- [ ] Environment variables správně nastaveny
- [ ] Error monitoring aktivní (optional)
- [ ] Analytics aktivní (optional)

---

**Konec dokumentu - Checklist a Pravidla** ✅
