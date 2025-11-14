# Specifikace aplikace „Pronajímatel“

Tento dokument je hlavní zadání pro agenta / vývojáře.  
Slouží **společně** se souborem Excel:

- `struktura-aplikace.xlsx` (nejnovější verze, listy: Moduly, Subjekt, Nemovitosti, Jednotky, …)

Excel obsahuje **seznam všech polí, typy, názvy formulářů a přehledů**.  
Tento Markdown popisuje:

- architekturu UI
- vazby mezi entitami
- chování modulů
- doplňuje návrh nových modulů: Platby, Finance, Energie, Dokumenty, Komunikace

---

## 1. Přehled modulů

Seznam modulů (stejně jako v Excelu):

- `010` – Uživatelé  
- `020` – Můj účet  
- `030` – Pronajímatel  
- `040` – Nemovitosti  
- `050` – Nájemník  
- `060` – Smlouvy  
- `070` – Služby  
- `080` – Platby  **(nový detailní návrh)**  
- `090` – Finance  **(dashboard / přehledy)**  
- `100` – Energie (měřidla, odečty) **(nový detailní návrh)**  
- `110` – Údržba  
- `120` – Dokumenty  **(nový detailní návrh)**  
- `130` – Komunikace  **(nový detailní návrh)**  
- `900` – Nastavení  
- `990` – Help

### 1.1 Základní vazby mezi entitami

Logika je vždy stejná – chceme, aby šlo **přejít tam i zpět**:

- **Pronajímatel (030)**  
  - má 1-N **Nemovitostí (040)**  
- **Nemovitost (040)**  
  - má 1-N **Jednotek**  
- **Jednotka (040 / detail „Jednotky“)**
  - má 1-N **Smluv (060)** (časově omezené)  
- **Smlouva (060)**
  - má 1 **Pronajímatele (030)**  
  - má 1 **Jednotku (040 – konkrétní jednotka)**  
  - má 1 **hlavního Nájemníka (050)** + 0-N spolubydlících  
  - má 0-N **Plateb (080)**  
- **Platba (080)**
  - může být navázána na:
    - smlouvu (`contract_id`)  
    - jednotku (`unit_id`)  
    - nemovitost (`property_id`)  
- **Energie (100)**  
  - měřidla jsou navázaná na `property` nebo `unit`, odečty generují náklady / rozúčtování  
- **Dokumenty (120)** a **Komunikace (130)**  
  - vždy mají kontext `entity_type + entity_id` (subject/property/unit/contract/payment atd.)

Primární „osou“ je tedy: **Pronajímatel → Nemovitost → Jednotka → Smlouva → Platby / Energie / Dokumenty / Komunikace.**

---

## 2. Excel `struktura-aplikace.xlsx` – jak ho agent používá

Excel je **konfigurační soubor**. Platí:

- **Každý list = jedna oblast nebo modul.**
- Typický list má sloupce (může se mírně lišit dle listu):
  - `Název pole` – text v češtině pro label ve formuláři
  - `Kód pole` – interní identifikátor/column name (anglicky, snake_case)
  - `Typ pole` – typ UI/DB (text, číslo, select, datum, boolean…)
  - `Formulář` – ve kterých formulářích se pole zobrazuje (`edit`, `detail`, `list` atd.)
  - případně `Poznámka` / další sloupce (např. validace, vazby, poznámky)

### 2.1 Důležité listy

- **`Subjekt`**  
  - definice společného subjektu (osoba/firma) – používají moduly 010, 020, 030, 050, 110  
  - podle sloupce `Formulář` se generuje:
    - **form_subject_edit** – editační formulář subjektu  
    - **form_subject_detail** – detail (read-only) subjektu  

- **`Bankovní účty`**  
  - společný formulář pro bankovní účty subjektu (uživatel, pronajímatel, firma…)  
  - z něj vzniká **form_bankaccount_detail** a seznam účtů pro moduly 020, 030, 090 atd.

- **`Nemovitosti` / `Nájemník` / `Smlouvy` / `Platby` / `Energie` / `Dokumenty` / `Komunikace`**  
  - postupně budou doplněny poli, která rozšiřují tabulky definované v tomto dokumentu  
  - agent MUSÍ brát **Excel jako hlavní zdroj názvů polí, typů a toho, kde se pole zobrazí v UI**

- **`Detail entity`**  
  - popisuje **panel „Detail entity“** – ouška *Pronajímatel, Nemovitost, Jednotky, Nájemníci, Smlouvy, Platby, Finance…*  
  - pro každé ouško je definováno:
    - jaký přehled se zobrazí (view)  
    - jaké sloupce má přehled  
    - jaký detail-form se má otevřít pod seznamem

Agent: při implementaci vždy **nejdřív načti Excel**, podle listu zjisti seznam polí a formulářů; tento Markdown říká, **jak to celé poskládat dohromady**.

---

## 3. Společný „Subjekt“ a znovupoužití ve více modulech

Subjekt je společný model pro:

- Pronajímatele (030)  
- Nájemníky (050)  
- Udržbu / servisní firmy (110)  
- Uživatelé / Můj účet (010/020 – napojení na auth)

Logika:

- DB tabulka např. `subjects`  
- definice polí je v listu **`Subjekt`** v Excelu
- pro každého typu (pronajímatel, nájemník, údržba, atd.) se používá **stejný formulář**, jen:
  - `subject_type` určuje typ (landlord / tenant / maintenance / user / …)
  - `role` / `permissions` určují oprávnění (z listu Typ uživatele)

### 3.1 Formuláře

- **`form_subject_edit`**  
  - používá všechna pole, která mají ve sloupci `Formulář` hodnotu `edit` nebo `edit,detail`  
- **`form_subject_detail`**  
  - používá pole s hodnotou `detail` nebo `edit,detail` (read-only)

Tyto formuláře se používají:

- v modulu 030 – karta „Pronajímatel“ v detailu entity  
- v modulu 050 – karta „Nájemník“  
- v modulu 110 – karta „Dodavatel/Údržba“  
- v modulu 020 – karta „Můj profil“ (jen omezená podmnožina polí + napojení na auth)

---

## 4. Pattern „Detail entity“ (ouška, seznam + detail)

V každém „detailovém“ zobrazení (např. detail jednotky) se používá **stejný UI pattern**:

1. **Breadcrumb** – ukazuje cestu:  
   `Domů › Nemovitosti › Bytový dům Alfa › Detail jednotky`
2. Pod breadcrumbem je **řada oušek (tabs)**:
   - Pronajímatel  
   - Nemovitost  
   - Jednotky  
   - Nájemníci  
   - Smlouvy  
   - Platby  
   - Finance  
   - (další dle modulu – Energie, Dokumenty, Komunikace)
3. Pod aktivním ouškem jsou **dvě horizontálně rozdělené části**:
   - **horní část = Seznam** (tabulka, max cca 10 řádků s posuvníkem)
   - **dolní část = Detail první/označené položky**  
     - používá konkrétní formulář (např. `form_contract_detail`)

Specifikace seznamu + detailu pro jednotlivá ouška je rozpracovaná v listu **`Detail entity`** v Excelu  
– tam jsou i sloupce, které se mají v tabulce zobrazit.

---

## 5. Modul 080 – Platby

### 5.1 Cíl

Jednotné místo pro **všechny platby** (příchozí i odchozí), napojené na:

- Smlouvu  
- Jednotku  
- Nemovitost  
- Subjekt (plátce/příjemce)

Aby šlo:

- ručně označit platbu jako zaplacenou / částečně zaplacenou  
- filtrovat dle stavu (zaplacené, nezaplacené, po splatnosti)  
- zobrazovat kontext (k jaké smlouvě/jednotce/nemovitosti patří)

### 5.2 Tabulka `payments` (základ)

Pole jsou detailně rozepsaná v Excelu **list `Platby`** a v souboru `moduly_080_090_100_120_130.xlsx`.  
Logika:

- `direction` – příchozí (`incoming`) / odchozí (`outgoing`)  
- `contract_id`, `unit_id`, `property_id` – vazba na smlouvu / jednotku / nemovitost  
- `payer_id`, `payee_id` – kdo platí / komu  
- `issue_date`, `due_date`, `paid_date`  
- `amount`, `currency`, `paid_amount`  
- `status` – `issued | partial | paid | overdue | canceled`  
- `method`, `variable_symbol`, `specific_symbol`, `invoice_no`  
- `note`, případně `attachment_id` (napojení na `documents`)

### 5.3 Přehledy (listy)

Záložky v modulu 080:

- **Platby** – vše  
- **Příchozí** – filtr `direction = incoming`  
- **Odchozí** – filtr `direction = outgoing`

Sloupce přehledu (minimálně):

- Směr (ikonka šipka nahoru/dolů)  
- Datum vystavení  
- Splatnost (barva podle `overdue`)  
- Částka  
- Stav  
- Nemovitost  
- Jednotka  
- Smlouva  
- Plátce  
- (volitelně) Zaplaceno / Zbývá zaplatit

### 5.4 Formulář detail platby

Sekce:

1. **Základní údaje**  
   - směr, částka, měna, způsob platby, VS/SS, datum vystavení a splatnost
2. **Kontext**  
   - smlouva, jednotka, nemovitost, plátce, příjemce
3. **Stav**  
   - stav, zaplacená částka, datum úhrady  
   - tlačítko/checkbox **„Označit jako zaplaceno“** → nastaví `status='paid'`, `paid_amount=amount`, `paid_date=now()`
4. **Dokumenty & komunikace**  
   - přiložené dokumenty (faktura)  
   - přehled komunikace k této platbě (modul 130, filtr `context_type='payment'`)

---

## 6. Modul 090 – Finance (dashboard)

### 6.1 Cíl

Modul pro **přehled peněz**:

- srovnání příjmů vs nákladů  
- cashflow v čase  
- dlužníci  
- obsazenost jednotek

Využívá **datové pohledy (views)** nad tabulkou `payments` a případnými nákladovými tabulkami.

### 6.2 Widgety (list `090_Finance_Widgets`)

Příklady widgetů:

- `rent_vs_costs` – *Nájem vs Náklady* (sloupcový graf po měsících)  
- `cashflow_month` – *Měsíční cashflow* (čára příjmy – výdaje)  
- `arrears` – tabulka *Dlužníci*  
- `occupancy` – KPI *Obsazenost jednotek*

Každý widget má:

- `data_query` – název view + parametry (`scope=:context`)  
- `vis_type` – typ grafu (`bar`, `line`, `table`, `kpi`)

### 6.3 Záložky modulu 090

- **Finance** – přehled bankovních účtů subjektu (používá formulář z listu `Bankovní účty`)  
- **Přehledy** – dashboard widgetů

Filtry pro dashboard:

- období (od–do, měsíc, rok), nemovitost, jednotka, smlouva, subjekt  
- typ pohledu (pouze incoming, incoming vs outgoing)

---

## 7. Modul 100 – Energie (měřidla, odečty, rozúčtování)

### 7.1 Cíl

- evidence měřidel (voda, elektřina, plyn, teplo…)  
- hromadné zadávání odečtů  
- výpočet spotřeby a podklad pro rozúčtování na jednotky / nájemníky

### 7.2 Tabulka `energy_meters`

Pole (viz list `Energie` a `100_Meridla_Fields`):

- `id`  
- `scope_type`: `property | unit | common`  
- `scope_id`: vazba na nemovitost nebo jednotku  
- `commodity`: `electricity | gas | water | heat | other`  
- `unit_of_measure`: `kWh`, `m3`, `GJ`…  
- `multiplier` – koeficient  
- `code`, `name`, `active`, `install_date`, `remove_date`, `location_note`…

### 7.3 Tabulka `meter_readings`

- `meter_id`, `reading_date`, `reading_value`  
- `reading_type`: `actual | estimated | corrected`  
- `note`, `created_at`…

Potřebujeme **unikátní kombinaci `(meter_id, reading_date)`**.

### 7.4 Záložky modulu 100

- **Měřidla** – seznam, možnost přidat / editovat měřidlo  
- **Odečty** – odečty vybraného měřidla + hromadné zadání odečtů  
- **Rozúčtování** – budoucí modul pro definici **allocation plánů** (rozpočítání spotřeby)

### 7.5 Výpočet spotřeby

- Spotřeba za období = (stav_konec – stav_začátek) × `multiplier`  
- nad tím se dělá rozúčtování (per m², per osoba, fixní podíly…)

Výsledek rozúčtování může vytvářet:

- nákladové položky (outgoing platby)  
- nebo předpisy pro nájemníky (incoming platby)

---

## 8. Modul 120 – Dokumenty

### 8.1 Cíl

- centrální úložiště dokumentů (smlouvy, faktury, přílohy)  
- správa **šablon** smluv a dopisů  
- možnost generovat dokument na základě dat z aplikace

### 8.2 Tabulka `documents`

Pole (viz list `Dokumenty` + `120_Doc_Fields`):

- `entity_type`, `entity_id` – kontext (subject/property/unit/contract/payment…)  
- `doc_type` – smlouva, faktura, příloha…  
- `title` – název dokumentu  
- `file_url`, `mime`  
- `template_id` – pokud vzniklo ze šablony  
- `status` – `draft | final | archived`  
- `tags` – štítky

### 8.3 Tabulka `doc_templates`

Pole (viz `120_Templates_Fields`):

- `code` – unikátní  
- `name` – název  
- `entity_type` – primární entita šablony  
- `content_format` – `md | html | docx`  
- `content` – samotný text s merge tagy  

**Merge tagy**: např.  
`{{tenant.name}}`, `{{property.address}}`, `{{contract.valid_from}}`, `{{payment.amount}}`, `{{meter.consumption}}`

### 8.4 Záložky modulu 120

- **Dokumenty** – přehled dokumentů k aktuálnímu kontextu  
- **Šablony** – správa šablon (náhled, test merge, archivace)

---

## 9. Modul 130 – Komunikace

### 9.1 Cíl

- mít na jednom místě **všechnu komunikaci**:
  - e-maily, SMS, interní poznámky, systémové zprávy  
- vše navázané na konkrétní entitu (nemovitost, jednotka, smlouva, nájemník, platba…)

### 9.2 Tabulka `messages`

- `channel`: `email | sms | note | system`  
- `direction`: `outgoing | incoming`  
- `from_address`, `to_addresses`, `subject`  
- `body_html`, `body_text`, `attachments`  
- `status`: `draft | queued | sent | failed | received`  
- `context_type`, `context_id` – kontext (subject, property, unit, contract, payment…)  
- `template_id` – použitá šablona  
- `created_by`, `sent_at`…

### 9.3 Tabulka `comm_templates`

- `code`, `name`, `channel`  
- `content_format` (`md/html/text`)  
- `content` – text s merge tagy  
- `subject_template` pro emaily, atd.

### 9.4 Záložky modulu 130

- **Komunikace** – časová osa zpráv  
- **Šablony** – správa komunikačních šablon  
- **Automatizace** – pravidla pro automatické odesílání

Příklady automatizací:

- když platba přejde do `overdue` → odeslat upomínku X dní po splatnosti  
- když se blíží konec smlouvy → poslat upozornění pronajímateli a nájemníkovi  
- po vytvoření dokumentu „smlouva“ → poslat e-mail s přílohou

---

## 10. RLS a bezpečnost (obecně)

Základní princip:

- uživatel vidí jen záznamy, které souvisí s **jeho subjekty** (kde je pronajímatel, nájemník, člen týmu…)  
- admin vidí vše

Příklad myšlenky policy:

- `payments`:  
  - povolit, pokud `contract/property/unit` patří subjektu, ke kterému má uživatel přístup  
- `documents` a `messages`:  
  - povolit, pokud `entity_type + entity_id` odkazuje na entitu, kterou uživatel smí vidět  

Detailní definice pravidel je zapsaná v listu **`RLS_Notes`** v pomocném Excelu `moduly_080_090_100_120_130.xlsx`.

---

## 11. Jak s tím pracovat (pro agenta)

1. **Otevři Excel `struktura-aplikace.xlsx`.**  
   - Každý list s poli (`Subjekt`, `Nemovitosti`, `Nájemník`, atd.) převeď na:
     - DB schéma (název tabulky / pohledu)  
     - definici formulářů podle sloupce `Formulář`  
2. **Použij tento Markdown jako architekturu a popis chování.**
   - Sidebar, breadcrumb, detailové ouška a seznam+detail jsou povinný pattern.  
3. **Nové moduly (080, 090, 100, 120, 130)** implementuj podle kapitol výše.  
   - Políčka můžeš doplnit i do Excelu (nové listy / rozšíření existujících).  
4. **Vazby**:
   - zajisti, aby z detailu **jakékoliv entity** šlo v ouškách vidět všechny související entity  
   - view `view_contract_context_row` (Souvislosti smlouvy) musí vracet 1 řádek:  
     `Pronajímatel | Nemovitost | Jednotka | Hlavní nájemník`  
5. **Neměň názvy kódů polí** z Excelu – jsou zdrojem pravdy pro DB i UI.

Cíl: po implementaci podle tohoto dokumentu + Excelu má vzniknout konzistentní aplikace,  
kde jsou všechny moduly propojené a rozšiřitelné (přidáním řádku do Excelu + případného view).
