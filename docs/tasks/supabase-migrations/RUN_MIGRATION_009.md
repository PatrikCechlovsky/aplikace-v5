# How to Run Migration 009

## Purpose
This migration creates the `subject_types` table for dynamic subject type management and the `numbering_config` table for automatic ID generation.

## What This Migration Does

1. **Creates `subject_types` table** with default types (osoba, osvc, firma, spolek, stat, zastupce)
2. **Creates `numbering_config` table** for configurable ID generation
3. **Creates `generate_next_id()` function** for automatic ID generation with template support
4. **Sets up RLS policies** for both new tables
5. **Inserts default configurations** for modules 030, 040, 050, 060

## Prerequisites

- Access to Supabase SQL Editor
- Admin/Owner role in the Supabase project
- **Migration 008 should be run first** (creates units fixes)

## Steps to Run

### Option 1: Via Supabase Dashboard (Recommended)

1. Log in to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the entire content of `009_create_subject_types_and_numbering.sql`
5. Paste into the editor
6. Click **Run** button
7. Check the messages panel for success/warnings

### Option 2: Via Supabase CLI

```bash
supabase db execute -f docs/tasks/supabase-migrations/009_create_subject_types_and_numbering.sql
```

### Option 3: Via psql

```bash
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres" \
  -f docs/tasks/supabase-migrations/009_create_subject_types_and_numbering.sql
```

## Verification

After running the migration, verify the changes:

### 1. Check Tables Exist

```sql
-- Check subject_types table
SELECT * FROM subject_types ORDER BY sort_order;

-- Expected: 6 rows (osoba, osvc, firma, spolek, stat, zastupce)

-- Check numbering_config table
SELECT * FROM numbering_config ORDER BY scope;

-- Expected: 4 rows (module:030, :040, :050, :060)
```

### 2. Test ID Generation Function

```sql
-- Generate a test ID for module 030
SELECT generate_next_id('module:030', 'subject');

-- Expected: Something like 'PRON-2025-0001'

-- Generate another to verify increment
SELECT generate_next_id('module:030', 'subject');

-- Expected: 'PRON-2025-0002'

-- Check the config was updated
SELECT current_number, updated_at 
FROM numbering_config 
WHERE scope = 'module:030' AND entity_type = 'subject';

-- Expected: current_number = 2
```

### 3. Test Subject Types CRUD

```sql
-- List types
SELECT * FROM subject_types;

-- Insert a new type
INSERT INTO subject_types (slug, label, color, icon, sort_order)
VALUES ('test_type', 'Test Type', '#FF5733', 'test', 100);

-- Update a type
UPDATE subject_types 
SET label = 'Updated Label'
WHERE slug = 'test_type';

-- Delete test type
DELETE FROM subject_types WHERE slug = 'test_type';
```

## Using the Generate ID Function

The `generate_next_id()` function can be used in application code or triggers:

### In Application Code (JavaScript)

```javascript
// Using Supabase RPC
const { data, error } = await supabase.rpc('generate_next_id', {
  p_scope: 'module:030',
  p_entity_type: 'subject'
});

console.log(data); // 'PRON-2025-0001'
```

### In a Trigger

```sql
CREATE OR REPLACE FUNCTION auto_generate_subject_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.custom_id IS NULL THEN
    NEW.custom_id := generate_next_id('module:030', 'subject');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER subjects_auto_id
  BEFORE INSERT ON subjects
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_subject_id();
```

## Configuration Templates

The `numbering_config` table supports flexible ID generation using templates:

### Default Templates

| Module | Entity | Template | Example Output |
|--------|--------|----------|----------------|
| 030 | subject | `{PREFIX}-{YEAR}-{NUMBER}` | `PRON-2025-0001` |
| 050 | subject | `{PREFIX}-{YEAR}-{NUMBER}` | `NAJ-2025-0001` |
| 040 | property | `{PREFIX}-{YEAR}-{NUMBER}` | `NEM-2025-0001` |
| 060 | contract | `{PREFIX}-{YEAR}-{NUMBER}` | `SML-2025-0001` |

### Custom Templates

You can create custom templates by inserting new configs:

```sql
-- Example: Simple sequential numbering without year
INSERT INTO numbering_config (scope, entity_type, prefix, start_number, zero_padding, format_template)
VALUES ('type:osoba', 'subject', 'FO', 1, 5, '{PREFIX}{NUMBER}');
-- Generates: FO00001, FO00002, etc.

-- Example: With custom separator
INSERT INTO numbering_config (scope, entity_type, prefix, separator, start_number, zero_padding, format_template)
VALUES ('type:firma', 'subject', 'PO', '/', 1000, 4, '{PREFIX}{SEPARATOR}{NUMBER}');
-- Generates: PO/1000, PO/1001, etc.
```

## Rollback (If Needed)

```sql
-- Drop tables (CAUTION: Deletes all data!)
DROP TABLE IF EXISTS subject_types CASCADE;
DROP TABLE IF EXISTS numbering_config CASCADE;

-- Drop function
DROP FUNCTION IF EXISTS generate_next_id(VARCHAR, VARCHAR);

-- Drop sequence
DROP SEQUENCE IF EXISTS numbering_config_id_seq;
```

**⚠️ Warning:** Rollback will delete all custom subject types and numbering configurations!

## Troubleshooting

### Error: "relation 'subject_types' already exists"
- The migration has already been run
- Check if table has correct structure: `\d subject_types`
- You can safely skip the CREATE TABLE part

### Error: "function generate_next_id already exists"
- The function has already been created
- You can use `CREATE OR REPLACE FUNCTION` to update it

### ID Generation Returns NULL
- Check if configuration exists:
  ```sql
  SELECT * FROM numbering_config 
  WHERE scope = 'module:030' AND entity_type = 'subject';
  ```
- Ensure `active = true` in the config
- Check function logs for errors

### IDs Skipping Numbers
- This is normal - the function increments `current_number` atomically
- If transaction rolls back, the number is "consumed" but not used
- This ensures uniqueness even under concurrent operations

## Integration with Application

After running this migration, the application will:

1. ✅ Load subject types dynamically from `subject_types` table
2. ✅ Show only types with counts > 0 in sidebar
3. ✅ Allow admins to manage types via UI (`#/m/030-pronajimatel/f/subject-type`)
4. 🔄 Automatically generate IDs when creating subjects (requires code update)

### To Enable Auto ID Generation

Add this to `upsertSubject` function in `src/db/subjects.js`:

```javascript
// Before inserting new subject
if (!payload.id && !payload.custom_id) {
  const { data: generatedId } = await supabase.rpc('generate_next_id', {
    p_scope: 'module:030', // or determine from context
    p_entity_type: 'subject'
  });
  payload.custom_id = generatedId;
}
```

## Next Steps

1. ✅ Migration applied successfully
2. 🔄 Restart your application
3. 🧪 Test subject type management UI
4. ✅ Verify sidebar loads types from database
5. 🔧 Implement auto ID generation in application code

## Related Files

- Migration: `docs/tasks/supabase-migrations/009_create_subject_types_and_numbering.sql`
- Database Module: `src/db/subjects.js`
- Module Config: `src/modules/030-pronajimatel/module.config.js`
- Type Management UI: `src/modules/030-pronajimatel/forms/subject-type.js`

## Questions?

If you encounter any issues, check:
- Supabase logs (Dashboard → Logs)
- Application console errors
- Database schema: `\d subject_types` and `\d numbering_config`
- Function definition: `\df generate_next_id`
