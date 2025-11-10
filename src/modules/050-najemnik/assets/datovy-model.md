# Datový model - Modul 050 (Nájemník)

**Verze:** 1.0  
**Poslední aktualizace:** 2025-11-10  
**Účel:** Kompletní specifikace databázového schématu a datových struktur

---

## 📋 Obsah

1. [Přehled datového modelu](#přehled-datového-modelu)
2. [Tabulka: subjects](#tabulka-subjects)
3. [Tabulka: user_subjects](#tabulka-user_subjects)
4. [Tabulka: subject_history](#tabulka-subject_history)
5. [Tabulka: subject_types](#tabulka-subject_types)
6. [Vztahy mezi tabulkami](#vztahy-mezi-tabulkami)
7. [Indexy a optimalizace](#indexy-a-optimalizace)
8. [Triggery](#triggery)
9. [Views (pohledy)](#views-pohledy)
10. [Funkce v db.js](#funkce-v-dbjs)
11. [Type schemas](#type-schemas)

---

## Přehled datového modelu

### Diagram vztahů

```
┌─────────────────┐
│    profiles     │
│  (uživatelé)    │
└────────┬────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐       ┌──────────────────┐
│ user_subjects   │◄──────│    subjects      │
│  (přiřazení)    │  N:1  │   (nájemníci)    │
└─────────────────┘       └────────┬─────────┘
                                   │
                                   │ 1:N
                                   ▼
                          ┌─────────────────┐
                          │subject_history  │
                          │   (historie)    │
                          └─────────────────┘

┌─────────────────┐
│ subject_types   │
│  (typy)         │
└─────────────────┘
```

### Klíčové vlastnosti

- **Sdílená tabulka**: `subjects` je používána moduly 030 (Pronajímatel) i 050 (Nájemník)
- **Rozlišení**: Pomocí pole `role` (`'pronajimatel'` vs `'najemnik'`)
- **Historie**: Automatické logování všech změn
- **Soft delete**: Archivace místo mazání

---

## Tabulka: subjects

### Účel

Hlavní tabulka pro všechny typy subjektů (pronajímatelé, nájemníci, zástupci).

### Schéma

```sql
CREATE TABLE subjects (
  -- Primární klíč
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Klasifikace
  typ_subjektu VARCHAR(50) NOT NULL,  -- osoba, osvc, firma, spolek, stat, zastupce
  role VARCHAR(50) NOT NULL,           -- pronajimatel, najemnik, zastupce
  
  -- Základní údaje
  display_name VARCHAR(255) NOT NULL,  -- Computed: generováno automaticky
  
  -- Pro fyzickou osobu
  jmeno VARCHAR(100),
  prijmeni VARCHAR(100),
  rodne_cislo VARCHAR(20),
  datum_narozeni DATE,
  
  -- Pro právnickou osobu / OSVČ
  nazev_firmy VARCHAR(255),
  ico VARCHAR(20),
  dic VARCHAR(20),
  
  -- Kontakty
  primary_email VARCHAR(255),
  secondary_email VARCHAR(255),
  telefon VARCHAR(20),
  telefon_2 VARCHAR(20),
  
  -- Adresa
  ulice VARCHAR(255),
  cislo_popisne VARCHAR(20),
  mesto VARCHAR(100),
  psc VARCHAR(10),
  stat VARCHAR(100) DEFAULT 'ČR',
  
  -- Další
  poznamka TEXT,
  
  -- Pro zástupce
  zastupuje_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  
  -- Archivace
  archived BOOLEAN DEFAULT false,
  archived_at TIMESTAMPTZ,
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id)
);
```

### Sloupce - Detailní popis

#### Klasifikační pole

| Sloupec | Typ | Povinné | Výchozí | Popis | Možné hodnoty |
|---------|-----|---------|---------|-------|---------------|
| `id` | UUID | ✅ | gen_random_uuid() | Unikátní ID subjektu | - |
| `typ_subjektu` | VARCHAR(50) | ✅ | - | Typ subjektu | osoba, osvc, firma, spolek, stat, zastupce |
| `role` | VARCHAR(50) | ✅ | - | Role v systému | pronajimatel, najemnik, zastupce |

**Pravidlo**: Pro modul 050 musí být `role = 'najemnik'`

#### Computed field: display_name

Generuje se automaticky podle typu:

```javascript
// Pro osobu (typ_subjektu = 'osoba' nebo 'osvc')
display_name = `${prijmeni} ${jmeno}`.trim()
// Příklad: "Novák Jan"

// Pro firmu/spolek/stat
display_name = nazev_firmy
// Příklad: "ABC s.r.o."

// Pro zástupce
display_name = `${prijmeni} ${jmeno} (zástupce)`.trim()
// Příklad: "Svoboda Petr (zástupce)"
```

#### Pole pro fyzickou osobu

| Sloupec | Typ | Povinné | Validace | Příklad |
|---------|-----|---------|----------|---------|
| `jmeno` | VARCHAR(100) | Ano* | Min 2 znaky | Jan |
| `prijmeni` | VARCHAR(100) | Ano* | Min 2 znaky | Novák |
| `rodne_cislo` | VARCHAR(20) | Ne | Pattern: XXXXXX/XXXX | 123456/7890 |
| `datum_narozeni` | DATE | Ne | - | 1980-01-15 |

*Povinné pouze pro typ_subjektu = 'osoba', 'osvc', 'zastupce'

#### Pole pro právnickou osobu / OSVČ

| Sloupec | Typ | Povinné | Validace | Příklad |
|---------|-----|---------|----------|---------|
| `nazev_firmy` | VARCHAR(255) | Ano* | Min 2 znaky | ABC s.r.o. |
| `ico` | VARCHAR(20) | Ano** | 8 číslic | 12345678 |
| `dic` | VARCHAR(20) | Ne | Pattern: CZ******** | CZ12345678 |

*Povinné pro typ_subjektu = 'firma', 'spolek', 'stat'  
**Povinné pro typ_subjektu = 'firma', 'osvc'

#### Kontaktní pole

| Sloupec | Typ | Povinné | Validace | Příklad |
|---------|-----|---------|----------|---------|
| `primary_email` | VARCHAR(255) | Ne | Email format | info@example.com |
| `secondary_email` | VARCHAR(255) | Ne | Email format | alt@example.com |
| `telefon` | VARCHAR(20) | Ne | Tel format | +420 123 456 789 |
| `telefon_2` | VARCHAR(20) | Ne | Tel format | +420 987 654 321 |

#### Adresní pole

| Sloupec | Typ | Povinné | Validace | Příklad |
|---------|-----|---------|----------|---------|
| `ulice` | VARCHAR(255) | Ne | - | Hlavní |
| `cislo_popisne` | VARCHAR(20) | Ne | - | 123 |
| `mesto` | VARCHAR(100) | Ne | - | Praha |
| `psc` | VARCHAR(10) | Ne | Pattern: XXX XX | 110 00 |
| `stat` | VARCHAR(100) | Ne | Default: ČR | ČR |

#### Speciální pole

| Sloupec | Typ | Povinné | Popis |
|---------|-----|---------|-------|
| `poznamka` | TEXT | Ne | Volný text pro poznámky |
| `zastupuje_id` | UUID | Ne* | FK na subjects.id - koho zastupuje |

*Povinné pouze pro typ_subjektu = 'zastupce'

#### Archivační pole

| Sloupec | Typ | Výchozí | Popis |
|---------|-----|---------|-------|
| `archived` | BOOLEAN | false | Příznak archivace |
| `archived_at` | TIMESTAMPTZ | NULL | Časová značka archivace |

#### Auditní pole

| Sloupec | Typ | Výchozí | Popis |
|---------|-----|---------|-------|
| `created_at` | TIMESTAMPTZ | NOW() | Datum vytvoření |
| `updated_at` | TIMESTAMPTZ | NOW() | Datum poslední změny |
| `created_by` | UUID | NULL | Kdo vytvořil (FK na profiles) |
| `updated_by` | UUID | NULL | Kdo naposledy upravil |

---

## Tabulka: user_subjects

### Účel

Vazební tabulka pro přiřazení uživatelů k subjektům. Určuje, kteří uživatelé mají přístup ke kterým nájemníkům.

### Schéma

```sql
CREATE TABLE user_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES profiles(id),
  
  UNIQUE(user_id, subject_id)
);
```

### Indexy

```sql
CREATE INDEX idx_user_subjects_user ON user_subjects(user_id);
CREATE INDEX idx_user_subjects_subject ON user_subjects(subject_id);
```

### Použití

```javascript
// Přiřadit nájemníka uživateli
async function assignTenantToUser(userId, tenantId) {
  return await supabase
    .from('user_subjects')
    .insert({
      user_id: userId,
      subject_id: tenantId,
      assigned_by: currentUserId
    });
}

// Získat všechny nájemníky přiřazené uživateli
async function getUserTenants(userId) {
  return await supabase
    .from('subjects')
    .select('*')
    .eq('role', 'najemnik')
    .in('id', 
      supabase
        .from('user_subjects')
        .select('subject_id')
        .eq('user_id', userId)
    );
}
```

---

## Tabulka: subject_history

### Účel

Logování všech změn v tabulce subjects pro audit a historii.

### Schéma

```sql
CREATE TABLE subject_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  changed_by UUID REFERENCES profiles(id),
  change_type VARCHAR(20) NOT NULL,  -- 'INSERT', 'UPDATE', 'DELETE'
  old_values JSONB,
  new_values JSONB
);
```

### Indexy

```sql
CREATE INDEX idx_subject_history_subject ON subject_history(subject_id);
CREATE INDEX idx_subject_history_changed_at ON subject_history(changed_at);
```

### Trigger

```sql
CREATE OR REPLACE FUNCTION log_subject_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    INSERT INTO subject_history (subject_id, changed_by, change_type, old_values)
    VALUES (OLD.id, auth.uid(), TG_OP, row_to_json(OLD));
    RETURN OLD;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO subject_history (subject_id, changed_by, change_type, old_values, new_values)
    VALUES (NEW.id, auth.uid(), TG_OP, row_to_json(OLD), row_to_json(NEW));
    RETURN NEW;
  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO subject_history (subject_id, changed_by, change_type, new_values)
    VALUES (NEW.id, auth.uid(), TG_OP, row_to_json(NEW));
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER subjects_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON subjects
  FOR EACH ROW
  EXECUTE FUNCTION log_subject_change();
```

---

## Tabulka: subject_types

### Účel

Справочник (číselník) typů subjektů. Umožňuje dynamickou konfiguraci.

### Schéma

```sql
CREATE TABLE subject_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(50) UNIQUE NOT NULL,  -- osoba, osvc, firma, ...
  label VARCHAR(100) NOT NULL,        -- Osoba, OSVČ, Firma, ...
  icon VARCHAR(50),                   -- person, briefcase, building, ...
  description TEXT,
  active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0
);
```

### Data

```sql
INSERT INTO subject_types (slug, label, icon, sort_order) VALUES
  ('osoba', 'Osoba', 'person', 1),
  ('osvc', 'OSVČ', 'briefcase', 2),
  ('firma', 'Firma', 'building', 3),
  ('spolek', 'Spolek / Skupina', 'people', 4),
  ('stat', 'Státní instituce', 'bank', 5),
  ('zastupce', 'Zástupce', 'handshake', 6);
```

---

## Vztahy mezi tabulkami

### ER Diagram

```
profiles (1) ─── (N) user_subjects (N) ─── (1) subjects
                                                  │
                                                  │
                                                  │ (1)
                                                  │
                                                  ▼ (N)
                                            subject_history

subjects (1) ─── (N) subjects (zástupce → zastupovaný)
    │                    │
    │ (1)                │ (N)
    │                    │
    ▼ (N)                ▼ (1)
contracts            attachments
```

### Foreign Keys

```sql
-- user_subjects
ALTER TABLE user_subjects
  ADD CONSTRAINT fk_user_subjects_user 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_user_subjects_subject 
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE;

-- subject_history
ALTER TABLE subject_history
  ADD CONSTRAINT fk_subject_history_subject 
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_subject_history_changed_by 
    FOREIGN KEY (changed_by) REFERENCES profiles(id) ON DELETE SET NULL;

-- subjects (zástupce)
ALTER TABLE subjects
  ADD CONSTRAINT fk_subjects_zastupuje 
    FOREIGN KEY (zastupuje_id) REFERENCES subjects(id) ON DELETE SET NULL;

-- subjects (audit)
ALTER TABLE subjects
  ADD CONSTRAINT fk_subjects_created_by 
    FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_subjects_updated_by 
    FOREIGN KEY (updated_by) REFERENCES profiles(id) ON DELETE SET NULL;
```

---

## Indexy a optimalizace

### Primární indexy

```sql
-- subjects
CREATE INDEX idx_subjects_typ ON subjects(typ_subjektu);
CREATE INDEX idx_subjects_role ON subjects(role);
CREATE INDEX idx_subjects_display_name ON subjects(display_name);
CREATE INDEX idx_subjects_ico ON subjects(ico);
CREATE INDEX idx_subjects_email ON subjects(primary_email);
CREATE INDEX idx_subjects_archived ON subjects(archived);
CREATE INDEX idx_subjects_created_at ON subjects(created_at);

-- Composite index pro rychlé filtrování nájemníků
CREATE INDEX idx_subjects_role_type_archived 
  ON subjects(role, typ_subjektu, archived);
```

### Full-text search index

```sql
-- Pro rychlé fulltext vyhledávání
CREATE INDEX idx_subjects_search 
  ON subjects USING gin(
    to_tsvector('czech', 
      coalesce(display_name, '') || ' ' || 
      coalesce(primary_email, '') || ' ' || 
      coalesce(ico, '') || ' ' || 
      coalesce(telefon, '')
    )
  );
```

### Vysvětlení výkonu

```sql
-- Rychlý dotaz díky composite indexu
EXPLAIN ANALYZE
SELECT * FROM subjects 
WHERE role = 'najemnik' 
  AND typ_subjektu = 'osoba' 
  AND archived = false;

-- Index Scan using idx_subjects_role_type_archived
-- Planning time: 0.2 ms
-- Execution time: 1.5 ms
```

---

## Triggery

### 1. Auto-update: updated_at

```sql
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
```

### 2. Auto-generate: display_name

```sql
CREATE OR REPLACE FUNCTION generate_display_name()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.typ_subjektu IN ('osoba', 'osvc') THEN
    NEW.display_name = trim(concat(NEW.prijmeni, ' ', NEW.jmeno));
  ELSIF NEW.typ_subjektu = 'zastupce' THEN
    NEW.display_name = trim(concat(NEW.prijmeni, ' ', NEW.jmeno, ' (zástupce)'));
  ELSE
    NEW.display_name = NEW.nazev_firmy;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER subjects_generate_display_name
  BEFORE INSERT OR UPDATE ON subjects
  FOR EACH ROW
  EXECUTE FUNCTION generate_display_name();
```

### 3. Validation: role constraint

```sql
CREATE OR REPLACE FUNCTION validate_subject_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Role musí být jedna z povolených hodnot
  IF NEW.role NOT IN ('pronajimatel', 'najemnik', 'zastupce') THEN
    RAISE EXCEPTION 'Invalid role: %', NEW.role;
  END IF;
  
  -- Pro typ zastupce musí být vyplněno zastupuje_id
  IF NEW.typ_subjektu = 'zastupce' AND NEW.zastupuje_id IS NULL THEN
    RAISE EXCEPTION 'Zastupce must have zastupuje_id';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER subjects_validate_role
  BEFORE INSERT OR UPDATE ON subjects
  FOR EACH ROW
  EXECUTE FUNCTION validate_subject_role();
```

---

## Views (pohledy)

### View: tenants_overview

```sql
CREATE VIEW tenants_overview AS
SELECT 
  s.id,
  s.typ_subjektu,
  s.display_name,
  s.ico,
  s.primary_email as email,
  s.telefon as phone,
  s.mesto as city,
  s.archived,
  s.created_at,
  COUNT(DISTINCT c.id) as contract_count,
  SUM(CASE WHEN c.archived = false THEN 1 ELSE 0 END) as active_contract_count
FROM subjects s
LEFT JOIN contracts c ON c.tenant_id = s.id
WHERE s.role = 'najemnik'
GROUP BY s.id;
```

### Použití view

```javascript
// Rychlý přehled nájemníků s počty smluv
const { data } = await supabase
  .from('tenants_overview')
  .select('*')
  .eq('archived', false);
```

---

## Funkce v db.js

### Kompletní implementace db.js

```javascript
import { supabase } from '/src/supabase.js';

/**
 * Načte všechny nájemníky
 * @param {boolean} includeArchived - Zahrnout archivované záznamy
 * @returns {Promise<{data, error}>}
 */
export async function getAllTenants(includeArchived = false) {
  let query = supabase
    .from('subjects')
    .select('*')
    .eq('role', 'najemnik')
    .order('created_at', { ascending: false });
  
  if (!includeArchived) {
    query = query.eq('archived', false);
  }
  
  return await query;
}

/**
 * Načte jednoho nájemníka podle ID
 * @param {string} id - UUID nájemníka
 * @returns {Promise<{data, error}>}
 */
export async function getTenantById(id) {
  return await supabase
    .from('subjects')
    .select('*')
    .eq('id', id)
    .eq('role', 'najemnik')
    .single();
}

/**
 * Načte nájemníky podle typu
 * @param {string} typ_subjektu - Typ: osoba, osvc, firma, spolek, stat, zastupce
 * @param {boolean} includeArchived - Zahrnout archivované
 * @returns {Promise<{data, error}>}
 */
export async function getTenantsByType(typ_subjektu, includeArchived = false) {
  let query = supabase
    .from('subjects')
    .select('*')
    .eq('role', 'najemnik')
    .eq('typ_subjektu', typ_subjektu)
    .order('display_name', { ascending: true });
  
  if (!includeArchived) {
    query = query.eq('archived', false);
  }
  
  return await query;
}

/**
 * Vytvoří nového nájemníka
 * @param {Object} data - Data nájemníka
 * @returns {Promise<{data, error}>}
 */
export async function createTenant(data) {
  // Vždy nastavit role na 'najemnik'
  const tenantData = {
    ...data,
    role: 'najemnik',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: (await supabase.auth.getUser()).data.user?.id
  };
  
  return await supabase
    .from('subjects')
    .insert(tenantData)
    .select()
    .single();
}

/**
 * Aktualizuje nájemníka
 * @param {string} id - UUID nájemníka
 * @param {Object} data - Nová data
 * @returns {Promise<{data, error}>}
 */
export async function updateTenant(id, data) {
  // Odstranit auditní pole
  const { created_at, created_by, ...updateData } = data;
  
  return await supabase
    .from('subjects')
    .update({ 
      ...updateData, 
      updated_at: new Date().toISOString(),
      updated_by: (await supabase.auth.getUser()).data.user?.id
    })
    .eq('id', id)
    .eq('role', 'najemnik')
    .select()
    .single();
}

/**
 * Archivuje nájemníka
 * @param {string} id - UUID nájemníka
 * @returns {Promise<{data, error}>}
 */
export async function archiveTenant(id) {
  return await supabase
    .from('subjects')
    .update({ 
      archived: true, 
      archived_at: new Date().toISOString(),
      updated_by: (await supabase.auth.getUser()).data.user?.id
    })
    .eq('id', id)
    .eq('role', 'najemnik');
}

/**
 * Fulltextové vyhledávání nájemníků
 * @param {string} searchTerm - Hledaný výraz
 * @param {boolean} includeArchived - Zahrnout archivované
 * @returns {Promise<{data, error}>}
 */
export async function searchTenants(searchTerm, includeArchived = false) {
  if (!searchTerm || searchTerm.trim() === '') {
    return getAllTenants(includeArchived);
  }
  
  const term = searchTerm.trim();
  let query = supabase
    .from('subjects')
    .select('*')
    .eq('role', 'najemnik')
    .or(`display_name.ilike.%${term}%,primary_email.ilike.%${term}%,ico.ilike.%${term}%,telefon.ilike.%${term}%`);
  
  if (!includeArchived) {
    query = query.eq('archived', false);
  }
  
  return await query;
}

/**
 * Načte historii změn nájemníka
 * @param {string} tenantId - UUID nájemníka
 * @returns {Promise<{data, error}>}
 */
export async function getTenantHistory(tenantId) {
  return await supabase
    .from('subject_history')
    .select(`
      *,
      changed_by_profile:profiles!changed_by(display_name, email)
    `)
    .eq('subject_id', tenantId)
    .order('changed_at', { ascending: false });
}
```

---

## Type schemas

### Soubor: type-schemas.js

```javascript
/**
 * Schémata polí pro různé typy subjektů
 */

export const TENANT_TYPE_SCHEMAS = {
  osoba: {
    label: 'Osoba',
    icon: 'person',
    requiredFields: ['jmeno', 'prijmeni'],
    specificFields: [
      { 
        id: 'jmeno', 
        label: 'Jméno *', 
        type: 'text', 
        required: true,
        placeholder: 'Jan',
        minLength: 2,
        maxLength: 100
      },
      { 
        id: 'prijmeni', 
        label: 'Příjmení *', 
        type: 'text', 
        required: true,
        placeholder: 'Novák',
        minLength: 2,
        maxLength: 100
      },
      { 
        id: 'rodne_cislo', 
        label: 'Rodné číslo', 
        type: 'text',
        placeholder: '123456/7890',
        pattern: '^\\d{6}\\/\\d{3,4}$'
      },
      { 
        id: 'datum_narozeni', 
        label: 'Datum narození', 
        type: 'date'
      }
    ]
  },
  
  osvc: {
    label: 'OSVČ',
    icon: 'briefcase',
    requiredFields: ['jmeno', 'prijmeni', 'ico'],
    specificFields: [
      { 
        id: 'jmeno', 
        label: 'Jméno *', 
        type: 'text', 
        required: true,
        placeholder: 'Jan'
      },
      { 
        id: 'prijmeni', 
        label: 'Příjmení *', 
        type: 'text', 
        required: true,
        placeholder: 'Novák'
      },
      { 
        id: 'nazev_firmy', 
        label: 'Obchodní název', 
        type: 'text',
        placeholder: 'Jan Novák - elektrikář'
      },
      { 
        id: 'ico', 
        label: 'IČO *', 
        type: 'text', 
        required: true,
        placeholder: '12345678',
        pattern: '^\\d{8}$',
        minLength: 8,
        maxLength: 8
      },
      { 
        id: 'dic', 
        label: 'DIČ', 
        type: 'text',
        placeholder: 'CZ12345678',
        pattern: '^CZ\\d{8,10}$'
      }
    ]
  },
  
  firma: {
    label: 'Firma',
    icon: 'building',
    requiredFields: ['nazev_firmy', 'ico'],
    specificFields: [
      { 
        id: 'nazev_firmy', 
        label: 'Název firmy *', 
        type: 'text', 
        required: true,
        placeholder: 'ABC s.r.o.',
        minLength: 2,
        maxLength: 255
      },
      { 
        id: 'ico', 
        label: 'IČO *', 
        type: 'text', 
        required: true,
        placeholder: '12345678',
        pattern: '^\\d{8}$',
        minLength: 8,
        maxLength: 8
      },
      { 
        id: 'dic', 
        label: 'DIČ', 
        type: 'text',
        placeholder: 'CZ12345678',
        pattern: '^CZ\\d{8,10}$'
      }
    ]
  },
  
  spolek: {
    label: 'Spolek / Skupina',
    icon: 'people',
    requiredFields: ['nazev_firmy'],
    specificFields: [
      { 
        id: 'nazev_firmy', 
        label: 'Název *', 
        type: 'text', 
        required: true,
        placeholder: 'Spolek přátel přírody',
        minLength: 2,
        maxLength: 255
      }
    ]
  },
  
  stat: {
    label: 'Státní instituce',
    icon: 'bank',
    requiredFields: ['nazev_firmy'],
    specificFields: [
      { 
        id: 'nazev_firmy', 
        label: 'Název *', 
        type: 'text', 
        required: true,
        placeholder: 'Ministerstvo financí',
        minLength: 2,
        maxLength: 255
      }
    ]
  },
  
  zastupce: {
    label: 'Zástupce',
    icon: 'handshake',
    requiredFields: ['jmeno', 'prijmeni', 'zastupuje_id'],
    specificFields: [
      { 
        id: 'jmeno', 
        label: 'Jméno *', 
        type: 'text', 
        required: true,
        placeholder: 'Petr'
      },
      { 
        id: 'prijmeni', 
        label: 'Příjmení *', 
        type: 'text', 
        required: true,
        placeholder: 'Svoboda'
      },
      { 
        id: 'zastupuje_id', 
        label: 'Zastupuje *', 
        type: 'select', 
        required: true,
        // Options se načtou dynamicky z DB
      }
    ]
  }
};

// Společná pole pro všechny typy
export const COMMON_CONTACT_FIELDS = [
  { 
    id: 'primary_email', 
    label: 'Primární email', 
    type: 'email',
    placeholder: 'email@example.com',
    pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$'
  },
  { 
    id: 'secondary_email', 
    label: 'Sekundární email', 
    type: 'email',
    placeholder: 'alt@example.com'
  },
  { 
    id: 'telefon', 
    label: 'Telefon', 
    type: 'tel',
    placeholder: '+420 123 456 789'
  },
  { 
    id: 'telefon_2', 
    label: 'Telefon 2', 
    type: 'tel',
    placeholder: '+420 987 654 321'
  }
];

export const COMMON_ADDRESS_FIELDS = [
  { 
    id: 'ulice', 
    label: 'Ulice', 
    type: 'text',
    placeholder: 'Hlavní'
  },
  { 
    id: 'cislo_popisne', 
    label: 'Číslo popisné', 
    type: 'text',
    placeholder: '123'
  },
  { 
    id: 'mesto', 
    label: 'Město', 
    type: 'text',
    placeholder: 'Praha'
  },
  { 
    id: 'psc', 
    label: 'PSČ', 
    type: 'text',
    placeholder: '110 00',
    pattern: '^\\d{3}\\s?\\d{2}$'
  },
  { 
    id: 'stat', 
    label: 'Stát', 
    type: 'text',
    value: 'ČR'
  }
];

export const COMMON_OTHER_FIELDS = [
  { 
    id: 'poznamka', 
    label: 'Poznámka', 
    type: 'textarea', 
    rows: 4,
    placeholder: 'Volitelná poznámka...'
  }
];

/**
 * Získá pole pro daný typ subjektu
 */
export function getFieldsForType(typ_subjektu) {
  const schema = TENANT_TYPE_SCHEMAS[typ_subjektu];
  if (!schema) {
    console.error(`Unknown tenant type: ${typ_subjektu}`);
    return [];
  }
  
  return [
    ...schema.specificFields,
    ...COMMON_CONTACT_FIELDS,
    ...COMMON_ADDRESS_FIELDS,
    ...COMMON_OTHER_FIELDS
  ];
}

/**
 * Validuje data podle typu
 */
export function validateTenantData(data, typ_subjektu) {
  const schema = TENANT_TYPE_SCHEMAS[typ_subjektu];
  if (!schema) {
    return { valid: false, errors: [`Neznámý typ: ${typ_subjektu}`] };
  }
  
  const errors = [];
  
  // Kontrola povinných polí
  for (const field of schema.requiredFields) {
    if (!data[field] || data[field].trim() === '') {
      errors.push(`Pole ${field} je povinné`);
    }
  }
  
  // Pattern validace
  const allFields = getFieldsForType(typ_subjektu);
  for (const field of allFields) {
    if (field.pattern && data[field.id]) {
      const regex = new RegExp(field.pattern);
      if (!regex.test(data[field.id])) {
        errors.push(`Pole ${field.label} má neplatný formát`);
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
```

---

**Konec dokumentu - Datový model** ✅
