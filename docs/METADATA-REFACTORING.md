# Metadata-Driven Forms Refactoring

## Overview

This document describes the refactoring of modules 060 (Smlouvy/Contracts), 070 (Služby/Services), and 080 (Platby/Payments) to use a metadata-driven approach for form generation.

## Objectives

1. **Standardize form definitions** - All forms now use a consistent metadata structure
2. **Enable dynamic schema validation** - Forms can optionally validate against actual database schema
3. **Reduce code duplication** - Common form rendering logic is centralized
4. **Improve maintainability** - Field definitions are in one place per module

## Architecture

### Components

#### 1. Module Metadata Files (`meta.js`)

Each module now has a `meta.js` file that defines:
- Module ID, title, and associated database table
- Tile configurations
- Form definitions with fields

**Example structure:**
```javascript
export const moduleMeta = {
  id: '060-smlouva',
  title: 'Smlouvy',
  table: 'contracts',
  tiles: [...],
  forms: [
    {
      id: 'edit',
      title: 'Editace smlouvy',
      fields: [
        { key: 'cislo_smlouvy', label: 'Číslo smlouvy', type: 'text', required: true },
        { key: 'datum_zacatek', label: 'Datum začátku', type: 'date', required: true },
        // ... more fields
      ]
    }
  ]
};
```

**Locations:**
- `src/modules/060-smlouva/meta.js` - Contracts metadata
- `src/modules/070-sluzby/meta.js` - Services metadata
- `src/modules/080-platby/meta.js` - Payments metadata

#### 2. Metadata Loader (`src/lib/metaLoader.js`)

The metadata loader enriches static metadata with database schema information.

**Key functions:**
- `mapPgTypeToFieldType(pgType)` - Maps PostgreSQL types to UI field types
- `getTableSchema(tableName)` - Queries database schema (optional, requires RPC)
- `loadModuleMeta(moduleMeta)` - Enriches metadata with DB info
- `loadModuleMetaCached(moduleMeta)` - Cached version for performance

**Features:**
- Graceful degradation - works without database schema access
- Type mapping (PostgreSQL → UI component types)
- Caching for performance
- Determines required fields based on nullable columns

#### 3. Form Renderer (`src/lib/formRenderer.js`)

Generic form renderer that uses metadata to generate forms.

**Key function:**
```javascript
renderMetadataForm(root, moduleMeta, formId, initialData, onSubmit, options)
```

**Features:**
- Reads form definition from metadata
- Delegates to existing `renderForm` utility
- Consistent form behavior across modules

### Updated Forms

#### Module 060 - Smlouvy (Contracts)
- ✅ `forms/edit.js` - Create/edit contract form
- ⚠️ `forms/detail.js` - View contract (uses existing complex implementation)

#### Module 070 - Služby (Services)
- ✅ `forms/edit.js` - Create/edit service definition
- ✅ `forms/detail.js` - View service details

#### Module 080 - Platby (Payments)
- ✅ `forms/edit.js` - Create/edit payment
- ✅ `forms/detail.js` - View payment details

## Database Schema Alignment

All metadata field definitions now match the actual database schema:

### Contracts (060)
- Uses actual column names: `kauce_castka`, `kauce_potreba`, `stav_kauce`
- Status values: `koncept`, `cekajici_podepsani`, `aktivni`, `ukoncena`, `zrusena`, `propadla`
- Foreign keys: `landlord_id`, `tenant_id`, `unit_id`, `property_id`

### Service Definitions (070)
- Uses actual column names: `zakladni_cena`, `sazba_dph`, `typ_uctovani`
- Includes accounting type options: `pevna_sazba`, `merena_spotreba`, etc.
- Categories match DB enum values

### Payments (080)
- Uses actual column names: `payment_reference`, `payment_method`, `bank_transaction_id`
- Payment types: `najem`, `sluzba`, `kauce`, `poplatek`, `vratka`
- Status values: `cekajici`, `potvrzeno`, `uspesne_rekoncilovano`, `selhalo`, `vraceno`

## Optional: Dynamic Schema Loading

To enable runtime schema validation and automatic field type detection:

### 1. Run Migration 007

Execute the SQL migration:
```bash
psql -h your-db-host -U your-user -d your-db -f docs/tasks/supabase-migrations/007_add_schema_metadata_function.sql
```

Or in Supabase Dashboard:
1. Go to SQL Editor
2. Copy content from `007_add_schema_metadata_function.sql`
3. Execute

### 2. Benefits

Once the RPC function is available:
- Forms automatically validate field types against database
- Required fields are determined from NOT NULL constraints
- New database columns can be detected
- Type mismatches are logged for debugging

### 3. Without Migration 007

The system works perfectly fine without the migration:
- Uses static metadata from `meta.js` files
- Forms render correctly with predefined field definitions
- No database query overhead

## Type Mapping

PostgreSQL types are mapped to UI component types:

| PostgreSQL Type | UI Component Type |
|----------------|-------------------|
| `uuid`, `text`, `varchar` | `text` |
| `integer`, `bigint`, `numeric`, `decimal` | `number` |
| `boolean` | `checkbox` |
| `date`, `timestamp` | `date` |
| `json`, `jsonb` | `json` |

## Field Configuration

Each field in metadata supports:

```javascript
{
  key: 'field_name',           // Database column name
  label: 'Field Label',        // Display label
  type: 'text',                // UI component type
  required: true,              // Required validation
  readOnly: false,             // Read-only mode
  helpText: 'Helper text',     // Help text below field
  options: [...],              // For select/radio fields
  step: '0.01',                // For number fields
  fullWidth: true,             // Span full width
  // ... more options supported by renderForm
}
```

## Usage Example

### Creating a New Form

```javascript
// 1. Define in meta.js
forms: [
  {
    id: 'my-form',
    title: 'My Form',
    fields: [
      { key: 'name', label: 'Name', type: 'text', required: true }
    ]
  }
]

// 2. In form renderer file (forms/my-form.js)
import { renderMetadataForm } from '/src/lib/formRenderer.js';
import { moduleMeta } from '../meta.js';
import { loadModuleMetaCached } from '/src/lib/metaLoader.js';

export default async function render(root) {
  const enrichedMeta = await loadModuleMetaCached(moduleMeta);
  
  renderMetadataForm(
    root,
    enrichedMeta,
    'my-form',
    {},
    async (formData) => {
      // Handle submit
      console.log('Form data:', formData);
      return true;
    },
    {
      submitLabel: 'Save',
      showSubmit: true
    }
  );
}
```

## Benefits

### For Developers
- **Single source of truth** - Field definitions in one place
- **Less boilerplate** - No need to manually construct forms
- **Type safety** - Automatic type mapping from database
- **Easy maintenance** - Change field once, updates everywhere

### For the Application
- **Consistency** - All forms follow same patterns
- **Validation** - Field types match database expectations
- **Performance** - Cached metadata, no repeated DB queries
- **Flexibility** - Easy to add new fields or change existing ones

## Migration Path for Other Modules

To refactor additional modules:

1. **Create `meta.js`** with module metadata
2. **Update form files** to use `renderMetadataForm`
3. **Test** forms render correctly
4. **Optionally** add tile metadata for table columns

## Testing

To test the refactored modules:

1. Navigate to each module in the UI
2. Try creating a new record (edit form)
3. Try viewing an existing record (detail form)
4. Verify all fields display correctly
5. Test form submission

## Known Limitations

- Tiles still use manual column definitions (not yet using metadata)
- Complex forms with tabs or sections may need custom implementation
- Chooser/select fields for foreign keys need special handling
- File upload fields are not yet fully supported in metadata

## Future Enhancements

1. **Tile metadata** - Use metadata for table column definitions
2. **Foreign key resolution** - Auto-detect and handle FK relationships
3. **Validation rules** - Add custom validation in metadata
4. **Computed fields** - Support calculated/derived fields
5. **Field groups** - Support sections and tabs in metadata
6. **Conditional fields** - Show/hide based on other field values

## References

- Original specification: See issue description and `smlouvy_moduly_030-080.md`
- Database migrations: `docs/tasks/supabase-migrations/004-006_*.sql`
- Existing form patterns: `src/modules/030-pronajimatel/`, `src/modules/040-nemovitost/`

## Support

For questions or issues with the metadata-driven forms:
1. Check console for any loader errors
2. Verify database migrations are applied
3. Check field definitions in `meta.js` match database columns
4. Review existing working modules (030, 040) for patterns
