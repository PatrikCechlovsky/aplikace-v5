# Úkol 07: Odstranit duplicity "Přehled" vs. "Seznam"

## 📋 Popis
V modulech, kde existuje současně "Přehled" a "Seznam", sloučit do jedné sekce "Přehled". "Seznam" se ruší jako duplicita.

## 🎯 Cíl
Odstranit matoucí duplicitní sekce a zajistit že každý modul má pouze jednu hlavní sekci pro zobrazení entit.

## 🎨 Referenční obrázky
Viz v agent-task.md: image7 (fialově označená duplicita)

## ✅ Akceptační kritéria
- [ ] V žádném modulu není současně "Přehled" i "Seznam"
- [ ] Ponechána pouze sekce "Přehled"
- [ ] Veškerá funkcionalita je zachována v "Přehledu"
- [ ] Odkazy a navigace jsou správně aktualizovány
- [ ] Breadcrumbs používají "Přehled"

## 📁 Dotčené moduly
- [ ] 030-pronajimatel (zkontrolovat)
- [ ] 040-nemovitost (zkontrolovat)
- [ ] 050-najemnik (zkontrolovat)
- [ ] Všechny ostatní moduly kde existuje duplicita

## 🔧 Implementační kroky

### 1. Audit modulů - identifikace duplicit

```bash
# Zkontrolovat každý modul
cd /src/modules/XXX-modul/
ls tiles/

# Hledat:
# - prehled.js
# - seznam.js
# - list.js
# nebo podobné duplicitní soubory
```

### 2. Zkontrolovat module.config.js

```javascript
// ❌ ŠPATNĚ - duplicitní tiles
export default {
  id: 'XXX-modul',
  title: 'Modul',
  defaultTile: 'prehled',
  tiles: [
    {
      id: 'prehled',
      title: 'Přehled',
      icon: 'list',
      render: () => import('./tiles/prehled.js')
    },
    {
      id: 'seznam',  // ← DUPLICITA!
      title: 'Seznam',
      icon: 'list',
      render: () => import('./tiles/seznam.js')
    }
  ]
}

// ✅ SPRÁVNĚ - pouze Přehled
export default {
  id: 'XXX-modul',
  title: 'Modul',
  defaultTile: 'prehled',
  tiles: [
    {
      id: 'prehled',
      title: 'Přehled',
      icon: 'list',
      render: () => import('./tiles/prehled.js')
    }
  ]
}
```

### 3. Porovnat funkcionalitu obou sekcí

Před smazáním "Seznam" zkontrolovat zda neobsahuje nějakou unikátní funkcionalitu:

```javascript
// Porovnat:
// - tiles/prehled.js
// - tiles/seznam.js

// Kontrolní seznam:
// [ ] Sloupce v tabulce
// [ ] Filtry
// [ ] CommonActions
// [ ] Dvojklik na řádek
// [ ] Checkbox "Zobrazit archivované"
// [ ] Breadcrumbs
// [ ] Load/save stavu
```

### 4. Sloučit funkcionalitu do "Přehled"

Pokud "Seznam" obsahuje nějakou unikátní funkcionalitu, přenést ji do "Přehled":

```javascript
// tiles/prehled.js
export async function render(container) {
  setBreadcrumb([
    { label: 'Domů', path: '/' },
    { label: 'Modul', path: '#XXX-modul' },
    { label: 'Přehled', path: '#XXX-modul/prehled' }
  ]);
  
  // Kombinace funkcí z obou sekcí
  const data = await loadData({
    includeArchived: showArchived,
    // ... další filtry které byly jen v "Seznam"
  });
  
  // Všechny sloupce z obou sekcí
  const columns = [
    // sloupce z prehled.js
    // + sloupce z seznam.js (pokud nějaké chyběly)
  ];
  
  renderTable(container, {
    columns: columns,
    data: data,
    // ... všechny features
  });
  
  // CommonActions s kombinací akcí
  renderCommonActions(actionsContainer, {
    actions: [
      // akce z prehled.js
      // + akce z seznam.js (pokud nějaké chyběly)
    ]
  });
}
```

### 5. Odstranit duplicitní soubory

```bash
# Smazat duplicitní tile
rm tiles/seznam.js
# nebo
rm tiles/list.js

# Zkontrolovat git status
git status

# Commitnout změny
git add .
git commit -m "Remove duplicate 'Seznam' tile, keep only 'Přehled'"
```

### 6. Aktualizovat odkazy a navigaci

#### 6.1 Zkontrolovat odkazy v kódu
```bash
# Najít všechny odkazy na 'seznam'
grep -r "seznam" src/modules/XXX-modul/
grep -r "#XXX-modul/seznam" src/

# Nahradit za 'prehled'
# Např. #030-pronajimatel/seznam → #030-pronajimatel/prehled
```

#### 6.2 Aktualizovat navigaci v UI
Zkontrolovat že sidebar, menu, breadcrumbs neobsahují odkaz na "Seznam".

#### 6.3 Aktualizovat defaultTile
V `module.config.js` ověřit že `defaultTile: 'prehled'` (ne 'seznam').

### 7. Aktualizovat dokumentaci modulu

V `assets/README.md` modulu:

```markdown
## Tiles (sekce modulu)

### Přehled
- **Path:** `#XXX-modul/prehled`
- **Popis:** Hlavní přehled všech entit modulu
- **Features:**
  - Seznam všech entit
  - Filtrace a vyhledávání
  - Checkbox "Zobrazit archivované"
  - CommonActions (Přidat, Upravit, Detail, Archivovat, ...)
  - Double-click na řádek pro detail

~~### Seznam~~ (ODSTRANĚNO - sloučeno do "Přehled")
```

### 8. Testování

Po sloučení otestovat:

```bash
# 1. Spustit aplikaci
npm run dev

# 2. Otevřít modul
# 3. Ověřit že se zobrazí "Přehled"
# 4. Zkontrolovat sidebar - není tam "Seznam"
# 5. Zkontrolovat breadcrumbs - obsahují "Přehled"
# 6. Otestovat všechny funkce (filtry, akce, navigace)
# 7. Ověřit že nic nechybí z původního "Seznam"
```

## 📝 Checklist pro každý modul

### Příprava
- [ ] Identifikovat moduly s duplicitou "Přehled" / "Seznam"
- [ ] Porovnat funkcionalitu obou sekcí
- [ ] Určit co je potřeba sloučit

### Sloučení
- [ ] Přenést unikátní funkcionalitu do "Přehled"
- [ ] Aktualizovat `module.config.js` (odstranit 'seznam' z tiles)
- [ ] Smazat duplicitní soubor `tiles/seznam.js`

### Aktualizace odkazů
- [ ] Nahradit všechny odkazy `#XXX/seznam` → `#XXX/prehled`
- [ ] Aktualizovat breadcrumbs
- [ ] Ověřit defaultTile v config

### Dokumentace
- [ ] Aktualizovat `assets/README.md`
- [ ] Aktualizovat `assets/checklist.md` (pokud existuje)

### Testování
- [ ] Otevřít modul → zobrazí se "Přehled"
- [ ] Sidebar neobsahuje "Seznam"
- [ ] Všechny funkce fungují správně
- [ ] Žádné chybové odkazy (404)

## 📝 Reference
- **Vzorový modul:** `/src/modules/010-sprava-uzivatelu/` (nemá duplicitu)
- **Dokumentace:** `/docs/STANDARDIZACNI-NAVOD.md`

## 🔗 Související úkoly
- Task 01: Hlavní sekce "Přehled"
- Task 03: Navigace a breadcrumbs

## ⏱️ Odhadovaný čas
- **Per modul (jednoduchá sloučení):** 15-30 minut
- **Per modul (komplexní sloučení):** 45-60 minut

## 📊 Priority
**STŘEDNÍ** - Důležité pro UX, ale ne kritické pro fungování.

## ⚠️ Upozornění

**PŘED SMAZÁNÍM:**
1. ✅ Porovnat funkcionalitu obou sekcí
2. ✅ Přenést vše důležité do "Přehled"
3. ✅ Zkontrolovat všechny odkazy v kódu
4. ✅ Otestovat že nic nechybí

**NIKDY:**
- ❌ Nemazat bez kontroly funkcionalit!
- ❌ Nezapomenout aktualizovat odkazy!
- ❌ Netestovat před commitnutím!

## ✅ Ověření
Po dokončení ověřit:
1. V modulu je pouze sekce "Přehled"
2. "Seznam" již není v sidebaru ani v module.config.js
3. Soubor tiles/seznam.js je smazán
4. Všechny odkazy fungují (žádné 404)
5. Breadcrumbs obsahují "Přehled"
6. Všechny funkce jsou dostupné v "Přehled"
7. Žádná funkčnost nebyla ztracena
8. Konzistence napříč moduly
