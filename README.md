# aplikace-v5
<img width="842" height="297" alt="image" src="https://github.com/user-attachments/assets/7e5f5e9b-8e11-4dba-8589-d0d512e400b9" />

## 📋 Dokumentace k standardizaci modulů

Tato aplikace používá **jednotnou strukturu modulů** pro zajištění konzistence a kvality kódu.

### 🎯 Hlavní dokumenty:

1. **[ODPOVED-NA-POZADAVKY.md](docs/ODPOVED-NA-POZADAVKY.md)** ⭐ ZAČNI TADY!
   - Přehled všech identifikovaných problémů
   - Seznam věcí které neodpovídají nastavení
   - Rychlý návod jak to opravit
   - Prioritizace úkolů

2. **[STANDARDIZACNI-NAVOD.md](docs/STANDARDIZACNI-NAVOD.md)** 📚 KOMPLETNÍ NÁVOD
   - Podrobné šablony pro dlaždice a formuláře
   - SQL skripty pro databázi
   - Kompletní příklady kódu
   - Kontrolní checklisty

3. **[MODUL-CHECKLIST.md](docs/MODUL-CHECKLIST.md)** ✅ KONTROLNÍ SEZNAM
   - 189 kontrolních bodů
   - Formulář pro hodnocení modulu
   - Akční plán

4. **[RYCHLY-PRUVODCE.md](docs/RYCHLY-PRUVODCE.md)** 🚀 VYTVOŘ NOVÝ MODUL
   - Krok-za-krokem návod (30 minut)
   - Copy-paste šablony
   - Troubleshooting

5. **[how-to-create-module.md](docs/how-to-create-module.md)** 🔧 NOVÝ MODUL KROK ZA KROKEM
   - Kompletní návod pro vytvoření nového modulu
   - Přehled všech zakomentovaných modulů (060-990)
   - Příklady kódu pro všechny části modulu
   - Checklist před commitem

6. **[module-quick-reference.md](docs/module-quick-reference.md)** 📖 RYCHLÁ REFERENCE
   - Struktura modulu na jedné stránce
   - Code snippets pro rychlý start
   - Checklist pro nový modul

### 🗄️ Dokumentace databáze:

7. **[database-schema.md](docs/database-schema.md)** 💾 DATABÁZOVÉ SCHÉMA
   - Kompletní přehled všech Supabase tabulek
   - Popisy sloupců, typů a vazeb
   - Indexy, constraints, triggers, RLS policies
   - Konvence a standardy

8. **[database-schema-maintenance.md](docs/database-schema-maintenance.md)** 🔄 ÚDRŽBA DB DOKUMENTACE
   - Workflow pro změny v databázi
   - Návod na aktualizaci dokumentace
   - Šablony pro nové tabulky
   - Checklist před commitem

### 📊 Aktuální stav modulů:

```
✅ 010-sprava-uzivatelu  (REFERENČNÍ - VZOR pro ostatní)
✅ 020-muj-ucet          (potřebuje rozšíření)
⚠️ 030-pronajimatel      (potřebuje doplnit historii, breadcrumbs)
✅ 040-nemovitost        (DOKONČENO: units, propojení s 030/050, DB dokumentace)
⚠️ 050-najemnik          (potřebuje doplnit historii, breadcrumbs)
❌ 060-990 moduly        (připraveno k vytvoření - viz how-to-create-module.md)
```

### 🎯 Priority:

1. ✅ **DOKONČENO**: Modul 040 - jednotky, propojení s pronajímateli/nájemníky
2. ✅ **DOKONČENO**: Dokumentace databázového schématu
3. ✅ **DOKONČENO**: Návody na vytvoření nových modulů
4. **DALŠÍ**: Přidat historii změn do modulů 030, 050
5. **DALŠÍ**: Vytvořit modul 060 (Smlouvy) podle návodu

### 🆕 Nově přidáno (2025-10-24):

**Modul 040 - Nemovitosti (dokončeno):**
- ✅ Implementován seznam jednotek s filtry
- ✅ Vytvořen detail view pro jednotky
- ✅ Přidáno propojení jednotek s nájemníky (050)
- ✅ Přidáno propojení nemovitostí s pronajímateli (030)
- ✅ Rozšířen formulář jednotky o nájemní údaje

**Databázová dokumentace:**
- 📖 `docs/database-schema.md` - Kompletní přehled všech tabulek (500+ řádků)
- 🔄 `docs/database-schema-maintenance.md` - Návod na údržbu dokumentace
- Dokumentace pokrývá: profiles, subjects, properties, units, attachments, audit_log

**Návody na vytváření modulů:**
- 🚀 `docs/how-to-create-module.md` - Detailní krok-za-krokem návod (600+ řádků)
- 📖 `docs/module-quick-reference.md` - Rychlá reference se code snippets
- Obsahuje příklady pro: module.config.js, db.js, tiles, forms, SQL migrace
- 1,806 řádků dokumentace
- ~55 KB nové dokumentace
- 0 bezpečnostních chyb (CodeQL validated)
- Implementační plán: 6-8 týdnů

### 🔧 Struktura aplikace:

```
src/
├── app/
│   ├── app.js              # Hlavní aplikace
│   └── modules.index.js    # Registry modulů
├── modules/
│   ├── 010-sprava-uzivatelu/  # ⭐ REFERENČNÍ MODUL (použij jako vzor)
│   ├── 020-muj-ucet/
│   ├── 030-pronajimatel/
│   ├── 040-nemovitost/
│   └── 050-najemnik/
├── ui/
│   ├── table.js           # Komponenta tabulky
│   ├── form.js            # Komponenta formuláře
│   ├── commonActions.js   # Akční lišta
│   ├── breadcrumb.js      # Breadcrumbs
│   └── ...
├── db/
│   └── db.js              # Databázové funkce
└── security/
    └── permissions.js     # Oprávnění

docs/
├── ODPOVED-NA-POZADAVKY.md      # ⭐ ZAČNI TADY
├── STANDARDIZACNI-NAVOD.md      # Kompletní návod
├── MODUL-CHECKLIST.md           # Kontrolní seznam
└── RYCHLY-PRUVODCE.md           # Vytvoř nový modul
```

### 📖 Jak používat dokumentaci:

**Pokud chceš:**
- 👉 Zjistit co je špatně → `ODPOVED-NA-POZADAVKY.md`
- 👉 Opravit existující modul → `STANDARDIZACNI-NAVOD.md` + `MODUL-CHECKLIST.md`
- 👉 Vytvořit nový modul → `RYCHLY-PRUVODCE.md`
- 👉 Vidět vzorový kód → `/src/modules/010-sprava-uzivatelu/`

### 🎯 Klíčové standardy:

- ✅ Každý modul má `module.config.js` manifest
- ✅ Breadcrumbs v každém view (Domů › Modul › Sekce)
- ✅ CommonActions VŽDY v `#commonactions` kontejneru
- ✅ Historie změn pro všechny hlavní entity
- ✅ Filtrace + checkbox "Zobrazit archivované"
- ✅ Readonly pole v formulářích (created_at, updated_at, updated_by)
- ✅ Unsaved helper pro ochranu dat
- ✅ Výběr řádku a dvojklik v tabulkách

---
# UI specifikace – Pronajímatel (layout 1–9 + vazby mezi entitami)

Tento dokument definuje jednotný layout, chování a vazby mezi entitami v aplikaci **Pronajímatel**.  
Cílem je, aby každý modul (Pronajímatel, Nemovitost, Jednotka, Nájemník, Smlouva, Platba, …) fungoval stejně.

---

## 1. Devítiblokový layout obrazovky

Každá obrazovka používá stejnou strukturu:

1. **Home button (logo)** – levý horní roh, klik → hlavní dashboard aplikace.
2. **Breadcrumbs** – drobečková navigace `Domů > Modul > Přehled > Entita > Záložka`.
3. **Home actions** – pravý horní roh (uživatel, hledání, notifikace, odhlášení).
4. **Common actions** – akce nad aktuální entitou (editace, kopie, archivace/smazání, přílohy).
5. **Vazby (connections)** – sada záložek reprezentující navázané entity.
6. **Tabs (detail tabs)** – záložky detailu aktuální entity (hlavní karta + vazby).
7. **Entity detail view** – obsah aktivní záložky, typicky formulář + další části.
8. **Sidebar** – levé menu modulů aplikace (stálé, jen zvýrazňuje aktivní modul).
9. **List view (přehled)** – tabulkový seznam entit s filtrem.

---

## 2. Přehled (list view – blok 9)

Každý modul má alespoň jeden přehled:

- zobrazení formou tabulky,
- nahoře textový filtr,
- volba „Zobrazit archivované“,
- klik na řádek = otevření *detailu* dané entity.

Modul může mít více přehledů (např. „Vše“, „Podle typu“, „Pouze aktivní“), ale jedná se pouze o **uložené filtry nad stejnými daty**, ne o odlišný typ obrazovky.

---

## 3. Detail entity – hlavní princip

### 3.1 Vstup do detailu

Detail entity se otevře:
- po kliknutí na řádek v přehledu,
- nebo z jiné vazby (např. klik na konkrétní nemovitost v záložce „Nemovitosti pronajímatele“).

Po otevření detailu:

- Breadcrumbs zobrazí cestu až k entitě.
- Common actions se vztahují k aktuálně otevřené entitě.
- Sidebar zůstává stejný (jen zvýrazní aktivní modul).
- V pravé části se zobrazí **záložky detailu** (blok 6).

---

### 3.2 Dva typy záložek v detailu

Každý detail entity se skládá ze dvou typů záložek:

#### A) Záložka 1 – **„Hlavní karta entity“**

- Je vždy **první záložka**.
- Název odpovídá danému modulu, např.:
  - `Pronajímatel`
  - `Nemovitost`
  - `Jednotka`
  - `Nájemník`
  - `Smlouva`
  - `Platba`
- Obsahuje **vše, co přímo patří k entitě samotné**, typicky v několika částech (sekcích):

Příklad: **Pronajímatel – hlavní karta**

1. Základní údaje pronajímatele (formulář – dvousloupcový layout),
2. Účty pronajímatele,
3. Přílohy pronajímatele,
4. Systémové informace.

Příklad: **Nemovitost – hlavní karta**

1. Základní údaje nemovitosti,
2. Přílohy nemovitosti,
3. Systémové informace.

Tyto části se zobrazují uvnitř bloku **7 – Entity detail view**.

---

#### B) Ostatní záložky – **vazby na jiné entity (blok 5)**

Každá další záložka představuje **vazbu** na jiné entity.

V každé takové záložce platí:

- Nahoře je **seznam** (tabulka) navázaných entit (max. 10 řádků, scroll).
- Dole je **detail** aktuálně vybrané položky (formulář / zobrazení).
- Při otevření záložky je automaticky vybrána **první položka** v seznamu.
- Klik na jiný řádek v seznamu přepne detail dole.
- I pokud je v seznamu jen jedna položka, zobrazuje se stále **seznam + detail**, nikdy pouze jedno z toho.

Toto je povinný standard pro všechny vazby.

---

## 4. Příklady chování – Pronajímatel a Nemovitost

### 4.1 Detail Pronajímatele

Cesta: `Domů > Pronajímatelé > Přehled > Jan Novák`

Záložky:

1. **Pronajímatel (hlavní karta)**  
   - Základní údaje pronajímatele (formulář),  
   - Účty pronajímatele,  
   - Přílohy,  
   - Systémové informace.

2. **Nemovitosti pronajímatele**  
   - Nahoře seznam všech nemovitostí daného pronajímatele (max 10 řádků + scroll).  
   - Dole detail první nemovitosti: formulář nemovitosti + její části (přílohy, systém…).  
   - Klik na jinou nemovitost v seznamu přepne detail dole.

3. **Jednotky**  
   - Seznam všech jednotek napojených přes nemovitosti daného pronajímatele.  
   - Dole detail jednotky (formulář jednotky).

4. **Nájemníci**  
   - Seznam nájemníků napojených přes smlouvy.
   - Dole detail nájemníka.

5. **Smlouvy**  
   - Seznam smluv (aktivních i archivovaných dle filtru).
   - Dole detail smlouvy.

6. **Platby / Finance**  
   - Seznam plateb, případně agregované finanční údaje.  
   - Dole detail platby / přehled.

Konkrétní počet záložek je řízen konfigurací modulu, ale logika je vždy stejná: **záložka = seznam + detail**.

---

### 4.2 Detail Nemovitosti

Cesta: `Domů > Nemovitosti > Přehled > Admin budova Beta`

Záložky:

1. **Nemovitost (hlavní karta)**  
   - Základní údaje nemovitosti,  
   - Přílohy,  
   - Systémové informace.

2. **Pronajímatel**  
   - Seznam pronajímatelů (typicky jedna položka).
   - Dole detail pronajímatele.

3. **Jednotky**  
   - Seznam všech jednotek této nemovitosti (max 10 řádků).  
   - Dole detail vybrané jednotky.

4. **Nájemníci**  
   - Seznam nájemníků (odvozeno přes jednotky a smlouvy).
   - Dole detail nájemníka.

5. **Smlouvy**  
   - Seznam smluv vztahujících se k této nemovitosti.
   - Dole detail smlouvy.

6. **Platby / Finance**  
   - Seznam plateb nebo finanční přehled pro danou nemovitost.
   - Dole detail platby / přehled.

---

## 5. Sidebar (blok 8)

- Levý sloupec, vždy viditelný.
- Obsahuje:
  - hlavní moduly (Uživatelé, Pronajímatelé, Nemovitosti, Jednotky, Nájemníci, Smlouvy, Služby, Platby, Finance, Energie, Dokumenty, Komunikace…),
  - jejich podmoduly a přednastavené přehledy,
  - případné „průvodce“ (wizard) a správu číselníků.
- Sidebar se **nemění podle detailu**, pouze zvýrazňuje aktivní modul a aktivní přehled.

---

## 6. Common actions (blok 4)

Standardní sadu ikon/akcí je potřeba držet jednotně:

- Editace entity,
- Kopie / duplikace,
- Archivace / smazání (podle pravidel modulu),
- Přidání přílohy,
- Případně další akce specifické pro modul.

Akce se vždy vztahují k **aktuálně vybrané entitě** (detail, nikoli k seznamu jako celku).

---

## 7. JSON konfigurace modulů

Konfigurace modulů, přehledů, hlavní karty a vazeb je popsána v souboru `modules.config.json`.  
Struktura viz samostatná sekce v dokumentaci nebo příklad v tomto README.

---

## 8. Diagramy

Pro lepší představu jsou v dokumentaci použity diagramy v MERMAID:

- **Vazby entit** (Pronajímatel, Nemovitost, Jednotka, Nájemník, Smlouva, Platba, Dokument, Energie, …).
- **Layout obrazovky** (bloky 1–9).

Tyto diagramy lze vykreslit přímo v GitHubu nebo jiném nástroji podporujícím Mermaid.


**Verze:** v5  
**Poslední aktualizace:** 2025-10-20
