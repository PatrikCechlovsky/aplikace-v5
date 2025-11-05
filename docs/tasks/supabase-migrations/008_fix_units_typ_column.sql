-- ============================================================================
-- Migration 008: Fix units table column names and add type tables
-- ============================================================================
-- This migration fixes the column naming inconsistency in units table
-- and creates the dynamic type tables for properties and units
-- ============================================================================

-- ----------------------------------------------------------------------------
-- STEP 1: Rename 'typ' to 'typ_jednotky' in units table
-- ----------------------------------------------------------------------------

DO $$
BEGIN
  -- Check if 'typ' column exists and 'typ_jednotky' does not
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'units' AND column_name = 'typ'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'units' AND column_name = 'typ_jednotky'
  ) THEN
    ALTER TABLE units RENAME COLUMN typ TO typ_jednotky;
    RAISE NOTICE 'Column units.typ renamed to units.typ_jednotky';
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'units' AND column_name = 'typ_jednotky'
  ) THEN
    RAISE NOTICE 'Column units.typ_jednotky already exists, skipping rename';
  ELSE
    RAISE NOTICE 'Column units.typ does not exist, adding typ_jednotky';
    -- If neither exists, add typ_jednotky as VARCHAR
    ALTER TABLE units ADD COLUMN typ_jednotky VARCHAR(50);
  END IF;
END $$;

-- Update the column type to VARCHAR if it was ENUM
DO $$
BEGIN
  -- Check if typ_jednotky is an ENUM and convert to VARCHAR
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'units' 
    AND column_name = 'typ_jednotky'
    AND udt_name = 'unit_type'
  ) THEN
    -- Convert ENUM values to VARCHAR
    ALTER TABLE units 
      ALTER COLUMN typ_jednotky TYPE VARCHAR(50) USING typ_jednotky::text;
    RAISE NOTICE 'Converted units.typ_jednotky from ENUM to VARCHAR(50)';
  END IF;
END $$;

-- Update index name if needed
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_units_typ') THEN
    DROP INDEX IF EXISTS idx_units_typ;
    CREATE INDEX IF NOT EXISTS idx_units_typ_jednotky ON units(typ_jednotky);
    RAISE NOTICE 'Recreated index as idx_units_typ_jednotky';
  ELSIF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_units_typ_jednotky') THEN
    CREATE INDEX idx_units_typ_jednotky ON units(typ_jednotky);
    RAISE NOTICE 'Created index idx_units_typ_jednotky';
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- STEP 2: Rename 'cislo_jednotky' back to 'oznaceni' (code uses 'oznaceni')
-- ----------------------------------------------------------------------------

DO $$
BEGIN
  -- Check if 'cislo_jednotky' exists and 'oznaceni' does not
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'units' AND column_name = 'cislo_jednotky'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'units' AND column_name = 'oznaceni'
  ) THEN
    ALTER TABLE units RENAME COLUMN cislo_jednotky TO oznaceni;
    RAISE NOTICE 'Column units.cislo_jednotky renamed to units.oznaceni';
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'units' AND column_name = 'oznaceni'
  ) THEN
    RAISE NOTICE 'Column units.oznaceni already exists, skipping rename';
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- STEP 3: Ensure required columns exist in units table
-- ----------------------------------------------------------------------------

DO $$
BEGIN
  -- Add plocha_celkem if it doesn't exist (code uses this)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'units' AND column_name = 'plocha_celkem'
  ) THEN
    -- Check if 'plocha' exists, if so, copy it
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'units' AND column_name = 'plocha'
    ) THEN
      ALTER TABLE units ADD COLUMN plocha_celkem DECIMAL(10,2);
      UPDATE units SET plocha_celkem = plocha WHERE plocha IS NOT NULL;
      RAISE NOTICE 'Added plocha_celkem column and copied from plocha';
    ELSE
      ALTER TABLE units ADD COLUMN plocha_celkem DECIMAL(10,2);
      RAISE NOTICE 'Added plocha_celkem column';
    END IF;
  END IF;

  -- Ensure dispozice column exists (code uses this)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'units' AND column_name = 'dispozice'
  ) THEN
    ALTER TABLE units ADD COLUMN dispozice VARCHAR(20);
    RAISE NOTICE 'Added dispozice column';
  END IF;

  -- Ensure podlazi column exists (code uses this)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'units' AND column_name = 'podlazi'
  ) THEN
    ALTER TABLE units ADD COLUMN podlazi VARCHAR(20);
    RAISE NOTICE 'Added podlazi column';
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- STEP 4: Create property_types table if it doesn't exist
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS property_types (
  slug VARCHAR(50) PRIMARY KEY,
  label VARCHAR(100) NOT NULL,
  color VARCHAR(20) DEFAULT '#3b82f6',
  icon VARCHAR(50) DEFAULT 'building',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE property_types IS 'Dynamické typy nemovitostí';
COMMENT ON COLUMN property_types.slug IS 'Unikátní identifikátor typu (např. "bytovy_dum")';
COMMENT ON COLUMN property_types.label IS 'Zobrazovaný název (např. "Bytový dům")';
COMMENT ON COLUMN property_types.color IS 'Barva pro badge (hex)';
COMMENT ON COLUMN property_types.icon IS 'Název ikony';

-- Insert default property types if table is empty
INSERT INTO property_types (slug, label, color, icon)
SELECT * FROM (VALUES
  ('bytovy_dum', 'Bytový dům', '#3b82f6', 'building'),
  ('rodinny_dum', 'Rodinný dům', '#10b981', 'home'),
  ('admin_budova', 'Administrativní budova', '#8b5cf6', 'office'),
  ('prumyslovy_objekt', 'Průmyslový objekt', '#f59e0b', 'factory'),
  ('pozemek', 'Pozemek', '#22c55e', 'terrain'),
  ('jiny_objekt', 'Jiný objekt', '#6b7280', 'location')
) AS t(slug, label, color, icon)
WHERE NOT EXISTS (SELECT 1 FROM property_types LIMIT 1);

-- ----------------------------------------------------------------------------
-- STEP 5: Create unit_types table if it doesn't exist
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS unit_types (
  slug VARCHAR(50) PRIMARY KEY,
  label VARCHAR(100) NOT NULL,
  color VARCHAR(20) DEFAULT '#3b82f6',
  icon VARCHAR(50) DEFAULT 'home',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE unit_types IS 'Dynamické typy jednotek';
COMMENT ON COLUMN unit_types.slug IS 'Unikátní identifikátor typu (např. "byt")';
COMMENT ON COLUMN unit_types.label IS 'Zobrazovaný název (např. "Byt")';
COMMENT ON COLUMN unit_types.color IS 'Barva pro badge (hex)';
COMMENT ON COLUMN unit_types.icon IS 'Název ikony';

-- Insert default unit types if table is empty
INSERT INTO unit_types (slug, label, color, icon)
SELECT * FROM (VALUES
  ('byt', 'Byt', '#3b82f6', 'home'),
  ('kancelar', 'Kancelář', '#8b5cf6', 'desk'),
  ('obchod', 'Obchodní prostor', '#f59e0b', 'store'),
  ('sklad', 'Sklad', '#6b7280', 'warehouse'),
  ('garaz', 'Garáž/Parking', '#ef4444', 'car'),
  ('sklep', 'Sklep', '#78716c', 'basement'),
  ('puda', 'Půda', '#a3a3a3', 'attic'),
  ('jina_jednotka', 'Jiná jednotka', '#9ca3af', 'location')
) AS t(slug, label, color, icon)
WHERE NOT EXISTS (SELECT 1 FROM unit_types LIMIT 1);

-- ----------------------------------------------------------------------------
-- STEP 6: Update typ_nemovitosti column if needed
-- ----------------------------------------------------------------------------

DO $$
BEGIN
  -- Check if typ_nemovitosti is ENUM and convert to VARCHAR
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'properties' 
    AND column_name = 'typ_nemovitosti'
    AND udt_name = 'property_type'
  ) THEN
    -- Convert ENUM values to VARCHAR
    ALTER TABLE properties 
      ALTER COLUMN typ_nemovitosti TYPE VARCHAR(50) USING typ_nemovitosti::text;
    RAISE NOTICE 'Converted properties.typ_nemovitosti from ENUM to VARCHAR(50)';
  ELSIF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'properties' AND column_name = 'typ_nemovitosti'
  ) THEN
    ALTER TABLE properties ADD COLUMN typ_nemovitosti VARCHAR(50);
    RAISE NOTICE 'Added typ_nemovitosti column to properties';
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- STEP 7: Enable RLS on new tables
-- ----------------------------------------------------------------------------

ALTER TABLE property_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE unit_types ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read types
DROP POLICY IF EXISTS property_types_select_policy ON property_types;
CREATE POLICY property_types_select_policy ON property_types
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS unit_types_select_policy ON unit_types;
CREATE POLICY unit_types_select_policy ON unit_types
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Allow authenticated users to insert/update/delete types (for admin UI)
DROP POLICY IF EXISTS property_types_modify_policy ON property_types;
CREATE POLICY property_types_modify_policy ON property_types
  FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS unit_types_modify_policy ON unit_types;
CREATE POLICY unit_types_modify_policy ON unit_types
  FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Grant permissions
GRANT ALL ON property_types TO authenticated;
GRANT ALL ON unit_types TO authenticated;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

SELECT 'Migration 008 completed successfully!' as status;
SELECT 'Fixed column names: typ -> typ_jednotky, cislo_jednotky -> oznaceni' as info;
SELECT 'Created tables: property_types, unit_types with default values' as info;
SELECT 'Converted ENUM types to VARCHAR for flexibility' as info;
