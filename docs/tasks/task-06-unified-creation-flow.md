# Úkol 06: Logika zakládání - žádné matoucí formuláře v sidebaru

## 📋 Popis
V sidebaru nebude zbytečně mnoho odkazů na různé typy formulářů. Všechny možnosti založení jsou sjednoceny do jednoho flow.

## 🎯 Cíl
Zjednodušit proces vytváření nových entit a odstranit matoucí duplicitní odkazy na formuláře.

## 🎨 Referenční obrázky
Viz v agent-task.md: image6 (barevná tlačítka pro výběr typu)

## ✅ Akceptační kritéria
- [ ] V sidebaru není více formulářů pro různé typy stejné entity
- [ ] Pouze jeden odkaz "Přidat" nebo "Nový"
- [ ] Klik na "Nový" nebo "+" → zobrazí se výběr typu (pokud existuje více typů)
- [ ] Po výběru typu se otevře příslušný formulář
- [ ] Flow je intuitivní a konzistentní napříč moduly

## 📁 Dotčené moduly
- [ ] 030-pronajimatel (pokud má více typů subjektů)
- [ ] 040-nemovitost (má 6 typů: byt, dům, garáž, pozemek, komerční, ostatní)
- [ ] 050-najemnik (pokud má více typů subjektů)
- [ ] Všechny budoucí moduly s více typy entit

## 🔧 Implementační kroky

### 1. Audit současného stavu sidebaru
Zkontrolovat `module.config.js` každého modulu:

```javascript
// ❌ ŠPATNĚ - příliš mnoho odkazů
forms: [
  { id: 'novy-byt', title: 'Nový byt', ... },
  { id: 'novy-dum', title: 'Nový dům', ... },
  { id: 'nova-garaz', title: 'Nová garáž', ... },
  // ... další typy
]

// ✅ SPRÁVNĚ - jeden odkaz, výběr typu v modalu
forms: [
  { id: 'edit', title: 'Upravit', ... },
  { id: 'detail', title: 'Detail', ... }
]
// Vytváření přes actions nebo commonActions
```

### 2. Odstranit zbytečné formuláře ze sidebaru
V `module.config.js`:

```javascript
export default {
  id: '040-nemovitost',
  title: 'Nemovitosti',
  icon: 'building',
  defaultTile: 'prehled',
  
  // Sidebar akce (ne formuláře!)
  actions: [
    {
      id: 'add-new',
      icon: 'plus',
      label: 'Nový',
      tooltip: 'Přidat novou nemovitost',
      onClick: () => showTypeSelectionForProperty()
    }
  ],
  
  tiles: [
    { id: 'prehled', title: 'Přehled', ... }
  ],
  
  // Formuláře jsou skryté, používají se programaticky
  forms: [
    { 
      id: 'edit', 
      title: 'Upravit', 
      showInSidebar: false,  // Skrýt v sidebaru!
      render: () => import('./forms/edit.js')
    },
    { 
      id: 'detail', 
      title: 'Detail',
      showInSidebar: false,  // Skrýt v sidebaru!
      render: () => import('./forms/detail.js')
    }
  ]
}
```

### 3. Implementovat výběr typu entity

#### 3.1 Vytvořit konfiguraci typů
V modulu vytvořit soubor `config/types.js`:

```javascript
/**
 * Definice typů nemovitostí
 */
export const propertyTypes = [
  { 
    id: 'byt', 
    label: 'Byt', 
    icon: 'building', 
    color: 'blue',
    description: 'Bytová jednotka v bytovém domě'
  },
  { 
    id: 'dum', 
    label: 'Dům', 
    icon: 'home', 
    color: 'green',
    description: 'Rodinný dům nebo vila'
  },
  { 
    id: 'garaz', 
    label: 'Garáž', 
    icon: 'warehouse', 
    color: 'gray',
    description: 'Samostatná garáž nebo garážové stání'
  },
  { 
    id: 'pozemek', 
    label: 'Pozemek', 
    icon: 'map', 
    color: 'brown',
    description: 'Stavební nebo zemědělský pozemek'
  },
  { 
    id: 'komercni', 
    label: 'Komerční', 
    icon: 'briefcase', 
    color: 'purple',
    description: 'Komerční prostor (kancelář, obchod, sklad)'
  },
  { 
    id: 'ostatni', 
    label: 'Ostatní', 
    icon: 'box', 
    color: 'orange',
    description: 'Jiný typ nemovitosti'
  }
];
```

#### 3.2 Použít type selection modal
V `tiles/prehled.js` nebo globálně:

```javascript
import { showTypeSelectionModal } from '../../ui/typeSelectionModal.js';
import { propertyTypes } from '../config/types.js';

// V commonActions
{
  id: 'add',
  label: 'Přidat',
  icon: 'plus',
  primary: true,
  onClick: () => {
    showTypeSelectionModal(
      propertyTypes,
      (selectedTypeId) => {
        // Navigovat na formulář s předvyplněným typem
        window.location.hash = `#040-nemovitost/edit?typ=${selectedTypeId}`;
      },
      {
        title: 'Vyberte typ nemovitosti',
        cancelLabel: 'Zrušit'
      }
    );
  }
}
```

### 4. Upravit editační formulář pro práci s typem

V `forms/edit.js`:

```javascript
import { propertyTypes } from '../config/types.js';

export async function render(container, params) {
  // Získat typ z URL parametru
  const urlParams = new URLSearchParams(window.location.search);
  const preselectedType = urlParams.get('typ');
  
  // Načíst existující data nebo vytvořit nová
  const entityId = params?.id;
  let entity = null;
  
  if (entityId) {
    entity = await db.getProperty(entityId);
  } else if (preselectedType) {
    // Nová entita s předvybraným typem
    entity = {
      typ: preselectedType,
      // další default hodnoty podle typu
    };
  }
  
  // Vykreslit formulář
  renderForm(container, {
    fields: [
      {
        key: 'typ',
        label: 'Typ nemovitosti',
        type: 'select',
        options: propertyTypes.map(t => ({ value: t.id, label: t.label })),
        value: entity?.typ,
        disabled: !entityId, // Při vytváření typ nelze měnit (už byl vybrán)
        required: true
      },
      // ... další pole ...
    ],
    data: entity,
    onSubmit: handleSubmit
  });
}
```

### 5. Aktualizovat UI komponenty

#### 5.1 Rozšířit typeSelectionModal
V `/src/ui/typeSelectionModal.js` přidat podporu pro description:

```javascript
export function showTypeSelectionModal(types, onSelect, options = {}) {
  const { title = 'Vyberte typ', cancelLabel = 'Zrušit' } = options;
  
  // ... vytvoření modalu ...
  
  types.forEach(type => {
    const button = document.createElement('button');
    button.className = `type-button type-button-${type.color}`;
    button.innerHTML = `
      <i class="icon-${type.icon}"></i>
      <div class="type-label">${type.label}</div>
      ${type.description ? `<div class="type-description">${type.description}</div>` : ''}
    `;
    button.addEventListener('click', () => {
      overlay.remove();
      onSelect(type.id);
    });
    body.appendChild(button);
  });
  
  // ... zbytek ...
}
```

#### 5.2 Přidat CSS pro description
```css
.type-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
  padding: 20px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.type-button .type-label {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.type-button .type-description {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.4;
}

.type-button:hover {
  border-color: currentColor;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
```

## 📝 Checklist pro každý modul

### Module Config
- [ ] Zkontrolovat `module.config.js`
- [ ] Odstranit duplicitní form odkazy ze sidebaru
- [ ] Nastavit `showInSidebar: false` pro forms
- [ ] Přidat action pro vytváření nové entity

### Type Selection
- [ ] Vytvořit `config/types.js` s definicí typů
- [ ] Implementovat type selection modal
- [ ] Přidat onClick handler v commonActions

### Formulář
- [ ] Upravit `forms/edit.js` pro práci s URL parametrem `typ`
- [ ] Nastavit předvybraný typ jako disabled (nelze měnit při vytváření)
- [ ] Ověřit že formulář funguje i pro editaci (typ lze měnit)

### Testování
- [ ] Klik na "Přidat" zobrazí modal s typy
- [ ] Výběr typu naviguje na formulář
- [ ] Formulář má předvybraný typ
- [ ] Formulář lze odeslat a entita se vytvoří se správným typem

## 📝 Reference
- **UI komponenta:** `/src/ui/typeSelectionModal.js`
- **Vzorový modul:** `/src/modules/040-nemovitost/`
- **Dokumentace:** `/docs/STANDARDIZACNI-NAVOD.md`

## 🔗 Související úkoly
- Task 05: Ikonka "+" v sidebaru
- Task 08: Datový model pro modul 040

## ⏱️ Odhadovaný čas
- **Per modul (jednoduchá entita):** 20-30 minut
- **Per modul (s výběrem typu):** 60-90 minut
- **Type selection modal (jednou):** 60-90 minut

## 📊 Priority
**VYSOKÁ** - Zjednodušení UX je klíčové pro uživatelský komfort.

## ✅ Ověření
Po dokončení ověřit:
1. V sidebaru není více odkazů na vytvoření různých typů
2. Pouze jeden odkaz "Nový" nebo akce "+"
3. Klik na "Nový" zobrazí modal s výběrem typu
4. Modal obsahuje všechny typy s ikonami a popisky
5. Po výběru typu se otevře formulář
6. Formulář má předvybraný typ (disabled při vytváření)
7. Flow je intuitivní a uživatelsky přívětivé
8. Konzistence napříč všemi moduly
