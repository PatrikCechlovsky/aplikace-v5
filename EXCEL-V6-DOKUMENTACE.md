# Excel V6 Metamodel - Dokumentace

## Přehled

Soubor `struktura-V6.xlsx` byl vygenerován podle nové metodiky generování Excel metamodelu. Tento dokument popisuje strukturu, pravidla a způsob použití.

## 📐 Metodika generování

### 1️⃣ Obecná pravidla

#### 1.1 Každý modul = jeden hlavní list
- **Název listu:** `Modul_<číslo>_<název>`
- **Příklad:** `Modul_030_Pronajimatel`

#### 1.2 Každý modul má 4 hlavní sekce (vždy ve stejném pořadí)
1. **META** – základní info o modulu
2. **SIDEBAR** – navigace v modulu
3. **PŘEHLEDY** – tabulkové seznamy
4. **FORMULÁŘE** – pole formulářů

### 2️⃣ META sekce

Malá tabulka s klíči a hodnotami:

| meta_key | meta_value |
|----------|------------|
| module_code | 030 |
| module_name_cz | Pronajimatel |
| entity_table | subjects |
| description | Modul pro správu pronajimatel |

**Účel:** META sekce dává modulu identitu a základní metadata.

### 3️⃣ SIDEBAR (navigace)

Definuje, co se v modulu objeví vlevo v menu.

**Každá položka má:**
- pořadí (order)
- skupinu (group) - např. Hlavní / Nastavení
- typ (type) - overview / form
- technický kód (code) - např. PRON_OVERVIEW_LIST
- český label (label_cz)
- odkaz (target_code)
- ikonu (icon)
- popis (description)

**Příklad:**
```
order | group  | type     | code              | label_cz           | target_code        | icon | description
1     | Hlavní | overview | 030_OVERVIEW_LIST | Přehled Pronajímatel | 030_OVERVIEW_LIST | list | Hlavní přehled modulu
```

### 4️⃣ PŘEHLEDY (seznamy)

Každý přehled je jedna tabulka dat.

**Struktura:**
- Název přehledu a ikona
- Tabulka sloupců s těmito atributy:
  - `field_code` - technický kód pole
  - `field_label_cz` - český název
  - `data_type` - datový typ (string, number, date, boolean)
  - `length` - délka pole
  - `filterable` - možnost filtrovat (Ano/Ne)
  - `sortable` - možnost řadit (Ano/Ne)
  - `width` - šířka sloupce (%, px)
  - `description` - popis funkce

**Příklad:**
```
Přehled: Přehled Pronajímatelů | Ikona: list

field_code    | field_label_cz | data_type | length | filterable | sortable | width | description
typ_subjektu  | Typ            | string    |        | Ano        | Ano      | 10%   | barevně označené
display_name  | Název / Jméno  | string    |        | Ano        | Ano      | 20%   |
```

### 5️⃣ FORMULÁŘE

Každý formulář má svůj kód a pole.

**Struktura pole:**
- `field_code` - technický kód pole
- `field_label_cz` - český název
- `data_type` - datový typ (text, number, date, select, checkbox)
- `length` - délka pole
- `required` - povinnost (Ano/Ne)
- `default_value` - výchozí hodnota
- `validation` - validační pravidla
- `description` - popis
- `business_logic` - business logika

**Příklad:**
```
Formulář: Detail Pronajímatele | Kód: DETAIL_PRONAJIMATELE

field_code    | field_label_cz | data_type | length | required | default_value | validation | description | business_logic
display_name  | Název          | text      | 100    | Ano      |               | required   |             |
ico           | IČO            | text      | 8      | Ne       |               | ico_format |             |
```

### 6️⃣ Centrální listy

#### 6.1 Nastavení_ID

Ukládá prefixy a číslování pro generování kódů typu:
- `PRON-FIRM-0001`
- `PRON-OSVC-0002`
- `SML-HLAV-0012`

**Struktura:**
```
module_code | type_code | module_prefix | type_prefix | sequence_length | next_number | example
030         | FIRM      | PRON          | FIRM        | 4               | 1           | PRON-FIRM-0001
030         | OSVC      | PRON          | OSVC        | 4               | 1           | PRON-OSVC-0001
```

#### 6.2 Číselníky

Centrální seznam hodnot pro:
- typ pronajímatele
- typ dokumentu
- způsob platby
- druh nemovitosti
- atd.

**Struktura:**
```
codelist_type      | code    | label_cz        | prefix | editable | description
typ_pronajimatele  | FIRM    | Firma           | FIRM   | Ne       | Právnická osoba - firma
typ_pronajimatele  | OSVC    | OSVČ            | OSVC   | Ne       | Fyzická osoba podnikající
zpusob_platby      | BANK    | Bankovní převod |        | Ano      | Platba bankovním převodem
```

**Výhody:**
- Jeden zdroj pravdy
- Zabránění duplikaci hodnot
- Řízení povolených hodnot v importech i formulářích

#### 6.3 Importy_Exporty

Definice typů importu/exportu:

**Struktura:**
```
code              | module_code | type   | target   | description              | template_name
PRON_IMPORT_MAIN  | 030         | import | form     | Import pronajímatelů     | Import_Pronajimatele.xlsx
PRON_EXPORT_MAIN  | 030         | export | overview | Export pronajímatelů     | Export_Pronajimatele.xlsx
```

#### 6.4 Šablony_importu

Detailní definice sloupců importu:

**Struktura:**
```
import_code       | order | field_code   | field_label_cz  | required | allowed_values_source | example_value    | description
PRON_IMPORT_MAIN  | 1     | typ_subjektu | Typ pronajímatele| Ano     | typ_pronajimatele     | FIRM            | Typ z číselníku
PRON_IMPORT_MAIN  | 2     | display_name | Název/Jméno      | Ano     |                       | ABC s.r.o.      | Název firmy
```

### 7️⃣ Dvouřádkové hlavičky

**Pravidlo platí pro všechny listy:**
- **První řádek** = technický název pole (pro DB / API)
- **Druhý řádek** = český název (pro uživatele)

**Příklad:**
```
field_code | field_label_cz
Pole       | Název pole (CZ)
```

### 8️⃣ Barevné zvýraznění

**V Excelu jsou použity následující barvy:**
- 🔵 **Modrá (#2563EB)** - Sekce META / SIDEBAR / PŘEHLEDY / FORMULÁŘE
- 🟡 **Žlutá (#FFD966)** - Hlavičky tabulek (dvouřádkové)
- ⚪ **Bílá** - Text v modrých sekcích
- ⚫ **Černá** - Standardní text

## 📦 Vygenerované moduly

Excel V6 obsahuje následující moduly:

1. **Modul_010_Sprava_uzivatelu** - Správa uživatelů
2. **Modul_020_Muj_ucet** - Můj účet
3. **Modul_030_Pronajimatel** - Pronajímatel (subjekty)
4. **Modul_040_Nemovitost** - Nemovitosti
5. **Modul_050_Najemnik** - Nájemníci
6. **Modul_060_Smlouva** - Smlouvy
7. **Modul_070_Sluzby** - Služby
8. **Modul_080_Platby** - Platby
9. **Modul_090_Finance** - Finance
10. **Modul_100_Energie** - Energie
11. **Modul_110_Udrzba** - Údržba
12. **Modul_120_Dokumenty** - Dokumenty
13. **Modul_130_Komunikace** - Komunikace
14. **Modul_900_Nastaveni** - Nastavení

## 🔧 Použití

### Generování nového Excel V6

```bash
node generate-excel-v6.js
```

Tento příkaz:
1. Načte zdrojový soubor `struktura-aplikace (10).xlsx`
2. Zpracuje všechny moduly
3. Vytvoří centrální listy
4. Vygeneruje výstupní soubor `struktura-V6.xlsx`

### Požadavky

- Node.js (verze 14+)
- npm balíček `exceljs`

Instalace závislostí:
```bash
npm install
```

## 🎯 Výhody nové metodiky

1. **Konzistence** - Všechny moduly mají stejnou strukturu
2. **Dokumentace** - Všechny poznámky a logika jsou uloženy v Excelu
3. **Automatizace** - Možnost generovat kód, importy a exporty z metamodelu
4. **Přehlednost** - Barevné zvýraznění a dvouřádkové hlavičky
5. **Centralizace** - Číselníky a nastavení na jednom místě
6. **Rozšiřitelnost** - Snadné přidání nových modulů

## 📝 Historie změn

### Verze 6 (2025-11-21)
- ✅ Implementace nové metodiky
- ✅ Dvouřádkové hlavičky (technické + české názvy)
- ✅ Barevné zvýraznění sekcí
- ✅ Centrální listy (Nastavení_ID, Číselníky, Importy_Exporty, Šablony_importu)
- ✅ Jednotná struktura pro všechny moduly (META, SIDEBAR, PŘEHLEDY, FORMULÁŘE)
- ✅ Extrakce dat ze zdrojového Excel souboru

## 🔜 Další kroky

1. Ověření a doplnění business logiky v FORMULÁŘE sekcích
2. Rozšíření číselníků o další typy
3. Doplnění šablon importu pro všechny moduly
4. Generování DB schémat z metamodelu
5. Generování API endpoints z metamodelu
6. Generování UI komponent z metamodelu
