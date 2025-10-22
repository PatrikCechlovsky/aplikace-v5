-- ============================================================================
-- Task 08: Datový model pro modul 040 (Nemovitosti + Jednotky)
-- ============================================================================
-- Tento soubor vytvoří kompletní databázové schema pro modul 040-nemovitost
-- včetně tabulek, ENUMů, RLS policies, indexů a helper funkcí
-- ============================================================================

-- ----------------------------------------------------------------------------
-- ENUMS (Výčtové typy)
-- ----------------------------------------------------------------------------

-- Typy nemovitostí
CREATE TYPE IF NOT EXISTS property_type AS ENUM (
  'bytovy_dum',        -- Bytový dům
  'rodinny_dum',       -- Rodinný dům
  'admin_budova',      -- Administrativní budova
  'prumyslovy_objekt', -- Průmyslový objekt
  'pozemek',           -- Pozemek
  'jiny_objekt'        -- Jiný objekt
);

-- Typy jednotek
CREATE TYPE IF NOT EXISTS unit_type AS ENUM (
  'byt',              -- Byt
  'pokoj',            -- Pokoj
  'dum',              -- Dům
  'garaz',            -- Garáž
  'parkovaci_misto',  -- Parkovací místo
  'kancelar',         -- Kancelář
  'sklad',            -- Sklad
  'pozemek_cast',     -- Část pozemku
  'ostatni'           -- Ostatní
);

-- Stav jednotky
CREATE TYPE IF NOT EXISTS unit_status AS ENUM (
  'volna',           -- Volná
  'obsazena',        -- Obsazená
  'v_rekonstrukci',  -- V rekonstrukci
  'nedostupna'       -- Nedostupná
);

-- ----------------------------------------------------------------------------
-- TABULKA: properties (Nemovitosti)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Základní údaje
  typ_nemovitosti property_type NOT NULL,
  nazev VARCHAR(255) NOT NULL,
  popis TEXT,
  
  -- Adresa
  ulice VARCHAR(255),
  cislo_popisne VARCHAR(20),
  cislo_orientacni VARCHAR(20),
  mesto VARCHAR(100) NOT NULL,
  psc VARCHAR(10),
  kraj VARCHAR(100),
  stat VARCHAR(100) DEFAULT 'Česká republika',
  
  -- Technické údaje
  rok_vystavby INTEGER CHECK (rok_vystavby >= 1800 AND rok_vystavby <= EXTRACT(YEAR FROM CURRENT_DATE)),
  rok_rekonstrukce INTEGER,
  celkova_plocha DECIMAL(10,2) CHECK (celkova_plocha >= 0),
  pocet_podlazi INTEGER CHECK (pocet_podlazi >= 0),
  pocet_jednotek INTEGER DEFAULT 0,
  
  -- Vazby
  pronajimatel_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  
  -- Metadata
  poznamky TEXT,
  prilohy JSONB DEFAULT '[]'::jsonb,
  
  -- Archivace
  archived BOOLEAN DEFAULT FALSE,
  archived_at TIMESTAMPTZ,
  archived_by UUID,
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID,
  
  -- Constraints
  CONSTRAINT properties_rekonstrukce_check 
    CHECK (rok_rekonstrukce IS NULL OR rok_rekonstrukce >= rok_vystavby)
);

-- Komentáře
COMMENT ON TABLE properties IS 'Nemovitosti - budovy, objekty, pozemky';
COMMENT ON COLUMN properties.typ_nemovitosti IS 'Typ nemovitosti (bytový dům, rodinný dům, atd.)';
COMMENT ON COLUMN properties.pronajimatel_id IS 'Vazba na subjekt - pronajímatel';
COMMENT ON COLUMN properties.pocet_jednotek IS 'Počítaný sloupec - počet aktivních jednotek';

-- ----------------------------------------------------------------------------
-- TABULKA: units (Jednotky)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
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
  plocha DECIMAL(10,2) CHECK (plocha >= 0),
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
  archived BOOLEAN DEFAULT FALSE,
  archived_at TIMESTAMPTZ,
  archived_by UUID,
  
  -- Audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID,
  
  -- Constraints
  CONSTRAINT units_datum_najmu_check 
    CHECK (datum_ukonceni_najmu IS NULL OR datum_ukonceni_najmu >= datum_zahajeni_najmu)
);

-- Komentáře
COMMENT ON TABLE units IS 'Jednotky nemovitostí (byty, kanceláře, garáže, atd.)';
COMMENT ON COLUMN units.nemovitost_id IS 'Vazba na nadřazenou nemovitost';
COMMENT ON COLUMN units.najemce_id IS 'Vazba na subjekt - nájemce';
COMMENT ON COLUMN units.vybaveni IS 'JSONB pole vybavení (např. ["internet", "klimatizace"])';

-- ----------------------------------------------------------------------------
-- INDEXY pro optimální výkon
-- ----------------------------------------------------------------------------

-- Properties indexy
CREATE INDEX IF NOT EXISTS idx_properties_typ ON properties(typ_nemovitosti);
CREATE INDEX IF NOT EXISTS idx_properties_mesto ON properties(mesto);
CREATE INDEX IF NOT EXISTS idx_properties_pronajimatel ON properties(pronajimatel_id);
CREATE INDEX IF NOT EXISTS idx_properties_archived ON properties(archived);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties(created_at DESC);

-- Units indexy
CREATE INDEX IF NOT EXISTS idx_units_nemovitost ON units(nemovitost_id);
CREATE INDEX IF NOT EXISTS idx_units_typ ON units(typ);
CREATE INDEX IF NOT EXISTS idx_units_stav ON units(stav);
CREATE INDEX IF NOT EXISTS idx_units_najemce ON units(najemce_id);
CREATE INDEX IF NOT EXISTS idx_units_archived ON units(archived);

-- ----------------------------------------------------------------------------
-- TRIGGERY pro automatickou aktualizaci
-- ----------------------------------------------------------------------------

-- Funkce pro automatickou aktualizaci updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pro properties
DROP TRIGGER IF EXISTS properties_updated_at ON properties;
CREATE TRIGGER properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger pro units
DROP TRIGGER IF EXISTS units_updated_at ON units;
CREATE TRIGGER units_updated_at
  BEFORE UPDATE ON units
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Funkce pro automatickou aktualizaci pocet_jednotek
CREATE OR REPLACE FUNCTION update_property_unit_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE properties 
    SET pocet_jednotek = (
      SELECT COUNT(*) 
      FROM units 
      WHERE nemovitost_id = NEW.nemovitost_id 
      AND archived = FALSE
    )
    WHERE id = NEW.nemovitost_id;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE properties 
    SET pocet_jednotek = (
      SELECT COUNT(*) 
      FROM units 
      WHERE nemovitost_id = NEW.nemovitost_id 
      AND archived = FALSE
    )
    WHERE id = NEW.nemovitost_id;
    
    IF OLD.nemovitost_id IS DISTINCT FROM NEW.nemovitost_id THEN
      UPDATE properties 
      SET pocet_jednotek = (
        SELECT COUNT(*) 
        FROM units 
        WHERE nemovitost_id = OLD.nemovitost_id 
        AND archived = FALSE
      )
      WHERE id = OLD.nemovitost_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE properties 
    SET pocet_jednotek = (
      SELECT COUNT(*) 
      FROM units 
      WHERE nemovitost_id = OLD.nemovitost_id 
      AND archived = FALSE
    )
    WHERE id = OLD.nemovitost_id;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger pro aktualizaci počtu jednotek
DROP TRIGGER IF EXISTS units_update_count ON units;
CREATE TRIGGER units_update_count
  AFTER INSERT OR UPDATE OR DELETE ON units
  FOR EACH ROW
  EXECUTE FUNCTION update_property_unit_count();

-- ----------------------------------------------------------------------------
-- HELPER FUNKCE pro Task 09 (auto-create unit)
-- ----------------------------------------------------------------------------

-- Funkce pro určení defaultního typu jednotky podle typu nemovitosti
CREATE OR REPLACE FUNCTION get_default_unit_type(p_property_type property_type)
RETURNS unit_type AS $$
BEGIN
  RETURN CASE p_property_type
    WHEN 'bytovy_dum' THEN 'byt'::unit_type
    WHEN 'rodinny_dum' THEN 'dum'::unit_type
    WHEN 'admin_budova' THEN 'kancelar'::unit_type
    WHEN 'prumyslovy_objekt' THEN 'sklad'::unit_type
    WHEN 'pozemek' THEN 'pozemek_cast'::unit_type
    ELSE 'ostatni'::unit_type
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION get_default_unit_type IS 'Určí defaultní typ jednotky podle typu nemovitosti';

-- Funkce pro transakční vytvoření nemovitosti s defaultní jednotkou
CREATE OR REPLACE FUNCTION create_property_with_unit(
  p_property_data JSONB,
  p_unit_data JSONB DEFAULT NULL,
  p_user_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_property_id UUID;
  v_unit_id UUID;
  v_property properties;
  v_unit units;
  v_result JSONB;
BEGIN
  -- 1. Vytvořit nemovitost
  INSERT INTO properties (
    typ_nemovitosti, nazev, popis, ulice, cislo_popisne, cislo_orientacni,
    mesto, psc, kraj, stat, rok_vystavby, rok_rekonstrukce, 
    celkova_plocha, pocet_podlazi, pronajimatel_id, poznamky,
    created_by, updated_by
  )
  VALUES (
    (p_property_data->>'typ_nemovitosti')::property_type,
    p_property_data->>'nazev',
    p_property_data->>'popis',
    p_property_data->>'ulice',
    p_property_data->>'cislo_popisne',
    p_property_data->>'cislo_orientacni',
    p_property_data->>'mesto',
    p_property_data->>'psc',
    p_property_data->>'kraj',
    COALESCE(p_property_data->>'stat', 'Česká republika'),
    (p_property_data->>'rok_vystavby')::INTEGER,
    (p_property_data->>'rok_rekonstrukce')::INTEGER,
    (p_property_data->>'celkova_plocha')::DECIMAL,
    (p_property_data->>'pocet_podlazi')::INTEGER,
    (p_property_data->>'pronajimatel_id')::UUID,
    p_property_data->>'poznamky',
    p_user_id,
    p_user_id
  )
  RETURNING * INTO v_property;
  
  v_property_id := v_property.id;
  
  -- 2. Vytvořit defaultní jednotku
  IF p_unit_data IS NULL THEN
    -- Automaticky vytvořit defaultní jednotku
    INSERT INTO units (
      nemovitost_id,
      typ,
      nazev,
      popis,
      stav,
      plocha,
      created_by,
      updated_by
    )
    VALUES (
      v_property_id,
      get_default_unit_type(v_property.typ_nemovitosti),
      v_property.nazev || ' - Jednotka',
      'Automaticky vytvořená jednotka',
      'volna',
      v_property.celkova_plocha,
      p_user_id,
      p_user_id
    )
    RETURNING * INTO v_unit;
  ELSE
    -- Vytvořit jednotku podle poskytnutých dat
    INSERT INTO units (
      nemovitost_id,
      typ,
      nazev,
      popis,
      cislo_jednotky,
      stav,
      plocha,
      pocet_mistnosti,
      vybaveni,
      mesicni_najem,
      kauce,
      najemce_id,
      poznamky,
      created_by,
      updated_by
    )
    VALUES (
      v_property_id,
      (p_unit_data->>'typ')::unit_type,
      p_unit_data->>'nazev',
      p_unit_data->>'popis',
      p_unit_data->>'cislo_jednotky',
      COALESCE((p_unit_data->>'stav')::unit_status, 'volna'::unit_status),
      (p_unit_data->>'plocha')::DECIMAL,
      (p_unit_data->>'pocet_mistnosti')::INTEGER,
      COALESCE((p_unit_data->'vybaveni')::JSONB, '[]'::JSONB),
      (p_unit_data->>'mesicni_najem')::DECIMAL,
      (p_unit_data->>'kauce')::DECIMAL,
      (p_unit_data->>'najemce_id')::UUID,
      p_unit_data->>'poznamky',
      p_user_id,
      p_user_id
    )
    RETURNING * INTO v_unit;
  END IF;
  
  v_unit_id := v_unit.id;
  
  -- 3. Vrátit oba objekty jako JSONB
  v_result := jsonb_build_object(
    'property', row_to_json(v_property),
    'unit', row_to_json(v_unit)
  );
  
  RETURN v_result;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Chyba při vytváření nemovitosti: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION create_property_with_unit IS 'Transakčně vytvoří nemovitost s defaultní jednotkou (Task 09)';

-- ----------------------------------------------------------------------------
-- VIEW pro agregovaná data
-- ----------------------------------------------------------------------------

CREATE OR REPLACE VIEW properties_with_stats AS
SELECT 
  p.*,
  COUNT(u.id) as pocet_jednotek_total,
  COUNT(u.id) FILTER (WHERE u.stav = 'volna' AND u.archived = FALSE) as volne_jednotky,
  COUNT(u.id) FILTER (WHERE u.stav = 'obsazena' AND u.archived = FALSE) as obsazene_jednotky,
  SUM(u.plocha) as celkova_plocha_jednotek,
  SUM(u.mesicni_najem) FILTER (WHERE u.stav = 'obsazena' AND u.archived = FALSE) as celkovy_najem,
  s.display_name as pronajimatel_nazev
FROM properties p
LEFT JOIN units u ON p.id = u.nemovitost_id
LEFT JOIN subjects s ON p.pronajimatel_id = s.id
GROUP BY p.id, s.display_name;

COMMENT ON VIEW properties_with_stats IS 'Nemovitosti s agregovanými statistikami jednotek';

-- ----------------------------------------------------------------------------
-- RLS POLICIES (Row Level Security)
-- ----------------------------------------------------------------------------

-- Povolit RLS
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;

-- Properties RLS policies
DROP POLICY IF EXISTS properties_select_policy ON properties;
CREATE POLICY properties_select_policy ON properties
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS properties_insert_policy ON properties;
CREATE POLICY properties_insert_policy ON properties
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS properties_update_policy ON properties;
CREATE POLICY properties_update_policy ON properties
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS properties_delete_policy ON properties;
CREATE POLICY properties_delete_policy ON properties
  FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- Units RLS policies
DROP POLICY IF EXISTS units_select_policy ON units;
CREATE POLICY units_select_policy ON units
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS units_insert_policy ON units;
CREATE POLICY units_insert_policy ON units
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS units_update_policy ON units;
CREATE POLICY units_update_policy ON units
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS units_delete_policy ON units;
CREATE POLICY units_delete_policy ON units
  FOR DELETE
  USING (auth.uid() IS NOT NULL);

-- ----------------------------------------------------------------------------
-- GRANT oprávnění
-- ----------------------------------------------------------------------------

GRANT ALL ON properties TO authenticated;
GRANT ALL ON units TO authenticated;
GRANT SELECT ON properties_with_stats TO authenticated;

-- ============================================================================
-- KONEC MIGRACE
-- ============================================================================

-- Výpis informací
SELECT 'Migrace dokončena!' as status;
SELECT 'Vytvořeny tabulky: properties, units' as info;
SELECT 'Vytvořeny ENUMy: property_type, unit_type, unit_status' as info;
SELECT 'Vytvořeny indexy, triggery, helper funkce a RLS policies' as info;
