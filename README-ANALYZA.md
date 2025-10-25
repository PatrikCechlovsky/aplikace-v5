# Analýza struktury aplikace

Tento balíček obsahuje kompletní analýzu struktury aplikace včetně modulů, formulářů, přehledů, akcí a polí.

## Vygenerované soubory

### 1. `struktura-aplikace.md`
Markdown dokumentace obsahující:
- **Kompletní strukturu všech modulů** s ikonami
- **Přehledy (Tiles)** - seznamy záznamů v každém modulu
  - Sloupce s jejich typy a šířkami
  - Dostupné akce (add, edit, archive, attach, refresh, history, atd.)
- **Formuláře (Forms)** - vstupní formuláře
  - Všechna pole s jejich typy (text, email, number, select, checkbox, atd.)
  - Dostupné akce na formulářích
- **Analýza použití polí** - seznam všech polí a kde jsou použita
  - Seřazeno podle počtu použití
  - Ukázka vazeb mezi moduly

### 2. `struktura-aplikace.xlsx`
Excel sešit s následujícími listy:
- **Jeden list pro každý modul** (Uživatelé, Můj účet, Pronajímatel, Přehled, Nájemník)
  - Přehledně formátované tabulky s přehledy a formuláři
  - Barevné rozlišení sekcí (přehledy = zelená, formuláře = červená)
- **List "Analýza polí"** - kompletní přehled všech polí
  - Klíč pole
  - Počet použití
  - Seznam všech míst kde je pole použito (modul, typ, název)
  - Umožňuje rychle najít, kde je například `pronajimatel_id` použit

### 3. `struktura-aplikace.json`
JSON soubor s kompletními daty ve strukturované podobě pro případné další zpracování.

## Analyzované moduly

1. **010-sprava-uzivatelu** (Uživatelé)
   - Přehled uživatelů s rolemi
   - Formuláře pro správu uživatelů

2. **020-muj-ucet** (Můj účet)
   - Formulář pro úpravu profilu

3. **030-pronajimatel** (Pronajímatel)
   - Přehledy: Přehled, Osoba, OSVČ, Firma, Spolek, Státní instituce, Zástupci
   - Formuláře pro vytváření a editaci pronajímatelů

4. **040-nemovitost** (Nemovitosti)
   - Formuláře pro správu nemovitostí a jednotek
   - Správa typů nemovitostí a jednotek

5. **050-najemnik** (Nájemník)
   - Přehledy: Přehled, Osoba, OSVČ, Firma, Spolek, Státní instituce, Zástupci
   - Formuláře pro vytváření a editaci nájemníků

## Jak soubory vznikly

Soubory byly vygenerovány pomocí dvou Node.js skriptů:

### `analyze-structure.js`
- Prochází všechny moduly v `src/modules/`
- Extrahuje konfigurace z `module.config.js`
- Analyzuje tiles (přehledy) a forms (formuláře)
- Extrahuje sloupce z tabulek a pole z formulářů
- Generuje markdown dokumentaci a JSON data

### `generate-excel.js`
- Používá knihovnu `exceljs`
- Načítá JSON data z `struktura-aplikace.json`
- Vytváří formátovaný Excel sešit s listy pro každý modul
- Generuje analýzu použití polí v samostatném listě

## Spuštění analýzy

Pokud potřebujete aktualizovat dokumentaci po změnách v kódu:

```bash
# Spustit analýzu a vygenerovat MD a JSON
node analyze-structure.js

# Vygenerovat Excel soubor
node generate-excel.js
```

## Příklady použití

### Najít, kde je použito pole `pronajimatel_id`
1. Otevřít `struktura-aplikace.xlsx`
2. Přejít na list "Analýza polí"
3. Vyhledat `pronajimatel_id` - ukáže 8 použití v různých formulářích

### Zjistit, jaké akce má přehled pronajímatelů
1. Otevřít `struktura-aplikace.md`
2. Najít sekci "Pronajímatel (030-pronajimatel)"
3. V přehledu "Přehled" jsou uvedeny akce: add, edit, archive, attach, refresh, history

### Zjistit, jaká pole má formulář pro novou nemovitost
1. Otevřít `struktura-aplikace.xlsx`
2. Přejít na list "Přehled" (modul 040-nemovitost)
3. Najít sekci "Formulář: Nová nemovitost"
4. Tabulka obsahuje všechna pole s jejich typy

## Statistiky

- **Analyzováno modulů:** 5
- **Celkem přehledů (tiles):** 15
- **Celkem formulářů (forms):** 18
- **Unikátních polí:** 48+
- **Řádků dokumentace:** 1204

## Poznámky

- Analýza je automatická a odráží aktuální stav kódu
- Některá pole mohou být použita vícekrát v různých typech subjektů (osoba, firma, atd.)
- Excel soubor používá barevné kódování pro lepší orientaci
- Markdown soubor je vhodný pro verzování a review
