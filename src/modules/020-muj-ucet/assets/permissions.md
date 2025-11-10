# Oprávnění a bezpečnost - Moduly 010 a 020

**Verze:** 2025-11-10  
**Účel:** Definice oprávnění, rolí a bezpečnostních politik pro autentizaci a 2FA

---

## 📋 Obsah

1. [Role a oprávnění](#role-a-oprávnění)
2. [Oprávnění pro modul 010](#oprávnění-pro-modul-010)
3. [Oprávnění pro modul 020](#oprávnění-pro-modul-020)
4. [RLS Policies](#rls-policies)
5. [Rate Limiting](#rate-limiting)
6. [Šifrování citlivých dat](#šifrování-citlivých-dat)
7. [Audit Trail](#audit-trail)

---

## Role a oprávnění

### Definice rolí

Aplikace podporuje následující role:

| Role | Popis | Oprávnění |
|------|-------|-----------|
| **admin** | Administrátor systému | Veškerá oprávnění včetně správy uživatelů a resetování 2FA |
| **manager** | Správce nemovitostí | Správa nemovitostí, jednotek, smluv, nájemníků |
| **user** | Běžný uživatel | Čtení a úprava vlastního profilu, zobrazení přiřazených nemovitostí |
| **viewer** | Pozorovatel | Pouze čtení, bez editace |

### Systém oprávnění

Oprávnění jsou definována ve formátu: `{modul}.{akce}`

**Příklady:**
- `users.create` - Vytvořit uživatele
- `users.update` - Upravit uživatele
- `users.delete` - Smazat uživatele
- `users.reset_2fa` - Resetovat 2FA uživatele
- `profiles.update_own` - Upravit vlastní profil
- `profiles.manage_2fa` - Spravovat vlastní 2FA
- `properties.view_managed` - Zobrazit spravované nemovitosti

---

## Oprávnění pro modul 010

### Správa uživatelů (010-sprava-uzivatelu)

#### Tile: Přehled (prehled.js)

**Viditelnost dat:**
- `admin` - Vidí všechny uživatele
- `manager` - Vidí pouze uživatele ve své organizaci (pokud implementováno)
- `user` - Nemá přístup k této tile
- `viewer` - Nemá přístup k této tile

**Akce a oprávnění:**

| Akce | Oprávnění | Popis | Role |
|------|-----------|-------|------|
| **add** | `users.create` | Vytvoření nového uživatele | admin |
| **edit** | `users.update` | Úprava existujícího uživatele | admin |
| **archive** | `users.archive` | Archivace uživatele | admin |
| **reset-2fa** | `users.reset_2fa` | Resetování 2FA | admin |
| **refresh** | - | Obnovení seznamu | všichni s přístupem |

**Implementace kontroly oprávnění:**

```javascript
// tiles/prehled.js

import { getUserPermissions, checkPermission } from '/src/security/permissions.js';

async function drawActions() {
  const userRole = window.currentUserRole || 'viewer';
  const perms = getUserPermissions(userRole);
  
  const hasCreatePerm = checkPermission(perms, 'users.create');
  const hasUpdatePerm = checkPermission(perms, 'users.update');
  const hasArchivePerm = checkPermission(perms, 'users.archive');
  const hasReset2FAPerm = checkPermission(perms, 'users.reset_2fa');
  
  const hasSel = !!selectedRow && !selectedRow.archived;
  
  renderCommonActions(document.getElementById('commonactions'), {
    moduleActions: ['add', 'edit', 'archive', 'reset-2fa', 'refresh'],
    userRole,
    handlers: {
      onAdd: hasCreatePerm ? () => navigateTo('#/m/010-sprava-uzivatelu/f/create') : undefined,
      onEdit: (hasUpdatePerm && hasSel) ? () => navigateTo(`#/m/010-sprava-uzivatelu/f/form?id=${selectedRow.id}`) : undefined,
      onArchive: (hasArchivePerm && hasSel) ? async () => {
        await archiveUser(selectedRow.id);
        await render(root);
      } : undefined,
      onReset2FA: (hasReset2FAPerm && hasSel) ? async () => {
        if (confirm(`Opravdu chcete resetovat 2FA pro uživatele ${selectedRow.display_name}?`)) {
          await reset2FA(selectedRow.id);
          showToast('2FA bylo resetováno', 'success');
          await render(root);
        }
      } : undefined,
      onRefresh: () => render(root)
    }
  });
}
```

#### Tile: 2FA Audit (audit-2fa.js)

**Viditelnost:**
- `admin` - Vidí všechny události
- Ostatní - Nemají přístup

**Data filtering:**
```javascript
// Pouze admin může vidět audit všech uživatelů
if (userRole !== 'admin') {
  throw new Error('Přístup odepřen');
}
```

#### Form: Formulář uživatele (form.js)

**Úprava uživatele:**
- `admin` - Může upravit jakéhokoli uživatele
- `user` - Nemůže upravovat jiné uživatele (pouze vlastní profil v modulu 020)

**Reset 2FA akce:**
- Pouze `admin` s oprávněním `users.reset_2fa`

```javascript
// forms/form.js

// Reset 2FA button visibility
const canReset2FA = checkPermission(userPermissions, 'users.reset_2fa');

if (canReset2FA && data.id !== currentUserId) {
  // Show reset button
  showReset2FAButton();
}
```

#### Form: Pozvání (create.js)

**Vytvoření uživatele:**
- Pouze `admin` s oprávněním `users.create`

**Vynutit 2FA:**
- Pokud je zaškrtnuto `require_2fa`, uživatel musí nastavit 2FA při prvním přihlášení

---

## Oprávnění pro modul 020

### Můj účet (020-muj-ucet)

#### Form: Profil (form.js)

**Základní pravidlo:** Každý uživatel může upravovat pouze **vlastní profil**.

**Sekce a oprávnění:**

| Sekce | Oprávnění | Popis |
|-------|-----------|-------|
| **Základní údaje** | `profiles.update_own` | Úprava jména, e-mailu, telefonu |
| **Heslo** | `profiles.change_password` | Změna hesla (vyžaduje staré heslo) |
| **2FA Management** | `profiles.manage_2fa` | Zapnutí/vypnutí 2FA metod |
| **Rychlý přístup** | `profiles.view_quick_access` | Zobrazení spravovaných nemovitostí |

**Implementace:**

```javascript
// forms/form.js

async function render(root, params = {}) {
  const currentUser = await getCurrentUser();
  const profileId = params.id;
  
  // Check: Can only edit own profile
  if (profileId && profileId !== currentUser.id) {
    root.innerHTML = `<div class="p-4 text-red-600">Nemáte oprávnění upravovat tento profil</div>`;
    return;
  }
  
  // If no ID provided, use current user
  const targetId = profileId || currentUser.id;
  
  // Load profile data
  const { data, error } = await getProfile(targetId);
  
  if (error || !data) {
    root.innerHTML = `<div class="p-4 text-red-600">Profil nenalezen</div>`;
    return;
  }
  
  // Render form with sections
  renderProfileForm(root, data);
}
```

### Změna hesla

**Požadavky:**
1. Musí znát staré heslo
2. Nové heslo musí splňovat požadavky:
   - Minimálně 8 znaků
   - Obsahuje velké i malé písmeno
   - Obsahuje číslo
   - Obsahuje speciální znak (volitelné)

```javascript
async function changePassword(oldPassword, newPassword) {
  // Validate password strength
  if (newPassword.length < 8) {
    return { error: 'Heslo musí mít alespoň 8 znaků' };
  }
  
  if (!/[a-z]/.test(newPassword) || !/[A-Z]/.test(newPassword)) {
    return { error: 'Heslo musí obsahovat velké i malé písmeno' };
  }
  
  if (!/[0-9]/.test(newPassword)) {
    return { error: 'Heslo musí obsahovat alespoň jedno číslo' };
  }
  
  // Call Supabase auth
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword
  });
  
  if (error) {
    return { error: error.message };
  }
  
  // Log event
  await logAuditEvent('password_changed', currentUser.id);
  
  return { data, error: null };
}
```

### Správa 2FA

**Oprávnění:** `profiles.manage_2fa`

**Akce:**
- Zapnout/vypnout 2FA
- Přidat/odebrat metodu
- Generovat recovery kódy
- Setup TOTP

**Bezpečnostní kontroly:**

```javascript
// Při zapnutí 2FA
async function enable2FAMethod(method, details) {
  // 1. Verify password first
  const passwordVerified = await verifyPassword(currentPassword);
  if (!passwordVerified) {
    return { error: 'Nesprávné heslo' };
  }
  
  // 2. For SMS: verify phone number
  if (method === 'sms' && !profile.primary_phone) {
    return { error: 'Nejprve nastavte telefonní číslo' };
  }
  
  // 3. Send test code and verify
  const { challenge_id } = await send2FATestCode(method);
  
  // User must verify the code before method is enabled
  return { challenge_id, method };
}

// Při vypnutí 2FA
async function disable2FAMethod(method) {
  // 1. Verify password
  const passwordVerified = await verifyPassword(currentPassword);
  if (!passwordVerified) {
    return { error: 'Nesprávné heslo' };
  }
  
  // 2. If disabling last method, require confirmation
  const activeMethods = profile.twofa_methods || [];
  if (activeMethods.length === 1) {
    const confirmed = confirm('Opravdu chcete vypnout poslední metodu 2FA? Doporučujeme mít alespoň jednu aktivní.');
    if (!confirmed) {
      return { error: 'Zrušeno uživatelem' };
    }
  }
  
  // 3. Disable method
  const { data, error } = await update2FAMethods(method, 'remove');
  
  // 4. Log event
  await logTwoFAEvent('method_disabled', method);
  
  return { data, error };
}
```

### Rychlý přístup k nemovitostem

**Oprávnění:** `profiles.view_quick_access`

**Viditelnost:**
- Uživatel vidí pouze nemovitosti, kde je:
  - Správce (v `property_managers`)
  - Vlastník (přes `subjects` → `user_subjects`)

**Data filtering:**

```javascript
// Managed properties
const { data: managed } = await supabase
  .from('property_managers')
  .select('property:properties(*), role')
  .eq('profile_id', currentUser.id);

// Owned properties
const { data: userSubjects } = await supabase
  .from('user_subjects')
  .select('subject_id')
  .eq('profile_id', currentUser.id);

const subjectIds = userSubjects.map(s => s.subject_id);

const { data: owned } = await supabase
  .from('properties')
  .select('*')
  .in('pronajimatel_id', subjectIds);
```

---

## RLS Policies

### Tabulka: profiles

```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- SELECT: All authenticated users can view profiles
CREATE POLICY profiles_select ON profiles
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- UPDATE: Users can update only their own profile, or admins can update anyone
CREATE POLICY profiles_update ON profiles
  FOR UPDATE
  USING (
    auth.uid() = id 
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- INSERT: Only admins can create new profiles
CREATE POLICY profiles_insert ON profiles
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- DELETE: Only admins (soft delete via archived flag preferred)
CREATE POLICY profiles_delete ON profiles
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### Tabulka: twofa_events

```sql
ALTER TABLE twofa_events ENABLE ROW LEVEL SECURITY;

-- SELECT: Users can view only their own events, admins can view all
CREATE POLICY twofa_events_select ON twofa_events
  FOR SELECT
  USING (
    profile_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- INSERT: System can insert (via service role), users can log their own events
CREATE POLICY twofa_events_insert ON twofa_events
  FOR INSERT
  WITH CHECK (
    profile_id = auth.uid()
    OR auth.role() = 'service_role'
  );

-- UPDATE/DELETE: Not allowed
```

### Tabulka: property_managers

```sql
ALTER TABLE property_managers ENABLE ROW LEVEL SECURITY;

-- SELECT: Users can view records where they are the manager or admin
CREATE POLICY property_managers_select ON property_managers
  FOR SELECT
  USING (
    profile_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- INSERT: Only admins and managers can assign managers
CREATE POLICY property_managers_insert ON property_managers
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- UPDATE/DELETE: Only admins
CREATE POLICY property_managers_update ON property_managers
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY property_managers_delete ON property_managers
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### Tabulka: property_documents

```sql
ALTER TABLE property_documents ENABLE ROW LEVEL SECURITY;

-- SELECT: Users can view documents of properties they manage or own
CREATE POLICY property_documents_select ON property_documents
  FOR SELECT
  USING (
    -- User is manager of this property
    EXISTS (
      SELECT 1 FROM property_managers 
      WHERE property_id = property_documents.property_id 
      AND profile_id = auth.uid()
    )
    OR
    -- User is owner of this property
    EXISTS (
      SELECT 1 FROM properties p
      JOIN subjects s ON p.pronajimatel_id = s.id
      JOIN user_subjects us ON s.id = us.subject_id
      WHERE p.id = property_documents.property_id
      AND us.profile_id = auth.uid()
    )
    OR
    -- User is admin
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- INSERT: Managers and owners can upload documents
CREATE POLICY property_documents_insert ON property_documents
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM property_managers 
      WHERE property_id = property_documents.property_id 
      AND profile_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM properties p
      JOIN subjects s ON p.pronajimatel_id = s.id
      JOIN user_subjects us ON s.id = us.subject_id
      WHERE p.id = property_documents.property_id
      AND us.profile_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- UPDATE/DELETE: Only uploader or admin
CREATE POLICY property_documents_update ON property_documents
  FOR UPDATE
  USING (
    uploaded_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY property_documents_delete ON property_documents
  FOR DELETE
  USING (
    uploaded_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

---

## Rate Limiting

### Přihlášení

**Pravidla:**
- Max 5 pokusů za 15 minut na IP adresu
- Max 10 pokusů za hodinu na účet (username/email)
- Po překročení: dočasný ban na 30 minut

**Implementace:**

```javascript
// Backend: /api/auth/login

const RATE_LIMIT_IP = 5; // attempts per 15 min
const RATE_LIMIT_ACCOUNT = 10; // attempts per hour
const BAN_DURATION = 30 * 60 * 1000; // 30 minutes

async function checkRateLimit(identifier, ip) {
  const now = Date.now();
  
  // Check IP-based limit
  const ipAttempts = await redis.get(`login_attempts:ip:${ip}`);
  if (ipAttempts && parseInt(ipAttempts) >= RATE_LIMIT_IP) {
    const ttl = await redis.ttl(`login_attempts:ip:${ip}`);
    throw new Error(`Příliš mnoho pokusů. Zkuste znovu za ${Math.ceil(ttl / 60)} minut.`);
  }
  
  // Check account-based limit
  const accountAttempts = await redis.get(`login_attempts:account:${identifier}`);
  if (accountAttempts && parseInt(accountAttempts) >= RATE_LIMIT_ACCOUNT) {
    const ttl = await redis.ttl(`login_attempts:account:${identifier}`);
    throw new Error(`Účet dočasně uzamčen. Zkuste znovu za ${Math.ceil(ttl / 60)} minut.`);
  }
}

async function recordFailedAttempt(identifier, ip) {
  // Increment IP counter (15 min expiry)
  await redis.incr(`login_attempts:ip:${ip}`);
  await redis.expire(`login_attempts:ip:${ip}`, 15 * 60);
  
  // Increment account counter (1 hour expiry)
  await redis.incr(`login_attempts:account:${identifier}`);
  await redis.expire(`login_attempts:account:${identifier}`, 60 * 60);
}

async function clearAttempts(identifier, ip) {
  await redis.del(`login_attempts:ip:${ip}`);
  await redis.del(`login_attempts:account:${identifier}`);
}
```

### 2FA Verification

**Pravidla:**
- Max 5 pokusů za challenge
- Max 3 pokusy za 10 minut na účet
- Po překročení: challenge invalidován, nutno začít znovu

**Implementace:**

```javascript
// Backend: /api/auth/twofa/verify

const MAX_2FA_ATTEMPTS = 5;

async function verify2FACode(challengeId, method, code) {
  // Get challenge from DB/Redis
  const challenge = await getChallenge(challengeId);
  
  if (!challenge) {
    throw new Error('Neplatný nebo expirovaný challenge');
  }
  
  // Check attempt count
  if (challenge.attempts >= MAX_2FA_ATTEMPTS) {
    await invalidateChallenge(challengeId);
    throw new Error('Příliš mnoho neúspěšných pokusů. Přihlaste se znovu.');
  }
  
  // Verify code
  const isValid = await verifyCode(method, code, challenge.expected_code);
  
  if (!isValid) {
    // Increment attempts
    await incrementChallengeAttempts(challengeId);
    
    const remaining = MAX_2FA_ATTEMPTS - (challenge.attempts + 1);
    throw new Error(`Neplatný kód. Zbývá ${remaining} pokusů.`);
  }
  
  // Success - clear challenge and return token
  await invalidateChallenge(challengeId);
  return generateAuthToken(challenge.user_id);
}
```

### Odesílání kódů (E-mail/SMS)

**Pravidla:**
- Max 3 kódy za 10 minut
- Min 30s mezi požadavky (cooldown)

**Implementace:**

```javascript
// Backend: /api/auth/twofa/send

const MAX_CODE_SENDS = 3; // per 10 min
const COOLDOWN = 30; // seconds

async function send2FACode(challengeId, method) {
  const challenge = await getChallenge(challengeId);
  
  if (!challenge) {
    throw new Error('Neplatný challenge');
  }
  
  // Check cooldown
  const lastSent = challenge.last_code_sent_at;
  if (lastSent && (Date.now() - lastSent) < COOLDOWN * 1000) {
    const remaining = COOLDOWN - Math.floor((Date.now() - lastSent) / 1000);
    throw new Error(`Počkejte ještě ${remaining} sekund.`);
  }
  
  // Check send count
  const sendCount = challenge.code_send_count || 0;
  if (sendCount >= MAX_CODE_SENDS) {
    throw new Error('Příliš mnoho požadavků. Zkuste to později.');
  }
  
  // Generate and send code
  const code = generateCode(6);
  
  if (method === 'email') {
    await sendEmail(challenge.email, code);
  } else if (method === 'sms') {
    await sendSMS(challenge.phone, code);
  }
  
  // Update challenge
  await updateChallenge(challengeId, {
    expected_code: code,
    code_sent_at: Date.now(),
    code_send_count: sendCount + 1,
    code_expires_at: Date.now() + 10 * 60 * 1000 // 10 min
  });
}
```

---

## Šifrování citlivých dat

### TOTP Secret

**Šifrování:**
- Algoritmus: AES-256-GCM
- Klíč: Uložen v environment variable `TWOFA_ENCRYPTION_KEY`
- Nikdy neuložen v plain textu

**Implementace:**

```javascript
// Backend: crypto utils

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(process.env.TWOFA_ENCRYPTION_KEY, 'hex');

function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  // Return: iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

function decrypt(encryptedData) {
  const parts = encryptedData.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];
  
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

// Usage
async function saveTOTPSecret(userId, secret) {
  const encrypted = encrypt(secret);
  
  await supabase
    .from('profiles')
    .update({ twofa_totp_secret: encrypted })
    .eq('id', userId);
}

async function getTOTPSecret(userId) {
  const { data } = await supabase
    .from('profiles')
    .select('twofa_totp_secret')
    .eq('id', userId)
    .single();
  
  if (!data.twofa_totp_secret) return null;
  
  return decrypt(data.twofa_totp_secret);
}
```

### Recovery Codes

**Šifrování:**
- Stejný mechanismus jako TOTP secret
- Uložen jako JSON array šifrovaných kódů
- Každý kód má flag `used: boolean`

**Implementace:**

```javascript
async function generateRecoveryCodes(userId) {
  // Generate 10 random codes
  const codes = [];
  for (let i = 0; i < 10; i++) {
    const code = crypto.randomBytes(8).toString('hex').toUpperCase().match(/.{1,4}/g).join('-');
    codes.push({ code, used: false });
  }
  
  // Encrypt entire array
  const encrypted = encrypt(JSON.stringify(codes));
  
  await supabase
    .from('profiles')
    .update({ twofa_recovery_codes: encrypted })
    .eq('id', userId);
  
  // Return plain codes to user (only time they'll see them)
  return codes.map(c => c.code);
}

async function verifyRecoveryCode(userId, code) {
  const { data } = await supabase
    .from('profiles')
    .select('twofa_recovery_codes')
    .eq('id', userId)
    .single();
  
  if (!data.twofa_recovery_codes) {
    return { valid: false, error: 'Žádné recovery kódy' };
  }
  
  // Decrypt
  const codes = JSON.parse(decrypt(data.twofa_recovery_codes));
  
  // Find matching code
  const matchIndex = codes.findIndex(c => c.code === code && !c.used);
  
  if (matchIndex === -1) {
    return { valid: false, error: 'Neplatný nebo použitý kód' };
  }
  
  // Mark as used
  codes[matchIndex].used = true;
  
  // Re-encrypt and save
  const encrypted = encrypt(JSON.stringify(codes));
  await supabase
    .from('profiles')
    .update({ twofa_recovery_codes: encrypted })
    .eq('id', userId);
  
  return { valid: true };
}
```

---

## Audit Trail

### Události k logování

#### Autentizační události

| Událost | Typ | Kdy | Metadata |
|---------|-----|-----|----------|
| login_success | auth | Úspěšné přihlášení | ip, user_agent, 2fa_used |
| login_failed | auth | Neúspěšné přihlášení | ip, user_agent, reason |
| logout | auth | Odhlášení | ip, user_agent |
| password_changed | auth | Změna hesla | ip, user_agent |
| password_reset | auth | Reset hesla | ip, user_agent |

#### 2FA události

| Událost | Typ | Kdy | Metadata |
|---------|-----|-----|----------|
| twofa_enabled | 2fa | Zapnutí 2FA | method, ip, user_agent |
| twofa_disabled | 2fa | Vypnutí 2FA | method, ip, user_agent |
| twofa_method_added | 2fa | Přidání metody | method, ip, user_agent |
| twofa_method_removed | 2fa | Odebrání metody | method, ip, user_agent |
| twofa_verify_success | 2fa | Úspěšné ověření | method, ip, user_agent |
| twofa_verify_failed | 2fa | Neúspěšné ověření | method, ip, user_agent, attempts |
| twofa_code_sent | 2fa | Odeslání kódu | method, ip, user_agent |
| twofa_recovery_used | 2fa | Použití recovery kódu | ip, user_agent |
| twofa_reset_by_admin | 2fa | Reset adminem | admin_id, ip, user_agent |

#### Profilové události

| Událost | Typ | Kdy | Metadata |
|---------|-----|-----|----------|
| profile_updated | profile | Úprava profilu | changed_fields, ip, user_agent |
| email_changed | profile | Změna e-mailu | old_email, new_email, ip |
| phone_changed | profile | Změna telefonu | old_phone, new_phone, ip |

### Implementace audit logu

```javascript
// src/services/audit.js

export async function logAuditEvent(eventType, userId, metadata = {}) {
  try {
    const ip = await getCurrentIP();
    const userAgent = navigator.userAgent;
    
    await supabase.from('audit_log').insert({
      table_name: 'profiles',
      record_id: userId,
      action: eventType,
      old_values: metadata.old_values || null,
      new_values: metadata.new_values || null,
      changed_at: new Date().toISOString(),
      changed_by: userId,
      metadata: {
        ip,
        user_agent: userAgent,
        ...metadata
      }
    });
  } catch (err) {
    console.error('Failed to log audit event:', err);
    // Don't throw - audit failure shouldn't break functionality
  }
}

export async function log2FAEvent(eventType, userId, method, success, metadata = {}) {
  try {
    const ip = await getCurrentIP();
    const userAgent = navigator.userAgent;
    
    await supabase.from('twofa_events').insert({
      profile_id: userId,
      event_type: eventType,
      method,
      success,
      ip,
      user_agent: userAgent,
      metadata,
      created_at: new Date().toISOString()
    });
  } catch (err) {
    console.error('Failed to log 2FA event:', err);
  }
}
```

### Zobrazení audit logu

```javascript
// Tile: 2FA Audit (tiles/audit-2fa.js)

async function render(root) {
  const { data: events } = await supabase
    .from('twofa_events')
    .select(`
      *,
      profile:profiles(username, display_name)
    `)
    .order('created_at', { ascending: false })
    .limit(100);
  
  const columns = [
    { key: 'created_at', label: 'Datum', width: '15%', sortable: true },
    { key: 'username', label: 'Uživatel', width: '15%' },
    { key: 'event_type', label: 'Událost', width: '18%' },
    { key: 'method', label: 'Metoda', width: '10%' },
    { key: 'success', label: 'Výsledek', width: '8%' },
    { key: 'ip', label: 'IP', width: '12%' },
    { key: 'user_agent_short', label: 'Zařízení', width: '22%' }
  ];
  
  const rows = events.map(e => ({
    ...e,
    username: e.profile?.username || '—',
    success: e.success ? '✅ Úspěch' : '❌ Chyba',
    user_agent_short: parseUserAgent(e.user_agent)
  }));
  
  renderTable(root, { columns, rows });
}

function parseUserAgent(ua) {
  // Simple parser for common browsers
  if (ua.includes('Chrome')) return '🌐 Chrome';
  if (ua.includes('Firefox')) return '🦊 Firefox';
  if (ua.includes('Safari')) return '🧭 Safari';
  if (ua.includes('Edge')) return '🌊 Edge';
  return '🌐 Jiný';
}
```

---

## Summary

### Klíčové bezpečnostní principy

1. **Principle of Least Privilege**
   - Každý uživatel má pouze oprávnění, která potřebuje
   - Admin má plný přístup, user pouze k vlastnímu profilu

2. **Defense in Depth**
   - RLS na databázi
   - Oprávnění v aplikační vrstvě
   - Rate limiting
   - Šifrování citlivých dat

3. **Audit Everything**
   - Každá důležitá akce je zalogována
   - IP adresa a user agent vždy zaznamenány
   - Umožňuje forensic analysis v případě incidentu

4. **Secure by Default**
   - 2FA doporučeno (volitelně vynuceno)
   - Silná hesla vynucena
   - Session timeouty
   - HTTPS only

---

**Poslední aktualizace:** 2025-11-10  
**Autor:** PatrikCechlovsky
