# Úkol 05: Ikonka "+" pro zakládání nových entit

## 📋 Popis
V sidebaru i horním panelu musí být vždy viditelná ikonka "+" pro založení nové entity (subjekt, nemovitost, jednotka...). Kliknutí na "+" vede na flow pro vytvoření nové entity.

## 🎯 Cíl
Poskytnout uživatelům jednoduchý a konzistentní způsob vytváření nových entit napříč moduly.

## 🎨 Referenční obrázky
Viz v agent-task.md: image4, image5

## ✅ Akceptační kritéria
- [ ] Ikonka "+" je viditelná v sidebaru modulu
- [ ] Ikonka "+" je viditelná v horním panelu / commonActions
- [ ] Kliknutí na "+" vede na správný flow (formulář nebo výběr typu)
- [ ] Ikonka je konzistentní napříč moduly
- [ ] Ikonka má tooltip "Přidat nový/á [název entity]"

## 📁 Dotčené moduly
- [x] 010-sprava-uzivatelu (REFERENČNÍ)
- [ ] 030-pronajimatel
- [ ] 040-nemovitost
- [ ] 050-najemnik
- [ ] Všechny budoucí moduly

## 🔧 Implementační kroky

### 1. Ikonka "+" v sidebaru
Aktualizovat `module.config.js`:

```javascript
export default {
  id: 'XXX-modul-nazev',
  title: 'Název modulu',
  icon: 'ikona',
  defaultTile: 'prehled',
  
  // Přidat akci pro vytvoření nové entity
  actions: [
    {
      id: 'add-new',
      icon: 'plus',
      label: 'Nový',
      tooltip: 'Přidat novou entitu',
      onClick: () => {
        // Navigace na formulář nebo výběr typu
        window.location.hash = '#XXX-modul-nazev/edit';
      }
    }
  ],
  
  tiles: [
    // ... tiles ...
  ],
  forms: [
    // ... forms ...
  ]
}
```

### 2. Ikonka "+" v commonActions
V každém `tiles/prehled.js`:

```javascript
import { renderCommonActions } from '../../ui/commonActions.js';

export async function render(container) {
  // ... setup ...
  
  // CommonActions s tlačítkem "Přidat"
  const actionsContainer = document.getElementById('commonactions');
  renderCommonActions(actionsContainer, {
    actions: [
      {
        id: 'add',
        label: 'Přidat',
        icon: 'plus',
        tooltip: 'Přidat novou entitu',
        primary: true,  // Primární tlačítko (zvýrazněné)
        onClick: () => {
          window.location.hash = '#XXX-modul-nazev/edit';
        }
      },
      // ... další akce ...
    ]
  });
  
  // ... zbytek ...
}
```

### 3. Rozšířená verze s výběrem typu
Pro moduly které mají více typů entit (viz Task 06):

```javascript
{
  id: 'add',
  label: 'Přidat',
  icon: 'plus',
  tooltip: 'Přidat novou entitu',
  primary: true,
  onClick: () => {
    // Zobrazit modal s výběrem typu
    showTypeSelectionModal([
      { id: 'byt', label: 'Byt', icon: 'building', color: 'blue' },
      { id: 'dum', label: 'Dům', icon: 'home', color: 'green' },
      { id: 'garaz', label: 'Garáž', icon: 'warehouse', color: 'gray' },
      // ... další typy ...
    ], (selectedType) => {
      // Po výběru typu navigovat na formulář
      window.location.hash = `#040-nemovitost/edit?typ=${selectedType}`;
    });
  }
}
```

### 4. Implementace modal pro výběr typu
Vytvořit helper funkci v `/src/ui/typeSelectionModal.js`:

```javascript
/**
 * Zobrazí modal s výběrem typu entity
 * @param {Array} types - Pole typů s id, label, icon, color
 * @param {Function} onSelect - Callback po výběru typu
 */
export function showTypeSelectionModal(types, onSelect) {
  // Vytvořit modal overlay
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  
  // Vytvořit modal
  const modal = document.createElement('div');
  modal.className = 'modal type-selection-modal';
  
  // Hlavička
  const header = document.createElement('div');
  header.className = 'modal-header';
  header.innerHTML = '<h3>Vyberte typ entity</h3>';
  modal.appendChild(header);
  
  // Tělo s výběrem typů
  const body = document.createElement('div');
  body.className = 'modal-body';
  
  types.forEach(type => {
    const button = document.createElement('button');
    button.className = `type-button type-button-${type.color}`;
    button.innerHTML = `
      <i class="icon-${type.icon}"></i>
      <span>${type.label}</span>
    `;
    button.addEventListener('click', () => {
      overlay.remove();
      onSelect(type.id);
    });
    body.appendChild(button);
  });
  
  modal.appendChild(body);
  
  // Tlačítko Zrušit
  const footer = document.createElement('div');
  footer.className = 'modal-footer';
  const cancelButton = document.createElement('button');
  cancelButton.textContent = 'Zrušit';
  cancelButton.className = 'btn btn-secondary';
  cancelButton.addEventListener('click', () => overlay.remove());
  footer.appendChild(cancelButton);
  modal.appendChild(footer);
  
  // Přidat do DOM
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  
  // Close on overlay click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.remove();
    }
  });
}
```

### 5. CSS styly pro modal
```css
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.type-selection-modal {
  background: white;
  border-radius: 8px;
  padding: 24px;
  max-width: 600px;
  width: 90%;
}

.type-selection-modal .modal-body {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
  margin: 20px 0;
}

.type-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.type-button:hover {
  border-color: #3b82f6;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.type-button i {
  font-size: 32px;
}

.type-button span {
  font-size: 14px;
  font-weight: 600;
}

/* Barevné varianty */
.type-button-blue:hover { border-color: #3b82f6; }
.type-button-green:hover { border-color: #10b981; }
.type-button-purple:hover { border-color: #8b5cf6; }
.type-button-gray:hover { border-color: #6b7280; }
.type-button-orange:hover { border-color: #f97316; }
```

### 6. Aktualizovat formulář pro typ
V `forms/edit.js` získat typ z URL parametru:

```javascript
export async function render(container, params) {
  const urlParams = new URLSearchParams(window.location.search);
  const preselectedType = urlParams.get('typ');
  
  // Pokud je typ předvyplněný, nastavit ho ve formuláři
  if (preselectedType) {
    const typeField = container.querySelector('#typ');
    if (typeField) {
      typeField.value = preselectedType;
      typeField.disabled = true; // Volitelně - zabránit změně
    }
  }
}
```

## 📝 Checklist pro každý modul

### Sidebar
- [ ] Module config obsahuje `actions` s tlačítkem "+"
- [ ] Ikonka je viditelná v sidebaru
- [ ] Tooltip je nastaven správně

### CommonActions
- [ ] Tlačítko "Přidat" v commonActions
- [ ] Ikona "plus" použita
- [ ] Primary styling (zvýrazněné)
- [ ] onClick handler správně naviguje

### Flow s více typy (volitelné)
- [ ] Modal pro výběr typu implementován
- [ ] Typy jsou vizuálně přitažlivé (barevné tlačítka)
- [ ] Po výběru typu se naviguje na formulář s předvyplněným typem

## 📝 Reference
- **Vzorový modul:** `/src/modules/010-sprava-uzivatelu/`
- **UI komponenty:** `/src/ui/commonActions.js`, `/src/ui/typeSelectionModal.js` (nový)
- **Dokumentace:** `/docs/STANDARDIZACNI-NAVOD.md`

## 🔗 Související úkoly
- Task 06: Logika zakládání - žádné matoucí formuláře
- Task 09: Automatické vytvoření jednotky

## ⏱️ Odhadovaný čas
- **Jednoduchá verze (přímý link):** 15-20 minut per modul
- **Rozšířená verze (s výběrem typu):** 45-60 minut per modul
- **Vytvoření type selection modal:** 60-90 minut (jednou pro celou aplikaci)

## 📊 Priority
**VYSOKÁ** - Klíčová funkce pro vytváření nových záznamů.

## ✅ Ověření
Po dokončení ověřit:
1. Ikonka "+" je viditelná v sidebaru modulu
2. Tlačítko "Přidat" je v commonActions s ikonou "+"
3. Kliknutí na tlačítko vede na správný formulář
4. Pro moduly s více typy se zobrazí modal s výběrem
5. Po výběru typu se otevře formulář s předvyplněným typem
6. Tooltip zobrazuje správný text
7. Vizuální styl je konzistentní napříč moduly
