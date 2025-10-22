# Supabase Migration Scripts

## Overview

This directory contains SQL migration scripts to align the Supabase database schema with the application's data model for properties and units.

## Files

- `table-supabase.js` - Current Supabase schema export (JSON format)
- `001_create_properties_and_units.sql` - Original migration (DEPRECATED - do not use)
- `002_update_properties_and_units_schema.sql` - **NEW: Updated migration that respects existing data**

## Migration 002: Schema Update

### What does this migration do?

This migration updates the existing `properties` and `units` tables to align with the new data model while **preserving all existing data** and respecting column names already in use.

### Properties Table Changes

#### New Columns Added:
- `popis` (TEXT) - Property description
- `cislo_orientacni` (VARCHAR(20)) - Orientation number
- `kraj` (VARCHAR(100)) - Region
- `celkova_plocha` (DECIMAL(10,2)) - Total area in m²
- `prilohy` (JSONB) - Attachments array
- `archived_by` (UUID) - User who archived
- `created_by` (UUID) - User who created
- `updated_by` (UUID) - User who last updated

#### Columns Renamed:
- `poznamka` → `poznamky` (to match naming convention)
- `pocet_nadzemních_podlazi` → `pocet_podlazi` (simplified name)

#### Existing Columns Preserved:
- `typ` - Property type (text field)
- `spravce` - Property manager
- `pocet_podzemních_podlazi` - Number of underground floors
- `vybaveni` - Equipment/amenities (JSONB)

### Units Table Changes

#### New Columns Added:
- `nazev` (VARCHAR(255)) - Unit name/label
- `popis` (TEXT) - Unit description
- `vybaveni` (JSONB) - Unit equipment/amenities
- `kauce` (DECIMAL(10,2)) - Security deposit amount
- `prilohy` (JSONB) - Attachments array
- `archived_by` (UUID) - User who archived
- `created_by` (UUID) - User who created
- `updated_by` (UUID) - User who last updated

#### Columns Renamed:
- `oznaceni` → `cislo_jednotky` (unit number/designation)
- `datum_zacatku_najmu` → `datum_zahajeni_najmu` (lease start date)
- `datum_konce_najmu` → `datum_ukonceni_najmu` (lease end date)
- `poznamka` → `poznamky` (to match naming convention)

#### Existing Columns Preserved:
- `podlazi` - Floor number
- `dispozice` - Unit layout (e.g., "2+kk", "3+1")
- `najemce` - Legacy tenant name field (text)

### Key Features

1. **Idempotent**: Can be run multiple times safely
2. **Data Preservation**: All existing data is preserved
3. **Backward Compatible**: Legacy columns are kept for compatibility
4. **Constraint Validation**: Adds CHECK constraints for data integrity
5. **Automatic Triggers**: Updates `updated_at` and `pocet_jednotek` automatically
6. **Indexed**: Creates indexes for optimal query performance

## How to Use

### Option 1: Run via Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `002_update_properties_and_units_schema.sql`
4. Paste into the SQL editor
5. Click "Run" to execute

### Option 2: Run via Command Line

```bash
# Using Supabase CLI
supabase db execute -f docs/tasks/supabase-migrations/002_update_properties_and_units_schema.sql

# Or using psql directly
psql -U postgres -d your_database -f docs/tasks/supabase-migrations/002_update_properties_and_units_schema.sql
```

## Column Mapping Reference

### Properties Table

| Supabase Column | New/Renamed Column | Type | Notes |
|----------------|-------------------|------|-------|
| `typ` | (kept as is) | text | Property type |
| `spravce` | (kept as is) | varchar(255) | Manager name |
| `pocet_nadzemních_podlazi` | `pocet_podlazi` | integer | Renamed for simplicity |
| `pocet_podzemních_podlazi` | (kept as is) | integer | Underground floors |
| `vybaveni` | (kept as is) | jsonb | Equipment array |
| `poznamka` | `poznamky` | text | Renamed for consistency |
| - | `popis` | text | NEW: Description |
| - | `cislo_orientacni` | varchar(20) | NEW: Orientation number |
| - | `kraj` | varchar(100) | NEW: Region |
| - | `celkova_plocha` | decimal(10,2) | NEW: Total area |
| - | `prilohy` | jsonb | NEW: Attachments |
| - | `archived_by` | uuid | NEW: Audit field |
| - | `created_by` | uuid | NEW: Audit field |
| - | `updated_by` | uuid | NEW: Audit field |

### Units Table

| Supabase Column | New/Renamed Column | Type | Notes |
|----------------|-------------------|------|-------|
| `oznaceni` | `cislo_jednotky` | varchar(50) | Renamed for clarity |
| `podlazi` | (kept as is) | varchar(20) | Floor number |
| `dispozice` | (kept as is) | varchar(20) | Unit layout |
| `najemce` | (kept as is) | varchar(255) | Legacy tenant name |
| `datum_zacatku_najmu` | `datum_zahajeni_najmu` | date | Renamed for consistency |
| `datum_konce_najmu` | `datum_ukonceni_najmu` | date | Renamed for consistency |
| `poznamka` | `poznamky` | text | Renamed for consistency |
| - | `nazev` | varchar(255) | NEW: Unit name |
| - | `popis` | text | NEW: Description |
| - | `vybaveni` | jsonb | NEW: Equipment array |
| - | `kauce` | decimal(10,2) | NEW: Security deposit |
| - | `prilohy` | jsonb | NEW: Attachments |
| - | `archived_by` | uuid | NEW: Audit field |
| - | `created_by` | uuid | NEW: Audit field |
| - | `updated_by` | uuid | NEW: Audit field |

## Important Notes

### Data Type Considerations

- **Property Type (`typ`)**: Currently stored as `text` instead of ENUM. The migration preserves this for compatibility. Consider migrating to ENUM in a future update if needed.
- **Unit Status (`stav`)**: Currently stored as `varchar(20)` instead of ENUM. Same as above.
- **JSONB Fields**: `vybaveni`, `prilohy` - Store arrays or objects as needed.

### Legacy Fields

These fields are kept for backward compatibility but consider using the new alternatives:

- `units.najemce` (text) → Use `units.najemce_id` (UUID) instead
- Consider deprecating in future versions

### Constraints Added

1. **Properties**:
   - `rok_vystavby` must be between 1800 and current year
   - `rok_rekonstrukce` must be >= `rok_vystavby`
   - `celkova_plocha` must be >= 0

2. **Units**:
   - `plocha` must be >= 0
   - `pocet_mistnosti` must be >= 0
   - `mesicni_najem` must be >= 0
   - `kauce` must be >= 0
   - `datum_ukonceni_najmu` must be >= `datum_zahajeni_najmu`

## Testing

After running the migration, verify the changes:

```sql
-- Check properties table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'properties'
ORDER BY ordinal_position;

-- Check units table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'units'
ORDER BY ordinal_position;

-- Verify triggers
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE event_object_table IN ('properties', 'units');

-- Verify constraints
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name IN ('properties', 'units');
```

## Rollback

If you need to rollback the changes, you can:

1. Rename columns back to original names
2. Drop newly added columns
3. Drop added constraints

However, **this is not recommended** as it may cause data loss for newly added fields.

## Future Enhancements

Consider these improvements for future migrations:

1. Migrate `typ` and `stav` to ENUM types for better type safety
2. Add foreign key constraints to audit fields (`created_by`, `updated_by`, etc.)
3. Create views for easier data access
4. Add RLS (Row Level Security) policies
5. Deprecate and remove legacy fields

## Support

For issues or questions, please create an issue in the repository.
