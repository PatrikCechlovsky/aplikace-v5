# Testing Task A - Units Overview Fix

## Manual Testing Steps

### 1. Run Migration 008

Follow the instructions in `docs/tasks/supabase-migrations/RUN_MIGRATION_008.md` to apply the migration.

### 2. Verify Database Schema

In Supabase SQL Editor, run:

```sql
-- Check units table columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'units' 
AND column_name IN ('typ_jednotky', 'oznaceni', 'plocha_celkem', 'dispozice', 'podlazi')
ORDER BY column_name;

-- Expected: All 5 columns should exist

-- Check type tables exist and have data
SELECT COUNT(*) as property_types_count FROM property_types;
SELECT COUNT(*) as unit_types_count FROM unit_types;

-- Expected: Both should return count > 0
```

### 3. Test Backend API Functions

Create a test HTML page or use browser console:

```javascript
// In browser console, navigate to the app first
import { getUnitsCountsByType, getPropertiesCountsByType } from '/src/modules/040-nemovitost/db.js';

// Test units counts
const unitsCounts = await getUnitsCountsByType({ showArchived: false });
console.log('Units counts:', unitsCounts);
// Expected: { data: [{type: 'byt', count: X}, ...], error: null }

// Test properties counts
const propsCounts = await getPropertiesCountsByType({ showArchived: false });
console.log('Properties counts:', propsCounts);
// Expected: { data: [{type: 'bytovy_dum', count: X}, ...], error: null }
```

### 4. Test Units Overview Page

1. Navigate to the application: `http://localhost:PORT`
2. Click on **Nemovitosti** module in sidebar
3. Expand **Přehled jednotek**
4. Verify:
   - ✅ Only types with count > 0 are shown
   - ✅ Each type shows count in parentheses (e.g., "Byt (5)")
   - ✅ Clicking a type loads filtered units
   - ✅ No console errors about "column does not exist"

### 5. Test Common Actions

On the Units Overview page:

1. **Add Button**:
   - Click "Add" button in toolbar
   - Should navigate to unit creation form
   
2. **Edit Button**:
   - Select a unit row (click on it)
   - Click "Edit" button
   - Should navigate to unit edit form

3. **Attachments Button**:
   - Select a unit row
   - Click "Attachments" button
   - Should open attachments modal

4. **Refresh Button**:
   - Click "Refresh" button
   - Page should reload data

5. **History Button**:
   - Select a unit row
   - Click "History" button
   - Should show history (or alert if not implemented)

### 6. Test Sidebar Population

1. Open **Nemovitosti** module
2. Expand **Přehled jednotek**
3. Verify:
   - ✅ Only shows types that have units
   - ✅ Shows correct counts
   - ✅ Updates when filtering by archived

### Expected Results

✅ **No Errors**: Console should be clean, no "column does not exist" errors
✅ **Sidebar Populated**: Only types with units appear in sidebar with counts
✅ **Common Actions Work**: All toolbar buttons function correctly
✅ **Filtering Works**: Can filter by type and archived status
✅ **Performance**: Page loads quickly (counts API is efficient)

### Troubleshooting

**Error: "column units.typ does not exist"**
- Migration 008 not applied yet
- Run the migration as described in RUN_MIGRATION_008.md

**Sidebar shows no types**
- Check if `unit_types` table has data: `SELECT * FROM unit_types;`
- Check if units exist: `SELECT COUNT(*) FROM units WHERE archived = false;`
- Check browser console for API errors

**Counts are wrong**
- Clear browser cache
- Check archived filter status
- Verify query in `getUnitsCountsByType()` function

**Common actions don't work**
- Check console for navigation errors
- Verify form IDs in module.config.js match actual form files
- Check user permissions

## Automated Testing (Future)

Consider adding these tests:

```javascript
// Unit test for getUnitsCountsByType
describe('getUnitsCountsByType', () => {
  it('should return counts by type', async () => {
    const { data, error } = await getUnitsCountsByType();
    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
    expect(data.every(item => item.type && typeof item.count === 'number')).toBe(true);
  });
  
  it('should exclude archived units by default', async () => {
    // Test implementation
  });
});

// Integration test
describe('Units Overview', () => {
  it('should display units filtered by type', async () => {
    // Navigate to page, click type, verify filtered results
  });
  
  it('should show only types with non-zero counts in sidebar', async () => {
    // Check sidebar children
  });
});
```

## Test Results Log

| Test | Status | Notes | Tester | Date |
|------|--------|-------|--------|------|
| Migration 008 applied | ⏳ | Pending | - | - |
| Database schema verified | ⏳ | Pending | - | - |
| Backend API functions work | ⏳ | Pending | - | - |
| Units overview loads | ⏳ | Pending | - | - |
| Sidebar shows correct counts | ⏳ | Pending | - | - |
| Common actions work | ⏳ | Pending | - | - |
| No console errors | ⏳ | Pending | - | - |

## Sign-off

- [ ] All tests passed
- [ ] No console errors
- [ ] Documentation updated
- [ ] Migration can be rolled back if needed

Tested by: ________________  
Date: ________________  
Approved by: ________________
