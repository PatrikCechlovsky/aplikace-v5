# Struktura modulů – ouška, seznamy a formuláře

Tento soubor popisuje jednotnou strukturu oušek (záložek), seznamů a detailových
formulářů pro základní entity aplikace **Pronajímatel**.

Platí jedno hlavní pravidlo:

> **Všude jsou vždy stejná ouška:**  
> Pronajímatel • Nemovitost • Jednotka • Nájemníci • Smlouvy • Platby • Dokumenty  
> (liší se jen to, která záložka je aktivní a jaký seznam/formulář se do ní načte).

## 1. Entity a jejich moduly

| Kód | Entita       | Modul kód        | Poznámka                         |
|-----|--------------|------------------|----------------------------------|
| LORD| Pronajímatel | 020-pronajimatel | Vlastníci / správci              |
| PROP| Nemovitost   | 030-nemovitost   | Budovy / objekty                 |
| UNIT| Jednotka     | 040-jednotka     | Byt / nebytová jednotka          |
| TEN | Nájemník     | 050-najemnik     | Osoba / firma                    |
| AGR | Smlouva      | 060-smlouva      | Nájemní smlouvy                  |
| PAY | Platba       | 070-platba       | Příchozí / odchozí platby        |
| DOC | Dokument     | 080-dokument     | Soubory a přílohy k entitám      |

Tyto kódy se používají **konzistentně** v Excelu, v UI i v API.

---

## 2. Jednotná sada oušek

### 2.1 Pořadí a popis oušek

Globální pořadí oušek je pro všechny entity stejné:

1. Pronajímatel
2. Nemovitost
3. Jednotka
4. Nájemníci
5. Smlouvy
6. Platby
7. Dokumenty

V detailu každé entity se tedy vykreslí **stejný seznam záložek**, jen:

- u **aktuální entity** je ouško typu `detail` (formulář),
- u ostatních entit je ouško typu `relation-list` (seznam navázaných záznamů).

### 2.2 Konvence kódů oušek

`tab-<zdroj_entity>-<cílová_entity>` – například:

- `tab-lord-lord` – detail pronajímatele
- `tab-lord-prop` – nemovitosti daného pronajímatele
- `tab-prop-unit` – jednotky v nemovitosti
- `tab-unit-agr`  – smlouvy k jednotce
- `tab-agr-pay`   – platby ke smlouvě
- `tab-any-doc`   – dokumenty k jakékoli entitě (obecně)

V Excelu v listu **`1_Ouska`** je pro každou kombinaci:

- `SourceEntityCode` – kde se ouško zobrazuje (aktuální detail)
- `TabOrder` – pořadí ouška (1–7)
- `TabCode` – technický kód ouška
- `TabLabel` – text na oušku
- `TabType` – `detail` / `relation-list`
- `TargetEntityCode` – jaká entita se v oušku zobrazuje
- `DefaultListCode` – výchozí seznam pro relation-list
- `DefaultFormCode` – výchozí formulář pro detail
- `Description` – stručný popis chování

> Implementačně stačí v UI podle `TabType` rozhodnout,
> zda se má načíst **formulář** (detail) nebo **seznam** (table).

---

## 3. Seznamy (list views)

Každá entita má minimálně jeden **hlavní seznam**:

- kód: `list-<entity>-all`  
  - `list-lord-all`, `list-prop-all`, `list-unit-all`, …

Tyto seznamy se používají:

- v přehledech modulů,
- jako výchozí v ouškách, kde není potřeba speciální filtrování.

### 3.1 Filtrované seznamy

Navíc jsou definované typické **filtrované seznamy** pro vazby:

- `list-prop-by-lord` – nemovitosti podle pronajímatele
- `list-unit-by-prop` – jednotky v nemovitosti
- `list-agr-by-unit` – smlouvy k jednotce
- `list-pay-by-agr` – platby ke smlouvě
- `list-doc-by-any` – dokumenty navázané na libovolnou entitu

V Excelu v listu **`2_Seznamy`** jsou sloupce:

- `ListCode` – technický kód seznamu
- `EntityCode` – entita, která se zobrazuje
- `Module` – modul aplikace
- `ListName` – popisný název seznamu
- `UsedInTabs` – kde se používá (např. `tab-LORD-PROP`)
- `FilterByColumn` – logika filtru (pseudo SQL / JSON)
- `DefaultSort` – výchozí řazení
- `ColumnsSummary` – krátký popis sloupců

Tento list slouží jako **zadání pro implementaci seznamových dotazů** v DB / API.

---

## 4. Detailové formuláře

Každá entita má jeden hlavní detailový formulář:

- kód: `form-<entity>-detail`  
  - `form-lord-detail`, `form-prop-detail`, `form-unit-detail`, …

V Excelu v listu **`3_Formulare`** jsou sloupce:

- `FormCode` – technický kód formuláře
- `EntityCode` – entita formuláře
- `Module` – modul aplikace
- `FormName` – název formuláře
- `Mode` – režimy (create / edit / view)
- `PrimaryKey` – primární klíč (typicky `id`)
- `HasHeaderSection` – zda je horní hlavička (název, stav, akce)
- `HasSidebar` – zda je pravý/levý panel (např. meta, log, štítky)
- `Description` – stručný popis formuláře

Detailní rozpis polí formulářů (skupiny, layout) můžeme doplnit
v samostatném Excelu / MD pro každou entitu.

---

## 5. Jak to použít v aplikaci

1. **Routing / moduly** používají `Module` a `EntityCode`.
2. **UI konfigurace** čte z Excelu (případně z tabulek v DB) definici oušek,
   seznamů a formulářů.
3. **Komponenta detailu**:
   - vykreslí jednotnou sadu oušek (1–7),
   - podle `TabType` rozhodne, zda načíst **form** nebo **list**,
   - použije `DefaultListCode` / `DefaultFormCode` jako konfiguraci.
4. **Backend / API** implementuje seznamy podle definic v `2_Seznamy`
   a endpointy pro CRUD operace nad jednotlivými entitami.

Tento soubor slouží jako **hlavní přehled**, Excel pak jako
**technické zadání** pro implementaci.

---

## 6. Další kroky

Až budeš spokojený s oušky, seznamy a formuláři (1+2), můžeme navázat:

3. **Návrh tabulek** `wizard_drafts` a `wizard_steps`  
4. **Návrh API endpoints** pro průvodce (wizard)

Tyto části postavíme tak, aby přímo využívaly stejné kódy entit,
seznamů a formulářů, které jsou definované v tomto dokumentu a v Excelu.
