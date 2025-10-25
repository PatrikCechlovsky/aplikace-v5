# 01 - Přehled Aplikace

> **Tento dokument poskytuje komplexní přehled o aplikaci, jejích funkcích, architektuře a designových rozhodnutích.**

---

## 📖 Obsah

1. [Účel Aplikace](#účel-aplikace)
2. [Hlavní Funkce](#hlavní-funkce)
3. [Uživatelské Role](#uživatelské-role)
4. [Moduly Aplikace](#moduly-aplikace)
5. [Datový Model](#datový-model)
6. [Technologický Stack](#technologický-stack)
7. [Designová Rozhodnutí](#designová-rozhodnutí)

---

## 🎯 Účel Aplikace

**Aplikace pro správu pronájmů (Pronajímatel v5)** je kompletní systém pro správu nemovitostí, nájemníků, pronajímatelů a souvisejících procesů.

### Hlavní cíle:
- **Centralizace dat** - jedno místo pro všechny informace o pronájmech
- **Automatizace** - snížení manuální práce (faktury, upomínky, smlouvy)
- **Transparentnost** - jasný přehled o financích, platbách, dluzích
- **Komunikace** - efektivní komunikace s nájemníky
- **Compliance** - dodržování právních požadavků

### Cílová skupina:
- **Správci nemovitostí** (primární uživatelé)
- **Pronajímatelé** (vlastníci nemovitostí)
- **Účetní** (finanční reporting)
- **Nájemníci** (samoobsluha - plánováno)

---

## 🎨 Hlavní Funkce

### 1. Správa Subjektů

#### Pronajímatelé (Modul 030)
- Evidence vlastníků nemovitostí
- Fyzické i právnické osoby
- Kontaktní údaje, bankovní spojení
- Vazba na nemovitosti
- Historie změn

#### Nájemníci (Modul 050)
- Evidence nájemců
- Fyzické i právnické osoby
- Smlouvy, platby, historie
- Vazba na jednotky (byty, kanceláře)

#### Zástupci
- Osoby jednající za jiné subjekty
- Plná moc, zastoupení

### 2. Správa Nemovitostí (Modul 040)

#### Typy nemovitostí:
- **Bytový dům** - vícepodlažní budova s byty
- **Rodinný dům** - samostatný dům
- **Administrativní budova** - kanceláře
- **Průmyslový objekt** - sklady, výrobní haly
- **Pozemek** - stavební, zemědělský
- **Jiný objekt** - garáže, sklepy

#### Jednotky (byty, kanceláře):
- Podrobné údaje o jednotce
- Výměra, dispozice, stav
- Vazba na nájemníka
- Vazba na smlouvu
- Historie pronájmů

#### Údaje o nemovitosti:
- Adresa (ulice, město, PSČ)
- Katastrální údaje (LV, parcela)
- Vlastník (vazba na pronajímatele)
- Technické údaje
- Přílohy (fotky, dokumenty)

### 3. Smlouvy (Modul 060 - rozpracováno)

#### Typy smluv:
- **Nájemní smlouva** - standardní pronájem
- **Podnájemní smlouva** - podnájem
- **Předávací protokol** - předání/vrácení jednotky
- **Dodatek ke smlouvě** - změny smlouvy

#### Funkce:
- Generování smluv z šablon
- Elektronický podpis (plánováno)
- Upozornění na expiraci
- Historie verzí
- Vazba na platby

### 4. Platby (Modul 080 - připraveno)

#### Evidence plateb:
- Nájemné
- Zálohy na služby
- Kauci
- Pokuty, penále

#### Funkce:
- Automatické vytváření faktur
- Párování plateb
- Evidence dluhů
- Upomínky (automatické)
- Export do účetnictví

### 5. Služby (Modul 070 - připraveno)

#### Typy služeb:
- Energie (elektřina, plyn)
- Voda, odpad
- Internet, TV
- Úklid, údržba společných prostor
- Správa domu

#### Funkce:
- Měsíční/roční vyúčtování
- Odečty měřičů
- Přeúčtování na nájemníky
- Historie spotřeby

### 6. Finance (Modul 090 - plánováno)

#### Reporting:
- Přehled příjmů/výdajů
- Cash flow
- Rentabilita nemovitostí
- DPH reporting
- Export pro účetní

### 7. Komunikace (Modul 130 - plánováno)

#### Kanály:
- Email notifikace
- SMS (plánováno)
- Push notifikace (PWA)
- Interní zprávy

#### Typy zpráv:
- Upomínky
- Oznámení o platbách
- Informace o údržbě
- Obecná oznámení

---

## 👥 Uživatelské Role

### Role v aplikaci:

#### 1. Admin (Správce systému)
- **Oprávnění:** Vše
- **Přístup:** Všechny moduly
- **Funkce:**
  - Správa uživatelů
  - Správa rolí a oprávnění
  - Konfigurace systému
  - Přístup k audit logu

#### 2. Pronajimatel (Vlastník nemovitostí)
- **Oprávnění:** Čtení + upravování svých dat
- **Přístup:** 
  - Vlastní nemovitosti
  - Vlastní smlouvy
  - Přehledy plateb
  - Finance (reporting)
- **Funkce:**
  - Správa svých nemovitostí
  - Správa jednotek
  - Přehledy o pronájmech
  - Komunikace s nájemníky

#### 3. Najemnik (Nájemce)
- **Oprávnění:** Čtení vlastních dat
- **Přístup:**
  - Vlastní smlouva
  - Vlastní platby
  - Kontakt na správce
  - Hlášení závad (plánováno)
- **Funkce:**
  - Přehled o platbách
  - Stažení faktur
  - Komunikace se správcem
  - Samoobsluha (plánováno)

#### 4. Servisak (Servisní technik)
- **Oprávnění:** Čtení + zápis závad
- **Přístup:**
  - Seznam závad
  - Nemovitosti (čtení)
  - Komunikace
- **Funkce:**
  - Evidence oprav
  - Hlášení o dokončení
  - Fotodokumentace

---

## 📦 Moduly Aplikace

### Dokončené moduly:

| ID | Název | Stav | Popis |
|----|-------|------|-------|
| 010 | Správa uživatelů | ✅ 95% | **Referenční modul** - správa uživatelů, rolí, oprávnění |
| 040 | Nemovitost | ✅ 90% | Správa nemovitostí a jednotek, propojení s 030/050 |

### Rozpracované moduly:

| ID | Název | Stav | Popis |
|----|-------|------|-------|
| 020 | Můj účet | ✅ 80% | Profil uživatele, nastavení účtu |
| 030 | Pronajímatel | ⚠️ 70% | Evidence pronajímatelů (chybí historie) |
| 050 | Nájemník | ⚠️ 70% | Evidence nájemníků (chybí historie) |
| 060 | Smlouvy | 🔨 30% | Správa nájemních smluv |

### Připravené moduly:

| ID | Název | Stav | Popis |
|----|-------|------|-------|
| 070 | Služby | 📝 10% | Evidence služeb, odečty, vyúčtování |
| 080 | Platby | 📝 10% | Evidence plateb, faktury, dluhy |

### Plánované moduly:

| ID | Název | Stav | Popis |
|----|-------|------|-------|
| 090 | Finance | ❌ 0% | Finanční reporting, přehledy |
| 100 | Energie | ❌ 0% | Odečty měřičů, spotřeba |
| 110 | Údržba | ❌ 0% | Správa oprav, závad, servisních zásahů |
| 120 | Dokumenty | ❌ 0% | Správa dokumentů, archiv |
| 130 | Komunikace | ❌ 0% | Zprávy, oznámení, notifikace |
| 900 | Nastavení | ❌ 0% | Konfigurace aplikace |
| 990 | Help | ❌ 0% | Nápověda, dokumentace |

---

## 🗄️ Datový Model

### Základní entity:

```
profiles (Uživatelé)
    ├── id (PK)
    ├── username
    ├── email
    ├── role (admin, pronajimatel, najemnik, servisak)
    └── ...

subjects (Subjekty - pronajímatelé, nájemníci, zástupci)
    ├── id (PK)
    ├── typ_subjektu (osoba, firma, ...)
    ├── role (pronajimatel, najemnik, zastupce)
    ├── display_name
    ├── ico, dic, rodne_cislo
    └── ...
    └── subject_history (historie změn)

properties (Nemovitosti)
    ├── id (PK)
    ├── owner_id (FK → subjects)
    ├── typ_nemovitosti (bytovy_dum, rodinny_dum, ...)
    ├── adresa (ulice, mesto, psc)
    ├── katastralni_udaje
    └── ...

units (Jednotky - byty, kanceláře)
    ├── id (PK)
    ├── property_id (FK → properties)
    ├── tenant_id (FK → subjects)
    ├── typ_jednotky (byt, kancelar, ...)
    ├── vymera, dispozice
    └── ...

contracts (Smlouvy)
    ├── id (PK)
    ├── tenant_id (FK → subjects)
    ├── unit_id (FK → units)
    ├── landlord_id (FK → subjects)
    ├── datum_od, datum_do
    ├── najemne, zalohy
    └── ...

payments (Platby)
    ├── id (PK)
    ├── contract_id (FK → contracts)
    ├── tenant_id (FK → subjects)
    ├── castka, datum_splatnosti
    ├── stav (zaplaceno, nezaplaceno)
    └── ...

attachments (Přílohy)
    ├── id (PK)
    ├── entity_type (property, unit, contract, ...)
    ├── entity_id
    ├── file_url
    └── ...

audit_log (Audit změn)
    ├── id (PK)
    ├── user_id (FK → profiles)
    ├── action (create, update, delete)
    ├── entity_type, entity_id
    └── changes (JSONB)
```

### Vazby:

```
properties (1) → (N) units
subjects (1) → (N) properties (jako vlastník)
subjects (1) → (N) units (jako nájemník)
subjects (1) → (N) contracts (jako nájemník nebo pronajímatel)
units (1) → (N) contracts
contracts (1) → (N) payments
* (N) → (N) attachments (univerzální vazba)
```

---

## 🛠️ Technologický Stack

### Frontend

```javascript
// Vanilla JavaScript (bez frameworku)
import { modul } from './modules/xxx/module.config.js';

// ES6 modules, async/await
// Žádný build proces (zatím)
// Přímé načítání v prohlížeči
```

**Styling:**
```html
<!-- Tailwind CSS (CDN) -->
<link href="https://cdn.tailwindcss.com" rel="stylesheet">

<!-- Vlastní styly v styles.css -->
<link href="styles.css" rel="stylesheet">
```

**Ikony:**
```javascript
// Vlastní ikonový systém v ui/icons.js
// Kombinace emoji + Unicode symboly
icon('add')    // ➕
icon('edit')   // ✏️
icon('delete') // 🗑️
```

### Backend

**Supabase:**
```javascript
// Supabase Client
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// PostgreSQL databáze
// Auth (autentizace)
// Storage (soubory)
// RLS (Row Level Security)
// Edge Functions (plánováno)
```

**Databáze:**
- PostgreSQL 15+
- RLS (Row Level Security) na všech tabulkách
- Triggers pro automatické akce
- Full-text search s podporou češtiny

### Nástroje

```bash
# Verzování
git, GitHub

# AI asistent
GitHub Copilot

# Export
exceljs (npm package)

# Build (plánováno)
vite
```

---

## 💡 Designová Rozhodnutí

### 1. Proč vanilla JavaScript?

**Výhody:**
- ✅ Žádné závislosti na frameworku
- ✅ Rychlý start bez build procesu
- ✅ Malá velikost (žádný bundle)
- ✅ Plná kontrola nad kódem
- ✅ Snadná údržba

**Nevýhody:**
- ❌ Více manuální práce
- ❌ Chybí reaktivita (React, Vue)
- ❌ Musíme řešit vlastní routing

**Rozhodnutí:** Pro aplikaci této velikosti stačí vanilla JS. Framework by přidal zbytečnou složitost.

### 2. Proč Supabase?

**Výhody:**
- ✅ Backend-as-a-Service (BaaS)
- ✅ PostgreSQL (plnohodnotná DB)
- ✅ Built-in autentizace
- ✅ RLS (bezpečnost na DB úrovni)
- ✅ Real-time (pokud budeme potřebovat)
- ✅ Storage (soubory)
- ✅ Dobré API

**Nevýhody:**
- ❌ Vendor lock-in
- ❌ Omezené na PostgreSQL
- ❌ Platba za provoz

**Rozhodnutí:** Supabase výrazně zrychlí vývoj a poskytne solidní backend. Migrace na vlastní backend je možná, ale nepravděpodobná.

### 3. Proč modularita?

**Struktura:**
```
modules/
├── 010-sprava-uzivatelu/
│   ├── module.config.js    # Manifest modulu
│   ├── db.js               # Databázové funkce
│   ├── tiles/              # Přehledy (seznamy)
│   │   └── prehled.js
│   └── forms/              # Formuláře (detail, edit)
│       ├── form.js
│       ├── create.js
│       └── history.js
```

**Výhody:**
- ✅ Jasná struktura
- ✅ Snadná navigace
- ✅ Nezávislé moduly
- ✅ Snadné přidání/odebrání modulu
- ✅ Týmová spolupráce (každý na jiném modulu)

### 4. Proč desktop-first?

**Rozhodnutí:** Primární uživatelé (správci) pracují na PC.

**Priorita:**
1. Desktop (1920x1080)
2. Laptop (1366x768)
3. Tablet (768x1024)
4. Mobile (375x667) - omezená funkcionalita

**Poznámka:** Mobilní verze bude samoobsluha pro nájemníky (plánováno).

---

## 🎯 Designové Vzory

### 1. Konzistence UI

**Všude stejné:**
- Breadcrumbs: `Domů › Modul › Sekce › Detail`
- CommonActions: `Detail | Přidat | Upravit | Archivovat | Přílohy | Obnovit`
- Formuláře: Sekce, readonly pole, historie
- Tabulky: Vybíratelné řádky, dvojklik pro detail

### 2. Ochrana dat

**Unsaved helper:**
```javascript
// Varování před odchodem z formuláře s neuloženými změnami
window.addEventListener('beforeunload', (e) => {
  if (hasUnsavedChanges) {
    e.preventDefault();
    e.returnValue = '';
  }
});
```

### 3. Historie změn

**Automatické ukládání:**
```sql
-- Trigger na tabulce subjects
CREATE TRIGGER subjects_history_trigger
  AFTER UPDATE ON subjects
  FOR EACH ROW
  EXECUTE FUNCTION save_history('subjects');
```

**Zobrazení:**
- Tlačítko "Historie" ve formuláři
- Tabulka s časovou osou změn
- Diff view (co se změnilo)

### 4. Přílohy

**Univerzální systém:**
```javascript
// Attachments pro jakoukoliv entitu
{
  entity_type: 'property',  // nebo 'unit', 'contract', ...
  entity_id: '123',
  file_url: 'storage.supabase.co/...',
  file_name: 'foto.jpg',
  file_size: 1024000,
  mime_type: 'image/jpeg'
}
```

---

## 📊 Datové toky

### Příklad: Vytvoření nové smlouvy

```
1. Uživatel → UI: Klikne "Přidat smlouvu"
2. UI → Router: navigateTo('#/m/060-smlouva/f/chooser')
3. Router → Modul 060: Načte forms/chooser.js
4. Formulář: Zobrazí se formulář pro výběr nájemníka a jednotky
5. Uživatel: Vyplní data, klikne "Uložit"
6. Validace: Zkontroluje povinná pole
7. Formulář → db.js: createContract(data)
8. db.js → Supabase: INSERT INTO contracts
9. Supabase → RLS: Zkontroluje oprávnění
10. Supabase → DB: Uloží data
11. Trigger: Vytvoří audit_log záznam
12. DB → Supabase: Vrátí nový záznam
13. Supabase → db.js: Vrátí response
14. db.js → Formulář: Vrátí result
15. Formulář → UI: Zobrazí toast "Smlouva vytvořena"
16. Router → UI: Přesměruje na detail smlouvy
```

---

## 🔄 Životní cyklus modulu

```
1. Registrace
   └── modules.index.js: Přidá modul do MODULE_SOURCES[]

2. Inicializace
   └── app.js: Načte module.config.js
   └── Registry: Uloží manifest modulu

3. Navigace
   └── Router: Rozpozná URL hash
   └── app.js: Načte tile/form podle ID

4. Render
   └── Tile/Form: Vykreslí obsah do #content
   └── Breadcrumb: Nastaví navigační cestu
   └── CommonActions: Vykreslí akce

5. Interakce
   └── Uživatel: Klikne na akci/řádek
   └── Handler: Zpracuje událost
   └── db.js: Komunikuje s Supabase

6. Aktualizace
   └── DB: Vrátí nová data
   └── Render: Překreslí obsah
   └── Toast: Zobrazí notifikaci
```

---

## 🎨 Vizuální Design

### Barevná schéma

```css
/* Primární barvy */
--primary: #3b82f6;      /* Modrá */
--secondary: #64748b;    /* Šedá */
--success: #10b981;      /* Zelená */
--warning: #f59e0b;      /* Oranžová */
--error: #ef4444;        /* Červená */

/* Pozadí */
--bg-light: #f8fafc;     /* Světlé pozadí */
--bg-dark: #1e293b;      /* Tmavé pozadí (plánováno) */

/* Texty */
--text-primary: #0f172a;
--text-secondary: #64748b;
--text-muted: #94a3b8;
```

### Typografie

```css
/* Font */
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, ...

/* Velikosti */
text-xs: 0.75rem;    /* 12px */
text-sm: 0.875rem;   /* 14px */
text-base: 1rem;     /* 16px */
text-lg: 1.125rem;   /* 18px */
text-xl: 1.25rem;    /* 20px */
```

### Spacing

```css
/* Tailwind spacing scale */
p-2: 0.5rem;   /* 8px */
p-4: 1rem;     /* 16px */
p-6: 1.5rem;   /* 24px */
p-8: 2rem;     /* 32px */
```

---

## 📈 Výkonnost

### Optimalizace

**Lazy loading:**
```javascript
// Moduly se načítají až při potřebě
const mod = await import('./modules/060-smlouva/tiles/prehled.js');
```

**Caching:**
```javascript
// Registry modulů se načte jednou při startu
const registry = new Map();
// Opakované použití bez re-fetchingu
```

**Minimalizace dotazů:**
```javascript
// Jedno volání místo více dotazů
const { data } = await supabase
  .from('properties')
  .select('*, units(*), owner:subjects(*)')
  .eq('id', propertyId);
```

---

## 🔐 Bezpečnost

### RLS Policies

```sql
-- Příklad: Pronajímatel vidí jen svoje nemovitosti
CREATE POLICY "Users can view their own properties"
  ON properties FOR SELECT
  USING (
    owner_id IN (
      SELECT subject_id 
      FROM user_subjects 
      WHERE user_id = auth.uid()
    )
  );
```

### Oprávnění

```javascript
// Kontrola před akcí
const canEdit = getAllowedActions(userRole, ['edit']).includes('edit');
if (!canEdit) {
  toast('Nemáte oprávnění', 'error');
  return;
}
```

---

## 🚀 Nasazení

### Produkce

```bash
# 1. Build (plánováno)
npm run build

# 2. Deploy na Vercel/Netlify
vercel deploy

# 3. Supabase project URL
# Update SUPABASE_URL v supabase.js
```

### Testování

```bash
# Lokální server
python -m http.server 8000

# Nebo
npx serve .

# Otevři: http://localhost:8000
```

---

## 📚 Další Čtení

- **[02-STRUKTURA-UI.md](./02-STRUKTURA-UI.md)** - Detaily o UI komponentách
- **[07-DATABASE-SCHEMA.md](./07-DATABASE-SCHEMA.md)** - Databázové schéma
- **[08-SABLONA-MODULU.md](./08-SABLONA-MODULU.md)** - Vytvoření nového modulu

---

**Konec dokumentu - Přehled aplikace** ✅
