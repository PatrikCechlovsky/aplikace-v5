# Návod: Vytvoření nového modulu

Tento dokument popisuje krok za krokem, jak vytvořit nový modul v aplikaci.

## 📋 Předpoklady

Než začnete vytvářet nový modul, ujistěte se, že:

1. ✅ Máte jasně definovaný účel modulu
2. ✅ Máte navržené databázové schéma (pokud modul potřebuje databázi)
3. ✅ Znáte základní strukturu existujících modulů (010, 030, 040, 050)
4. ✅ Máte připravený module ID (např. `060-smlouva`)

## 🎯 Přehled modulů k vytvoření

Zakomentované moduly v `src/app/modules.index.js`:

| ID | Název | Účel | Priorita |
|----|-------|------|----------|
| 060 | Smlouvy | Správa nájemních smluv | 🔴 Vysoká |
| 070 | Služby | Správa služeb (energie, voda, internet) | 🟡 Střední |
| 080 | Platby | Evidence plateb a dluhů | 🔴 Vysoká |
| 090 | Finance | Finanční přehledy a reporty | 🟡 Střední |
| 100 | Energie | Evidence odečtů měřičů | 🟢 Nízká |
| 110 | Údržba | Správa oprav a údržby | 🟡 Střední |
| 120 | Dokumenty | Správa dokumentů | 🟢 Nízká |
| 130 | Komunikace | Zprávy a oznámení | 🟢 Nízká |
| 900 | Nastavení | Konfigurace aplikace | 🟡 Střední |
| 990 | Help | Nápověda a dokumentace | 🟢 Nízká |

## 🚀 Krok za krokem: Vytvoření nového modulu

### Krok 1: Zkopírujte šablonu

```bash
# Zkopírujte šablonu modulu
cd src/modules
cp -r 000-sablona 060-smlouva

# Nebo pro jakýkoliv jiný modul:
cp -r 000-sablona XXX-nazev-modulu
```

### Krok 2: Přejmenujte soubory (pokud je potřeba)

Šablona má základní strukturu, ale můžete přidat další soubory podle potřeby:

```bash
cd 060-smlouva

# Příklad: Přidání dalších tiles
touch tiles/aktivni.js
touch tiles/expirujici.js

# Příklad: Přidání dalších forms
touch forms/chooser.js
touch forms/detail.js
```

### Krok 3: Aktualizujte module.config.js

Otevřete `src/modules/060-smlouva/module.config.js` a nahraďte placeholdery:

```javascript
// PŘED:
const MANIFEST = {
  id: '__MODULE_ID__',
  title: '__MODULE_TITLE__',
  icon: '__ICON__',
  defaultTile: 'seznam',
  ...
};

// PO:
const MANIFEST = {
  id: '060-smlouva',
  title: 'Smlouvy',
  icon: 'document',           // nebo 📄
  defaultTile: 'prehled',
  tiles: [
    { id: 'prehled', title: 'Přehled', icon: 'list' },
    { id: 'aktivni', title: 'Aktivní', icon: 'check' },
    { id: 'expirujici', title: 'Expirující', icon: 'warning' }
  ],
  forms: [
    { id: 'detail', title: 'Detail smlouvy', icon: 'eye', showInSidebar: false },
    { id: 'edit', title: 'Editace smlouvy', icon: 'edit', showInSidebar: false },
    { id: 'chooser', title: 'Nová smlouva', icon: 'add', showInSidebar: false }
  ]
};

export async function getManifest() {
  return MANIFEST;
}

export default { getManifest };
```

**Poznámky:**
- `id`: Musí být unique, formát `XXX-nazev` (např. `060-smlouva`)
- `title`: Zobrazovaný název v UI
- `icon`: Ikona z Material Icons nebo emoji
- `defaultTile`: Která tile se otevře jako první
- `showInSidebar: false`: Formy se standardně nezobrazují v sidebaru

### Krok 4: Vytvořte databázové schéma

Pokud modul potřebuje databázové tabulky, vytvořte migrační soubor:

```bash
# Vytvořte migrační soubor
touch docs/tasks/supabase-migrations/006_create_contracts_table.sql
```

**Příklad migrace pro modul Smlouvy:**

```sql
-- ============================================================================
-- Migration 006: Create Contracts Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Vazby
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  landlord_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  
  -- Základní údaje
  contract_number VARCHAR(50) UNIQUE NOT NULL,
  contract_type VARCHAR(50) DEFAULT 'najem',  -- najem, podnájem
  status VARCHAR(50) DEFAULT 'draft',  -- draft, active, expired, terminated
  
  -- Období
  date_start DATE NOT NULL,
  date_end DATE,
  notice_period INTEGER DEFAULT 3,  -- výpovědní lhůta v měsících
  
  -- Finance
  monthly_rent DECIMAL(10,2) NOT NULL CHECK (monthly_rent >= 0),
  deposit DECIMAL(10,2) CHECK (deposit >= 0),
  utilities_included BOOLEAN DEFAULT false,
  
  -- Dokumenty
  file_url TEXT,
  
  -- Metadata
  notes TEXT,
  archived BOOLEAN DEFAULT false,
  archived_at TIMESTAMPTZ,
  archived_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  updated_by UUID,
  
  CONSTRAINT contracts_dates_check CHECK (date_end IS NULL OR date_end >= date_start)
);

-- Indexy
CREATE INDEX IF NOT EXISTS idx_contracts_unit ON contracts(unit_id);
CREATE INDEX IF NOT EXISTS idx_contracts_tenant ON contracts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_contracts_landlord ON contracts(landlord_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_dates ON contracts(date_start, date_end);
CREATE INDEX IF NOT EXISTS idx_contracts_archived ON contracts(archived);

-- Komentáře
COMMENT ON TABLE contracts IS 'Nájemní smlouvy';
COMMENT ON COLUMN contracts.contract_number IS 'Číslo smlouvy (unique)';
COMMENT ON COLUMN contracts.notice_period IS 'Výpovědní lhůta v měsících';

-- Triggery
CREATE TRIGGER contracts_updated_at
  BEFORE UPDATE ON contracts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY contracts_select ON contracts
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY contracts_insert ON contracts
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY contracts_update ON contracts
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- ============================================================================
-- KONEC MIGRACE
-- ============================================================================
SELECT 'Migration 006 completed: contracts table created' as status;
```

### Krok 5: Aktualizujte dokumentaci databáze

Po vytvoření migrace **MUSÍTE** aktualizovat `docs/database-schema.md`:

1. Přidejte tabulku do [Přehled tabulek]
2. Vytvořte novou sekci s popisem tabulky
3. Aktualizujte datum poslední aktualizace

Viz: `docs/database-schema-maintenance.md` pro detailní návod.

### Krok 6: Vytvořte db.js soubor

Vytvořte `src/modules/060-smlouva/db.js` s database operacemi:

```javascript
// Database operations for contracts module
import { supabase } from '/src/supabase.js';

/**
 * List contracts with optional filters
 */
export async function listContracts(options = {}) {
  const { unitId, tenantId, status, showArchived = false, limit = 500 } = options;
  
  try {
    let query = supabase
      .from('contracts')
      .select('*, unit:units(*), tenant:subjects!tenant_id(*)')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (unitId) query = query.eq('unit_id', unitId);
    if (tenantId) query = query.eq('tenant_id', tenantId);
    if (status) query = query.eq('status', status);
    
    if (!showArchived) {
      query = query.or('archived.is.null,archived.eq.false');
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error listing contracts:', error);
      return { data: null, error };
    }
    
    return { data: data || [], error: null };
  } catch (err) {
    console.error('Exception in listContracts:', err);
    return { data: null, error: err };
  }
}

/**
 * Get contract by ID
 */
export async function getContract(id) {
  try {
    const { data, error } = await supabase
      .from('contracts')
      .select('*, unit:units(*), tenant:subjects!tenant_id(*), landlord:subjects!landlord_id(*)')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error getting contract:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (err) {
    console.error('Exception in getContract:', err);
    return { data: null, error: err };
  }
}

/**
 * Create or update contract
 */
export async function upsertContract(contract) {
  try {
    const now = new Date().toISOString();
    const userId = (await supabase.auth.getUser()).data?.user?.id;
    
    const contractData = {
      ...contract,
      updated_at: now,
      updated_by: userId
    };
    
    if (!contract.id) {
      contractData.created_at = now;
      contractData.created_by = userId;
    }
    
    const { data, error } = await supabase
      .from('contracts')
      .upsert(contractData)
      .select()
      .single();
    
    if (error) {
      console.error('Error upserting contract:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (err) {
    console.error('Exception in upsertContract:', err);
    return { data: null, error: err };
  }
}

/**
 * Archive contract
 */
export async function archiveContract(id) {
  try {
    const now = new Date().toISOString();
    const userId = (await supabase.auth.getUser()).data?.user?.id;
    
    const { data, error } = await supabase
      .from('contracts')
      .update({
        archived: true,
        archived_at: now,
        archived_by: userId
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error archiving contract:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (err) {
    console.error('Exception in archiveContract:', err);
    return { data: null, error: err };
  }
}

export default {
  listContracts,
  getContract,
  upsertContract,
  archiveContract
};
```

### Krok 7: Implementujte tiles

Vytvořte hlavní přehledovou tile v `tiles/prehled.js`:

```javascript
import { renderTable } from '/src/ui/table.js';
import { renderCommonActions } from '/src/ui/commonActions.js';
import { listContracts } from '/src/modules/060-smlouva/db.js';
import { setBreadcrumb } from '/src/ui/breadcrumb.js';
import { navigateTo } from '/src/app.js';
import { getUserPermissions } from '/src/security/permissions.js';

let selectedRow = null;
let showArchived = false;

export async function render(root) {
  try {
    setBreadcrumb(document.getElementById('crumb'), [
      { icon: 'home', label: 'Domů', href: '#/' },
      { icon: 'document', label: 'Smlouvy', href: '#/m/060-smlouva' },
      { icon: 'list', label: 'Přehled' }
    ]);
  } catch (e) {}

  root.innerHTML = `<div id="commonactions" class="mb-4"></div><div id="contracts-table"></div>`;

  const { data, error } = await listContracts({ showArchived });
  if (error) {
    root.querySelector('#contracts-table').innerHTML = 
      `<div class="p-4 text-red-600">Chyba: ${error.message}</div>`;
    return;
  }
  
  const rows = data || [];

  const columns = [
    { key: 'contract_number', label: 'Číslo smlouvy', width: '15%', sortable: true },
    { key: 'tenant_name', label: 'Nájemce', width: '20%' },
    { key: 'unit_name', label: 'Jednotka', width: '15%' },
    { key: 'date_start', label: 'Od', width: '10%', sortable: true },
    { key: 'date_end', label: 'Do', width: '10%', sortable: true },
    { key: 'monthly_rent', label: 'Nájem (Kč)', width: '12%', sortable: true },
    { key: 'status', label: 'Stav', width: '10%', sortable: true },
    { key: 'archivedLabel', label: 'Archivován', width: '8%' }
  ];

  function drawActions() {
    const ca = document.getElementById('commonactions');
    if (!ca) return;
    const hasSel = !!selectedRow && !selectedRow.archived;
    const userRole = window.currentUserRole || 'admin';
    const perms = getUserPermissions(userRole);
    
    renderCommonActions(ca, {
      moduleActions: ['add', 'edit', 'archive', 'refresh'],
      userRole,
      handlers: {
        onAdd: () => navigateTo('#/m/060-smlouva/f/edit'),
        onEdit: hasSel ? () => navigateTo(`#/m/060-smlouva/f/edit?id=${selectedRow.id}`) : undefined,
        onArchive: (perms.includes('archive') && hasSel) ? async () => {
          const { archiveContract } = await import('/src/modules/060-smlouva/db.js');
          await archiveContract(selectedRow.id);
          selectedRow = null;
          await render(root);
        } : undefined,
        onRefresh: () => render(root)
      }
    });
  }

  drawActions();

  renderTable(root.querySelector('#contracts-table'), {
    columns,
    rows: rows.map(r => ({
      ...r,
      tenant_name: r.tenant?.display_name || '—',
      unit_name: r.unit?.oznaceni || '—',
      archivedLabel: r.archived ? 'Ano' : ''
    })),
    options: {
      moduleId: '060-smlouva',
      onRowSelect: row => {
        selectedRow = (selectedRow && selectedRow.id === row.id) ? null : row;
        drawActions();
      },
      onRowDblClick: row => {
        navigateTo(`#/m/060-smlouva/f/detail?id=${row.id}`);
      }
    }
  });
}

export default { render };
```

### Krok 8: Implementujte forms

Vytvořte formulář pro editaci v `forms/edit.js` (podobně jako v modulu 040).

### Krok 9: Registrujte modul v aplikaci

Odkomentujte řádek v `src/app/modules.index.js`:

```javascript
export const MODULE_SOURCES = [
  () => import('../modules/010-sprava-uzivatelu/module.config.js'),
  () => import('../modules/020-muj-ucet/module.config.js'),
  () => import('../modules/030-pronajimatel/module.config.js'),
  () => import('../modules/040-nemovitost/module.config.js'),
  () => import('../modules/050-najemnik/module.config.js'),
  () => import('../modules/060-smlouva/module.config.js'),  // ← ODKOMENTOVÁNO
  // () => import('../modules/070-sluzby/module.config.js'),
  // ...
];
```

### Krok 10: Testování

1. **Spusťte aplikaci** a ověřte, že modul se zobrazuje v sidebaru
2. **Otevřete modul** a zkontrolujte, že se načítá defaultní tile
3. **Zkuste vytvořit záznam** přes formulář
4. **Ověřte CRUD operace**: Vytvoření, čtení, úprava, archivace
5. **Zkontrolujte breadcrumbs** a navigaci

## ✅ Checklist před commitem

Před commitem nového modulu ověřte:

- [ ] Module.config.js je kompletní a správně nakonfigurovaný
- [ ] Všechny placeholdery jsou nahrazené
- [ ] Databázová migrace je vytvořena a otestována
- [ ] `docs/database-schema.md` je aktualizovaná
- [ ] db.js obsahuje všechny potřebné operace
- [ ] Tiles jsou funkční a zobrazují data
- [ ] Forms jsou funkční (create, update)
- [ ] Breadcrumbs fungují správně
- [ ] CommonActions fungují správně
- [ ] Modul je registrovaný v modules.index.js
- [ ] Aplikace se spouští bez chyb
- [ ] CRUD operace fungují

## 📝 Commit message template

```
feat: Add module XXX (Název modulu)

- Created module structure (config, tiles, forms)
- Added database schema (contracts table)
- Implemented CRUD operations
- Updated database schema documentation
- Registered module in modules.index.js

Module features:
- Feature 1
- Feature 2
- Feature 3
```

## 🔗 Reference

- **Referenční moduly**: 010 (uživatelé), 030 (pronajímatelé), 040 (nemovitosti)
- **Šablona modulu**: `src/modules/000-sablona/`
- **Dokumentace databáze**: `docs/database-schema.md`
- **Návod na údržbu DB**: `docs/database-schema-maintenance.md`
- **Standardy modulů**: `docs/STANDARDIZACNI-NAVOD.md`

---

**Potřebujete pomoc?** Kontaktujte vedoucího vývoje nebo se inspirujte existujícími moduly! 🚀
