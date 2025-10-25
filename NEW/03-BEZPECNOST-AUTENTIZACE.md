# 03 - Bezpečnost a Autentizace

> **Tento dokument popisuje zabezpečení aplikace, autentizační systém, správu oprávnění a plánovanou dvoufaktorovou autentizaci.**

---

## 📖 Obsah

1. [Přehled Zabezpečení](#přehled-zabezpečení)
2. [Autentizace (Přihlašování)](#autentizace-přihlašování)
3. [Dvoufaktorová Autentizace (2FA)](#dvoufaktorová-autentizace-2fa)
4. [Správa Rolí a Oprávnění](#správa-rolí-a-oprávnění)
5. [Row Level Security (RLS)](#row-level-security-rls)
6. [Audit Log](#audit-log)
7. [Bezpečnostní Standardy](#bezpečnostní-standardy)

---

## 🔐 Přehled Zabezpečení

### Vrstvy zabezpečení

```
┌─────────────────────────────────────────┐
│  1. Frontend Validace                   │
│     - Validace formulářů                │
│     - Kontrola oprávnění před akcí      │
└─────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│  2. Supabase Auth                       │
│     - JWT tokeny                        │
│     - Session management                │
│     - Email verification                │
└─────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│  3. RLS Policies (PostgreSQL)           │
│     - Kontrola na úrovni řádků          │
│     - Automatická filtrace dat          │
└─────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│  4. Audit Log                           │
│     - Záznam všech operací              │
│     - Sledování změn                    │
└─────────────────────────────────────────┘
```

### Klíčové principy

1. **Defense in Depth** - více vrstev zabezpečení
2. **Least Privilege** - minimální nutná oprávnění
3. **Audit Trail** - záznam všech operací
4. **Encryption** - šifrování citlivých dat
5. **Input Validation** - validace všech vstupů

---

## 🔑 Autentizace (Přihlašování)

### Architektura

```
index.html (Login)
    ↓
Supabase Auth
    ↓
JWT Token
    ↓
app.html (Aplikace)
```

### Implementace

#### 1. Přihlašovací stránka (index.html)

```html
<!DOCTYPE html>
<html>
<head>
  <title>Přihlášení - Pronajímatel v5</title>
  <link href="https://cdn.tailwindcss.com" rel="stylesheet">
</head>
<body class="bg-slate-50 min-h-screen flex items-center justify-center">
  
  <div class="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
    <h1 class="text-2xl font-bold mb-6 text-center">Přihlášení</h1>
    
    <form id="loginForm" class="space-y-4">
      <!-- Email -->
      <div>
        <label class="block text-sm font-medium mb-1">E-mail</label>
        <input type="email" name="email" required
          class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
      </div>
      
      <!-- Heslo -->
      <div>
        <label class="block text-sm font-medium mb-1">Heslo</label>
        <input type="password" name="password" required
          class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
      </div>
      
      <!-- Zapomenuté heslo -->
      <div class="text-right">
        <a href="#" id="forgotPassword" class="text-sm text-blue-600 hover:underline">
          Zapomněli jste heslo?
        </a>
      </div>
      
      <!-- Tlačítko -->
      <button type="submit" 
        class="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">
        Přihlásit se
      </button>
    </form>
    
    <!-- Chybová zpráva -->
    <div id="errorMessage" class="hidden mt-4 p-3 bg-red-100 text-red-700 rounded"></div>
  </div>
  
  <script type="module">
    import { supabase } from './src/supabase.js';
    
    const form = document.getElementById('loginForm');
    const errorEl = document.getElementById('errorMessage');
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = form.email.value;
      const password = form.password.value;
      
      // Skryj předchozí chybu
      errorEl.classList.add('hidden');
      
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) throw error;
        
        // Přesměruj na aplikaci
        window.location.href = './app.html';
        
      } catch (err) {
        errorEl.textContent = err.message || 'Chyba při přihlašování';
        errorEl.classList.remove('hidden');
      }
    });
    
    // Zapomenuté heslo
    document.getElementById('forgotPassword').addEventListener('click', async (e) => {
      e.preventDefault();
      const email = prompt('Zadejte váš e-mail:');
      
      if (email) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + '/recover.html'
        });
        
        if (error) {
          alert('Chyba: ' + error.message);
        } else {
          alert('Odkaz pro obnovení hesla byl odeslán na váš e-mail.');
        }
      }
    });
  </script>
</body>
</html>
```

#### 2. Ochrana aplikace (auth.js)

```javascript
// src/auth.js
import { supabase } from "./supabase.js";

/**
 * Bezpečně získá aktuálního uživatele
 */
export async function getUserSafe() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user ?? null;
  } catch (e) {
    console.debug("getUserSafe:", e?.message || e);
    return null;
  }
}

/**
 * Vyžaduje přihlášení - pokud není user, přesměruje na login
 */
export async function requireAuthOnApp() {
  const user = await getUserSafe();
  if (!user) {
    window.location.replace("./index.html");
    return false;
  }
  return true;
}

/**
 * Tvrdé odhlášení (lokální + serverové)
 */
export async function hardLogout() {
  // 1) Lokální odhlášení (vždy uspěje)
  try {
    await supabase.auth.signOut({ scope: "local" });
  } catch (_) {}

  // 2) Serverové odhlášení (best-effort)
  try {
    await supabase.auth.signOut(); // global
  } catch (e) {
    console.debug("Server signOut skipped:", e?.message || e);
  }

  // 3) Přesměruj na login
  window.location.replace("./index.html");
}

// Auto-init při načtení stránky
document.addEventListener("DOMContentLoaded", async () => {
  const here = location.pathname.split("/").pop();

  // Ochrana app.html
  if (here === "app.html") {
    const ok = await requireAuthOnApp();
    if (!ok) return;
  }

  // Tlačítko odhlásit
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", hardLogout);
  }

  // Zobraz email přihlášeného uživatele
  const emailEl = document.getElementById("userEmail");
  if (emailEl) {
    const user = await getUserSafe();
    if (user) emailEl.textContent = user.email ?? "Přihlášený uživatel";
  }
});
```

#### 3. Session Management

```javascript
// Supabase automaticky spravuje session
// JWT token je uložen v localStorage
// Token se automaticky obnovuje před expirací

// Získání session
const { data: { session } } = await supabase.auth.getSession();

// Session obsahuje:
{
  access_token: "eyJ...",      // JWT token
  refresh_token: "v1::...",    // Refresh token
  expires_at: 1234567890,      // Expirace (timestamp)
  user: { ... }                // Data uživatele
}

// Auto-refresh při expiraci
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    console.log('Token obnovený');
  }
  if (event === 'SIGNED_OUT') {
    window.location.href = './index.html';
  }
});
```

### Obnovení hesla

#### 1. Uživatel klikne "Zapomněli jste heslo?"

```javascript
const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: 'https://vase-aplikace.cz/recover.html'
});
```

#### 2. Uživatel dostane email s odkazem

```
Předmět: Obnovení hesla

Klikněte na odkaz pro obnovení hesla:
https://your-project.supabase.co/auth/v1/verify?token=...&type=recovery&redirect_to=https://vase-aplikace.cz/recover.html
```

#### 3. Recover stránka (recover.html)

```html
<!DOCTYPE html>
<html>
<head>
  <title>Obnovení hesla</title>
</head>
<body>
  <form id="recoverForm">
    <h1>Nastavte nové heslo</h1>
    
    <input type="password" name="password" placeholder="Nové heslo" required>
    <input type="password" name="confirmPassword" placeholder="Potvrďte heslo" required>
    
    <button type="submit">Nastavit heslo</button>
  </form>
  
  <script type="module">
    import { supabase } from './src/supabase.js';
    
    document.getElementById('recoverForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const password = e.target.password.value;
      const confirmPassword = e.target.confirmPassword.value;
      
      if (password !== confirmPassword) {
        alert('Hesla se neshodují');
        return;
      }
      
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      
      if (error) {
        alert('Chyba: ' + error.message);
      } else {
        alert('Heslo bylo změněno');
        window.location.href = './index.html';
      }
    });
  </script>
</body>
</html>
```

---

## 🔐 Dvoufaktorová Autentizace (2FA)

> **Status:** 📝 Plánováno (není zatím implementováno)

### Podporované metody

1. **TOTP (Time-based One-Time Password)**
   - Google Authenticator
   - Microsoft Authenticator
   - Authy

2. **SMS** (plánováno)
   - SMS brána (Twilio, Vonage)
   - Náklady: ~0.05 EUR/SMS

3. **Email** (plánováno)
   - Jednodušší implementace
   - Méně bezpečné než TOTP/SMS

### Implementace TOTP (plán)

#### 1. Aktivace 2FA

```javascript
// 1. Uživatel zapne 2FA v nastavení
async function enable2FA() {
  // Vygeneruj tajný klíč
  const { data, error } = await supabase.rpc('enable_2fa');
  
  if (error) {
    alert('Chyba při aktivaci 2FA');
    return;
  }
  
  const { secret, qrCode } = data;
  
  // 2. Zobraz QR kód pro skenování v aplikaci
  document.getElementById('qrCode').innerHTML = `
    <img src="${qrCode}" alt="QR kód">
    <p>Naskenujte tento QR kód v aplikaci Google Authenticator</p>
    <p>Nebo zadejte ručně: ${secret}</p>
  `;
  
  // 3. Požádej o první kód pro ověření
  const code = prompt('Zadejte 6-místný kód z aplikace:');
  
  const { error: verifyError } = await supabase.rpc('verify_2fa_setup', {
    code
  });
  
  if (verifyError) {
    alert('Neplatný kód. Zkuste znovu.');
  } else {
    alert('2FA aktivována!');
  }
}
```

#### 2. Přihlášení s 2FA

```javascript
// 1. Přihlášení email + heslo
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
});

if (error) {
  // Běžná chyba (špatné heslo apod.)
  showError(error.message);
  return;
}

// 2. Pokud má uživatel 2FA, požádej o kód
if (data.user.app_metadata.has_2fa) {
  const code = prompt('Zadejte 6-místný kód z aplikace:');
  
  const { error: verifyError } = await supabase.rpc('verify_2fa_login', {
    code
  });
  
  if (verifyError) {
    // Odhlásit (neúspěšné ověření)
    await supabase.auth.signOut();
    showError('Neplatný 2FA kód');
    return;
  }
}

// 3. Přesměruj na aplikaci
window.location.href = './app.html';
```

#### 3. Databázová struktura (plán)

```sql
-- Rozšíření profiles tabulky
ALTER TABLE profiles ADD COLUMN two_factor_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN two_factor_secret VARCHAR(255);
ALTER TABLE profiles ADD COLUMN two_factor_backup_codes TEXT[]; -- záložní kódy

-- Tabulka pro SMS/Email kódy
CREATE TABLE two_factor_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  code VARCHAR(6) NOT NULL,
  method VARCHAR(20) NOT NULL, -- 'sms', 'email'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '5 minutes',
  used BOOLEAN DEFAULT FALSE
);
```

#### 4. Backend funkce (Edge Functions)

```typescript
// supabase/functions/verify-2fa/index.ts
import { serve } from "std/server";
import * as OTPAuth from "otpauth";

serve(async (req) => {
  const { code, userId } = await req.json();
  
  // Získej secret z databáze
  const { data: user } = await supabase
    .from('profiles')
    .select('two_factor_secret')
    .eq('id', userId)
    .single();
  
  if (!user) {
    return new Response(JSON.stringify({ error: 'User not found' }), {
      status: 404
    });
  }
  
  // Ověř kód
  const totp = new OTPAuth.TOTP({
    secret: user.two_factor_secret
  });
  
  const isValid = totp.verify({ token: code, window: 1 });
  
  return new Response(JSON.stringify({ valid: isValid }), {
    headers: { "Content-Type": "application/json" }
  });
});
```

---

## 👥 Správa Rolí a Oprávnění

### Role v systému

```javascript
// src/security/permissions.js

const ROLES = {
  ADMIN: 'admin',           // Správce systému
  PRONAJIMATEL: 'pronajimatel',  // Vlastník nemovitostí
  NAJEMNIK: 'najemnik',     // Nájemce
  SERVISAK: 'servisak'      // Servisní technik
};
```

### Oprávnění pro role

```javascript
const ROLE_PERMISSIONS = {
  admin: [
    // CRUD operace
    'add', 'edit', 'delete', 'archive',
    // Zobrazení
    'detail', 'search',
    // Export/Import
    'export', 'import', 'print',
    // Speciální
    'save', 'invite', 'history', 'units',
    // Admin
    'approve', 'reject',
    // Přílohy
    'attach', 'refresh'
  ],
  
  pronajimatel: [
    // Může editovat svoje data
    'add', 'edit', 'attach', 'refresh',
    // Zobrazení
    'detail', 'search',
    // Export
    'print',
    // Správa jednotek
    'units'
  ],
  
  najemnik: [
    // Pouze čtení
    'detail', 'refresh', 'search',
    // Může přidávat přílohy (fotky závad)
    'attach'
  ],
  
  servisak: [
    // Čtení + zápis závad
    'detail', 'refresh', 'attach',
    // Hlášení oprav
    'search'
  ]
};
```

### Kontrola oprávnění

```javascript
// src/security/permissions.js

/**
 * Vrátí povolené akce pro danou roli
 */
export function getUserPermissions(role) {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Zkontroluje, zda role má oprávnění
 */
export function hasPermission(role, permission) {
  const permissions = getUserPermissions(role);
  return permissions.includes(permission);
}

/**
 * Filtruje akce podle oprávnění
 */
export function getAllowedActions(role, requestedActions) {
  const permissions = getUserPermissions(role);
  
  return requestedActions.filter(action => {
    const key = typeof action === 'string' ? action : action.key;
    return permissions.includes(key);
  });
}
```

### Použití v komponentách

```javascript
// V tiles/prehled.js
import { getAllowedActions } from '../../../security/permissions.js';

export async function render(root, manifest, { userRole }) {
  // Požadované akce
  const requestedActions = ['add', 'edit', 'delete', 'archive', 'attach'];
  
  // Filtruj podle role
  const allowedActions = getAllowedActions(userRole, requestedActions);
  
  // Vykresli CommonActions
  renderCommonActions(document.getElementById('commonactions'), {
    moduleActions: allowedActions,
    userRole: userRole,
    handlers: {
      onAdd: () => { /* ... */ },
      onEdit: () => { /* ... */ },
      // ...
    }
  });
}
```

### Dynamické načítání z databáze

```javascript
// V app.js
import { registerPermissionsLoader } from './security/permissions.js';
import { getRolePermissions } from './db.js';

// Registruj loader
registerPermissionsLoader(async (role) => {
  const { data, error } = await getRolePermissions(role);
  return error ? null : data;
});

// Načti oprávnění při startu
await loadPermissionsForRole(window.currentUser.role);
```

---

## 🛡️ Row Level Security (RLS)

### Co je RLS?

Row Level Security je PostgreSQL funkce, která **automaticky filtruje řádky na úrovni databáze** podle pravidel (policies).

### Výhody RLS

1. ✅ **Bezpečnost na DB úrovni** - nelze obejít (ani přes SQL)
2. ✅ **Automatická filtrace** - nemusíš psát WHERE podmínky
3. ✅ **Konzistence** - stejná pravidla pro všechny klienty
4. ✅ **Performance** - optimalizováno PostgreSQL

### Příklad RLS Policy

```sql
-- Uživatel vidí jen svoje záznamy
CREATE POLICY "Users view own records"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Pronajímatel vidí jen svoje nemovitosti
CREATE POLICY "Landlords view own properties"
  ON properties FOR SELECT
  USING (
    owner_id IN (
      SELECT subject_id 
      FROM user_subjects 
      WHERE user_id = auth.uid()
    )
  );

-- Admin vidí vše
CREATE POLICY "Admins view all"
  ON properties FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### RLS v aplikaci

#### 1. Zapnutí RLS na tabulce

```sql
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
```

#### 2. Vytvoření policies

```sql
-- SELECT (čtení)
CREATE POLICY "properties_select" ON properties FOR SELECT
  USING (
    -- Admin vidí vše
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
    OR
    -- Vlastník vidí svoje
    owner_id IN (
      SELECT subject_id FROM user_subjects WHERE user_id = auth.uid()
    )
    OR
    -- Nájemník vidí nemovitosti kde má jednotku
    id IN (
      SELECT property_id FROM units 
      WHERE tenant_id IN (
        SELECT subject_id FROM user_subjects WHERE user_id = auth.uid()
      )
    )
  );

-- INSERT (vytváření)
CREATE POLICY "properties_insert" ON properties FOR INSERT
  WITH CHECK (
    -- Pouze admin nebo pronajímatel
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'pronajimatel')
  );

-- UPDATE (úprava)
CREATE POLICY "properties_update" ON properties FOR UPDATE
  USING (
    -- Admin může upravit vše
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
    OR
    -- Vlastník může upravit svoje
    owner_id IN (
      SELECT subject_id FROM user_subjects WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    -- Stejné podmínky jako USING
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
    OR
    owner_id IN (
      SELECT subject_id FROM user_subjects WHERE user_id = auth.uid()
    )
  );

-- DELETE (mazání)
CREATE POLICY "properties_delete" ON properties FOR DELETE
  USING (
    -- Pouze admin
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );
```

### RLS Helper funkce

```sql
-- Získání role aktuálního uživatele
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS VARCHAR(50) AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$ LANGUAGE SQL STABLE;

-- Kontrola, zda je uživatel admin
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
$$ LANGUAGE SQL STABLE;

-- Použití v policies
CREATE POLICY "admins_all_access" ON properties FOR ALL
  USING (auth.is_admin());
```

---

## 📜 Audit Log

### Účel

Zaznamenává **všechny důležité operace** v aplikaci pro účely:
- Kontroly změn
- Debugging
- Compliance
- Forenzní analýzu

### Struktura tabulky

```sql
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  action VARCHAR(50) NOT NULL,      -- 'create', 'update', 'delete', 'login', ...
  entity_type VARCHAR(100),         -- 'property', 'unit', 'contract', ...
  entity_id UUID,                   -- ID záznamu
  changes JSONB,                    -- Co se změnilo (diff)
  ip_address INET,                  -- IP adresa
  user_agent TEXT,                  -- Browser
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pro rychlé hledání
CREATE INDEX idx_audit_log_user ON audit_log(user_id);
CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_created ON audit_log(created_at DESC);
```

### Automatické logování (trigger)

```sql
-- Funkce pro logování
CREATE OR REPLACE FUNCTION log_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (
    user_id,
    action,
    entity_type,
    entity_id,
    changes
  ) VALUES (
    auth.uid(),
    TG_OP,  -- INSERT, UPDATE, DELETE
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE
      WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD)
      WHEN TG_OP = 'UPDATE' THEN jsonb_build_object(
        'old', to_jsonb(OLD),
        'new', to_jsonb(NEW)
      )
      ELSE to_jsonb(NEW)
    END
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger na tabulce properties
CREATE TRIGGER properties_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION log_changes();
```

### Použití v aplikaci

```javascript
// Zobrazení audit logu pro záznam
async function showAuditLog(entityType, entityId) {
  const { data, error } = await supabase
    .from('audit_log')
    .select(`
      *,
      user:profiles(display_name, email)
    `)
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Audit log error:', error);
    return;
  }
  
  // Vykresli timeline
  renderAuditTimeline(data);
}
```

---

## 🔒 Bezpečnostní Standardy

### 1. Hesla

```javascript
// Minimální požadavky
const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: false
};

// Validace hesla
function validatePassword(password) {
  const errors = [];
  
  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`Heslo musí mít alespoň ${PASSWORD_REQUIREMENTS.minLength} znaků`);
  }
  
  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Heslo musí obsahovat velké písmeno');
  }
  
  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Heslo musí obsahovat malé písmeno');
  }
  
  if (PASSWORD_REQUIREMENTS.requireNumbers && !/\d/.test(password)) {
    errors.push('Heslo musí obsahovat číslo');
  }
  
  return errors;
}
```

### 2. Session Timeout

```javascript
// Automatické odhlášení po neaktivitě
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minut

let lastActivity = Date.now();

// Tracking aktivity
['click', 'keypress', 'scroll', 'mousemove'].forEach(event => {
  document.addEventListener(event, () => {
    lastActivity = Date.now();
  });
});

// Kontrola timeoutu
setInterval(() => {
  if (Date.now() - lastActivity > SESSION_TIMEOUT) {
    alert('Session vypršela. Budete odhlášeni.');
    hardLogout();
  }
}, 60 * 1000); // Každou minutu
```

### 3. XSS Protection

```javascript
// Vždy escapuj user input při renderování
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Použití
root.innerHTML = `<div>${escapeHtml(userInput)}</div>`;
```

### 4. CSRF Protection

```javascript
// Supabase automaticky chrání proti CSRF pomocí JWT tokenů
// Token je v hlavičce Authorization: Bearer <token>
```

### 5. SQL Injection Protection

```javascript
// Supabase má built-in ochranu
// NIKDY nepoužívej raw SQL s user inputem

// ❌ ŠPATNĚ
const { data } = await supabase.rpc('raw_sql', {
  query: `SELECT * FROM users WHERE name = '${userName}'`
});

// ✅ SPRÁVNĚ
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('name', userName);
```

---

## ✅ Bezpečnostní Checklist

### Před nasazením do produkce:

- [ ] RLS policies na všech tabulkách
- [ ] Audit log implementován
- [ ] Hesla validována (min. 8 znaků)
- [ ] Session timeout nastaven (30 min)
- [ ] Email verifikace zapnuta
- [ ] 2FA implementována (plán)
- [ ] XSS protection (escape user input)
- [ ] HTTPS certifikát (SSL)
- [ ] Rate limiting (Supabase má built-in)
- [ ] Backup databáze (denní)
- [ ] Secrets v environment variables (ne v kódu)
- [ ] Error handling (neodhalovat citlivé info)
- [ ] Logging citlivých operací
- [ ] Testování penetračních testů

---

## 📚 Další Čtení

- **[07-DATABASE-SCHEMA.md](./07-DATABASE-SCHEMA.md)** - RLS policies v databázi
- **[10-CHECKLIST-PRAVIDLA.md](./10-CHECKLIST-PRAVIDLA.md)** - Bezpečnostní pravidla

---

**Konec dokumentu - Bezpečnost a Autentizace** ✅
