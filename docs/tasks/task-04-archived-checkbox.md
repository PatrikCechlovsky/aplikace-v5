# Úkol 04: Checkbox "Zobrazit archivované"

## 📋 Popis
V horní části tabulky musí být checkbox "Zobrazit archivované" pro zobrazení i archivovaných záznamů. Toto je standard napříč moduly.

## 🎯 Cíl
Umožnit uživatelům zobrazit nebo skrýt archivované entity v tabulkách.

## ✅ Akceptační kritéria
- [ ] Checkbox "Zobrazit archivované" je umístěn v horní části tabulky
- [ ] Checkbox je viditelný ve všech modulech s archivací
- [ ] Po zaškrtnutí checkboxu se načtou a zobrazí i archivované záznamy
- [ ] Po odškrtnutí checkboxu se archivované záznamy skryjí
- [ ] Stav checkboxu se ukládá (např. do localStorage)
- [ ] Filtrování funguje okamžitě (bez reload stránky)

## 📁 Dotčené moduly
- [x] 010-sprava-uzivatelu (REFERENČNÍ - již má)
- [ ] 030-pronajimatel
- [ ] 040-nemovitost
- [ ] 050-najemnik
- [ ] Všechny budoucí moduly s archivací

## 🔧 Implementační kroky

### 1. Přidat checkbox do UI
V `tiles/prehled.js` každého modulu:

```javascript
export async function render(container) {
  // ... breadcrumbs setup ...
  
  // Vytvořit kontejner pro filtry
  const filtersContainer = document.createElement('div');
  filtersContainer.className = 'filters-container';
  
  // Vytvořit checkbox pro archivované
  const archivedCheckbox = document.createElement('input');
  archivedCheckbox.type = 'checkbox';
  archivedCheckbox.id = 'showArchived';
  archivedCheckbox.checked = getArchivedFilterState(); // z localStorage
  
  const archivedLabel = document.createElement('label');
  archivedLabel.htmlFor = 'showArchived';
  archivedLabel.textContent = 'Zobrazit archivované';
  
  filtersContainer.appendChild(archivedCheckbox);
  filtersContainer.appendChild(archivedLabel);
  
  // Event listener pro změnu stavu
  archivedCheckbox.addEventListener('change', async (e) => {
    saveArchivedFilterState(e.target.checked);
    await reloadData(container);
  });
  
  container.appendChild(filtersContainer);
  
  // ... zbytek render logiky ...
}
```

### 2. Implementovat localStorage funkce
Vytvořit helper funkce pro ukládání stavu:

```javascript
/**
 * Získá stav filtru archivovaných ze localStorage
 * @param {string} moduleId - ID modulu (např. '040-nemovitost')
 * @returns {boolean}
 */
function getArchivedFilterState(moduleId) {
  const key = `${moduleId}_showArchived`;
  const saved = localStorage.getItem(key);
  return saved === 'true';
}

/**
 * Uloží stav filtru archivovaných do localStorage
 * @param {string} moduleId - ID modulu
 * @param {boolean} show - Zobrazit archivované?
 */
function saveArchivedFilterState(moduleId, show) {
  const key = `${moduleId}_showArchived`;
  localStorage.setItem(key, show.toString());
}
```

### 3. Aktualizovat funkci pro načítání dat
Upravit funkci která načítá data aby respektovala filtr:

```javascript
async function loadData(showArchived = false) {
  const filters = {
    includeArchived: showArchived
  };
  
  // Použít odpovídající DB funkci z services
  const data = await db.listEntities(filters);
  
  return data;
}

async function reloadData(container) {
  const showArchived = getArchivedFilterState(moduleId);
  const data = await loadData(showArchived);
  
  // Překreslit tabulku s novými daty
  const tableContainer = container.querySelector('.table-container');
  renderTable(tableContainer, {
    columns: columns,
    data: data,
    onRowDoubleClick: onRowDoubleClick
  });
}
```

### 4. Aktualizovat DB service
V `services/db.js` modulu přidat podporu pro filtr:

```javascript
/**
 * Načte seznam entit s filtry
 * @param {Object} filters - Filtry
 * @param {boolean} filters.includeArchived - Zahrnout archivované
 * @returns {Promise<Array>}
 */
export async function listEntities(filters = {}) {
  let query = supabase
    .from('table_name')
    .select('*');
  
  // Pokud nejsou zahrnuty archivované, filtrovat je
  if (!filters.includeArchived) {
    query = query.is('archived_at', null);
    // NEBO: query = query.eq('archived', false);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error loading entities:', error);
    throw error;
  }
  
  return data;
}
```

### 5. Stylování checkbox
V CSS přidat styly pro filters kontejner:

```css
.filters-container {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 0;
  margin-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.filters-container input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.filters-container label {
  font-size: 14px;
  cursor: pointer;
  user-select: none;
}
```

### 6. Vizuální označení archivovaných záznamů
V tabulce označit archivované záznamy:

```javascript
const columns = [
  // ... ostatní sloupce ...
  {
    key: 'archived_at',
    label: 'Archivován',
    sortable: true,
    render: (value) => value ? 'Ano' : 'Ne'
  }
];

// NEBO přidat CSS třídu pro řádky
renderTable(tableContainer, {
  columns: columns,
  data: data,
  rowClassName: (row) => row.archived_at ? 'archived-row' : '',
  onRowDoubleClick: onRowDoubleClick
});
```

```css
.archived-row {
  background-color: #f9fafb;
  opacity: 0.7;
}
```

## 📝 Checklist pro každý modul

### UI komponenty
- [ ] Checkbox "Zobrazit archivované" přidán do view
- [ ] Label správně propojen s checkboxem
- [ ] Event listener pro změnu stavu
- [ ] Filtr je viditelný a intuitivní

### Datová vrstva
- [ ] DB funkce podporuje filtr `includeArchived`
- [ ] Filtr správně funguje (vrací/nevrací archivované)
- [ ] Správně se používá pole `archived_at` nebo `archived`

### Persistence
- [ ] Stav checkboxu se ukládá do localStorage
- [ ] Stav se načítá při otevření modulu
- [ ] Klíč v localStorage je unikátní pro modul

### Vizuální feedback
- [ ] Archivované záznamy jsou vizuálně odlišené (např. opacity)
- [ ] Sloupec "Archivován" je přítomen v tabulce (volitelně)

## 📝 Reference
- **Vzorový modul:** `/src/modules/010-sprava-uzivatelu/tiles/prehled.js`
- **UI komponenty:** `/src/ui/table.js`
- **Dokumentace:** `/docs/STANDARDIZACNI-NAVOD.md`

## 🔗 Související úkoly
- Task 01: Hlavní sekce "Přehled"

## ⏱️ Odhadovaný čas
- **Per modul:** 30-45 minut

## 📊 Priority
**STŘEDNÍ** - Standardní funkce, ale ne kritická pro základní fungování.

## ✅ Ověření
Po dokončení ověřit:
1. Checkbox je viditelný v horní části tabulky
2. Checkbox má správný label "Zobrazit archivované"
3. Po zaškrtnutí se zobrazí archivované záznamy
4. Po odškrtnutí se archivované záznamy skryjí
5. Stav checkboxu přetrvává po reload stránky
6. Archivované záznamy jsou vizuálně odlišené
7. Filtrování funguje okamžitě bez reload
