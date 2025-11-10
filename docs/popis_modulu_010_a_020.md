# Popis modulů 010 (Správa uživatelů) a 020 (Můj účet)

**Verze:** 2025-11-10  
**Autor:** PatrikCechlovsky  

---

## 📍 Umístění dokumentace

Kompletní dokumentace pro moduly 010 a 020 se nachází v:

```
src/modules/020-muj-ucet/assets/
├── README.md          # Hlavní specifikace a kompletní zadání
├── permissions.md     # Bezpečnost, oprávnění a RLS policies
├── datovy-model.md    # Databázové tabulky, migrace a API
└── checklist.md       # Kontrolní seznam pro implementaci
```

---

## 📋 Přehled dokumentů

### 1. README.md (1,462 řádků, 43 KB)

**Obsahuje:**
- Kompletní přehled modulů 010 a 020
- Detailní specifikace Login Overlay komponenty
- Popis dvoufázového ověření (2FA):
  - E-mail kódy
  - SMS kódy
  - TOTP (Google Authenticator)
  - Recovery kódy
  - Biometrie (FaceID/TouchID)
  - Push notifikace
- UI komponenty s příklady kódu
- Rychlý přístup k nemovitostem
- Acceptační kritéria

**Pro koho:** Agent, který bude implementovat moduly. Obsahuje nejvíce detailů a příkladů kódu.

### 2. permissions.md (986 řádků, 26 KB)

**Obsahuje:**
- Definice rolí (admin, manager, user, viewer)
- Oprávnění pro modul 010:
  - Správa uživatelů
  - Reset 2FA (admin only)
  - 2FA Audit tile
- Oprávnění pro modul 020:
  - Vlastní profil
  - 2FA management
  - Rychlý přístup k nemovitostem
- RLS policies pro všechny tabulky:
  - profiles
  - twofa_events
  - property_managers
  - property_documents
- Rate limiting strategie
- Šifrování citlivých dat (TOTP secrets, recovery codes)
- Kompletní audit trail

**Pro koho:** Bezpečnostní specialista, backend developer zodpovědný za RLS a oprávnění.

### 3. datovy-model.md (980 řádků, 30 KB)

**Obsahuje:**
- Rozšíření tabulky `profiles` (10 nových sloupců)
- Nová tabulka `twofa_events` (audit log 2FA událostí)
- Nová tabulka `property_managers` (správci nemovitostí)
- Nová tabulka `property_documents` (dokumenty nemovitostí)
- Kompletní SQL migrace včetně rollback skriptů
- API endpoints s příklady request/response:
  - POST /api/auth/login
  - POST /api/auth/twofa/verify
  - POST /api/auth/twofa/send
  - POST /api/profiles/:id/twofa/enable
  - POST /api/profiles/:id/twofa/totp/setup
  - GET /api/profiles/me/quick-access
  - a další...
- TypeScript datové struktury (interfaces)

**Pro koho:** Database administrator, backend developer zodpovědný za migrace a API.

### 4. checklist.md (709 řádků, 22 KB)

**Obsahuje:**
- Kontrolní seznam před zahájením
- Checklist pro databázi a migrace (4 tabulky)
- Checklist pro backend API (15+ endpointů)
- Checklist pro frontend:
  - Login Overlay komponenta
  - Modul 010 rozšíření
  - Modul 020 rozšíření
- Bezpečnostní checklist (validace, šifrování, rate limiting)
- Testovací checklist (unit, integration, E2E)
- Dokumentační checklist
- Pre-merge checklist
- Post-merge checklist

**Pro koho:** Project manager, QA tester, developer před commitem.

---

## 🎯 Klíčové funkce k implementaci

### Login & Autentizace

1. **Login Overlay**
   - Zobrazení v content area (centrální část)
   - Blokování UI dokud není uživatel přihlášen
   - Vizuální zatemňování pozadí
   - Formulář: email/username + heslo
   - Link "Zapomenuté heslo"

2. **2FA Flow**
   - Po zadání hesla: kontrola `twofa_enabled`
   - Pokud ANO: zobrazit 2FA výzvu
   - Výběr metody (email, sms, totp)
   - Zadání 6-místného kódu
   - Tlačítko "Poslat znovu" s cooldownem (30s)
   - Možnost použít recovery kód

### Modul 010 - Správa uživatelů

**Rozšíření tile "Přehled":**
- Nový sloupec: 2FA status (badge s ikonami 📧 📱 🔐)
- Nová akce: "Reset 2FA" (admin only)

**Nová tile "2FA Audit":**
- Zobrazení všech 2FA událostí
- Filtrace podle typu, uživatele, data
- Pouze pro admina

**Rozšíření form "Formulář uživatele":**
- Sekce "Dvoufázové ověření" (readonly)
- Tlačítko "Reset 2FA" (admin only)

### Modul 020 - Můj účet

**Rozšíření form "Profil":**

**Sekce: Dvoufázové ověření**
- Master toggle "Zapnout 2FA"
- Checkbox pro E-mail metodu
- Checkbox pro SMS metodu (disabled pokud není phone)
- Tlačítko "Nastavit TOTP" → modal s QR kódem
- Checkbox pro Biometrii (pokud podporováno)
- Tlačítko "Generovat recovery kódy" → modal s kódy

**Sekce: Rychlý přístup**
- Seznam nemovitostí kde je uživatel správce
- Seznam nemovitostí které uživatel vlastní
- Pro každou nemovitost:
  - Tlačítko "Dokumenty" → modal
  - Tlačítko "Jednotky" → navigace
  - Tlačítko "Detail" → navigace

### Databázové změny

**Rozšíření tabulky `profiles`:**
- `primary_phone` VARCHAR(20)
- `primary_email` VARCHAR(255)
- `twofa_enabled` BOOLEAN
- `twofa_methods` JSONB
- `twofa_totp_secret` TEXT (encrypted)
- `twofa_recovery_codes` TEXT (encrypted)
- `twofa_last_sent_at` TIMESTAMPTZ
- `last_login_at` TIMESTAMPTZ
- `last_login_ip` VARCHAR(45)
- `preferences` JSONB

**Nová tabulka `twofa_events`:**
- Audit log všech 2FA událostí
- Sloupce: event_type, method, success, ip, user_agent, metadata

**Nová tabulka `property_managers`:**
- Vazba uživatelů na spravované nemovitosti
- Sloupce: property_id, profile_id, role

**Nová tabulka `property_documents`:**
- Dokumenty nemovitostí
- Sloupce: property_id, doc_type, title, file_url, ...

---

## 🔒 Bezpečnostní požadavky

### Rate Limiting

| Endpoint | Limit | Okno |
|----------|-------|------|
| POST /api/auth/login | 5 pokusů | 15 minut (IP) |
| POST /api/auth/login | 10 pokusů | 1 hodina (account) |
| POST /api/auth/twofa/verify | 5 pokusů | per challenge |
| POST /api/auth/twofa/send | 3 kódy | 10 minut |
| POST /api/auth/twofa/send | cooldown 30s | mezi požadavky |

### Šifrování

- **TOTP secrets:** AES-256-GCM
- **Recovery codes:** AES-256-GCM
- **Klíč:** Environment variable `TWOFA_ENCRYPTION_KEY`
- **Nikdy nelogovat** plain text secrets

### RLS Policies

- Všechny nové tabulky mají RLS enabled
- User vidí pouze své záznamy
- Admin vidí vše
- Manager vidí své spravované nemovitosti

### Audit Trail

- Všechny 2FA události logované do `twofa_events`
- IP adresa vždy zaznamenána
- User agent vždy zaznamenán
- Tabulka immutable (no UPDATE/DELETE)

---

## 📊 Statistiky dokumentace

| Soubor | Řádků | Velikost | Slova | Obsahuje |
|--------|-------|----------|-------|----------|
| README.md | 1,462 | 43 KB | ~11,000 | Hlavní specifikace + příklady kódu |
| permissions.md | 986 | 26 KB | ~8,000 | Oprávnění + RLS + šifrování |
| datovy-model.md | 980 | 30 KB | ~8,500 | DB migrace + API + struktury |
| checklist.md | 709 | 22 KB | ~5,600 | Kontrolní seznam |
| **CELKEM** | **4,137** | **121 KB** | **~33,100** | Kompletní zadání |

---

## ✅ Acceptační kritéria

### Login Overlay

- [ ] Po spuštění aplikace (nepřihlášen) se zobrazí login overlay
- [ ] Overlay je v content area, zbytek UI je zatemněný a neaktivní
- [ ] Po zadání správných údajů bez 2FA se uživatel přihlásí
- [ ] Po zadání správných údajů s 2FA se zobrazí 2FA výzva
- [ ] Po úspěšném 2FA se uživatel přihlásí
- [ ] Po přihlášení overlay zmizí a UI je aktivní

### Modul 010 - Správa uživatelů

- [ ] Přehled zobrazuje sloupec se stavem 2FA
- [ ] Admin může resetovat 2FA uživatele
- [ ] Nová tile "2FA Audit" zobrazuje log událostí
- [ ] Filtrování událostí v audit logu funguje
- [ ] Při pozvání lze vynutit 2FA

### Modul 020 - Můj účet

- [ ] Sekce 2FA zobrazuje všechny metody
- [ ] Zapnutí/vypnutí metod funguje
- [ ] TOTP setup s QR kódem funguje
- [ ] Generování recovery kódů funguje
- [ ] Sekce "Rychlý přístup" zobrazuje spravované nemovitosti
- [ ] Sekce "Rychlý přístup" zobrazuje vlastněné nemovitosti
- [ ] Akce (detail, jednotky, dokumenty) fungují

### 2FA Functionality

- [ ] E-mail kódy se odesílají správně
- [ ] SMS kódy se odesílají správně (testovací provider)
- [ ] TOTP kódy se ověřují správně
- [ ] Recovery kódy fungují (lze použít jen jednou)
- [ ] Rate limiting funguje
- [ ] Všechny 2FA události se logují do `twofa_events`

### Databáze

- [ ] Migrace přidává nové sloupce do `profiles`
- [ ] Tabulka `twofa_events` existuje a funguje
- [ ] Tabulka `property_managers` existuje a funguje
- [ ] Tabulka `property_documents` existuje a funguje
- [ ] RLS policies jsou správně nastavené

### Bezpečnost

- [ ] Citlivé data (TOTP secret, recovery codes) jsou šifrované
- [ ] Kódy nejsou logovány v plain textu
- [ ] Rate limiting pro přihlášení a 2FA funguje
- [ ] Audit trail je kompletní

---

## 🚀 Jak používat tuto dokumentaci

### Pro agenta implementujícího funkce:

1. **Start:** Přečti `README.md` pro celkový přehled
2. **Databáze:** Použij SQL migrace z `datovy-model.md`
3. **Backend:** Implementuj API endpointy podle `datovy-model.md`
4. **Frontend:** Následuj UI specifikace z `README.md`
5. **Bezpečnost:** Implementuj podle `permissions.md`
6. **Kontrola:** Projdi `checklist.md` před mergem

### Pro reviewera:

1. Ověř, že implementace odpovídá specifikaci v `README.md`
2. Zkontroluj bezpečnost podle `permissions.md`
3. Ověř DB migrace podle `datovy-model.md`
4. Projdi checklist v `checklist.md`

### Pro project managera:

1. Sleduj progress podle `checklist.md`
2. Acceptační kritéria najdeš v `README.md` (sekce "Acceptační kritéria")
3. Estimace: ~5-7 dní pro kompletní implementaci (1 developer)

---

## 📞 Kontakt

Pro dotazy k dokumentaci nebo implementaci kontaktujte:
- **Autor dokumentace:** PatrikCechlovsky
- **Repository:** PatrikCechlovsky/aplikace-v5
- **Branch:** copilot/setup-modules-010-020

---

**Poslední aktualizace:** 2025-11-10  
**Verze dokumentace:** 1.0  
**Status:** ✅ Připraveno k implementaci
