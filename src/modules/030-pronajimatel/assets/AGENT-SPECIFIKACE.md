# Kompletní specifikace pro agenta: Modul 030 - Pronajímatel

**Verze:** 2025-11-10  
**Účel:** Kompletní, detailní specifikace pro agenta k vytvoření modulu 030-pronajimatel v aplikaci v5

---

## 📋 Obsah

1. [Úvod a kontext](#1-úvod-a-kontext)
2. [Datový model a databáze](#2-datový-model-a-databáze)
3. [Manifest modulu](#3-manifest-modulu)
4. [Tiles (přehledy)](#4-tiles-přehledy)
5. [Forms (formuláře)](#5-forms-formuláře)
6. [Datová vrstva (db.js)](#6-datová-vrstva-dbjs)
7. [Oprávnění a bezpečnost](#7-oprávnění-a-bezpečnost)
8. [UI komponenty a integrace](#8-ui-komponenty-a-integrace)
9. [Validace a business logika](#9-validace-a-business-logika)
10. [Testování](#10-testování)
11. [Checklist implementace](#11-checklist-implementace)

---

## 1. Úvod a kontext

### 1.1 Účel modulu

Modul **030-pronajimatel** spravuje subjekty v roli pronajímatele (vlastníků nemovitostí). Subjekty mohou být různých typů:
- **Osoba** - fyzická osoba
- **OSVČ** - osoba samostatně výdělečně činná
- **Firma** - právnická osoba (s.r.o., a.s., atd.)
- **Spolek/Skupina** - spolky, sdružení
- **Státní instituce** - státní organizace
- **Zástupce** - osoba zastupující jiný subjekt

### 1.2 Vazby na jiné moduly

- **Modul 040 (Nemovitost)**: Pronajímatel vlastní nemovitosti (vztah 1:N)
- **Modul 060 (Smlouva)**: Pronajímatel je stranou smlouvy
- **Modul 080 (Platby)**: Pronajímatel přijímá platby

### 1.3 Pravidla aplikace v5

Modul MUSÍ dodržovat následující pravidla:
- Vanilla ES6 modules (žádný build proces)
- Lazy loading modulů přes `module.config.js`
- Relativní importy pro lokální soubory
- Absolutní importy začínající `/src/` pro sdílené komponenty
- Použití UI framework komponent (`renderTable`, `renderForm`, `CommonActions`)
- Row Level Security (RLS) v Supabase
- Soft delete (archivace místo mazání)
- Audit log pro všechny změny

---

## 2. Datový model a databáze

### 2.1 Tabulka: `subjects`

Hlavní tabulka pro všechny subjekty (pronajímatelé i nájemníci se liší pouze polem `role`).

#### Struktura tabulky

```sql
CREATE TABLE subjects (
  -- Identifikace
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role VARCHAR(50) NOT NULL, -- 'pronajimatel' | 'najemnik'
  type VARCHAR(50) NOT NULL, -- 'osoba' | 'osvc' | 'firma' | 'spolek' | 'stat' | 'zastupce'
  
  -- Základní údaje
  display_name VARCHAR(255) NOT NULL, -- Zobrazované jméno
  titul_pred VARCHAR(50),
  jmeno VARCHAR(255),
  prijmeni VARCHAR(255),
  titul_za VARCHAR(50),
  
  -- Identifikační údaje
  ico VARCHAR(20),              -- IČO (pro firmy, OSVČ)
  dic VARCHAR(20),              -- DIČ
  typ_dokladu VARCHAR(20),      -- 'op' | 'pas' | 'rid'
  cislo_dokladu VARCHAR(50),
  datum_narozeni DATE,
  
  -- Adresa
  country VARCHAR(100) DEFAULT 'Česká republika',
  street VARCHAR(255),
  cislo_popisne VARCHAR(20),
  city VARCHAR(255),
  zip VARCHAR(10),
  
  -- Kontakty
  primary_phone VARCHAR(50),
  primary_email VARCHAR(255) NOT NULL,
  
  -- Banking & Login
  bankovni_ucet VARCHAR(50),
  prihlasovaci_jmeno VARCHAR(100),
  prihlasovaci_heslo VARCHAR(255),
  
  -- Zastupování
  zastupce BOOLEAN DEFAULT false,
  zastupuje_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  
  -- Rozšířené údaje (JSONB)
  kontaktni_osoba JSONB,              -- Pro firmy: kontaktní osoba
  bankovni_ucty JSONB,                -- Array bankovních účtů
  preferovany_zpusob_komunikace VARCHAR(50), -- 'email' | 'telefon' | 'posta'
  podpisove_prava JSONB,              -- Array osob s podpisovým právem
  dorucovaci_adresa JSONB,            -- Jiná doručovací adresa
  platebni_info JSONB,                -- Platební informace
  
  -- Metadata
  archived BOOLEAN DEFAULT false,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);
```

#### Indexy

```sql
CREATE INDEX idx_subjects_role ON subjects(role);
CREATE INDEX idx_subjects_type ON subjects(type);
CREATE INDEX idx_subjects_archived ON subjects(archived);
CREATE INDEX idx_subjects_ico ON subjects(ico);
CREATE INDEX idx_subjects_city ON subjects(city);
CREATE INDEX idx_subjects_zastupuje ON subjects(zastupuje_id);
CREATE INDEX idx_subjects_display_name ON subjects(display_name);
```

#### RLS Policies

```sql
-- Čtení: všichni přihlášení uživatelé
CREATE POLICY "subjects_read" ON subjects
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- Vytvoření: uživatelé s oprávněním subjects.create
CREATE POLICY "subjects_create" ON subjects
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_permissions 
      WHERE user_id = auth.uid() 
      AND permission = 'subjects.create'
    )
  );

-- Úprava: uživatelé s oprávněním subjects.update
CREATE POLICY "subjects_update" ON subjects
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM user_permissions 
      WHERE user_id = auth.uid() 
      AND permission = 'subjects.update'
    )
  );

-- Delete (pouze pro hard delete): pouze superadmin
CREATE POLICY "subjects_delete" ON subjects
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'superadmin'
    )
  );
```

#### Triggers

```sql
-- Automatická aktualizace updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER subjects_updated_at
  BEFORE UPDATE ON subjects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Automatická aktualizace display_name při změně jména/příjmení
CREATE OR REPLACE FUNCTION update_subject_display_name()
RETURNS TRIGGER AS $$
BEGIN
  IF (NEW.type = 'osoba' OR NEW.type = 'zastupce') AND (NEW.jmeno IS NOT NULL OR NEW.prijmeni IS NOT NULL) THEN
    NEW.display_name := COALESCE(NEW.titul_pred || ' ', '') || 
                        COALESCE(NEW.jmeno, '') || ' ' || 
                        COALESCE(NEW.prijmeni, '') || 
                        COALESCE(' ' || NEW.titul_za, '');
    NEW.display_name := TRIM(NEW.display_name);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER subjects_display_name
  BEFORE INSERT OR UPDATE ON subjects
  FOR EACH ROW
  EXECUTE FUNCTION update_subject_display_name();
```

### 2.2 Tabulka: `subject_types`

Konfigurovatelné typy subjektů (osoba, firma, atd.).

```sql
CREATE TABLE subject_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(50) UNIQUE NOT NULL,  -- 'osoba', 'firma', atd.
  label VARCHAR(255) NOT NULL,        -- 'Osoba', 'Firma', atd.
  icon VARCHAR(50),                   -- 'person', 'building', atd.
  description TEXT,
  active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Výchozí typy
INSERT INTO subject_types (slug, label, icon, display_order) VALUES
  ('osoba', 'Osoba', 'person', 1),
  ('osvc', 'OSVČ', 'briefcase', 2),
  ('firma', 'Firma', 'building', 3),
  ('spolek', 'Spolek / Skupina', 'people', 4),
  ('stat', 'Státní instituce', 'bank', 5),
  ('zastupce', 'Zástupce', 'handshake', 6);
```

### 2.3 JSONB struktury

#### kontaktni_osoba
```json
{
  "jmeno": "Jana Nováková",
  "email": "jana@firma.cz",
  "telefon": "+420601234567",
  "pozice": "Vedoucí správy"
}
```

#### bankovni_ucty
```json
[
  {
    "banka": "ČSOB",
    "iban": "CZ6508000000192000145399",
    "bic": "GIBACZPX",
    "poznamka": "Hlavní účet",
    "default": true
  },
  {
    "banka": "KB",
    "iban": "CZ6501000000192000145400",
    "bic": "KOMBCZPP",
    "poznamka": "Účet pro kauce",
    "default": false
  }
]
```

#### podpisove_prava
```json
[
  {
    "user_id": "uuid-1",
    "jmeno": "Petr Svoboda",
    "role": "jednatel",
    "od": "2024-01-01",
    "do": null
  }
]
```

---

## 3. Manifest modulu

### 3.1 Soubor: `module.config.js`

**Umístění:** `/src/modules/030-pronajimatel/module.config.js`

**Aktuální implementace je SPRÁVNÁ**, ale zde je kompletní verze pro referenci:

```javascript
import { listSubjectTypes, getSubjectsCountsByType } from '/src/db/subjects.js';

export async function getManifest() {
  // Vytvoř hlavní tile s vnořenými typy subjektů
  const tiles = [
    {
      id: 'prehled',
      title: 'Přehled pronajímatelů',
      icon: 'list',
      collapsible: true,
      children: []
    }
  ];

  try {
    // Načti typy subjektů z databáze
    const resTypes = await listSubjectTypes();
    const subjectTypes = Array.isArray(resTypes?.data) ? resTypes.data : [];

    // Načti počty subjektů podle typu
    const { data: countData, error: countError } = await getSubjectsCountsByType({
      role: 'pronajimatel',
      showArchived: false
    });

    if (countError) {
      console.error('Error loading subject counts:', countError);
    }

    const countsMap = Object.fromEntries((countData || []).map(c => [c.type, c.count]));

    // Přidej typy s počty do sidebaru
    for (const typeConfig of subjectTypes) {
      if (!typeConfig || typeof typeConfig !== 'object') continue;
      
      const slug = typeConfig.slug;
      const label = typeConfig.label || slug || 'Typ';
      const count = countsMap[slug] || 0;

      if (count > 0) {
        tiles[0].children.push({
          id: slug,
          title: `${label} (${count})`,
          icon: typeConfig.icon || 'person',
          count: count,
          type: slug
        });
      }
    }
  } catch (e) {
    console.error('Error loading subject types:', e);
  }

  return {
    id: '030-pronajimatel',
    title: 'Pronajímatel',
    icon: 'home',
    defaultTile: 'prehled',
    tiles,
    forms: [
      { id: 'chooser', title: 'Nový subjekt', icon: 'add', showInSidebar: false },
      { id: 'detail', title: 'Detail pronajímatele', icon: 'view', showInSidebar: false },
      { id: 'form', title: 'Formulář', icon: 'form', showInSidebar: false },
      { id: 'subject-type', title: 'Správa typu subjektů', icon: 'settings', showInSidebar: true }
    ]
  };
}
```

### 3.2 Vysvětlení struktury

- **id**: `030-pronajimatel` - MUSÍ odpovídat názvu složky
- **title**: `Pronajímatel` - zobrazovaný název v UI
- **icon**: `home` - ikona modulu
- **defaultTile**: `prehled` - tile, která se otevře po kliknutí na modul
- **tiles**: pole dlaždic (přehledů)
  - `prehled` je hlavní tile s vnořenými typy (osoba, firma, atd.)
  - Vnořené typy se načítají dynamicky z databáze včetně počtů
- **forms**: pole formulářů
  - `showInSidebar: false` znamená, že se nezobrazují v sidebaru (jsou dostupné jen přes navigaci)

---

## 4. Tiles (přehledy)

### 4.1 Tile: Přehled (prehled.js)

**Umístění:** `/src/modules/030-pronajimatel/tiles/prehled.js`

#### Účel
Zobrazuje přehled VŠECH pronajímatelů (všech typů) v jedné tabulce.

#### Sloupce tabulky

| Klíč | Název | Šířka | Řazení | Popis |
|------|-------|-------|--------|-------|
| `typ_subjektu` | Typ | 10% | Ano | Typ subjektu s ikonou |
| `display_name` | Název / Jméno | 20% | Ne | Zobrazované jméno |
| `ico` | IČO | 10% | Ne | IČO (pokud má) |
| `primary_phone` | Telefon | 15% | Ne | Primární telefon |
| `primary_email` | Email | 18% | Ne | Primární email |
| `city` | Město | 15% | Ne | Město |
| `archivedLabel` | Archivován | 10% | Ne | "Ano" / "Ne" |

#### Actions (CommonActions)

- **add**: Přidat nového pronajímatele → navigace na `chooser` formulář
- **edit**: Upravit vybraného → navigace na `form` s parametrem `id`
- **archive**: Archivovat/obnovit vybraného
- **attach**: Přílohy vybraného subjektu
- **refresh**: Obnovit data
- **history**: Historie změn vybraného subjektu

#### Implementace

```javascript
// src/modules/030-pronajimatel/tiles/prehled.js

import { listSubjects } from '../db.js';
import { renderTable } from '/src/ui/table.js';
import { renderCommonActions } from '/src/ui/commonActions.js';
import { setBreadcrumb } from '/src/ui/breadcrumb.js';
import { navigateTo } from '/src/app.js';
import { toast } from '/src/ui/toast.js';
import { archiveSubject, unarchiveSubject } from '/src/db/subjects.js';
import { getUserPermissions } from '/src/security/permissions.js';
import { AttachmentSystem } from '/src/ui/attachments.js';
import { HistoryModal } from '/src/ui/history.js';

let selectedRow = null;
let showArchived = false;

export async function render(root, manifest, { userRole }) {
  const crumb = document.getElementById('crumb');
  const commonActions = document.getElementById('commonactions');
  
  // Breadcrumb
  setBreadcrumb(crumb, [
    { label: 'Domů', href: '#/' },
    { label: 'Pronajímatel', href: '#/m/030-pronajimatel' },
    { label: 'Přehled', active: true }
  ]);
  
  // Načti data
  await loadData(root, commonActions, userRole);
}

async function loadData(root, commonActions, userRole) {
  try {
    root.innerHTML = '<div class="loading">Načítám data...</div>';
    
    // Načti všechny pronajímatele
    const { data: subjects, error } = await listSubjects({
      role: 'pronajimatel',
      showArchived: showArchived
    });
    
    if (error) {
      throw error;
    }
    
    // Definice sloupců
    const columns = [
      {
        key: 'type',
        label: 'Typ',
        width: '10%',
        sortable: true,
        render: (value, row) => {
          const icons = {
            osoba: '👤',
            osvc: '💼',
            firma: '🏢',
            spolek: '👥',
            stat: '🏛️',
            zastupce: '🤝'
          };
          const labels = {
            osoba: 'Osoba',
            osvc: 'OSVČ',
            firma: 'Firma',
            spolek: 'Spolek',
            stat: 'Státní instituce',
            zastupce: 'Zástupce'
          };
          return `<span title="${labels[value] || value}">${icons[value] || '?'} ${labels[value] || value}</span>`;
        }
      },
      { key: 'display_name', label: 'Název / Jméno', width: '20%', sortable: false },
      { key: 'ico', label: 'IČO', width: '10%', sortable: false },
      { key: 'primary_phone', label: 'Telefon', width: '15%', sortable: false },
      { key: 'primary_email', label: 'Email', width: '18%', sortable: false },
      { key: 'city', label: 'Město', width: '15%', sortable: false },
      {
        key: 'archived',
        label: 'Archivován',
        width: '10%',
        sortable: false,
        render: (value) => value ? 'Ano' : 'Ne'
      }
    ];
    
    // Render tabulky
    root.innerHTML = '';
    const container = document.createElement('div');
    container.className = 'tile-container';
    root.appendChild(container);
    
    // Checkbox pro archivované
    const archiveCheckbox = document.createElement('div');
    archiveCheckbox.className = 'mb-3';
    archiveCheckbox.innerHTML = `
      <label class="form-check-label">
        <input type="checkbox" class="form-check-input" id="showArchivedCheckbox" ${showArchived ? 'checked' : ''}>
        Zobrazit archivované
      </label>
    `;
    container.appendChild(archiveCheckbox);
    
    document.getElementById('showArchivedCheckbox').addEventListener('change', async (e) => {
      showArchived = e.target.checked;
      await loadData(root, commonActions, userRole);
    });
    
    // Tabulka
    renderTable(container, {
      columns,
      data: subjects,
      onRowClick: (row) => {
        selectedRow = row;
        updateCommonActions(commonActions, userRole);
      },
      onRowDoubleClick: (row) => {
        navigateTo(`#/m/030-pronajimatel/f/detail?id=${row.id}`);
      },
      emptyMessage: 'Zatím nemáte žádné pronajímatele. Klikněte na "Přidat" pro vytvoření prvního.',
      selectedRowId: selectedRow?.id
    });
    
    // Common Actions
    updateCommonActions(commonActions, userRole);
    
  } catch (error) {
    console.error('Error loading subjects:', error);
    root.innerHTML = `<div class="alert alert-danger">Chyba při načítání dat: ${error.message}</div>`;
    toast.error('Chyba při načítání dat');
  }
}

function updateCommonActions(commonActions, userRole) {
  const permissions = getUserPermissions(userRole);
  
  const canCreate = permissions.includes('subjects.create');
  const canUpdate = permissions.includes('subjects.update');
  const canArchive = permissions.includes('subjects.archive');
  
  renderCommonActions(commonActions, {
    moduleActions: ['add', 'edit', 'archive', 'attach', 'refresh', 'history'],
    handlers: {
      onAdd: canCreate ? () => navigateTo('#/m/030-pronajimatel/f/chooser') : undefined,
      onEdit: canUpdate && selectedRow ? () => navigateTo(`#/m/030-pronajimatel/f/form?id=${selectedRow.id}`) : undefined,
      onArchive: canArchive && selectedRow ? async () => {
        const isArchived = selectedRow.archived;
        const action = isArchived ? 'obnovit' : 'archivovat';
        
        if (confirm(`Opravdu chcete ${action} tento záznam?`)) {
          try {
            if (isArchived) {
              await unarchiveSubject(selectedRow.id);
              toast.success('Záznam byl obnoven');
            } else {
              await archiveSubject(selectedRow.id);
              toast.success('Záznam byl archivován');
            }
            selectedRow = null;
            await loadData(document.getElementById('main-content'), commonActions, userRole);
          } catch (error) {
            toast.error(`Chyba při ${action}aci: ${error.message}`);
          }
        }
      } : undefined,
      onAttach: selectedRow ? () => {
        AttachmentSystem.showModal({
          entityType: 'subjects',
          entityId: selectedRow.id,
          entityName: selectedRow.display_name
        });
      } : undefined,
      onRefresh: () => loadData(document.getElementById('main-content'), commonActions, userRole),
      onHistory: selectedRow ? () => {
        HistoryModal.show({
          tableName: 'subjects',
          recordId: selectedRow.id,
          recordName: selectedRow.display_name
        });
      } : undefined
    },
    selectedRow: selectedRow
  });
}
```

### 4.2 Tile: Osoba (osoba.js)

**Umístění:** `/src/modules/030-pronajimatel/tiles/osoba.js`

#### Účel
Zobrazuje pouze pronajímatele typu "Osoba".

#### Sloupce tabulky

| Klíč | Název | Šířka | Řazení |
|------|-------|-------|--------|
| `display_name` | Jméno | - | Ne |
| `primary_email` | E-mail | - | Ne |
| `primary_phone` | Telefon | - | Ne |
| `city` | Město | - | Ne |

#### Actions
Stejné jako v `prehled.js`

#### Implementace

```javascript
// src/modules/030-pronajimatel/tiles/osoba.js

import { listSubjects } from '../db.js';
import { renderTable } from '/src/ui/table.js';
import { renderCommonActions } from '/src/ui/commonActions.js';
import { setBreadcrumb } from '/src/ui/breadcrumb.js';
import { navigateTo } from '/src/app.js';
import { toast } from '/src/ui/toast.js';

let selectedRow = null;
let showArchived = false;

export async function render(root, manifest, { userRole }) {
  const crumb = document.getElementById('crumb');
  const commonActions = document.getElementById('commonactions');
  
  // Breadcrumb
  setBreadcrumb(crumb, [
    { label: 'Domů', href: '#/' },
    { label: 'Pronajímatel', href: '#/m/030-pronajimatel' },
    { label: 'Osoby', active: true }
  ]);
  
  // Načti data pouze typu 'osoba'
  try {
    root.innerHTML = '<div class="loading">Načítám data...</div>';
    
    const { data: subjects, error } = await listSubjects({
      role: 'pronajimatel',
      type: 'osoba',  // FILTR podle typu
      showArchived: showArchived
    });
    
    if (error) throw error;
    
    const columns = [
      { key: 'display_name', label: 'Jméno', sortable: false },
      { key: 'primary_email', label: 'E-mail', sortable: false },
      { key: 'primary_phone', label: 'Telefon', sortable: false },
      { key: 'city', label: 'Město', sortable: false }
    ];
    
    root.innerHTML = '';
    const container = document.createElement('div');
    root.appendChild(container);
    
    renderTable(container, {
      columns,
      data: subjects,
      onRowClick: (row) => selectedRow = row,
      onRowDoubleClick: (row) => navigateTo(`#/m/030-pronajimatel/f/detail?id=${row.id}`),
      emptyMessage: 'Zatím nemáte žádné osoby jako pronajímatele.'
    });
    
    // Common Actions (stejné jako prehled.js)
    renderCommonActions(commonActions, {
      moduleActions: ['add', 'edit', 'archive', 'attach', 'refresh', 'history'],
      handlers: {
        onAdd: () => navigateTo('#/m/030-pronajimatel/f/chooser?type=osoba'),
        // ... další handlery stejné jako v prehled.js
      }
    });
    
  } catch (error) {
    console.error('Error:', error);
    root.innerHTML = `<div class="alert alert-danger">Chyba: ${error.message}</div>`;
  }
}
```

### 4.3 Tile: OSVČ (osvc.js)

Implementace stejná jako `osoba.js`, ale s filtrem `type: 'osvc'` a odpovídajícími sloupci:

- `display_name` - Jméno / Firma
- `ico` - IČO
- `primary_email` - E-mail
- `primary_phone` - Telefon

### 4.4 Tile: Firma (firma.js)

Implementace stejná jako `osoba.js`, ale s filtrem `type: 'firma'` a sloupci:

- `display_name` - Firma
- `ico` - IČO
- `primary_email` - E-mail
- `primary_phone` - Telefon
- `city` - Město

### 4.5 Tile: Spolek / Skupina (spolek.js)

Filtr: `type: 'spolek'`

Sloupce:
- `display_name` - Název
- `primary_email` - E-mail
- `primary_phone` - Telefon

### 4.6 Tile: Státní instituce (stat.js)

Filtr: `type: 'stat'`

Sloupce:
- `display_name` - Název
- `primary_email` - E-mail
- `city` - Město

### 4.7 Tile: Zástupci (zastupce.js)

Filtr: `type: 'zastupce'`

Sloupce:
- `display_name` - Jméno zástupce
- `zastupuje_id` - Zastupuje (ID) - s odkazem na detail zastupovaného
- `primary_email` - E-mail
- `primary_phone` - Telefon

---

## 5. Forms (formuláře)

### 5.1 Form: Chooser (chooser.js)

**Umístění:** `/src/modules/030-pronajimatel/forms/chooser.js`

#### Účel
Výběr typu subjektu před vytvořením nového pronajímatele.

#### UI
Zobrazí karty (cards) s typy subjektů:
- Osoba 👤
- OSVČ 💼
- Firma 🏢
- Spolek 👥
- Státní instituce 🏛️
- Zástupce 🤝

Po kliknutí na kartu naviguje na `form.js` s parametrem `type`.

#### Implementace

```javascript
// src/modules/030-pronajimatel/forms/chooser.js

import { setBreadcrumb } from '/src/ui/breadcrumb.js';
import { navigateTo } from '/src/app.js';
import { listSubjectTypes } from '/src/db/subjects.js';

export async function render(root) {
  const crumb = document.getElementById('crumb');
  
  setBreadcrumb(crumb, [
    { label: 'Domů', href: '#/' },
    { label: 'Pronajímatel', href: '#/m/030-pronajimatel' },
    { label: 'Nový subjekt', active: true }
  ]);
  
  // Načti typy z databáze
  const { data: types, error } = await listSubjectTypes();
  
  if (error) {
    root.innerHTML = `<div class="alert alert-danger">Chyba: ${error.message}</div>`;
    return;
  }
  
  root.innerHTML = `
    <div class="chooser-container">
      <h2>Vyberte typ subjektu</h2>
      <div class="row g-3 mt-3">
        ${types.map(type => `
          <div class="col-md-4">
            <div class="card chooser-card" data-type="${type.slug}" style="cursor: pointer;">
              <div class="card-body text-center">
                <div class="chooser-icon">${getIconEmoji(type.icon)}</div>
                <h5 class="card-title">${type.label}</h5>
                <p class="card-text text-muted">${type.description || ''}</p>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  
  // Event listener pro kliknutí na kartu
  root.querySelectorAll('.chooser-card').forEach(card => {
    card.addEventListener('click', () => {
      const type = card.dataset.type;
      navigateTo(`#/m/030-pronajimatel/f/form?type=${type}`);
    });
  });
}

function getIconEmoji(icon) {
  const iconMap = {
    person: '👤',
    briefcase: '💼',
    building: '🏢',
    people: '👥',
    bank: '🏛️',
    handshake: '🤝'
  };
  return iconMap[icon] || '📄';
}
```

### 5.2 Form: Detail (detail.js)

**Umístění:** `/src/modules/030-pronajimatel/forms/detail.js`

#### Účel
Zobrazení detailu pronajímatele v read-only režimu.

#### Actions (boční panel)
- **edit**: Upravit → navigace na `form.js` s `id`
- **attach**: Přílohy
- **archive**: Archivovat/obnovit
- **history**: Historie změn

#### Implementace

```javascript
// src/modules/030-pronajimatel/forms/detail.js

import { getSubject } from '../db.js';
import { setBreadcrumb } from '/src/ui/breadcrumb.js';
import { renderForm } from '/src/ui/form.js';
import { TYPE_SCHEMAS } from '/src/lib/type-schemas/subjects.js';
import { navigateTo } from '/src/app.js';

export async function render(root, params) {
  const { id } = params;
  
  if (!id) {
    root.innerHTML = '<div class="alert alert-danger">Chybí ID subjektu</div>';
    return;
  }
  
  try {
    // Načti data
    const { data: subject, error } = await getSubject(id);
    
    if (error) throw error;
    if (!subject) {
      root.innerHTML = '<div class="alert alert-danger">Subjekt nenalezen</div>';
      return;
    }
    
    // Breadcrumb
    setBreadcrumb(document.getElementById('crumb'), [
      { label: 'Domů', href: '#/' },
      { label: 'Pronajímatel', href: '#/m/030-pronajimatel' },
      { label: subject.display_name, active: true }
    ]);
    
    // Získej schema podle typu
    const schema = TYPE_SCHEMAS[subject.type] || [];
    
    // Render formuláře v read-only režimu
    renderForm(root, {
      fields: schema,
      data: subject,
      readOnly: true,
      title: `Detail: ${subject.display_name}`,
      actions: [
        {
          label: 'Upravit',
          icon: 'edit',
          className: 'btn btn-primary',
          onClick: () => navigateTo(`#/m/030-pronajimatel/f/form?id=${id}`)
        },
        {
          label: 'Zpět',
          icon: 'arrow-left',
          className: 'btn btn-secondary',
          onClick: () => window.history.back()
        }
      ]
    });
    
  } catch (error) {
    console.error('Error loading subject:', error);
    root.innerHTML = `<div class="alert alert-danger">Chyba: ${error.message}</div>`;
  }
}
```

### 5.3 Form: Formulář (form.js)

**Umístění:** `/src/modules/030-pronajimatel/forms/form.js`

#### Účel
Vytvoření nového nebo úprava existujícího pronajímatele.

#### Režimy
- **Vytvoření**: params obsahuje `type` (bez `id`)
- **Úprava**: params obsahuje `id`

#### Pole podle typu

Pole se načítají dynamicky ze `TYPE_SCHEMAS` podle typu subjektu. Viz sekce 2.3.

#### Validace

- **display_name**: povinné, min 1 znak
- **primary_email**: povinné, validní email
- **ico**: pokud je vyplněno, validace formátu (8 čísel)
- **zip**: pokud je vyplněno, validace PSČ (regex `^[0-9]{3}\s?[0-9]{2}$`)
- **datum_narozeni**: nesmí být v budoucnosti

#### ARES integrace

Pokud má pole `ares: true` (např. IČO), zobrazit tlačítko "Načíst z ARES", které vyplní:
- `display_name`
- `dic`
- `street`, `cislo_popisne`, `city`, `zip`

#### Implementace

```javascript
// src/modules/030-pronajimatel/forms/form.js

import { getSubject, upsertSubject } from '../db.js';
import { setBreadcrumb } from '/src/ui/breadcrumb.js';
import { renderForm } from '/src/ui/form.js';
import { TYPE_SCHEMAS } from '/src/lib/type-schemas/subjects.js';
import { navigateTo } from '/src/app.js';
import { toast } from '/src/ui/toast.js';
import { getCurrentUser } from '/src/auth.js';

export async function render(root, params) {
  const { id, type } = params;
  
  const isNewRecord = !id;
  let subject = null;
  let subjectType = type;
  
  try {
    if (!isNewRecord) {
      // Načti existující záznam
      const { data, error } = await getSubject(id);
      if (error) throw error;
      if (!data) throw new Error('Subjekt nenalezen');
      
      subject = data;
      subjectType = subject.type;
    } else {
      // Nový záznam
      if (!type) {
        root.innerHTML = '<div class="alert alert-danger">Chybí typ subjektu</div>';
        return;
      }
      
      subject = {
        type: type,
        role: 'pronajimatel',
        country: 'Česká republika'
      };
    }
    
    // Breadcrumb
    setBreadcrumb(document.getElementById('crumb'), [
      { label: 'Domů', href: '#/' },
      { label: 'Pronajímatel', href: '#/m/030-pronajimatel' },
      { label: isNewRecord ? 'Nový subjekt' : subject.display_name, active: true }
    ]);
    
    // Získej schema
    const schema = TYPE_SCHEMAS[subjectType] || [];
    
    // Render formuláře
    renderForm(root, {
      fields: schema,
      data: subject,
      readOnly: false,
      title: isNewRecord ? `Nový subjekt: ${getTypeLabel(subjectType)}` : `Úprava: ${subject.display_name}`,
      onSubmit: async (formData) => {
        try {
          // Validace
          if (!formData.display_name || formData.display_name.trim() === '') {
            throw new Error('Název / jméno je povinné');
          }
          
          if (!formData.primary_email || !isValidEmail(formData.primary_email)) {
            throw new Error('Email je povinný a musí být validní');
          }
          
          // Připrav data pro uložení
          const payload = {
            ...formData,
            type: subjectType,
            role: 'pronajimatel'
          };
          
          if (id) {
            payload.id = id;
          }
          
          // Ulož
          const currentUser = await getCurrentUser();
          const { data: saved, error } = await upsertSubject(payload, currentUser);
          
          if (error) throw error;
          
          toast.success(isNewRecord ? 'Subjekt byl vytvořen' : 'Subjekt byl aktualizován');
          
          // Naviguj na detail
          navigateTo(`#/m/030-pronajimatel/f/detail?id=${saved.id}`);
          
        } catch (error) {
          console.error('Error saving subject:', error);
          toast.error(`Chyba při ukládání: ${error.message}`);
        }
      },
      actions: [
        {
          label: 'Uložit',
          icon: 'save',
          type: 'submit',
          className: 'btn btn-primary'
        },
        {
          label: 'Zrušit',
          icon: 'x',
          className: 'btn btn-secondary',
          onClick: () => window.history.back()
        }
      ]
    });
    
  } catch (error) {
    console.error('Error:', error);
    root.innerHTML = `<div class="alert alert-danger">Chyba: ${error.message}</div>`;
  }
}

function getTypeLabel(type) {
  const labels = {
    osoba: 'Osoba',
    osvc: 'OSVČ',
    firma: 'Firma',
    spolek: 'Spolek / Skupina',
    stat: 'Státní instituce',
    zastupce: 'Zástupce'
  };
  return labels[type] || type;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
```

---

## 6. Datová vrstva (db.js)

**Umístění:** `/src/modules/030-pronajimatel/db.js`

**Aktuální implementace je SPRÁVNÁ** - používá proxy na `/src/db/subjects.js` s defaultní rolí `pronajimatel`.

```javascript
import * as subjects from '/src/db/subjects.js';

// Modulová proxy pro 030 (nastaví default role pokud není dodána)
export const listSubjects = (opts = {}) => 
  subjects.listSubjects({ ...opts, role: opts.role || 'pronajimatel' });

export const getSubject = subjects.getSubject;

export const upsertSubject = (payload = {}, currentUser = null) => 
  subjects.upsertSubject({ ...payload, role: payload.role || 'pronajimatel' }, currentUser);

export const assignSubjectToProfile = subjects.assignSubjectToProfile;
export const unassignSubjectFromProfile = subjects.unassignSubjectFromProfile;
export const getSubjectHistory = subjects.getSubjectHistory;
export const archiveSubject = subjects.archiveSubject;
export const unarchiveSubject = subjects.unarchiveSubject;

export default { 
  listSubjects, 
  getSubject, 
  upsertSubject, 
  assignSubjectToProfile, 
  unassignSubjectFromProfile, 
  getSubjectHistory, 
  archiveSubject, 
  unarchiveSubject 
};
```

### Hlavní funkce v `/src/db/subjects.js`

#### listSubjects(options)
```javascript
/**
 * Načte seznam subjektů s filtrováním
 * @param {Object} options - Možnosti filtrace
 * @param {string} options.role - 'pronajimatel' | 'najemnik'
 * @param {string} options.type - 'osoba' | 'osvc' | 'firma' | ...
 * @param {boolean} options.showArchived - Zobrazit archivované?
 * @returns {Promise<{data, error}>}
 */
```

#### getSubject(id)
```javascript
/**
 * Načte jeden subjekt podle ID
 * @param {string} id - UUID subjektu
 * @returns {Promise<{data, error}>}
 */
```

#### upsertSubject(payload, currentUser)
```javascript
/**
 * Vytvoří nebo aktualizuje subjekt
 * @param {Object} payload - Data subjektu
 * @param {Object} currentUser - Aktuální uživatel
 * @returns {Promise<{data, error}>}
 */
```

#### archiveSubject(id)
```javascript
/**
 * Archivuje subjekt (soft delete)
 * @param {string} id - UUID subjektu
 * @returns {Promise<{data, error}>}
 */
```

#### unarchiveSubject(id)
```javascript
/**
 * Obnoví archivovaný subjekt
 * @param {string} id - UUID subjektu
 * @returns {Promise<{data, error}>}
 */
```

---

## 7. Oprávnění a bezpečnost

### 7.1 Oprávnění

Definováno v `/src/security/permissions.js`:

```javascript
subjects.read        // Čtení subjektů
subjects.create      // Vytváření nových subjektů
subjects.update      // Úprava subjektů
subjects.archive     // Archivace subjektů
subjects.delete      // Trvalé smazání (pouze superadmin)
```

### 7.2 Role a matice oprávnění

| Oprávnění | Superadmin | Správce | Manažer | Účetní | Čtenář |
|-----------|------------|---------|---------|--------|--------|
| subjects.read | ✅ | ✅ | ✅ | ✅ | ✅ |
| subjects.create | ✅ | ✅ | ✅ | ❌ | ❌ |
| subjects.update | ✅ | ✅ | ✅ | ❌ | ❌ |
| subjects.archive | ✅ | ✅ | ❌ | ❌ | ❌ |
| subjects.delete | ✅ | ❌ | ❌ | ❌ | ❌ |

### 7.3 RLS Policies

Viz sekce 2.1.

### 7.4 Input sanitizace

Všechny vstupy MUSÍ být sanitizovány:
- Escapování HTML znaků
- Trim whitespace
- Validace formátů (email, telefon, PSČ, IČO)

```javascript
function sanitizeInput(value) {
  if (typeof value !== 'string') return value;
  return value.trim().replace(/[<>]/g, '');
}
```

---

## 8. UI komponenty a integrace

### 8.1 CommonActions

Používá `/src/ui/commonActions.js` s akcemi:
- `add` - Přidat nový záznam
- `edit` - Upravit vybraný záznam
- `archive` - Archivovat/obnovit vybraný záznam
- `attach` - Správa příloh
- `refresh` - Obnovit data
- `history` - Historie změn

### 8.2 AttachmentSystem

Integrace s `/src/ui/attachments.js`:

```javascript
AttachmentSystem.showModal({
  entityType: 'subjects',
  entityId: selectedRow.id,
  entityName: selectedRow.display_name
});
```

### 8.3 HistoryModal

Integrace s `/src/ui/history.js`:

```javascript
HistoryModal.show({
  tableName: 'subjects',
  recordId: selectedRow.id,
  recordName: selectedRow.display_name
});
```

### 8.4 Breadcrumb

Vždy nastavit breadcrumb navigaci:

```javascript
setBreadcrumb(crumb, [
  { label: 'Domů', href: '#/' },
  { label: 'Pronajímatel', href: '#/m/030-pronajimatel' },
  { label: 'Aktuální stránka', active: true }
]);
```

---

## 9. Validace a business logika

### 9.1 Validační pravidla

#### Email
```javascript
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
```

#### IČO
```javascript
function isValidICO(ico) {
  if (!ico) return true; // není povinné
  return /^\d{8}$/.test(ico.replace(/\s/g, ''));
}
```

#### PSČ
```javascript
function isValidPSC(psc) {
  if (!psc) return true; // není povinné
  return /^[0-9]{3}\s?[0-9]{2}$/.test(psc);
}
```

#### Telefon
```javascript
function isValidPhone(phone) {
  if (!phone) return true; // není povinné
  return /^\+?[0-9\s()-]{9,}$/.test(phone);
}
```

### 9.2 Business logika

#### Automatické generování display_name

Pro typ "osoba" a "zastupce":
```
display_name = [titul_pred] jmeno prijmeni [titul_za]
```

Implementováno v database triggeru (viz sekce 2.1).

#### Kontrola duplicity IČO

Před uložením zkontrolovat, zda stejné IČO již neexistuje:

```javascript
async function checkDuplicateICO(ico, excludeId = null) {
  if (!ico) return false;
  
  const { data } = await supabase
    .from('subjects')
    .select('id')
    .eq('ico', ico)
    .neq('archived', true);
  
  if (excludeId) {
    return data.some(s => s.id !== excludeId);
  }
  
  return data.length > 0;
}
```

---

## 10. Testování

### 10.1 Jednotkové testy

```javascript
// test/modules/030-pronajimatel/validation.test.js

import { isValidEmail, isValidICO, isValidPSC } from '../../../src/modules/030-pronajimatel/utils.js';

describe('Validation functions', () => {
  test('isValidEmail', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('invalid')).toBe(false);
  });
  
  test('isValidICO', () => {
    expect(isValidICO('12345678')).toBe(true);
    expect(isValidICO('123')).toBe(false);
  });
  
  test('isValidPSC', () => {
    expect(isValidPSC('110 00')).toBe(true);
    expect(isValidPSC('11000')).toBe(true);
    expect(isValidPSC('123')).toBe(false);
  });
});
```

### 10.2 Integrační testy

```javascript
// test/modules/030-pronajimatel/db.test.js

import { listSubjects, upsertSubject, archiveSubject } from '../../../src/modules/030-pronajimatel/db.js';

describe('Database operations', () => {
  test('listSubjects returns pronajimatel only', async () => {
    const { data } = await listSubjects();
    expect(data.every(s => s.role === 'pronajimatel')).toBe(true);
  });
  
  test('upsertSubject creates new record', async () => {
    const payload = {
      type: 'osoba',
      display_name: 'Jan Novák',
      primary_email: 'jan@example.com'
    };
    
    const { data, error } = await upsertSubject(payload);
    expect(error).toBeNull();
    expect(data.id).toBeDefined();
  });
  
  test('archiveSubject sets archived flag', async () => {
    // ... test archivace
  });
});
```

### 10.3 E2E testy

```javascript
// test/e2e/030-pronajimatel.test.js

describe('Module 030 E2E', () => {
  test('Create new osoba pronajimatel', async () => {
    // 1. Otevři modul
    // 2. Klikni na "Přidat"
    // 3. Vyber "Osoba"
    // 4. Vyplň formulář
    // 5. Uložit
    // 6. Ověř, že se zobrazuje v seznamu
  });
  
  test('Edit existing pronajimatel', async () => {
    // ... test úpravy
  });
  
  test('Archive and restore pronajimatel', async () => {
    // ... test archivace
  });
});
```

---

## 11. Checklist implementace

### Fáze 1: Příprava
- [ ] Ověřit existenci tabulky `subjects` v Supabase
- [ ] Ověřit existenci tabulky `subject_types` v Supabase
- [ ] Ověřit RLS policies
- [ ] Ověřit triggery (updated_at, display_name)

### Fáze 2: Datová vrstva
- [ ] Implementovat `/src/db/subjects.js` (pokud neexistuje)
- [ ] Implementovat `/src/modules/030-pronajimatel/db.js` (proxy)
- [ ] Otestovat CRUD operace

### Fáze 3: Manifest
- [ ] Implementovat `module.config.js` s dynamickým načítáním typů
- [ ] Ověřit, že se modul zobrazuje v sidebaru
- [ ] Ověřit, že se počty aktualizují

### Fáze 4: Tiles
- [ ] Implementovat `tiles/prehled.js`
- [ ] Implementovat `tiles/osoba.js`
- [ ] Implementovat `tiles/osvc.js`
- [ ] Implementovat `tiles/firma.js`
- [ ] Implementovat `tiles/spolek.js`
- [ ] Implementovat `tiles/stat.js`
- [ ] Implementovat `tiles/zastupce.js`
- [ ] Otestovat všechny tiles

### Fáze 5: Forms
- [ ] Implementovat `forms/chooser.js`
- [ ] Implementovat `forms/detail.js`
- [ ] Implementovat `forms/form.js`
- [ ] Otestovat vytvoření nového subjektu
- [ ] Otestovat úpravu existujícího subjektu
- [ ] Otestovat validaci

### Fáze 6: Integrace
- [ ] Integrace s AttachmentSystem
- [ ] Integrace s HistoryModal
- [ ] Integrace s CommonActions
- [ ] Integrace s Breadcrumb

### Fáze 7: Testování
- [ ] Jednotkové testy
- [ ] Integrační testy
- [ ] E2E testy
- [ ] Manuální testování s různými rolemi

### Fáze 8: Dokumentace
- [ ] Aktualizovat `README.md`
- [ ] Aktualizovat `datovy-model.md`
- [ ] Aktualizovat `permissions.md`
- [ ] Aktualizovat `checklist.md`

### Fáze 9: Code review
- [ ] Spustit linter
- [ ] Spustit CodeQL security scan
- [ ] Peer review
- [ ] Opravit nalezené problémy

### Fáze 10: Deployment
- [ ] Merge do main branch
- [ ] Deploy do produkce
- [ ] Monitoring

---

## 12. Dodatečné poznámky pro agenta

### 12.1 Co UŽ existuje

- Tabulka `subjects` v Supabase ✅
- Tabulka `subject_types` v Supabase ✅
- `/src/db/subjects.js` s CRUD funkcemi ✅
- `/src/lib/type-schemas/subjects.js` se schématy polí ✅
- `module.config.js` s dynamickým načítáním ✅
- `db.js` proxy ✅

### 12.2 Co MUSÍŠ implementovat

- Všechny tiles (prehled.js, osoba.js, osvc.js, firma.js, spolek.js, stat.js, zastupce.js)
- Všechny forms (chooser.js, detail.js, form.js)
- Validační funkce
- Integraci s UI komponenty

### 12.3 Důležité konvence

1. **Importy**:
   - Relativní pro lokální soubory: `import { listSubjects } from '../db.js'`
   - Absolutní pro shared komponenty: `import { renderTable } from '/src/ui/table.js'`

2. **Navigace**:
   - Vždy použij `navigateTo()` z `/src/app.js`
   - Nikdy nepoužívej `window.location.href = ...`

3. **Chybové zprávy**:
   - Vždy zobraz toast notifikaci: `toast.error('Chyba')`
   - Vždy loguj do console: `console.error('Error:', error)`

4. **Archivace**:
   - NIKDY nepoužívej DELETE, vždy použij UPDATE s `archived = true`
   - Při obnovení nastav `archived = false, archived_at = null`

5. **Oprávnění**:
   - Vždy zkontroluj oprávnění před zobrazením akcí
   - Disable tlačítka, která uživatel nemůže použít

### 12.4 Typické chyby k vyhnutí

❌ **ŠPATNĚ:**
```javascript
// Blokující confirm dialog
if (confirm('Smazat?')) { ... }
```

✅ **SPRÁVNĚ:**
```javascript
// Modal s callbackem
showConfirmModal({
  title: 'Potvrďte akci',
  message: 'Opravdu chcete archivovat?',
  onConfirm: async () => { ... }
});
```

❌ **ŠPATNĚ:**
```javascript
// Přepisování celého objektu
await supabase.from('subjects').update(formData).eq('id', id);
```

✅ **SPRÁVNĚ:**
```javascript
// Merge s existujícími daty
const existing = await getSubject(id);
const merged = { ...existing, ...formData, updated_at: new Date() };
await supabase.from('subjects').update(merged).eq('id', id);
```

---

## 13. Závěr

Tato specifikace poskytuje KOMPLETNÍ návod k implementaci modulu 030-pronajimatel. Zahrnuje:

✅ Datový model s přesnými strukturami tabulek  
✅ Manifest s dynamickým načítáním typů  
✅ Všechny tiles s přesnými sloupci a akcemi  
✅ Všechny forms s validací  
✅ Datovou vrstvu s CRUD operacemi  
✅ Oprávnění a bezpečnost (RLS policies)  
✅ UI integraci (CommonActions, Attachments, History)  
✅ Validaci a business logiku  
✅ Testování  
✅ Checklist implementace  

**Při implementaci postupuj podle checklistu a dodržuj VŠECHNY konvence aplikace v5.**

**Pokud najdeš něco, co není jasné nebo chybí, ZASTAVIT SE a zeptat se uživatele.**

---

**Vytvořeno:** 2025-11-10  
**Pro:** Modul 030-pronajimatel v aplikaci v5  
**Autor:** Specifikace pro agenta
