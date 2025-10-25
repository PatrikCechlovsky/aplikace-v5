# 05 - Vzorové Přehledy (Tiles)

> **Tento dokument popisuje standardní strukturu přehledů (tiles), tabulek, filtrů a jejich chování.**

---

## 📖 Obsah

1. [Struktura Přehledu](#struktura-přehledu)
2. [Tabulky](#tabulky)
3. [Filtry](#filtry)
4. [Akce](#akce)
5. [Interakce](#interakce)

---

## 🏗️ Struktura Přehledu

### Layout

```html
<div class="space-y-4">
  <!-- Filtr header -->
  <div class="bg-white p-4 rounded-lg shadow flex items-center gap-4">
    <input type="search" id="searchInput" 
      placeholder="Hledat..."
      class="flex-1 px-4 py-2 border rounded-lg">
    
    <label class="flex items-center gap-2">
      <input type="checkbox" id="showArchived">
      <span>Zobrazit archivované</span>
    </label>
  </div>
  
  <!-- Tabulka -->
  <div class="bg-white rounded-lg shadow overflow-hidden">
    <table class="w-full">
      <!-- ... -->
    </table>
  </div>
  
  <!-- Paginace (plánováno) -->
  <div class="flex justify-between items-center">
    <div>Zobrazeno 1-50 z 150</div>
    <div class="flex gap-2">
      <button>Předchozí</button>
      <button>Další</button>
    </div>
  </div>
</div>
```

---

## 📊 Tabulky

### Základní tabulka

```javascript
import { renderTable } from '../../../ui/table.js';

export async function render(root, manifest, { userRole }) {
  // Načti data
  const { data, error } = await getAllRecords();
  
  // Vykresli tabulku
  renderTable(root, {
    columns: [
      { key: 'display_name', label: 'Jméno', sortable: true, width: '30%' },
      { key: 'email', label: 'E-mail', sortable: true, width: '30%' },
      { key: 'role', label: 'Role', sortable: true, width: '20%' },
      { key: 'archivedLabel', label: 'Stav', sortable: true, width: '20%' }
    ],
    data: data.map(row => ({
      ...row,
      archivedLabel: row.archived ? '📦 Archivován' : '✅ Aktivní'
    })),
    onRowClick: (row) => {
      navigateTo(`#/m/${manifest.id}/f/detail?id=${row.id}`);
    },
    onRowSelect: (row) => {
      selectedRow = row;
    }
  });
}
```

### Tabulka s akcemi

```javascript
renderTable(root, {
  columns: [
    { key: 'display_name', label: 'Jméno', sortable: true },
    { key: 'email', label: 'E-mail', sortable: true },
    { 
      key: 'actions', 
      label: 'Akce', 
      sortable: false,
      render: (row) => `
        <div class="flex gap-2">
          <button data-action="edit" data-id="${row.id}"
            class="p-1 hover:bg-blue-50 rounded">
            ✏️
          </button>
          <button data-action="delete" data-id="${row.id}"
            class="p-1 hover:bg-red-50 rounded">
            🗑️
          </button>
        </div>
      `
    }
  ],
  data: data
});

// Event handlers pro akce
root.querySelectorAll('[data-action="edit"]').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation(); // Zabraň triggeru onRowClick
    const id = btn.dataset.id;
    navigateTo(`#/m/${manifest.id}/f/edit?id=${id}`);
  });
});
```

---

## 🔍 Filtry

### Fulltext vyhledávání

```javascript
let allData = [];
let filteredData = [];

async function loadData() {
  const { data } = await getAllRecords();
  allData = data;
  filteredData = data;
  renderTable();
}

function setupFilters() {
  const searchInput = document.getElementById('searchInput');
  const showArchivedCheckbox = document.getElementById('showArchived');
  
  searchInput.addEventListener('input', () => {
    filterData();
  });
  
  showArchivedCheckbox.addEventListener('change', () => {
    filterData();
  });
}

function filterData() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const showArchived = document.getElementById('showArchived').checked;
  
  filteredData = allData.filter(row => {
    // Filtr pro archivované
    if (!showArchived && row.archived) return false;
    
    // Fulltext search (bez diakritiky)
    if (searchTerm) {
      const searchable = [
        row.display_name,
        row.email,
        row.role
      ].join(' ').toLowerCase();
      
      if (!searchable.includes(searchTerm)) return false;
    }
    
    return true;
  });
  
  renderTable();
}
```

### Filtr podle typu

```javascript
<select id="typeFilter">
  <option value="">Všechny typy</option>
  <option value="osoba">Fyzická osoba</option>
  <option value="firma">Firma</option>
  <option value="osvc">OSVČ</option>
</select>

// Handler
document.getElementById('typeFilter').addEventListener('change', (e) => {
  const type = e.target.value;
  
  filteredData = allData.filter(row => {
    if (type && row.typ_subjektu !== type) return false;
    return true;
  });
  
  renderTable();
});
```

---

## ⚡ Akce

### CommonActions

```javascript
renderCommonActions(document.getElementById('commonactions'), {
  moduleActions: ['add', 'edit', 'archive', 'attach', 'refresh'],
  userRole: userRole,
  handlers: {
    onAdd: () => navigateTo(`#/m/${manifest.id}/f/create`),
    onEdit: () => {
      if (!selectedRow) {
        toast('Nejprve vyberte řádek', 'warning');
        return;
      }
      navigateTo(`#/m/${manifest.id}/f/edit?id=${selectedRow.id}`);
    },
    onArchive: async () => {
      if (!selectedRow) {
        toast('Nejprve vyberte řádek', 'warning');
        return;
      }
      
      if (!confirm(`Opravdu chcete archivovat "${selectedRow.display_name}"?`)) {
        return;
      }
      
      const { error } = await archiveRecord(selectedRow.id);
      if (error) {
        toast('Chyba při archivaci', 'error');
      } else {
        toast('Archivováno', 'success');
        loadData(); // Reload
      }
    },
    onRefresh: () => loadData()
  }
});
```

---

## 🖱️ Interakce

### Výběr řádku

```javascript
let selectedRow = null;

renderTable(root, {
  // ...
  onRowSelect: (row) => {
    selectedRow = row;
    
    // Vizuální feedback
    root.querySelectorAll('tr').forEach(tr => tr.classList.remove('bg-blue-50'));
    const selectedTr = root.querySelector(`tr[data-id="${row.id}"]`);
    if (selectedTr) selectedTr.classList.add('bg-blue-50');
  }
});
```

### Dvojklik na řádek

```javascript
renderTable(root, {
  // ...
  onRowClick: (row) => {
    // Single click = select
    selectedRow = row;
  },
  onRowDoubleClick: (row) => {
    // Double click = open detail
    navigateTo(`#/m/${manifest.id}/f/detail?id=${row.id}`);
  }
});
```

---

**Konec dokumentu - Vzorové Přehledy** ✅
