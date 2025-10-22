# Úkol 01: Hlavní sekce "Přehled" ve všech modulech

## 📋 Popis
Každý modul (např. 010, 030, 040, 050...) musí mít hlavní dlaždici/sekci "Přehled", která zobrazuje seznam všech entit modulu.

## 🎯 Cíl
Zajistit jednotný způsob zobrazení seznamu entit napříč všemi moduly aplikace.

## ✅ Akceptační kritéria
- [ ] Každý modul má sekci "Přehled"
- [ ] "Přehled" je vždy první položka v navigaci
- [ ] "Přehled" je defaultní landing sekce (nastaveno v `module.config.js` jako `defaultTile: 'prehled'`)
- [ ] Sekce zobrazuje seznam všech entit modulu v tabulkovém formátu

## 📁 Dotčené moduly
- [x] 010-sprava-uzivatelu (REFERENČNÍ - již má)
- [ ] 020-muj-ucet (zkontrolovat)
- [ ] 030-pronajimatel (zkontrolovat/doplnit)
- [ ] 040-nemovitost (zkontrolovat/doplnit)
- [ ] 050-najemnik (zkontrolovat/doplnit)
- [ ] Všechny budoucí moduly

## 🔧 Implementační kroky

### 1. Kontrola module.config.js
```javascript
export default {
  id: 'XXX-modul-nazev',
  title: 'Název modulu',
  icon: 'ikona',
  defaultTile: 'prehled', // ← MUSÍ být nastaveno na 'prehled'
  tiles: [
    {
      id: 'prehled',
      title: 'Přehled',
      icon: 'list',
      render: () => import('./tiles/prehled.js')
    },
    // další tiles...
  ]
}
```

### 2. Vytvoření tiles/prehled.js
Pokud ještě neexistuje, vytvořit soubor `tiles/prehled.js` podle vzoru z modulu 010-sprava-uzivatelu:

```javascript
import { renderTable } from '../../ui/table.js';
import { renderCommonActions } from '../../ui/commonActions.js';
import { setBreadcrumb } from '../../ui/breadcrumb.js';

export async function render(container) {
  // Nastavit breadcrumbs
  setBreadcrumb([
    { label: 'Domů', path: '/' },
    { label: 'Název Modulu', path: '#modul-id' },
    { label: 'Přehled', path: '#modul-id/prehled' }
  ]);
  
  // Načíst data
  const data = await loadData();
  
  // Vykreslit tabulku
  const tableContainer = document.createElement('div');
  renderTable(tableContainer, {
    columns: [...], // definice sloupců
    data: data,
    onRowDoubleClick: (row) => {
      // navigace na detail
    }
  });
  
  // Vykreslit akční lištu
  const actionsContainer = document.getElementById('commonactions');
  renderCommonActions(actionsContainer, {
    actions: [
      { id: 'add', label: 'Přidat', icon: 'plus' },
      { id: 'edit', label: 'Upravit', icon: 'edit' },
      { id: 'detail', label: 'Detail', icon: 'eye' },
      // další akce...
    ]
  });
  
  container.appendChild(tableContainer);
}
```

### 3. Registrace v navigaci
Ujistit se, že sekce "Přehled" je viditelná v:
- Sidebar navigaci (levý panel)
- Module dropdown menu
- Breadcrumbs navigaci

## 📝 Reference
- **Vzorový modul:** `/src/modules/010-sprava-uzivatelu/tiles/prehled.js`
- **Dokumentace:** `/docs/STANDARDIZACNI-NAVOD.md`
- **Checklist:** `/docs/MODUL-CHECKLIST.md`

## 🔗 Související úkoly
- Task 03: Navigace a breadcrumbs
- Task 07: Odstranit duplicity "Přehled" vs. "Seznam"

## ⏱️ Odhadovaný čas
- **Per modul:** 30-60 minut (pokud tile neexistuje)
- **Per modul:** 10-15 minut (pokud jen kontrola a drobné úpravy)

## 📊 Priority
**VYSOKÁ** - Toto je základní požadavek pro jednotnost UX napříč aplikací.

## ✅ Ověření
Po dokončení ověřit:
1. Otevřít modul → mělo by se zobrazit "Přehled"
2. Zkontrolovat breadcrumbs → měly by být správně nastaveny
3. Zkontrolovat sidebar → "Přehled" je první položka
4. Otevřít jiný modul a vrátit se zpět → mělo by se opět zobrazit "Přehled"
