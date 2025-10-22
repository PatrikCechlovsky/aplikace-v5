# Úkol 02: Vizuální styl "Přehledu" — barevné označení v prvním sloupci

## 📋 Popis
V tabulce "Přehledu" musí být v prvním sloupci barevný badge podle typu/role entity. Badge je stylově jednotný napříč moduly (barvy, tvar, font).

## 🎯 Cíl
Zajistit jednotný vizuální styl pro rozlišení typů entit v tabulkách všech modulů.

## 🎨 Referenční obrázky
Viz v agent-task.md: image2, image3, image4, image7

## ✅ Akceptační kritéria
- [ ] První sloupec tabulky obsahuje barevný badge
- [ ] Badge má jednotný styl (barvy, tvar, font) napříč moduly
- [ ] Každý typ/role entity má svou specifickou barvu
- [ ] Badge je čitelný a vizuálně konzistentní
- [ ] Styl odpovídá vzoru z modulu 010-sprava-uzivatelu

## 📁 Dotčené moduly
- [x] 010-sprava-uzivatelu (REFERENČNÍ - již má)
- [ ] 030-pronajimatel (doplnit barevné badge)
- [ ] 040-nemovitost (doplnit barevné badge pro typy nemovitostí)
- [ ] 050-najemnik (doplnit barevné badge)
- [ ] Všechny budoucí moduly

## 🎨 Návrh barev pro různé typy

### Modul 040 - Nemovitosti
```javascript
const propertyTypeBadges = {
  'byt': { color: 'blue', label: 'Byt', icon: 'building' },
  'dum': { color: 'green', label: 'Dům', icon: 'home' },
  'garaz': { color: 'gray', label: 'Garáž', icon: 'warehouse' },
  'pozemek': { color: 'brown', label: 'Pozemek', icon: 'map' },
  'komercni': { color: 'purple', label: 'Komerční', icon: 'briefcase' },
  'ostatni': { color: 'orange', label: 'Ostatní', icon: 'box' }
};
```

### Modul 030 - Pronajímatel
```javascript
const landlordTypeBadges = {
  'fyzicka-osoba': { color: 'blue', label: 'FO', icon: 'user' },
  'pravnicka-osoba': { color: 'purple', label: 'PO', icon: 'building' },
  'spolecnost': { color: 'green', label: 'Společnost', icon: 'users' }
};
```

### Modul 050 - Nájemník
```javascript
const tenantTypeBadges = {
  'fyzicka-osoba': { color: 'blue', label: 'FO', icon: 'user' },
  'pravnicka-osoba': { color: 'purple', label: 'PO', icon: 'building' }
};
```

## 🔧 Implementační kroky

### 1. Vytvořit helper funkci pro generování badge
Vytvořit nebo rozšířit soubor `src/ui/badge.js`:

```javascript
/**
 * Vygeneruje HTML pro barevný badge
 * @param {string} type - Typ entity
 * @param {object} config - Konfigurace badgů pro modul
 * @returns {string} HTML string pro badge
 */
export function renderBadge(type, config) {
  const badge = config[type] || { color: 'gray', label: type, icon: 'circle' };
  
  return `
    <span class="badge badge-${badge.color}" title="${badge.label}">
      <i class="icon-${badge.icon}"></i>
      ${badge.label}
    </span>
  `;
}
```

### 2. Aktualizovat CSS styly
V `styles.css` nebo modulu specifickém CSS přidat:

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  white-space: nowrap;
}

.badge-blue { background-color: #3B82F6; color: white; }
.badge-green { background-color: #10B981; color: white; }
.badge-purple { background-color: #8B5CF6; color: white; }
.badge-gray { background-color: #6B7280; color: white; }
.badge-orange { background-color: #F97316; color: white; }
.badge-brown { background-color: #92400E; color: white; }
.badge-red { background-color: #EF4444; color: white; }
.badge-yellow { background-color: #F59E0B; color: white; }
```

### 3. Přidat badge sloupec do tabulky
V `tiles/prehled.js` každého modulu:

```javascript
const columns = [
  {
    key: 'typ',
    label: 'Typ',
    sortable: true,
    render: (value, row) => renderBadge(value, propertyTypeBadges)
  },
  {
    key: 'nazev',
    label: 'Název',
    sortable: true
  },
  // další sloupce...
];
```

### 4. Aktualizovat datový model
Ujistit se, že entita má pole `typ` nebo `role` které se používá pro určení badge:

```javascript
// Příklad pro nemovitost
{
  id: 1,
  typ: 'byt',  // ← Toto pole určuje badge
  nazev: 'Byt 2+kk',
  // další pole...
}
```

## 📝 Reference
- **Vzorový modul:** `/src/modules/010-sprava-uzivatelu/tiles/prehled.js`
- **UI komponenty:** `/src/ui/badge.js` (vytvořit pokud neexistuje)
- **Styly:** `/styles.css`

## 🔗 Související úkoly
- Task 01: Hlavní sekce "Přehled"
- Task 08: Datový model pro modul 040

## ⏱️ Odhadovaný čas
- **Vytvoření badge komponenty:** 30-45 minut
- **Per modul (implementace):** 20-30 minut

## 📊 Priority
**VYSOKÁ** - Vizuální jednotnost je klíčová pro UX.

## ✅ Ověření
Po dokončení ověřit:
1. První sloupec tabulky obsahuje barevný badge
2. Barvy jsou konzistentní s definicí
3. Badge je správně zobrazen pro všechny typy entit
4. Při hover nad badge se zobrazí tooltip s plným názvem typu
5. Vizuální styl odpovídá referenčnímu modulu 010
