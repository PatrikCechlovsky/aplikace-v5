# Moduly 030–080 — Návrh entit, pole a postup pro implementaci (česky)

Ano — je to možné. Níže najdeš kompletní přepis polí a návrh entit v češtině, doplněné o chybějící moduly 030 (pronajímatel), 040 (nemovitost + jednotka) a 050 (nájemník). Připravil jsem také podrobný návod pro Copilot-agenta — co vytvořit krok po kroku (DB, API, UI, integrace, testy), validační pravidla, události/triggery a ukázkové JSONy. Rozdělení bude podle požadovaných modulů: 030, 040, 050, 060 (smlouvy), 070 (služby) a 080 (platby).

---

## Obecné zásady (globálně)

- Každá entita má id: UUID.  
- Peněžní hodnoty ukládej jako integer v nejmenší měně (Kč → haléře) nebo decimal(12,2) podle DB a konzistence.  
- Audit: created_by, created_at, updated_by, updated_at.  
- Datum/čas: ukládej UTC timestamps; pro datum bez času používej DATE.  
- Reference a FK: normalizované vztahy (kontrakty → pronajímatel/nájemník/jednotka).  
- Verzování šablon dokumentů + záznamy generování.  
- Enum hodnoty v češtině (interně můžeš mapovat na anglické klíče).

---

## 030 – Pronajímatel (landlord / owner)

Pole (název | typ | poznámka)

- id: uuid  
- obchodní_jméno / jméno: string  
- typ_subjektu: enum { fyzická_osoba, právnická_osoba }  
- ic: string (IČ, nullable)  
- dic: string (DIČ, nullable)  
- email: string  
- telefon: string  
- adresa_sídla: object { ulice, město, psč, stát }  
- kontaktní_osoba: { jméno, email, telefon } (pokud právnická osoba)  
- bankovní_účty: list { banka, iban, bic, poznámka }  
- preferovaný_způsob_komunikace: enum { email, telefon, pošta }  
- podpisové_práva: list (uživatelé / identity, které mohou podepisovat)  
- poznámky: text  
- created_by, created_at, updated_by, updated_at

Validace/poznámky:
- Pokud typ_subjektu = právnická_osoba => IC povinné.  
- Povinné kontaktní údaje (email nebo telefon).

Ukázka JSON:
{ "id":"uuid-landlord-1", "jmeno":"Jan Novák", "typ_subjektu":"fyzická_osoba", "email":"jan@example.cz", "telefon":"+420601000000", "bankovni_učty":[{"banka":"ČSOB","iban":"CZ...","poznámka":"kauce"}] }

---

## 040 – Nemovitost a Jednotka (property & unit)

A) Nemovitost (property)
- id: uuid  
- název: string (např. "Dům Na Poříčí 10")  
- adresa: { ulice, číslo, město, psč, stát }  
- popis: text  
- typ: enum { bytový_dům, komerční, administrativní, družstevní }  
- vlastník_id: uuid (odkaz na pronajímatele)  
- katastrální_výpis_id / parcelní_cislo: string (nullable)  
- soubory: list (fotky, plány)  
- jednotky_count: integer (computed)  
- created_by, created_at, updated_by, updated_at

B) Jednotka (unit / apartment / lease_unit)
- id: uuid  
- property_id: uuid  
- označení: string (např. "byt 3+1, 2. patro, č. 5")  
- podlaží: integer  
- číslo_jednotky: string  
- velikost_m2: decimal  
- počet_pokojů: integer  
- stav: enum { volná, pronajatá, v_rekonstrukci, rezervovaná }  
- popis: text  
- technické_parametry: json (voda, plyn, počty elektroměrů)  
- vybavení: list (např. lednička, pračka)  
- fotografie: list(url)  
- momentální_smlouva_id: uuid (nullable) — reference na aktivní smlouvu  
- created_by, created_at, updated_by, updated_at

Validace:
- property_id musí existovat.  
- unikátní kombinace property_id + číslo_jednotky.

Ukázka JSON jednotky:
{ "id":"unit-1", "property_id":"prop-1", "oznaceni":"Byt 3+1 č.5", "velikost_m2":78.5, "stav":"volná" }

---

## 050 – Nájemník (tenant)

- id: uuid  
- jméno / obchodní_jméno: string  
- typ: enum { fyzická_osoba, právnická_osoba }  
- rodné_cislo / datum_narození: string/date (pokud potřeba)  
- ic / dic: string (pro právnické osoby)  
- email: string  
- telefon: string  
- trvalé_bydliště_adresa: object  
- doručovací_adresa: object (nullable)  
- kontaktní_osoba: { jméno, email, telefon } (u firem)  
- platební_info: { preferovaný_způsob, defaultní_iban }  
- průkaz_identita: attachments (volitelné)  
- smlouvy_ids: list[uuid] (historie)  
- created_by, created_at, updated_by, updated_at

Validace:
- email nebo telefon alespoň jedno.  
- pro podpis elektronicky je vhodné mít národní ID/identifikátor.

Ukázka JSON:
{ "id":"tenant-1", "jmeno":"Petr Svoboda", "email":"p.svoboda@example.cz", "telefon":"+420602000000" }

---

## 060 – Modul Smlouvy (contract) — tvorba smlouvy nájmu jednotky

Cíl: umožnit vytvořit nájemní smlouvu mezi pronajímatelem a nájemníkem pro konkrétní jednotku nemovitosti, přidat protokol o předání, kauci, služby a připojit editovatelný dokument šablony.

Entity / pole (Česky)
- id: uuid  
- cislo_smlouvy: string (unikátní lidsky čitelné)  
- nazev: string  
- stav: enum { koncept, cekajici_podepsani, aktivni, ukoncena, zrusena, propadla }  
- datum_zacatek: date  
- datum_konec: date (nullable)  
- typ_ukonceni: enum { fixed_term, indefinite }  
- upominek_ukonceni_dny: integer (počet dnů pro notifikaci)  
- jednotka_id: uuid (odkaz na jednotku 040)  
- nemovitost_id: uuid (možno získat přes jednotka.property_id)  
- pronajimatel_id: uuid (030)  
- najemnik_id: uuid (050)  
- pozice_smlouvy: text / summary  
- najem_vyse: integer (v haléřích)  
- periodicita_najmu: enum { mesicni, tydenni, rocni, jednorazovy }  
- spravne_poplatky (např. režijní_fond): JSON  
- kauce_potreba: boolean  
- kauce_castka: integer  
- stav_kauce: enum { nevyzadovana, drzena, vracena, částečně_vracena }  
- predavaci_protokol_id: uuid  
- sluzby: list(contract_service_line ids)  
- platebni_podminky: text (např. do 5. dne v měsíci)  
- linked_templates: list { template_id, document_id, url, editable }  
- template_fields: json (vyplněné placeholdery)  
- podpisy: { status: enum { nepodepsano, cekani, podepsano }, provider, flow_id, podpisnici: list }  
- notifikace: json  
- sumar_platby: computed { celkem_splatne, celkem_zaplaceno, zustava }  
- audit fields

### Protokol o předání (součást/vazba)
- id: uuid  
- smlouva_id: uuid  
- datum_predani: date  
- predavajici: { jmeno, role }  
- preberajici: { jmeno, role }  
- seznam_polozek: [{ nazev, stav_pri_predani, poznámka, fotografie[] }]  
- stavy_licitace (stavy elektroměrů, vodoměrů)  
- podpisy_predani: landlord, tenant

### Důležitá pravidla / validace
- datum_zacatek < datum_konec pokud datum_konec není null.  
- pokud kauce_potreba = true => kauce_castka > 0.  
- jednotka musí existovat a není v konfliktu s jinou aktivní smlouvou (stav aktivní).  
- při připojení šablony zkontroluj, že všechny required placeholders jsou vyplněné.

### UI pole na formuláři
- nalevo: základní informace (číslo smlouvy, název, stav)  
- hlavní: pronajímatel (vyhledávací), nájemník (vyhledávací), nemovitost/jednotka (průzkumník)  
- nájem: částka, periodicita, první platby, platební podmínky  
- kauce: povinná/částka/způsob držení  
- služby: tlačítko "přidat službu" → otevře modal z modulu 070  
- dokumenty: vyber šablonu a "vygenerovat dokument"  
- podpisy: tlačítko "zahájit podpis (BankID)".

Ukázka JSON smlouvy:
{ "id":"contract-1", "cislo_smlouvy":"SML-2025-001", "stav":"aktivni", "datum_zacatek":"2025-06-01", "datum_konec":"2026-05-31", "jednotka_id":"unit-1", "pronajimatel_id":"landlord-1", "najemnik_id":"tenant-1", "najem_vyse":150000, "kauce_potreba":true, "kauce_castka":450000, "sluzby":["svc-line-1","svc-line-2"] }

---

## 070 – Modul Služby (services) — seznam služeb a jejich rozdělení

Cíl: mít katalog všech možných služeb a možnost vázat je ke smlouvě jako řádky (co platí nájemník a co pronajímatel), umožnit propojení mezi položkami (např. rozdíl, záloha vs. spotřeba) a spočítat výslednou částku zahrnutou do smlouvy.

### A) Katalog služeb (service_definition)
- id: uuid  
- kod: string (unikátní, např. "VODA")  
- nazev: string (Voda)  
- popis: text  
- typ_účtování: enum { pevna_sazba, měřená_spotřeba, na_poct_osob, na_m2, procento_z_nájmu }  
- jednotka: string (Kč, Kč/m2, Kč/osoba atd.)  
- zakladni_cena: integer (default cena)  
- sazba_dph: decimal (např. 0.21)  
- aktivni: boolean  
- kategorie: enum { energie, voda, internet, spravne_poplatky, jiná }  
- poznámky

### B) Položka služby na smlouvě (contract_service_line)
- id: uuid  
- contract_id: uuid  
- service_definition_id: uuid  
- nazev: string (přepis)  
- plati: enum { najemnik, pronajimatel, sdilene }  
- zaklad_pro_vypocet: numeric (počet osob, m2 nebo měřící hodnota)  
- cena_za_jednotku: integer  
- perioda_fakturace: enum { mesicni, ctvrtletni, rocni }  
- metraze_měřidla_id: uuid (pokud měřeno)  
- od_data, do_data: date  
- odhadovane_mesicni_naklady: integer (computed)  
- poznámky

### Možnosti propojení
- Link mezi službami: např. "Voda - záloha" a "Voda - vyúčtování" – contract_service_line může obsahovat reference na jiné line_id pro korekce/refundace.  
- Rozdílové položky: definuj typ_line: enum { zalohova, vypocet, korekce }. Při vyúčtování vytvoř korekční položky.

### Výpočet částky pro smlouvu
- Suma částek všech contract_service_line, kde plati = najemnik, sečtená podle periodicity → přepočítej na měsíční jednotku a přidej do výpočtu celkové výše nájemného (pokud smlouva uvádí "nájem + služby").  
- Možnost nastavit, že určitá služba je zahrnuta v nájmu (included boolean).

### UI / Formulář
- Správa katalogu služeb (CRUD).  
- Při přidání služby do smlouvy: vybrat z katalogu nebo vytvořit custom položku, nastavit kdo platí (nájemník/pronajímatel), cenu a měřítko.

Ukázka JSON service_line:
{ "id":"svc-line-1", "contract_id":"contract-1", "service_definition_id":"svc-def-voda", "nazev":"Voda - záloha", "plati":"najemnik", "zaklad_pro_vypocet":2, "cena_za_jednotku":20000, "perioda_fakturace":"mesicni", "odhadovane_mesicni_naklady":40000 }

Validace:
- Pokud typ_účtování = měřená_spotřeba => musí existovat meter_reference_id nebo způsob napojení na měřič.  
- Plati musí být buď najemnik nebo pronajimatel nebo sdilene.

---

## 080 – Modul Platby (payments)

Cíl: zapisovat příchozí platby (nájem, služby, kauce), alokovat je na položky (nájem + jednotlivé služby), kontrolovat zda proběhla platba určité výše a připravit podklad pro automatické odeslání potvrzení (s možností elektronického podpisu BankID).

### Hlavní Pole (Platba)
- id: uuid  
- contract_id: uuid  
- party_id: uuid (kdo platí – typicky nájemník)  
- amount: integer (v haléřích)  
- currency: string (ISO)  
- payment_date: timestamp (kdy dorazilo / bylo zapsáno)  
- value_date: date (bankovní valuta)  
- payment_type: enum { najem, sluzba, kauce, poplatek, vratka }  
- allocated_to: list { type: enum{najem,service,kauce,fee}, target_id (např. service_line_id), amount }  
- payment_method: enum { bankovni_prevod, direct_debit, kartou, hotove, jinak }  
- payment_reference: string (variabilní symbol / poznámka)  
- bank_transaction_id: string (pokud dostupný)  
- status: enum { cekajici, potvrzeno, uspesne_rekoncirovano, selhalo, vraceno }  
- doklad_potvrzeni_document_id: uuid (vygenerovaný dokument)  
- auto_odeslano_potvrzeni: enum { neodeslano, fronta, odeslano, selhalo }  
- potvrdzeni_odeslano_v: timestamp  
- podpis_info: { provider, signed_at, signer_id, document_id }  
- created_by, created_at, updated_by, updated_at

### Detailní rozpis služeb
- payment_service_items: id, payment_id, service_line_id, amount, period_from, period_to, price_per_unit, units, tax

### Validace a pravidla
- Suma(allocated_to.amount) ≤ amount (popř. automatické rozdělení: nejdřív nájem, pak služby podle alokace).  
- Při příjmu platby spustit processing pipeline:
  1. zkontroluj variabilní symbol / referenci (pokud se používá matching).  
  2. zapiš platbu.  
  3. označ jako potvrzeno.  
  4. vytvoř a vygeneruj potvrzení (šablona).  
  5. pokud povoleno, zahaj podpis (BankID) -> uložit podpis_info.  
  6. odeslat potvrzení emailem / API.  
- Umožni ruční i automatické párování plateb (bank feed/CSV/ISO20022).

### Integrace pro automatické potvrzení + BankID
- Vygeneruj PDF potvrzení z šablony (placeholders: jmeno, castka_text, castka_cislo, datum, cislo_smlouvy, variabilni_symbol, podpis_block).  
- Integrace s e-sign providerem (např. BankID) přes API:
  - Připrav sign_request s document_url, signer_info (email/ID), callback_url pro notifikaci.  
  - Po podpisu: uložit signed_file_url a timestamp.  
- Odesílat potvrdění emailem s přílohou nebo odkazem na podepsaný dokument.

### UI / Formulář
- Import bankovních transakcí (CSV/MT940/ISO20022).  
- Manuální vložení platby.  
- Detail platby: alokace, status, možnost spustit odeslání potvrzení.  
- Reconciliation view: která platba kryje které dlužné položky (najem/ služby).

Ukázkový JSON platby:
{ "id":"pay-1", "contract_id":"contract-1", "party_id":"tenant-1", "amount":150000, "payment_date":"2025-06-01T09:12:00Z", "payment_type":"najem", "payment_method":"bankovni_prevod", "payment_reference":"20250601/001", "status":"potvrzeno", "allocated_to":[{"type":"najem","target_id":null,"amount":150000}], "doklad_potvrzeni_document_id":"receipt-1", "auto_odeslano_potvrzeni":"odeslano", "potvrdzeni_odeslano_v":"2025-06-01T09:15:00Z", "podpis_info":{"provider":"BankID","signed_at":"2025-06-01T09:16:00Z","signer_id":"tenant-1"} }

---

## Vazby mezi moduly a výpočty

- Smlouva (060) má FK na pronajímatele (030), nájemníka (050), a jednotku (040).  
- Služby (070) jsou katalog + řádky navázané na smlouvu → určují, co bude platit nájemník a co pronajímatel.  
- Při vytvoření smlouvy:
  - načíst všechny service_lines pro smlouvu a spočítat celkovou měsíční částku = nájem + součet služeb (které nejsou zahrnuté v nájmu).  
- Platby (080) se párují na dlužné položky vypočtené ze smlouvy (najem + služby). Systém má logiku: alokace plateb podle priority (nájem, služby, kauce).  
- Pokud služba je měřená, po nahrání meter_readings se spustí vyúčtování → vytvoří se korekční položky + požadavky na platbu.

---

## Stavové diagramy a triggery (příklady)

- Smlouva: koncept -> cekajici_podepsani -> aktivni -> ukoncena  
- Kauce: nevyzadovana -> drzena -> vracena  
- Platební tok: cekajici -> potvrzeno -> uspesne_rekoncirovano -> (v pripade refundu) vraceno

Triggery:
- Po vytvoření smlouvy v stave cekajici_podepsani -> vygeneruj šablonu, pošli podpisový request.  
- Po přijetí platby typu najem -> automaticky označit měsíc jako zaplacený a vygenerovat potvrzení + podepsat.  
- Po konci smlouvy -> připomenutí vrácení kauce (pokud kauce držená).

---

## Indexy & DB doporučení (Postgres)

- Index: contracts(cislo_smlouvy), contracts(stav), contracts(pronajimatel_id), contracts(najemnik_id).  
- Index: payments(payment_date), payments(contract_id), payments(payment_reference).  
- Unikátní: property_id + cislo_jednotky.  
- Normalizované FK mezi entitami.

---

## API endpointy (doporučené)

Pronajímatel:
- GET /api/landlords  
- POST /api/landlords  
- GET /api/landlords/{id}  
- PUT /api/landlords/{id}

Nemovitost/Jednotka:
- GET /api/properties  
- POST /api/properties  
- GET /api/properties/{id}  
- POST /api/properties/{id}/units  
- GET /api/units/{id}

Nájemník:
- GET /api/tenants  
- POST /api/tenants

Smlouvy:
- GET /api/contracts  
- POST /api/contracts  (payload s IDs pronaj., najem., jednotky + službami + šablonou)  
- POST /api/contracts/{id}/generate-document (template_id)  
- POST /api/contracts/{id}/start-sign (provider)  
- PATCH /api/contracts/{id}/status

Služby:
- GET /api/service-definitions  
- POST /api/service-definitions  
- POST /api/contracts/{id}/service-lines

Platby:
- GET /api/payments  
- POST /api/payments (import bankovní transakce)  
- POST /api/payments/{id}/allocate  
- POST /api/payments/{id}/send-receipt (volba BankID/podepsat)

---

## Podrobný návod pro Copilot-agenta — krok po kroku (task list)

Záměr: vytvořit backend + DB + API + UI pro moduly 030–080.

1) Návrh DB (migrace)
- Vytvoř SQL migrace / DDL pro tabulky: landlords, properties, units, tenants, contracts, contract_service_lines, service_definitions, handover_protocols, deposits, payments, payment_service_items, templates, generated_documents.  
- Přidej FK, unikátní omezení, indexy a audit polia.  
- Accept criteria: migrace projdou, tabulky se vytvoří s FK.

2) Modely + ORM
- Vygeneruj modely (např. TypeORM/Sequelize/ActiveRecord) s definovanými vztahy.  
- Include computed fields as DB views or calculated in API layer (např. payments_summary).

3) API (CRUD)
- Implementuj endpoints z návrhu API (autentikace a autorizace).  
- Validace payloadů (JSON Schema nebo DTO s validacemi).  
- Accept criteria: endpoints vrací 200/201 a validaci selhání 400.

4) Šablony dokumentů + generování
- Implementuj model template + generated_document.  
- Integrace s knihovnou pro generování PDF z šablony (docx templater, libreoffice headless, wkhtmltopdf).  
- Mapuj placeholders -> formuláře (template_fields).  
- Accept criteria: lze vygenerovat PDF ze šablony s vyplněnými placeholdery.

5) Elektronický podpis (BankID)
- Implementuj wrapper pro provider e-sign (asynchronní flow).  
- Endpoint /sign/callback pro updaty stavu.  
- Ulož podpis metadata do contract.signature_info nebo payment.signature_info.  
- Accept criteria: možno vytvořit sign request a zpracovat callback (simulace v testu).

6) Služby a výpočty
- CRUD pro service_definitions a contract_service_lines.  
- Funkce pro výpočet měsíčního nákladu ze služeb (mapování periodicity na měsíční hodnotu).  
- Accept criteria: výpočet součtu služeb a započtení do contract.summary.

7) Platby a párování
- Import/ruční vložení plateb, logika alokace plateb, aktualizace statusu dlužných položek.  
- Generování potvrzení (vygenerovaný dokument).  
- Odeslání potvrzení (email + příprava na podpis).  
- Accept criteria: platba se přiřadí ke smlouvě, vygeneruje se doklad a stav je updated.

8) UI / Formuláře
- Form pro vytvoření smlouvy (vyhledání pronaj., nájem., výběr jednotky), přidání služeb.  
- Správa služeb (katalog).  
- Detail platby s možností odeslat potvrzení.  
- Form pro předávací protokol s přidáváním fotografií.  
- Accept criteria: uživatel může vytvořit smlouvu, přidat službu a zaznamenat platbu.

9) Testy
- Unit + integration testy:
  - Vytvoření smlouvy -> generování dokumentu -> podpis -> příchod platby -> vygenerování potvrzení  
  - Příjem bankovního souboru -> automatické párování  
- Accept criteria: všechny scénáře pokryty.

10) Bezpečnost a GDPR
- Šifrovat citlivá pole (rodné číslo, bankovní údaje).  
- Audit log pro přístupy a generování dokumentů.  
- Role-based přístupová práva (nájemníci nesmí vidět jiné smlouvy).  
- Accept criteria: základní šifrování a ACL.

11) Nasazení / integrace
- Webhooky pro bankovní feedy a sign provider.  
- Cron joby pro připomínky (vrácení kauce, ups zánamů).  
- Accept criteria: webhooky testovány, cron joby spuštěny.

---

## Příklady pracovního toku (konkrétní scénář)

1) Admin vytvoří pronajímatele (030) a vytvoří nemovitost + jednotku (040).  
2) Správce vytvoří nájemníka (050).  
3) V modulu 060 vytvoří smlouvu: přiřadí jednotku, pronajímatele, nájemníka; přidá 2 služby (070) — voda (nájemník), úklid společných prostor (pronajímatel).  
4) Smlouva je vygenerována jako dokument z šablony a odeslán do podpisu BankID. Po podpisu se stav smlouvy aktualizuje na aktivní.  
5) Nájemník pošle platbu (připsaná přes bankovní feed) — systém automaticky spáruje platební referenci s kontraktem, vytvoří záznam v module 080, vygeneruje potvrzení a spustí flow pro podpis potvrzení + odeslání emailem.  
6) Při měsíčním vyúčtování se spočítají měřené služby a případné rozdíly vyúčtují zvlášť.

---

## Drobné implementační doporučení

- Rozděl na mikroservisy/monolit dle velikosti: např. payments-service může být oddělený kvůli integracím bank.  
- Použij message queue (Rabbit/Kafka) pro asynchronní úlohy: generování dokumentů, volání sign provideru, odesílání emailů.  
- Implementuj audit/log stream a možnost stáhnout všechny podpisy/dokumenty pro právní účely.  
- Ukládej verze dokumentů, nechte historii placeholderů.

---

## Co mohu udělat dál (možnosti)

- Vygenerovat SQL DDL (Postgres) pro všechny zmíněné tabulky.  
- Připravit JSON Schema pro API endpointy (contracts, payments, services).  
- Vytvořit OpenAPI (Swagger) návrh s routami.  
- Generovat sample UI komponenty (React/Angular) pro formuláře.  
- Napsat konkrétní migrace / modely pro vybraný framework (řekni který).

Shrnutí: Ano, je to možné a návrh výše obsahuje kompletní seznam polí, vztahů a kroků implementace pro moduly 030–080. Pokud chceš, začnu hned generovat SQL DDL pro Postgres nebo OpenAPI spec — který krok chceš teď, nebo máš preferovaný tech stack (Node/Express + TypeORM, Rails, Django, .NET)?