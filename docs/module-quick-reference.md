# Rychlý přehled: Struktura modulu

## 📁 Základní struktura modulu

```
src/modules/XXX-nazev/
├── module.config.js         ← POVINNÝ: Manifest modulu
├── db.js                    ← POVINNÝ: Database operace
├── tiles/                   ← Přehledy (seznamy, dashboardy)
│   ├── prehled.js
│   ├── seznam.js
│   └── ...
├── forms/                   ← Formuláře (detail, edit)
│   ├── detail.js
│   ├── edit.js
│   ├── chooser.js
│   └── ...
├── assets/                  ← Dokumentace modulu
│   ├── README.md
│   ├── datovy-model.md
│   ├── checklist.md
│   └── permissions.md
└── type-schemas.js          ← Volitelné: TypeScript/Zod schémata
```

## 🔧 module.config.js - Minimální verze

```javascript
export async function getManifest() {
  return {
    id: 'XXX-nazev',              // Unique ID modulu
    title: 'Název modulu',         // Zobrazovaný název
    icon: 'icon-name',             // Ikona (Material Icons nebo emoji)
    defaultTile: 'prehled',        // Výchozí tile
    tiles: [
      { id: 'prehled', title: 'Přehled', icon: 'list' }
    ],
    forms: [
      { id: 'detail', title: 'Detail', icon: 'eye', showInSidebar: false },
      { id: 'edit', title: 'Editace', icon: 'edit', showInSidebar: false }
    ]
  };
}

export default { getManifest };
```

## 💾 db.js - Základní operace

```javascript
import { supabase } from '/src/supabase.js';

// List - seznam záznamů
export async function listItems(options = {}) {
  const { showArchived = false, limit = 500 } = options;
  try {
    let query = supabase
      .from('table_name')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (!showArchived) {
      query = query.or('archived.is.null,archived.eq.false');
    }
    
    const { data, error } = await query;
    return { data: data || [], error };
  } catch (err) {
    return { data: null, error: err };
  }
}

// Get - jeden záznam
export async function getItem(id) {
  try {
    const { data, error } = await supabase
      .from('table_name')
      .select('*')
      .eq('id', id)
      .single();
    return { data, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

// Upsert - vytvoření nebo úprava
export async function upsertItem(item) {
  try {
    const now = new Date().toISOString();
    const userId = (await supabase.auth.getUser()).data?.user?.id;
    
    const itemData = {
      ...item,
      updated_at: now,
      updated_by: userId
    };
    
    if (!item.id) {
      itemData.created_at = now;
      itemData.created_by = userId;
    }
    
    const { data, error } = await supabase
      .from('table_name')
      .upsert(itemData)
      .select()
      .single();
    
    return { data, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

// Archive - soft delete
export async function archiveItem(id) {
  try {
    const now = new Date().toISOString();
    const userId = (await supabase.auth.getUser()).data?.user?.id;
    
    const { data, error } = await supabase
      .from('table_name')
      .update({
        archived: true,
        archived_at: now,
        archived_by: userId
      })
      .eq('id', id)
      .select()
      .single();
    
    return { data, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

export default { listItems, getItem, upsertItem, archiveItem };
```

## 📋 tiles/prehled.js - Základní tile s tabulkou

```javascript
import { renderTable } from '/src/ui/table.js';
import { renderCommonActions } from '/src/ui/commonActions.js';
import { listItems, archiveItem } from '../db.js';
import { setBreadcrumb } from '/src/ui/breadcrumb.js';
import { navigateTo } from '/src/app.js';

let selectedRow = null;
let showArchived = false;

export async function render(root) {
  // Breadcrumbs
  setBreadcrumb(document.getElementById('crumb'), [
    { icon: 'home', label: 'Domů', href: '#/' },
    { icon: 'icon', label: 'Modul', href: '#/m/XXX-nazev' },
    { icon: 'list', label: 'Přehled' }
  ]);

  root.innerHTML = `
    <div id="commonactions" class="mb-4"></div>
    <div id="items-table"></div>
  `;

  // Načtení dat
  const { data, error } = await listItems({ showArchived });
  if (error) {
    root.querySelector('#items-table').innerHTML = 
      `<div class="p-4 text-red-600">Chyba: ${error.message}</div>`;
    return;
  }

  // Definice sloupců
  const columns = [
    { key: 'name', label: 'Název', width: '30%', sortable: true },
    { key: 'created_at', label: 'Vytvořeno', width: '20%', sortable: true },
    { key: 'archivedLabel', label: 'Archivován', width: '10%' }
  ];

  // Common Actions
  function drawActions() {
    const ca = document.getElementById('commonactions');
    if (!ca) return;
    const hasSel = !!selectedRow && !selectedRow.archived;
    
    renderCommonActions(ca, {
      moduleActions: ['add', 'edit', 'archive', 'refresh'],
      userRole: window.currentUserRole || 'admin',
      handlers: {
        onAdd: () => navigateTo('#/m/XXX-nazev/f/edit'),
        onEdit: hasSel ? () => navigateTo(`#/m/XXX-nazev/f/edit?id=${selectedRow.id}`) : undefined,
        onArchive: hasSel ? async () => {
          await archiveItem(selectedRow.id);
          selectedRow = null;
          await render(root);
        } : undefined,
        onRefresh: () => render(root)
      }
    });
  }

  drawActions();

  // Vykreslení tabulky
  renderTable(root.querySelector('#items-table'), {
    columns,
    rows: (data || []).map(r => ({
      ...r,
      archivedLabel: r.archived ? 'Ano' : ''
    })),
    options: {
      moduleId: 'XXX-nazev',
      onRowSelect: row => {
        selectedRow = (selectedRow?.id === row.id) ? null : row;
        drawActions();
      },
      onRowDblClick: row => {
        navigateTo(`#/m/XXX-nazev/f/detail?id=${row.id}`);
      }
    }
  });
}

export default { render };
```

## 📝 forms/edit.js - Základní formulář

```javascript
import { setBreadcrumb } from '/src/ui/breadcrumb.js';
import { renderForm } from '/src/ui/form.js';
import { renderCommonActions } from '/src/ui/commonActions.js';
import { navigateTo } from '/src/app.js';
import { getItem, upsertItem } from '../db.js';
import { setUnsaved } from '/src/app.js';

function getHashParams() {
  const q = (location.hash.split('?')[1] || '');
  return Object.fromEntries(new URLSearchParams(q));
}

const FIELDS = [
  { key: 'name', label: 'Název', type: 'text', required: true },
  { key: 'description', label: 'Popis', type: 'textarea', fullWidth: true },
  { key: 'archived', label: 'Archivní', type: 'checkbox' },
  { key: 'updated_at', label: 'Poslední úprava', type: 'label', readOnly: true },
  { key: 'created_at', label: 'Vytvořen', type: 'label', readOnly: true }
];

export async function render(root, params) {
  const { id } = params || getHashParams();
  
  let data = {};
  if (id) {
    const { data: itemData, error } = await getItem(id);
    if (error || !itemData) {
      root.innerHTML = `<div class="p-4 text-red-600">Chyba nebo nenalezeno</div>`;
      return;
    }
    data = itemData;
  }

  setBreadcrumb(document.getElementById('crumb'), [
    { icon: 'home', label: 'Domů', href: '#/' },
    { icon: 'icon', label: 'Modul', href: '#/m/XXX-nazev' },
    { icon: 'edit', label: id ? 'Editace' : 'Nový záznam' }
  ]);

  root.innerHTML = `
    <div id="commonactions" class="mb-4"></div>
    <div id="item-form"></div>
  `;

  const handlers = {
    onSave: async () => {
      const values = grabValues(root);
      values.id = id || crypto.randomUUID();
      
      const { error } = await upsertItem(values);
      if (error) {
        alert('Chyba při ukládání: ' + error.message);
        return;
      }
      
      alert('Uloženo.');
      setUnsaved(false);
      navigateTo('#/m/XXX-nazev/t/prehled');
    },
    onReject: () => navigateTo('#/m/XXX-nazev/t/prehled')
  };

  renderCommonActions(document.getElementById('commonactions'), {
    moduleActions: ['save', 'reject'],
    userRole: window.currentUserRole || 'admin',
    handlers
  });

  renderForm(root.querySelector('#item-form'), FIELDS, data, async () => true, {
    readOnly: false,
    showSubmit: false,
    layout: { columns: { base: 1, md: 2 }, density: 'compact' }
  });
}

function grabValues(scopeEl) {
  const obj = {};
  for (const f of FIELDS) {
    if (f.readOnly) continue;
    const el = scopeEl.querySelector(`[name="${f.key}"]`);
    if (!el) continue;
    obj[f.key] = (el.type === 'checkbox') ? !!el.checked : el.value;
  }
  return obj;
}

export default { render };
```

## 🗄️ Databázová tabulka - Minimální schéma

```sql
CREATE TABLE IF NOT EXISTS table_name (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Základní sloupce
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Audit sloupce (VŽDY přidávejte)
  archived BOOLEAN DEFAULT false,
  archived_at TIMESTAMPTZ,
  archived_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  updated_by UUID
);

-- Indexy
CREATE INDEX IF NOT EXISTS idx_table_archived ON table_name(archived);
CREATE INDEX IF NOT EXISTS idx_table_created_at ON table_name(created_at DESC);

-- Trigger pro updated_at
CREATE TRIGGER table_name_updated_at
  BEFORE UPDATE ON table_name
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

CREATE POLICY table_name_select ON table_name
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY table_name_insert ON table_name
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY table_name_update ON table_name
  FOR UPDATE USING (auth.uid() IS NOT NULL);
```

## 📋 Checklist pro nový modul

- [ ] Zkopírovat šablonu `000-sablona`
- [ ] Aktualizovat `module.config.js` (ID, title, icon)
- [ ] Vytvořit databázovou migraci
- [ ] Spustit migraci v Supabase
- [ ] Aktualizovat `docs/database-schema.md`
- [ ] Vytvořit `db.js` s operacemi
- [ ] Implementovat tiles (minimálně prehled.js)
- [ ] Implementovat forms (minimálně edit.js)
- [ ] Registrovat v `src/app/modules.index.js`
- [ ] Otestovat v prohlížeči
- [ ] Zkontrolovat breadcrumbs
- [ ] Zkontrolovat commonActions
- [ ] Commitnout změny

## 🎯 CommonActions - Standardní akce

```javascript
moduleActions: [
  'add',      // Přidat nový
  'edit',     // Upravit vybraný
  'detail',   // Detail vybraného (volitelné)
  'units',    // Jednotky (jen pro properties)
  'archive',  // Archivovat vybraný
  'attach',   // Přílohy (volitelné)
  'refresh',  // Obnovit data
  'history'   // Historie změn (volitelné)
]
```

## 🔗 Důležité odkazy

- **Šablona**: `src/modules/000-sablona/`
- **Reference**: `src/modules/040-nemovitost/`
- **DB dokumentace**: `docs/database-schema.md`
- **Návod na tvorbu**: `docs/how-to-create-module.md`

---

**Pro detailní návod viz:** `docs/how-to-create-module.md`
