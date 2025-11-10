# Oprávnění - Modul 030 (Pronajímatel)

## Přehled oprávnění

Modul Pronajímatel pracuje se subjekty v roli `pronajimatel`. Oprávnění jsou sdílená s modulem 050 (Nájemník), protože obě moduly pracují se stejnou tabulkou `subjects`.

---

## 1. Oprávnění pro Subjekty (Subjects)

### `subjects.read`
- **Název**: Čtení subjektů
- **Popis**: Umožňuje zobrazení seznamu a detailu pronajímatelů
- **Použití**:
  - Zobrazení přehledu pronajímatelů (tiles/prehled.js)
  - Zobrazení filtrovaných seznamů podle typu (tiles/osoba.js, tiles/firma.js, atd.)
  - Zobrazení detailu pronajímatele (forms/detail.js)
- **Role s tímto oprávněním**: všechny role (každý přihlášený uživatel)
- **RLS**: `auth.uid() IS NOT NULL`

### `subjects.create`
- **Název**: Vytváření subjektů
- **Popis**: Umožňuje vytvoření nového pronajímatele
- **Použití**:
  - Tlačítko "Přidat" v common actions
  - Výběr typu subjektu (forms/chooser.js)
  - Formulář pro vytvoření pronajímatele (forms/form.js)
- **Role s tímto oprávněním**: správce, manažer
- **RLS**: Check pomocí `user_permissions` tabulky

### `subjects.update`
- **Název**: Úprava subjektů
- **Popis**: Umožňuje úpravu existujícího pronajímatele
- **Použití**:
  - Tlačítko "Upravit" v common actions a detailu
  - Formulář pro editaci pronajímatele (forms/form.js)
- **Role s tímto oprávněním**: správce, manažer
- **RLS**: Check pomocí `user_permissions` tabulky

### `subjects.archive`
- **Název**: Archivace subjektů
- **Popis**: Umožňuje archivaci (soft delete) a obnovení pronajímatele
- **Použití**:
  - Tlačítko "Archivovat" v common actions a detailu
  - Tlačítko "Obnovit" pro archivované záznamy
- **Role s tímto oprávněním**: správce
- **RLS**: Check pomocí `user_permissions` tabulky
- **Poznámka**: Při archivaci pronajímatele se nabízí archivace všech jeho nemovitostí

### `subjects.delete`
- **Název**: Trvalé smazání subjektů
- **Popis**: Umožňuje trvalé smazání pronajímatele z databáze (HARD DELETE)
- **Použití**: Pouze administrátorské funkce, normálně se nepoužívá (preferujeme archivaci)
- **Role s tímto oprávněním**: superadmin
- **⚠️ Varování**: Trvale smaže pronajímatele včetně vazeb na nemovitosti!

---

## 2. Maticový přehled oprávnění podle rolí

| Oprávnění | Superadmin | Správce | Manažer | Účetní | Čtenář |
|-----------|------------|---------|---------|--------|--------|
| subjects.read | ✅ | ✅ | ✅ | ✅ | ✅ |
| subjects.create | ✅ | ✅ | ✅ | ❌ | ❌ |
| subjects.update | ✅ | ✅ | ✅ | ❌ | ❌ |
| subjects.archive | ✅ | ✅ | ❌ | ❌ | ❌ |
| subjects.delete | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 3. Speciální oprávnění

### `subjects.view_archived`
- **Popis**: Umožňuje zobrazení archivovaných pronajímatelů v seznamu
- **Použití**: Checkbox "Zobrazit archivované"
- **Role**: správce, superadmin
- **Implementace**: Client-side filtr, není potřeba RLS

### `subjects.bulk_operations`
- **Popis**: Umožňuje hromadné operace (archivace více pronajímatelů najednou, export, atd.)
- **Použití**: Hromadné akce, export do Excel/CSV
- **Role**: správce, superadmin

### `subjects.manage_attachments`
- **Popis**: Umožňuje správu příloh k pronajímatelům
- **Použití**: Modal s přílohami, nahrávání/mazání příloh
- **Role**: správce, manažer
- **Závislost**: Využívá AttachmentSystem s entity='subjects'

---

## 4. Vazby na oprávnění jiných modulů

### Modul 040 (Nemovitost)
- **properties.read** - Zobrazení nemovitostí pronajímatele v detailu
- **properties.create** - Vytvoření nemovitosti s vazbou na pronajímatele

### Modul 060 (Smlouva)
- **contracts.read** - Zobrazení smluv pronajímatele
- **contracts.create** - Vytvoření smlouvy s pronajímatelem jako stranou

### Modul 080 (Platby)
- **payments.read** - Zobrazení plateb pronajímatele
- **payments.create** - Vytvoření platby s pronajímatelem jako příjemcem

### AttachmentSystem
- **attachments.read** - Zobrazení příloh
- **attachments.create** - Nahrávání příloh
- **attachments.delete** - Mazání příloh

---

## 5. Implementace v UI

### Kontrola oprávnění v tiles/prehled.js
```javascript
import { getUserPermissions } from '/src/security/permissions.js';

const userRole = window.currentUserRole || 'ctenar';
const permissions = getUserPermissions(userRole);

// Kontrola oprávnění pro tlačítka
const canCreate = permissions.includes('subjects.create');
const canUpdate = permissions.includes('subjects.update');
const canArchive = permissions.includes('subjects.archive');

// Použití v CommonActions
renderCommonActions(ca, {
  moduleActions: ['add', 'edit', 'archive', 'attach', 'refresh'],
  handlers: {
    onAdd: canCreate ? () => navigateTo('#/m/030-pronajimatel/f/chooser') : undefined,
    onEdit: canUpdate && !!selectedRow ? () => navigateTo(`#/m/030-pronajimatel/f/form?id=${selectedRow.id}`) : undefined,
    onArchive: canArchive && !!selectedRow ? () => handleArchive(selectedRow) : undefined,
    // ... další handlery
  }
});
```

### Kontrola oprávnění ve formulářích
```javascript
// forms/form.js
const canSave = permissions.includes(isNewRecord ? 'subjects.create' : 'subjects.update');

// Disable tlačítko Uložit pokud nemá oprávnění
<button type="submit" disabled={!canSave}>Uložit</button>

// Zobrazit varování pokud nemá oprávnění
{!canSave && (
  <div class="alert alert-warning">
    Nemáte oprávnění k úpravě tohoto pronajímatele.
  </div>
)}
```

---

## 6. RLS Policies v Supabase

### Subjects table
```sql
-- Čtení: všichni přihlášení
CREATE POLICY "subjects_read" ON subjects
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- Vytvoření: pouze s oprávněním
CREATE POLICY "subjects_create" ON subjects
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_permissions 
      WHERE user_id = auth.uid() 
      AND permission = 'subjects.create'
    )
  );

-- Úprava: pouze s oprávněním
CREATE POLICY "subjects_update" ON subjects
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM user_permissions 
      WHERE user_id = auth.uid() 
      AND permission = 'subjects.update'
    )
  );

-- Delete policy - pouze superadmin
CREATE POLICY "subjects_delete" ON subjects
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'superadmin'
    )
  );
```

---

## 7. Audit log

Všechny operace s oprávněními `subjects.*` by měly být logovány:

```javascript
// Příklad logování v db.js
async function updateSubject(id, data) {
  const { data: updated, error } = await supabase
    .from('subjects')
    .update(data)
    .eq('id', id)
    .select()
    .single();
  
  if (!error) {
    // Log do audit_log
    await logAudit({
      table_name: 'subjects',
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

## 8. Error messages pro chybějící oprávnění

### V UI (toast/alert)
- "Nemáte oprávnění k vytvoření pronajímatele. Kontaktujte správce."
- "Nemáte oprávnění k úpravě tohoto pronajímatele."
- "Nemáte oprávnění k archivaci pronajímatelů."

### V API (HTTP response)
- 403 Forbidden: "Insufficient permissions: subjects.create required"
- 403 Forbidden: "Insufficient permissions: subjects.update required"
- 403 Forbidden: "Insufficient permissions: subjects.archive required"

---

## 9. Testování oprávnění

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

## 10. Poznámky

- Oprávnění jsou sdílená mezi moduly 030 (Pronajímatel) a 050 (Nájemník)
- Obě moduly pracují se stejnou tabulkou `subjects`, liší se pouze v poli `role`
- Archivace je preferována před trvalým mazáním
- RLS policies zajišťují bezpečnost na úrovni databáze
- UI kontroluje oprávnění pro lepší UX (disable tlačítek)
- Audit log zaznamenává všechny změny pro compliance

---

## 11. Reference

- **Globální katalog oprávnění**: `/docs/permissions-catalog.md`
- **Struktura rolí**: `/src/security/roles.js`
- **User permissions tabulka**: Supabase `user_permissions`
- **AttachmentSystem oprávnění**: `/src/ui/attachments.js`
- **Agent specifikace**: `./AGENT-SPECIFIKACE.md`
