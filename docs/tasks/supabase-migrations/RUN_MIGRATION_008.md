# How to Run Migration 008

## Purpose
This migration fixes the column naming inconsistency in the `units` table and creates dynamic type tables for properties and units.

## What This Migration Does

1. **Renames `typ` to `typ_jednotky`** in the units table (to match the code)
2. **Renames `cislo_jednotky` back to `oznaceni`** (to match the code)
3. **Adds missing columns** to units table: `plocha_celkem`, `dispozice`, `podlazi`
4. **Creates `property_types` table** with default types
5. **Creates `unit_types` table** with default types
6. **Converts ENUM columns to VARCHAR** for flexibility
7. **Sets up RLS policies** for the new tables

## Prerequisites

- Access to Supabase SQL Editor
- Admin/Owner role in the Supabase project

## Steps to Run

### Option 1: Via Supabase Dashboard (Recommended)

1. Log in to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the entire content of `008_fix_units_typ_column.sql`
5. Paste into the editor
6. Click **Run** button
7. Check the messages panel for success/warnings

### Option 2: Via Supabase CLI

```bash
# If you have Supabase CLI installed
supabase db execute -f docs/tasks/supabase-migrations/008_fix_units_typ_column.sql
```

### Option 3: Via psql (Direct PostgreSQL Connection)

```bash
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres" \
  -f docs/tasks/supabase-migrations/008_fix_units_typ_column.sql
```

## Verification

After running the migration, verify the changes:

### 1. Check Column Names

```sql
-- Should show typ_jednotky (not typ)
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'units' 
AND column_name IN ('typ_jednotky', 'oznaceni', 'plocha_celkem', 'dispozice', 'podlazi');
```

Expected result: All 5 columns should exist.

### 2. Check Type Tables

```sql
-- Check property_types
SELECT * FROM property_types;

-- Check unit_types  
SELECT * FROM unit_types;
```

Expected result: Each table should have multiple rows with default types.

### 3. Test a Query

```sql
-- Should work without errors
SELECT id, typ_jednotky, oznaceni, plocha_celkem 
FROM units 
LIMIT 5;
```

## Rollback (If Needed)

If you need to rollback this migration:

```sql
-- Rename columns back
ALTER TABLE units RENAME COLUMN typ_jednotky TO typ;
ALTER TABLE units RENAME COLUMN oznaceni TO cislo_jednotky;

-- Drop type tables (CAUTION: This will delete data!)
DROP TABLE IF EXISTS property_types CASCADE;
DROP TABLE IF EXISTS unit_types CASCADE;

-- Remove added columns
ALTER TABLE units DROP COLUMN IF EXISTS plocha_celkem;
ALTER TABLE units DROP COLUMN IF EXISTS dispozice;
ALTER TABLE units DROP COLUMN IF EXISTS podlazi;
```

**⚠️ Warning:** Rollback will delete all custom types added to `property_types` and `unit_types` tables!

## Troubleshooting

### Error: "column 'typ' does not exist"
- The migration has already been run, or the column was named differently
- Verify current schema with: `\d units` (in psql)

### Error: "relation 'property_types' already exists"
- The tables already exist
- Check if they have the correct structure
- You can safely skip the table creation part

### Error: Permission denied
- Ensure you're running as a user with sufficient privileges
- Contact your Supabase project admin

## Impact

### Breaking Changes
- ❌ **None** - This migration only fixes naming to match existing code

### Non-Breaking Changes
- ✅ Adds new columns (nullable, so existing rows unaffected)
- ✅ Renames columns to match code expectations
- ✅ Creates new type tables for dynamic configuration

### Performance Impact
- Minimal - indexes are maintained/recreated
- No data transformation or complex operations

## Related Files

- Migration: `docs/tasks/supabase-migrations/008_fix_units_typ_column.sql`
- Database Module: `src/modules/040-nemovitost/db.js`
- Units Tile: `src/modules/040-nemovitost/tiles/unit-prehled.js`
- Module Config: `src/modules/040-nemovitost/module.config.js`

## Next Steps After Migration

1. ✅ Migration applied successfully
2. 🔄 Restart your application (if running)
3. 🧪 Test the Units Overview page
4. ✅ Verify sidebar shows types with counts
5. ✅ Verify common action buttons work

## Questions?

If you encounter any issues, check:
- Supabase logs (Dashboard → Logs)
- Application console errors
- Database schema: `\d units` and `\d properties`
