# Specifikace formuláře "Detail" pro moduly: Jednotka / Nemovitost / Pronajímatel / Nájemník

Účel: Poskytnout podrobný návrh implementace formuláře typu "Detail" tak, aby ho mohl implementovat vývojář/agent v novém systému. Formulář má být znovupoužitelný pro moduly: Jednotka, Nemovitost, Pronajímatel a Nájemník. Při zobrazení detailu jednoho modulu bude formulář tohoto modulu v editačním režimu (pokud má uživatel oprávnění) a všechny ostatní související moduly se zobrazí jako seznam (read‑only), který odkazuje na jejich vlastní editovací stránky.

Obsah:
- Shrnutí chování
- Layout (rozvržení)
- Ikony a pravé/levé panely
- Tabs / Záložky a jejich pole (podrobné)
- Chování read-only vs edit
- Pravidla pro seznamy (columns, filtry, odkazy)
- Validace a typy polí
- Autorizace / oprávnění
- API / datové kontrakty (příklad JSON)
- UI interakce, stavy a chybové hlášky
- Audit, systémová data (⚙️)
- Testovací a akceptační kritéria
- Poznámky pro implementaci a doporučení

------------------------------------------------------------
1) Shrnutí chování (koncept)
- Hlavní pravidlo: při otevření detailu modulu (např. Jednotka) je editovatelný pouze formulář tohoto modulu. Všechny ostatní související moduly se zobrazují jako seznam položek v příslušných záložkách a jsou read‑only (pouze pro čtení). Každá položka v seznamu má odkaz na vlastní detail (kde bude možné editovat, pokud má uživatel oprávnění).
- Příklad: otevřený detail Jednotky:
  - Vlevo od horní hlavičky: navigační/kontextové ikony (Pronajímatel, Nemovitost, — , Detail jednotky, Nájemníci, Smlouva, Služby, Platby, Systém)
  - Hlavní obsah: editační formulář Jednotky rozdělený do záložek (Základní údaje, Nájem, Systém)
  - Záložky reprezentující jiné moduly (Pronajímatel, Nemovitost, Nájemníci, Smlouva...) obsahují read‑only seznamy s odkazem na jejich detaily
- Stejné pravidlo platí zrcadlově v detailu Pronajímatele, Nemovitosti a Nájemníka (tedy tam bude editační formulář toho modulu a ostatní v seznamech).

------------------------------------------------------------
2) Rozvržení (UI / layout)
- Horní breadcrumb a název: {Pronajímatel} / {Nemovitost} / {Detail jednotky} · [kód jednotky]
- Nadpis: velký název a kód (např. "K1 - Detail jednotky")
- Ikony / tlačítka u hlavičky:
  - Edit (pokud uživatel nemá inline edit, otevře se panel), Delete (pokud povoleno), Přidat (nový záznam), Více (dropdown s akcemi)
- Levý kontextový panel (statický):
  - Seznam modulů s ikonami: Uživatele, Můj účet, Pronajímatel, Nemovitosti, Nájemník, Smlouvy, Služby, Platby
- Pod hlavičkou: horizontální bar se záložkami (ikony + labely):
  - 020🏦 Pronajímatel
  - 040🏢 Nemovitost
  - (separator)
  - 040/form/detail (pin) — aktuální modul (např. Detail jednotky)
  - 050👤 Nájemníci
  - 060📄 Smlouva
  - 070🔧 Služby
  - 080💰 Platby
  - ⚙️ Systém
- Hlavní panel: karta s vnitřním rozložením formuláře (dva sloupce, responzivní).
- Záložky v rámci hlavního formuláře: každá modulární sekce může mít své vlastní záložky (např. Základní údaje / Nájem / Systém).

UI/CSS doporučení:
- Použít komponenty: Card, Grid (2 sloupce), FormField (label + input), Select, DatePicker, Money, Badge, Table.
- Ikony: používat konzistentní sady (FontAwesome, Material) – mapování viz níže.
- Responsivita: na úzkých obrazovkách (mobil) použít jednosloupcové zobrazení.

------------------------------------------------------------
3) Ikony a významy (mapování)
- 020🏦 Pronajímatel — owner
- 040🏢 Nemovitost — property
- 📌 (pin) — rezervní / rychlý odkaz na formulář (možnost připnout tento záznam)
- 050👤 Nájemníci — tenants
- 060📄 Smlouva — contract
- 070🔧 Služby — services
- 080💰 Platby — payments
- ⚙️ Systém — audit / systémové údaje / historie změn

------------------------------------------------------------
4) Záložky & Pole (podrobný seznam pro každý modul)

POZNÁMKA: níže uvádím strukturu polí pro čtyři moduly. U každého pole uvádím: technický klíč, typ, validace, příklady hodnot, read-only pravidlo.

A) Modul: Jednotka (unit) — záložky: Základní údaje | Nájem | Systém
- Základní údaje
  - unit.id (string | uuid) — readonly, interní identifikátor
  - unit.code (string) — označení jednotky (K1) — required, max 30
  - unit.type (enum) — typ jednotky: [Byt, Nebytový prostor, Garáž, Sklad] — required
  - unit.floor (integer) — podlaží — nullable, min -5, max 100
  - unit.area_m2 (decimal) — plocha (m²) — nullable, min 0
  - unit.rooms_count (decimal/integer) — počet místností — nullable
  - unit.layout (string) — dispozice (např. "1+kk", "open-space") — nullable
  - unit.state (enum) — stav: [Volná, Pronajata, Rezervována, Ve vývoji] — required
  - unit.monthly_rent_czk (money) — měsíční nájem (Kč) — nullable, currency=CZK
  - unit.deposit_czk (money) — kauce — nullable
  - unit.notes (text) — poznámky — optional
- Nájem (contract related summary)
  - unit.current_contract_id (string | uuid) — odkaz, nullable
  - unit.contract_summary (object) — read-only vypočtené: {rent, from, to, status}
- Systém
  - audit.created_at (datetime) — readonly
  - audit.created_by (userRef) — readonly
  - audit.updated_at (datetime) — readonly
  - audit.updated_by (userRef) — readonly
  - audit.version (integer) — readonly

B) Modul: Nemovitost (property) — záložky: Základní údaje | Jednotky | Systém
- Property základní
  - property.id, property.code, property.name, property.address (street, city, zip), property.type (bytový/drobný/komerční), property.owner_id
  - property.notes
- Jednotky (tab: seznam) — read-only v tomto zobrazení:
  - Sloupce: code, typ, patro, plocha, stav, aktuální nájem, link -> /units/{id}
  - Filtrování: stav, typ, patro
- Systém: audit stejný jako výše

C) Modul: Pronajímatel (owner) — záložky: Základní údaje | Nemovitosti | Detail jednotky | Nájemníci | Smlouvy | Služby | Platby | Systém
- Owner základní
  - owner.id, owner.name (company/person), owner.contact (email, phone), owner.address, owner.VATno (if company), bank_account (pro platby), preferred_currency
- Nemovitosti (tab: seznam) — read-only:
  - Sloupce: property.code, property.name, address, počet_jednotek, link -> /properties/{id}
- Detail jednotky (tab: seznam všech jednotek které patří pronajímateli)
  - Stejné sloupce jako v property->jednotky
- Nájemníci (tab: seznam všech nájemníků aktivních vztahů)
  - Sloupce: tenant.name, contract_id, unit_code, status, link -> /tenants/{id}
- Smlouvy (tab: seznam)
  - Sloupce: contract.number, unit_code, tenant_name, period_from, period_to, monthly_rent, status, link -> /contracts/{id}
- Služby (tab: seznam)
  - Sloupce: service.name, type, amount, allocation (per m2 / flat), link
- Platby (tab: seznam plateb)
  - Sloupce: date, amount, type, status {zaplacené, zaplaceno pozdě, nezaplaceno, plánované}, kontrakt, poznámka
  - Zobrazení: historické zaplacené + plánované (do konce smlouvy nebo max 12 měsíců)
- Systém: audit

D) Modul: Nájemník (tenant) — záložky: Základní údaje | Smlouvy | Služby | Platby | Systém
- Tenant základní
  - tenant.id, tenant.full_name, tenant.type (osoba/společnost), contact (email, phone), ID dokladů (volitelné)
- Smlouvy
  - Seznam všech smluv nájemníka (active / historic)
  - Sloupce jako u smluv (číslo, jednotka, pronajímatel, perioda, nájem)
- Služby
  - Služby v rámci aktuálních smluv (read-only)
- Platby
  - Historie plateb: stavové rozlišení jak výše + plánované do konce smlouvy / max 12 měsíců
- Systém: audit

------------------------------------------------------------
5) Read-only vs Edit pravidla detailně
- Kontext určuje, který formulář je editovatelný:
  - Pokud resourceType === 'unit' a route je /units/{id} → unit form = EDITABLE (pokud autorizace) ; owner/property/tenants/contracts/services/payments = LIST/READONLY
  - Pokud resourceType === 'owner' (pronajímatel) → owner form = EDITABLE ; ostatní moduly = LIST/READONLY
  - Stejně pro property a tenant.
- Implementační značka: každý záložka seznamu má atribut mode="embedded-readonly" a každá položka obsahuje link na detail (href="/{module}/{id}").
- Edit UI:
  - In-line edit: povoleno pouze pro aktive module
  - Inline validation: při submitu (Save) validovat všechna pole.
  - Zrušit změny: tlačítko Cancel (revertovat lokální form state)
- Buttons:
  - Save (primary) — potvrzení změn
  - Cancel (secondary) — vrátit se
  - Open detail (u každé položky v read-only seznamu) — naviguje do modulu
  - Přidat novou položku (v seznamu) — otevírá create flow v samostatném modu (pokud oprávnění)
  - Export CSV / Print (volitelné) pro seznamy

------------------------------------------------------------
6) Seznamy: sloupce, řazení, filtry, akce
- Tabulky používají standardní komponentu Table:
  - Každá tabulka má: sloupce, fulltext filtr, sloupce pro filtrování podle stavu, řazení, stránkování (server-side).
  - Default: ukázat 10-25 řádků; možnost "Zobrazit vše" s limitací (max 1000).
- Sloupce návrh:
  - Units list: [Kód, Typ, Podlaží, Plocha, Stav, Nájem (Kč), Akt. smlouva, Akce]
  - Contracts list: [Číslo, Jednotka, Nájemník, Od, Do, Měsíční nájem, Stav, Akce]
  - Payments list: [Datum, Částka (Kč), Typ platby, Smlouva, Stav (Badge), Poznámka, Akce]
- Filtry:
  - Stav (enum), Typ (enum), Rozsah datumů, Hledat text (code/name)
- Akce na řádku:
  - Otevřít detail
  - Označit / Vytisknout / Export
  - U plateb: označit jako zaplacené (pokud oprávnění), upravit datum platby

------------------------------------------------------------
7) Validace, business pravidla
- Povinná pole: viz výše (např. unit.code, unit.type, state)
- Nájemní souvislosti:
  - Pokud je unit.state = "Pronajata" musí existovat alespoň 1 aktivní contract svázaný s jednotkou
  - Contract.start_date <= Contract.end_date (pokud end_date není null)
  - Vypočet plánovaných plateb: generovat položky po měsících od start_date do min(end_date, start_date + 12 měsíců)
- Platby:
  - Stav: {ZAPLACENO, ZAPLACENO_POZDE, NEZAPLACENO, PLANOVANE}
  - Pravidlo pro "zaplaceno pozdě": pokud payment_date > due_date → ZAPLACENO_POZDE
- Služby:
  - Mít typ alokace: {Flat fee, Per m2, Proporcionálně}
  - Cena služby včetně/bez DPH (pokud potřebné)

------------------------------------------------------------
8) Autorizace a oprávnění
- Role examples: Admin, Manager, Accountant, Viewer
- Mapování práv:
  - Viewer: čtení všech detailů a seznamů
  - Manager: editace owner/property/unit (kromě plateb)
  - Accountant: zobrazit a měnit platby, exporty
  - Admin: plné oprávnění
- Kontrola přístupu: API i UI musí kontrolovat oprávnění. Zobrazení "Edit" tlačítka je závislé na permission check.

------------------------------------------------------------
9) API / Datové kontrakty (doporučené endpointy)
- Units:
  - GET /api/units/{id} → vrací celý unit objekt + relations (owner, property, current_contract_summary)
  - PUT /api/units/{id} → upravit
  - GET /api/units?ownerId=&propertyId=&status=&page=&perPage=
- Owners:
  - GET /api/owners/{id}
  - GET /api/owners/{id}/properties
  - GET /api/owners/{id}/units
  - GET /api/owners/{id}/contracts
- Properties:
  - GET /api/properties/{id}
  - GET /api/properties/{id}/units
- Tenants:
  - GET /api/tenants/{id}
  - GET /api/tenants/{id}/contracts
- Contracts:
  - GET /api/contracts/{id}
  - GET /api/contracts?unitId=&tenantId=&status=
- Payments:
  - GET /api/payments?contractId=&from=&to=
  - POST /api/payments/{id}/mark-paid
- Služby:
  - GET /api/services?contractId=
- Audit:
  - GET /api/audit/{entityType}/{id}

Ukázka odpovědi pro GET /api/units/{id}:
{
  "id": "uuid-unit-1",
  "code": "K1",
  "type": "Byt",
  "floor": 3,
  "area_m2": 35,
  "rooms_count": 1,
  "layout": "open-space",
  "state": "Volná",
  "monthly_rent_czk": 9000,
  "deposit_czk": null,
  "current_contract_summary": {
    "contract_id": null,
    "rent": null,
    "from": null,
    "to": null,
    "status": null
  },
  "owner": { "id": "owner-123", "name": "Pronajímatel s.r.o.", "link": "/owners/owner-123" },
  "property": { "id": "prop-456", "name": "Admin budova Alfa", "link": "/properties/prop-456" },
  "audit": { "created_at": "2025-01-01T12:00:00Z", "created_by": "admin", "updated_at": "2025-10-01T10:00:00Z", "updated_by": "petr" }
}

Poznámka: pro read-only listy stačí minimal payloady s odkazy na plné detaily.

------------------------------------------------------------
10) UI interakce, stavy, hlášky
- Validace: inline + summary error při submitu
- Success toast: "Uloženo" (zobrazit commit id/číslo transakce)
- Error toast: "Uložení se nezdařilo: {message}"
- Confirm modals: pro mazání / zásadní změny (např. změna stavu "Volná" -> "Pronajata" bez aktivní smlouvy)
- Loading states: skeletony pro karty a tabulky
- Empty states: příklad text "Žádné jednotky" + CTA "Přidat jednotku" (pokud oprávnění)
- Lokalizace: soubor i18n, klíče ve formátu module.field.label

------------------------------------------------------------
11) Audit / systémová záložka (⚙️)
- Obsah:
  - Poslední změny: seznam (datetime, user, field_changes)
  - Verze záznamu (možnost rollback pokud implementováno)
  - Metadata: import source, externí id, last_sync
- Způsob uložení: systémové logy v DB, endpoint GET /api/audit/{entityType}/{id}

------------------------------------------------------------
12) Plánované platby (pravidlo)
- Vypočítat plánované měsíční splátky od contract.start_date do min(contract.end_date, contract.start_date + 12 měsíců)
- Zobrazit je v tabulce "Plánované platby" s rozlišením: plánované / již zaplaceno
- Možnost označit plánovanou platbu jako vytvořenou skutečnou platbu (vytvořit záznam v payments)

------------------------------------------------------------
13) Testy a akceptační kritéria (Checklist pro agenta)
- Navigace
  - [ ] Při otevření /units/{id} se zobrazuje editační formulář jednotky (pokud oprávnění)
  - [ ] Všechny ostatní záložky (Pronajímatel, Nemovitost, Nájemníci, Smlouva, Služby, Platby, Systém) zobrazí read‑only seznamy
- Form fields
  - [ ] Povinná pole validují a zobrazují chyby
  - [ ] Uložit funguje a aktualizuje audit záznamy
- Seznamy
  - [ ] Tabulky mají stránkování, filter, sort
  - [ ] Kliknutí na řádek naviguje na detail zdrojového modulu
- Platby
  - [ ] Historie plateb zobrazuje statusy přesně (zaplaceno/zaplaceno pozdě/nezaplaceno)
  - [ ] Plánované platby jsou generovány dle pravidla (max 12 měsíců nebo do konce smlouvy)
- Autorizace
  - [ ] Uživatel bez práv neuvidí tlačítko "Edit" a endpointy vrátí 403
- Audit
  - [ ] Změny se ukládají s user+timestamp, zobrazeny v záložce Systém
- Edge cases
  - [ ] Unit s více aktivními smlouvami → systém vyhodnotí primární (nejnovější nebo podle flagu)
  - [ ] Smlouva bez konce → plánované platby generovány pouze pro příštích 12 měsíců

------------------------------------------------------------
14) Příklad UI flow (sekvenčně) — implementační návod pro agenta
1. Implementovat datové endpointy (CRUD) + relations (owner->properties->units, tenant->contracts).
2. Vytvořit komponentu "DetailPage" s parametrem resourceType a resourceId.
3. Na mount: GET /api/{resourceType}/{id} → naplnit hlavní formulář.
4. Render záložek: pro hlavní modul vykreslit Form (edit mode). Pro každou jinou záložku vykreslit Table, která si při renderu volá příslušný endpoint (např. owner -> /api/owners/{id}/units).
5. Přidat permission check pro zobrazení/povolení editace (client+server).
6. Přidat systémovou záložku, která si volá audit endpoint.
7. Testy UI: automatizované E2E pro hlavní cesty.

------------------------------------------------------------
15) Další drobnosti a doporučení
- Lazy-loading: načítat seznamy v záložkách až po prvním otevření záložky (skelety).
- Caching: krátkodobý cache pro read-only seznamy (pokud jsou často navštěvované).
- Internationalization (i18n): všechny labely klíče.
- Accessibilita: tab-order, aria-labels, kontrast tlačítek.
- Performance: limitovat číslo plánovaných plateb (12) k zamezení generování stovek řádků.

------------------------------------------------------------
16) Přílohy / Ukázkové screenshoty a mapování (pro vývojáře)
- Použít ikonovou legendu jako CSS utility classes:
  - .icon-owner, .icon-property, .icon-unit, .icon-tenant, .icon-contract, .icon-service, .icon-payment, .icon-audit
- Napojení breadcrumbs: build z relations (owner → property → unit)

------------------------------------------------------------
17) Převod do úkolů pro agent/implementátora (krátký backlog)
- Feature 1: Základní detail page komponenta + CRUD endpoints
- Feature 2: Tabs for relations (units/properties/tenants/contracts/services/payments)
- Feature 3: Read-only lists with links to edit pages
- Feature 4: Audit tab
- Feature 5: Payments logic (status, plánované do 12 měsíců)
- Feature 6: Tests + dokumentace + i18n

------------------------------------------------------------
Závěr:
Tento dokument je navržen tak, aby poskytl kompletní technickou specifikaci formuláře "Detail", který bude univerzálně použit ve modulech Jednotka, Nemovitost, Pronajímatel a Nájemník. Obsahuje návrh polí, API rozhraní, pravidel pro read-only zobrazení, business pravidel pro smlouvy a platby a akceptační testy. Prosím, dejte agentovi tento soubor jako vstupní specifikaci; pokud chcete, mohu vytvořit i minimální wireframe nebo exportovat JSON schéma pro validaci (OpenAPI / JSON Schema).
