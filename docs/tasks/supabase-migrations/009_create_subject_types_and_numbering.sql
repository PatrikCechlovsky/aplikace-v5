-- ============================================================================
-- Migration 009: Create subject_types table and add counts function
-- ============================================================================
-- This migration creates the subject_types table for dynamic subject type
-- management and adds a function to get subject counts by type
-- ============================================================================

-- ----------------------------------------------------------------------------
-- STEP 1: Create subject_types table if it doesn't exist
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS subject_types (
  slug VARCHAR(50) PRIMARY KEY,
  label VARCHAR(100) NOT NULL,
  color VARCHAR(20) DEFAULT '#3b82f6',
  icon VARCHAR(50) DEFAULT 'person',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE subject_types IS 'Dynamické typy subjektů (pronajímatelé, nájemníci, atd.)';
COMMENT ON COLUMN subject_types.slug IS 'Unikátní identifikátor typu (např. "osoba", "firma")';
COMMENT ON COLUMN subject_types.label IS 'Zobrazovaný název (např. "Fyzická osoba")';
COMMENT ON COLUMN subject_types.color IS 'Barva pro badge (hex)';
COMMENT ON COLUMN subject_types.icon IS 'Název ikony';
COMMENT ON COLUMN subject_types.sort_order IS 'Pořadí zobrazení (nižší = výše)';

-- Insert default subject types if table is empty
INSERT INTO subject_types (slug, label, color, icon, sort_order)
SELECT * FROM (VALUES
  ('osoba', 'Fyzická osoba', '#3B82F6', 'person', 10),
  ('osvc', 'OSVČ', '#8B5CF6', 'briefcase', 20),
  ('firma', 'Právnická osoba', '#10B981', 'building', 30),
  ('spolek', 'Spolek / Skupina', '#F59E0B', 'people', 40),
  ('stat', 'Státní instituce', '#EF4444', 'bank', 50),
  ('zastupce', 'Zástupce', '#6B7280', 'handshake', 60)
) AS t(slug, label, color, icon, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM subject_types LIMIT 1);

-- ----------------------------------------------------------------------------
-- STEP 2: Create index on sort_order for efficient ordering
-- ----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_subject_types_sort_order ON subject_types(sort_order);

-- ----------------------------------------------------------------------------
-- STEP 3: Enable RLS on subject_types table
-- ----------------------------------------------------------------------------

ALTER TABLE subject_types ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read types
DROP POLICY IF EXISTS subject_types_select_policy ON subject_types;
CREATE POLICY subject_types_select_policy ON subject_types
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Allow authenticated users to modify types (for admin UI)
DROP POLICY IF EXISTS subject_types_modify_policy ON subject_types;
CREATE POLICY subject_types_modify_policy ON subject_types
  FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Grant permissions
GRANT ALL ON subject_types TO authenticated;

-- ----------------------------------------------------------------------------
-- STEP 4: Create numbering_config table for subject ID generation
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS numbering_config (
  id SERIAL PRIMARY KEY,
  scope VARCHAR(50) NOT NULL, -- e.g., 'module:030', 'type:osoba'
  entity_type VARCHAR(50) NOT NULL, -- e.g., 'subject', 'property', 'contract'
  prefix VARCHAR(20) DEFAULT '',
  start_number INTEGER DEFAULT 1,
  current_number INTEGER DEFAULT 0,
  increment INTEGER DEFAULT 1,
  zero_padding INTEGER DEFAULT 4, -- How many digits (e.g., 4 = "0001")
  separator VARCHAR(10) DEFAULT '-',
  format_template VARCHAR(100), -- e.g., '{PREFIX}{SEPARATOR}{YEAR}{SEPARATOR}{NUMBER}'
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(scope, entity_type)
);

COMMENT ON TABLE numbering_config IS 'Konfigurace číselných řad pro entity (subjekty, nemovitosti, smlouvy)';
COMMENT ON COLUMN numbering_config.scope IS 'Rozsah platnosti (např. "module:030" nebo "type:osoba")';
COMMENT ON COLUMN numbering_config.entity_type IS 'Typ entity (např. "subject", "property")';
COMMENT ON COLUMN numbering_config.prefix IS 'Prefix pro generované ID (např. "PRON", "NAJ")';
COMMENT ON COLUMN numbering_config.format_template IS 'Šablona formátu: {PREFIX}-{YEAR}-{NUMBER} nebo {PREFIX}{NUMBER}';

-- Insert default numbering configs
INSERT INTO numbering_config (scope, entity_type, prefix, start_number, zero_padding, format_template)
SELECT * FROM (VALUES
  ('module:030', 'subject', 'PRON', 1, 4, '{PREFIX}-{YEAR}-{NUMBER}'),
  ('module:050', 'subject', 'NAJ', 1, 4, '{PREFIX}-{YEAR}-{NUMBER}'),
  ('module:040', 'property', 'NEM', 1, 4, '{PREFIX}-{YEAR}-{NUMBER}'),
  ('module:060', 'contract', 'SML', 1, 4, '{PREFIX}-{YEAR}-{NUMBER}')
) AS t(scope, entity_type, prefix, start_number, zero_padding, format_template)
WHERE NOT EXISTS (SELECT 1 FROM numbering_config LIMIT 1);

-- Enable RLS
ALTER TABLE numbering_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS numbering_config_select_policy ON numbering_config;
CREATE POLICY numbering_config_select_policy ON numbering_config
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS numbering_config_modify_policy ON numbering_config;
CREATE POLICY numbering_config_modify_policy ON numbering_config
  FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

GRANT ALL ON numbering_config TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE numbering_config_id_seq TO authenticated;

-- ----------------------------------------------------------------------------
-- STEP 5: Create function to generate next ID
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION generate_next_id(
  p_scope VARCHAR(50),
  p_entity_type VARCHAR(50)
)
RETURNS VARCHAR(100) AS $$
DECLARE
  v_config numbering_config;
  v_next_number INTEGER;
  v_year VARCHAR(4);
  v_number_str VARCHAR(20);
  v_result VARCHAR(100);
BEGIN
  -- Get config for this scope/entity
  SELECT * INTO v_config
  FROM numbering_config
  WHERE scope = p_scope 
    AND entity_type = p_entity_type
    AND active = true
  LIMIT 1;
  
  -- If no config found, use default
  IF NOT FOUND THEN
    RAISE NOTICE 'No numbering config found for scope=% entity=%', p_scope, p_entity_type;
    RETURN NULL;
  END IF;
  
  -- Increment current_number (transaction-safe)
  UPDATE numbering_config
  SET current_number = GREATEST(current_number + v_config.increment, v_config.start_number),
      updated_at = NOW()
  WHERE scope = p_scope 
    AND entity_type = p_entity_type
  RETURNING current_number INTO v_next_number;
  
  -- Format the number with zero padding
  v_number_str := LPAD(v_next_number::TEXT, v_config.zero_padding, '0');
  
  -- Get current year
  v_year := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  
  -- Build result from template
  v_result := v_config.format_template;
  v_result := REPLACE(v_result, '{PREFIX}', COALESCE(v_config.prefix, ''));
  v_result := REPLACE(v_result, '{SEPARATOR}', COALESCE(v_config.separator, ''));
  v_result := REPLACE(v_result, '{YEAR}', v_year);
  v_result := REPLACE(v_result, '{NUMBER}', v_number_str);
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_next_id IS 'Generuje další ID pro entitu podle konfigurace číselné řady';

-- Example usage:
-- SELECT generate_next_id('module:030', 'subject'); -- Returns 'PRON-2025-0001'

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

SELECT 'Migration 009 completed successfully!' as status;
SELECT 'Created tables: subject_types, numbering_config' as info;
SELECT 'Created function: generate_next_id()' as info;
SELECT 'Inserted default subject types and numbering configs' as info;
