# Oprávnění a Bezpečnost - Modul 050 (Nájemník)

**Verze:** 1.0  
**Poslední aktualizace:** 2025-11-10  
**Účel:** Detailní specifikace oprávnění, RLS policies a bezpečnostních pravidel

---

## 📋 Obsah

1. [Přehled oprávnění](#přehled-oprávnění)
2. [Uživatelské role](#uživatelské-role)
3. [Row Level Security (RLS)](#row-level-security-rls)
4. [Oprávnění podle rolí](#oprávnění-podle-rolí)
5. [Validace a sanitizace](#validace-a-sanitizace)
6. [Audit a logování](#audit-a-logování)
7. [Ochrana proti útokům](#ochrana-proti-útokům)

---

## Přehled oprávnění

### Základní principy

1. **Defense in Depth** - Bezpečnost na více úrovních (frontend + backend + databáze)
2. **Principle of Least Privilege** - Každý uživatel má pouze minimální nutná oprávnění
3. **Explicit Deny** - Co není explicitně povoleno, je zakázáno
4. **Audit Everything** - Všechny změny se logují

### Úrovně zabezpečení

```
┌─────────────────────────────────────────┐
│  Frontend (UI validace)                 │  ← První linie obrany
├─────────────────────────────────────────┤
│  Backend (Business logic)               │  ← Druhá linie obrany
├─────────────────────────────────────────┤
│  RLS Policies (Database)                │  ← Třetí linie obrany
└─────────────────────────────────────────┘
```

---

## Uživatelské role

### Role v systému

| Role | Název | Popis |
|------|-------|-------|
| `admin` | Administrátor | Plný přístup ke všem funkcím |
| `user` | Uživatel | Přístup k vlastním záznamům a přiděleným subjektům |
| `viewer` | Pozorovatel | Pouze čtení |

### Zjištění role aktuálního uživatele

```javascript
// V Supabase
const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', auth.uid())
  .single();

const userRole = profile?.role || 'viewer';
```

---

## Row Level Security (RLS)

### Tabulka: subjects

RLS je **POVINNĚ ZAPNUTÉ** pro tabulku `subjects`:

```sql
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
```

### Policy: SELECT (čtení)

```sql
CREATE POLICY subjects_select ON subjects FOR SELECT
  USING (
    -- Admin vidí všechno
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
    
    -- User vidí pouze subjekty, ke kterým má přístup
    OR EXISTS (
      SELECT 1 FROM user_subjects 
      WHERE user_id = auth.uid() 
      AND subject_id = subjects.id
    )
    
    -- Viewer vidí pouze nearchivované
    OR (
      (SELECT role FROM profiles WHERE id = auth.uid()) = 'viewer'
      AND archived = false
    )
  );
```

**Vysvětlení:**
- **Admin**: Vidí všechny subjekty včetně archivovaných
- **User**: Vidí pouze subjekty, které jsou mu přiděleny přes tabulku `user_subjects`
- **Viewer**: Vidí pouze nearchivované subjekty (omezené čtení)

### Policy: INSERT (vytvoření)

```sql
CREATE POLICY subjects_insert ON subjects FOR INSERT
  WITH CHECK (
    -- Pouze admin a user mohou vytvářet nové subjekty
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'user')
    
    -- Role musí být 'najemnik'
    AND role = 'najemnik'
    
    -- Vytvářející uživatel se automaticky přiřadí k subjektu
    AND (
      (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
      OR created_by = auth.uid()
    )
  );
```

**Vysvětlení:**
- Pouze `admin` a `user` mohou vytvářet nájemníky
- `viewer` NEMŮŽE vytvářet
- Pole `role` MUSÍ být `'najemnik'` (ochrana proti omylu)
- Uživatel, který vytváří, se automaticky stává vlastníkem

### Policy: UPDATE (úprava)

```sql
CREATE POLICY subjects_update ON subjects FOR UPDATE
  USING (
    -- Admin může upravovat všechno
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
    
    -- User může upravovat pouze své subjekty
    OR (
      (SELECT role FROM profiles WHERE id = auth.uid()) = 'user'
      AND EXISTS (
        SELECT 1 FROM user_subjects 
        WHERE user_id = auth.uid() 
        AND subject_id = subjects.id
      )
    )
  )
  WITH CHECK (
    -- Role 'najemnik' NESMÍ být změněna
    role = 'najemnik'
  );
```

**Vysvětlení:**
- `admin` může upravovat všechny nájemníky
- `user` může upravovat pouze své přidělené nájemníky
- `viewer` NEMŮŽE upravovat
- Pole `role` NESMÍ být změněno (ochrana integrity)

### Policy: DELETE (smazání)

```sql
-- DELETE není povolen! Pouze archivace přes UPDATE
CREATE POLICY subjects_delete ON subjects FOR DELETE
  USING (false);
```

**Vysvětlení:**
- **ŽÁDNÉ** smazání! Pouze archivace
- Historická data musí být zachována
- Archivace se provádí přes UPDATE: `archived = true`

---

## Oprávnění podle rolí

### 1. Role: Admin

#### Oprávnění v modulu Nájemník

| Akce | Povoleno | Poznámka |
|------|----------|----------|
| Zobrazit všechny nájemníky | ✅ | Včetně archivovaných |
| Vytvořit nového nájemníka | ✅ | Všechny typy |
| Upravit nájemníka | ✅ | I cizí záznamy |
| Archivovat nájemníka | ✅ | Včetně cizích |
| Zobrazit historii | ✅ | Všech záznamů |
| Spravovat přílohy | ✅ | Všech záznamů |
| Přiřadit nájemníka uživateli | ✅ | Přes user_subjects |

#### Kód: Kontrola oprávnění

```javascript
function canUserPerformAction(userRole, action, recordOwnerId) {
  if (userRole === 'admin') {
    return true; // Admin může vše
  }
  return false;
}
```

---

### 2. Role: User

#### Oprávnění v modulu Nájemník

| Akce | Povoleno | Poznámka |
|------|----------|----------|
| Zobrazit své nájemníky | ✅ | Pouze přidělené přes user_subjects |
| Vytvořit nového nájemníka | ✅ | Stává se vlastníkem |
| Upravit svého nájemníka | ✅ | Pouze vlastní |
| Archivovat svého nájemníka | ✅ | Pouze vlastní |
| Zobrazit historii | ✅ | Pouze vlastních |
| Spravovat přílohy | ✅ | Pouze vlastních |
| Přiřadit nájemníka jinému uživateli | ❌ | Pouze admin |

#### Kód: Kontrola oprávnění

```javascript
async function canUserEditTenant(userId, tenantId) {
  const { data, error } = await supabase
    .from('user_subjects')
    .select('id')
    .eq('user_id', userId)
    .eq('subject_id', tenantId)
    .single();
  
  return !error && data != null;
}
```

---

### 3. Role: Viewer

#### Oprávnění v modulu Nájemník

| Akce | Povoleno | Poznámka |
|------|----------|----------|
| Zobrazit nájemníky | ✅ | Pouze nearchivované, read-only |
| Vytvořit nového nájemníka | ❌ | Žádné zápisy |
| Upravit nájemníka | ❌ | Žádné změny |
| Archivovat nájemníka | ❌ | Žádná archivace |
| Zobrazit historii | ✅ | Pouze čtení |
| Spravovat přílohy | ❌ | Žádné změny |

#### UI změny pro Viewer

```javascript
if (userRole === 'viewer') {
  // Skrýt všechny akční tlačítka
  commonActionsConfig.moduleActions = ['refresh']; // Pouze refresh
  
  // Formuláře pouze v read-only režimu
  formConfig.readonly = true;
}
```

---

## Validace a sanitizace

### Frontend validace

#### 1. Povinná pole

```javascript
const requiredFields = {
  osoba: ['jmeno', 'prijmeni'],
  osvc: ['jmeno', 'prijmeni', 'ico'],
  firma: ['nazev_firmy', 'ico'],
  spolek: ['nazev_firmy'],
  stat: ['nazev_firmy'],
  zastupce: ['jmeno', 'prijmeni', 'zastupuje_id']
};

function validateRequiredFields(data, typ_subjektu) {
  const required = requiredFields[typ_subjektu] || [];
  for (const field of required) {
    if (!data[field] || data[field].trim() === '') {
      return { valid: false, error: `Pole ${field} je povinné` };
    }
  }
  return { valid: true };
}
```

#### 2. Formátování a sanitizace

```javascript
function sanitizeInput(value, type) {
  if (!value) return value;
  
  switch (type) {
    case 'email':
      return value.trim().toLowerCase();
    
    case 'ico':
      // Pouze čísla, 8 znaků
      return value.replace(/\D/g, '').slice(0, 8);
    
    case 'psc':
      // Formát: XXX XX
      const digits = value.replace(/\D/g, '').slice(0, 5);
      return digits.length === 5 ? `${digits.slice(0, 3)} ${digits.slice(3)}` : digits;
    
    case 'phone':
      // Normalizace telefonu
      return value.replace(/\s+/g, ' ').trim();
    
    case 'text':
      // Odstranění HTML tagů
      return value.replace(/<[^>]*>/g, '').trim();
    
    default:
      return value.trim();
  }
}
```

#### 3. Regex validace

```javascript
const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  ico: /^\d{8}$/,
  psc: /^\d{3}\s?\d{2}$/,
  phone: /^\+?\d{9,15}$/,
  rodne_cislo: /^\d{6}\/?\d{3,4}$/
};

function validatePattern(value, type) {
  if (!value) return true; // Volitelné pole
  const pattern = VALIDATION_PATTERNS[type];
  return pattern ? pattern.test(value) : true;
}
```

### Backend validace

#### V db.js před insertom/updatem

```javascript
export async function createTenant(data) {
  // 1. Kontrola povinných polí
  if (!data.typ_subjektu) {
    return { data: null, error: new Error('Typ subjektu je povinný') };
  }
  
  // 2. Sanitizace
  const sanitized = {
    ...data,
    primary_email: data.primary_email?.trim().toLowerCase(),
    ico: data.ico?.replace(/\D/g, ''),
    role: 'najemnik' // VŽDY najemnik!
  };
  
  // 3. Validace formátu
  if (sanitized.ico && !/^\d{8}$/.test(sanitized.ico)) {
    return { data: null, error: new Error('IČO musí mít 8 číslic') };
  }
  
  // 4. Insert do DB
  return await supabase
    .from('subjects')
    .insert(sanitized)
    .select()
    .single();
}
```

---

## Audit a logování

### 1. Tabulka: subject_history

Každá změna nájemníka se automaticky loguje:

```sql
CREATE TABLE subject_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  changed_by UUID REFERENCES profiles(id),
  change_type VARCHAR(20) NOT NULL, -- 'create', 'update', 'archive'
  old_values JSONB,
  new_values JSONB
);
```

### 2. Trigger: Auto-logging změn

```sql
CREATE OR REPLACE FUNCTION log_subject_change()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO subject_history (subject_id, changed_by, change_type, old_values, new_values)
  VALUES (
    NEW.id,
    auth.uid(),
    TG_OP,
    row_to_json(OLD),
    row_to_json(NEW)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER subjects_audit_trigger
  AFTER INSERT OR UPDATE ON subjects
  FOR EACH ROW
  EXECUTE FUNCTION log_subject_change();
```

### 3. Zobrazení historie v UI

```javascript
async function loadTenantHistory(tenantId) {
  const { data, error } = await supabase
    .from('subject_history')
    .select(`
      *,
      changed_by_profile:profiles!changed_by(display_name, email)
    `)
    .eq('subject_id', tenantId)
    .order('changed_at', { ascending: false });
  
  return { data, error };
}
```

---

## Ochrana proti útokům

### 1. SQL Injection

✅ **CHRÁNĚNO**: Supabase automaticky escapuje všechny parametry

```javascript
// ✅ BEZPEČNÉ - Parametrizované query
const { data } = await supabase
  .from('subjects')
  .select()
  .eq('display_name', userInput); // Automaticky escapováno

// ❌ NEBEZPEČNÉ - Nikdy nevytvářet raw SQL s user inputem!
// const sql = `SELECT * FROM subjects WHERE name = '${userInput}'`;
```

### 2. XSS (Cross-Site Scripting)

✅ **CHRÁNĚNO**: Všechny user inputy jsou escapovány před zobrazením

```javascript
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Použití v UI
root.innerHTML = `
  <div class="tenant-name">${escapeHtml(tenant.display_name)}</div>
`;
```

### 3. CSRF (Cross-Site Request Forgery)

✅ **CHRÁNĚNO**: Supabase používá JWT tokeny

- Všechny requesty obsahují `Authorization: Bearer <jwt>`
- Token je vázán na session
- Token expiruje po 1 hodině

### 4. Broken Access Control

✅ **CHRÁNĚNO**: RLS policies na úrovni databáze

- I když někdo obejde frontend, RLS zabrání neautorizovanému přístupu
- Všechny operace musí projít přes RLS

### 5. Sensitive Data Exposure

✅ **CHRÁNĚNO**: Minimalizace exponovaných dat

```javascript
// ✅ DOBŘE - Vybrat pouze potřebná pole
const { data } = await supabase
  .from('subjects')
  .select('id, display_name, primary_email');

// ❌ ŠPATNĚ - Vybrat vše (může obsahovat citlivá data)
// const { data } = await supabase.from('subjects').select('*');
```

### 6. Mass Assignment

✅ **CHRÁNĚNO**: Whitelist povolených polí

```javascript
const ALLOWED_FIELDS = [
  'typ_subjektu', 'jmeno', 'prijmeni', 'nazev_firmy', 
  'ico', 'dic', 'primary_email', 'telefon', 
  'ulice', 'mesto', 'psc', 'poznamka'
];

function filterAllowedFields(data) {
  return Object.keys(data)
    .filter(key => ALLOWED_FIELDS.includes(key))
    .reduce((obj, key) => {
      obj[key] = data[key];
      return obj;
    }, {});
}
```

---

## Checklist bezpečnosti

### Před nasazením do produkce

- [ ] RLS policies jsou AKTIVNÍ na tabulce `subjects`
- [ ] Všechny frontend inputy jsou VALIDOVÁNY
- [ ] Všechny frontend inputy jsou SANITIZOVÁNY
- [ ] XSS ochrana je IMPLEMENTOVÁNA (escapeHtml)
- [ ] Role kontroly jsou na FRONTENDU i BACKENDU
- [ ] Audit log FUNGUJE (subject_history)
- [ ] Žádné SECRETS v kódu
- [ ] Žádné SQL injection RIZIKA
- [ ] HTTPS je AKTIVNÍ
- [ ] JWT tokeny EXPIRUJÍ
- [ ] Error messages NEOBSAHUJÍ citlivé informace

---

## Kontaktní informace

Pro otázky ohledně bezpečnosti kontaktujte:
- **Bezpečnostní tým**: security@example.com
- **Administrátor**: admin@example.com

---

**Konec dokumentu - Oprávnění a Bezpečnost** ✅
