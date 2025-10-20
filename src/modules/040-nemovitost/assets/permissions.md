# Oprávnění - Modul 040 (Nemovitosti)

## Přehled oprávnění

Modul Nemovitosti pracuje se dvěma hlavními entitami (nemovitosti a jednotky), 
pro každou existují samostatná oprávnění podle akcí.

---

## 1. Oprávnění pro Nemovitosti (Properties)

### `properties.read`
- **Název**: Čtení nemovitostí
- **Popis**: Umožňuje zobrazení seznamu a detailu nemovitostí
- **Použití**:
  - Zobrazení přehledu nemovitostí (tiles/prehled.js)
  - Zobrazení seznamu nemovitostí (tiles/seznam.js)
  - Zobrazení detailu nemovitosti (forms/detail.js)
- **Role s tímto oprávněním**: všechny role (každý přihlášený uživatel)
- **RLS**: `auth.uid() IS NOT NULL`

### `properties.create`
- **Název**: Vytváření nemovitostí
- **Popis**: Umožňuje vytvoření nové nemovitosti
- **Použití**:
  - Tlačítko "Přidat" v common actions
  - Formulář pro vytvoření nemovitosti (forms/edit.js)
- **Role s tímto oprávněním**: správce, manažer
- **RLS**: Check pomocí `user_permissions` tabulky

### `properties.update`
- **Název**: Úprava nemovitostí
- **Popis**: Umožňuje úpravu existující nemovitosti
- **Použití**:
  - Tlačítko "Upravit" v common actions
  - Formulář pro editaci nemovitosti (forms/edit.js)
- **Role s tímto oprávněním**: správce, manažer
- **RLS**: Check pomocí `user_permissions` tabulky

### `properties.archive`
- **Název**: Archivace nemovitostí
- **Popis**: Umožňuje archivaci (soft delete) a obnovení nemovitosti
- **Použití**:
  - Tlačítko "Archivovat" v common actions a detailu
  - Tlačítko "Obnovit" pro archivované záznamy
- **Role s tímto oprávněním**: správce
- **RLS**: Check pomocí `user_permissions` tabulky
- **Poznámka**: Při archivaci nemovitosti se nabízí archivace všech jejích jednotek

### `properties.delete`
- **Název**: Trvalé smazání nemovitostí
- **Popis**: Umožňuje trvalé smazání nemovitosti z databáze (HARD DELETE)
- **Použití**: Pouze administrátorské funkce, normálně se nepoužívá (preferujeme archivaci)
- **Role s tímto oprávněním**: superadmin
- **⚠️ Varování**: Trvale smaže nemovitost a kaskádově všechny její jednotky!

---

## 2. Oprávnění pro Jednotky (Units)

### `units.read`
- **Název**: Čtení jednotek
- **Popis**: Umožňuje zobrazení seznamu a detailu jednotek
- **Použití**:
  - Zobrazení seznamu jednotek nemovitosti
  - Zobrazení detailu jednotky (forms/jednotka-detail.js)
  - Zobrazení statistik (počet volných jednotek, atd.)
- **Role s tímto oprávněním**: všechny role (každý přihlášený uživatel)
- **RLS**: `auth.uid() IS NOT NULL`

### `units.create`
- **Název**: Vytváření jednotek
- **Popis**: Umožňuje vytvoření nové jednotky v rámci nemovitosti
- **Použití**:
  - Tlačítko "Přidat jednotku" ve správě jednotek
  - Formulář pro vytvoření jednotky (forms/jednotka-edit.js)
- **Role s tímto oprávněním**: správce, manažer
- **RLS**: Check pomocí `user_permissions` tabulky

### `units.update`
- **Název**: Úprava jednotek
- **Popis**: Umožňuje úpravu existující jednotky
- **Použití**:
  - Tlačítko "Upravit" u jednotky
  - Formulář pro editaci jednotky (forms/jednotka-edit.js)
  - Změna stavu jednotky (volná/obsazená)
  - Přiřazení/odebrání nájemce
- **Role s tímto oprávněním**: správce, manažer
- **RLS**: Check pomocí `user_permissions` tabulky

### `units.archive`
- **Název**: Archivace jednotek
- **Popis**: Umožňuje archivaci (soft delete) a obnovení jednotky
- **Použití**:
  - Tlačítko "Archivovat" u jednotky
  - Tlačítko "Obnovit" pro archivované jednotky
  - Hromadná archivace při archivaci nemovitosti
- **Role s tímto oprávněním**: správce
- **RLS**: Check pomocí `user_permissions` tabulky
- **Poznámka**: Při archivaci poslední aktivní jednotky se nabídne archivace celé nemovitosti

### `units.delete`
- **Název**: Trvalé smazání jednotek
- **Popis**: Umožňuje trvalé smazání jednotky z databáze (HARD DELETE)
- **Použití**: Pouze administrátorské funkce, normálně se nepoužívá (preferujeme archivaci)
- **Role s tímto oprávněním**: superadmin
- **⚠️ Varování**: Trvale smaže jednotku včetně vazeb na nájemce!

---

## 3. Maticový přehled oprávnění podle rolí

| Oprávnění | Superadmin | Správce | Manažer | Účetní | Čtenář |
|-----------|------------|---------|---------|--------|--------|
| **Nemovitosti** |
| properties.read | ✅ | ✅ | ✅ | ✅ | ✅ |
| properties.create | ✅ | ✅ | ✅ | ❌ | ❌ |
| properties.update | ✅ | ✅ | ✅ | ❌ | ❌ |
| properties.archive | ✅ | ✅ | ❌ | ❌ | ❌ |
| properties.delete | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Jednotky** |
| units.read | ✅ | ✅ | ✅ | ✅ | ✅ |
| units.create | ✅ | ✅ | ✅ | ❌ | ❌ |
| units.update | ✅ | ✅ | ✅ | ❌ | ❌ |
| units.archive | ✅ | ✅ | ❌ | ❌ | ❌ |
| units.delete | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 4. Speciální oprávnění

### `properties.view_archived`
- **Popis**: Umožňuje zobrazení archivovaných nemovitostí v seznamu
- **Použití**: Checkbox "Zobrazit archivované"
- **Role**: správce, superadmin
- **Implementace**: Client-side filtr, není potřeba RLS

### `units.view_archived`
- **Popis**: Umožňuje zobrazení archivovaných jednotek v seznamu
- **Použití**: Checkbox "Zobrazit archivované"
- **Role**: správce, superadmin
- **Implementace**: Client-side filtr, není potřeba RLS

### `properties.bulk_operations`
- **Popis**: Umožňuje hromadné operace (archivace více nemovitostí najednou, export, atd.)
- **Použití**: Hromadné akce, export do Excel/CSV
- **Role**: správce, superadmin

### `properties.manage_attachments`
- **Popis**: Umožňuje správu příloh k nemovitostem
- **Použití**: Modal s přílohami, nahrávání/mazání příloh
- **Role**: správce, manažer
- **Závislost**: Využívá AttachmentSystem s entity='properties'

### `units.manage_attachments`
- **Popis**: Umožňuje správu příloh k jednotkám
- **Použití**: Modal s přílohami, nahrávání/mazání příloh
- **Role**: správce, manažer
- **Závislost**: Využívá AttachmentSystem s entity='units'

---

## 5. Vazby na oprávnění jiných modulů

### Modul 030 (Pronajímatel)
- **subjects.read** - Potřebné pro výběr pronajímatele při vytváření/úpravě nemovitosti
- **subjects.view_detail** - Odkaz z nemovitosti na detail pronajímatele

### Modul 050 (Nájemník)
- **subjects.read** - Potřebné pro výběr nájemce při úpravě jednotky
- **subjects.view_detail** - Odkaz z jednotky na detail nájemce

### AttachmentSystem
- **attachments.read** - Zobrazení příloh
- **attachments.create** - Nahrávání příloh
- **attachments.delete** - Mazání příloh

---

## 6. Implementace v UI

### Kontrola oprávnění v tiles/prehled.js
```javascript
import { getUserPermissions } from '../../../security/permissions.js';

const userRole = window.currentUserRole || 'ctenar';
const permissions = getUserPermissions(userRole);

// Kontrola oprávnění pro tlačítka
const canCreate = permissions.includes('properties.create');
const canUpdate = permissions.includes('properties.update');
const canArchive = permissions.includes('properties.archive');

// Použití v CommonActions
renderCommonActions(ca, {
  moduleActions: ['add', 'edit', 'archive', 'attach', 'refresh'],
  handlers: {
    onAdd: canCreate ? () => navigateTo('#/m/040-nemovitost/f/edit') : undefined,
    onEdit: canUpdate && !!selectedRow ? () => navigateTo(`#/m/040-nemovitost/f/edit?id=${selectedRow.id}`) : undefined,
    onArchive: canArchive && !!selectedRow ? () => handleArchive(selectedRow) : undefined,
    // ... další handlery
  }
});
```

### Kontrola oprávnění ve formulářích
```javascript
// forms/edit.js
const canSave = permissions.includes(isNewRecord ? 'properties.create' : 'properties.update');

// Disable tlačítko Uložit pokud nemá oprávnění
<button type="submit" disabled={!canSave}>Uložit</button>

// Zobrazit varování pokud nemá oprávnění
{!canSave && (
  <div class="alert alert-warning">
    Nemáte oprávnění k úpravě této nemovitosti.
  </div>
)}
```

---

## 7. RLS Policies v Supabase

### Properties table
```sql
-- Čtení: všichni přihlášení
CREATE POLICY "properties_read" ON properties
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- Vytvoření: pouze s oprávněním
CREATE POLICY "properties_create" ON properties
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_permissions 
      WHERE user_id = auth.uid() 
      AND permission = 'properties.create'
    )
  );

-- Úprava: pouze s oprávněním
CREATE POLICY "properties_update" ON properties
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM user_permissions 
      WHERE user_id = auth.uid() 
      AND permission = 'properties.update'
    )
  );

-- Delete policy - pouze superadmin
CREATE POLICY "properties_delete" ON properties
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'superadmin'
    )
  );
```

### Units table
```sql
-- Obdobné policies jako pro properties
-- ... (viz properties výše)
```

---

## 8. Audit log

Všechny operace s oprávněními `properties.*` a `units.*` by měly být logovány:

```javascript
// Příklad logování v db.js
async function updateProperty(id, data) {
  const { data: updated, error } = await supabase
    .from('properties')
    .update(data)
    .eq('id', id)
    .select()
    .single();
  
  if (!error) {
    // Log do audit_log
    await logAudit({
      table_name: 'properties',
      record_id: id,
      action: 'UPDATE',
      user_id: getCurrentUserId(),
      old_values: originalData,
      new_values: updated
    });
  }
  
  return { data: updated, error };
}
```

---

## 9. Error messages pro chybějící oprávnění

### V UI (toast/alert)
- "Nemáte oprávnění k vytvoření nemovitosti. Kontaktujte správce."
- "Nemáte oprávnění k úpravě této nemovitosti."
- "Nemáte oprávnění k archivaci nemovitostí."
- "Nemáte oprávnění k přidání jednotky."
- "Nemáte oprávnění k úpravě jednotky."

### V API (HTTP response)
- 403 Forbidden: "Insufficient permissions: properties.create required"
- 403 Forbidden: "Insufficient permissions: properties.update required"
- 403 Forbidden: "Insufficient permissions: properties.archive required"

---

## 10. Testování oprávnění

### Testovací scénáře
1. **Čtenář**: Vidí seznam, detail, ale nemá tlačítka Přidat/Upravit/Archivovat
2. **Manažer**: Může přidávat/upravovat, ale nemůže archivovat
3. **Správce**: Plný přístup kromě trvalého mazání
4. **Superadmin**: Vše včetně trvalého mazání

### Manuální test checklist
- [ ] Přihlásit jako Čtenář → zkontrolovat, že nemá akční tlačítka
- [ ] Přihlásit jako Manažer → zkontrolovat, že může přidávat/upravovat
- [ ] Přihlásit jako Správce → zkontrolovat, že může archivovat
- [ ] Zkusit direct URL na formulář bez oprávnění → mělo by být zamítnuto
- [ ] Zkusit API call bez oprávnění → mělo by vrátit 403

---

## 11. Poznámky

- Oprávnění jsou granulární (per-entity, per-action)
- Archivace je preferována před trvalým mazáním
- RLS policies zajišťují bezpečnost na úrovni databáze
- UI kontroluje oprávnění pro lepší UX (disable tlačítek)
- Audit log zaznamenává všechny změny pro compliance

---

## 12. Reference

- **Globální katalog oprávnění**: `docs/archive/v4/permissions-catalog.md`
- **Struktura rolí**: `src/security/roles.js`
- **User permissions tabulka**: Supabase `user_permissions`
- **AttachmentSystem oprávnění**: `src/ui/attachments.js`
