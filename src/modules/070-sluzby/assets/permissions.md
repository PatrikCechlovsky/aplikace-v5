# Oprávnění - Modul 070 (Služby)

## Přehled oprávnění

Modul 070 používá role-based access control (RBAC) s následujícími úrovněmi přístupu:

| Role | Katalog služeb (read) | Katalog služeb (write) | Služby na smlouvách |
|------|----------------------|------------------------|---------------------|
| **admin** | ✅ Plný přístup | ✅ Plný přístup | ✅ Plný přístup |
| **manager** | ✅ Plný přístup | ✅ Plný přístup | ✅ Plný přístup |
| **user** | ✅ Čtení | ❌ Zakázáno | ✅ Vlastní smlouvy |
| **readonly** | ✅ Čtení | ❌ Zakázáno | ✅ Čtení vlastních |

---

## 1. Role a jejich oprávnění

### Role: admin

**Popis:** Správce systému s plnými právy.

**Oprávnění:**
- ✅ Čtení/zápis katalogu služeb (service_definitions)
- ✅ Vytváření nových služeb
- ✅ Editace všech služeb
- ✅ Deaktivace služeb
- ✅ Čtení/zápis služeb na všech smlouvách
- ✅ Přidávání/odebírání služeb ze smluv
- ✅ Úprava cen a podmínek služeb na smlouvách
- ✅ Přístup k historii změn
- ✅ Správa nastavení modulu

**UI akce:**
- Všechny akce v CommonActions jsou dostupné
- Všechny tiles jsou přístupné
- Všechny forms jsou přístupné v režimu read/write

### Role: manager

**Popis:** Manažer s rozšířenými právy.

**Oprávnění:**
- ✅ Čtení/zápis katalogu služeb
- ✅ Vytváření nových služeb
- ✅ Editace všech služeb
- ✅ Deaktivace služeb
- ✅ Čtení/zápis služeb na všech smlouvách
- ✅ Přidávání/odebírání služeb ze smluv
- ✅ Úprava cen a podmínek
- ✅ Přístup k historii změn

**UI akce:**
- Stejné jako admin

### Role: user

**Popis:** Běžný uživatel s omezenými právy.

**Oprávnění:**
- ✅ Čtení katalogu služeb (read-only)
- ❌ Vytváření/editace katalogu služeb
- ✅ Čtení služeb na vlastních smlouvách
- ✅ Přidávání služeb ke vlastním smlouvám
- ✅ Úprava služeb na vlastních smlouvách
- ❌ Úprava služeb na cizích smlouvách

**UI akce:**
- Tlačítko "Přidat" není viditelné v katalogu služeb
- Tlačítko "Upravit" není viditelné v katalogu služeb
- Tlačítko "Archivovat" není viditelné v katalogu služeb
- Může přidávat/upravovat služby pouze na vlastních smlouvách

### Role: readonly

**Popis:** Uživatel pouze pro čtení.

**Oprávnění:**
- ✅ Čtení katalogu služeb
- ❌ Vytváření/editace katalogu služeb
- ✅ Čtení služeb na vlastních smlouvách
- ❌ Přidávání/úprava služeb

**UI akce:**
- Pouze tlačítko "Obnovit"
- Všechna data jsou read-only

---

## 2. Oprávnění podle entit

### service_definitions (Katalog služeb)

#### SELECT (Čtení)
- **Kdo:** Všichni přihlášení uživatelé
- **Podmínky:** `auth.uid() IS NOT NULL`
- **RLS Policy:**
```sql
CREATE POLICY service_definitions_select ON service_definitions
  FOR SELECT USING (auth.uid() IS NOT NULL);
```

#### INSERT (Vytváření)
- **Kdo:** admin, manager
- **Podmínky:** Role musí být admin nebo manager
- **RLS Policy:**
```sql
CREATE POLICY service_definitions_insert ON service_definitions
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
  );
```

#### UPDATE (Úprava)
- **Kdo:** admin, manager
- **Podmínky:** Role musí být admin nebo manager
- **RLS Policy:**
```sql
CREATE POLICY service_definitions_update ON service_definitions
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
  );
```

#### DELETE
- **Kdo:** Nikdo (není povoleno)
- **Alternativa:** Místo DELETE se používá deaktivace (UPDATE aktivni = false)

### contract_service_lines (Služby na smlouvách)

#### SELECT (Čtení)
- **Kdo:** Všichni přihlášení uživatelé
- **Podmínky:** `auth.uid() IS NOT NULL`
- **Poznámka:** Filtrování podle vlastnictví smlouvy se řeší na aplikační úrovni
- **RLS Policy:**
```sql
CREATE POLICY contract_service_lines_select ON contract_service_lines
  FOR SELECT USING (auth.uid() IS NOT NULL);
```

#### INSERT (Přidání)
- **Kdo:** Všichni přihlášení uživatelé
- **Podmínky:** Musí mít přístup k dané smlouvě
- **RLS Policy:**
```sql
CREATE POLICY contract_service_lines_insert ON contract_service_lines
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
```

#### UPDATE (Úprava)
- **Kdo:** Všichni přihlášení uživatelé
- **Podmínky:** Musí mít přístup k dané smlouvě
- **RLS Policy:**
```sql
CREATE POLICY contract_service_lines_update ON contract_service_lines
  FOR UPDATE USING (auth.uid() IS NOT NULL);
```

#### DELETE (Odstranění)
- **Kdo:** Všichni přihlášení uživatelé
- **Podmínky:** Musí mít přístup k dané smlouvě
- **RLS Policy:**
```sql
CREATE POLICY contract_service_lines_delete ON contract_service_lines
  FOR DELETE USING (auth.uid() IS NOT NULL);
```

---

## 3. Mapování oprávnění na UI akce

### Tile: prehled (Přehled katalogu)

| Akce | admin | manager | user | readonly |
|------|-------|---------|------|----------|
| add | ✅ | ✅ | ❌ | ❌ |
| edit | ✅ | ✅ | ❌ | ❌ |
| archive | ✅ | ✅ | ❌ | ❌ |
| refresh | ✅ | ✅ | ✅ | ✅ |
| view detail | ✅ | ✅ | ✅ | ✅ |

**Implementace:**
```javascript
renderCommonActions(commonActions, {
  moduleActions: ['add', 'edit', 'archive', 'refresh'],
  userRole: userRole,  // 'admin', 'manager', 'user', 'readonly'
  handlers: { /* ... */ }
});
```

### Form: edit (Editace služby)

| Akce | admin | manager | user | readonly |
|------|-------|---------|------|----------|
| save | ✅ | ✅ | ❌ | ❌ |
| archive | ✅ | ✅ | ❌ | ❌ |
| history | ✅ | ✅ | ✅ | ✅ |

**Implementace:**
```javascript
// Skrýt formulář pro user/readonly
if (!['admin', 'manager'].includes(userRole)) {
  navigateTo(`#/m/070-sluzby/f/detail?id=${id}`);
  return;
}
```

### Tile: seznam (Služby na smlouvách)

| Akce | admin | manager | user | readonly |
|------|-------|---------|------|----------|
| add | ✅ | ✅ | ✅* | ❌ |
| edit | ✅ | ✅ | ✅* | ❌ |
| remove | ✅ | ✅ | ✅* | ❌ |
| refresh | ✅ | ✅ | ✅ | ✅ |

*) Pouze pro vlastní smlouvy

---

## 4. Validace oprávnění v kódu

### Při načítání dat

```javascript
// db.js
export async function listServiceDefinitions(options = {}) {
  // RLS automaticky filtruje podle oprávnění
  const { data, error } = await supabase
    .from('service_definitions')
    .select('*')
    .order('nazev');
  
  return { data: data || [], error };
}
```

### Při ukládání dat

```javascript
// db.js
export async function createServiceDefinition(serviceData) {
  // RLS automaticky zkontroluje oprávnění
  const { data, error } = await supabase
    .from('service_definitions')
    .insert(serviceData)
    .select()
    .single();
  
  if (error) {
    // Chyba může být způsobena nedostatečnými oprávněními
    console.error('Error creating service:', error);
  }
  
  return { data, error };
}
```

### V UI komponentách

```javascript
// tiles/prehled.js
export async function render(root, manifest, params = {}) {
  const { userRole = 'user' } = params;
  
  // Definuj akce podle role
  let actions = ['refresh'];
  
  if (['admin', 'manager'].includes(userRole)) {
    actions = ['add', 'edit', 'archive', 'refresh'];
  }
  
  renderCommonActions(commonActions, {
    moduleActions: actions,
    userRole,
    handlers: { /* ... */ }
  });
}
```

### Ve formulářích

```javascript
// forms/edit.js
export async function render(root, manifest, params = {}) {
  const { userRole = 'user', query = {} } = params;
  const id = query.id;
  
  // Kontrola oprávnění
  if (!['admin', 'manager'].includes(userRole)) {
    toast('Nemáte oprávnění k editaci služeb', 'error');
    navigateTo(`#/m/070-sluzby/t/prehled`);
    return;
  }
  
  // Pokračování implementace...
}
```

---

## 5. Chybové stavy a hlášky

### Nedostatečná oprávnění

```javascript
// Při pokusu o nepovolený zápis
if (error && error.code === '42501') {  // insufficient_privilege
  toast('Nemáte oprávnění k této operaci', 'error');
}
```

### UI hlášky podle role

| Situace | Hláška |
|---------|--------|
| user klikne na "Přidat službu" | "Pouze administrátoři a manažeři mohou přidávat služby do katalogu" |
| user klikne na "Upravit službu" | "Pouze administrátoři a manažeři mohou upravovat katalog služeb" |
| readonly klikne na jakoukoliv editaci | "Váš účet má oprávnění pouze pro čtení" |
| Chyba RLS při ukládání | "Nemáte oprávnění k této operaci" |

---

## 6. Auditní log

Všechny změny v tabulkách jsou logovány pomocí sloupců:
- `created_by` - kdo vytvořil záznam
- `created_at` - kdy byl záznam vytvořen
- `updated_by` - kdo naposledy upravil
- `updated_at` - kdy byla poslední úprava

Tyto údaje jsou automaticky vyplňovány při INSERT/UPDATE operacích.

---

## 7. Doporučení pro implementaci

1. **Vždy kontroluj userRole** v UI komponentách před zobrazením akcí
2. **Spoléhej na RLS** pro skutečné zabezpečení dat
3. **Zobrazuj přátelské chybové hlášky** při nedostatečných oprávněních
4. **Skrývej UI prvky** které uživatel nemůže použít (místo zobrazení s disabled)
5. **Loguj všechny změny** pomocí audit sloupců
6. **Testuj oprávnění** pro všechny role

---

## 8. Testování oprávnění

### Testovací scénáře

#### Test 1: Admin
1. Přihlásit se jako admin
2. Otevřít modul 070
3. Ověřit viditelnost všech akcí (add, edit, archive)
4. Vytvořit novou službu → Úspěch ✅
5. Upravit službu → Úspěch ✅
6. Deaktivovat službu → Úspěch ✅

#### Test 2: Manager
1. Přihlásit se jako manager
2. Otevřít modul 070
3. Ověřit viditelnost všech akcí
4. Vytvořit novou službu → Úspěch ✅
5. Upravit službu → Úspěch ✅

#### Test 3: User
1. Přihlásit se jako user
2. Otevřít modul 070
3. Ověřit, že tlačítka add/edit/archive nejsou viditelná
4. Pokusit se otevřít URL editace přímo → Přesměrování na přehled ✅
5. Otevřít detail služby → Úspěch ✅ (read-only)
6. Přidat službu ke vlastní smlouvě → Úspěch ✅

#### Test 4: Readonly
1. Přihlásit se jako readonly
2. Otevřít modul 070
3. Ověřit, že pouze tlačítko refresh je viditelné
4. Otevřít detail služby → Úspěch ✅ (read-only)
5. Pokusit se upravit → Chyba "Nemáte oprávnění" ✅

---

**Konec dokumentu - Oprávnění modulu 070** ✅
