# SPECIFIKACE PRO AGENTA - MODUL 040 (NEMOVITOSTI)

**Verze:** 2025-11-10  
**Účel:** Kompletní a detailní specifikace pro vytvoření modulu 040-nemovitost v aplikaci v5  
**Pro:** Automatizovaný nebo lidský agent  
**Založeno na:** Pravidla pro agenta (aplikace-v5_stav.md) + existující dokumentace modulu 040

---

## 📋 OBSAH

1. [Úvod a kontext](#1-úvod-a-kontext)
2. [Základní principy a pravidla](#2-základní-principy-a-pravidla)
3. [Struktura modulu](#3-struktura-modulu)
4. [Databázové schéma](#4-databázové-schéma)
5. [Manifest (module.config.js)](#5-manifest-moduleconfigjs)
6. [Datová vrstva (db.js)](#6-datová-vrstva-dbjs)
7. [Tiles (Přehledy)](#7-tiles-přehledy)
8. [Forms (Formuláře)](#8-forms-formuláře)
9. [Bezpečnost a oprávnění](#9-bezpečnost-a-oprávnění)
10. [Validace a utility](#10-validace-a-utility)
11. [UI integrace](#11-ui-integrace)
12. [Testování](#12-testování)
13. [Checklist implementace](#13-checklist-implementace)
14. [Rychlé příklady kódu](#14-rychlé-příklady-kódu)

---

## 1. ÚVOD A KONTEXT

### 1.1 Účel modulu

Modul **040-nemovitost** implementuje komplexní správu nemovitostí (budov/objektů) a jejich jednotek. Umožňuje:

- CRUD operace pro nemovitosti i jednotky
- Správu stavu jednotek (volná, obsazená, rezervovaná, rekonstrukce)
- Vazby na pronajímatele (modul 030) a nájemce (modul 050)
- Evidenci technických detailů (rok výstavby, vybavení, plocha)
- Archivaci s možností obnovy
- Správu příloh a historie změn

### 1.2 Klíčové entity

1. **Nemovitost (property)** - Budova/objekt/pozemek
2. **Jednotka (unit)** - Jednotlivá jednotka v rámci nemovitosti (byt, kancelář, sklad, garáž)

### 1.3 Vazby na jiné moduly

- **030-pronajimatel**: Vlastník nemovitosti
- **050-najemnik**: Nájemce jednotky
- **AttachmentSystem**: Přílohy k nemovitostem a jednotkám
- **Router**: Navigace mezi pohledy

---

## 2. ZÁKLADNÍ PRINCIPY A PRAVIDLA

### 2.1 Obecná pravidla aplikace v5

✅ **VŽDY:**
- Modul je samostatná, lazy-loadovatelná jednotka
- Kód musí být čitelný, jednoduchý, vanilla ES6 modules
- Konzistence: kebab-case pro soubory, camelCase pro funkce
- Bez build procesu - vše musí fungovat v prohlížeči
- Bezpečnost na prvním místě: validuj vstupy, RLS policies
- Používej relativní importy

❌ **NIKDY:**
- Nemazat funkční kód bez důvodu
- Neměnit strukturu bez konzultace
- Necommitovat secrets
- Neignorovat bezpečnost
- Neodstraňovat testy

### 2.2 Pravidla pro modul 040

- **Prefix ID**: Všechny ID začínají `040-nemovitost`
- **Defaultní tile**: `prehled`
- **Ikona modulu**: `building` nebo `home`
- **Archivace**: Preferuj soft delete (archived flag) před hard delete
- **Validace**: Kontroluj PSČ, rok výstavby, plochu na frontendu i backendu

---

## 3. STRUKTURA MODULU

### 3.1 Adresářová struktura

```
src/modules/040-nemovitost/
├── module.config.js          # Manifest modulu (POVINNÉ)
├── db.js                      # Datová vrstva (POVINNÉ)
├── tiles/                     # Přehledy
│   ├── prehled.js            # Hlavní přehled všech nemovitostí
│   └── seznam.js             # Seznam s pokročilými filtry (volitelné)
├── forms/                     # Formuláře
│   ├── detail.js             # Read-only detail nemovitosti
│   ├── edit.js               # Vytvoření/úprava nemovitosti
│   ├── jednotka-detail.js    # Read-only detail jednotky
│   └── jednotka-edit.js      # Vytvoření/úprava jednotky
├── services/                  # Volitelné pomocné služby
│   ├── validators.js         # Validační funkce
│   └── utils.js              # Formátovací funkce
└── assets/                    # Dokumentace
    ├── README.md
    ├── datovy-model.md
    ├── permissions.md
    ├── checklist.md
    └── AGENT-SPECIFICATION.md  # Tento dokument
```

### 3.2 Registrace modulu

Modul MUSÍ být zaregistrován v `src/app/modules.index.js`:

```javascript
export const MODULE_SOURCES = [
  // ... další moduly
  () => import('../modules/040-nemovitost/module.config.js'),
  // ... další moduly
];
```

---

## 4. DATABÁZOVÉ SCHÉMA

### 4.1 Tabulka: `properties` (Nemovitosti)

```sql
CREATE TABLE properties (
  -- Primární klíč
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Základní údaje
  typ VARCHAR(50) NOT NULL,                    -- Typ nemovitosti (enum)
  nazev VARCHAR(255) NOT NULL,                 -- Název nemovitosti
  pocet_jednotek INTEGER NOT NULL DEFAULT 0,   -- Počet jednotek
  
  -- Vazby
  pronajimatel_id UUID,                        -- FK na subjects (vlastník)
  spravce VARCHAR(255),                        -- Jméno správce
  
  -- Adresa
  ulice VARCHAR(255),
  cislo_popisne VARCHAR(20),
  mesto VARCHAR(255),
  psc VARCHAR(10),                             -- Validace: "^[0-9]{3}\s?[0-9]{2}$"
  stat VARCHAR(100) NOT NULL DEFAULT 'Česká republika',
  
  -- Technické údaje
  pocet_nadzemních_podlazi INTEGER,
  pocet_podzemních_podlazi INTEGER,
  rok_vystavby INTEGER,                        -- Min: 1800, Max: currentYear
  rok_rekonstrukce INTEGER,                    -- Min: 1800, Max: currentYear
  
  -- Vybavení (JSONB array)
  vybaveni JSONB DEFAULT '[]'::jsonb,          -- ["vytah","parkovani","kolarna"]
  
  -- Poznámka
  poznamka TEXT,
  
  -- Archivace (soft delete)
  archived BOOLEAN NOT NULL DEFAULT false,
  archived_at TIMESTAMPTZ,
  
  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Foreign keys
  CONSTRAINT fk_properties_pronajimatel 
    FOREIGN KEY (pronajimatel_id) 
    REFERENCES subjects(id) 
    ON DELETE SET NULL
);
```

#### 4.1.1 Enum: Typy nemovitostí

```javascript
const PROPERTY_TYPES = {
  'bytovy_dum':    { name: 'Bytový dům', icon: '🏢', jednotka: 'byt' },
  'rodinny_dum':   { name: 'Rodinný dům', icon: '🏠', jednotka: 'byt' },
  'admin_budova':  { name: 'Administrativní budova', icon: '🏬', jednotka: 'kancelar' },
  'prumyslovy':    { name: 'Průmyslový objekt', icon: '🏭', jednotka: 'sklad' },
  'pozemek':       { name: 'Pozemek', icon: '🌳', jednotka: null },
  'jiny':          { name: 'Jiný objekt', icon: '🏘️', jednotka: 'jina' }
};
```

#### 4.1.2 Indexy pro properties

```sql
CREATE INDEX idx_properties_typ ON properties(typ);
CREATE INDEX idx_properties_pronajimatel ON properties(pronajimatel_id);
CREATE INDEX idx_properties_archived ON properties(archived);
CREATE INDEX idx_properties_mesto ON properties(mesto);
```

#### 4.1.3 RLS Policies pro properties

```sql
-- Povolení RLS
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Čtení: všichni přihlášení uživatelé
CREATE POLICY "properties_read" ON properties
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- Vytvoření: pouze s oprávněním properties.create
CREATE POLICY "properties_create" ON properties
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_permissions 
      WHERE user_id = auth.uid() 
      AND permission = 'properties.create'
    )
  );

-- Úprava: pouze s oprávněním properties.update
CREATE POLICY "properties_update" ON properties
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM user_permissions 
      WHERE user_id = auth.uid() 
      AND permission = 'properties.update'
    )
  );

-- Delete policy - pouze superadmin (hard delete)
CREATE POLICY "properties_delete" ON properties
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'superadmin'
    )
  );
```

### 4.2 Tabulka: `units` (Jednotky)

```sql
CREATE TABLE units (
  -- Primární klíč
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Vazba na nemovitost
  nemovitost_id UUID NOT NULL,                 -- FK na properties
  
  -- Základní údaje
  oznaceni VARCHAR(50) NOT NULL,               -- Označení jednotky (např. "1A", "101")
  typ VARCHAR(50) NOT NULL,                    -- Typ jednotky (enum)
  
  -- Dispozice
  podlazi VARCHAR(20),                         -- Text: "1", "přízemí", "-1"
  plocha DECIMAL(10,2) NOT NULL,               -- Plocha v m² (> 0)
  dispozice VARCHAR(20),                       -- Např. "2+1", "3+kk"
  pocet_mistnosti INTEGER,                     -- Počet místností
  
  -- Stav a nájemní vztah
  stav VARCHAR(20) NOT NULL DEFAULT 'volna',   -- Stav jednotky (enum)
  najemce_id UUID,                             -- FK na subjects (nájemce)
  najemce VARCHAR(255),                        -- Ručně zadané jméno (fallback)
  mesicni_najem DECIMAL(10,2),                 -- Měsíční nájem v Kč (>= 0)
  datum_zacatku_najmu DATE,
  datum_konce_najmu DATE,                      -- >= datum_zacatku_najmu
  
  -- Poznámka
  poznamka TEXT,
  
  -- Archivace (soft delete)
  archived BOOLEAN NOT NULL DEFAULT false,
  archived_at TIMESTAMPTZ,
  
  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Foreign keys
  CONSTRAINT fk_units_nemovitost 
    FOREIGN KEY (nemovitost_id) 
    REFERENCES properties(id) 
    ON DELETE CASCADE,
  CONSTRAINT fk_units_najemce 
    FOREIGN KEY (najemce_id) 
    REFERENCES subjects(id) 
    ON DELETE SET NULL
);
```

#### 4.2.1 Enum: Typy jednotek

```javascript
const UNIT_TYPES = {
  'byt':      { name: 'Byt', icon: '🏠' },
  'kancelar': { name: 'Kancelář', icon: '💼' },
  'obchod':   { name: 'Obchodní prostor', icon: '🛍️' },
  'sklad':    { name: 'Sklad', icon: '📦' },
  'garaz':    { name: 'Garáž/Parking', icon: '🚗' },
  'sklep':    { name: 'Sklep', icon: '📦' },
  'puda':     { name: 'Půda', icon: '🏠' },
  'jina':     { name: 'Jiná jednotka', icon: '🔑' }
};
```

#### 4.2.2 Enum: Stavy jednotek

```javascript
const UNIT_STATES = {
  'volna':        { name: 'Volná', color: '#10b981', badge: 'success' },
  'obsazena':     { name: 'Obsazená', color: '#ef4444', badge: 'danger' },
  'rezervovana':  { name: 'Rezervovaná', color: '#f59e0b', badge: 'warning' },
  'rekonstrukce': { name: 'Rekonstrukce', color: '#6b7280', badge: 'secondary' }
};
```

#### 4.2.3 Indexy pro units

```sql
CREATE INDEX idx_units_nemovitost ON units(nemovitost_id);
CREATE INDEX idx_units_typ ON units(typ);
CREATE INDEX idx_units_stav ON units(stav);
CREATE INDEX idx_units_najemce ON units(najemce_id);
CREATE INDEX idx_units_archived ON units(archived);
```

#### 4.2.4 RLS Policies pro units

```sql
-- Povolení RLS
ALTER TABLE units ENABLE ROW LEVEL SECURITY;

-- Čtení: všichni přihlášení uživatelé
CREATE POLICY "units_read" ON units
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- Vytvoření: pouze s oprávněním units.create
CREATE POLICY "units_create" ON units
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_permissions 
      WHERE user_id = auth.uid() 
      AND permission = 'units.create'
    )
  );

-- Úprava: pouze s oprávněním units.update
CREATE POLICY "units_update" ON units
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM user_permissions 
      WHERE user_id = auth.uid() 
      AND permission = 'units.update'
    )
  );
```

### 4.3 Triggery

#### 4.3.1 Automatická aktualizace `updated_at`

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER units_updated_at
  BEFORE UPDATE ON units
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

#### 4.3.2 Validace typu nemovitosti při přidání jednotky

```sql
CREATE OR REPLACE FUNCTION validate_unit_property_type()
RETURNS TRIGGER AS $$
DECLARE
  property_type VARCHAR(50);
BEGIN
  SELECT typ INTO property_type FROM properties WHERE id = NEW.nemovitost_id;
  
  IF property_type = 'pozemek' THEN
    RAISE EXCEPTION 'Nelze přidat jednotku k pozemku';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER units_validate_property_type
  BEFORE INSERT OR UPDATE ON units
  FOR EACH ROW
  EXECUTE FUNCTION validate_unit_property_type();
```

### 4.4 Pomocný View

```sql
CREATE VIEW properties_with_stats AS
SELECT 
  p.*,
  COUNT(u.id) AS total_units,
  COUNT(CASE WHEN u.stav = 'volna' AND u.archived = false THEN 1 END) AS free_units,
  COUNT(CASE WHEN u.stav = 'obsazena' AND u.archived = false THEN 1 END) AS occupied_units
FROM properties p
LEFT JOIN units u ON u.nemovitost_id = p.id
GROUP BY p.id;
```

---

## 5. MANIFEST (module.config.js)

### 5.1 Povinná struktura

```javascript
// src/modules/040-nemovitost/module.config.js

export async function getManifest() {
  return {
    id: '040-nemovitost',
    title: 'Nemovitosti',
    icon: 'building',  // nebo 'home'
    defaultTile: 'prehled',
    
    tiles: [
      { 
        id: 'prehled', 
        title: 'Přehled nemovitostí', 
        icon: 'list', 
        collapsible: false 
      }
    ],
    
    forms: [
      { 
        id: 'detail', 
        title: 'Detail nemovitosti', 
        icon: 'view', 
        showInSidebar: false 
      },
      { 
        id: 'edit', 
        title: 'Formulář', 
        icon: 'form', 
        showInSidebar: false 
      },
      { 
        id: 'jednotka-detail', 
        title: 'Detail jednotky', 
        icon: 'view', 
        showInSidebar: false 
      },
      { 
        id: 'jednotka-edit', 
        title: 'Formulář jednotky', 
        icon: 'form', 
        showInSidebar: false 
      }
    ]
  };
}

export default { getManifest };
```

### 5.2 Kontrola před nasazením

✅ Zkontroluj:
- `id` přesně odpovídá názvu adresáře (`040-nemovitost`)
- `defaultTile` existuje v poli `tiles`
- Všechny tile IDs jsou unikátní
- Všechny form IDs jsou unikátní
- Forms mají `showInSidebar: false` (pokud nemají být v sidebaru)

---

## 6. DATOVÁ VRSTVA (db.js)

### 6.1 Povinné funkce

```javascript
// src/modules/040-nemovitost/db.js

import { supabase } from '../../supabase.js';

// ============================================================
// PROPERTIES (Nemovitosti)
// ============================================================

/**
 * Načte seznam nemovitostí s filtry
 * @param {Object} filters - { showArchived, typ, mesto, search }
 * @returns {Promise<{data, error}>}
 */
export async function listProperties(filters = {}) {
  const { showArchived = false, typ, mesto, search } = filters;
  
  let query = supabase
    .from('properties_with_stats')  // Použij view pro statistiky
    .select('*')
    .order('created_at', { ascending: false });
  
  // Filtr archivovaných
  if (!showArchived) {
    query = query.eq('archived', false);
  }
  
  // Filtr podle typu
  if (typ) {
    query = query.eq('typ', typ);
  }
  
  // Filtr podle města
  if (mesto) {
    query = query.eq('mesto', mesto);
  }
  
  // Fulltextové vyhledávání
  if (search && search.trim()) {
    query = query.or(`nazev.ilike.%${search}%,mesto.ilike.%${search}%,ulice.ilike.%${search}%`);
  }
  
  const { data, error } = await query;
  return { data, error };
}

/**
 * Načte detail nemovitosti podle ID
 * @param {string} id - UUID nemovitosti
 * @returns {Promise<{data, error}>}
 */
export async function getProperty(id) {
  const { data, error } = await supabase
    .from('properties_with_stats')
    .select('*')
    .eq('id', id)
    .single();
  
  return { data, error };
}

/**
 * Vytvoří novou nemovitost
 * @param {Object} data - Data nemovitosti
 * @returns {Promise<{data, error}>}
 */
export async function createProperty(data) {
  // Odstraň pole, která nepatří do DB
  const { total_units, free_units, occupied_units, ...dbData } = data;
  
  const { data: created, error } = await supabase
    .from('properties')
    .insert(dbData)
    .select()
    .single();
  
  return { data: created, error };
}

/**
 * Aktualizuje existující nemovitost
 * @param {string} id - UUID nemovitosti
 * @param {Object} data - Data k aktualizaci
 * @returns {Promise<{data, error}>}
 */
export async function updateProperty(id, data) {
  // Odstraň pole, která nepatří do DB nebo auditní pole
  const { 
    id: _id, 
    created_at, 
    updated_at, 
    total_units, 
    free_units, 
    occupied_units, 
    ...dbData 
  } = data;
  
  const { data: updated, error } = await supabase
    .from('properties')
    .update(dbData)
    .eq('id', id)
    .select()
    .single();
  
  return { data: updated, error };
}

/**
 * Archivuje nemovitost (soft delete)
 * @param {string} id - UUID nemovitosti
 * @returns {Promise<{data, error}>}
 */
export async function archiveProperty(id) {
  const { data, error } = await supabase
    .from('properties')
    .update({ 
      archived: true, 
      archived_at: new Date().toISOString() 
    })
    .eq('id', id)
    .select()
    .single();
  
  return { data, error };
}

/**
 * Obnoví archivovanou nemovitost
 * @param {string} id - UUID nemovitosti
 * @returns {Promise<{data, error}>}
 */
export async function restoreProperty(id) {
  const { data, error } = await supabase
    .from('properties')
    .update({ 
      archived: false, 
      archived_at: null 
    })
    .eq('id', id)
    .select()
    .single();
  
  return { data, error };
}

// ============================================================
// UNITS (Jednotky)
// ============================================================

/**
 * Načte seznam jednotek nemovitosti
 * @param {string} propertyId - UUID nemovitosti
 * @param {Object} filters - { showArchived, stav }
 * @returns {Promise<{data, error}>}
 */
export async function listUnits(propertyId, filters = {}) {
  const { showArchived = false, stav } = filters;
  
  let query = supabase
    .from('units')
    .select('*')
    .eq('nemovitost_id', propertyId)
    .order('oznaceni', { ascending: true });
  
  if (!showArchived) {
    query = query.eq('archived', false);
  }
  
  if (stav) {
    query = query.eq('stav', stav);
  }
  
  const { data, error } = await query;
  return { data, error };
}

/**
 * Načte detail jednotky podle ID
 * @param {string} id - UUID jednotky
 * @returns {Promise<{data, error}>}
 */
export async function getUnit(id) {
  const { data, error } = await supabase
    .from('units')
    .select('*')
    .eq('id', id)
    .single();
  
  return { data, error };
}

/**
 * Vytvoří novou jednotku
 * @param {Object} data - Data jednotky (včetně nemovitost_id)
 * @returns {Promise<{data, error}>}
 */
export async function createUnit(data) {
  const { data: created, error } = await supabase
    .from('units')
    .insert(data)
    .select()
    .single();
  
  return { data: created, error };
}

/**
 * Aktualizuje existující jednotku
 * @param {string} id - UUID jednotky
 * @param {Object} data - Data k aktualizaci
 * @returns {Promise<{data, error}>}
 */
export async function updateUnit(id, data) {
  // Odstraň auditní pole
  const { id: _id, created_at, updated_at, nemovitost_id, ...dbData } = data;
  
  const { data: updated, error } = await supabase
    .from('units')
    .update(dbData)
    .eq('id', id)
    .select()
    .single();
  
  return { data: updated, error };
}

/**
 * Archivuje jednotku (soft delete)
 * @param {string} id - UUID jednotky
 * @returns {Promise<{data, error}>}
 */
export async function archiveUnit(id) {
  const { data, error } = await supabase
    .from('units')
    .update({ 
      archived: true, 
      archived_at: new Date().toISOString() 
    })
    .eq('id', id)
    .select()
    .single();
  
  return { data, error };
}

/**
 * Obnoví archivovanou jednotku
 * @param {string} id - UUID jednotky
 * @returns {Promise<{data, error}>}
 */
export async function restoreUnit(id) {
  const { data, error } = await supabase
    .from('units')
    .update({ 
      archived: false, 
      archived_at: null 
    })
    .eq('id', id)
    .select()
    .single();
  
  return { data, error };
}
```

### 6.2 Kontrola před nasazením

✅ Zkontroluj:
- Všechny funkce vrací `{data, error}` formát
- Auditní pole (`created_at`, `updated_at`) se nepoužívají při update
- Filtr `showArchived` funguje správně
- Funkce neobsahují console.log (nebo smysluplné)

---

## 7. TILES (PŘEHLEDY)

### 7.1 tiles/prehled.js - Hlavní přehled nemovitostí

#### 7.1.1 Základní struktura

```javascript
// src/modules/040-nemovitost/tiles/prehled.js

import { listProperties, archiveProperty, restoreProperty } from '../db.js';
import { renderTable } from '../../../ui/table.js';
import { renderCommonActions } from '../../../ui/commonActions.js';
import { setBreadcrumb } from '../../../ui/breadcrumb.js';
import { navigateTo } from '../../../app.js';
import { toast } from '../../../ui/toast.js';

let selectedRow = null;
let showArchived = false;

export async function render(root, manifest, { userRole }) {
  const crumb = document.getElementById('crumb');
  const commonActions = document.getElementById('commonactions');
  
  // ============================================================
  // BREADCRUMB
  // ============================================================
  setBreadcrumb(crumb, [
    { icon: 'home', label: 'Domů', href: '#/' },
    { icon: manifest.icon, label: manifest.title },
    { icon: 'list', label: 'Přehled' }
  ]);
  
  // ============================================================
  // COMMON ACTIONS
  // ============================================================
  renderCommonActions(commonActions, {
    moduleActions: ['add', 'edit', 'archive', 'attach', 'refresh', 'history'],
    userRole: userRole,
    handlers: {
      onAdd: () => navigateTo(`#/m/${manifest.id}/f/edit`),
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
        
        const action = selectedRow.archived ? 'obnovit' : 'archivovat';
        if (!confirm(`Opravdu chcete ${action} nemovitost "${selectedRow.nazev}"?`)) {
          return;
        }
        
        const fn = selectedRow.archived ? restoreProperty : archiveProperty;
        const { error } = await fn(selectedRow.id);
        
        if (error) {
          toast(`Chyba při ${action}ování: ${error.message}`, 'error');
        } else {
          toast(`Nemovitost ${action}ována`, 'success');
          await render(root, manifest, { userRole }); // Reload
        }
      },
      onAttach: () => {
        if (!selectedRow) {
          toast('Nejprve vyberte řádek', 'warning');
          return;
        }
        // TODO: Otevři modal s přílohami
        toast('Přílohy - zatím neimplementováno', 'info');
      },
      onHistory: () => {
        if (!selectedRow) {
          toast('Nejprve vyberte řádek', 'warning');
          return;
        }
        // TODO: Otevři modal s historií
        toast('Historie - zatím neimplementováno', 'info');
      },
      onRefresh: () => render(root, manifest, { userRole })
    }
  });
  
  // ============================================================
  // NAČTENÍ DAT
  // ============================================================
  const { data, error } = await listProperties({ showArchived });
  
  if (error) {
    root.innerHTML = `
      <div class="p-4 bg-red-50 text-red-700 rounded">
        <strong>Chyba při načítání dat:</strong> ${error.message}
      </div>
    `;
    return;
  }
  
  // ============================================================
  // RENDER TABULKY
  // ============================================================
  const container = document.createElement('div');
  container.className = 'space-y-4';
  
  // Header s filtry
  const header = document.createElement('div');
  header.className = 'flex items-center gap-4 mb-4';
  header.innerHTML = `
    <label class="flex items-center gap-2 cursor-pointer">
      <input 
        type="checkbox" 
        id="showArchivedCheckbox" 
        ${showArchived ? 'checked' : ''}
        class="w-4 h-4"
      />
      <span class="text-sm">Zobrazit archivované</span>
    </label>
  `;
  container.appendChild(header);
  
  // Event listener pro checkbox
  const checkbox = header.querySelector('#showArchivedCheckbox');
  checkbox.addEventListener('change', (e) => {
    showArchived = e.target.checked;
    render(root, manifest, { userRole });
  });
  
  // Tabulka
  const tableContainer = document.createElement('div');
  container.appendChild(tableContainer);
  
  renderTable(tableContainer, {
    columns: [
      { 
        key: 'typ', 
        label: 'Typ', 
        sortable: true, 
        width: '10%',
        render: (value) => {
          const typeConfig = PROPERTY_TYPES[value] || {};
          return `<span title="${typeConfig.name || value}">${typeConfig.icon || '🏢'} ${typeConfig.name || value}</span>`;
        }
      },
      { 
        key: 'nazev', 
        label: 'Název', 
        sortable: true, 
        width: '20%' 
      },
      { 
        key: 'mesto', 
        label: 'Město', 
        sortable: true, 
        width: '15%' 
      },
      { 
        key: 'ulice', 
        label: 'Ulice', 
        sortable: false, 
        width: '15%',
        render: (value, row) => {
          return value && row.cislo_popisne 
            ? `${value} ${row.cislo_popisne}` 
            : (value || '-');
        }
      },
      { 
        key: 'total_units', 
        label: 'Jednotky', 
        sortable: true, 
        width: '10%',
        render: (value) => value || '0'
      },
      { 
        key: 'free_units', 
        label: 'Volné', 
        sortable: true, 
        width: '10%',
        render: (value) => `<span class="text-green-600 font-semibold">${value || 0}</span>`
      },
      { 
        key: 'archived', 
        label: 'Archivován', 
        sortable: true, 
        width: '10%',
        render: (value) => value 
          ? '<span class="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">Ano</span>' 
          : '<span class="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">Ne</span>'
      }
    ],
    data: data || [],
    onRowClick: (row) => {
      navigateTo(`#/m/${manifest.id}/f/detail?id=${row.id}`);
    },
    onRowSelect: (row) => {
      selectedRow = row;
    },
    emptyMessage: showArchived 
      ? 'Žádné nemovitosti nenalezeny' 
      : 'Zatím nemáte žádné nemovitosti. Klikněte na "Přidat" pro vytvoření první.'
  });
  
  root.innerHTML = '';
  root.appendChild(container);
}

// Konstanty pro typy nemovitostí
const PROPERTY_TYPES = {
  'bytovy_dum':    { name: 'Bytový dům', icon: '🏢' },
  'rodinny_dum':   { name: 'Rodinný dům', icon: '🏠' },
  'admin_budova':  { name: 'Administrativní budova', icon: '🏬' },
  'prumyslovy':    { name: 'Průmyslový objekt', icon: '🏭' },
  'pozemek':       { name: 'Pozemek', icon: '🌳' },
  'jiny':          { name: 'Jiný objekt', icon: '🏘️' }
};
```

#### 7.1.2 Kontrola před nasazením

✅ Zkontroluj:
- Breadcrumb správně nastaven
- CommonActions vykresleny
- Checkbox "Zobrazit archivované" funguje
- Double-click naviguje na detail
- Single-click vyber řádek
- Empty state zobrazen pokud žádná data
- Error state zobrazen při chybě

---

## 8. FORMS (FORMULÁŘE)

### 8.1 forms/detail.js - Read-only detail nemovitosti

#### 8.1.1 Základní struktura

```javascript
// src/modules/040-nemovitost/forms/detail.js

import { getProperty } from '../db.js';
import { renderCommonActions } from '../../../ui/commonActions.js';
import { setBreadcrumb } from '../../../ui/breadcrumb.js';
import { navigateTo } from '../../../app.js';
import { formatDate, formatCurrency } from '../../../ui/utils.js';

export async function render(root, manifest, { query, userRole }) {
  const id = query.id;
  
  if (!id) {
    root.innerHTML = '<div class="text-red-500">Chybí ID nemovitosti</div>';
    return;
  }
  
  // Načti data
  const { data, error } = await getProperty(id);
  
  if (error || !data) {
    root.innerHTML = '<div class="text-red-500">Nemovitost nenalezena</div>';
    return;
  }
  
  // Breadcrumb
  setBreadcrumb(document.getElementById('crumb'), [
    { icon: 'home', label: 'Domů', href: '#/' },
    { icon: manifest.icon, label: manifest.title, href: `#/m/${manifest.id}/t/prehled` },
    { icon: 'list', label: 'Přehled', href: `#/m/${manifest.id}/t/prehled` },
    { label: data.nazev }
  ]);
  
  // CommonActions
  renderCommonActions(document.getElementById('commonactions'), {
    moduleActions: ['edit', 'archive', 'attach', 'history', 'refresh'],
    userRole: userRole,
    handlers: {
      onEdit: () => navigateTo(`#/m/${manifest.id}/f/edit?id=${id}`),
      onArchive: () => { /* TODO */ },
      onAttach: () => { /* TODO */ },
      onHistory: () => { /* TODO */ },
      onRefresh: () => render(root, manifest, { query, userRole })
    }
  });
  
  // Vykresli detail
  const typeConfig = PROPERTY_TYPES[data.typ] || {};
  const vybaveniArray = Array.isArray(data.vybaveni) ? data.vybaveni : [];
  
  root.innerHTML = `
    <div class="max-w-6xl mx-auto space-y-6">
      <!-- Info box s počtem jednotek -->
      ${data.total_units > 0 ? `
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-blue-900">
                Tato nemovitost má <strong>${data.total_units}</strong> jednotek
                (<strong class="text-green-600">${data.free_units}</strong> volných)
              </p>
            </div>
            <button 
              onclick="navigateTo('#/m/${manifest.id}/units?propertyId=${id}')"
              class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Správa jednotek
            </button>
          </div>
        </div>
      ` : ''}
      
      <!-- Sekce: Základní údaje -->
      <section class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-lg font-semibold mb-4">🏢 Základní údaje</h3>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">Typ nemovitosti</label>
            <div class="text-base">${typeConfig.icon || ''} ${typeConfig.name || data.typ}</div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">Název</label>
            <div class="text-base font-semibold">${data.nazev}</div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">Počet jednotek</label>
            <div class="text-base">${data.pocet_jednotek || 0}</div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">Správce</label>
            <div class="text-base">${data.spravce || '-'}</div>
          </div>
        </div>
      </section>
      
      <!-- Sekce: Adresa -->
      <section class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-lg font-semibold mb-4">📍 Adresa</h3>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">Ulice</label>
            <div class="text-base">${data.ulice || '-'}</div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">Číslo popisné</label>
            <div class="text-base">${data.cislo_popisne || '-'}</div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">Město</label>
            <div class="text-base">${data.mesto || '-'}</div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">PSČ</label>
            <div class="text-base">${data.psc || '-'}</div>
          </div>
          
          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-600 mb-1">Stát</label>
            <div class="text-base">${data.stat || 'Česká republika'}</div>
          </div>
        </div>
      </section>
      
      <!-- Sekce: Detaily -->
      <section class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-lg font-semibold mb-4">🏗️ Detaily</h3>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">Počet nadzemních podlaží</label>
            <div class="text-base">${data.pocet_nadzemních_podlazi || '-'}</div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">Počet podzemních podlaží</label>
            <div class="text-base">${data.pocet_podzemních_podlazi || '-'}</div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">Rok výstavby</label>
            <div class="text-base">${data.rok_vystavby || '-'}</div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">Rok rekonstrukce</label>
            <div class="text-base">${data.rok_rekonstrukce || '-'}</div>
          </div>
        </div>
      </section>
      
      <!-- Sekce: Vybavení -->
      ${vybaveniArray.length > 0 ? `
        <section class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-lg font-semibold mb-4">🔧 Vybavení</h3>
          
          <div class="flex flex-wrap gap-2">
            ${vybaveniArray.map(v => {
              const config = VYBAVENI_CONFIG[v] || { label: v, icon: '•' };
              return `<span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                ${config.icon} ${config.label}
              </span>`;
            }).join('')}
          </div>
        </section>
      ` : ''}
      
      <!-- Sekce: Poznámka -->
      ${data.poznamka ? `
        <section class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-lg font-semibold mb-4">📝 Poznámka</h3>
          <div class="text-base whitespace-pre-wrap">${data.poznamka}</div>
        </section>
      ` : ''}
      
      <!-- Sekce: Systém -->
      <section class="bg-slate-50 p-6 rounded-lg">
        <h3 class="text-lg font-semibold mb-4">⚙️ Systém</h3>
        
        <div class="grid grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">Vytvořeno</label>
            <div class="text-base">${formatDate(data.created_at)}</div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">Upraveno</label>
            <div class="text-base">${formatDate(data.updated_at)}</div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">Archivován</label>
            <div class="text-base">${data.archived ? 'Ano' : 'Ne'}</div>
          </div>
        </div>
      </section>
    </div>
  `;
}

// Konstanty
const PROPERTY_TYPES = {
  'bytovy_dum':    { name: 'Bytový dům', icon: '🏢' },
  'rodinny_dum':   { name: 'Rodinný dům', icon: '🏠' },
  'admin_budova':  { name: 'Administrativní budova', icon: '🏬' },
  'prumyslovy':    { name: 'Průmyslový objekt', icon: '🏭' },
  'pozemek':       { name: 'Pozemek', icon: '🌳' },
  'jiny':          { name: 'Jiný objekt', icon: '🏘️' }
};

const VYBAVENI_CONFIG = {
  'vytah': { label: 'Výtah', icon: '🛗' },
  'parkovani': { label: 'Parkování', icon: '🅿️' },
  'kolarna': { label: 'Kolárna', icon: '🚲' },
  'klimatizace': { label: 'Klimatizace', icon: '❄️' },
  'zabezpeceni': { label: 'Zabezpečení', icon: '🔒' },
  'bezbariery': { label: 'Bezbariérovost', icon: '♿' }
};
```

### 8.2 forms/edit.js - Vytvoření/úprava nemovitosti

```javascript
// src/modules/040-nemovitost/forms/edit.js

import { getProperty, createProperty, updateProperty } from '../db.js';
import { renderCommonActions } from '../../../ui/commonActions.js';
import { setBreadcrumb } from '../../../ui/breadcrumb.js';
import { navigateTo } from '../../../app.js';
import { toast } from '../../../ui/toast.js';
import { validateProperty } from '../services/validators.js';

export async function render(root, manifest, { query, userRole }) {
  const id = query.id;
  const isEdit = !!id;
  
  let propertyData = null;
  
  // Pokud editace, načti data
  if (isEdit) {
    const { data, error } = await getProperty(id);
    if (error || !data) {
      root.innerHTML = '<div class="text-red-500">Nemovitost nenalezena</div>';
      return;
    }
    propertyData = data;
  }
  
  // Breadcrumb
  setBreadcrumb(document.getElementById('crumb'), [
    { icon: 'home', label: 'Domů', href: '#/' },
    { icon: manifest.icon, label: manifest.title, href: `#/m/${manifest.id}/t/prehled` },
    { icon: 'list', label: 'Přehled', href: `#/m/${manifest.id}/t/prehled` },
    { label: isEdit ? `Úprava: ${propertyData.nazev}` : 'Nová nemovitost' }
  ]);
  
  // CommonActions
  renderCommonActions(document.getElementById('commonactions'), {
    moduleActions: isEdit ? ['save', 'archive', 'attach', 'history'] : ['save'],
    userRole: userRole,
    handlers: {
      onSave: () => handleSave(),
      onArchive: () => { /* TODO */ },
      onAttach: () => { /* TODO */ },
      onHistory: () => { /* TODO */ }
    }
  });
  
  // Render formulář
  renderForm(root, propertyData, isEdit);
  
  // Handler pro uložení
  async function handleSave() {
    const formData = getFormData();
    
    // Validace
    const { valid, errors } = validateProperty(formData);
    if (!valid) {
      toast(`Chyba validace: ${errors.join(', ')}`, 'error');
      return;
    }
    
    // Uložení
    const fn = isEdit ? updateProperty : createProperty;
    const args = isEdit ? [id, formData] : [formData];
    
    const { data, error } = await fn(...args);
    
    if (error) {
      toast(`Chyba při ukládání: ${error.message}`, 'error');
      return;
    }
    
    toast('Nemovitost uložena', 'success');
    
    // Přesměrování
    if (!isEdit && data.pocet_jednotek > 0) {
      // Pokud vytvoření a má jednotky, jdi na správu jednotek
      navigateTo(`#/m/${manifest.id}/units?propertyId=${data.id}`);
    } else {
      // Jinak jdi na detail
      navigateTo(`#/m/${manifest.id}/f/detail?id=${data.id}`);
    }
  }
  
  function getFormData() {
    const form = root.querySelector('form');
    const formData = new FormData(form);
    
    // Převeď na objekt
    const data = {};
    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }
    
    // Zpracuj checkboxy pro vybavení
    const vybaveni = [];
    form.querySelectorAll('input[name="vybaveni"]:checked').forEach(cb => {
      vybaveni.push(cb.value);
    });
    data.vybaveni = vybaveni;
    
    // Převeď číselné hodnoty
    if (data.pocet_jednotek) data.pocet_jednotek = parseInt(data.pocet_jednotek);
    if (data.pocet_nadzemních_podlazi) data.pocet_nadzemních_podlazi = parseInt(data.pocet_nadzemních_podlazi);
    if (data.pocet_podzemních_podlazi) data.pocet_podzemních_podlazi = parseInt(data.pocet_podzemních_podlazi);
    if (data.rok_vystavby) data.rok_vystavby = parseInt(data.rok_vystavby);
    if (data.rok_rekonstrukce) data.rok_rekonstrukce = parseInt(data.rok_rekonstrukce);
    
    return data;
  }
}

function renderForm(root, data, isEdit) {
  const currentYear = new Date().getFullYear();
  const vybaveniArray = Array.isArray(data?.vybaveni) ? data.vybaveni : [];
  
  root.innerHTML = `
    <div class="max-w-6xl mx-auto">
      <form class="space-y-6">
        <!-- Sekce: Základní údaje -->
        <section class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-lg font-semibold mb-4">🏢 Základní údaje</h3>
          
          <div class="grid grid-cols-2 gap-4">
            <div class="col-span-2">
              <label class="block text-sm font-medium mb-1">
                Typ nemovitosti <span class="text-red-500">*</span>
              </label>
              <select 
                name="typ" 
                required 
                class="w-full p-2 border rounded"
              >
                ${Object.entries(PROPERTY_TYPES).map(([key, config]) => `
                  <option value="${key}" ${data?.typ === key ? 'selected' : ''}>
                    ${config.icon} ${config.name}
                  </option>
                `).join('')}
              </select>
            </div>
            
            <div class="col-span-2">
              <label class="block text-sm font-medium mb-1">
                Název <span class="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                name="nazev" 
                required 
                maxlength="255"
                value="${data?.nazev || ''}"
                placeholder="Např. Bytový dům Centrum"
                class="w-full p-2 border rounded"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-1">
                Počet jednotek <span class="text-red-500">*</span>
              </label>
              <input 
                type="number" 
                name="pocet_jednotek" 
                required 
                min="0"
                value="${data?.pocet_jednotek || 0}"
                class="w-full p-2 border rounded"
              />
              <p class="text-xs text-gray-500 mt-1">0 pro pozemek bez jednotek</p>
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-1">Správce</label>
              <input 
                type="text" 
                name="spravce" 
                maxlength="255"
                value="${data?.spravce || ''}"
                placeholder="Název správcovské firmy"
                class="w-full p-2 border rounded"
              />
            </div>
          </div>
        </section>
        
        <!-- Sekce: Adresa -->
        <section class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-lg font-semibold mb-4">📍 Adresa</h3>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">Ulice</label>
              <input 
                type="text" 
                name="ulice" 
                maxlength="255"
                value="${data?.ulice || ''}"
                placeholder="Hlavní"
                class="w-full p-2 border rounded"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-1">Číslo popisné</label>
              <input 
                type="text" 
                name="cislo_popisne" 
                maxlength="20"
                value="${data?.cislo_popisne || ''}"
                placeholder="123/4"
                class="w-full p-2 border rounded"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-1">Město</label>
              <input 
                type="text" 
                name="mesto" 
                maxlength="255"
                value="${data?.mesto || ''}"
                placeholder="Praha"
                class="w-full p-2 border rounded"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-1">PSČ</label>
              <input 
                type="text" 
                name="psc" 
                maxlength="10"
                pattern="[0-9]{3}\\s?[0-9]{2}"
                value="${data?.psc || ''}"
                placeholder="110 00"
                class="w-full p-2 border rounded"
              />
              <p class="text-xs text-gray-500 mt-1">Formát: 123 45 nebo 12345</p>
            </div>
            
            <div class="col-span-2">
              <label class="block text-sm font-medium mb-1">Stát</label>
              <input 
                type="text" 
                name="stat" 
                maxlength="100"
                value="${data?.stat || 'Česká republika'}"
                class="w-full p-2 border rounded"
              />
            </div>
          </div>
        </section>
        
        <!-- Sekce: Detaily -->
        <section class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-lg font-semibold mb-4">🏗️ Detaily</h3>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">Počet nadzemních podlaží</label>
              <input 
                type="number" 
                name="pocet_nadzemních_podlazi" 
                min="0"
                value="${data?.pocet_nadzemních_podlazi || ''}"
                class="w-full p-2 border rounded"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-1">Počet podzemních podlaží</label>
              <input 
                type="number" 
                name="pocet_podzemních_podlazi" 
                min="0"
                value="${data?.pocet_podzemních_podlazi || ''}"
                class="w-full p-2 border rounded"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-1">Rok výstavby</label>
              <input 
                type="number" 
                name="rok_vystavby" 
                min="1800"
                max="${currentYear}"
                value="${data?.rok_vystavby || ''}"
                placeholder="1990"
                class="w-full p-2 border rounded"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-1">Rok rekonstrukce</label>
              <input 
                type="number" 
                name="rok_rekonstrukce" 
                min="1800"
                max="${currentYear}"
                value="${data?.rok_rekonstrukce || ''}"
                placeholder="2018"
                class="w-full p-2 border rounded"
              />
            </div>
          </div>
        </section>
        
        <!-- Sekce: Vybavení -->
        <section class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-lg font-semibold mb-4">🔧 Vybavení</h3>
          
          <div class="grid grid-cols-2 gap-3">
            ${Object.entries(VYBAVENI_CONFIG).map(([key, config]) => `
              <label class="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  name="vybaveni" 
                  value="${key}"
                  ${vybaveniArray.includes(key) ? 'checked' : ''}
                  class="w-4 h-4"
                />
                <span>${config.icon} ${config.label}</span>
              </label>
            `).join('')}
          </div>
        </section>
        
        <!-- Sekce: Poznámka -->
        <section class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-lg font-semibold mb-4">📝 Poznámka</h3>
          
          <textarea 
            name="poznamka" 
            rows="4"
            placeholder="Volitelná poznámka k nemovitosti"
            class="w-full p-2 border rounded"
          >${data?.poznamka || ''}</textarea>
        </section>
      </form>
    </div>
  `;
}

// Konstanty
const PROPERTY_TYPES = {
  'bytovy_dum':    { name: 'Bytový dům', icon: '🏢' },
  'rodinny_dum':   { name: 'Rodinný dům', icon: '🏠' },
  'admin_budova':  { name: 'Administrativní budova', icon: '🏬' },
  'prumyslovy':    { name: 'Průmyslový objekt', icon: '🏭' },
  'pozemek':       { name: 'Pozemek', icon: '🌳' },
  'jiny':          { name: 'Jiný objekt', icon: '🏘️' }
};

const VYBAVENI_CONFIG = {
  'vytah': { label: 'Výtah', icon: '🛗' },
  'parkovani': { label: 'Parkování', icon: '🅿️' },
  'kolarna': { label: 'Kolárna', icon: '🚲' },
  'klimatizace': { label: 'Klimatizace', icon: '❄️' },
  'zabezpeceni': { label: 'Zabezpečení', icon: '🔒' },
  'bezbariery': { label: 'Bezbariérovost', icon: '♿' }
};
```

### 8.3 Kontrola před nasazením - Forms

✅ Zkontroluj:
- Breadcrumb správně nastaven
- CommonActions vykresleny
- Formulář má všechny povinné pole
- Validace funguje
- Úspěšné uložení přesměruje správně
- Read-only view neobsahuje input pole

---

## 9. BEZPEČNOST A OPRÁVNĚNÍ

### 9.1 Seznam oprávnění

| Oprávnění | Popis | Role |
|-----------|-------|------|
| `properties.read` | Čtení nemovitostí | všichni |
| `properties.create` | Vytváření nemovitostí | správce, manažer |
| `properties.update` | Úprava nemovitostí | správce, manažer |
| `properties.archive` | Archivace nemovitostí | správce |
| `properties.delete` | Trvalé smazání | superadmin |
| `units.read` | Čtení jednotek | všichni |
| `units.create` | Vytváření jednotek | správce, manažer |
| `units.update` | Úprava jednotek | správce, manažer |
| `units.archive` | Archivace jednotek | správce |
| `units.delete` | Trvalé smazání | superadmin |

### 9.2 Implementace v UI

```javascript
import { getUserPermissions } from '../../../security/permissions.js';

const userRole = window.currentUserRole || 'ctenar';
const permissions = getUserPermissions(userRole);

// Kontrola oprávnění
const canCreate = permissions.includes('properties.create');
const canUpdate = permissions.includes('properties.update');
const canArchive = permissions.includes('properties.archive');

// Použití v CommonActions
renderCommonActions(ca, {
  moduleActions: ['add', 'edit', 'archive', 'attach', 'refresh'],
  handlers: {
    onAdd: canCreate ? () => navigateTo('#/m/040-nemovitost/f/edit') : undefined,
    onEdit: canUpdate && !!selectedRow ? () => navigateTo(`#/m/040-nemovitost/f/edit?id=${selectedRow.id}`) : undefined,
    onArchive: canArchive && !!selectedRow ? () => handleArchive(selectedRow) : undefined
  }
});
```

---

## 10. VALIDACE A UTILITY

### 10.1 services/validators.js

```javascript
// src/modules/040-nemovitost/services/validators.js

/**
 * Validuje data nemovitosti
 * @param {Object} data - Data k validaci
 * @returns {{valid: boolean, errors: string[]}}
 */
export function validateProperty(data) {
  const errors = [];
  
  // Povinné pole: nazev
  if (!data.nazev || data.nazev.trim().length === 0) {
    errors.push('Název je povinný');
  }
  
  // Povinné pole: typ
  const validTypes = ['bytovy_dum', 'rodinny_dum', 'admin_budova', 'prumyslovy', 'pozemek', 'jiny'];
  if (!data.typ || !validTypes.includes(data.typ)) {
    errors.push('Neplatný typ nemovitosti');
  }
  
  // Validace PSČ
  if (data.psc) {
    const pscRegex = /^[0-9]{3}\s?[0-9]{2}$/;
    if (!pscRegex.test(data.psc)) {
      errors.push('PSČ musí být ve formátu "123 45" nebo "12345"');
    }
  }
  
  // Validace roku výstavby
  if (data.rok_vystavby) {
    const currentYear = new Date().getFullYear();
    if (data.rok_vystavby < 1800 || data.rok_vystavby > currentYear) {
      errors.push(`Rok výstavby musí být mezi 1800 a ${currentYear}`);
    }
  }
  
  // Validace roku rekonstrukce
  if (data.rok_rekonstrukce) {
    const currentYear = new Date().getFullYear();
    if (data.rok_rekonstrukce < 1800 || data.rok_rekonstrukce > currentYear) {
      errors.push(`Rok rekonstrukce musí být mezi 1800 a ${currentYear}`);
    }
    if (data.rok_vystavby && data.rok_rekonstrukce < data.rok_vystavby) {
      errors.push('Rok rekonstrukce nemůže být před rokem výstavby');
    }
  }
  
  // Validace počtu jednotek
  if (data.pocet_jednotek < 0) {
    errors.push('Počet jednotek nemůže být záporný');
  }
  
  // Normalizace pole vybaveni
  if (!Array.isArray(data.vybaveni)) {
    data.vybaveni = [];
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validuje data jednotky
 * @param {Object} data - Data k validaci
 * @returns {{valid: boolean, errors: string[]}}
 */
export function validateUnit(data) {
  const errors = [];
  
  // Povinné pole: oznaceni
  if (!data.oznaceni || data.oznaceni.trim().length === 0) {
    errors.push('Označení je povinné');
  }
  
  // Povinné pole: typ
  const validTypes = ['byt', 'kancelar', 'obchod', 'sklad', 'garaz', 'sklep', 'puda', 'jina'];
  if (!data.typ || !validTypes.includes(data.typ)) {
    errors.push('Neplatný typ jednotky');
  }
  
  // Povinné pole: plocha
  if (!data.plocha || data.plocha <= 0) {
    errors.push('Plocha musí být větší než 0');
  }
  
  // Validace stavu
  const validStates = ['volna', 'obsazena', 'rezervovana', 'rekonstrukce'];
  if (!data.stav || !validStates.includes(data.stav)) {
    errors.push('Neplatný stav jednotky');
  }
  
  // Validace nájemného
  if (data.mesicni_najem && data.mesicni_najem < 0) {
    errors.push('Měsíční nájem nemůže být záporný');
  }
  
  // Validace data konce nájmu
  if (data.datum_zacatku_najmu && data.datum_konce_najmu) {
    if (new Date(data.datum_konce_najmu) < new Date(data.datum_zacatku_najmu)) {
      errors.push('Datum konce nájmu nemůže být před datem začátku');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
```

### 10.2 services/utils.js

```javascript
// src/modules/040-nemovitost/services/utils.js

/**
 * Formátuje adresu nemovitosti
 * @param {Object} property - Objekt nemovitosti
 * @returns {string} Formátovaná adresa
 */
export function formatAddress(property) {
  const parts = [];
  
  if (property.ulice) {
    parts.push(property.ulice);
    if (property.cislo_popisne) {
      parts[parts.length - 1] += ` ${property.cislo_popisne}`;
    }
  }
  
  if (property.mesto) {
    parts.push(property.mesto);
  }
  
  if (property.psc) {
    parts.push(property.psc);
  }
  
  if (property.stat && property.stat !== 'Česká republika') {
    parts.push(property.stat);
  }
  
  return parts.join(', ') || '-';
}

/**
 * Formátuje plochu
 * @param {number} plocha - Plocha v m²
 * @returns {string} Formátovaná plocha
 */
export function formatArea(plocha) {
  if (!plocha) return '-';
  return `${plocha.toLocaleString('cs-CZ')} m²`;
}

/**
 * Vrátí ikonu pro typ nemovitosti
 * @param {string} typ - Typ nemovitosti
 * @returns {string} Ikona
 */
export function getPropertyIcon(typ) {
  const icons = {
    'bytovy_dum': '🏢',
    'rodinny_dum': '🏠',
    'admin_budova': '🏬',
    'prumyslovy': '🏭',
    'pozemek': '🌳',
    'jiny': '🏘️'
  };
  return icons[typ] || '🏢';
}

/**
 * Vrátí ikonu pro typ jednotky
 * @param {string} typ - Typ jednotky
 * @returns {string} Ikona
 */
export function getUnitIcon(typ) {
  const icons = {
    'byt': '🏠',
    'kancelar': '💼',
    'obchod': '🛍️',
    'sklad': '📦',
    'garaz': '🚗',
    'sklep': '📦',
    'puda': '🏠',
    'jina': '🔑'
  };
  return icons[typ] || '🔑';
}

/**
 * Vrátí badge komponentu pro stav jednotky
 * @param {string} stav - Stav jednotky
 * @returns {string} HTML badge
 */
export function getStavBadge(stav) {
  const config = {
    'volna': { label: 'Volná', color: 'green' },
    'obsazena': { label: 'Obsazená', color: 'red' },
    'rezervovana': { label: 'Rezervovaná', color: 'yellow' },
    'rekonstrukce': { label: 'Rekonstrukce', color: 'gray' }
  };
  
  const c = config[stav] || { label: stav, color: 'gray' };
  return `<span class="px-2 py-1 bg-${c.color}-100 text-${c.color}-700 text-xs rounded">${c.label}</span>`;
}
```

---

## 11. UI INTEGRACE

### 11.1 CommonActions

Pro všechny tiles a forms použij `renderCommonActions` s těmito akcemi:

**V tiles:**
- `add` - Vytvoření nové nemovitosti
- `edit` - Úprava vybrané nemovitosti
- `archive` - Archivace/obnovení
- `attach` - Správa příloh
- `refresh` - Reload dat
- `history` - Historie změn

**Ve forms (detail):**
- `edit` - Přepnutí do editačního režimu
- `archive` - Archivace/obnovení
- `attach` - Správa příloh
- `history` - Historie změn
- `refresh` - Reload dat

**Ve forms (edit):**
- `save` - Uložení změn
- `archive` - Archivace (pouze při editaci)
- `attach` - Správa příloh (pouze při editaci)
- `history` - Historie změn (pouze při editaci)

### 11.2 Breadcrumb

Breadcrumb MUSÍ být nastaven v každém view:

```javascript
setBreadcrumb(crumb, [
  { icon: 'home', label: 'Domů', href: '#/' },
  { icon: manifest.icon, label: manifest.title, href: `#/m/${manifest.id}/t/prehled` },
  { icon: 'list', label: 'Přehled', href: `#/m/${manifest.id}/t/prehled` },
  { label: 'Aktuální view' }
]);
```

### 11.3 AttachmentSystem

Integrace s AttachmentSystem:

```javascript
import { AttachmentSystem } from '../../../ui/attachments.js';

// V handleru onAttach:
onAttach: () => {
  if (!selectedRow) return;
  
  const attachmentSystem = new AttachmentSystem({
    entity: 'properties',
    entityId: selectedRow.id,
    entityName: selectedRow.nazev
  });
  
  attachmentSystem.showModal();
}
```

---

## 12. TESTOVÁNÍ

### 12.1 Funkční testy

✅ **Test flow vytvoření nemovitosti:**
1. Otevři modul v sidebaru → otevře se přehled
2. Klikni "Přidat" → Otevře se formulář
3. Vyplň všechna povinná pole
4. Klikni "Uložit" → Zobrazí se toast "Nemovitost uložena"
5. Přesměruje na detail nemovitosti

✅ **Test flow úpravy nemovitosti:**
1. V přehledu vyber řádek
2. Klikni "Upravit" → Otevře se formulář s daty
3. Změň nějaké pole
4. Klikni "Uložit" → Zobrazí se toast
5. Přesměruje na detail

✅ **Test flow archivace:**
1. V přehledu vyber řádek
2. Klikni "Archivovat" → Zobrazí se potvrzovací dialog
3. Potvrď → Zobrazí se toast
4. Řádek zmizí z přehledu
5. Zaškrtni "Zobrazit archivované" → Řádek se zobrazí

✅ **Test validace:**
1. Otevři formulář pro vytvoření
2. Nech název prázdný
3. Klikni "Uložit" → Zobrazí se chybová hláška
4. Zadej PSČ ve špatném formátu
5. Klikni "Uložit" → Zobrazí se chybová hláška

### 12.2 Kontrolní checklist

- [ ] Modul se načte bez console errorů
- [ ] Breadcrumb správný na všech view
- [ ] CommonActions fungují
- [ ] Lze vytvořit novou nemovitost
- [ ] Lze upravit existující nemovitost
- [ ] Lze archivovat nemovitost
- [ ] Validace PSČ funguje
- [ ] Validace roku výstavby funguje
- [ ] Checkbox vybavení ukládá správně
- [ ] Double-click na řádek otevře detail
- [ ] Single-click vybere řádek
- [ ] "Zobrazit archivované" funguje
- [ ] Empty state zobrazen když žádná data
- [ ] Error state zobrazen při chybě

---

## 13. CHECKLIST IMPLEMENTACE

### 13.1 Před začátkem

- [ ] Prostuduj tento dokument kompletně
- [ ] Prostuduj existující modul 030-pronajimatel jako vzor
- [ ] Ujisti se, že máš přístup k Supabase
- [ ] Ujisti se, že znáš strukturu aplikace v5

### 13.2 Databáze (Fáze 1)

- [ ] Vytvoř tabulku `properties` se všemi sloupci
- [ ] Vytvoř tabulku `units` se všemi sloupci
- [ ] Nastav indexy pro properties
- [ ] Nastav indexy pro units
- [ ] Nastav foreign keys
- [ ] Implementuj RLS policies pro properties
- [ ] Implementuj RLS policies pro units
- [ ] Vytvoř trigger pro `updated_at` na properties
- [ ] Vytvoř trigger pro `updated_at` na units
- [ ] Vytvoř trigger pro validaci typu nemovitosti při přidání jednotky
- [ ] Vytvoř view `properties_with_stats`

### 13.3 Struktura modulu (Fáze 2)

- [ ] Vytvoř adresář `src/modules/040-nemovitost/`
- [ ] Vytvoř `module.config.js` s manifestem
- [ ] Vytvoř `db.js` s CRUD funkcemi pro properties
- [ ] Vytvoř `db.js` s CRUD funkcemi pro units
- [ ] Vytvoř složku `tiles/`
- [ ] Vytvoř složku `forms/`
- [ ] Vytvoř složku `services/`
- [ ] Zaregistruj modul v `src/app/modules.index.js`

### 13.4 Tiles (Fáze 3)

- [ ] Implementuj `tiles/prehled.js`
- [ ] Breadcrumb nastaven
- [ ] CommonActions vykresleny
- [ ] Načtení dat z DB
- [ ] Tabulka se sloupci
- [ ] Checkbox "Zobrazit archivované"
- [ ] Double-click navigace na detail
- [ ] Single-click výběr řádku
- [ ] Empty state
- [ ] Error handling

### 13.5 Forms (Fáze 4)

- [ ] Implementuj `forms/detail.js` (read-only view)
- [ ] Breadcrumb nastaven
- [ ] CommonActions vykresleny
- [ ] Všechny sekce zobrazeny
- [ ] Formátování dat (ikony, badge)
- [ ] Info box s počtem jednotek
- [ ] Implementuj `forms/edit.js` (create/edit)
- [ ] Breadcrumb nastaven
- [ ] CommonActions vykresleny
- [ ] Všechny sekce formuláře
- [ ] Validace na frontendu
- [ ] Handler pro uložení
- [ ] Přesměrování po uložení

### 13.6 Validace a utility (Fáze 5)

- [ ] Implementuj `services/validators.js`
- [ ] Funkce `validateProperty()`
- [ ] Funkce `validateUnit()`
- [ ] Implementuj `services/utils.js`
- [ ] Funkce `formatAddress()`
- [ ] Funkce `formatArea()`
- [ ] Funkce `getPropertyIcon()`
- [ ] Funkce `getUnitIcon()`
- [ ] Funkce `getStavBadge()`

### 13.7 Jednotky (Fáze 6) - VOLITELNÉ

- [ ] Implementuj view pro správu jednotek nemovitosti
- [ ] Implementuj `forms/jednotka-edit.js`
- [ ] Implementuj `forms/jednotka-detail.js`
- [ ] Integrace s tabulkou units

### 13.8 Testování (Fáze 7)

- [ ] Test vytvoření nemovitosti
- [ ] Test úpravy nemovitosti
- [ ] Test archivace nemovitosti
- [ ] Test obnovení nemovitosti
- [ ] Test validace formuláře
- [ ] Test navigace mezi pohledy
- [ ] Test s různými rolemi uživatelů
- [ ] Žádné console errory

### 13.9 Dokumentace (Fáze 8)

- [ ] README.md aktualizován
- [ ] Komentáře v kódu
- [ ] JSDoc pro veřejné funkce

---

## 14. RYCHLÉ PŘÍKLADY KÓDU

### 14.1 Načtení seznamu nemovitostí

```javascript
const { data, error } = await listProperties({ 
  showArchived: false, 
  typ: 'bytovy_dum',
  search: 'praha'
});
```

### 14.2 Vytvoření nemovitosti

```javascript
const propertyData = {
  typ: 'bytovy_dum',
  nazev: 'Bytový dům Centrum',
  pocet_jednotek: 10,
  ulice: 'Hlavní',
  cislo_popisne: '123/4',
  mesto: 'Praha',
  psc: '110 00',
  rok_vystavby: 1990,
  vybaveni: ['vytah', 'parkovani']
};

const { data, error } = await createProperty(propertyData);
```

### 14.3 Archivace nemovitosti

```javascript
const { data, error } = await archiveProperty('uuid-here');
if (!error) {
  toast('Nemovitost archivována', 'success');
}
```

### 14.4 Validace dat

```javascript
const { valid, errors } = validateProperty(formData);
if (!valid) {
  toast(`Chyba: ${errors.join(', ')}`, 'error');
  return;
}
```

---

## 15. ZÁVĚREČNÉ POZNÁMKY

### 15.1 Priorita implementace

1. **VYSOKÁ**: Database schema, manifest, db.js, tiles/prehled.js, forms/detail.js, forms/edit.js
2. **STŘEDNÍ**: Validátory, utility, správa jednotek
3. **NÍZKÁ**: Pokročilé filtry, statistiky, exporty

### 15.2 Časový odhad

- **Fáze 1-2** (Database + Struktura): 2-4 hodiny
- **Fáze 3** (Tiles): 3-5 hodin
- **Fáze 4** (Forms): 4-6 hodin
- **Fáze 5** (Validace): 1-2 hodiny
- **Fáze 6** (Jednotky): 4-6 hodin (volitelné)
- **Fáze 7** (Testování): 2-3 hodiny
- **Fáze 8** (Dokumentace): 1-2 hodiny

**Celkem:** 17-28 hodin (bez správy jednotek: 13-22 hodin)

### 15.3 Tipy pro agenta

💡 **Pokud nevíš, jak na to:**
- Podívej se na modul 030-pronajimatel jako vzor
- Každý soubor by měl mít jasný účel
- Drž se konvencí aplikace v5
- Testuj průběžně

💡 **Pokud něco nefunguje:**
- Zkontroluj console v prohlížeči
- Zkontroluj network tab (API calls)
- Zkontroluj RLS policies v Supabase
- Zkontroluj, že modul je zaregistrován v modules.index.js

💡 **Před commitem:**
- Projdi celý checklist
- Otestuj všechny funkce
- Zkontroluj, že žádné console errory
- Aktualizuj dokumentaci

---

**KONEC SPECIFIKACE** ✅

Tento dokument obsahuje vše, co potřebuješ pro implementaci modulu 040-nemovitost.  
Při dodržení této specifikace dostaneš plně funkční, bezpečný a konzistentní modul.

**Autor:** Systém  
**Verze:** 2025-11-10  
**Pro modul:** 040-nemovitost  
**Aplikace:** v5
