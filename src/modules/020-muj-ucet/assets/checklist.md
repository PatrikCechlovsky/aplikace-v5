# Checklist - Implementace modulů 010 a 020

**Verze:** 2025-11-10  
**Účel:** Kontrolní seznam pro agenta před, během a po implementaci

---

## 📋 Obsah

1. [Před zahájením](#před-zahájením)
2. [Databáze a migrace](#databáze-a-migrace)
3. [Backend API](#backend-api)
4. [Frontend - Login Overlay](#frontend---login-overlay)
5. [Frontend - Modul 010](#frontend---modul-010)
6. [Frontend - Modul 020](#frontend---modul-020)
7. [Bezpečnost](#bezpečnost)
8. [Testování](#testování)
9. [Dokumentace](#dokumentace)
10. [Před mergem](#před-mergem)

---

## Před zahájením

### Příprava

- [ ] Přečetl/a jsem všechny dokumenty:
  - [ ] [README.md](./README.md) - Celkový přehled a specifikace
  - [ ] [permissions.md](./permissions.md) - Oprávnění a bezpečnost
  - [ ] [datovy-model.md](./datovy-model.md) - Návrh databáze a API
  - [ ] [checklist.md](./checklist.md) - Tento checklist

- [ ] Rozumím architektuře aplikace v5:
  - [ ] Struktura modulů (`src/modules/`)
  - [ ] Manifest pattern (`module.config.js`)
  - [ ] Tiles a forms pattern
  - [ ] UI komponenty (`src/ui/`)
  - [ ] Databázové operace (`src/db.js`)

- [ ] Mám přístup k:
  - [ ] Supabase projektu
  - [ ] Repository (git)
  - [ ] Testovacímu prostředí

- [ ] Vytvořil/a jsem novou branch:
  ```bash
  git checkout -b feature/auth-2fa-modules-010-020
  ```

---

## Databáze a migrace

### 1. Rozšíření tabulky `profiles`

- [ ] Vytvořil/a jsem migrační SQL soubor: `migrations/2025-11-10-001-extend-profiles-2fa.sql`
- [ ] Migrace obsahuje všechny nové sloupce:
  - [ ] `primary_phone`
  - [ ] `primary_email`
  - [ ] `twofa_enabled`
  - [ ] `twofa_methods`
  - [ ] `twofa_totp_secret`
  - [ ] `twofa_recovery_codes`
  - [ ] `twofa_last_sent_at`
  - [ ] `last_login_at`
  - [ ] `last_login_ip`
  - [ ] `preferences`
- [ ] Vytvořil/a jsem indexy:
  - [ ] `idx_profiles_primary_email`
  - [ ] `idx_profiles_primary_phone`
  - [ ] `idx_profiles_twofa_enabled`
  - [ ] `idx_profiles_last_login`
- [ ] Přidal/a jsem komentáře ke sloupcům
- [ ] Otestoval/a jsem migraci na lokální DB
- [ ] Vytvořil/a jsem rollback script

### 2. Tabulka `twofa_events`

- [ ] Vytvořil/a jsem migrační soubor: `migrations/2025-11-10-002-create-twofa-events.sql`
- [ ] Tabulka obsahuje všechny sloupce podle specifikace
- [ ] Vytvořil/a jsem indexy:
  - [ ] `idx_twofa_events_profile`
  - [ ] `idx_twofa_events_type`
  - [ ] `idx_twofa_events_created`
  - [ ] `idx_twofa_events_composite`
- [ ] Nastavil/a jsem RLS policies:
  - [ ] `twofa_events_select` - users vidí své, admin vidí vše
  - [ ] `twofa_events_insert` - users a service_role mohou vkládat
  - [ ] Žádné UPDATE/DELETE (immutable log)
- [ ] Otestoval/a jsem migraci
- [ ] Vytvořil/a jsem rollback script

### 3. Tabulka `property_managers`

- [ ] Vytvořil/a jsem migrační soubor: `migrations/2025-11-10-003-create-property-managers.sql`
- [ ] Tabulka obsahuje všechny sloupce
- [ ] CHECK constraint pro `role IN ('manager', 'co-manager', 'assistant')`
- [ ] UNIQUE constraint na `(property_id, profile_id)`
- [ ] Foreign keys s ON DELETE CASCADE/SET NULL
- [ ] Vytvořil/a jsem indexy
- [ ] Nastavil/a jsem RLS policies
- [ ] Otestoval/a jsem migraci
- [ ] Vytvořil/a jsem rollback script

### 4. Tabulka `property_documents`

- [ ] Vytvořil/a jsem migrační soubor: `migrations/2025-11-10-004-create-property-documents.sql`
- [ ] Tabulka obsahuje všechny sloupce
- [ ] CHECK constraint pro `doc_type`
- [ ] CHECK constraint pro `file_size >= 0`
- [ ] Vytvořil/a jsem indexy
- [ ] Nastavil/a jsem RLS policies (složité - kontrola property_managers a user_subjects)
- [ ] Otestoval/a jsem migraci
- [ ] Vytvořil/a jsem rollback script

### 5. Nasazení migrací

- [ ] Spustil/a jsem migrace na staging databázi
- [ ] Ověřil/a jsem, že všechny tabulky existují
- [ ] Ověřil/a jsem, že všechny indexy existují
- [ ] Ověřil/a jsem, že RLS policies fungují
- [ ] Otestoval/a jsem rollback (na kopii DB)
- [ ] Aktualizoval/a jsem `docs/database-schema.md`

---

## Backend API

### Autentizační endpointy

#### POST /api/auth/login

- [ ] Vytvořil/a jsem endpoint
- [ ] Implementoval/a jsem basic auth (email+password)
- [ ] Kontroluji zda má uživatel 2FA zapnuto
- [ ] Pokud ANO: vytvářím 2FA challenge a vracím `{ twofa_required: true, challenge_id, methods }`
- [ ] Pokud NE: vytvářím JWT token a vracím `{ token, refresh_token, user }`
- [ ] Rate limiting: max 5 pokusů za 15 min (IP-based)
- [ ] Rate limiting: max 10 pokusů za hodinu (account-based)
- [ ] Loguji neúspěšné pokusy
- [ ] Aktualizuji `last_login_at` a `last_login_ip` při úspěchu

#### POST /api/auth/twofa/verify

- [ ] Vytvořil/a jsem endpoint
- [ ] Načítám challenge z DB/Redis
- [ ] Kontroluji počet pokusů (max 5)
- [ ] Ověřuji kód podle metody:
  - [ ] E-mail: porovnání s uloženým kódem
  - [ ] SMS: porovnání s uloženým kódem
  - [ ] TOTP: validace pomocí TOTP knihovny
  - [ ] Recovery: kontrola v encrypted recovery_codes
- [ ] Při úspěchu: vytvářím token, invaliduji challenge
- [ ] Při chybě: inkrementuji attempts, vracím zbývající pokusy
- [ ] Loguji do `twofa_events`

#### POST /api/auth/twofa/send

- [ ] Vytvořil/a jsem endpoint
- [ ] Kontroluji cooldown (min 30s mezi požadavky)
- [ ] Kontroluji rate limit (max 3 kódy za 10 min)
- [ ] Generuji 6-místný náhodný kód
- [ ] Pro e-mail: odesílám přes email provider
- [ ] Pro SMS: odesílám přes SMS provider
- [ ] Ukládám kód do challenge (encrypted nebo hashed)
- [ ] Nastavuji expiraci (10 min)
- [ ] Loguji do `twofa_events`

### 2FA Management endpointy

#### POST /api/profiles/:id/twofa/enable

- [ ] Vytvořil/a jsem endpoint
- [ ] Ověřuji, že uživatel upravuje svůj profil
- [ ] Vyžaduji potvrzení heslem
- [ ] Kontroluji prerekvizity (např. phone pro SMS)
- [ ] Odesílám testovací kód
- [ ] Vytvářím challenge pro potvrzení
- [ ] Po ověření: aktivuji metodu v `twofa_methods`
- [ ] Loguji do `twofa_events`

#### POST /api/profiles/:id/twofa/disable

- [ ] Vytvořil/a jsem endpoint
- [ ] Ověřuji, že uživatel upravuje svůj profil
- [ ] Vyžaduji potvrzení heslem
- [ ] Pokud poslední metoda: vyžaduji extra potvrzení
- [ ] Odebírám metodu z `twofa_methods`
- [ ] Pokud žádné metody: nastavuji `twofa_enabled = false`
- [ ] Loguji do `twofa_events`

#### POST /api/profiles/:id/twofa/totp/setup

- [ ] Vytvořil/a jsem endpoint
- [ ] Generuji TOTP secret (32 bytes base32)
- [ ] Generuji QR kód (otpauth:// URL)
- [ ] Vracím secret a QR kód
- [ ] Secret zatím neukládám (uloží se po verify)

#### POST /api/profiles/:id/twofa/totp/verify

- [ ] Vytvořil/a jsem endpoint
- [ ] Ověřuji TOTP kód pomocí knihovny (speakeasy, otplib)
- [ ] Pokud validní: šifruji a ukládám secret do `twofa_totp_secret`
- [ ] Přidávám 'totp' do `twofa_methods`
- [ ] Loguji do `twofa_events`

#### POST /api/profiles/:id/twofa/recovery/generate

- [ ] Vytvořil/a jsem endpoint
- [ ] Vyžaduji potvrzení heslem
- [ ] Generuji 10 náhodných recovery kódů (16 znaků formát XXXX-XXXX-XXXX-XXXX)
- [ ] Šifruji a ukládám do `twofa_recovery_codes` jako JSON array
- [ ] Vracím kódy frontednu (jediná šance je vidět)
- [ ] Loguji do `twofa_events`

#### POST /api/users/:id/reset-2fa (admin only)

- [ ] Vytvořil/a jsem endpoint
- [ ] Kontroluji, že volající je admin s oprávněním `users.reset_2fa`
- [ ] Nastavuji `twofa_enabled = false`
- [ ] Mažu `twofa_methods`, `twofa_totp_secret`, `twofa_recovery_codes`
- [ ] Loguji do `twofa_events` s `admin_id`

### Quick Access endpointy

#### GET /api/profiles/me/quick-access

- [ ] Vytvořil/a jsem endpoint
- [ ] Načítám spravované nemovitosti z `property_managers`
- [ ] Načítám vlastněné nemovitosti přes `user_subjects` → `subjects` → `properties`
- [ ] Vracím strukturu `{ managed: [...], owned: [...] }`

#### GET /api/properties/:id/documents

- [ ] Vytvořil/a jsem endpoint
- [ ] Kontroluji oprávnění (manager, owner nebo admin)
- [ ] Načítám dokumenty z `property_documents`
- [ ] Volitelně filtr podle `doc_type`
- [ ] Vracím seznam dokumentů

### Šifrování a utility

- [ ] Vytvořil/a jsem crypto utils pro AES-256-GCM encryption
- [ ] Funkce `encrypt(text)` a `decrypt(encryptedData)`
- [ ] Environment variable `TWOFA_ENCRYPTION_KEY` (256-bit hex)
- [ ] Všechny TOTP secrets jsou šifrované
- [ ] Všechny recovery codes jsou šifrované

### Rate Limiting

- [ ] Implementoval/a jsem rate limiting middleware
- [ ] Používám Redis nebo in-memory store
- [ ] Login: 5 pokusů / 15 min (IP), 10 pokusů / hodina (account)
- [ ] 2FA verify: 5 pokusů / challenge
- [ ] 2FA send: 3 kódy / 10 min, min 30s cooldown

---

## Frontend - Login Overlay

### Komponenta LoginOverlay

- [ ] Vytvořil/a jsem `src/components/LoginOverlay.js`
- [ ] Třída `LoginOverlay` s metodami:
  - [ ] `constructor()`
  - [ ] `render(parentContainer)`
  - [ ] `renderLoginForm()`
  - [ ] `render2FAForm()`
  - [ ] `renderRecoveryForm()`
  - [ ] `attachListeners()`
  - [ ] `handleLogin()`
  - [ ] `handleVerify2FA()`
  - [ ] `handleSendCode()`
  - [ ] `handleVerifyRecovery()`
  - [ ] `switchTo2FA()`
  - [ ] `switchToRecovery()`
  - [ ] `disableUI()`
  - [ ] `onSuccess(userData)`
  - [ ] `remove()`

### Integrace v app.js

- [ ] Importoval/a jsem `LoginOverlay`
- [ ] V `initApp()` kontroluji auth stav
- [ ] Pokud nepřihlášen: vytvářím a zobrazuji overlay
- [ ] Poslech na event `user-logged-in`
- [ ] Po přihlášení: skrývám overlay a načítám app

### Styling

- [ ] Overlay má fixed position, z-index 50
- [ ] Backdrop s `bg-black bg-opacity-50`
- [ ] Login card centrovaná, max-width 400px
- [ ] Formuláře jsou čisté a přehledné
- [ ] Tlačítka mají správné stavy (disabled, loading)
- [ ] Countdown pro "Poslat znovu" funkční
- [ ] Chybové hlášky se zobrazují červeně

### Funkčnost

- [ ] Login form submit funguje
- [ ] Přepnutí na 2FA form pokud je 2FA zapnuto
- [ ] Výběr metody 2FA funguje
- [ ] Odeslání kódu funguje s cooldownem
- [ ] Ověření kódu funguje
- [ ] Přepnutí na recovery form funguje
- [ ] Recovery kód verification funguje
- [ ] Po úspěchu se overlay skryje a UI se zpřístupní
- [ ] Zbytek UI je skutečně neaktivní během zobrazení overlay

---

## Frontend - Modul 010

### Tile: Přehled (tiles/prehled.js)

- [ ] Přidal/a jsem sloupec `twofa_status` do columns
- [ ] Zobrazuji badge s metodami 2FA (📧 📱 🔐)
- [ ] Implementoval/a jsem akci "Reset 2FA":
  - [ ] Viditelná pouze pro admin
  - [ ] Viditelná pouze když je vybrán uživatel
  - [ ] Confirm dialog před resetem
  - [ ] Volání API endpointu
  - [ ] Refresh seznamu po úspěchu
- [ ] Všechny ostatní akce fungují (add, edit, archive, refresh)

### Tile: 2FA Audit (tiles/audit-2fa.js)

- [ ] Vytvořil/a jsem novou tile `tiles/audit-2fa.js`
- [ ] Export async funkce `render(root, params)`
- [ ] Breadcrumb správně nastaven
- [ ] Načítám data z `twofa_events` včetně join na `profiles`
- [ ] Zobrazuji sloupce:
  - [ ] Datum
  - [ ] Uživatel
  - [ ] Událost
  - [ ] Metoda
  - [ ] Výsledek (✅/❌)
  - [ ] IP
  - [ ] Zařízení
- [ ] Implementoval/a jsem filtry:
  - [ ] Podle event_type
  - [ ] Podle profile_id (dropdown uživatelů)
  - [ ] Podle časového období
- [ ] Tile přístupná pouze pro admina

### Form: Formulář uživatele (forms/form.js)

- [ ] Přidal/a jsem sekci "Dvoufázové ověření"
- [ ] Zobrazuji readonly pole:
  - [ ] `twofa_enabled` (checkbox, disabled)
  - [ ] Aktivní metody (computed field, text)
- [ ] Tlačítko "Reset 2FA":
  - [ ] Viditelné pouze pro admina
  - [ ] Confirm dialog
  - [ ] Volání API
  - [ ] Toast notifikace po úspěchu
  - [ ] Reload formuláře

### Registrace v manifestu

- [ ] Aktualizoval/a jsem `module.config.js`
- [ ] Přidal/a jsem tile `audit-2fa` do `tiles` array
- [ ] Ověřil/a jsem, že manifest je validní

---

## Frontend - Modul 020

### Form: Profil (forms/form.js)

#### Sekce: Dvoufázové ověření

- [ ] Vytvořil/a jsem funkci `render2FAManagementUI(container, profileData)`
- [ ] Master toggle "Zapnout 2FA":
  - [ ] Funkční checkbox
  - [ ] Při zapnutí: zobrazuji metody
  - [ ] Při vypnutí: skrývám metody, confirm dialog
- [ ] E-mail metoda:
  - [ ] Checkbox pro enable/disable
  - [ ] Zobrazuji primary_email
  - [ ] Validace: primary_email musí být vyplněn
- [ ] SMS metoda:
  - [ ] Checkbox pro enable/disable
  - [ ] Zobrazuji primary_phone
  - [ ] Disabled pokud není primary_phone
  - [ ] Validace: primary_phone musí být vyplněn
- [ ] TOTP metoda:
  - [ ] Tlačítko "Nastavit" pokud není aktivní
  - [ ] Status "✓ Aktivní" pokud je aktivní
  - [ ] Klik na "Nastavit" otevře TOTP setup modal
- [ ] Biometrie:
  - [ ] Zobrazuji pouze pokud prohlížeč podporuje WebAuthn
  - [ ] Checkbox pro enable/disable
- [ ] Recovery kódy:
  - [ ] Tlačítko "Generovat nové kódy"
  - [ ] Tlačítko "Zobrazit kódy" (pokud existují)
  - [ ] Klik otevře modal s kódy

#### TOTP Setup Modal

- [ ] Vytvořil/a jsem funkci `showTOTPSetupModal()`
- [ ] Volám API `/twofa/totp/setup` pro získání secret a QR
- [ ] Zobrazuji QR kód
- [ ] Zobrazuji secret text (pro ruční zadání)
- [ ] Pole pro zadání 6-místného kódu
- [ ] Tlačítko "Potvrdit"
- [ ] Volám API `/twofa/totp/verify` s kódem
- [ ] Při úspěchu: zavřu modal, refresh profilu
- [ ] Při chybě: zobrazuji chybovou hlášku

#### Recovery Codes Modal

- [ ] Vytvořil/a jsem funkci `showRecoveryCodesModal(codes)`
- [ ] Zobrazuji seznam kódů (číslovaný)
- [ ] Warning: uložte si kódy, každý jednou
- [ ] Tlačítko "Stáhnout jako textový soubor"
- [ ] Tlačítko "Uložil/a jsem si kódy"
- [ ] Download funkce vytvoří .txt soubor

#### Sekce: Rychlý přístup

- [ ] Vytvořil/a jsem funkci `renderQuickAccessUI(container, profileId)`
- [ ] Načítám data z API `/profiles/me/quick-access`
- [ ] Zobrazuji sekci "Spravuji" s managed properties
- [ ] Zobrazuji sekci "Vlastním" s owned properties
- [ ] Každá nemovitost má:
  - [ ] Název a město
  - [ ] Ikonu podle typu
  - [ ] Tlačítka: Dokumenty, Jednotky, Detail
- [ ] Klik na "Dokumenty" otevře documents modal
- [ ] Klik na "Jednotky" naviguje na detail nemovitosti (tab=units)
- [ ] Klik na "Detail" naviguje na detail nemovitosti
- [ ] Pokud žádné nemovitosti: zobrazuji placeholder

#### Documents Modal

- [ ] Vytvořil/a jsem funkci `showPropertyDocumentsModal(propertyId)`
- [ ] Načítám data z API `/properties/:id/documents`
- [ ] Zobrazuji filtr podle typu dokumentu
- [ ] Seznam dokumentů s ikonami podle typu
- [ ] Každý dokument má tlačítko "Stáhnout"
- [ ] Filtrování funguje (klient-side)

### Event Listeners

- [ ] `setupTwoFAListeners(container, profileData)` implementován
- [ ] Všechny checkboxy mají event listeners
- [ ] Tlačítka mají event listeners
- [ ] Async operace mají loading stavy
- [ ] Toast notifikace po úspěchu/chybě

---

## Bezpečnost

### Validace vstupů

- [ ] Všechny user inputy jsou validovány na backendu
- [ ] E-mail formát validován
- [ ] Telefon formát validován
- [ ] Heslo síla vynucena (min 8 znaků, velké/malé, číslo)
- [ ] 2FA kódy validovány (6 číslic)

### Šifrování

- [ ] TOTP secrets jsou šifrované v DB
- [ ] Recovery codes jsou šifrované v DB
- [ ] Používám AES-256-GCM
- [ ] Encryption key je v environment variable
- [ ] Nikdy neposlední plain text secrets do logů

### Rate Limiting

- [ ] Implementován pro login
- [ ] Implementován pro 2FA verify
- [ ] Implementován pro 2FA send code
- [ ] Používám Redis nebo in-memory store
- [ ] Errory jsou user-friendly ("zkuste za X minut")

### RLS Policies

- [ ] Všechny nové tabulky mají RLS enabled
- [ ] Policies testovány s různými rolemi
- [ ] Admin vidí vše
- [ ] User vidí pouze své záznamy
- [ ] Manager vidí své spravované nemovitosti

### Audit Log

- [ ] Všechny 2FA události logované do `twofa_events`
- [ ] IP adresa vždy zaznamenána
- [ ] User agent vždy zaznamenán
- [ ] Metadata obsahují relevantní info
- [ ] Tabulka je immutable (no UPDATE/DELETE)

---

## Testování

### Unit testy

- [ ] Crypto utils (encrypt/decrypt)
- [ ] TOTP generation a verification
- [ ] Recovery codes generation
- [ ] Rate limiting logika

### Integration testy

- [ ] POST /api/auth/login (bez 2FA)
- [ ] POST /api/auth/login (s 2FA)
- [ ] POST /api/auth/twofa/verify (všechny metody)
- [ ] POST /api/auth/twofa/send
- [ ] POST /api/profiles/:id/twofa/enable
- [ ] POST /api/profiles/:id/twofa/disable
- [ ] POST /api/profiles/:id/twofa/totp/setup
- [ ] POST /api/profiles/:id/twofa/totp/verify
- [ ] POST /api/profiles/:id/twofa/recovery/generate
- [ ] GET /api/profiles/me/quick-access

### E2E testy

- [ ] Celý login flow bez 2FA
- [ ] Celý login flow s 2FA (e-mail)
- [ ] Celý login flow s 2FA (TOTP)
- [ ] Celý login flow s recovery code
- [ ] Zapnutí 2FA v modulu 020
- [ ] Vypnutí 2FA v modulu 020
- [ ] Setup TOTP
- [ ] Generování recovery kódů
- [ ] Admin reset 2FA
- [ ] Rychlý přístup k nemovitostem

### Manuální testování

- [ ] Login overlay se zobrazuje správně
- [ ] UI je skutečně neaktivní dokud není přihlášen
- [ ] 2FA flow funguje hladce (UX)
- [ ] Cooldown pro "Poslat znovu" funguje
- [ ] TOTP QR kód je skenová Authenticator app
- [ ] Recovery kódy lze stáhnout
- [ ] Rychlý přístup zobrazuje správné nemovitosti
- [ ] Documents modal funguje
- [ ] Všechny akce v modulu 010 fungují
- [ ] 2FA Audit tile zobrazuje správná data

---

## Dokumentace

### Aktualizace docs/database-schema.md

- [ ] Přidal/a jsem nové sloupce v tabulce `profiles`
- [ ] Přidal/a jsem tabulku `twofa_events` do přehledu
- [ ] Přidal/a jsem tabulku `property_managers` do přehledu
- [ ] Přidal/a jsem tabulku `property_documents` do přehledu
- [ ] Aktualizoval/a jsem datum poslední aktualizace

### README pro moduly

- [ ] Aktualizoval/a jsem `src/modules/010-sprava-uzivatelu/README.md` (pokud existuje)
- [ ] Aktualizoval/a jsem `src/modules/020-muj-ucet/README.md` (pokud existuje)

### API dokumentace

- [ ] Vytvořil/a jsem nebo aktualizoval/a `docs/api/auth.md`
- [ ] Všechny endpointy zdokumentovány s příklady request/response
- [ ] Error codes zdokumentovány

### Komentáře v kódu

- [ ] Všechny nové funkce mají JSDoc komentáře
- [ ] Složitá logika má vysvětlující komentáře
- [ ] TODOs jsou označeny pro budoucí vylepšení

---

## Před mergem

### Code Review

- [ ] Kód prošel code review (nebo self-review)
- [ ] Žádné console.log v produkčním kódu
- [ ] Žádné TODO/FIXME které blokují release
- [ ] Kód dodržuje style guide projektu
- [ ] Všechny soubory mají správné formátování

### Git

- [ ] Všechny změny jsou commitnuté
- [ ] Commit messages jsou popisné (feat:, fix:, docs:)
- [ ] Branch je rebased na main/master
- [ ] Žádné merge konflikty

### Environment

- [ ] Přidal/a jsem potřebné env variables do `.env.example`:
  - [ ] `TWOFA_ENCRYPTION_KEY`
  - [ ] `EMAIL_PROVIDER_*` (API keys, config)
  - [ ] `SMS_PROVIDER_*` (API keys, config)
- [ ] Dokumentoval/a jsem setup instrukce v README

### Migrace

- [ ] Všechny migrační SQL soubory jsou v `docs/tasks/supabase-migrations/`
- [ ] Migrace jsou číslované a pojmenované konsistentně
- [ ] Rollback scripty existují
- [ ] Migrace testovány na staging DB

### Testy

- [ ] Všechny unit testy procházejí (npm test)
- [ ] Všechny integration testy procházejí
- [ ] E2E testy procházejí (Playwright/Cypress)
- [ ] Coverage je přijatelný (>70% pro kritické části)

### Bezpečnost

- [ ] Secrets nejsou commitnuty do gitu
- [ ] Všechny citlivé operace vyžadují autentizaci
- [ ] RLS policies jsou správně nastavené
- [ ] Rate limiting je implementován
- [ ] Audit log funguje

### Performance

- [ ] Žádné N+1 queries v DB operacích
- [ ] Indexy jsou správně nastavené
- [ ] Login overlay se načítá rychle
- [ ] 2FA verification je responsivní

### Dokumentace

- [ ] `docs/database-schema.md` aktualizován
- [ ] API dokumentace kompletní
- [ ] README aktualizován
- [ ] Migration guide napsán (pokud breaking changes)

### Pull Request

- [ ] Vytvořil/a jsem PR do main/master
- [ ] PR title je popisný
- [ ] PR description obsahuje:
  - [ ] Shrnutí změn
  - [ ] Seznam klíčových funkcí
  - [ ] Screenshoty UI (login overlay, 2FA management)
  - [ ] Migration instructions
  - [ ] Testing checklist
- [ ] PR je označen správnými labels
- [ ] PR je přiřazen reviewerům

---

## Final Check

Před mergem si položte tyto otázky:

- [ ] ✅ Aplikace funguje lokálně bez chyb?
- [ ] ✅ Login overlay se zobrazuje a funguje správně?
- [ ] ✅ 2FA flow je kompletní a funkční?
- [ ] ✅ Admin může resetovat 2FA?
- [ ] ✅ Rychlý přístup k nemovitostem funguje?
- [ ] ✅ Všechny testy procházejí?
- [ ] ✅ Migrace jsou připravené k nasazení?
- [ ] ✅ Dokumentace je aktuální?
- [ ] ✅ Bezpečnost je zajištěna?
- [ ] ✅ Jsem hrdý/á na tento kód? 🚀

Pokud je odpověď na všechny otázky ANO, můžete mergovat! 🎉

---

## Post-Merge

### Staging Deploy

- [ ] Nasadil/a jsem migrace na staging DB
- [ ] Nasadil/a jsem backend na staging
- [ ] Nasadil/a jsem frontend na staging
- [ ] Smoke testy na stagingu proběhly

### Production Deploy

- [ ] Vytvořil/a jsem backup produkční DB
- [ ] Nasadil/a jsem migrace na produkci
- [ ] Nasadil/a jsem backend na produkci
- [ ] Nasadil/a jsem frontend na produkci
- [ ] Smoke testy na produkci proběhly
- [ ] Monitoring logs pro chyby

### Monitoring

- [ ] Nastavil/a jsem alerty pro:
  - [ ] Vysoký počet failed login attempts
  - [ ] Vysoký počet failed 2FA verifications
  - [ ] Rate limit hits
- [ ] Monitoring dashboards aktualizovány

### User Communication

- [ ] Uživatelé informováni o nové funkci 2FA (pokud potřeba)
- [ ] Help dokumentace aktualizována
- [ ] FAQ aktualizováno

---

**Poslední aktualizace:** 2025-11-10  
**Autor:** PatrikCechlovsky
