# Úkol 08: Datový model pro modul 040 (Nemovitosti + Jednotky)

## 📋 Popis
Implementovat kompletní datový model pro modul 040-nemovitost s podporou nemovitostí a jednotek včetně vazeb na pronajímatele a nájemníky.

## 🎯 Cíl
Vytvořit robustní datovou strukturu která podporuje všechny typy nemovitostí a umožňuje flexibilní správu jednotek.

## ✅ Akceptační kritéria
- [ ] Každá jednotka má vazbu na nemovitost (`nemovitost_id`)
- [ ] Nemovitost může obsahovat 0, 1 nebo více jednotek
- [ ] Jednotka může mít přiřazeného pronajímatele a nájemníka
- [ ] Validace typů nemovitostí a jednotek
- [ ] RLS policies pro zabezpečení dat
- [ ] Indexy pro optimální výkon

## 📁 Dotčený modul
- [ ] 040-nemovitost

## 🔧 Implementační kroky

### 1. Databázové schema - tabulka `properties`

#### 1.1 Vytvořit Supabase migraci

```sql
-- Vytvoření ENUM pro typy nemovitostí
CREATE TYPE property_type AS ENUM (
  'byt',
  'dum', 
  'garaz',
  'pozemek',
  'komercni',
  'ostatni'
);

-- Hlavní tabulka nemovitostí
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Základní údaje
  typ property_type NOT NULL,
  nazev VARCHAR(255) NOT NULL,
  popis TEXT,
  
  -- Adresa
  ulice VARCHAR(255),
  cislo_popisne VARCHAR(20),
  mesto VARCHAR(100) NOT NULL,
  psc VARCHAR(10),
  kraj VARCHAR(100),
  stat VARCHAR(100) DEFAULT 'Česká republika',
  
  -- Technické údaje
  rok_vystavby INTEGER CHECK (rok_vystavby >= 1800 AND rok_vystavby <= EXTRACT(YEAR FROM CURRENT_DATE)),
  rok_rekonstrukce INTEGER,
  celkova_plocha DECIMAL(10,2) CHECK (celkova_plocha > 0),
  
  -- Vazby
  pronajimatel_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  
  -- Metadata
  poznamky TEXT,
  prilohy JSONB DEFAULT '[]'::jsonb,
  
  -- Archivace
  archived_at TIMESTAMPTZ,
  archived_by UUID REFERENCES auth.users(id),
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id),
  
  -- Constraints
  CONSTRAINT properties_rekonstrukce_check 
    CHECK (rok_rekonstrukce IS NULL OR rok_rekonstrukce >= rok_vystavby)
);

-- Indexy pro výkon
CREATE INDEX idx_properties_typ ON properties(typ);
CREATE INDEX idx_properties_mesto ON properties(mesto);
CREATE INDEX idx_properties_pronajimatel_id ON properties(pronajimatel_id);
CREATE INDEX idx_properties_archived_at ON properties(archived_at);
CREATE INDEX idx_properties_created_at ON properties(created_at DESC);

-- Trigger pro automatickou aktualizaci updated_at
CREATE TRIGGER properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Komentáře
COMMENT ON TABLE properties IS 'Nemovitosti';
COMMENT ON COLUMN properties.typ IS 'Typ nemovitosti (byt, dům, garáž, ...)';
COMMENT ON COLUMN properties.pronajimatel_id IS 'Vazba na subjekt - pronajímatel';
```

### 2. Databázové schema - tabulka `units`

#### 2.1 Vytvořit migraci pro jednotky

```sql
-- ENUM pro typy jednotek
CREATE TYPE unit_type AS ENUM (
  'byt',
  'pokoj',
  'dum',
  'garaz',
  'parkovaci_misto',
  'kancelar',
  'sklad',
  'pozemek_cast',
  'ostatni'
);

-- ENUM pro stav jednotky
CREATE TYPE unit_status AS ENUM (
  'volna',
  'obsazena',
  'v_rekonstrukci',
  'nedostupna'
);

-- Tabulka jednotek
CREATE TABLE units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Vazba na nemovitost (POVINNÁ)
  nemovitost_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  
  -- Základní údaje
  typ unit_type NOT NULL,
  nazev VARCHAR(255) NOT NULL,
  popis TEXT,
  cislo_jednotky VARCHAR(50), -- např. "2.3" nebo "A12"
  
  -- Stav
  stav unit_status DEFAULT 'volna',
  
  -- Technické údaje
  plocha DECIMAL(10,2) CHECK (plocha > 0),
  pocet_mistnosti INTEGER CHECK (pocet_mistnosti >= 0),
  
  -- Vybavení (JSONB array)
  vybaveni JSONB DEFAULT '[]'::jsonb,
  -- Příklad: ["internet", "klimatizace", "balkon"]
  
  -- Finanční údaje
  mesicni_najem DECIMAL(10,2) CHECK (mesicni_najem >= 0),
  kauce DECIMAL(10,2) CHECK (kauce >= 0),
  
  -- Vazby na subjekty
  najemce_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  
  -- Období nájmu
  datum_zahajeni_najmu DATE,
  datum_ukonceni_najmu DATE,
  
  -- Metadata
  poznamky TEXT,
  prilohy JSONB DEFAULT '[]'::jsonb,
  
  -- Archivace
  archived_at TIMESTAMPTZ,
  archived_by UUID REFERENCES auth.users(id),
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id),
  
  -- Constraints
  CONSTRAINT units_datum_najmu_check 
    CHECK (datum_ukonceni_najmu IS NULL OR datum_ukonceni_najmu >= datum_zahajeni_najmu)
);

-- Indexy
CREATE INDEX idx_units_nemovitost_id ON units(nemovitost_id);
CREATE INDEX idx_units_typ ON units(typ);
CREATE INDEX idx_units_stav ON units(stav);
CREATE INDEX idx_units_najemce_id ON units(najemce_id);
CREATE INDEX idx_units_archived_at ON units(archived_at);

-- Trigger pro updated_at
CREATE TRIGGER units_updated_at
  BEFORE UPDATE ON units
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Komentáře
COMMENT ON TABLE units IS 'Jednotky nemovitostí';
COMMENT ON COLUMN units.nemovitost_id IS 'Vazba na nadřazenou nemovitost';
COMMENT ON COLUMN units.najemce_id IS 'Vazba na subjekt - nájemce';
```

### 3. Validační pravidla a constraints

#### 3.1 Validace typu nemovitosti vs. typ jednotky

```sql
-- Trigger pro validaci typu jednotky podle typu nemovitosti
CREATE OR REPLACE FUNCTION validate_unit_type()
RETURNS TRIGGER AS $$
DECLARE
  property_typ property_type;
BEGIN
  -- Získat typ nemovitosti
  SELECT typ INTO property_typ
  FROM properties
  WHERE id = NEW.nemovitost_id;
  
  -- Validace podle typu nemovitosti
  -- (Toto je volitelné - přizpůsobit podle business logiky)
  IF property_typ = 'garaz' AND NEW.typ NOT IN ('garaz', 'parkovaci_misto') THEN
    RAISE EXCEPTION 'Pro garáž lze vytvořit pouze jednotky typu garáž nebo parkovací místo';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER units_validate_type
  BEFORE INSERT OR UPDATE ON units
  FOR EACH ROW
  EXECUTE FUNCTION validate_unit_type();
```

### 4. RLS Policies

#### 4.1 Properties RLS

```sql
-- Povolit RLS
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Policy pro čtení (všichni ověření uživatelé)
CREATE POLICY properties_select_policy ON properties
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Policy pro vytváření (uživatelé s oprávněním)
CREATE POLICY properties_insert_policy ON properties
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    has_permission(auth.uid(), 'properties.create')
  );

-- Policy pro úpravu (vlastník nebo admin)
CREATE POLICY properties_update_policy ON properties
  FOR UPDATE
  USING (
    auth.uid() IS NOT NULL AND
    (has_permission(auth.uid(), 'properties.update') OR created_by = auth.uid())
  );

-- Policy pro mazání (pouze admin)
CREATE POLICY properties_delete_policy ON properties
  FOR DELETE
  USING (
    auth.uid() IS NOT NULL AND
    has_permission(auth.uid(), 'properties.delete')
  );
```

#### 4.2 Units RLS

```sql
-- Povolit RLS
ALTER TABLE units ENABLE ROW LEVEL SECURITY;

-- Policy pro čtení
CREATE POLICY units_select_policy ON units
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Policy pro vytváření
CREATE POLICY units_insert_policy ON units
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    has_permission(auth.uid(), 'units.create')
  );

-- Policy pro úpravu
CREATE POLICY units_update_policy ON units
  FOR UPDATE
  USING (
    auth.uid() IS NOT NULL AND
    (has_permission(auth.uid(), 'units.update') OR created_by = auth.uid())
  );

-- Policy pro mazání
CREATE POLICY units_delete_policy ON units
  FOR DELETE
  USING (
    auth.uid() IS NOT NULL AND
    has_permission(auth.uid(), 'units.delete')
  );
```

### 5. Views pro agregovaná data

```sql
-- View pro nemovitosti s počtem jednotek
CREATE OR REPLACE VIEW properties_with_stats AS
SELECT 
  p.*,
  COUNT(u.id) as pocet_jednotek,
  COUNT(u.id) FILTER (WHERE u.stav = 'volna') as volne_jednotky,
  COUNT(u.id) FILTER (WHERE u.stav = 'obsazena') as obsazene_jednotky,
  SUM(u.plocha) as celkova_plocha_jednotek,
  SUM(u.mesicni_najem) FILTER (WHERE u.stav = 'obsazena') as celkovy_najem
FROM properties p
LEFT JOIN units u ON p.id = u.nemovitost_id AND u.archived_at IS NULL
GROUP BY p.id;

COMMENT ON VIEW properties_with_stats IS 'Nemovitosti s agregovanými statistikami jednotek';
```

### 6. Implementovat DB services

#### 6.1 `/src/modules/040-nemovitost/services/db.js`

```javascript
import { supabase } from '../../../supabase.js';

/**
 * Načte seznam nemovitostí
 */
export async function listProperties(filters = {}) {
  let query = supabase
    .from('properties_with_stats')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (!filters.includeArchived) {
    query = query.is('archived_at', null);
  }
  
  if (filters.typ) {
    query = query.eq('typ', filters.typ);
  }
  
  if (filters.mesto) {
    query = query.ilike('mesto', `%${filters.mesto}%`);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data;
}

/**
 * Načte detail nemovitosti
 */
export async function getProperty(id) {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}

/**
 * Vytvoří nemovitost
 */
export async function createProperty(propertyData) {
  const { data, error } = await supabase
    .from('properties')
    .insert(propertyData)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

/**
 * Aktualizuje nemovitost
 */
export async function updateProperty(id, propertyData) {
  const { data, error } = await supabase
    .from('properties')
    .update(propertyData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

/**
 * Načte jednotky nemovitosti
 */
export async function listUnits(propertyId, filters = {}) {
  let query = supabase
    .from('units')
    .select('*')
    .eq('nemovitost_id', propertyId)
    .order('cislo_jednotky', { ascending: true });
  
  if (!filters.includeArchived) {
    query = query.is('archived_at', null);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data;
}

/**
 * Vytvoří jednotku
 */
export async function createUnit(unitData) {
  const { data, error } = await supabase
    .from('units')
    .insert(unitData)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}
```

## 📝 Reference
- **Kompletní specifikace:** `/src/modules/040-nemovitost/assets/datovy-model.md`
- **Checklist:** `/src/modules/040-nemovitost/assets/checklist.md`
- **Permissions:** `/src/modules/040-nemovitost/assets/permissions.md`

## 🔗 Související úkoly
- Task 09: Automatické vytvoření jednotky
- Task 02: Barevné badges pro typy

## ⏱️ Odhadovaný čas
- **Database schema:** 2-3 hodiny
- **RLS policies:** 1-2 hodiny
- **DB services:** 2-3 hodiny
- **Celkem:** 5-8 hodin

## 📊 Priority
**KRITICKÁ** - Základ pro fungování modulu 040.

## ✅ Ověření
Po dokončení ověřit:
1. Tabulky `properties` a `units` existují v Supabase
2. ENUMy jsou správně definovány
3. Foreign keys fungují
4. RLS policies jsou aktivní
5. Indexy jsou vytvořeny
6. DB funkce fungují (create, read, update)
7. Validace funguje správně
