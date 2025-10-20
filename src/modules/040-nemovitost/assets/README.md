# Modul 040 - Nemovitosti (Real Estate Management)

## Účel modulu
Tento modul implementuje komplexní správu nemovitostí (budov/objektů) a jejich jednotek v rámci aplikace v5. 
Umožňuje evidenci, správu a monitoring nemovitostí včetně jejich jednotek (bytů, kanceláří, skladů, garáží atd.).

## Hlavní funkce
- **CRUD operace** - Vytváření, úprava, zobrazení a archivace nemovitostí i jednotek
- **Správa jednotek** - Každá nemovitost může obsahovat více jednotek s různými stavy (volná, obsazená, rezervovaná, rekonstrukce)
- **Vazby na subjekty** - Propojení s pronajímateli a nájemci
- **Adresní informace** - Kompletní adresní údaje včetně validace PSČ
- **Technické detaily** - Evidence počtu podlaží, roku výstavby, rekonstrukce, vybavení
- **Archivace** - Soft delete s možností obnovy, včetně hromadné archivace jednotek
- **Přílohy** - Podpora příloh pro nemovitosti i jednotky přes AttachmentSystem
- **Historie změn** - Sledování všech změn v entitách

## Struktura modulu

### Tiles (Dlaždice)
- **prehled.js** - Hlavní přehled všech nemovitostí s počty jednotek a volných míst
- **seznam.js** - Seznam nemovitostí s možností filtrace podle typu a stavu
- Specifické přehledy podle typu subjektu (osvc.js, firma.js, spolek.js, stat.js, zastupce.js)

### Forms (Formuláře)
- **edit.js** - Formulář pro vytváření/úpravu nemovitosti
- **detail.js** - Read-only zobrazení detailu nemovitosti
- **jednotka-edit.js** - Formulář pro vytváření/úpravu jednotky (plánováno)
- **jednotka-detail.js** - Read-only zobrazení detailu jednotky (plánováno)

### Services
- **db.js** - Datová vrstva pro komunikaci se Supabase (plánováno)
- **validators.js** - Validační funkce pro data (plánováno)
- **utils.js** - Pomocné funkce pro formátování a výpočty (plánováno)

## Datové modely

### Nemovitost (properties)
Obsahuje základní informace o budově/objektu:
- Identifikace (ID, typ, název)
- Adresa (ulice, číslo popisné, město, PSČ, stát)
- Technické údaje (počet podlaží, rok výstavby, rekonstrukce)
- Vybavení (výtah, parkování, kolárna atd.)
- Vazby (pronajímatel, správce)
- Metadata (created_at, updated_at, archived, archivedAt)

### Jednotka (units)
Reprezentuje jednotlivou jednotku v nemovitosti:
- Identifikace (ID, nemovitost_id, označení, typ)
- Dispozice (podlaží, plocha, počet místností, dispozice)
- Stav (volná, obsazená, rezervovaná, rekonstrukce)
- Nájemní vztah (nájemce, měsíční nájem, datum začátku/konce)
- Metadata (created_at, updated_at, archived, archivedAt)

## Typy nemovitostí
- **Bytový dům** 🏢 - Pro byty
- **Rodinný dům** 🏠 - Pro byty
- **Administrativní budova** 🏬 - Pro kanceláře
- **Průmyslový objekt** 🏭 - Pro sklady
- **Pozemek** 🌳 - Bez jednotek
- **Jiný objekt** 🏘️ - Univerzální

## Typy jednotek
- **Byt** 🏠
- **Kancelář** 💼
- **Obchodní prostor** 🛍️
- **Sklad** 📦
- **Garáž/Parking** 🚗
- **Sklep** 📦
- **Půda** 🏠
- **Jiná jednotka** 🔑

## Závislosti na jiných modulech
- **030-pronajimatel** - Pro výběr vlastníka nemovitosti
- **050-najemnik** - Pro přiřazení nájemce k jednotce
- **AttachmentSystem** - Pro správu příloh
- **Router** - Pro navigaci mezi pohledy
- **Supabase** - Pro persistenci dat (přechod z localStorage)

## UI komponenty
- Breadcrumbs navigace
- Common actions (Přidat, Upravit, Archivovat, Přílohy)
- Tabulkový seznam s filtrací a řazením
- Formuláře s validací
- Info boxy pro upozornění
- Badge komponenty pro stavy a typy
- Modal dialogy pro potvrzení akcí

## Bezpečnost a oprávnění
- **properties.read** - Čtení nemovitostí
- **properties.create** - Vytváření nových nemovitostí
- **properties.update** - Úprava existujících nemovitostí
- **properties.archive** - Archivace nemovitostí
- **units.read** - Čtení jednotek
- **units.create** - Vytváření nových jednotek
- **units.update** - Úprava existujících jednotek
- **units.archive** - Archivace jednotek

## Známé problémy z původního kódu (localStorage verze)
- Duplicitní definice `addTableStyles()` - opraveno v novém modulu
- `getItemById()` vracel `{}` místo `null` - bude opraveno
- `getCurrentView()` byl stub - integrováno s routerem
- Blokující `confirm()` dialogy - nahrazeno modály
- `saveForm()` přepisoval celý objekt - implementován merge
- Chybějící normalizace pole `vybaveni` - bude validováno
- XSS riziko při vkládání HTML - implementován escaping

## Migrace z localStorage na Supabase
Module je připraven pro migraci:
1. Data z localStorage klíčů (`nemovitosti_data`, `jednotky_data`)
2. Převod na Supabase tabulky (`properties`, `units`)
3. Zachování všech polí včetně `archived` a `archivedAt`
4. RLS policies pro row-level security
5. Foreign keys na `subjects` (pronajímatel/nájemce)

## Rychlý test
1. Otevři modul v sidebaru → otevře se přehled nemovitostí
2. Klikni "Přidat" → Vyber typ nemovitosti → Vyplň formulář
3. Po uložení → Přesměrování na správu jednotek (pokud počet > 0)
4. Dvojklik na řádek v seznamu → Otevře detail nemovitosti
5. Klikni "Upravit" → Formulář pro editaci

## Plán implementace
Viz [checklist.md](./checklist.md) pro detailní checklist implementace.

## Reference
- Datový model: [datovy-model.md](./datovy-model.md)
- Oprávnění: [permissions.md](./permissions.md)
- Standardizační návod: `/docs/STANDARDIZACNI-NAVOD.md`
- Pravidla: `/docs/rules.md`
