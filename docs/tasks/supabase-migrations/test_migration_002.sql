-- ============================================================================
-- Test Script for Migration 002
-- ============================================================================
-- This script verifies that the migration is idempotent and works correctly
-- Run this AFTER running 002_update_properties_and_units_schema.sql
-- ============================================================================

\echo 'Testing Migration 002...'
\echo ''

-- Test 1: Verify properties table structure
\echo '=== Test 1: Properties Table Structure ==='
SELECT 
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'properties'
ORDER BY ordinal_position;

\echo ''
\echo '=== Test 2: Units Table Structure ==='
SELECT 
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'units'
ORDER BY ordinal_position;

\echo ''
\echo '=== Test 3: Check Constraints ==='
SELECT 
  constraint_name,
  constraint_type
FROM information_schema.table_constraints
WHERE table_name IN ('properties', 'units')
ORDER BY table_name, constraint_type, constraint_name;

\echo ''
\echo '=== Test 4: Check Indexes ==='
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename IN ('properties', 'units')
ORDER BY tablename, indexname;

\echo ''
\echo '=== Test 5: Check Triggers ==='
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table IN ('properties', 'units')
ORDER BY event_object_table, trigger_name;

\echo ''
\echo '=== Test 6: Check Functions ==='
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines
WHERE routine_name IN ('update_updated_at_column', 'update_property_unit_count')
ORDER BY routine_name;

\echo ''
\echo '=== Test 7: Verify Key Columns Exist ==='
\echo 'Properties table key columns:'
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'popis') THEN '✓ popis exists'
    ELSE '✗ popis missing'
  END as check_popis,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'cislo_orientacni') THEN '✓ cislo_orientacni exists'
    ELSE '✗ cislo_orientacni missing'
  END as check_cislo_orientacni,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'kraj') THEN '✓ kraj exists'
    ELSE '✗ kraj missing'
  END as check_kraj,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'celkova_plocha') THEN '✓ celkova_plocha exists'
    ELSE '✗ celkova_plocha missing'
  END as check_celkova_plocha,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'prilohy') THEN '✓ prilohy exists'
    ELSE '✗ prilohy missing'
  END as check_prilohy,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'poznamky') THEN '✓ poznamky exists'
    ELSE '✗ poznamky missing'
  END as check_poznamky,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'spravce') THEN '✓ spravce preserved'
    ELSE '✗ spravce missing'
  END as check_spravce,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'pocet_podzemních_podlazi') THEN '✓ pocet_podzemních_podlazi preserved'
    ELSE '✗ pocet_podzemních_podlazi missing'
  END as check_podzemni;

\echo ''
\echo 'Units table key columns:'
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'units' AND column_name = 'nazev') THEN '✓ nazev exists'
    ELSE '✗ nazev missing'
  END as check_nazev,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'units' AND column_name = 'popis') THEN '✓ popis exists'
    ELSE '✗ popis missing'
  END as check_popis,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'units' AND column_name = 'cislo_jednotky') THEN '✓ cislo_jednotky exists'
    ELSE '✗ cislo_jednotky missing'
  END as check_cislo_jednotky,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'units' AND column_name = 'vybaveni') THEN '✓ vybaveni exists'
    ELSE '✗ vybaveni missing'
  END as check_vybaveni,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'units' AND column_name = 'kauce') THEN '✓ kauce exists'
    ELSE '✗ kauce missing'
  END as check_kauce,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'units' AND column_name = 'datum_zahajeni_najmu') THEN '✓ datum_zahajeni_najmu exists'
    ELSE '✗ datum_zahajeni_najmu missing'
  END as check_datum_zahajeni,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'units' AND column_name = 'podlazi') THEN '✓ podlazi preserved'
    ELSE '✗ podlazi missing'
  END as check_podlazi,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'units' AND column_name = 'dispozice') THEN '✓ dispozice preserved'
    ELSE '✗ dispozice missing'
  END as check_dispozice;

\echo ''
\echo '=== Test 8: Test Idempotency ==='
\echo 'Running migration again to verify idempotency...'
\echo '(This should complete without errors)'

-- Re-run key parts of the migration
DO $$ 
BEGIN
  -- This should not fail even if column already exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'properties' AND column_name = 'popis') THEN
    ALTER TABLE properties ADD COLUMN popis TEXT;
    RAISE NOTICE '✓ Added popis column';
  ELSE
    RAISE NOTICE '✓ popis column already exists (OK)';
  END IF;
END $$;

\echo ''
\echo '=== Test Complete ==='
\echo 'If all tests show ✓, the migration was successful!'
