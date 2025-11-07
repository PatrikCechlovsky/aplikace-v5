# Implementace modulu Smlouvy (060) a Služby (070) - Dokumentace

## Přehled implementace

Tento dokument popisuje implementované funkce pro moduly 060 (Smlouvy) a 070 (Služby) podle zadaných požadavků.

## 1. Modul Smlouvy (060)

### 1.1 Číslování smluv

**Soubor:** `src/modules/060-smlouva/tiles/nastaveni.js`

#### Funkce:
- ✅ Samostatný formulář pro nastavení číslování smluv
- ✅ Konfigurovatelný prefix (může obsahovat číslo nemovitosti/jednotky)
- ✅ Konfigurovatelná číselná řada s různými formáty:
  - `PREFIX-ROK-ČÍSLO` (např. SML-2025-0001)
  - `PREFIX-ČÍSLO` (např. SML-0001)
  - `ROK-PREFIX-ČÍSLO` (např. 2025-SML-0001)
  - A další formáty podle potřeby
- ✅ Live náhled vygenerovaného čísla
- ✅ Každý uživatel si může nastavit vlastní formát

#### Použití:
1. V menu Smlouvy vyberte "Nastavení"
2. Nastavte prefix (např. "NEM01" pro nemovitost 1)
3. Vyberte formát čísla
4. Nastavte číselnou řadu (start, krok, počet cifer)
5. Uložte nastavení

#### Příklad konfigurace:
```
Prefix: NEM01-JEDN05
Formát: {PREFIX}-{YEAR}-{NUMBER}
Padding: 4
Výsledek: NEM01-JEDN05-2025-0001
```

### 1.2 Časové omezení smlouvy

**Soubor:** `src/modules/060-smlouva/forms/edit.js`

#### Funkce:
- ✅ Pole "Typ ukončení" s možnostmi:
  1. **Na dobu určitou** - vyžaduje datum začátku a konce
  2. **Na dobu neurčitou** - vyžaduje pouze datum začátku, konec se automaticky nastaví na "neurčito"
- ✅ Dynamické zobrazení pole "Datum konce" pouze pro smlouvy na dobu určitou

### 1.3 Formulář smlouvy - výběr stran a jednotky

**Soubor:** `src/modules/060-smlouva/forms/edit.js`

#### Funkce:
- ✅ Výběr jednotky (povinné)
- ✅ Automatické doplnění nemovitosti při výběru jednotky (read-only)
- ✅ Automatické doplnění pronajímatele při výběru jednotky (read-only)
- ✅ Výběr nájemníka (povinné)
- ⚠️ Multi-select nájemníků - připraveno pro budoucí implementaci

#### Logika:
1. Uživatel vybere jednotku
2. Systém automaticky doplní:
   - Nemovitost, ke které jednotka patří
   - Pronajímatele, který vlastní nemovitost
3. Pole nemovitost a pronajímatel jsou read-only a nelze je měnit
4. Uživatel vybere nájemníka

### 1.4 Pole výše nájmu

**Soubor:** `src/modules/060-smlouva/forms/edit.js`

#### Aktuální stav:
- ✅ Pole "Výše nájmu" je editovatelné
- ⏳ Automatické vypočítání ze služeb - připraveno pro implementaci
- 💡 V budoucnu bude pole read-only a automaticky vypočteno ze služeb přiřazených ke smlouvě

### 1.5 Přehled smluv

**Soubor:** `src/modules/060-smlouva/tiles/prehled.js`

#### Funkce:
- ✅ Tabulkový seznam všech smluv
- ✅ Sloupce: Číslo smlouvy, Stav, Nájemník, Jednotka, Nemovitost, Od, Nájem, Archiv
- ✅ Barevné označení stavů smluv
- ✅ Filtr pro zobrazení archivovaných smluv
- ✅ Dvojklik na řádek = přechod na detail
- ✅ Common actions: Přidat, Upravit, Archivovat, Přílohy, Obnovit

### 1.6 Detail smlouvy - záložková struktura

**Soubor:** `src/modules/060-smlouva/forms/detail.js`

#### Funkce:
- ✅ Záložková struktura podle specifikace:
  - **Smlouva** - detail smlouvy
  - **Služby** - tabulka služeb přiřazených ke smlouvě
  - **Platby** - tabulka plateb ke smlouvě
  - **Systém** - systémové informace
- ✅ Každá záložka má tabulku s max 8 řádky (scroll)
- ✅ Klik na řádek = detail pod tabulkou
- ✅ Tlačítko "Otevřit detail" pro přechod do plného modulu

## 2. Modul Služby (070)

### 2.1 Číslování služeb

**Soubor:** `src/modules/070-sluzby/tiles/nastaveni.js`

#### Funkce:
- ✅ Samostatný formulář pro nastavení číslování služeb
- ✅ Konfigurovatelný prefix nebo text (musí být jedinečný)
- ✅ Číselná řada s formáty:
  - `PREFIX-ČÍSLO` (např. SLU-0001)
  - `PREFIXČÍSLO` (např. SLU0001)
  - `PREFIX-ROK-ČÍSLO` (např. SLU-2025-0001)
- ✅ Live náhled vygenerovaného kódu

### 2.2 Formulář služby

**Soubor:** `src/modules/070-sluzby/forms/edit.js`

#### Funkce:
- ✅ **Číslo služby** - automaticky generováno nebo vlastní
- ✅ **Název služby** - povinné
- ✅ **Výpočet služby** s možnostmi:
  - Na m² (podle plochy)
  - Podle měřidla (měřená spotřeba)
  - Na počet osob v nájmu
  - Na byt (pevná sazba)
  - Procento z nájmu
- ✅ **Propojení na měřidlo** - Ano/Ne
- ⏳ **Číslo měřidla** - připraveno pro budoucí propojení s modulem 100
- ✅ **Cena za jednotku** - základní cena
- ⏳ **Cena celkem (záloha)** - bude vypočtena: výpočet × cena za jednotku

#### Pole:
- Kód služby
- Název služby
- Popis
- Kategorie (energie, voda, internet, správné poplatky, jiná)
- Typ účtování
- Jednotka (Kč/měsíc, Kč/m³, Kč/kWh, atd.)
- Cena za jednotku
- Sazba DPH
- Propojení na měřidlo
- Aktivní
- Poznámky

### 2.3 Přehled služeb - katalog

**Soubor:** `src/modules/070-sluzby/tiles/prehled.js`

#### Funkce:
- ✅ Seznam všech definic služeb (katalog)
- ✅ Sloupce: Kód, Název, Kategorie, Typ účtování, Cena, Jednotka, Aktivní
- ✅ Barevné označení kategorií
- ✅ Filtr pro zobrazení neaktivních služeb
- ✅ Možnost editace služeb
- ✅ Common actions: Přidat, Upravit, Obnovit

### 2.4 Detail služby

**Soubor:** `src/modules/070-sluzby/forms/detail.js`

#### Funkce:
- ✅ Záložková struktura:
  - **Služba** - detail definice služby
  - **Použití** - seznam smluv, které službu používají
  - **Systém** - systémové informace
- ✅ Tabulka použití s odkazy na smlouvy

## 3. Databázová struktura

### 3.1 Tabulka `numbering_config`

**Soubor:** `docs/tasks/supabase-migrations/009_create_subject_types_and_numbering.sql`

Konfigurace číslování pro různé entity:

```sql
- module:030 | subject   | PRON | Pronajímatelé
- module:050 | subject   | NAJ  | Nájemníci
- module:040 | property  | NEM  | Nemovitosti
- module:060 | contract  | SML  | Smlouvy
- module:070 | service   | SLU  | Služby
```

### 3.2 Funkce `generate_next_id()`

Generuje další číslo v řadě podle konfigurace:

```sql
SELECT generate_next_id('module:060', 'contract');
-- Returns: SML-2025-0001
```

### 3.3 Tabulka `contracts`

**Soubor:** `docs/tasks/supabase-migrations/004_create_contracts_table.sql`

Klíčové sloupce:
- `cislo_smlouvy` - Číslo smlouvy (unique)
- `typ_ukonceni` - fixed_term | indefinite
- `datum_zacatek` - Datum začátku
- `datum_konec` - Datum konce (NULL pro neurčito)
- `najem_vyse` - Výše nájmu
- `landlord_id`, `tenant_id`, `unit_id`, `property_id` - Vazby

### 3.4 Tabulka `service_definitions`

**Soubor:** `docs/tasks/supabase-migrations/005_create_services_tables.sql`

Klíčové sloupce:
- `kod` - Kód služby (unique)
- `nazev` - Název služby
- `typ_uctovani` - Typ účtování
- `jednotka` - Jednotka (Kč/m², Kč/kWh, atd.)
- `zakladni_cena` - Základní cena
- `kategorie` - Kategorie služby

### 3.5 Tabulka `contract_service_lines`

Propojení služeb se smlouvami:
- `contract_id` - Vazba na smlouvu
- `service_definition_id` - Vazba na definici služby
- `cena_za_jednotku` - Cena za jednotku (z definice nebo vlastní)
- `zaklad_pro_vypocet` - Základ (m², počet osob, atd.)
- `plati` - Kdo platí (najemnik, pronajimatel, sdilene)

## 4. Workflow - vytvoření smlouvy

### Krok 1: Nastavení číslování
1. Menu Smlouvy → Nastavení
2. Nastavit prefix a formát čísla
3. Uložit

### Krok 2: Vytvoření smlouvy
1. Menu Smlouvy → Přehled → Přidat
2. Vybrat jednotku (automaticky se doplní nemovitost a pronajímatel)
3. Vybrat nájemníka
4. Nastavit typ ukončení (určitá/neurčitá doba)
5. Zadat datum začátku (a konce pro dobu určitou)
6. Zadat výše nájmu
7. Uložit - číslo smlouvy se vygeneruje automaticky

### Krok 3: Přidání služeb (budoucí implementace)
1. V detailu smlouvy přejít na záložku Služby
2. Přidat služby z katalogu
3. Nastavit ceny a parametry
4. Výše nájmu se automaticky vypočte

## 5. Zbývající úkoly

### 5.1 Multi-select nájemníků
- [ ] Implementovat výběr více nájemníků
- [ ] Kontrola, že všichni nájemníci mají stejnou jednotku
- [ ] Aktualizace DB schématu (pokud potřeba)

### 5.2 Automatický výpočet výše nájmu
- [ ] Implementovat výpočet výše nájmu ze služeb
- [ ] Pole najem_vyse nastavit jako read-only
- [ ] Aktualizovat při změně služeb

### 5.3 Propojení na měřidla
- [ ] Čeká na implementaci modulu 100 (Měřidla)
- [ ] Propojit služby s měřidly
- [ ] Umožnit zadání stavu měřidla

### 5.4 Katalog vs. instance služby
- [ ] Katalog služeb (service_definitions) - již implementováno
- [ ] Instance služby ke smlouvě (contract_service_lines) - připraveno
- [ ] UI pro přidání služby ze katalogu ke smlouvě
- [ ] Nastavení ceny a parametrů instance služby

## 6. Poznámky k implementaci

### Dodržené standardy:
- ✅ Breadcrumbs v každém view
- ✅ CommonActions v `#commonactions` kontejneru
- ✅ Historie změn připravena (tlačítko implementováno)
- ✅ Filtrace + checkbox "Zobrazit archivované"
- ✅ Readonly pole v formulářích
- ✅ Výběr řádku a dvojklik v tabulkách
- ✅ Záložková struktura podle specifikace
- ✅ Tabulka s max 8 řádky na scroll
- ✅ Detail pod tabulkou při kliknutí na řádek

### Použité komponenty:
- `renderTable` - tabulky se seznamy
- `renderForm` - formuláře
- `renderTabs` - záložková struktura
- `createTableWithDetail` - tabulka s detailem (master-detail pattern)
- `renderCommonActions` - akční lišta
- `setBreadcrumb` - breadcrumbs

## 7. Testování

### Manuální testy:
1. ✅ Nastavení číslování smluv
2. ✅ Nastavení číslování služeb
3. ✅ Vytvoření smlouvy na dobu určitou
4. ✅ Vytvoření smlouvy na dobu neurčitou
5. ✅ Auto-fill nemovitosti a pronajímatele
6. ✅ Zobrazení detailu smlouvy se záložkami
7. ✅ Vytvoření služby v katalogu
8. ✅ Zobrazení detailu služby
9. ⏳ Přidání služby ke smlouvě (čeká na UI implementaci)
10. ⏳ Výpočet výše nájmu ze služeb (čeká na implementaci)

## 8. Soubory změněné/vytvořené

### Smlouvy (060):
- `src/modules/060-smlouva/tiles/prehled.js` - ✏️ upraveno
- `src/modules/060-smlouva/tiles/nastaveni.js` - ✨ nový
- `src/modules/060-smlouva/forms/edit.js` - ✏️ upraveno
- `src/modules/060-smlouva/forms/detail.js` - ✅ již existoval s tabs
- `src/modules/060-smlouva/module.config.js` - ✏️ upraveno

### Služby (070):
- `src/modules/070-sluzby/tiles/prehled.js` - ✏️ upraveno
- `src/modules/070-sluzby/tiles/nastaveni.js` - ✨ nový
- `src/modules/070-sluzby/forms/edit.js` - ✏️ upraveno
- `src/modules/070-sluzby/forms/detail.js` - ✅ již existoval s tabs
- `src/modules/070-sluzby/module.config.js` - ✏️ upraveno

### Databáze:
- `docs/tasks/supabase-migrations/009_create_subject_types_and_numbering.sql` - ✏️ upraveno

## 9. Kontakt a podpora

Pro dotazy k implementaci kontaktujte vývojový tým.

---
**Verze dokumentace:** 1.0  
**Datum:** 2025-11-07  
**Autor:** GitHub Copilot Agent
