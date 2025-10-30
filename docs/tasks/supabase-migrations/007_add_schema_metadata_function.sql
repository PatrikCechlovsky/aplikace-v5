-- ============================================================================
-- Migration 007: Add metadata helper function for dynamic form generation
-- ============================================================================
-- This migration adds a helper function to query table schema information
-- Used by the metadata loader to dynamically generate form fields
-- OPTIONAL: Forms work without this, using static metadata from meta.js files
-- ============================================================================

-- Function to get table column information
CREATE OR REPLACE FUNCTION get_table_columns(
  p_table_name text,
  p_schema_name text DEFAULT 'public'
)
RETURNS TABLE (
  column_name text,
  data_type text,
  is_nullable text,
  column_default text,
  ordinal_position integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.column_name::text,
    c.data_type::text,
    c.is_nullable::text,
    c.column_default::text,
    c.ordinal_position::integer
  FROM information_schema.columns c
  WHERE c.table_schema = p_schema_name
    AND c.table_name = p_table_name
  ORDER BY c.ordinal_position;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_table_columns(text, text) TO authenticated;

-- Comment
COMMENT ON FUNCTION get_table_columns IS 'Returns column metadata for a table - used by dynamic form generator';

-- ============================================================================
-- Test the function
-- ============================================================================
-- SELECT * FROM get_table_columns('contracts', 'public');
-- SELECT * FROM get_table_columns('service_definitions', 'public');
-- SELECT * FROM get_table_columns('payments', 'public');

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
SELECT 'Migration 007 completed: schema metadata function created' as status;
