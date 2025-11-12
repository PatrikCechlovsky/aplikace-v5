README.md pro detail položky 
Specifikace pro agenta (vložit do ui-detail-layout.md)
1) Breadcrumbs (modře)

Cíl: vždy ukázat plnou cestu k aktuální entitě a podsekci.

Formát: Domů › <Modul-Parent> › <Aktuální entity label> › <Aktivní záložka>

Zdroj dat:

label entity = display_name dle modulu:

030 Pronajímatel → company_name || (first_name + last_name)

040 Nemovitost → property_name

040 Jednotka → unit_label

050 Nájemník → first_name + last_name || company_name

060 Smlouva → contract_code

080 Platby → payment_code / invoice_no (pokud je)

090 Finance → account_label apod.

Router: URL ve tvaru /m/<module>/<id>?tab=<tabKey>.

Kliknutí na část breadcrumbu ≙ navigace na daný segment.

2) Zelený panel záložek (shared tabs bar)

Použít 1 společnou komponentu: DetailTabsPanel.

Seznam záložek (klíče + labely):

landlord (Pronajímatel)

property (Nemovitost)

unit (Jednotka)

tenant (Nájemník)

contract (Smlouva)

payments (Platby)

finance (Finance)

documents (Dokumenty) – volitelné

system (Systém) – audit, meta

Aktivní tab: z query tab, fallback dle modulu (030 = landlord, 040 = property, 050 = tenant, 060 = contract …).

3) Obsah záložky (seznam + detail)

Vizuální pravidla:

nahoře seznam (max 10 řádků, výška fixní ~ 280–320 px, scroll uvnitř boxu).

výchozí výběr = 1. řádek (po načtení).

dole detail vybrané položky (embedded detail view).

prázdné stavy:

seznam: „Žádné položky“ + sekundární button „Přidat“ (pokud má uživatel právo).

detail: nic/placeholder, dokud není vybrána položka.

Ovládání:

klik/enter/dvojklik na řádek → vybere a znovu vyrenderuje detail dole (bez reloadu stránky).

menu „Akce u řádku“ (…): otevřít detail na plnou stránku, upravit, smazat (dle práv).

Pagination: pokud >10 záznamů → defaultně zobraz jen prvních 10, přidej Zobrazit vše (otevře plnohodnotný přehled v modulu).

Datové zdroje pro záložky (typické dotazy):

landlord: GET subjects/:id (detail subjektu)

property: GET properties?landlord_id=:id

unit: GET units?property_id=:id nebo GET units?tenant_id=:id (dle kontextu)

tenant: GET subjects?role=tenant&landlord_id=:id (přes smlouvy; v praxi view)

contract: GET contracts?{landlord_id|unit_id|tenant_id}=:id

payments: GET payments?contract_id IN (...) nebo agregovaný view

finance: GET bank_accounts?subject_id=:id (+ souhrny)

documents: GET documents?{subject|property|unit|contract}_id=:id

system: audit log view

4) Reuse podle modulů

030 Pronajímatel

Tab landlord: form detail subjektu (read)

Tab property: seznam nemovitostí pronajímatele + detail nemovitosti

Tab tenant: nájemníci spjatí přes smlouvy + detail nájemníka

Tab contract: smlouvy tohoto pronajímatele + detail smlouvy

Tab payments: platby smluv pronajímatele (souhrn) + detail platby

Tab finance: účty pronajímatele + detail účtu

040 Nemovitost

Tab property: form detail nemovitosti

Tab unit: jednotky nemovitosti + detail jednotky

Tab tenant: nájemníci podle aktuální obsazenosti (view) + detail nájemníka

Tab contract: smlouvy v rámci této nemovitosti + detail smlouvy

050 Nájemník

Tab tenant: detail nájemníka

Tab contract: jeho smlouvy + detail

Tab payments: platby dle smluv + detail platby

060 Smlouva

Tab contract: detail smlouvy

Tab tenant: účastníci smlouvy (nájemníci) + detail nájemníka

Tab payments: předpisy/platby + detail platby

080 Platby

Tab payments: seznam plateb (scope smlouvy/tenanta) + detail

volitelně contract pro kontext

090 Finance

Tab finance: bankovní účty subjektu + detail účtu

5) Přístupová práva

Každý tab deklaruje requiredRole[] (např. ['admin','manager','ucetni']).

Pokud user nemá právo → tab je disable/skrytý (dle nastavení modulu).
