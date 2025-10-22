# Schema Migration Summary

## Visual Comparison: Before and After

### Properties Table

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         PROPERTIES TABLE                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  EXISTING COLUMNS (Preserved):                                           │
│  ✓ id                    uuid                                            │
│  ✓ typ                   text           (maps to typ_nemovitosti)        │
│  ✓ nazev                 varchar(255)                                    │
│  ✓ pocet_jednotek        integer                                         │
│  ✓ pronajimatel_id       uuid                                            │
│  ✓ spravce               varchar(255)   [PRESERVED]                      │
│  ✓ ulice                 varchar(255)                                    │
│  ✓ cislo_popisne         varchar(20)                                     │
│  ✓ mesto                 varchar(255)                                    │
│  ✓ psc                   varchar(10)                                     │
│  ✓ stat                  varchar(100)                                    │
│  ✓ pocet_podlazi         integer        [RENAMED from nadzemních]        │
│  ✓ pocet_podzemních_...  integer        [PRESERVED]                      │
│  ✓ rok_vystavby          integer                                         │
│  ✓ rok_rekonstrukce      integer                                         │
│  ✓ vybaveni              jsonb          [PRESERVED]                      │
│  ✓ poznamky              text           [RENAMED from poznamka]          │
│  ✓ archived              boolean                                         │
│  ✓ archived_at           timestamptz                                     │
│  ✓ created_at            timestamptz                                     │
│  ✓ updated_at            timestamptz                                     │
│                                                                           │
│  NEW COLUMNS (Added):                                                    │
│  ⊕ popis                 text           Description                      │
│  ⊕ cislo_orientacni      varchar(20)    Orientation number               │
│  ⊕ kraj                  varchar(100)   Region                           │
│  ⊕ celkova_plocha        decimal(10,2)  Total area in m²                 │
│  ⊕ prilohy               jsonb          Attachments array                │
│  ⊕ archived_by           uuid           Who archived                     │
│  ⊕ created_by            uuid           Who created                      │
│  ⊕ updated_by            uuid           Who last updated                 │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

### Units Table

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           UNITS TABLE                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  EXISTING COLUMNS (Preserved):                                           │
│  ✓ id                    uuid                                            │
│  ✓ nemovitost_id         uuid           [NOW NOT NULL + FK]              │
│  ✓ cislo_jednotky        varchar(50)    [RENAMED from oznaceni]          │
│  ✓ typ                   text                                            │
│  ✓ podlazi               varchar(20)    [PRESERVED]                      │
│  ✓ plocha                numeric                                         │
│  ✓ dispozice             varchar(20)    [PRESERVED]                      │
│  ✓ pocet_mistnosti       integer                                         │
│  ✓ stav                  varchar(20)                                     │
│  ✓ najemce_id            uuid                                            │
│  ✓ najemce               varchar(255)   [PRESERVED - legacy]             │
│  ✓ mesicni_najem         numeric                                         │
│  ✓ datum_zahajeni_najmu  date           [RENAMED from zacatku]           │
│  ✓ datum_ukonceni_najmu  date           [RENAMED from konce]             │
│  ✓ poznamky              text           [RENAMED from poznamka]          │
│  ✓ archived              boolean                                         │
│  ✓ archived_at           timestamptz                                     │
│  ✓ created_at            timestamptz                                     │
│  ✓ updated_at            timestamptz                                     │
│                                                                           │
│  NEW COLUMNS (Added):                                                    │
│  ⊕ nazev                 varchar(255)   Unit name/label                  │
│  ⊕ popis                 text           Description                      │
│  ⊕ vybaveni              jsonb          Equipment array                  │
│  ⊕ kauce                 decimal(10,2)  Security deposit                 │
│  ⊕ prilohy               jsonb          Attachments array                │
│  ⊕ archived_by           uuid           Who archived                     │
│  ⊕ created_by            uuid           Who created                      │
│  ⊕ updated_by            uuid           Who last updated                 │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

## Key Changes Summary

### Column Renames (Data Preserved)

| Table | Old Name | New Name | Reason |
|-------|----------|----------|--------|
| properties | `poznamka` | `poznamky` | Naming consistency |
| properties | `pocet_nadzemních_podlazi` | `pocet_podlazi` | Simplification |
| units | `oznaceni` | `cislo_jednotky` | Clarity |
| units | `datum_zacatku_najmu` | `datum_zahajeni_najmu` | Naming consistency |
| units | `datum_konce_najmu` | `datum_ukonceni_najmu` | Naming consistency |
| units | `poznamka` | `poznamky` | Naming consistency |

### New Features Added

1. **Enhanced Descriptions**: Both tables now have `popis` (description) field
2. **Attachments**: JSONB `prilohy` field for storing file references
3. **Audit Trail**: Complete audit with `created_by`, `updated_by`, `archived_by`
4. **Property Details**: 
   - `cislo_orientacni` - Orientation number for addresses
   - `kraj` - Region for better location tracking
   - `celkova_plocha` - Total property area
5. **Unit Details**:
   - `nazev` - Friendly name for units
   - `vybaveni` - Equipment/amenities list
   - `kauce` - Security deposit tracking

### Preserved Legacy Fields

These fields are kept for backward compatibility:

- `properties.spravce` - Property manager (text field)
- `properties.vybaveni` - Property equipment (JSONB)
- `properties.pocet_podzemních_podlazi` - Underground floors count
- `units.podlazi` - Floor number
- `units.dispozice` - Unit layout (e.g., "2+kk")
- `units.najemce` - Tenant name (legacy text field)

### Constraints Added

#### Properties Constraints:
- ✓ `rok_vystavby` between 1800 and current year
- ✓ `rok_rekonstrukce` >= `rok_vystavby`
- ✓ `celkova_plocha` >= 0

#### Units Constraints:
- ✓ `nemovitost_id` NOT NULL + Foreign Key to properties
- ✓ `plocha` >= 0
- ✓ `pocet_mistnosti` >= 0
- ✓ `mesicni_najem` >= 0
- ✓ `kauce` >= 0
- ✓ `datum_ukonceni_najmu` >= `datum_zahajeni_najmu`

### Indexes Created

**Properties:**
- `idx_properties_typ` - Fast filtering by type
- `idx_properties_mesto` - Fast filtering by city
- `idx_properties_pronajimatel` - Fast lookup by landlord
- `idx_properties_archived` - Fast filtering of archived records
- `idx_properties_created_at` - Efficient ordering by creation date

**Units:**
- `idx_units_nemovitost` - Fast lookup by property
- `idx_units_typ` - Fast filtering by type
- `idx_units_stav` - Fast filtering by status
- `idx_units_najemce` - Fast lookup by tenant
- `idx_units_archived` - Fast filtering of archived records

### Triggers

1. **`properties_updated_at`** - Auto-updates `updated_at` on changes
2. **`units_updated_at`** - Auto-updates `updated_at` on changes
3. **`units_update_count`** - Auto-updates `properties.pocet_jednotek`

## Migration Safety Features

✅ **Idempotent** - Can be run multiple times safely
✅ **Non-destructive** - No data loss, all existing data preserved
✅ **Backward Compatible** - Legacy columns maintained
✅ **Conditional Execution** - Only adds/modifies if needed
✅ **Transaction Safe** - Uses DO blocks for atomicity

## Testing Checklist

After running the migration, verify:

- [ ] All existing data is preserved
- [ ] Renamed columns contain expected data
- [ ] New columns are created with correct types
- [ ] Constraints are working (try inserting invalid data)
- [ ] Triggers are firing (update a record, check timestamps)
- [ ] Indexes exist (check query plans)
- [ ] Migration is idempotent (run twice, no errors)

## Migration File

📄 **File**: `002_update_properties_and_units_schema.sql`

**Size**: ~15 KB  
**Estimated execution time**: < 5 seconds (depending on data volume)  
**Rollback complexity**: Medium (column renames need data migration)

## Next Steps

1. **Review** - Read through the migration SQL
2. **Backup** - Create database backup before running
3. **Test Environment** - Run in test environment first
4. **Execute** - Apply to production database
5. **Verify** - Run test script (`test_migration_002.sql`)
6. **Update App** - Update application code to use new column names
7. **Monitor** - Watch for any issues after deployment

## Support

For questions or issues:
1. Check the README.md in this directory
2. Review the test script output
3. Create an issue in the repository
