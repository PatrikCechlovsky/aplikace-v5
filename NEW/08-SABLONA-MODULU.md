# 08 - Šablona Modulu

> **Tento dokument poskytuje kompletní šablonu pro vytvoření nového modulu v aplikaci.**

---

## 📖 Obsah

1. [Struktura Modulu](#struktura-modulu)
2. [Krok za Krokem](#krok-za-krokem)
3. [Šablony Kódu](#šablony-kódu)
4. [Checklist](#checklist)

---

## 📁 Struktura Modulu

```
src/modules/XXX-nazev-modulu/
├── module.config.js     # Manifest modulu
├── db.js                # Databázové funkce
├── tiles/               # Přehledy (seznamy)
│   ├── prehled.js      # Hlavní přehled
│   └── ...             # Další přehledy
└── forms/               # Formuláře
    ├── detail.js        # Detail (read-only)
    ├── edit.js          # Editace
    ├── create.js        # Vytvoření nového
    ├── chooser.js       # Výběr (optional)
    └── history.js       # Historie (optional)
```

---

## 🚀 Krok za Krokem

### Krok 1: Vytvoř složku modulu

```bash
cd src/modules
mkdir 060-smlouva
cd 060-smlouva
mkdir tiles forms
```

### Krok 2: module.config.js

```javascript
// src/modules/060-smlouva/module.config.js

export async function getManifest() {
  return {
    id: '060-smlouva',
    title: 'Smlouvy',
    icon: 'document',  // nebo emoji 📄
    defaultTile: 'prehled',
    
    tiles: [
      { id: 'prehled', title: 'Přehled', icon: 'list' },
      { id: 'aktivni', title: 'Aktivní', icon: 'check' },
      { id: 'expirujici', title: 'Expirující', icon: 'warning' }
    ],
    
    forms: [
      { id: 'detail', title: 'Detail smlouvy', icon: 'eye', showInSidebar: false },
      { id: 'edit', title: 'Editace smlouvy', icon: 'edit', showInSidebar: false },
      { id: 'create', title: 'Nová smlouva', icon: 'add', showInSidebar: false },
      { id: 'history', title: 'Historie', icon: 'history', showInSidebar: false }
    ]
  };
}

export default { getManifest };
```

### Krok 3: db.js

```javascript
// src/modules/060-smlouva/db.js

import { supabase } from '../../supabase.js';

export async function getAllContracts(includeArchived = false) {
  let query = supabase
    .from('contracts')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (!includeArchived) {
    query = query.eq('archived', false);
  }
  
  return await query;
}

export async function getContractById(id) {
  return await supabase
    .from('contracts')
    .select('*')
    .eq('id', id)
    .single();
}

export async function createContract(data) {
  return await supabase
    .from('contracts')
    .insert(data)
    .select()
    .single();
}

export async function updateContract(id, data) {
  return await supabase
    .from('contracts')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
}

export async function archiveContract(id) {
  return await supabase
    .from('contracts')
    .update({ 
      archived: true, 
      archived_at: new Date().toISOString() 
    })
    .eq('id', id);
}
```

### Krok 4: tiles/prehled.js

```javascript
// src/modules/060-smlouva/tiles/prehled.js

import { getAllContracts } from '../db.js';
import { renderTable } from '../../../ui/table.js';
import { renderCommonActions } from '../../../ui/commonActions.js';
import { setBreadcrumb } from '../../../ui/breadcrumb.js';
import { navigateTo } from '../../../app.js';
import { toast } from '../../../ui/toast.js';

let selectedRow = null;

export async function render(root, manifest, { userRole }) {
  const crumb = document.getElementById('crumb');
  const commonActions = document.getElementById('commonactions');
  
  // Breadcrumb
  setBreadcrumb(crumb, [
    { icon: 'home', label: 'Domů', href: '#/' },
    { icon: manifest.icon, label: manifest.title },
    { icon: 'list', label: 'Přehled' }
  ]);
  
  // CommonActions
  renderCommonActions(commonActions, {
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
        
        if (!confirm(`Opravdu chcete archivovat?`)) return;
        
        const { error } = await archiveContract(selectedRow.id);
        if (error) {
          toast('Chyba při archivaci', 'error');
        } else {
          toast('Archivováno', 'success');
          render(root, manifest, { userRole }); // Reload
        }
      },
      onRefresh: () => render(root, manifest, { userRole })
    }
  });
  
  // Načti data
  const { data, error } = await getAllContracts();
  
  if (error) {
    root.innerHTML = `<div class="text-red-500">Chyba: ${error.message}</div>`;
    return;
  }
  
  // Vykresli tabulku
  renderTable(root, {
    columns: [
      { key: 'cislo_smlouvy', label: 'Číslo smlouvy', sortable: true, width: '20%' },
      { key: 'tenant_name', label: 'Nájemník', sortable: true, width: '30%' },
      { key: 'unit_name', label: 'Jednotka', sortable: true, width: '25%' },
      { key: 'datum_od', label: 'Od', sortable: true, width: '15%' },
      { key: 'status', label: 'Stav', sortable: true, width: '10%' }
    ],
    data: data,
    onRowClick: (row) => {
      navigateTo(`#/m/${manifest.id}/f/detail?id=${row.id}`);
    },
    onRowSelect: (row) => {
      selectedRow = row;
    }
  });
}
```

### Krok 5: forms/detail.js

```javascript
// src/modules/060-smlouva/forms/detail.js

import { getContractById } from '../db.js';
import { renderCommonActions } from '../../../ui/commonActions.js';
import { setBreadcrumb } from '../../../ui/breadcrumb.js';
import { navigateTo } from '../../../app.js';
import { formatDate } from '../../../ui/utils.js';

export async function render(root, manifest, { query, userRole }) {
  const id = query.id;
  const { data, error } = await getContractById(id);
  
  if (error || !data) {
    root.innerHTML = '<div class="text-red-500">Smlouva nenalezena</div>';
    return;
  }
  
  // Breadcrumb
  setBreadcrumb(document.getElementById('crumb'), [
    { icon: 'home', label: 'Domů', href: '#/' },
    { icon: manifest.icon, label: manifest.title, href: `#/m/${manifest.id}/t/prehled` },
    { icon: 'list', label: 'Přehled', href: `#/m/${manifest.id}/t/prehled` },
    { label: `Detail: ${data.cislo_smlouvy}` }
  ]);
  
  // CommonActions
  renderCommonActions(document.getElementById('commonactions'), {
    moduleActions: ['edit', 'archive', 'attach', 'history', 'refresh'],
    userRole: userRole,
    handlers: {
      onEdit: () => navigateTo(`#/m/${manifest.id}/f/edit?id=${id}`),
      onArchive: () => { /* ... */ },
      onAttach: () => { /* ... */ },
      onHistory: () => navigateTo(`#/m/${manifest.id}/f/history?id=${id}`),
      onRefresh: () => render(root, manifest, { query, userRole })
    }
  });
  
  // Vykresli formulář
  root.innerHTML = `
    <div class="max-w-6xl mx-auto space-y-6">
      <section class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-lg font-semibold mb-4">📄 Základní údaje</h3>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1">Číslo smlouvy</label>
            <div class="text-base">${data.cislo_smlouvy}</div>
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">Typ smlouvy</label>
            <div class="text-base">${data.typ_smlouvy}</div>
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">Datum od</label>
            <div class="text-base">${formatDate(data.datum_od)}</div>
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">Datum do</label>
            <div class="text-base">${formatDate(data.datum_do)}</div>
          </div>
        </div>
      </section>
      
      <section class="bg-slate-50 p-6 rounded-lg">
        <h3 class="text-lg font-semibold mb-4">📊 Systém</h3>
        
        <div class="grid grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1">Vytvořeno</label>
            <div class="text-base">${formatDate(data.created_at)}</div>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Upraveno</label>
            <div class="text-base">${formatDate(data.updated_at)}</div>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Upravil</label>
            <div class="text-base">${data.updated_by || '-'}</div>
          </div>
        </div>
      </section>
    </div>
  `;
}
```

### Krok 6: forms/edit.js

Viz dokument **04-VZOROVE-FORMULARE.md** sekce Edit Form.

### Krok 7: forms/create.js

Viz dokument **04-VZOROVE-FORMULARE.md** sekce Create Form.

### Krok 8: Registrace modulu

```javascript
// src/app/modules.index.js

export const MODULE_SOURCES = [
  () => import('../modules/010-sprava-uzivatelu/module.config.js'),
  () => import('../modules/020-muj-ucet/module.config.js'),
  () => import('../modules/030-pronajimatel/module.config.js'),
  () => import('../modules/040-nemovitost/module.config.js'),
  () => import('../modules/050-najemnik/module.config.js'),
  () => import('../modules/060-smlouva/module.config.js'),  // <-- PŘIDEJ
  // ...
];
```

### Krok 9: Databáze

```sql
-- Vytvoř tabulku
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cislo_smlouvy VARCHAR(50) UNIQUE NOT NULL,
  typ_smlouvy VARCHAR(50) NOT NULL,
  landlord_id UUID REFERENCES subjects(id),
  tenant_id UUID REFERENCES subjects(id),
  unit_id UUID REFERENCES units(id),
  datum_od DATE NOT NULL,
  datum_do DATE,
  najemne DECIMAL(10, 2),
  zalohy DECIMAL(10, 2),
  kauce DECIMAL(10, 2),
  poznamka TEXT,
  archived BOOLEAN DEFAULT FALSE,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  updated_by UUID
);

-- Indexy
CREATE INDEX idx_contracts_tenant ON contracts(tenant_id);
CREATE INDEX idx_contracts_unit ON contracts(unit_id);
CREATE INDEX idx_contracts_archived ON contracts(archived);

-- RLS Policies
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY contracts_select ON contracts FOR SELECT
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
    OR tenant_id IN (SELECT subject_id FROM user_subjects WHERE user_id = auth.uid())
    OR landlord_id IN (SELECT subject_id FROM user_subjects WHERE user_id = auth.uid())
  );

-- Trigger pro updated_at
CREATE TRIGGER contracts_updated_at
  BEFORE UPDATE ON contracts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## ✅ Checklist

### Před commitem zkontroluj:

- [ ] `module.config.js` správně vyplněn
- [ ] Modul zaregistrován v `modules.index.js`
- [ ] `db.js` obsahuje všechny CRUD funkce
- [ ] Alespoň 1 tile (prehled.js)
- [ ] Alespoň 2 forms (detail.js, edit.js nebo create.js)
- [ ] Breadcrumbs ve všech view
- [ ] CommonActions ve všech view
- [ ] Databázová tabulka vytvořena
- [ ] RLS policies nastaveny
- [ ] Historie (optional, ale doporučeno)
- [ ] Přílohy (optional)
- [ ] Dokumentace v README aktualizována

---

**Konec dokumentu - Šablona Modulu** ✅
