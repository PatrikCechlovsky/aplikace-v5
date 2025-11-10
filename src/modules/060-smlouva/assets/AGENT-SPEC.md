# SPECIFIKACE MODULU 060 - PRONAJÍMATEL (LANDLORD)
# Kompletní průvodce pro agenta

**Verze:** 1.0  
**Datum:** 2025-11-10  
**Modul ID:** 060-smlouva (NOTE: Název adresáře je 060-smlouva, ale specifikace je pro modul Pronajímatel)  
**Účel:** Tento dokument poskytuje kompletní a podrobnou specifikaci pro vytvoření modulu 060-Pronajímatel v aplikaci v5

---

## 📋 OBSAH

1. [Úvod a kontext](#1-úvod-a-kontext)
2. [Architektura modulu](#2-architektura-modulu)
3. [Databázové schéma](#3-databázové-schéma)
4. [Module Config (module.config.js)](#4-module-config)
5. [Databázové operace (db.js)](#5-databázové-operace)
6. [Tiles (Přehledy)](#6-tiles-přehledy)
7. [Forms (Formuláře)](#7-forms-formuláře)
8. [Bezpečnost a oprávnění](#8-bezpečnost-a-oprávnění)
9. [UI komponenty a integrace](#9-ui-komponenty-a-integrace)
10. [Testování](#10-testování)
11. [Checklist před dokončením](#11-checklist-před-dokončením)
12. [Přílohy a reference](#12-přílohy-a-reference)

---

## 1. ÚVOD A KONTEXT

### 1.1 Účel modulu
Modul **060-Pronajímatel** slouží ke správě subjektů v roli pronajímatele (landlord). Zahrnuje různé typy subjektů:
- **Osoba** (fyzická osoba)
- **OSVČ** (osoba samostatně výdělečně činná)
- **Firma** (s.r.o., a.s., atd.)
- **Spolek/Skupina** (neziskové organizace)
- **Státní instituce** (municipality, úřady)
- **Zástupci** (osoby zastupující jiné subjekty)

### 1.2 Základní principy (podle dokumentu pravidla)
- ✅ Modul musí být **samostatný, izolovaný a lazy-loadovatelný**
- ✅ **Vanilla ES6 modules** bez build procesu
- ✅ **Bezpečnost na prvním místě**: validace vstupů, RLS policies
- ✅ **Konzistentní struktura**: dodržení konvencí aplikace v5
- ✅ **Kebab-case** pro názvy souborů a adresářů
- ✅ **Breadcrumbs, CommonActions, Historie, Přílohy** u všech view

### 1.3 Reference moduly
- **Vzorový modul**: `010-sprava-uzivatelu` (nejlepší praktiky)
- **Podobný modul**: `030-pronajimatel` (struktura subjektů)
- **Šablona**: `000-sablona`

---

## 2. ARCHITEKTURA MODULU

### 2.1 Struktura adresářů

```
src/modules/060-smlouva/
├── module.config.js      # Manifest modulu - konfigurace, tiles, forms
├── db.js                 # Databázové operace (CRUD)
├── type-schemas.js       # Schémata pro různé typy subjektů (optional)
├── assets/               # Dokumentace a statické soubory
│   ├── README.md
│   ├── permissions.md
│   ├── datovy-model.md
│   ├── checklist.md
│   └── AGENT-SPEC.md    # Tento dokument
├── tiles/                # Přehledy (seznamy)
│   ├── prehled.js       # Hlavní přehled všech pronajímatelů
│   ├── osoba.js         # Filtrovaný přehled - pouze osoby
│   ├── osvc.js          # Filtrovaný přehled - pouze OSVČ
│   ├── firma.js         # Filtrovaný přehled - pouze firmy
│   ├── spolek.js        # Filtrovaný přehled - pouze spolky
│   ├── stat.js          # Filtrovaný přehled - pouze státní instituce
│   └── zastupce.js      # Filtrovaný přehled - pouze zástupci
└── forms/                # Formuláře
    ├── chooser.js        # Výběr typu subjektu (pro vytváření nového)
    ├── detail.js         # Detail pronajímatele (read-only)
    └── form.js           # Editační/vytváření formulář (dynamický podle typu)
```

### 2.2 Registrace modulu

Modul MUSÍ být zaregistrován v `/src/app/modules.index.js`:

```javascript
export const MODULE_SOURCES = [
  () => import('../modules/010-sprava-uzivatelu/module.config.js'),
  () => import('../modules/020-muj-ucet/module.config.js'),
  () => import('../modules/030-pronajimatel/module.config.js'),
  () => import('../modules/040-nemovitost/module.config.js'),
  () => import('../modules/050-najemnik/module.config.js'),
  () => import('../modules/060-smlouva/module.config.js'),  // <-- TENTO MODUL
  // ...
];
```

---

## 3. DATABÁZOVÉ SCHÉMA

### 3.1 Tabulka: `subjects`

Modul 060 využívá **sdílenou** tabulku `subjects` (stejně jako moduly 030 a 050).

**Filtrování podle role:**
- Modul 030 (Pronajímatel): `role = 'pronajimatel'`
- Modul 050 (Nájemník): `role = 'najemnik'`
- Modul 060: **TAKÉ** `role = 'pronajimatel'`

> **DŮLEŽITÉ**: Modul 060 je pravděpodobně duplikát modulu 030, nebo má jiný účel. 
> Pro účely této specifikace předpokládáme, že se jedná o **rozšířenou verzi** modulu pronajímatel 
> s dodatečnými funkcemi (např. více typů přehledů, pokročilejší správa).

#### Struktura tabulky `subjects`

```sql
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Typ a role
  typ_subjektu VARCHAR(50) NOT NULL,  -- osoba, osvc, firma, spolek, stat, zastupce
  role VARCHAR(50) NOT NULL,           -- pronajimatel, najemnik, zastupce
  
  -- Zobrazení
  display_name VARCHAR(255) NOT NULL,  -- Automaticky generované nebo manuální
  
  -- Osobní údaje (pro osoby)
  jmeno VARCHAR(100),
  prijmeni VARCHAR(100),
  rodne_cislo VARCHAR(20),
  datum_narozeni DATE,
  
  -- Firemní údaje (pro firmy/OSVČ)
  nazev_firmy VARCHAR(255),
  ico VARCHAR(20),
  dic VARCHAR(20),
  
  -- Kontaktní údaje
  primary_email VARCHAR(255),
  secondary_email VARCHAR(255),
  primary_phone VARCHAR(20),
  telefon_2 VARCHAR(20),
  
  -- Adresa
  ulice VARCHAR(255),
  cislo_popisne VARCHAR(20),
  mesto VARCHAR(100),
  psc VARCHAR(10),
  stat VARCHAR(100) DEFAULT 'ČR',
  city VARCHAR(100),  -- Alternativa k 'mesto' (kontrolovat duplicitu)
  
  -- Metadata
  poznamka TEXT,
  archived BOOLEAN DEFAULT FALSE,
  archived_at TIMESTAMPTZ,
  archived_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  updated_by UUID,
  
  -- Indexy
  CONSTRAINT subjects_pkey PRIMARY KEY (id)
);

CREATE INDEX idx_subjects_typ ON subjects(typ_subjektu);
CREATE INDEX idx_subjects_role ON subjects(role);
CREATE INDEX idx_subjects_display_name ON subjects(display_name);
CREATE INDEX idx_subjects_ico ON subjects(ico);
CREATE INDEX idx_subjects_email ON subjects(primary_email);
CREATE INDEX idx_subjects_archived ON subjects(archived);
```

### 3.2 RLS Policies

```sql
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

-- SELECT: Všichni přihlášení uživatelé mohou číst
CREATE POLICY subjects_select ON subjects
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- INSERT: Admini nebo uživatelé s oprávněním
CREATE POLICY subjects_insert ON subjects
  FOR INSERT WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
    OR EXISTS (
      SELECT 1 FROM user_permissions 
      WHERE user_id = auth.uid() 
      AND permission = 'subjects.create'
    )
  );

-- UPDATE: Admini nebo vlastní data
CREATE POLICY subjects_update ON subjects
  FOR UPDATE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
    OR id IN (
      SELECT subject_id FROM user_subjects WHERE profile_id = auth.uid()
    )
  );

-- DELETE: Pouze admini (soft delete via archive)
CREATE POLICY subjects_delete ON subjects
  FOR DELETE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );
```

### 3.3 Vazební tabulky

#### `user_subjects`
Propojuje uživatele (profiles) se subjekty.

```sql
CREATE TABLE user_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  UNIQUE(profile_id, subject_id)
);
```

#### `subject_history`
Historie změn subjektů (pro modul historie).

```sql
CREATE TABLE subject_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  changed_by UUID,
  action VARCHAR(50) NOT NULL,  -- create, update, archive, unarchive
  old_data JSONB,
  new_data JSONB,
  change_summary TEXT
);
```

---

## 4. MODULE CONFIG

### 4.1 Soubor: `module.config.js`

```javascript
// src/modules/060-smlouva/module.config.js

import { listSubjectTypes, getSubjectsCountsByType } from '/src/db/subjects.js';

export async function getManifest() {
  // Vytvoř základní strukturu tiles
  const tiles = [
    {
      id: 'prehled',
      title: 'Přehled pronajímatelů',
      icon: 'list',
      collapsible: true,
      children: []
    }
  ];

  // Dynamicky načti typy subjektů a jejich počty
  try {
    // Načti typy subjektů
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

    // Přidej children do přehledu (pouze ty s nenulový počtem)
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

  // Přidej samostatné tiles pro zástupce a nový subjekt
  tiles.push({
    id: 'zastupce',
    title: 'Zástupci',
    icon: 'handshake'
  });

  tiles.push({
    id: 'novy',
    title: 'Nový subjekt',
    icon: 'add'
  });

  return {
    id: '060-smlouva',
    title: 'Pronajímatel',
    icon: 'home',
    defaultTile: 'prehled',
    tiles,
    forms: [
      { id: 'chooser', title: 'Nový subjekt', icon: 'add', showInSidebar: false },
      { id: 'detail', title: 'Detail pronajímatele', icon: 'view', showInSidebar: false },
      { id: 'form', title: 'Formulář', icon: 'form', showInSidebar: false }
    ]
  };
}

export default { getManifest };
```

### 4.2 Vysvětlení konfigurace

- **id**: `'060-smlouva'` - MUSÍ odpovídat názvu adresáře
- **title**: `'Pronajímatel'` - Zobrazovaný název v UI
- **icon**: `'home'` - Material Icon nebo emoji
- **defaultTile**: `'prehled'` - První tile, která se otevře
- **tiles**: Pole přehledů (seznamů)
  - `prehled` - Hlavní přehled s vnořenými typy (collapsible)
  - Dynamicky generované child tiles podle typů subjektů
  - `zastupce` - Speciální přehled pro zástupce
  - `novy` - Tlačítko pro vytvoření nového subjektu
- **forms**: Pole formulářů
  - `chooser` - Výběr typu pro nový subjekt
  - `detail` - Read-only detail
  - `form` - Editační/vytváření formulář

---

## 5. DATABÁZOVÉ OPERACE

### 5.1 Soubor: `db.js`

```javascript
// src/modules/060-smlouva/db.js

import { supabase } from '/src/supabase.js';

/**
 * Načte seznam pronajímatelů s filtry
 * @param {Object} options - Filtrovací parametry
 * @param {string} options.typ_subjektu - Typ subjektu (osoba, firma, atd.)
 * @param {boolean} options.showArchived - Zobrazit archivované
 * @param {string} options.search - Fulltextové vyhledávání
 * @param {number} options.limit - Maximální počet záznamů
 * @returns {Promise<{data, error}>}
 */
export async function listLandlords(options = {}) {
  const {
    typ_subjektu = null,
    showArchived = false,
    search = '',
    limit = 500
  } = options;

  try {
    let query = supabase
      .from('subjects')
      .select('*')
      .eq('role', 'pronajimatel')  // Pouze pronajímatelé
      .order('created_at', { ascending: false })
      .limit(limit);

    // Filtr podle typu
    if (typ_subjektu) {
      query = query.eq('typ_subjektu', typ_subjektu);
    }

    // Filtr archivovaných
    if (!showArchived) {
      query = query.or('archived.is.null,archived.eq.false');
    }

    // Fulltextové vyhledávání
    if (search && search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      query = query.or(
        `display_name.ilike.${searchTerm},` +
        `primary_email.ilike.${searchTerm},` +
        `ico.ilike.${searchTerm},` +
        `primary_phone.ilike.${searchTerm}`
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error listing landlords:', error);
      return { data: null, error };
    }

    return { data: data || [], error: null };
  } catch (err) {
    console.error('Exception in listLandlords:', err);
    return { data: null, error: err };
  }
}

/**
 * Načte pronajímatele podle ID
 * @param {string} id - UUID subjektu
 * @returns {Promise<{data, error}>}
 */
export async function getLandlord(id) {
  try {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('id', id)
      .eq('role', 'pronajimatel')
      .single();

    if (error) {
      console.error('Error getting landlord:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    console.error('Exception in getLandlord:', err);
    return { data: null, error: err };
  }
}

/**
 * Vytvoří nebo upraví pronajímatele
 * @param {Object} landlord - Data pronajímatele
 * @returns {Promise<{data, error}>}
 */
export async function upsertLandlord(landlord) {
  try {
    const now = new Date().toISOString();
    const userId = (await supabase.auth.getUser()).data?.user?.id;

    const landlordData = {
      ...landlord,
      role: 'pronajimatel',  // Vždy nastavit roli
      updated_at: now,
      updated_by: userId
    };

    if (!landlord.id) {
      // Nový záznam
      landlordData.created_at = now;
      landlordData.created_by = userId;
    }

    // Auto-generování display_name pokud není zadáno
    if (!landlordData.display_name) {
      landlordData.display_name = generateDisplayName(landlordData);
    }

    const { data, error } = await supabase
      .from('subjects')
      .upsert(landlordData)
      .select()
      .single();

    if (error) {
      console.error('Error upserting landlord:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    console.error('Exception in upsertLandlord:', err);
    return { data: null, error: err };
  }
}

/**
 * Archivuje pronajímatele
 * @param {string} id - UUID subjektu
 * @returns {Promise<{data, error}>}
 */
export async function archiveLandlord(id) {
  try {
    const now = new Date().toISOString();
    const userId = (await supabase.auth.getUser()).data?.user?.id;

    const { data, error } = await supabase
      .from('subjects')
      .update({
        archived: true,
        archived_at: now,
        archived_by: userId
      })
      .eq('id', id)
      .eq('role', 'pronajimatel')
      .select()
      .single();

    if (error) {
      console.error('Error archiving landlord:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    console.error('Exception in archiveLandlord:', err);
    return { data: null, error: err };
  }
}

/**
 * Obnoví archivovaného pronajímatele
 * @param {string} id - UUID subjektu
 * @returns {Promise<{data, error}>}
 */
export async function unarchiveLandlord(id) {
  try {
    const { data, error } = await supabase
      .from('subjects')
      .update({
        archived: false,
        archived_at: null,
        archived_by: null
      })
      .eq('id', id)
      .eq('role', 'pronajimatel')
      .select()
      .single();

    if (error) {
      console.error('Error unarchiving landlord:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    console.error('Exception in unarchiveLandlord:', err);
    return { data: null, error: err };
  }
}

/**
 * Generuje display_name na základě typu subjektu
 * @param {Object} subject - Data subjektu
 * @returns {string}
 */
function generateDisplayName(subject) {
  switch (subject.typ_subjektu) {
    case 'osoba':
      return `${subject.jmeno || ''} ${subject.prijmeni || ''}`.trim() || 'Neznámá osoba';
    case 'osvc':
      return subject.nazev_firmy || `${subject.jmeno || ''} ${subject.prijmeni || ''}`.trim() || 'Neznámá OSVČ';
    case 'firma':
      return subject.nazev_firmy || 'Neznámá firma';
    case 'spolek':
      return subject.nazev_firmy || 'Neznámý spolek';
    case 'stat':
      return subject.nazev_firmy || 'Neznámá instituce';
    case 'zastupce':
      return `${subject.jmeno || ''} ${subject.prijmeni || ''}`.trim() || 'Neznámý zástupce';
    default:
      return 'Neznámý subjekt';
  }
}

export default {
  listLandlords,
  getLandlord,
  upsertLandlord,
  archiveLandlord,
  unarchiveLandlord
};
```

---

## 6. TILES (PŘEHLEDY)

Podle specifikace v problem statement, modul má tyto tiles (přehledy):


### 6.1 Přehled všech tiles

| Tile ID | Název | Ikona | Typ subjektu | Akce |
|---------|-------|-------|--------------|------|
| `prehled` | Přehled pronajímatelů | `list` | ALL | add, edit, archive, attach, refresh, history |
| `osoba` | Osoba | `person` | osoba | add, edit, archive, attach, refresh, history |
| `osvc` | OSVČ | `briefcase` | osvc | add, edit, archive, attach, refresh, history |
| `firma` | Firma | `building` | firma | add, edit, archive, attach, refresh, history |
| `spolek` | Spolek / Skupina | `people` | spolek | add, edit, archive, attach, refresh, history |
| `stat` | Státní instituce | `bank` | stat | add, edit, archive, attach, refresh, history |
| `zastupce` | Zástupci | `handshake` | zastupce | add, edit, archive, attach, refresh, history |
| `novy` | Nový subjekt | `add` | - | Navigace na chooser |

### 6.2 Tile: Přehled (prehled.js)

**Soubor:** `src/modules/060-smlouva/tiles/prehled.js`

**Účel:** Hlavní přehled všech pronajímatelů (všechny typy subjektů)

**Sloupce tabulky:**

| Klíč | Název | Šířka | Řazení |
|------|-------|-------|--------|
| `typ_subjektu` | Typ | 10% | Ano |
| `display_name` | Název / Jméno | 20% | Ne |
| `ico` | IČO | 10% | Ne |
| `primary_phone` | Telefon | 15% | Ne |
| `primary_email` | Email | 18% | Ne |
| `city` | Město | 15% | Ne |
| `archivedLabel` | Archivován | 10% | Ne |

**Kompletní kód:**

```javascript
// src/modules/060-smlouva/tiles/prehled.js

import { renderTable } from '/src/ui/table.js';
import { renderCommonActions } from '/src/ui/commonActions.js';
import { listLandlords } from '/src/modules/060-smlouva/db.js';
import { setBreadcrumb } from '/src/ui/breadcrumb.js';
import { navigateTo } from '/src/app.js';
import { toast } from '/src/ui/toast.js';

let selectedRow = null;
let showArchived = false;
let searchTerm = '';

export async function render(root) {
  const crumb = document.getElementById('crumb');
  const commonActions = document.getElementById('commonactions');

  // Breadcrumb
  try {
    setBreadcrumb(crumb, [
      { icon: 'home', label: 'Domů', href: '#/' },
      { icon: 'home', label: 'Pronajímatel', href: '#/m/060-smlouva' },
      { icon: 'list', label: 'Přehled' }
    ]);
  } catch (e) {
    console.error('Error setting breadcrumb:', e);
  }

  // Layout
  root.innerHTML = `
    <div class="space-y-4">
      <!-- Filtr header -->
      <div class="flex items-center gap-4 bg-white p-4 rounded-lg shadow">
        <input 
          type="text" 
          id="search-input" 
          placeholder="Hledat (název, email, IČO, telefon)..."
          class="flex-1 px-4 py-2 border rounded-lg"
          value="${searchTerm}"
        />
        <label class="flex items-center gap-2">
          <input 
            type="checkbox" 
            id="show-archived" 
            ${showArchived ? 'checked' : ''}
          />
          <span>Zobrazit archivované</span>
        </label>
      </div>
      
      <!-- Tabulka -->
      <div id="landlords-table"></div>
    </div>
  `;

  // Event listeners pro filtry
  const searchInput = root.querySelector('#search-input');
  const archivedCheckbox = root.querySelector('#show-archived');

  searchInput?.addEventListener('input', (e) => {
    searchTerm = e.target.value;
    render(root);
  });

  archivedCheckbox?.addEventListener('change', (e) => {
    showArchived = e.target.checked;
    render(root);
  });

  // Načti data
  const { data, error } = await listLandlords({ showArchived, search: searchTerm });

  if (error) {
    root.querySelector('#landlords-table').innerHTML = 
      `<div class="p-4 text-red-600">Chyba při načítání: ${error.message}</div>`;
    drawActions(commonActions);
    return;
  }

  const rows = (data || []).map(r => ({
    ...r,
    archivedLabel: r.archived ? '✓ Ano' : '',
    city: r.city || r.mesto || '—'
  }));

  // CommonActions
  drawActions(commonActions);

  // Vykreslení tabulky
  const columns = [
    { key: 'typ_subjektu', label: 'Typ', width: '10%', sortable: true },
    { key: 'display_name', label: 'Název / Jméno', width: '20%', sortable: false },
    { key: 'ico', label: 'IČO', width: '10%', sortable: false },
    { key: 'primary_phone', label: 'Telefon', width: '15%', sortable: false },
    { key: 'primary_email', label: 'Email', width: '18%', sortable: false },
    { key: 'city', label: 'Město', width: '15%', sortable: false },
    { key: 'archivedLabel', label: 'Archivován', width: '10%', sortable: false }
  ];

  renderTable(root.querySelector('#landlords-table'), {
    columns,
    rows,
    options: {
      moduleId: '060-smlouva',
      onRowSelect: (row) => {
        selectedRow = (selectedRow && selectedRow.id === row.id) ? null : row;
        drawActions(commonActions);
      },
      onRowDblClick: (row) => {
        navigateTo(`#/m/060-smlouva/f/detail?id=${row.id}`);
      }
    }
  });
}

function drawActions(commonActions) {
  if (!commonActions) return;

  const hasSel = !!selectedRow && !selectedRow.archived;
  const userRole = window.currentUserRole || 'admin';

  renderCommonActions(commonActions, {
    moduleActions: ['add', 'edit', 'archive', 'attach', 'refresh', 'history'],
    userRole,
    handlers: {
      onAdd: () => navigateTo('#/m/060-smlouva/f/chooser'),
      onEdit: hasSel ? () => navigateTo(`#/m/060-smlouva/f/form?id=${selectedRow.id}`) : undefined,
      onArchive: hasSel ? async () => {
        if (!confirm(`Opravdu chcete archivovat "${selectedRow.display_name}"?`)) return;
        const { archiveLandlord } = await import('/src/modules/060-smlouva/db.js');
        const { error } = await archiveLandlord(selectedRow.id);
        if (error) {
          toast('Chyba při archivaci', 'error');
        } else {
          toast('Pronajímatel archivován', 'success');
          selectedRow = null;
          render(document.getElementById('content'));
        }
      } : undefined,
      onAttach: hasSel ? () => {
        toast('Funkce přílohy bude implementována', 'info');
      } : undefined,
      onRefresh: () => {
        selectedRow = null;
        render(document.getElementById('content'));
      },
      onHistory: hasSel ? () => {
        navigateTo(`#/m/060-smlouva/f/history?id=${selectedRow.id}`);
      } : undefined
    }
  });
}

export default { render };
```

### 6.3 Tile: Osoba (osoba.js)

**Soubor:** `src/modules/060-smlouva/tiles/osoba.js`

**Účel:** Filtrovaný přehled pouze fyzických osob

**Sloupce:**

| Klíč | Název | Šířka | Řazení |
|------|-------|-------|--------|
| `id` | ID | - | Ne |
| `display_name` | Jméno | - | Ne |
| `primary_email` | E-mail | - | Ne |
| `primary_phone` | Telefon | - | Ne |
| `city` | Město | - | Ne |

**Kód:** (Podobný jako prehled.js, s filtrem `typ_subjektu: 'osoba'`)

```javascript
// src/modules/060-smlouva/tiles/osoba.js

import { renderTable } from '/src/ui/table.js';
import { renderCommonActions } from '/src/ui/commonActions.js';
import { listLandlords } from '/src/modules/060-smlouva/db.js';
import { setBreadcrumb } from '/src/ui/breadcrumb.js';
import { navigateTo } from '/src/app.js';
import { toast } from '/src/ui/toast.js';

let selectedRow = null;
let showArchived = false;

export async function render(root) {
  const crumb = document.getElementById('crumb');
  const commonActions = document.getElementById('commonactions');

  setBreadcrumb(crumb, [
    { icon: 'home', label: 'Domů', href: '#/' },
    { icon: 'home', label: 'Pronajímatel', href: '#/m/060-smlouva' },
    { icon: 'person', label: 'Osoby' }
  ]);

  root.innerHTML = `
    <div class="space-y-4">
      <div class="flex items-center gap-4 bg-white p-4 rounded-lg shadow">
        <label class="flex items-center gap-2">
          <input type="checkbox" id="show-archived" ${showArchived ? 'checked' : ''} />
          <span>Zobrazit archivované</span>
        </label>
      </div>
      <div id="table-container"></div>
    </div>
  `;

  root.querySelector('#show-archived')?.addEventListener('change', (e) => {
    showArchived = e.target.checked;
    render(root);
  });

  const { data, error } = await listLandlords({ 
    typ_subjektu: 'osoba', 
    showArchived 
  });

  if (error) {
    root.querySelector('#table-container').innerHTML = 
      `<div class="p-4 text-red-600">Chyba: ${error.message}</div>`;
    return;
  }

  drawActions(commonActions);

  const columns = [
    { key: 'id', label: 'ID', width: '15%' },
    { key: 'display_name', label: 'Jméno', width: '25%' },
    { key: 'primary_email', label: 'E-mail', width: '25%' },
    { key: 'primary_phone', label: 'Telefon', width: '20%' },
    { key: 'city', label: 'Město', width: '15%' }
  ];

  renderTable(root.querySelector('#table-container'), {
    columns,
    rows: (data || []).map(r => ({ ...r, city: r.city || r.mesto || '—' })),
    options: {
      moduleId: '060-smlouva',
      onRowSelect: (row) => {
        selectedRow = (selectedRow && selectedRow.id === row.id) ? null : row;
        drawActions(commonActions);
      },
      onRowDblClick: (row) => navigateTo(`#/m/060-smlouva/f/detail?id=${row.id}`)
    }
  });
}

function drawActions(ca) {
  if (!ca) return;
  const hasSel = !!selectedRow && !selectedRow.archived;
  renderCommonActions(ca, {
    moduleActions: ['add', 'edit', 'archive', 'attach', 'refresh', 'history'],
    userRole: window.currentUserRole || 'admin',
    handlers: {
      onAdd: () => navigateTo('#/m/060-smlouva/f/chooser?type=osoba'),
      onEdit: hasSel ? () => navigateTo(`#/m/060-smlouva/f/form?id=${selectedRow.id}`) : undefined,
      onArchive: hasSel ? async () => {
        if (!confirm('Archivovat?')) return;
        const { archiveLandlord } = await import('/src/modules/060-smlouva/db.js');
        await archiveLandlord(selectedRow.id);
        toast('Archivováno', 'success');
        selectedRow = null;
        render(document.getElementById('content'));
      } : undefined,
      onRefresh: () => render(document.getElementById('content'))
    }
  });
}

export default { render };
```

### 6.4 Ostatní tiles

Pro ostatní typy subjektů (`osvc.js`, `firma.js`, `spolek.js`, `stat.js`, `zastupce.js`) použijte **stejnou strukturu** jako `osoba.js`, pouze změňte:

1. Filtr `typ_subjektu` na příslušný typ
2. Breadcrumb a ikonu
3. Sloupce podle specifikace v problem statement

**Příklad pro OSVČ:**

```javascript
// Filtr
const { data, error } = await listLandlords({ 
  typ_subjektu: 'osvc', 
  showArchived 
});

// Breadcrumb
setBreadcrumb(crumb, [
  { icon: 'home', label: 'Domů', href: '#/' },
  { icon: 'home', label: 'Pronajímatel', href: '#/m/060-smlouva' },
  { icon: 'briefcase', label: 'OSVČ' }
]);

// Sloupce
const columns = [
  { key: 'display_name', label: 'Jméno / Firma', width: '30%' },
  { key: 'ico', label: 'IČO', width: '15%' },
  { key: 'primary_email', label: 'E-mail', width: '25%' },
  { key: 'primary_phone', label: 'Telefon', width: '20%' }
];
```

---

## 7. FORMS (FORMULÁŘE)

### 7.1 Přehled formulářů

| Form ID | Název | Ikona | Účel | Akce |
|---------|-------|-------|------|------|
| `chooser` | Nový subjekt | `add` | Výběr typu pro vytvoření | - |
| `detail` | Detail pronajímatele | `view` | Read-only zobrazení | edit, attach, archive, history |
| `form` | Formulář | `form` | Vytvoření/editace | archive, attach, history, save |

### 7.2 Form: Chooser (chooser.js)

**Soubor:** `src/modules/060-smlouva/forms/chooser.js`

**Účel:** Výběr typu subjektu před vytvořením nového

```javascript
// src/modules/060-smlouva/forms/chooser.js

import { setBreadcrumb } from '/src/ui/breadcrumb.js';
import { navigateTo } from '/src/app.js';

export async function render(root) {
  const crumb = document.getElementById('crumb');

  setBreadcrumb(crumb, [
    { icon: 'home', label: 'Domů', href: '#/' },
    { icon: 'home', label: 'Pronajímatel', href: '#/m/060-smlouva/t/prehled' },
    { icon: 'add', label: 'Nový subjekt' }
  ]);

  const subjectTypes = [
    { type: 'osoba', label: 'Fyzická osoba', icon: 'person', desc: 'Soukromá osoba' },
    { type: 'osvc', label: 'OSVČ', icon: 'briefcase', desc: 'Osoba samostatně výdělečně činná' },
    { type: 'firma', label: 'Firma', icon: 'building', desc: 's.r.o., a.s., družstvo, atd.' },
    { type: 'spolek', label: 'Spolek / Skupina', icon: 'people', desc: 'Nezisková organizace' },
    { type: 'stat', label: 'Státní instituce', icon: 'bank', desc: 'Municipality, úřady' },
    { type: 'zastupce', label: 'Zástupce', icon: 'handshake', desc: 'Osoba zastupující jiný subjekt' }
  ];

  root.innerHTML = `
    <div class="max-w-4xl mx-auto p-6">
      <h2 class="text-2xl font-bold mb-6">Vyberte typ subjektu</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${subjectTypes.map(st => `
          <button 
            class="chooser-card p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow text-left border-2 border-transparent hover:border-blue-500"
            data-type="${st.type}"
          >
            <div class="flex items-center gap-4 mb-2">
              <span class="material-icons text-4xl text-blue-600">${st.icon}</span>
              <h3 class="text-lg font-semibold">${st.label}</h3>
            </div>
            <p class="text-gray-600 text-sm">${st.desc}</p>
          </button>
        `).join('')}
      </div>
    </div>
  `;

  // Event listeners
  root.querySelectorAll('.chooser-card').forEach(card => {
    card.addEventListener('click', () => {
      const type = card.dataset.type;
      navigateTo(`#/m/060-smlouva/f/form?type=${type}`);
    });
  });
}

export default { render };
```

### 7.3 Form: Detail (detail.js)

**Soubor:** `src/modules/060-smlouva/forms/detail.js`

**Účel:** Read-only zobrazení detailu pronajímatele

**Akce:** edit, attach, archive, history

```javascript
// src/modules/060-smlouva/forms/detail.js

import { getLandlord } from '/src/modules/060-smlouva/db.js';
import { renderCommonActions } from '/src/ui/commonActions.js';
import { setBreadcrumb } from '/src/ui/breadcrumb.js';
import { navigateTo } from '/src/app.js';
import { formatDate } from '/src/ui/utils.js';

export async function render(root, manifest, { query, userRole }) {
  const id = query?.id;
  if (!id) {
    root.innerHTML = '<div class="p-4 text-red-600">Chybí ID pronajímatele</div>';
    return;
  }

  const { data, error } = await getLandlord(id);

  if (error || !data) {
    root.innerHTML = '<div class="p-4 text-red-600">Pronajímatel nenalezen</div>';
    return;
  }

  // Breadcrumb
  setBreadcrumb(document.getElementById('crumb'), [
    { icon: 'home', label: 'Domů', href: '#/' },
    { icon: 'home', label: 'Pronajímatel', href: '#/m/060-smlouva/t/prehled' },
    { label: `Detail: ${data.display_name}` }
  ]);

  // CommonActions
  renderCommonActions(document.getElementById('commonactions'), {
    moduleActions: ['edit', 'attach', 'archive', 'history'],
    userRole: userRole || 'admin',
    handlers: {
      onEdit: () => navigateTo(`#/m/060-smlouva/f/form?id=${id}`),
      onArchive: async () => {
        if (!confirm('Archivovat?')) return;
        const { archiveLandlord } = await import('/src/modules/060-smlouva/db.js');
        await archiveLandlord(id);
        navigateTo('#/m/060-smlouva/t/prehled');
      },
      onAttach: () => alert('Přílohy - TODO'),
      onHistory: () => navigateTo(`#/m/060-smlouva/f/history?id=${id}`)
    }
  });

  // Vykreslení detailu
  root.innerHTML = `
    <div class="max-w-6xl mx-auto space-y-6">
      <!-- Základní údaje -->
      <section class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-lg font-semibold mb-4">📋 Základní údaje</h3>
        <div class="grid grid-cols-2 gap-4">
          <div><label class="block text-sm font-medium mb-1">Typ subjektu</label><div class="text-base">${data.typ_subjektu || '—'}</div></div>
          <div><label class="block text-sm font-medium mb-1">Zobrazované jméno</label><div class="text-base">${data.display_name || '—'}</div></div>
          
          ${data.typ_subjektu === 'osoba' || data.typ_subjektu === 'zastupce' ? `
            <div><label class="block text-sm font-medium mb-1">Jméno</label><div class="text-base">${data.jmeno || '—'}</div></div>
            <div><label class="block text-sm font-medium mb-1">Příjmení</label><div class="text-base">${data.prijmeni || '—'}</div></div>
            <div><label class="block text-sm font-medium mb-1">Datum narození</label><div class="text-base">${formatDate(data.datum_narozeni) || '—'}</div></div>
            <div><label class="block text-sm font-medium mb-1">Rodné číslo</label><div class="text-base">${data.rodne_cislo || '—'}</div></div>
          ` : ''}
          
          ${data.typ_subjektu !== 'osoba' ? `
            <div><label class="block text-sm font-medium mb-1">Název firmy/organizace</label><div class="text-base">${data.nazev_firmy || '—'}</div></div>
          ` : ''}
          
          ${data.typ_subjektu === 'osvc' || data.typ_subjektu === 'firma' ? `
            <div><label class="block text-sm font-medium mb-1">IČO</label><div class="text-base">${data.ico || '—'}</div></div>
            <div><label class="block text-sm font-medium mb-1">DIČ</label><div class="text-base">${data.dic || '—'}</div></div>
          ` : ''}
        </div>
      </section>

      <!-- Kontaktní údaje -->
      <section class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-lg font-semibold mb-4">📞 Kontaktní údaje</h3>
        <div class="grid grid-cols-2 gap-4">
          <div><label class="block text-sm font-medium mb-1">Email</label><div class="text-base">${data.primary_email || '—'}</div></div>
          <div><label class="block text-sm font-medium mb-1">Email (sekundární)</label><div class="text-base">${data.secondary_email || '—'}</div></div>
          <div><label class="block text-sm font-medium mb-1">Telefon</label><div class="text-base">${data.primary_phone || data.telefon || '—'}</div></div>
          <div><label class="block text-sm font-medium mb-1">Telefon 2</label><div class="text-base">${data.telefon_2 || '—'}</div></div>
        </div>
      </section>

      <!-- Adresa -->
      <section class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-lg font-semibold mb-4">🏠 Adresa</h3>
        <div class="grid grid-cols-2 gap-4">
          <div><label class="block text-sm font-medium mb-1">Ulice</label><div class="text-base">${data.ulice || '—'}</div></div>
          <div><label class="block text-sm font-medium mb-1">Číslo popisné</label><div class="text-base">${data.cislo_popisne || '—'}</div></div>
          <div><label class="block text-sm font-medium mb-1">Město</label><div class="text-base">${data.city || data.mesto || '—'}</div></div>
          <div><label class="block text-sm font-medium mb-1">PSČ</label><div class="text-base">${data.psc || '—'}</div></div>
          <div><label class="block text-sm font-medium mb-1">Stát</label><div class="text-base">${data.stat || '—'}</div></div>
        </div>
      </section>

      <!-- Poznámka -->
      ${data.poznamka ? `
        <section class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-lg font-semibold mb-4">📝 Poznámka</h3>
          <div class="text-base whitespace-pre-wrap">${data.poznamka}</div>
        </section>
      ` : ''}

      <!-- Systémové údaje -->
      <section class="bg-slate-50 p-6 rounded-lg">
        <h3 class="text-lg font-semibold mb-4">⚙️ Systém</h3>
        <div class="grid grid-cols-3 gap-4 text-sm">
          <div><label class="block font-medium mb-1">Vytvořeno</label><div>${formatDate(data.created_at)}</div></div>
          <div><label class="block font-medium mb-1">Upraveno</label><div>${formatDate(data.updated_at)}</div></div>
          <div><label class="block font-medium mb-1">Archivován</label><div>${data.archived ? 'Ano' : 'Ne'}</div></div>
        </div>
      </section>
    </div>
  `;
}

export default { render };
```

### 7.4 Form: Editace/Vytvoření (form.js)

**Soubor:** `src/modules/060-smlouva/forms/form.js`

**Účel:** Univerzální formulář pro vytvoření nebo editaci pronajímatele

**Akce:** save, archive, attach, history

```javascript
// src/modules/060-smlouva/forms/form.js

import { getLandlord, upsertLandlord } from '/src/modules/060-smlouva/db.js';
import { renderForm } from '/src/ui/form.js';
import { renderCommonActions } from '/src/ui/commonActions.js';
import { setBreadcrumb } from '/src/ui/breadcrumb.js';
import { navigateTo } from '/src/app.js';
import { toast } from '/src/ui/toast.js';
import { setUnsavedChanges } from '/src/ui/unsavedHelper.js';

const AUDIT_FIELDS = ['id', 'created_at', 'updated_at', 'created_by', 'updated_by', 'archived_at', 'archived_by'];

export async function render(root, manifest, { query, userRole }) {
  const id = query?.id;
  const type = query?.type || 'osoba';
  const isNew = !id;

  let data = {};

  if (!isNew) {
    const result = await getLandlord(id);
    if (result.error || !result.data) {
      root.innerHTML = '<div class="p-4 text-red-600">Pronajímatel nenalezen</div>';
      return;
    }
    data = result.data;
  } else {
    data = { typ_subjektu: type, role: 'pronajimatel' };
  }

  // Breadcrumb
  setBreadcrumb(document.getElementById('crumb'), [
    { icon: 'home', label: 'Domů', href: '#/' },
    { icon: 'home', label: 'Pronajímatel', href: '#/m/060-smlouva/t/prehled' },
    { label: isNew ? 'Nový pronajímatel' : `Editace: ${data.display_name}` }
  ]);

  // CommonActions
  renderCommonActions(document.getElementById('commonactions'), {
    moduleActions: isNew ? ['save'] : ['save', 'archive', 'attach', 'history'],
    userRole: userRole || 'admin',
    handlers: {
      onSave: () => document.getElementById('landlord-form-submit')?.click(),
      onArchive: !isNew ? async () => {
        if (!confirm('Archivovat?')) return;
        const { archiveLandlord } = await import('/src/modules/060-smlouva/db.js');
        await archiveLandlord(id);
        navigateTo('#/m/060-smlouva/t/prehled');
      } : undefined
    }
  });

  // Definice polí podle typu subjektu
  const fields = getFieldsForType(data.typ_subjektu, isNew);

  // Container pro formulář
  root.innerHTML = '<div id="form-container"></div>';

  // Render formuláře
  await renderForm(root.querySelector('#form-container'), {
    fields,
    data,
    onSubmit: async (formData) => {
      // Odstraň audit fields
      const cleanData = { ...formData };
      AUDIT_FIELDS.forEach(f => delete cleanData[f]);

      const { data: saved, error } = await upsertLandlord(cleanData);

      if (error) {
        toast('Chyba při ukládání: ' + error.message, 'error');
        return;
      }

      toast('Pronajímatel uložen', 'success');
      setUnsavedChanges(false);
      navigateTo(`#/m/060-smlouva/f/detail?id=${saved.id}`);
    },
    options: {
      submitButtonText: isNew ? 'Vytvořit' : 'Uložit změny',
      submitButtonId: 'landlord-form-submit'
    }
  });

  // Aktivuj unsaved helper
  setUnsavedChanges(true);
}

/**
 * Vrací pole formuláře podle typu subjektu
 */
function getFieldsForType(typ, isNew) {
  const baseFields = [
    {
      section: 'Základní údaje',
      fields: [
        { name: 'typ_subjektu', label: 'Typ subjektu', type: 'select', required: true, disabled: !isNew, 
          options: [
            { value: 'osoba', label: 'Fyzická osoba' },
            { value: 'osvc', label: 'OSVČ' },
            { value: 'firma', label: 'Firma' },
            { value: 'spolek', label: 'Spolek/Skupina' },
            { value: 'stat', label: 'Státní instituce' },
            { value: 'zastupce', label: 'Zástupce' }
          ]
        },
        { name: 'display_name', label: 'Zobrazované jméno', type: 'text', required: false, 
          helpText: 'Ponechte prázdné pro automatické generování' }
      ]
    }
  ];

  // Přidej specifická pole podle typu
  if (typ === 'osoba' || typ === 'zastupce') {
    baseFields.push({
      section: 'Osobní údaje',
      fields: [
        { name: 'jmeno', label: 'Jméno', type: 'text', required: true },
        { name: 'prijmeni', label: 'Příjmení', type: 'text', required: true },
        { name: 'datum_narozeni', label: 'Datum narození', type: 'date', required: false },
        { name: 'rodne_cislo', label: 'Rodné číslo', type: 'text', required: false }
      ]
    });
  } else {
    baseFields.push({
      section: 'Údaje organizace',
      fields: [
        { name: 'nazev_firmy', label: 'Název firmy/organizace', type: 'text', required: true }
      ]
    });

    if (typ === 'osvc' || typ === 'firma') {
      baseFields[baseFields.length - 1].fields.push(
        { name: 'ico', label: 'IČO', type: 'text', required: false },
        { name: 'dic', label: 'DIČ', type: 'text', required: false }
      );
    }
  }

  // Kontaktní údaje
  baseFields.push({
    section: 'Kontaktní údaje',
    fields: [
      { name: 'primary_email', label: 'Email', type: 'email', required: false },
      { name: 'secondary_email', label: 'Email (sekundární)', type: 'email', required: false },
      { name: 'primary_phone', label: 'Telefon', type: 'tel', required: false },
      { name: 'telefon_2', label: 'Telefon 2', type: 'tel', required: false }
    ]
  });

  // Adresa
  baseFields.push({
    section: 'Adresa',
    fields: [
      { name: 'ulice', label: 'Ulice', type: 'text', required: false },
      { name: 'cislo_popisne', label: 'Číslo popisné', type: 'text', required: false },
      { name: 'city', label: 'Město', type: 'text', required: false },
      { name: 'psc', label: 'PSČ', type: 'text', required: false },
      { name: 'stat', label: 'Stát', type: 'text', required: false }
    ]
  });

  // Poznámka
  baseFields.push({
    section: 'Dodatečné informace',
    fields: [
      { name: 'poznamka', label: 'Poznámka', type: 'textarea', required: false }
    ]
  });

  return baseFields;
}

export default { render };
```

---

## 8. BEZPEČNOST A OPRÁVNĚNÍ


### 8.1 Role a oprávnění

**Definované role:**
- **admin**: Plný přístup (čtení + zápis + archivace + smazání)
- **user**: Čtení všech dat, zápis vlastních dat (podle RLS)
- **viewer**: Pouze čtení

### 8.2 Oprávnění (permissions)

**Prefix modulu:** `060-smlouva`

**Mapování oprávnění:**

| Oprávnění | Popis | Role |
|-----------|-------|------|
| `060-smlouva.prehled.read` | Čtení přehledu | admin, user, viewer |
| `060-smlouva.osoba.read` | Čtení přehledu osob | admin, user, viewer |
| `060-smlouva.osvc.read` | Čtení přehledu OSVČ | admin, user, viewer |
| `060-smlouva.firma.read` | Čtení přehledu firem | admin, user, viewer |
| `060-smlouva.spolek.read` | Čtení přehledu spolků | admin, user, viewer |
| `060-smlouva.stat.read` | Čtení přehledu státních institucí | admin, user, viewer |
| `060-smlouva.zastupce.read` | Čtení přehledu zástupců | admin, user, viewer |
| `060-smlouva.detail.read` | Čtení detailu | admin, user, viewer |
| `060-smlouva.edit.write` | Editace subjektu | admin, user |
| `060-smlouva.create.write` | Vytvoření nového subjektu | admin, user |
| `060-smlouva.archive.write` | Archivace subjektu | admin |
| `060-smlouva.delete.write` | Smazání subjektu | admin |

### 8.3 RLS Policies (Row Level Security)

Viz sekce 3.2 - RLS policies jsou definovány na úrovni databáze.

**Klíčové body:**
- ✅ Všechny tabulky MUSÍ mít RLS zapnuté (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`)
- ✅ Admini mají plný přístup
- ✅ Uživatelé vidí všechna data, ale mohou editovat pouze vlastní (přes `user_subjects`)
- ✅ Vieweři mají pouze čtení

### 8.4 Input validace

**Frontend validace:**
- Povinná pole označena `*` a `required: true`
- Email validace: `type="email"`
- Telefon validace: `type="tel"`
- Datum validace: `type="date"`
- Escapování HTML: Použít textContent místo innerHTML pro user input

**Backend validace:**
- Supabase RLS policies
- Database constraints (NOT NULL, UNIQUE, CHECK)
- Trigger funkce pro automatické pole (updated_at)

---

## 9. UI KOMPONENTY A INTEGRACE

### 9.1 Breadcrumb (Drobečková navigace)

**Povinné na VŠECH views (tiles i forms):**

```javascript
import { setBreadcrumb } from '/src/ui/breadcrumb.js';

setBreadcrumb(document.getElementById('crumb'), [
  { icon: 'home', label: 'Domů', href: '#/' },
  { icon: 'home', label: 'Pronajímatel', href: '#/m/060-smlouva/t/prehled' },
  { icon: 'list', label: 'Přehled' }
]);
```

**Pravidla:**
- První item: vždy domů (`#/`)
- Druhý item: název modulu (link na defaultTile)
- Poslední item: aktuální view (BEZ href)
- Ikony konzistentní s manifestem

### 9.2 CommonActions (Pravá akční lišta)

**Povinné na VŠECH views:**

```javascript
import { renderCommonActions } from '/src/ui/commonActions.js';

renderCommonActions(document.getElementById('commonactions'), {
  moduleActions: ['add', 'edit', 'archive', 'attach', 'refresh', 'history'],
  userRole: window.currentUserRole || 'admin',
  handlers: {
    onAdd: () => navigateTo('#/m/060-smlouva/f/chooser'),
    onEdit: () => { /* ... */ },
    onArchive: () => { /* ... */ },
    onAttach: () => { /* ... */ },
    onRefresh: () => { /* ... */ },
    onHistory: () => { /* ... */ }
  }
});
```

**Dostupné akce:**
- `add` - Vytvoření nového záznamu
- `edit` - Editace vybraného záznamu (vyžaduje selected row)
- `archive` - Archivace záznamu (vyžaduje selected row)
- `attach` - Správa příloh (vyžaduje selected row)
- `refresh` - Obnovení dat
- `history` - Historie změn (vyžaduje selected row)
- `save` - Uložení (pouze ve formulářích)

### 9.3 Table (Tabulka)

**Použití:**

```javascript
import { renderTable } from '/src/ui/table.js';

renderTable(container, {
  columns: [
    { key: 'display_name', label: 'Název', width: '30%', sortable: true },
    { key: 'primary_email', label: 'Email', width: '25%', sortable: false }
  ],
  rows: data,
  options: {
    moduleId: '060-smlouva',
    onRowSelect: (row) => { /* ... */ },
    onRowDblClick: (row) => { /* ... */ }
  }
});
```

### 9.4 Form (Formulář)

**Použití:**

```javascript
import { renderForm } from '/src/ui/form.js';

await renderForm(container, {
  fields: [
    {
      section: 'Základní údaje',
      fields: [
        { name: 'display_name', label: 'Název', type: 'text', required: true }
      ]
    }
  ],
  data: initialData,
  onSubmit: async (formData) => { /* ... */ },
  options: {
    submitButtonText: 'Uložit',
    submitButtonId: 'form-submit'
  }
});
```

### 9.5 Toast (Notifikace)

**Použití:**

```javascript
import { toast } from '/src/ui/toast.js';

toast('Úspěšně uloženo', 'success');  // Zelená
toast('Chyba při ukládání', 'error'); // Červená
toast('Upozornění', 'warning');       // Oranžová
toast('Informace', 'info');           // Modrá
```

### 9.6 Unsaved Helper (Varování při odchodu)

**Použití ve formulářích:**

```javascript
import { setUnsavedChanges } from '/src/ui/unsavedHelper.js';

// Aktivace při načtení formuláře
setUnsavedChanges(true);

// Deaktivace po uložení
setUnsavedChanges(false);
```

### 9.7 Historie (History)

**Implementace:** TBD (To Be Determined)

**Očekávaná struktura:**
- Formulář `forms/history.js`
- Zobrazení změn z tabulky `subject_history`
- Filtrování podle akce (create, update, archive)
- Diff zobrazení (old_data vs new_data)

### 9.8 Přílohy (Attachments)

**Implementace:** TBD

**Očekávaná struktura:**
- Použití centrální tabulky `attachments`
- Upload souborů do Supabase Storage
- Zobrazení seznamu příloh
- Download/smazání příloh

---

## 10. TESTOVÁNÍ

### 10.1 Manuální testování

**Checklist pro každý tile:**

- [ ] Tile se načte bez chyb v konzoli
- [ ] Breadcrumb je správný
- [ ] CommonActions se zobrazují
- [ ] Data se načítají z databáze
- [ ] Tabulka se vykresluje správně
- [ ] Filtr "Zobrazit archivované" funguje
- [ ] Search (pokud implementováno) funguje
- [ ] Row select funguje (vizuální feedback)
- [ ] Double click naviguje na detail
- [ ] Tlačítko Přidat funguje
- [ ] Tlačítko Editovat funguje (s vybraným řádkem)
- [ ] Tlačítko Archivovat funguje (s potvrzením)
- [ ] Tlačítko Obnovit funguje
- [ ] Prázdný stav (žádná data) se zobrazuje správně
- [ ] Chybový stav se zobrazuje správně

**Checklist pro každý formulář:**

- [ ] Formulář se načte bez chyb
- [ ] Breadcrumb je správný
- [ ] CommonActions se zobrazují
- [ ] Pole jsou správně předvyplněna (edit mode)
- [ ] Povinná pole jsou označena *
- [ ] Validace funguje
- [ ] Tlačítko Uložit odesílá data
- [ ] Po uložení navigace na detail
- [ ] Toast notifikace se zobrazuje
- [ ] Unsaved helper varuje při odchodu bez uložení
- [ ] Chybový stav při selhání ukládání

### 10.2 Testovací scénáře

**Scénář 1: Vytvoření nové fyzické osoby**

1. Otevřít modul 060-smlouva
2. Kliknout na "Nový subjekt" (tile nebo tlačítko Add)
3. Vybrat typ "Fyzická osoba"
4. Vyplnit povinná pole (jméno, příjmení)
5. Kliknout Uložit
6. Ověřit redirect na detail
7. Ověřit, že osoba je v přehledu

**Scénář 2: Editace firmy**

1. Otevřít přehled Firma
2. Dvojklik na řádek → otevře detail
3. Kliknout Editovat
4. Změnit název firmy
5. Kliknout Uložit
6. Ověřit změnu v detailu
7. Ověřit změnu v přehledu

**Scénář 3: Archivace OSVČ**

1. Otevřít přehled OSVČ
2. Vybrat řádek (single click)
3. Kliknout Archivovat
4. Potvrdit dialog
5. Ověřit, že OSVČ zmizela z přehledu
6. Zaškrtnout "Zobrazit archivované"
7. Ověřit, že OSVČ je viditelná s označením "Archivován"

**Scénář 4: Vyhledávání**

1. Otevřít hlavní přehled
2. Zadat do search pole email
3. Ověřit filtrování výsledků
4. Vymazat search pole
5. Ověřit zobrazení všech záznamů

### 10.3 Konzole browser

**Žádné chyby v konzoli:**
- ❌ Uncaught errors
- ❌ 404 (soubory nenalezeny)
- ❌ Failed to fetch
- ⚠️ Warnings jsou OK, ale měly by být minimalizovány

### 10.4 Performance

**Základní metriky:**
- Načtení modulu: < 500ms
- Načtení dat (< 100 záznamů): < 1s
- Render tabulky: < 300ms
- Uložení formuláře: < 2s

---

## 11. CHECKLIST PŘED DOKONČENÍM

### 11.1 Struktura souborů

- [ ] `module.config.js` vytvořen a správně nakonfigurován
- [ ] `db.js` implementován se všemi CRUD operacemi
- [ ] Všechny tiles vytvořeny (prehled, osoba, osvc, firma, spolek, stat, zastupce)
- [ ] Všechny forms vytvořeny (chooser, detail, form)
- [ ] Dokumentace aktualizována (README.md, permissions.md, datovy-model.md, checklist.md)

### 11.2 Manifest (module.config.js)

- [ ] `id` odpovídá názvu adresáře
- [ ] `title` je čitelný název
- [ ] `icon` je správná ikona
- [ ] `defaultTile` existuje v tiles
- [ ] `tiles` pole obsahuje všechny přehledy
- [ ] `forms` pole obsahuje všechny formuláře
- [ ] Dynamické načítání counts funguje

### 11.3 Databáze

- [ ] Tabulka `subjects` existuje
- [ ] RLS policies jsou nastaveny
- [ ] Indexy jsou vytvořeny
- [ ] Trigger `updated_at` funguje
- [ ] Tabulka `subject_history` existuje (pro historii)
- [ ] Tabulka `user_subjects` existuje (pro vazby)

### 11.4 UI Komponenty

- [ ] Breadcrumbs ve všech views
- [ ] CommonActions ve všech views
- [ ] Tabulky správně vykresleny
- [ ] Formuláře správně vykresleny
- [ ] Toast notifikace fungují
- [ ] Unsaved helper aktivován ve formulářích

### 11.5 Funkčnost

- [ ] Vytvoření nového subjektu funguje
- [ ] Editace subjektu funguje
- [ ] Archivace subjektu funguje
- [ ] Filtrování podle typu funguje
- [ ] Vyhledávání funguje
- [ ] Zobrazení archivovaných funguje
- [ ] Navigace mezi views funguje

### 11.6 Bezpečnost

- [ ] Input validace implementována
- [ ] RLS policies aktivní
- [ ] Oprávnění kontrolována
- [ ] XSS ochrana (escapování HTML)
- [ ] Žádné secrets v kódu

### 11.7 Dokumentace

- [ ] README.md aktualizován
- [ ] permissions.md vyplněn
- [ ] datovy-model.md vyplněn
- [ ] checklist.md vyplněn
- [ ] Komentáře v kódu (kde potřeba)

### 11.8 Registrace

- [ ] Modul zaregistrován v `src/app/modules.index.js`
- [ ] Modul se zobrazuje v sidebaru
- [ ] Defaultní tile se otevírá po kliknutí na modul

### 11.9 Testování

- [ ] Všechny scénáře manuálně otestovány
- [ ] Žádné chyby v konzoli
- [ ] Prázdné stavy otestovány
- [ ] Chybové stavy otestovány
- [ ] Různé role otestovány (admin, user, viewer)

### 11.10 Git

- [ ] Změny commitnuty s popisnou zprávou
- [ ] Branch vytvořen (feature/modul-060)
- [ ] Pull Request vytvořen (pokud požadováno)

---

## 12. PŘÍLOHY A REFERENCE

### 12.1 Vzorové moduly

**Modul 010 (Správa uživatelů):**
- Cesta: `src/modules/010-sprava-uzivatelu/`
- Vzor pro: Strukturu, manifest, tiles, forms
- Referenční implementace pro nejlepší praktiky

**Modul 030 (Pronajímatel):**
- Cesta: `src/modules/030-pronajimatel/`
- Vzor pro: Práci se subjekty, dynamické typy, counts
- POZOR: Modul 060 může být duplikát nebo rozšíření 030

**Modul 040 (Nemovitost):**
- Cesta: `src/modules/040-nemovitost/`
- Vzor pro: Komplexní formuláře, vnořené entity

### 12.2 Dokumentace

**Hlavní dokumenty:**
- `NEW/08-SABLONA-MODULU.md` - Šablona modulu
- `NEW/10-CHECKLIST-PRAVIDLA.md` - Pravidla a checklist
- `docs/how-to-create-module.md` - Návod na vytvoření modulu
- `docs/database-schema.md` - Databázové schéma
- `aplikace-v5_stav.md` - Stav aplikace

**UI dokumentace:**
- `NEW/02-STRUKTURA-UI.md` - Struktura UI
- `NEW/04-VZOROVE-FORMULARE.md` - Vzorové formuláře
- `NEW/05-VZOROVE-PREHLEDY.md` - Vzorové přehledy

**Databáze:**
- `NEW/07-DATABASE-SCHEMA.md` - Database schema
- `docs/database-schema-maintenance.md` - Údržba schématu

### 12.3 Konvence a standardy

**Naming conventions:**
- Soubory: `kebab-case.js` (prehled.js, detail.js)
- Funkce: `camelCase` (listLandlords, getLandlord)
- Konstanty: `UPPER_SNAKE_CASE` (AUDIT_FIELDS, MODULE_ID)
- Komponenty: `PascalCase` (pokud používáme)

**Import cesty:**
- Absolutní cesty: `/src/ui/table.js`
- Relativní cesty: `../db.js`
- Cache-buster: `?v=${Date.now()}` (pro dynamické importy)

**Asynchronní operace:**
- Vždy použít `async/await`
- Vždy vrátit `{data, error}` formát
- Vždy ošetřit chyby (try/catch nebo if error)

**Databázové operace:**
- Vždy použít RLS
- Vždy nastavit `updated_at` při UPDATE
- Vždy nastavit `created_by`/`updated_by`
- Vždy použít UUID pro ID

**UI best practices:**
- Vždy nastavit breadcrumb
- Vždy vykreslit commonActions
- Vždy zobrazit loading stav
- Vždy zobrazit prázdný stav
- Vždy zobrazit chybový stav
- Vždy zobrazit toast po akci

### 12.4 Časté problémy a řešení

**Problém: Modul se nezobrazuje v sidebaru**
- Zkontroluj registraci v `modules.index.js`
- Zkontroluj, že `getManifest()` vrací správný objekt
- Zkontroluj konzoli pro chyby

**Problém: Tile se nenačítá**
- Zkontroluj, že `tile-id` odpovídá názvu souboru
- Zkontroluj, že soubor exportuje `render` funkci
- Zkontroluj import cesty

**Problém: Data se nenačítají**
- Zkontroluj RLS policies
- Zkontroluj oprávnění uživatele
- Zkontroluj Supabase konzoli pro chyby

**Problém: Formulář neuloží**
- Zkontroluj validaci polí
- Zkontroluj, že data jsou v správném formátu
- Zkontroluj RLS policies pro INSERT/UPDATE
- Zkontroluj konzoli pro chyby

**Problém: Breadcrumb nefunguje**
- Zkontroluj, že `setBreadcrumb` je volán
- Zkontroluj, že element `#crumb` existuje
- Zkontroluj strukturu breadcrumb objektu

---

## ZÁVĚR

Tento dokument poskytuje kompletní specifikaci pro vytvoření modulu 060-Pronajímatel. 

**Klíčové body:**
1. ✅ Dodržuj strukturu a konvence aplikace v5
2. ✅ Použij vzorové moduly jako referenci (zejména 010, 030)
3. ✅ Implementuj VŠECHNY povinné komponenty (breadcrumb, commonActions)
4. ✅ Otestuj VŠECHNY scénáře před dokončením
5. ✅ Aktualizuj dokumentaci
6. ✅ Dodržuj bezpečnostní pravidla (RLS, validace)

**Pro agenta:**
- Čti tento dokument POZORNĚ
- Implementuj krok za krokem
- Kontroluj checklist průběžně
- Testuj často a iterativně
- Ptej se, pokud něco není jasné

**Poznámka:** Modul 060-smlouva má v adresáři název "smlouva", ale specifikace je pro modul "Pronajímatel". To může být:
- Chyba v názvu adresáře (mělo být 060-pronajimatel)
- Nebo jiný modul (060 = smlouvy, ne pronajímatelé)

**Doporučení:** Před implementací OVĚŘIT s vlastníkem projektu, jaký je skutečný účel modulu 060.

---

**Verze dokumentu:** 1.0  
**Autor:** Copilot Agent  
**Datum:** 2025-11-10  
**Status:** ✅ Kompletní specifikace připravena k implementaci

