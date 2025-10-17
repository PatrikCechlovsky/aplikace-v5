# 🧭 Návod k aplikaci Pronajímatel v5
*(návazný na `rules.md`)*

... (stávající obsah beze změn) ...

## Nové doporučené funkce — Notifikace, Zabezpečení, Privacy, Validace adresy, Theme

Níže jsou navrženy konkrétní rozšíření profilu a postupy implementace. Popis je praktický — pro každý bod je uvedeno co do DB, UI a jak validovat / zabezpečit.

---

### 1) Notifikační preference
- Co přidat (DB):
  - preferovaně do `profiles.preferences` (JSONB), nebo samostatné sloupce:
    - preferences.notification_email boolean
    - preferences.notification_push boolean
    - preferences.notification_sms boolean

- UI:
  - v Můj účet → „Notifikace“ přidat 3 checkboxy: E‑mail, Push, SMS
  - Uloží se do `updateProfile(profile.id, { preferences: { ...existing, notifications: { email: true, push: false, sms: false } } })`

- Poznámky:
  - Push vyžaduje service worker / push token + server pro posílání notifikací.
  - SMS posílat přes externí SMS provider (Twilio, SMSAPI) — implementace později.

---

### 2) Zabezpečení (Security)
- Scope:
  - změna hesla
  - přihlášení/odhlášení všech sessions (session management)
  - dvoufaktorové ověřování (2FA) – TOTP nebo WebAuthn
- Implementace (kroky):
  1. Změna hesla:
     - UI: formulář se starým heslem + nové + potvrzení.
     - Volání: supabase.auth.update({ password }) nebo vlastní endpoint.
  2. Session management:
     - UI: seznam aktivních session (last_active, ip, agent) v Můj účet → Bezpečnost.
     - Backend: při každém přihlášení si ukládat záznam do `sessions` tabulky (user_id, refresh_token_hash, last_seen, ip, ua).
     - Revoke: volat Supabase Admin API / odstranit refresh token (pokud Supabase podporuje).
  3. 2FA:
     - Doporučeno: nejprve TOTP (Google Authenticator) nebo WebAuthn (silnější).
     - Workflow: enable → zobrazit QR + secret → uživatel ověří kódem → uložit (hash secret) do profiles.preferences.security.
     - Poznámka: 2FA vyžaduje backend logiku k ověření 2FA při přihlášení; Supabase Auth zatím nemá plně integrovaný TOTP (přesvědč se podle verze).

- Bezpečnostní doporučení:
  - Nikdy neukládat secrets v plain text.
  - Používat RLS pravidla, aby uživatel mohl měnit pouze svůj profil.
  - Při ukládání sessions neukládat refresh tokeny v plain textu — ukládat hash.

---

### 3) Privacy / data consent
- Co přidat:
  - `profiles.preferences.privacy = {marketing: boolean, analytics: boolean, consent_at: timestamp}`
  - nebo explicitní boolean sloupce: marketing_consent boolean, marketing_consent_at timestamptz
- UI:
  - checkboxy v Můj účet → Privacy (marketing / analytics), s odkazem na GDPR text.
- Důsledek:
  - Pokud uživatel odvolá souhlas, zablokovat marketingové emaily a případně anonymizovat data dle pravidel.
  - Logovat souhlasy (who/when).

---

### 4) Validace adresy, čísla popisného, PSČ, telefon
- Cíl: zlepšit kvalitu dat a umožnit případnou geolokaci / fakturaci.
- Doporučení pro pole:
  - street (text), house_number (text), city (text), zip (text), country (ISO2)
  - phone (text) -- ukládat E.164 formát

- Klientská validace (pravidla):
  - PSČ (ČR): regex: `^[0-9]{3}\s?[0-9]{2}$`
  - Telefon (E.164): regex: `^\+\d{7,15}$` (doporučeno použít libphonenumber-js / intl-tel-input)
  - House number (číslo popisné/orientační): povolit čísla + písmena + lomítka `^[0-9A-Za-z\-\/]{1,10}$`
  - City: minimálně 2 znaky
- Server-side:
  - Použít Postgres CHECK constraints pro primární validaci (volitelné, jednoduché regexy).
  - Dále spolehlivě validovat na backendu (serverless function nebo DB trigger).

- SQL příklady (Postgres):
  ```sql
  ALTER TABLE public.profiles
    ADD COLUMN preferences jsonb DEFAULT '{}'::jsonb,
    ADD COLUMN phone text,
    ADD COLUMN street text,
    ADD COLUMN house_number text,
    ADD COLUMN city text,
    ADD COLUMN zip text,
    ADD COLUMN country text;

  -- jednoduchá kontrola PSČ (ČR)
  ALTER TABLE public.profiles
    ADD CONSTRAINT chk_zip_cz CHECK (zip IS NULL OR zip ~ '^[0-9]{3}\\s?[0-9]{2}$');

  -- telefon E.164 (jednoduchá verze)
  ALTER TABLE public.profiles
    ADD CONSTRAINT chk_phone_e164 CHECK (phone IS NULL OR phone ~ '^\\+\\d{7,15}$');
  ```
  Poznámka: CHECK constraints mohou způsobit potíže pokud máte stávající špinavá data — nejdříve data očistit nebo přidat DEFAULT / migraci krok‑po‑kroku.

- Rozšířená validace (volitelně):
  - Geokódování / ověření adresy přes externí API (OpenCage, Nominatim, Google Geocoding, české registry). Výhodou je standardizované uložení (address components, lat/lon).
  - Doporučeno: při zadání adresy nabídnout „ověřit adresu“ tlačítko, které zavolá geokodér a nabídne normalizovanou variantu.

---

### 5) Theme (tmavý režim) — návrh
- UX:
  - Můj účet → Preference → Téma: [Systémové | Světlé | Tmavé]
- Ukládání:
  - Krátkodobě: localStorage `app_theme`
  - Per‑user: `profiles.preferences.theme = 'dark'|'light'|'system'`
- Implementace:
  1. Na init aplikace: načti profile.preferences.theme (pokud přihlášený) → applyTheme()
  2. applyTheme: přidat/odstranit `class="dark"` na <html> nebo nastavit `data-theme`.
- Příklad client-side:
  ```js
  function applyTheme(theme) {
    if (theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', isDark);
    } else {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
    localStorage.setItem('app_theme', theme);
  }
  ```

---

### 6) DB návrh — konkrétní sloupce / migrace
- Doporučené přidat do `public.profiles`:
  - preferences jsonb DEFAULT '{}'::jsonb
  - phone text
  - street text
  - house_number text
  - city text
  - zip text
  - country text
  - avatar_url text
- Příklad SQL migrace:
  ```sql
  ALTER TABLE public.profiles
    ADD COLUMN preferences jsonb DEFAULT '{}'::jsonb,
    ADD COLUMN phone text,
    ADD COLUMN avatar_url text;
  ```
- Po migraci: naplnit `preferences` pro existující uživatele nebo nechat prázdné.

---

### 7) UI návrh (Můj účet) — doporučené záložky
- Profil (stávající pole)
- Notifikace (email / push / sms)
- Zabezpečení (change password, sessions, enable 2FA)
- Soukromí (marketing consent)
- Preferences (Téma, Jazyk, Timezone, Avatar)

Každý formulář ukládá pomocí `updateProfile(profile.id, payload)` a po uspěšném uložení zobrazí toast.

---

### 8) Validace knihovny / nástroje (doporučení)
- Telefon: libphonenumber-js nebo intl-tel-input (client-side)
- Adresa: použít geokódovací API (OpenCage, Nominatim, Google) pro normalizaci
- UI komponenty pro validaci: show inline errors, disable save until valid

---

### 9) Priorita — co doporučuji udělat nejdřív (jediný krok najednou)
- Priorita A (rychlý win):
  1. Přidat `preferences` JSONB sloupec do `profiles` (SQL migrace).
  2. V UI přidat Notifikace (checkboxy) + Theme (select) — ukládat do preferences.
- Priorita B (dále):
  1. Přidat pole phone + basic client validation.
  2. Přidat Avatar URL a základní upload UI (Supabase Storage).
- Priorita C (pokročilé):
  1. Session management + 2FA (vyžaduje backend/secure storage).
  2. Plné ověření adres přes externí API.

---

### 10) One‑step workflow pro každé rozšíření
- Já: pošlu JEDEN přesný soubor / SQL příkaz.
- Ty: vložíš/commitneš/spustíš TEN soubor nebo TEN SQL příkaz.
- Poté: spustíš krátký testovací snippet v konzoli a pošleš výsledek.

---

## TODO / Backlog (doplňuji položky)
- [ ] Přidat `profiles.preferences` do DB (migration)
- [ ] UI: Notifikace (email/push/sms) — Můj účet → Notifikace
- [ ] UI: Theme selector (localStorage + persist)
- [ ] UI: Phone field + client validation (libphonenumber)
- [ ] UI: Avatar upload (Supabase Storage)
- [ ] Security: Change password UI + backend flow
- [ ] Security: Sessions listing + revoke
- [ ] Security: 2FA (TOTP / WebAuthn)
- [ ] Privacy: Marketing consent + log

---

## Další kroky (co teď navrhuju)
Vyber prosím JEDNU z následujících akcí, já připravím přesný patch (soubor nebo SQL), který vložíš a otestuješ:
- A) SQL migrace: přidat `preferences jsonb` + `phone` + `avatar_url` do `profiles`.
- B) UI patch: přidat Notifikační checkboxy a Theme selector do Můj účet (frontend only; ukládání do preferences).
- C) UI patch: přidat validaci telefonního čísla (libphonenumber) a uložení do `phone`.

Napiš A, B nebo C (nebo "vše" pokud chceš postupně). Po tvém výběru pošlu přesný jediný soubor/SQL (one-step) a test snippet do konzole.
