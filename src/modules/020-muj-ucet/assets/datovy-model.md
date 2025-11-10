# Datový model - Moduly 010 a 020

**Verze:** 2025-11-10  
**Účel:** Návrh databázových tabulek, migrací a API pro autentizaci a 2FA

---

## 📋 Obsah

1. [Přehled změn](#přehled-změn)
2. [Rozšíření tabulky profiles](#rozšíření-tabulky-profiles)
3. [Nová tabulka: twofa_events](#nová-tabulka-twofa_events)
4. [Nová tabulka: property_managers](#nová-tabulka-property_managers)
5. [Nová tabulka: property_documents](#nová-tabulka-property_documents)
6. [Migrace SQL](#migrace-sql)
7. [API Endpoints](#api-endpoints)
8. [Datové struktury](#datové-struktury)

---

## Přehled změn

### Modifikace existujících tabulek

| Tabulka | Změna | Účel |
|---------|-------|------|
| `profiles` | Přidání sloupců pro 2FA | Uložení 2FA nastavení a secrets |

### Nové tabulky

| Tabulka | Účel | Velikost (est.) |
|---------|------|-----------------|
| `twofa_events` | Audit log 2FA událostí | ~1000 řádků/měsíc |
| `property_managers` | Vazba uživatelů na spravované nemovitosti | ~500 řádků |
| `property_documents` | Dokumenty nemovitostí | ~5000 řádků |

---

## Rozšíření tabulky profiles

### Nové sloupce

| Sloupec | Typ | Povinné | Výchozí | Popis |
|---------|-----|---------|---------|-------|
| `primary_phone` | VARCHAR(20) | ❌ | NULL | Primární telefon pro SMS 2FA |
| `primary_email` | VARCHAR(255) | ❌ | NULL | Primární e-mail (může se lišit od auth.email) |
| `password_hash` | TEXT | ❌ | NULL | Hash hesla (pokud nepoužíváte Supabase Auth) |
| `twofa_enabled` | BOOLEAN | ✅ | false | Zda má uživatel zapnuto 2FA |
| `twofa_methods` | JSONB | ✅ | '[]' | Pole aktivních metod ["email","sms","totp"] |
| `twofa_totp_secret` | TEXT | ❌ | NULL | Šifrovaný TOTP secret |
| `twofa_recovery_codes` | TEXT | ❌ | NULL | Šifrované recovery kódy (JSON) |
| `twofa_last_sent_at` | TIMESTAMPTZ | ❌ | NULL | Časová známka posledního odeslání kódu (rate limiting) |
| `last_login_at` | TIMESTAMPTZ | ❌ | NULL | Poslední přihlášení |
| `last_login_ip` | VARCHAR(45) | ❌ | NULL | IP adresa posledního přihlášení |
| `preferences` | JSONB | ❌ | '{}' | Uživatelské preference (rychlé filtry, apod.) |

### SQL migrace - Rozšíření profiles

```sql
-- ============================================================================
-- Migration: Add 2FA fields to profiles table
-- Version: 2025-11-10-001
-- ============================================================================

-- Add new columns
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS primary_phone VARCHAR(20),
  ADD COLUMN IF NOT EXISTS primary_email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS twofa_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS twofa_methods JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS twofa_totp_secret TEXT,
  ADD COLUMN IF NOT EXISTS twofa_recovery_codes TEXT,
  ADD COLUMN IF NOT EXISTS twofa_last_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_login_ip VARCHAR(45),
  ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_profiles_primary_email ON profiles(primary_email);
CREATE INDEX IF NOT EXISTS idx_profiles_primary_phone ON profiles(primary_phone);
CREATE INDEX IF NOT EXISTS idx_profiles_twofa_enabled ON profiles(twofa_enabled);
CREATE INDEX IF NOT EXISTS idx_profiles_last_login ON profiles(last_login_at DESC);

-- Update existing records to set primary_email from email
UPDATE profiles 
SET primary_email = email 
WHERE primary_email IS NULL AND email IS NOT NULL;

-- Add comments
COMMENT ON COLUMN profiles.primary_phone IS 'Primární telefon pro SMS 2FA';
COMMENT ON COLUMN profiles.primary_email IS 'Primární e-mail pro 2FA kódy';
COMMENT ON COLUMN profiles.twofa_enabled IS 'Zda má uživatel zapnuto 2FA';
COMMENT ON COLUMN profiles.twofa_methods IS 'Pole aktivních metod 2FA: ["email","sms","totp","push","biometric"]';
COMMENT ON COLUMN profiles.twofa_totp_secret IS 'Šifrovaný TOTP secret (AES-256-GCM)';
COMMENT ON COLUMN profiles.twofa_recovery_codes IS 'Šifrované recovery kódy jako JSON';
COMMENT ON COLUMN profiles.twofa_last_sent_at IS 'Časová známka posledního odeslání 2FA kódu (rate limiting)';
COMMENT ON COLUMN profiles.preferences IS 'JSON objekt s uživatelskými preferencemi';

-- ============================================================================
-- KONEC MIGRACE
-- ============================================================================
SELECT 'Migration completed: profiles table extended with 2FA fields' as status;
```

### Rollback migrace

```sql
-- ============================================================================
-- Rollback: Remove 2FA fields from profiles
-- ============================================================================

ALTER TABLE profiles
  DROP COLUMN IF EXISTS primary_phone,
  DROP COLUMN IF EXISTS primary_email,
  DROP COLUMN IF EXISTS twofa_enabled,
  DROP COLUMN IF EXISTS twofa_methods,
  DROP COLUMN IF EXISTS twofa_totp_secret,
  DROP COLUMN IF EXISTS twofa_recovery_codes,
  DROP COLUMN IF EXISTS twofa_last_sent_at,
  DROP COLUMN IF EXISTS last_login_at,
  DROP COLUMN IF EXISTS last_login_ip,
  DROP COLUMN IF EXISTS preferences;

DROP INDEX IF EXISTS idx_profiles_primary_email;
DROP INDEX IF EXISTS idx_profiles_primary_phone;
DROP INDEX IF EXISTS idx_profiles_twofa_enabled;
DROP INDEX IF EXISTS idx_profiles_last_login;

SELECT 'Rollback completed' as status;
```

---

## Nová tabulka: twofa_events

### Účel
Audit log všech 2FA událostí pro bezpečnostní monitoring a forensic analysis.

### Struktura

| Sloupec | Typ | Povinné | Výchozí | Popis |
|---------|-----|---------|---------|-------|
| `id` | UUID | ✅ | PK | Primární klíč |
| `profile_id` | UUID | ✅ | - | FK na profiles.id |
| `event_type` | VARCHAR(50) | ✅ | - | Typ události |
| `method` | VARCHAR(20) | ❌ | NULL | Metoda 2FA (email, sms, totp, recovery) |
| `success` | BOOLEAN | ✅ | false | Zda byla událost úspěšná |
| `ip` | VARCHAR(45) | ❌ | NULL | IP adresa |
| `user_agent` | TEXT | ❌ | NULL | User agent string |
| `metadata` | JSONB | ❌ | NULL | Doplňková metadata |
| `created_at` | TIMESTAMPTZ | ✅ | NOW() | Časová známka události |
| `admin_id` | UUID | ❌ | NULL | ID admina (pro reset_by_admin) |

### Typy událostí (event_type)

| Typ | Popis | Metadata |
|-----|-------|----------|
| `enabled` | 2FA zapnuto | `{ method }` |
| `disabled` | 2FA vypnuto | `{ method }` |
| `method_added` | Metoda přidána | `{ method }` |
| `method_removed` | Metoda odebrána | `{ method }` |
| `verify_success` | Úspěšné ověření | `{ method, challenge_id }` |
| `verify_failed` | Neúspěšné ověření | `{ method, challenge_id, attempts }` |
| `code_sent` | Kód odeslán | `{ method }` |
| `recovery_used` | Recovery kód použit | `{ code_hash }` |
| `recovery_generated` | Recovery kódy vygenerovány | `{ count }` |
| `totp_setup` | TOTP nastaveno | - |
| `reset_by_admin` | Reset adminem | `{ admin_id, reason }` |

### SQL migrace - twofa_events

```sql
-- ============================================================================
-- Migration: Create twofa_events table
-- Version: 2025-11-10-002
-- ============================================================================

CREATE TABLE IF NOT EXISTS twofa_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  method VARCHAR(20),
  success BOOLEAN DEFAULT false,
  ip VARCHAR(45),
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  admin_id UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_twofa_events_profile ON twofa_events(profile_id);
CREATE INDEX IF NOT EXISTS idx_twofa_events_type ON twofa_events(event_type);
CREATE INDEX IF NOT EXISTS idx_twofa_events_created ON twofa_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_twofa_events_success ON twofa_events(success);
CREATE INDEX IF NOT EXISTS idx_twofa_events_composite ON twofa_events(profile_id, created_at DESC);

-- Comments
COMMENT ON TABLE twofa_events IS 'Audit log všech 2FA událostí';
COMMENT ON COLUMN twofa_events.event_type IS 'Typ události: enabled, disabled, verify_success, verify_failed, code_sent, recovery_used, reset_by_admin';
COMMENT ON COLUMN twofa_events.method IS 'Metoda 2FA: email, sms, totp, push, biometric, recovery';
COMMENT ON COLUMN twofa_events.metadata IS 'JSON objekt s doplňkovými informacemi';

-- RLS Policies
ALTER TABLE twofa_events ENABLE ROW LEVEL SECURITY;

-- Users can view only their own events
CREATE POLICY twofa_events_select ON twofa_events
  FOR SELECT
  USING (
    profile_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- System and users can insert their own events
CREATE POLICY twofa_events_insert ON twofa_events
  FOR INSERT
  WITH CHECK (
    profile_id = auth.uid()
    OR auth.role() = 'service_role'
  );

-- No updates or deletes (immutable audit log)

-- ============================================================================
-- KONEC MIGRACE
-- ============================================================================
SELECT 'Migration completed: twofa_events table created' as status;
```

### Rollback

```sql
DROP TABLE IF EXISTS twofa_events CASCADE;
SELECT 'Rollback completed: twofa_events table removed' as status;
```

---

## Nová tabulka: property_managers

### Účel
Vazební tabulka mezi uživateli (`profiles`) a nemovitostmi (`properties`) pro určení správců.

### Struktura

| Sloupec | Typ | Povinné | Výchozí | Popis |
|---------|-----|---------|---------|-------|
| `id` | UUID | ✅ | PK | Primární klíč |
| `property_id` | UUID | ✅ | - | FK na properties.id |
| `profile_id` | UUID | ✅ | - | FK na profiles.id |
| `role` | VARCHAR(50) | ✅ | 'manager' | Role (manager, co-manager, assistant) |
| `created_at` | TIMESTAMPTZ | ✅ | NOW() | Datum přiřazení |
| `created_by` | UUID | ❌ | NULL | Kdo přiřadil |

### Roles

| Role | Popis | Oprávnění |
|------|-------|-----------|
| `manager` | Hlavní správce | Všechna oprávnění pro nemovitost |
| `co-manager` | Spolusprávce | Většina oprávnění, nemůže přiřazovat další správce |
| `assistant` | Asistent | Pouze čtení a základní úpravy |

### SQL migrace - property_managers

```sql
-- ============================================================================
-- Migration: Create property_managers table
-- Version: 2025-11-10-003
-- ============================================================================

CREATE TABLE IF NOT EXISTS property_managers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'manager' CHECK (role IN ('manager', 'co-manager', 'assistant')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Unique constraint: one user can have only one role per property
  UNIQUE(property_id, profile_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_property_managers_property ON property_managers(property_id);
CREATE INDEX IF NOT EXISTS idx_property_managers_profile ON property_managers(profile_id);
CREATE INDEX IF NOT EXISTS idx_property_managers_role ON property_managers(role);

-- Comments
COMMENT ON TABLE property_managers IS 'Vazba uživatelů na spravované nemovitosti';
COMMENT ON COLUMN property_managers.role IS 'Role správce: manager (hlavní), co-manager (spolu), assistant (asistent)';

-- RLS Policies
ALTER TABLE property_managers ENABLE ROW LEVEL SECURITY;

-- Users can view records where they are the manager or admin
CREATE POLICY property_managers_select ON property_managers
  FOR SELECT
  USING (
    profile_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Only admins and managers can assign managers
CREATE POLICY property_managers_insert ON property_managers
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Only admins can update
CREATE POLICY property_managers_update ON property_managers
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can delete
CREATE POLICY property_managers_delete ON property_managers
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- KONEC MIGRACE
-- ============================================================================
SELECT 'Migration completed: property_managers table created' as status;
```

### Rollback

```sql
DROP TABLE IF EXISTS property_managers CASCADE;
SELECT 'Rollback completed: property_managers table removed' as status;
```

---

## Nová tabulka: property_documents

### Účel
Ukládání dokumentů souvisejících s nemovitostmi (smlouvy, plány, fotografie, faktury).

### Struktura

| Sloupec | Typ | Povinné | Výchozí | Popis |
|---------|-----|---------|---------|-------|
| `id` | UUID | ✅ | PK | Primární klíč |
| `property_id` | UUID | ✅ | - | FK na properties.id |
| `doc_type` | VARCHAR(50) | ✅ | - | Typ dokumentu |
| `title` | VARCHAR(255) | ✅ | - | Název dokumentu |
| `description` | TEXT | ❌ | NULL | Popis dokumentu |
| `file_url` | TEXT | ✅ | - | URL souboru (Supabase Storage) |
| `file_name` | VARCHAR(255) | ❌ | NULL | Název souboru |
| `file_size` | INTEGER | ❌ | NULL | Velikost v bajtech |
| `mime_type` | VARCHAR(100) | ❌ | NULL | MIME typ |
| `uploaded_at` | TIMESTAMPTZ | ✅ | NOW() | Datum nahrání |
| `uploaded_by` | UUID | ❌ | NULL | FK na profiles.id |
| `notes` | TEXT | ❌ | NULL | Poznámky |
| `archived` | BOOLEAN | ✅ | false | Archivován |
| `archived_at` | TIMESTAMPTZ | ❌ | NULL | Datum archivace |

### Typy dokumentů (doc_type)

| Typ | Popis | Ikona |
|-----|-------|-------|
| `contract` | Nájemní smlouva | 📝 |
| `plan` | Půdorys, plán | 📐 |
| `photo` | Fotografie | 📸 |
| `invoice` | Faktura | 🧾 |
| `insurance` | Pojištění | 🛡️ |
| `certificate` | Certifikát, doklad | 📜 |
| `report` | Zpráva, protokol | 📊 |
| `other` | Ostatní | 📄 |

### SQL migrace - property_documents

```sql
-- ============================================================================
-- Migration: Create property_documents table
-- Version: 2025-11-10-004
-- ============================================================================

CREATE TABLE IF NOT EXISTS property_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  doc_type VARCHAR(50) NOT NULL CHECK (doc_type IN ('contract', 'plan', 'photo', 'invoice', 'insurance', 'certificate', 'report', 'other')),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_name VARCHAR(255),
  file_size INTEGER CHECK (file_size >= 0),
  mime_type VARCHAR(100),
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  notes TEXT,
  archived BOOLEAN DEFAULT false,
  archived_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_property_documents_property ON property_documents(property_id);
CREATE INDEX IF NOT EXISTS idx_property_documents_type ON property_documents(doc_type);
CREATE INDEX IF NOT EXISTS idx_property_documents_uploaded ON property_documents(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_property_documents_archived ON property_documents(archived);

-- Comments
COMMENT ON TABLE property_documents IS 'Dokumenty nemovitostí (smlouvy, plány, fotografie, faktury)';
COMMENT ON COLUMN property_documents.doc_type IS 'Typ dokumentu: contract, plan, photo, invoice, insurance, certificate, report, other';
COMMENT ON COLUMN property_documents.file_url IS 'URL souboru v Supabase Storage';

-- RLS Policies
ALTER TABLE property_documents ENABLE ROW LEVEL SECURITY;

-- Users can view documents of properties they manage or own
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

-- Managers and owners can upload documents
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

-- Only uploader or admin can update
CREATE POLICY property_documents_update ON property_documents
  FOR UPDATE
  USING (
    uploaded_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only uploader or admin can delete (soft delete preferred)
CREATE POLICY property_documents_delete ON property_documents
  FOR DELETE
  USING (
    uploaded_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- KONEC MIGRACE
-- ============================================================================
SELECT 'Migration completed: property_documents table created' as status;
```

### Rollback

```sql
DROP TABLE IF EXISTS property_documents CASCADE;
SELECT 'Rollback completed: property_documents table removed' as status;
```

---

## Migrace SQL

### Kompletní migrace soubor

```sql
-- ============================================================================
-- COMPLETE MIGRATION: Modules 010 and 020 - Authentication & 2FA
-- Version: 2025-11-10
-- ============================================================================

-- 1. Extend profiles table with 2FA fields
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS primary_phone VARCHAR(20),
  ADD COLUMN IF NOT EXISTS primary_email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS twofa_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS twofa_methods JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS twofa_totp_secret TEXT,
  ADD COLUMN IF NOT EXISTS twofa_recovery_codes TEXT,
  ADD COLUMN IF NOT EXISTS twofa_last_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_login_ip VARCHAR(45),
  ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_profiles_primary_email ON profiles(primary_email);
CREATE INDEX IF NOT EXISTS idx_profiles_primary_phone ON profiles(primary_phone);
CREATE INDEX IF NOT EXISTS idx_profiles_twofa_enabled ON profiles(twofa_enabled);
CREATE INDEX IF NOT EXISTS idx_profiles_last_login ON profiles(last_login_at DESC);

UPDATE profiles 
SET primary_email = email 
WHERE primary_email IS NULL AND email IS NOT NULL;

-- 2. Create twofa_events table
CREATE TABLE IF NOT EXISTS twofa_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  method VARCHAR(20),
  success BOOLEAN DEFAULT false,
  ip VARCHAR(45),
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  admin_id UUID REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_twofa_events_profile ON twofa_events(profile_id);
CREATE INDEX IF NOT EXISTS idx_twofa_events_type ON twofa_events(event_type);
CREATE INDEX IF NOT EXISTS idx_twofa_events_created ON twofa_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_twofa_events_composite ON twofa_events(profile_id, created_at DESC);

ALTER TABLE twofa_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY twofa_events_select ON twofa_events
  FOR SELECT
  USING (
    profile_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY twofa_events_insert ON twofa_events
  FOR INSERT
  WITH CHECK (profile_id = auth.uid() OR auth.role() = 'service_role');

-- 3. Create property_managers table
CREATE TABLE IF NOT EXISTS property_managers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'manager' CHECK (role IN ('manager', 'co-manager', 'assistant')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  UNIQUE(property_id, profile_id)
);

CREATE INDEX IF NOT EXISTS idx_property_managers_property ON property_managers(property_id);
CREATE INDEX IF NOT EXISTS idx_property_managers_profile ON property_managers(profile_id);

ALTER TABLE property_managers ENABLE ROW LEVEL SECURITY;

CREATE POLICY property_managers_select ON property_managers
  FOR SELECT
  USING (
    profile_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
  );

-- 4. Create property_documents table
CREATE TABLE IF NOT EXISTS property_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  doc_type VARCHAR(50) NOT NULL CHECK (doc_type IN ('contract', 'plan', 'photo', 'invoice', 'insurance', 'certificate', 'report', 'other')),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_name VARCHAR(255),
  file_size INTEGER CHECK (file_size >= 0),
  mime_type VARCHAR(100),
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  notes TEXT,
  archived BOOLEAN DEFAULT false,
  archived_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_property_documents_property ON property_documents(property_id);
CREATE INDEX IF NOT EXISTS idx_property_documents_type ON property_documents(doc_type);
CREATE INDEX IF NOT EXISTS idx_property_documents_uploaded ON property_documents(uploaded_at DESC);

ALTER TABLE property_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY property_documents_select ON property_documents
  FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM property_managers WHERE property_id = property_documents.property_id AND profile_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================================
-- KONEC MIGRACE
-- ============================================================================
SELECT 'Complete migration finished successfully' as status;
```

---

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/login

**Request:**
```json
{
  "identifier": "user@example.com",  // email or username
  "password": "SecurePassword123!"
}
```

**Response (bez 2FA):**
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "username": "johndoe",
    "email": "user@example.com",
    "role": "user",
    "twofa_enabled": false
  }
}
```

**Response (s 2FA):**
```json
{
  "success": false,
  "twofa_required": true,
  "challenge_id": "uuid",
  "methods": ["email", "sms", "totp"],
  "message": "Zadejte ověřovací kód"
}
```

#### POST /api/auth/twofa/verify

**Request:**
```json
{
  "challenge_id": "uuid",
  "method": "email",  // nebo sms, totp, recovery
  "code": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "username": "johndoe",
    "email": "user@example.com",
    "role": "user"
  }
}
```

#### POST /api/auth/twofa/send

**Request:**
```json
{
  "challenge_id": "uuid",
  "method": "email"  // nebo sms
}
```

**Response:**
```json
{
  "success": true,
  "message": "Kód byl odeslán na e-mail u***@example.com",
  "cooldown": 30  // seconds until can send again
}
```

### 2FA Management Endpoints

#### POST /api/profiles/:id/twofa/enable

**Request:**
```json
{
  "method": "email",
  "password": "CurrentPassword123!"  // required for verification
}
```

**Response:**
```json
{
  "success": true,
  "challenge_id": "uuid",
  "message": "Testovací kód byl odeslán. Zadejte ho pro potvrzení."
}
```

#### POST /api/profiles/:id/twofa/disable

**Request:**
```json
{
  "method": "email",
  "password": "CurrentPassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Metoda 2FA byla vypnuta"
}
```

#### POST /api/profiles/:id/twofa/totp/setup

**Request:**
```json
{
  "password": "CurrentPassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "secret": "JBSWY3DPEHPK3PXP",
  "qr_code_url": "data:image/png;base64,...",
  "message": "Naskenujte QR kód a zadejte první vygenerovaný kód"
}
```

#### POST /api/profiles/:id/twofa/totp/verify

**Request:**
```json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "code": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "TOTP bylo úspěšně aktivováno"
}
```

#### POST /api/profiles/:id/twofa/recovery/generate

**Request:**
```json
{
  "password": "CurrentPassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "codes": [
    "ABCD-EFGH-IJKL-MNOP",
    "QRST-UVWX-YZAB-CDEF",
    ...
  ],
  "message": "Uložte si tyto kódy na bezpečné místo. Každý lze použít pouze jednou."
}
```

### Quick Access Endpoints

#### GET /api/profiles/me/quick-access

**Response:**
```json
{
  "success": true,
  "data": {
    "managed": [
      {
        "id": "uuid",
        "property": {
          "id": "uuid",
          "nazev": "Rezidence Na Kopci",
          "mesto": "Praha",
          "typ_nemovitosti": "bytovy_dum",
          "pocet_jednotek": 12
        },
        "role": "manager"
      }
    ],
    "owned": [
      {
        "id": "uuid",
        "nazev": "Rodinný dům Brno",
        "mesto": "Brno",
        "typ_nemovitosti": "rodinny_dum",
        "pocet_jednotek": 1
      }
    ]
  }
}
```

#### GET /api/properties/:id/documents

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "property_id": "uuid",
      "doc_type": "contract",
      "title": "Nájemní smlouva - byt 1.01",
      "file_url": "https://...",
      "file_name": "smlouva_101.pdf",
      "file_size": 245678,
      "mime_type": "application/pdf",
      "uploaded_at": "2025-01-15T10:30:00Z",
      "uploaded_by": "uuid"
    }
  ]
}
```

---

## Datové struktury

### Profile s 2FA

```typescript
interface Profile {
  id: string;
  username: string;
  email: string;
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  primary_email: string | null;
  primary_phone: string | null;
  role: 'admin' | 'manager' | 'user' | 'viewer';
  active: boolean;
  archived: boolean;
  
  // 2FA fields
  twofa_enabled: boolean;
  twofa_methods: Array<'email' | 'sms' | 'totp' | 'push' | 'biometric'>;
  twofa_totp_secret: string | null; // encrypted
  twofa_recovery_codes: string | null; // encrypted JSON
  twofa_last_sent_at: string | null;
  
  // Metadata
  last_login_at: string | null;
  last_login_ip: string | null;
  preferences: Record<string, any>;
  created_at: string;
  updated_at: string;
}
```

### 2FA Event

```typescript
interface TwoFAEvent {
  id: string;
  profile_id: string;
  event_type: '2fa_enabled' | '2fa_disabled' | 'verify_success' | 'verify_failed' | 'code_sent' | 'recovery_used' | 'reset_by_admin';
  method: 'email' | 'sms' | 'totp' | 'recovery' | null;
  success: boolean;
  ip: string | null;
  user_agent: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
  admin_id: string | null;
}
```

### Property Manager

```typescript
interface PropertyManager {
  id: string;
  property_id: string;
  profile_id: string;
  role: 'manager' | 'co-manager' | 'assistant';
  created_at: string;
  created_by: string | null;
  
  // Joined data
  property?: Property;
  profile?: Profile;
}
```

### Property Document

```typescript
interface PropertyDocument {
  id: string;
  property_id: string;
  doc_type: 'contract' | 'plan' | 'photo' | 'invoice' | 'insurance' | 'certificate' | 'report' | 'other';
  title: string;
  description: string | null;
  file_url: string;
  file_name: string | null;
  file_size: number | null;
  mime_type: string | null;
  uploaded_at: string;
  uploaded_by: string | null;
  notes: string | null;
  archived: boolean;
  archived_at: string | null;
}
```

---

**Poslední aktualizace:** 2025-11-10  
**Autor:** PatrikCechlovsky
