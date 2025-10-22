-- ============================================================================
-- Migration 002: Update Properties and Units Schema
-- ============================================================================
-- This migration aligns the existing Supabase schema with the new data model
-- while preserving existing data and column names
-- ============================================================================

-- ----------------------------------------------------------------------------
-- STEP 1: Update PROPERTIES table
-- ----------------------------------------------------------------------------

-- Add missing columns that exist in Supabase but not properly defined
DO $$ 
BEGIN
  -- Add popis column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'properties' AND column_name = 'popis') THEN
    ALTER TABLE properties ADD COLUMN popis TEXT;
  END IF;

  -- Add cislo_orientacni column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'properties' AND column_name = 'cislo_orientacni') THEN
    ALTER TABLE properties ADD COLUMN cislo_orientacni VARCHAR(20);
  END IF;

  -- Add kraj column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'properties' AND column_name = 'kraj') THEN
    ALTER TABLE properties ADD COLUMN kraj VARCHAR(100);
  END IF;

  -- Add celkova_plocha column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'properties' AND column_name = 'celkova_plocha') THEN
    ALTER TABLE properties ADD COLUMN celkova_plocha DECIMAL(10,2) CHECK (celkova_plocha >= 0);
  END IF;

  -- Add pocet_podzemních_podlazi if not exists (keeping existing name)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'properties' AND column_name = 'pocet_podzemních_podlazi') THEN
    ALTER TABLE properties ADD COLUMN pocet_podzemních_podlazi INTEGER;
  END IF;

  -- Rename poznamka to poznamky if poznamka exists and poznamky doesn't
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'properties' AND column_name = 'poznamka')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                     WHERE table_name = 'properties' AND column_name = 'poznamky') THEN
    ALTER TABLE properties RENAME COLUMN poznamka TO poznamky;
  END IF;

  -- Add prilohy column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'properties' AND column_name = 'prilohy') THEN
    ALTER TABLE properties ADD COLUMN prilohy JSONB DEFAULT '[]'::jsonb;
  END IF;

  -- Add audit columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'properties' AND column_name = 'archived_by') THEN
    ALTER TABLE properties ADD COLUMN archived_by UUID;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'properties' AND column_name = 'created_by') THEN
    ALTER TABLE properties ADD COLUMN created_by UUID;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'properties' AND column_name = 'updated_by') THEN
    ALTER TABLE properties ADD COLUMN updated_by UUID;
  END IF;
END $$;

-- Update column types and constraints for properties
ALTER TABLE properties 
  ALTER COLUMN mesto TYPE VARCHAR(255);

-- Rename pocet_nadzemních_podlazi to pocet_podlazi if needed
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'properties' AND column_name = 'pocet_nadzemních_podlazi')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                     WHERE table_name = 'properties' AND column_name = 'pocet_podlazi') THEN
    ALTER TABLE properties RENAME COLUMN pocet_nadzemních_podlazi TO pocet_podlazi;
  END IF;
END $$;

-- Add check constraints for properties if they don't exist
DO $$
BEGIN
  -- Add rok_vystavby check constraint
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'properties_rok_vystavby_check') THEN
    ALTER TABLE properties 
      ADD CONSTRAINT properties_rok_vystavby_check 
      CHECK (rok_vystavby IS NULL OR (rok_vystavby >= 1800 AND rok_vystavby <= EXTRACT(YEAR FROM CURRENT_DATE)));
  END IF;

  -- Add rekonstrukce check constraint
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'properties_rekonstrukce_check') THEN
    ALTER TABLE properties 
      ADD CONSTRAINT properties_rekonstrukce_check 
      CHECK (rok_rekonstrukce IS NULL OR rok_rekonstrukce >= rok_vystavby);
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- STEP 2: Update UNITS table
-- ----------------------------------------------------------------------------

DO $$
BEGIN
  -- Add nazev column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'units' AND column_name = 'nazev') THEN
    ALTER TABLE units ADD COLUMN nazev VARCHAR(255);
  END IF;

  -- Add popis column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'units' AND column_name = 'popis') THEN
    ALTER TABLE units ADD COLUMN popis TEXT;
  END IF;

  -- Rename oznaceni to cislo_jednotky if oznaceni exists
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'units' AND column_name = 'oznaceni')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                     WHERE table_name = 'units' AND column_name = 'cislo_jednotky') THEN
    ALTER TABLE units RENAME COLUMN oznaceni TO cislo_jednotky;
  END IF;

  -- Keep podlazi column (it exists in Supabase)
  -- No action needed

  -- Keep dispozice column (it exists in Supabase)
  -- No action needed

  -- Add vybaveni column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'units' AND column_name = 'vybaveni') THEN
    ALTER TABLE units ADD COLUMN vybaveni JSONB DEFAULT '[]'::jsonb;
  END IF;

  -- Add kauce column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'units' AND column_name = 'kauce') THEN
    ALTER TABLE units ADD COLUMN kauce DECIMAL(10,2) CHECK (kauce >= 0);
  END IF;

  -- Rename datum_zacatku_najmu to datum_zahajeni_najmu if it exists
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'units' AND column_name = 'datum_zacatku_najmu')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                     WHERE table_name = 'units' AND column_name = 'datum_zahajeni_najmu') THEN
    ALTER TABLE units RENAME COLUMN datum_zacatku_najmu TO datum_zahajeni_najmu;
  END IF;

  -- Rename datum_konce_najmu to datum_ukonceni_najmu if it exists
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'units' AND column_name = 'datum_konce_najmu')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                     WHERE table_name = 'units' AND column_name = 'datum_ukonceni_najmu') THEN
    ALTER TABLE units RENAME COLUMN datum_konce_najmu TO datum_ukonceni_najmu;
  END IF;

  -- Rename poznamka to poznamky if poznamka exists
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'units' AND column_name = 'poznamka')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                     WHERE table_name = 'units' AND column_name = 'poznamky') THEN
    ALTER TABLE units RENAME COLUMN poznamka TO poznamky;
  END IF;

  -- Add prilohy column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'units' AND column_name = 'prilohy') THEN
    ALTER TABLE units ADD COLUMN prilohy JSONB DEFAULT '[]'::jsonb;
  END IF;

  -- Add audit columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'units' AND column_name = 'archived_by') THEN
    ALTER TABLE units ADD COLUMN archived_by UUID;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'units' AND column_name = 'created_by') THEN
    ALTER TABLE units ADD COLUMN created_by UUID;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'units' AND column_name = 'updated_by') THEN
    ALTER TABLE units ADD COLUMN updated_by UUID;
  END IF;
END $$;

-- Update column types and constraints for units
ALTER TABLE units 
  ALTER COLUMN cislo_jednotky TYPE VARCHAR(50);

-- Add check constraints for units if they don't exist
DO $$
BEGIN
  -- Add plocha check constraint
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'units_plocha_check') THEN
    ALTER TABLE units 
      ADD CONSTRAINT units_plocha_check 
      CHECK (plocha >= 0);
  END IF;

  -- Add pocet_mistnosti check constraint  
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'units_pocet_mistnosti_check') THEN
    ALTER TABLE units 
      ADD CONSTRAINT units_pocet_mistnosti_check 
      CHECK (pocet_mistnosti IS NULL OR pocet_mistnosti >= 0);
  END IF;

  -- Add mesicni_najem check constraint
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'units_mesicni_najem_check') THEN
    ALTER TABLE units 
      ADD CONSTRAINT units_mesicni_najem_check 
      CHECK (mesicni_najem IS NULL OR mesicni_najem >= 0);
  END IF;

  -- Add datum check constraint
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'units_datum_najmu_check') THEN
    ALTER TABLE units 
      ADD CONSTRAINT units_datum_najmu_check 
      CHECK (datum_ukonceni_najmu IS NULL OR datum_ukonceni_najmu >= datum_zahajeni_najmu);
  END IF;
END $$;

-- Make nemovitost_id NOT NULL if it isn't already
ALTER TABLE units 
  ALTER COLUMN nemovitost_id SET NOT NULL;

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'units_nemovitost_id_fkey') THEN
    ALTER TABLE units 
      ADD CONSTRAINT units_nemovitost_id_fkey 
      FOREIGN KEY (nemovitost_id) REFERENCES properties(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- STEP 3: Create or update indexes
-- ----------------------------------------------------------------------------

-- Properties indexes
CREATE INDEX IF NOT EXISTS idx_properties_typ ON properties(typ);
CREATE INDEX IF NOT EXISTS idx_properties_mesto ON properties(mesto);
CREATE INDEX IF NOT EXISTS idx_properties_pronajimatel ON properties(pronajimatel_id);
CREATE INDEX IF NOT EXISTS idx_properties_archived ON properties(archived);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties(created_at DESC);

-- Units indexes
CREATE INDEX IF NOT EXISTS idx_units_nemovitost ON units(nemovitost_id);
CREATE INDEX IF NOT EXISTS idx_units_typ ON units(typ);
CREATE INDEX IF NOT EXISTS idx_units_stav ON units(stav);
CREATE INDEX IF NOT EXISTS idx_units_najemce ON units(najemce_id);
CREATE INDEX IF NOT EXISTS idx_units_archived ON units(archived);

-- ----------------------------------------------------------------------------
-- STEP 4: Create or update triggers
-- ----------------------------------------------------------------------------

-- Function for automatic updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for properties
DROP TRIGGER IF EXISTS properties_updated_at ON properties;
CREATE TRIGGER properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for units
DROP TRIGGER IF EXISTS units_updated_at ON units;
CREATE TRIGGER units_updated_at
  BEFORE UPDATE ON units
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function for automatic unit count update
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

-- Trigger for unit count update
DROP TRIGGER IF EXISTS units_update_count ON units;
CREATE TRIGGER units_update_count
  AFTER INSERT OR UPDATE OR DELETE ON units
  FOR EACH ROW
  EXECUTE FUNCTION update_property_unit_count();

-- ----------------------------------------------------------------------------
-- STEP 5: Comments and documentation
-- ----------------------------------------------------------------------------

COMMENT ON TABLE properties IS 'Nemovitosti - budovy, objekty, pozemky';
COMMENT ON COLUMN properties.typ IS 'Typ nemovitosti (textové označení, např. bytovy_dum, rodinny_dum)';
COMMENT ON COLUMN properties.spravce IS 'Správce nemovitosti';
COMMENT ON COLUMN properties.pocet_podlazi IS 'Počet nadzemních podlaží';
COMMENT ON COLUMN properties.pocet_podzemních_podlazi IS 'Počet podzemních podlaží';
COMMENT ON COLUMN properties.vybaveni IS 'JSONB pole vybavení nemovitosti';
COMMENT ON COLUMN properties.pronajimatel_id IS 'Vazba na subjekt - pronajímatel';
COMMENT ON COLUMN properties.pocet_jednotek IS 'Počítaný sloupec - počet aktivních jednotek';

COMMENT ON TABLE units IS 'Jednotky nemovitostí (byty, kanceláře, garáže, atd.)';
COMMENT ON COLUMN units.nemovitost_id IS 'Vazba na nadřazenou nemovitost';
COMMENT ON COLUMN units.cislo_jednotky IS 'Označení jednotky (např. "2.3" nebo "A12")';
COMMENT ON COLUMN units.podlazi IS 'Podlaží, kde se jednotka nachází';
COMMENT ON COLUMN units.dispozice IS 'Dispozice jednotky (např. "2+kk", "3+1")';
COMMENT ON COLUMN units.najemce_id IS 'Vazba na subjekt - nájemce';
COMMENT ON COLUMN units.najemce IS 'Legacy: textové jméno nájemce (doporučeno používat najemce_id)';
COMMENT ON COLUMN units.vybaveni IS 'JSONB pole vybavení (např. ["internet", "klimatizace"])';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

SELECT 'Migration 002 completed successfully!' as status;
SELECT 'Tables updated: properties, units' as info;
SELECT 'Added missing columns, renamed columns for consistency, added constraints' as info;
