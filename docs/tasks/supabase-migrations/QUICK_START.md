# Quick Start Guide - Applying Migration 002

## Prerequisites

- Access to Supabase dashboard or database
- Database backup created
- 5-10 minutes of time

## Step-by-Step Instructions

### Option A: Using Supabase Dashboard (Recommended)

1. **Backup your database**
   ```
   Dashboard → Database → Backups → Create backup
   ```

2. **Open SQL Editor**
   ```
   Dashboard → SQL Editor → New query
   ```

3. **Load the migration**
   - Open file: `002_update_properties_and_units_schema.sql`
   - Copy all contents
   - Paste into SQL Editor

4. **Execute migration**
   - Click "Run" button
   - Wait for completion (usually < 5 seconds)
   - Check for success message

5. **Verify migration**
   - Open file: `test_migration_002.sql`
   - Copy all contents
   - Paste into SQL Editor
   - Click "Run" button
   - Verify all tests show ✓

### Option B: Using Supabase CLI

```bash
# 1. Make sure you're logged in
supabase login

# 2. Link to your project (if not already linked)
supabase link --project-ref your-project-ref

# 3. Run the migration
supabase db execute -f docs/tasks/supabase-migrations/002_update_properties_and_units_schema.sql

# 4. Verify the migration
supabase db execute -f docs/tasks/supabase-migrations/test_migration_002.sql
```

### Option C: Using psql

```bash
# 1. Connect to your database
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# 2. Run the migration
\i docs/tasks/supabase-migrations/002_update_properties_and_units_schema.sql

# 3. Run the test script
\i docs/tasks/supabase-migrations/test_migration_002.sql
```

## What Happens During Migration?

1. ✅ Checks for existing columns (non-destructive)
2. ✅ Adds missing columns with defaults
3. ✅ Renames columns while preserving data
4. ✅ Creates constraints for data validation
5. ✅ Adds indexes for performance
6. ✅ Creates/updates triggers for automation

## Expected Output

When successful, you should see:

```sql
Migration 002 completed successfully!
Tables updated: properties, units
Added missing columns, renamed columns for consistency, added constraints
```

## Troubleshooting

### Error: "column already exists"
**Solution**: This is expected if migration was run before. The migration is idempotent - safe to run multiple times.

### Error: "constraint violation"
**Solution**: Check if existing data violates new constraints. You may need to clean data first.

### Error: "permission denied"
**Solution**: Ensure you have proper database permissions. You need ALTER TABLE and CREATE INDEX privileges.

### Error: "foreign key constraint"
**Solution**: Ensure referenced tables (like `subjects`) exist before running migration.

## Post-Migration Checklist

- [ ] Verify all tests pass (run `test_migration_002.sql`)
- [ ] Check existing data is intact
- [ ] Test application functionality
- [ ] Update application code to use new column names
- [ ] Update API documentation
- [ ] Inform team of column name changes

## Column Name Changes to Update in Code

### Properties Table:
- `poznamka` → `poznamky`
- `pocet_nadzemních_podlazi` → `pocet_podlazi`

### Units Table:
- `oznaceni` → `cislo_jednotky`
- `datum_zacatku_najmu` → `datum_zahajeni_najmu`
- `datum_konce_najmu` → `datum_ukonceni_najmu`
- `poznamka` → `poznamky`

## Rollback Plan

If you need to rollback:

```sql
-- Rollback properties table
ALTER TABLE properties RENAME COLUMN poznamky TO poznamka;
ALTER TABLE properties RENAME COLUMN pocet_podlazi TO pocet_nadzemních_podlazi;
ALTER TABLE properties DROP COLUMN IF EXISTS popis;
ALTER TABLE properties DROP COLUMN IF EXISTS cislo_orientacni;
ALTER TABLE properties DROP COLUMN IF EXISTS kraj;
ALTER TABLE properties DROP COLUMN IF EXISTS celkova_plocha;
ALTER TABLE properties DROP COLUMN IF EXISTS prilohy;
-- ... etc

-- Rollback units table
ALTER TABLE units RENAME COLUMN cislo_jednotky TO oznaceni;
ALTER TABLE units RENAME COLUMN datum_zahajeni_najmu TO datum_zacatku_najmu;
ALTER TABLE units RENAME COLUMN datum_ukonceni_najmu TO datum_konce_najmu;
ALTER TABLE units RENAME COLUMN poznamky TO poznamka;
ALTER TABLE units DROP COLUMN IF EXISTS nazev;
ALTER TABLE units DROP COLUMN IF EXISTS popis;
-- ... etc
```

⚠️ **Warning**: Rollback will lose data in new columns!

## Getting Help

1. **Check logs**: Review Supabase logs for detailed error messages
2. **Test environment**: Always test in non-production first
3. **Documentation**: Read README.md and MIGRATION_SUMMARY.md
4. **Community**: Ask in Supabase Discord or GitHub issues

## Success Criteria

✅ Migration runs without errors  
✅ All test checks pass (✓ symbols)  
✅ Existing data is preserved  
✅ New columns are accessible  
✅ Application works with renamed columns  

## Next Steps After Successful Migration

1. Update application code to use new column names
2. Update database queries and ORM models
3. Update API documentation
4. Deploy updated application code
5. Monitor for any issues

## Timeline

- **Planning**: 10 minutes (read docs)
- **Backup**: 2 minutes
- **Migration**: < 1 minute (execution)
- **Testing**: 5 minutes
- **Code updates**: 30-60 minutes
- **Total**: ~1-2 hours

---

**Need help?** Check the full documentation in README.md or create an issue in the repository.
