# Aplikace v5 - Kompletní Dokumentace Pro Nový Start

> **Účel:** Tento dokument a celá složka NEW obsahuje kompletní popis aplikace včetně všech pravidel, struktur a standardů potřebných pro úspěšný restart projektu v nové verzi nebo předání jinému vývojáři.

**Datum vytvoření:** 2025-10-25  
**Verze dokumentace:** 1.0  
**Stav aplikace:** Rozpracováno (moduly 010, 020, 030, 040, 050 částečně dokončeny)

---

## 📚 Obsah Dokumentace

### Základní dokumenty

1. **[README.md](./README.md)** - Tento soubor - úvod a orientace
2. **[01-PREHLED-APLIKACE.md](./01-PREHLED-APLIKACE.md)** - Hlavní přehled aplikace
3. **[02-STRUKTURA-UI.md](./02-STRUKTURA-UI.md)** - Struktura uživatelského rozhraní
4. **[03-BEZPECNOST-AUTENTIZACE.md](./03-BEZPECNOST-AUTENTIZACE.md)** - Bezpečnost a přihlašování
5. **[04-VZOROVE-FORMULARE.md](./04-VZOROVE-FORMULARE.md)** - Vzory formulářů a jejich chování
6. **[05-VZOROVE-PREHLEDY.md](./05-VZOROVE-PREHLEDY.md)** - Vzory přehledů a seznamů
7. **[06-HISTORIE-PRILLOHY.md](./06-HISTORIE-PRILLOHY.md)** - Historie změn a přílohy
8. **[07-DATABASE-SCHEMA.md](./07-DATABASE-SCHEMA.md)** - Kompletní databázové schéma
9. **[08-SABLONA-MODULU.md](./08-SABLONA-MODULU.md)** - Šablona a pravidla pro moduly
10. **[09-NAVOD-COPILOT.md](./09-NAVOD-COPILOT.md)** - Návod pro práci s GitHub Copilot
11. **[10-CHECKLIST-PRAVIDLA.md](./10-CHECKLIST-PRAVIDLA.md)** - Kontrolní seznam a pravidla

---

## 🎯 Účel Aplikace

**Název:** Aplikace pro správu pronájmů (Pronajímatel v5)

**Hlavní funkce:**
- Správa pronajímatelů (vlastníků nemovitostí)
- Správa nájemníků (fyzických i právnických osob)
- Evidence nemovitostí (budovy, pozemky) a jejich jednotek (byty, kanceláře)
- Správa nájemních smluv
- Evidence plateb a dluhů
- Správa služeb (energie, voda, internet)
- Komunikace s nájemníky
- Finanční reporting

**Cílová platforma:**
- Webová aplikace (desktop-first, PC)
- Progresivní webová aplikace (PWA ready)
- Backend: Supabase (PostgreSQL, Auth, Storage, RLS)
- Frontend: Vanilla JavaScript + Tailwind CSS

---

## 🏗️ Architektura Aplikace

### Technologie

```
Frontend:
├── Vanilla JavaScript (ES6+)
├── Tailwind CSS (styling)
├── Vite (build tool - plánováno)
└── Žádný framework (React, Vue, Angular)

Backend:
├── Supabase
│   ├── PostgreSQL (databáze)
│   ├── Auth (autentizace)
│   ├── Storage (soubory)
│   └── RLS (Row Level Security)
└── Edge Functions (plánováno)

Nástroje:
├── GitHub (verzování)
├── GitHub Copilot (AI asistent)
└── ExcelJS (export dat)
```

### Struktura Projektu

```
aplikace-v5/
├── index.html              # Přihlašovací stránka
├── app.html                # Hlavní aplikace (po přihlášení)
├── styles.css              # Globální styly
├── package.json            # Závislosti
│
├── src/                    # Zdrojové kódy
│   ├── app.js              # Hlavní vstupní bod aplikace
│   ├── auth.js             # Autentizace
│   ├── supabase.js         # Supabase klient
│   ├── db.js               # Databázové funkce
│   │
│   ├── app/                # Aplikační logika
│   │   ├── modules.index.js     # Registry modulů
│   │   └── app.render-shim.js   # Render helper
│   │
│   ├── modules/            # Moduly aplikace
│   │   ├── 010-sprava-uzivatelu/    # ⭐ Referenční modul
│   │   ├── 020-muj-ucet/
│   │   ├── 030-pronajimatel/
│   │   ├── 040-nemovitost/
│   │   ├── 050-najemnik/
│   │   ├── 060-smlouva/         # Rozpracováno
│   │   ├── 070-sluzby/          # Plánováno
│   │   ├── 080-platby/          # Plánováno
│   │   └── ...
│   │
│   ├── ui/                 # UI komponenty
│   │   ├── homebutton.js        # Domů tlačítko
│   │   ├── sidebar.js           # Boční menu
│   │   ├── breadcrumb.js        # Navigační cesta
│   │   ├── headerActions.js     # Akce v hlavičce
│   │   ├── commonActions.js     # Společné akce
│   │   ├── content.js           # Hlavní obsah
│   │   ├── table.js             # Tabulka
│   │   ├── form.js              # Formulář
│   │   ├── attachments.js       # Přílohy
│   │   └── icons.js             # Ikony
│   │
│   ├── security/           # Bezpečnost
│   │   └── permissions.js       # Správa oprávnění
│   │
│   ├── services/           # Služby
│   │   ├── ares.js              # ARES API (firemní registry)
│   │   ├── payments.js          # Platby
│   │   └── accountMemberships.js
│   │
│   ├── logic/              # Obchodní logika
│   │   └── actions.config.js    # Konfigurace akcí
│   │
│   ├── lib/                # Knihovny
│   │   ├── type-schemas/        # Typy dat
│   │   └── utils/               # Utility
│   │
│   └── db/                 # Databázové funkce
│       └── subjects.js          # Subjekty (pronajímatelé, nájemníci)
│
├── docs/                   # Stará dokumentace (reference)
│   ├── ODPOVED-NA-POZADAVKY.md
│   ├── STANDARDIZACNI-NAVOD.md
│   ├── how-to-create-module.md
│   └── database-schema.md
│
└── NEW/                    # ⭐ NOVÁ DOKUMENTACE (tento adresář)
    ├── README.md                      # Tento soubor
    ├── 01-PREHLED-APLIKACE.md        # Přehled
    ├── 02-STRUKTURA-UI.md            # UI struktura
    ├── 03-BEZPECNOST-AUTENTIZACE.md  # Bezpečnost
    ├── 04-VZOROVE-FORMULARE.md       # Formuláře
    ├── 05-VZOROVE-PREHLEDY.md        # Přehledy
    ├── 06-HISTORIE-PRILLOHY.md       # Historie a přílohy
    ├── 07-DATABASE-SCHEMA.md         # Databáze
    ├── 08-SABLONA-MODULU.md          # Šablona modulu
    ├── 09-NAVOD-COPILOT.md           # GitHub Copilot
    └── 10-CHECKLIST-PRAVIDLA.md      # Checklist
```

---

## 🚀 Rychlý Start

### Pro předání projektu:

1. **Přečti tento soubor** - získáš přehled o aplikaci
2. **Projdi dokumenty 01-10** - pochopíš detaily
3. **Prostuduj modul 010** - je to referenční vzor (src/modules/010-sprava-uzivatelu/)
4. **Zkontroluj databázi** - schéma je v 07-DATABASE-SCHEMA.md
5. **Připrav prostředí** - návod v 09-NAVOD-COPILOT.md

### Pro pokračování ve vývoji:

1. **Zkontroluj stav modulů** - viz kapitola níže
2. **Vyber prioritní úkol** - viz 10-CHECKLIST-PRAVIDLA.md
3. **Vytvoř nový modul** - podle 08-SABLONA-MODULU.md
4. **Dodržuj standardy** - viz všechny dokumenty v NEW/

---

## 📊 Aktuální Stav Modulů

| ID | Název | Stav | Priorita | Poznámka |
|----|-------|------|----------|----------|
| 010 | Správa uživatelů | ✅ 95% | Vysoká | **Referenční modul** - vzor pro ostatní |
| 020 | Můj účet | ✅ 80% | Střední | Potřebuje rozšíření |
| 030 | Pronajímatel | ⚠️ 70% | Vysoká | Chybí historie, breadcrumbs |
| 040 | Nemovitost | ✅ 90% | Vysoká | Včetně jednotek, propojení OK |
| 050 | Nájemník | ⚠️ 70% | Vysoká | Chybí historie, breadcrumbs |
| 060 | Smlouvy | 🔨 30% | 🔴 Kritická | Rozpracováno, priorita |
| 070 | Služby | 📝 10% | Střední | Připraveno k vývoji |
| 080 | Platby | 📝 10% | 🔴 Kritická | Připraveno k vývoji |
| 090 | Finance | ❌ 0% | Střední | Plánováno |
| 100 | Energie | ❌ 0% | Nízká | Plánováno |
| 110 | Údržba | ❌ 0% | Střední | Plánováno |
| 120 | Dokumenty | ❌ 0% | Nízká | Plánováno |
| 130 | Komunikace | ❌ 0% | Nízká | Plánováno |
| 900 | Nastavení | ❌ 0% | Střední | Plánováno |
| 990 | Help | ❌ 0% | Nízká | Plánováno |

**Legenda:**
- ✅ Dokončeno (80%+)
- ⚠️ Rozpracováno (50-79%)
- 🔨 Ve vývoji (20-49%)
- 📝 Připraveno (1-19%)
- ❌ Neplánováno (0%)

---

## 🎯 Priority Vývoje

### Kritické (do 2 týdnů)
1. ✅ Dokončit modul 060 (Smlouvy)
2. ✅ Dokončit modul 080 (Platby)
3. ⚠️ Doplnit historii do modulů 030, 050

### Vysoké (do 1 měsíce)
4. Standardizovat breadcrumbs všude
5. Standardizovat CommonActions všude
6. Přidat 2FA autentizaci

### Střední (do 2 měsíců)
7. Modul 070 (Služby)
8. Modul 090 (Finance)
9. Modul 110 (Údržba)

### Nízké (do 3 měsíců)
10. Modul 100 (Energie)
11. Modul 120 (Dokumenty)
12. Modul 130 (Komunikace)
13. Modul 990 (Help)

---

## 🔑 Klíčové Principy

### 1. Konzistence
- **Jeden vzor pro formuláře** - viz modul 010
- **Jeden vzor pro přehledy** - viz modul 010
- **Stejné ikony všude** - viz ui/icons.js
- **Stejné akce všude** - viz commonActions.js

### 2. Jednoduchost
- **Bez frameworků** - vanilla JavaScript
- **Bez builderu** - přímé načítání modulů
- **Jasná struktura** - jeden modul = jedna složka

### 3. Bezpečnost
- **RLS v databázi** - každá tabulka má RLS policies
- **Kontrola oprávnění** - permissions.js
- **Historie změn** - každá entita má *_history tabulku
- **Audit log** - všechny důležité akce

### 4. Uživatelská přívětivost
- **Breadcrumbs** - vždy víš kde jsi
- **Unsaved helper** - ochrana před ztrátou dat
- **Validace** - inline kontrola formulářů
- **Toast notifikace** - feedback pro uživatele

---

## 📖 Jak Číst Dokumentaci

### Pro rychlý přehled (30 minut)
1. Tento README
2. 01-PREHLED-APLIKACE.md
3. 08-SABLONA-MODULU.md

### Pro pochopení struktury (2 hodiny)
1. Tento README
2. 02-STRUKTURA-UI.md
3. 04-VZOROVE-FORMULARE.md
4. 05-VZOROVE-PREHLEDY.md
5. Prostuduj modul 010

### Pro kompletní znalost (1 den)
- Všechny dokumenty v NEW/
- Všechny moduly v src/modules/
- Databázové schéma v Supabase

---

## ⚠️ Důležitá Upozornění

### Co NIKDY nedělat:
1. ❌ Nemazat funkční kód bez důvodu
2. ❌ Neměnit strukturu modulů bez konzultace
3. ❌ Necommitovat secrets (API klíče, hesla)
4. ❌ Neobcházet RLS policies v databázi
5. ❌ Neodstraňovat testy (pokud existují)

### Co VŽDY dělat:
1. ✅ Používat modul 010 jako vzor
2. ✅ Dodržovat strukturu souborů
3. ✅ Aktualizovat dokumentaci při změnách
4. ✅ Testovat všechny změny
5. ✅ Commitovat často s popisnými zprávami

---

## 🤝 Kontakt a Podpora

### Pro otázky kontaktuj:
- Vlastník projektu: [Patrik Čechlovsky]
- Repository: https://github.com/PatrikCechlovsky/aplikace-v5

### Užitečné odkazy:
- Supabase Dashboard: [URL projektu]
- GitHub Issues: [Pro hlášení chyb]
- GitHub Copilot: [Pro AI asistenci]

---

## 📝 Historie Dokumentace

| Verze | Datum | Autor | Změny |
|-------|-------|-------|-------|
| 1.0 | 2025-10-25 | GitHub Copilot | Prvotní vytvoření dokumentace |

---

## ✅ Další Kroky

Po přečtení tohoto README pokračuj v pořadí:

1. **[01-PREHLED-APLIKACE.md](./01-PREHLED-APLIKACE.md)** - detailní popis aplikace
2. **[02-STRUKTURA-UI.md](./02-STRUKTURA-UI.md)** - jak funguje UI
3. **[08-SABLONA-MODULU.md](./08-SABLONA-MODULU.md)** - jak vytvořit modul
4. **[09-NAVOD-COPILOT.md](./09-NAVOD-COPILOT.md)** - jak efektivně pracovat

---

**Hodně štěstí s projektem! 🚀**
