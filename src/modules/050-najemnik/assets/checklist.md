# Implementační Checklist - Modul 050 (Nájemník)

**Verze:** 1.0  
**Poslední aktualizace:** 2025-11-10  
**Účel:** Podrobný krok-za-krokem checklist pro agenta při implementaci modulu 050

---

## 📋 Obsah

1. [Před začátkem](#před-začátkem)
2. [Fáze 1: Příprava](#fáze-1-příprava)
3. [Fáze 2: Databázová vrstva](#fáze-2-databázová-vrstva)
4. [Fáze 3: Manifest](#fáze-3-manifest)
5. [Fáze 4: Tiles (Přehledy)](#fáze-4-tiles-přehledy)
6. [Fáze 5: Forms (Formuláře)](#fáze-5-forms-formuláře)
7. [Fáze 6: Type Schemas](#fáze-6-type-schemas)
8. [Fáze 7: Registrace modulu](#fáze-7-registrace-modulu)
9. [Fáze 8: Testování](#fáze-8-testování)
10. [Fáze 9: Dokumentace](#fáze-9-dokumentace)
11. [Fáze 10: Finalizace](#fáze-10-finalizace)

---

## Před začátkem

### ⚠️ DŮLEŽITÉ

1. **Referenční modul**: Modul 030-pronajimatel je IDENTICKÝ s modulem 050-najemnik
2. **Kopírovat a upravit**: Kopíruj soubory z modulu 030 a změň pouze:
   - `role = 'pronajimatel'` → `role = 'najemnik'`
   - Text "Pronajímatel" → "Nájemník"
   - ID modulu `030-pronajimatel` → `050-najemnik`
   - Ikona `home` → `person`
3. **Sdílená tabulka**: Oba moduly používají stejnou tabulku `subjects`
4. **Neměnit strukturu**: Zachovej přesně stejnou strukturu souborů a kódu

### Potřebné znalosti

- [ ] Přečetl jsem README.md modulu 050
- [ ] Přečetl jsem permissions.md
- [ ] Přečetl jsem datovy-model.md
- [ ] Prohlédl jsem modul 030-pronajimatel jako referenci
- [ ] Rozumím struktuře aplikace v5

---

## Fáze 1: Příprava

### 1.1 Zkontrolovat existující strukturu

```bash
# Ověř, že existuje modul 030
ls -la src/modules/030-pronajimatel

# Ověř, že existuje adresář pro modul 050
ls -la src/modules/050-najemnik
```

**Checklist:**
- [ ] Modul 030 existuje a je kompletní
- [ ] Adresář 050-najemnik existuje
- [ ] Mám přístup k databázi a mohu vytvářet záznamy

### 1.2 Připravit pracovní prostředí

```bash
# Vytvořit podadresáře pokud neexistují
cd src/modules/050-najemnik
mkdir -p tiles forms assets
```

**Checklist:**
- [ ] Složka `tiles/` existuje
- [ ] Složka `forms/` existuje
- [ ] Složka `assets/` existuje

### 1.3 Zkontrolovat databázi

```sql
-- Ověř, že tabulka subjects existuje
SELECT * FROM subjects WHERE role = 'najemnik' LIMIT 1;

-- Ověř, že tabulka subject_types existuje
SELECT * FROM subject_types;

-- Ověř, že existuje funkce getSubjectsCountsByType
SELECT * FROM getSubjectsCountsByType('najemnik', false);
```

**Checklist:**
- [ ] Tabulka `subjects` existuje
- [ ] Tabulka `subject_types` existuje a obsahuje data
- [ ] Tabulka `user_subjects` existuje
- [ ] Tabulka `subject_history` existuje
- [ ] RLS policies jsou aktivní
- [ ] Triggery jsou vytvořeny

---

## Fáze 2: Databázová vrstva

### 2.1 Vytvořit db.js

**Soubor:** `src/modules/050-najemnik/db.js`

**Postup:**
1. Zkopíruj `src/modules/030-pronajimatel/db.js`
2. Změň všechny výskyty `'pronajimatel'` na `'najemnik'`
3. Změň názvy funkcí: `getLandlord*` → `getTenant*`
4. Ulož soubor

**Checklist:**
- [ ] Soubor `db.js` vytvořen
- [ ] Funkce `getAllTenants()` implementována
- [ ] Funkce `getTenantById()` implementována
- [ ] Funkce `getTenantsByType()` implementována
- [ ] Funkce `createTenant()` implementována
- [ ] Funkce `updateTenant()` implementována
- [ ] Funkce `archiveTenant()` implementována
- [ ] Funkce `searchTenants()` implementována
- [ ] Všechny funkce filtrují podle `role = 'najemnik'`
- [ ] Import supabase je správný: `import { supabase } from '/src/supabase.js';`

### 2.2 Otestovat db.js

```javascript
// Test v konzoli prohlížeče
import { getAllTenants } from '/src/modules/050-najemnik/db.js';
const result = await getAllTenants();
console.log(result);
```

**Checklist:**
- [ ] `getAllTenants()` vrací data bez chyby
- [ ] Data obsahují pouze záznamy s `role = 'najemnik'`

---

## Fáze 3: Manifest

### 3.1 Vytvořit module.config.js

**Soubor:** `src/modules/050-najemnik/module.config.js`

**Postup:**
1. Zkopíruj `src/modules/030-pronajimatel/module.config.js`
2. Změň:
   - `id: '030-pronajimatel'` → `id: '050-najemnik'`
   - `title: 'Pronajímatel'` → `title: 'Nájemník'`
   - `icon: 'home'` → `icon: 'person'`
   - `role: 'pronajimatel'` → `role: 'najemnik'` (v getSubjectsCountsByType)
   - `title: 'Přehled pronajímatelů'` → `title: 'Přehled nájemníků'`
   - `title: 'Detail pronajímatele'` → `title: 'Detail nájemníka'`
3. Ulož soubor

**Checklist:**
- [ ] Soubor `module.config.js` vytvořen
- [ ] Export `getManifest()` funkce existuje
- [ ] `id` je `'050-najemnik'`
- [ ] `title` je `'Nájemník'`
- [ ] `icon` je `'person'`
- [ ] `defaultTile` je `'prehled'`
- [ ] `tiles` array obsahuje hlavní tile 'prehled'
- [ ] `forms` array obsahuje 'chooser', 'detail', 'form'
- [ ] Dynamické načítání typů z databáze funguje
- [ ] Export default existuje: `export default { getManifest };`

### 3.2 Otestovat manifest

```javascript
// Test v konzoli
import { getManifest } from '/src/modules/050-najemnik/module.config.js';
const manifest = await getManifest();
console.log(manifest);
```

**Checklist:**
- [ ] Manifest se načte bez chyby
- [ ] Obsahuje správné ID, title, icon
- [ ] Tiles array není prázdný
- [ ] Forms array obsahuje 3 položky

---

## Fáze 4: Tiles (Přehledy)

### 4.1 Hlavní přehled (prehled.js)

**Soubor:** `src/modules/050-najemnik/tiles/prehled.js`

**Postup:**
1. Zkopíruj `src/modules/030-pronajimatel/tiles/prehled.js`
2. Změň:
   - Import z db.js: `getAllLandlords` → `getAllTenants`
   - Breadcrumb text: "Pronajímatel" → "Nájemník"
   - Navigace URL: `030-pronajimatel` → `050-najemnik`
3. Ulož soubor

**Checklist:**
- [ ] Soubor `tiles/prehled.js` vytvořen
- [ ] Export funkce `render(root, manifest, params)` existuje
- [ ] Import `getAllTenants` je správný
- [ ] Breadcrumb je nastaven pomocí `setBreadcrumb()`
- [ ] CommonActions jsou vykresleny
- [ ] Tabulka má správné sloupce (typ_subjektu, display_name, ico, telefon, email, město, archivován)
- [ ] onRowClick naviguje na detail
- [ ] onRowSelect ukládá vybraný řádek
- [ ] Filtr pro search implementován
- [ ] Checkbox "Zobrazit archivované" funguje
- [ ] Akce (add, edit, archive, attach, refresh, history) jsou implementovány

### 4.2 Přehled typů (osoba.js, osvc.js, firma.js, spolek.js, stat.js, zastupce.js)

**Pro každý typ:**

**Postup:**
1. Zkopíruj odpovídající soubor z `src/modules/030-pronajimatel/tiles/`
2. Změň:
   - Import: `getLandlordsByType` → `getTenantsByType`
   - Breadcrumb: "Pronajímatel" → "Nájemník"
   - Navigace: `030-pronajimatel` → `050-najemnik`
3. Ulož soubor

**Checklist pro každý tile:**
- [ ] `tiles/osoba.js` vytvořen
- [ ] `tiles/osvc.js` vytvořen
- [ ] `tiles/firma.js` vytvořen
- [ ] `tiles/spolek.js` vytvořen
- [ ] `tiles/stat.js` vytvořen
- [ ] `tiles/zastupce.js` vytvořen
- [ ] Každý tile filtruje podle správného `typ_subjektu`
- [ ] Všechny tiles mají CommonActions
- [ ] Všechny tiles mají breadcrumb
- [ ] Všechny tiles používají `getTenantsByType()` s parametrem typu

---

## Fáze 5: Forms (Formuláře)

### 5.1 Chooser (chooser.js)

**Soubor:** `src/modules/050-najemnik/forms/chooser.js`

**Postup:**
1. Zkopíruj `src/modules/030-pronajimatel/forms/chooser.js`
2. Změň:
   - Breadcrumb: "Pronajímatel" → "Nájemník"
   - Navigace: `030-pronajimatel` → `050-najemnik`
   - Text: "Vyberte typ nového pronajímatele" → "Vyberte typ nového nájemníka"
3. Ulož soubor

**Checklist:**
- [ ] Soubor `forms/chooser.js` vytvořen
- [ ] Export funkce `render()` existuje
- [ ] Breadcrumb nastaven
- [ ] Grid s kartami typů je vykreslen
- [ ] Každá karta naviguje na `#/m/050-najemnik/f/form?type={typ}`
- [ ] Ikony odpovídají typům (person, briefcase, building, people, bank, handshake)

### 5.2 Detail (detail.js)

**Soubor:** `src/modules/050-najemnik/forms/detail.js`

**Postup:**
1. Zkopíruj `src/modules/030-pronajimatel/forms/detail.js`
2. Změň:
   - Import: `getLandlordById` → `getTenantById`
   - Breadcrumb: "Pronajímatel" → "Nájemník"
   - Navigace: `030-pronajimatel` → `050-najemnik`
3. Ulož soubor

**Checklist:**
- [ ] Soubor `forms/detail.js` vytvořen
- [ ] Export funkce `render()` existuje
- [ ] Načítá data pomocí `getTenantById()`
- [ ] Breadcrumb nastaven
- [ ] CommonActions vykresleny (edit, archive, attach, history)
- [ ] Sekce: Základní údaje, Kontaktní údaje, Adresa, Další informace, Systém
- [ ] Pole se zobrazují dynamicky podle typu subjektu
- [ ] Systémové pole jsou read-only a šedé
- [ ] Navigace na edit funguje

### 5.3 Formulář (form.js)

**Soubor:** `src/modules/050-najemnik/forms/form.js`

**Postup:**
1. Zkopíruj `src/modules/030-pronajimatel/forms/form.js`
2. Změň:
   - Import: `getLandlordById`, `createLandlord`, `updateLandlord` → `getTenant*`
   - Breadcrumb: "Pronajímatel" → "Nájemník"
   - Navigace: `030-pronajimatel` → `050-najemnik`
   - Import type schemas z vlastního souboru
3. Ulož soubor

**Checklist:**
- [ ] Soubor `forms/form.js` vytvořen
- [ ] Export funkce `render()` existuje
- [ ] Detekce režimu: create (query.type) vs edit (query.id)
- [ ] Načítání dat v edit mode pomocí `getTenantById()`
- [ ] Breadcrumb nastaven pro oba režimy
- [ ] CommonActions vykresleny
- [ ] Pole se generují dynamicky podle typu (z type-schemas.js)
- [ ] Sekce: Základní údaje, Kontaktní údaje, Adresa, Další, Systém
- [ ] Validace povinných polí
- [ ] Computed field `display_name` se generuje automaticky
- [ ] onSubmit volá `createTenant()` nebo `updateTenant()`
- [ ] Toast notifikace po úspěchu/chybě
- [ ] Unsaved changes warning aktivován
- [ ] Po uložení navigace na detail

---

## Fáze 6: Type Schemas

### 6.1 Vytvořit type-schemas.js

**Soubor:** `src/modules/050-najemnik/type-schemas.js`

**Postup:**
1. Zkopíruj `src/modules/030-pronajimatel/type-schemas.js`
2. Zkontroluj, že všechny typy jsou definovány (osoba, osvc, firma, spolek, stat, zastupce)
3. Ulož soubor

**Checklist:**
- [ ] Soubor `type-schemas.js` vytvořen
- [ ] Export `TENANT_TYPE_SCHEMAS` existuje
- [ ] Všech 6 typů je definováno
- [ ] Každý typ má: label, icon, requiredFields, specificFields
- [ ] Export `COMMON_CONTACT_FIELDS` existuje
- [ ] Export `COMMON_ADDRESS_FIELDS` existuje
- [ ] Export `COMMON_OTHER_FIELDS` existuje
- [ ] Funkce `getFieldsForType()` exportována
- [ ] Funkce `validateTenantData()` exportována

---

## Fáze 7: Registrace modulu

### 7.1 Přidat do modules.index.js

**Soubor:** `src/app/modules.index.js`

**Postup:**
1. Otevři soubor
2. Přidej import modulu 050 do array `MODULE_SOURCES`:

```javascript
export const MODULE_SOURCES = [
  () => import('../modules/010-sprava-uzivatelu/module.config.js'),
  () => import('../modules/020-muj-ucet/module.config.js'),
  () => import('../modules/030-pronajimatel/module.config.js'),
  () => import('../modules/040-nemovitost/module.config.js'),
  () => import('../modules/050-najemnik/module.config.js'),  // <-- PŘIDAT
  () => import('../modules/060-smlouva/module.config.js'),
  () => import('../modules/070-sluzby/module.config.js'),
  () => import('../modules/080-platby/module.config.js'),
];
```

3. Ulož soubor

**Checklist:**
- [ ] Modul 050 přidán do `MODULE_SOURCES`
- [ ] Import má správnou cestu
- [ ] Syntaxe je správná (čárka na konci)

---

## Fáze 8: Testování

### 8.1 Základní funkčnost

**Checklist:**
- [ ] Aplikace se načte bez chyb
- [ ] Modul "Nájemník" se objeví v sidebaru
- [ ] Ikona je `person` (👤)
- [ ] Kliknutím na modul se otevře přehled

### 8.2 Testování Tiles

**Pro hlavní přehled (prehled):**
- [ ] Tile se načte a zobrazí data
- [ ] Breadcrumb je správný: "Domů > Nájemník > Přehled"
- [ ] CommonActions jsou viditelné
- [ ] Tlačítko "Add" funguje (navigace na chooser)
- [ ] Tlačítko "Refresh" funguje (reload dat)
- [ ] Tabulka zobrazuje správné sloupce
- [ ] Kliknutí na řádek naviguje na detail
- [ ] Výběr řádku funguje (visual feedback)
- [ ] Tlačítko "Edit" funguje (po výběru řádku)
- [ ] Search filter funguje
- [ ] Checkbox "Zobrazit archivované" funguje

**Pro každý typ (osoba, osvc, firma, spolek, stat, zastupce):**
- [ ] Tile se načte pokud existují data tohoto typu
- [ ] Filtruje pouze záznamy daného typu
- [ ] CommonActions fungují
- [ ] Tabulka má správné sloupce pro daný typ

### 8.3 Testování Forms

**Chooser:**
- [ ] Formulář se načte
- [ ] Breadcrumb: "Domů > Nájemník > Nový subjekt"
- [ ] Grid s 6 kartami je viditelný
- [ ] Kliknutí na kartu naviguje na form s parametrem `type`

**Detail:**
- [ ] Formulář se načte s daty
- [ ] Breadcrumb: "Domů > Nájemník > Přehled > Detail: {jméno}"
- [ ] CommonActions jsou viditelné
- [ ] Tlačítko "Edit" naviguje na editaci
- [ ] Všechny sekce jsou viditelné
- [ ] Pole se zobrazují správně podle typu

**Form (Create):**
- [ ] Formulář se načte s prázdnými poli
- [ ] Breadcrumb: "Domů > Nájemník > Nový subjekt"
- [ ] Pole se zobrazují podle vybraného typu
- [ ] Povinná pole jsou označena `*`
- [ ] Validace funguje (error messages)
- [ ] Tlačítko "Save" funguje
- [ ] Po uložení navigace na detail
- [ ] Toast notifikace "Úspěšně uloženo"
- [ ] Data se uloží do databáze s `role = 'najemnik'`

**Form (Edit):**
- [ ] Formulář se načte s existujícími daty
- [ ] Breadcrumb: "Domů > Nájemník > Detail > Editace"
- [ ] Pole jsou předvyplněná
- [ ] Tlačítko "Save" uloží změny
- [ ] Tlačítko "Archive" archivuje subjekt
- [ ] Unsaved warning funguje
- [ ] Po uložení navigace zpět na detail

### 8.4 Testování CRUD operací

**Create:**
- [ ] Vytvoření nové osoby funguje
- [ ] Vytvoření nové OSVČ funguje
- [ ] Vytvoření nové firmy funguje
- [ ] Vytvoření spolku funguje
- [ ] Vytvoření státní instituce funguje
- [ ] Vytvoření zástupce funguje
- [ ] Data se ukládají s `role = 'najemnik'`
- [ ] `display_name` se generuje automaticky
- [ ] `created_by` a `updated_by` jsou vyplněny

**Read:**
- [ ] getAllTenants() vrací pouze nájemníky
- [ ] getTenantById() vrací správná data
- [ ] getTenantsByType() filtruje podle typu
- [ ] searchTenants() vyhledává správně

**Update:**
- [ ] Úprava osoby funguje
- [ ] Úprava firmy funguje
- [ ] `updated_at` se aktualizuje automaticky
- [ ] `updated_by` je vyplněno
- [ ] `role` NEMŮŽE být změněna (kontrola)

**Archive:**
- [ ] Archivace nastaví `archived = true`
- [ ] Archivace nastaví `archived_at`
- [ ] Archivované záznamy se nezobrazují v seznamu (když je checkbox vypnutý)
- [ ] Archivované záznamy se zobrazují když je checkbox zapnutý

### 8.5 Testování oprávnění (RLS)

**Admin:**
- [ ] Vidí všechny nájemníky
- [ ] Může vytvářet nové
- [ ] Může upravovat všechny
- [ ] Může archivovat všechny

**User:**
- [ ] Vidí pouze své nájemníky (přes user_subjects)
- [ ] Může vytvářet nové (stane se vlastníkem)
- [ ] Může upravovat pouze své
- [ ] NEMŮŽE upravovat cizí

**Viewer:**
- [ ] Vidí pouze nearchivované
- [ ] NEMŮŽE vytvářet
- [ ] NEMŮŽE upravovat
- [ ] NEMŮŽE archivovat
- [ ] Tlačítka add, edit, archive jsou skrytá

### 8.6 Testování integrace

**S modulem 030 (Pronajímatel):**
- [ ] Oba moduly používají stejnou tabulku subjects
- [ ] Pronajímatelé a nájemníci se NEMÍCHAJÍ
- [ ] Každý modul vidí pouze své role

**S modulem 060 (Smlouva):**
- [ ] Lze vybrat nájemníka při vytváření smlouvy
- [ ] FK vztah funguje (contracts.tenant_id → subjects.id)

---

## Fáze 9: Dokumentace

### 9.1 Aktualizovat README aplikace

**Soubor:** `README.md` (v root projektu)

**Postup:**
1. Přidej modul 050 do seznamu modulů
2. Přidej krátký popis

**Checklist:**
- [ ] Modul 050 je uveden v seznamu modulů
- [ ] Popis je stručný a výstižný

### 9.2 Dokumentace v assets/

**Checklist:**
- [ ] `assets/README.md` existuje a je kompletní
- [ ] `assets/permissions.md` existuje a je kompletní
- [ ] `assets/datovy-model.md` existuje a je kompletní
- [ ] `assets/checklist.md` existuje (tento soubor)

### 9.3 Komentáře v kódu

**Checklist:**
- [ ] Všechny veřejné funkce mají JSDoc komentáře
- [ ] Složitější logika má vysvětlující komentáře
- [ ] TODO komentáře jsou odstraněny nebo mají plán řešení

---

## Fáze 10: Finalizace

### 10.1 Code review

**Checklist:**
- [ ] Kód je čitelný
- [ ] Dodržena konzistence s modulem 030
- [ ] Žádné console.log() (kromě error logování)
- [ ] Žádné dead code
- [ ] Žádné hardcodované hodnoty (použity konstanty)

### 10.2 Bezpečnost

**Checklist:**
- [ ] RLS policies jsou aktivní
- [ ] Všechny inputy jsou validovány
- [ ] Žádné SQL injection rizika
- [ ] Žádné XSS rizika
- [ ] Žádné secrets v kódu

### 10.3 Performance

**Checklist:**
- [ ] Databázové dotazy jsou optimalizované
- [ ] Indexy existují na často vyhledávaných sloupcích
- [ ] Žádné N+1 query problémy

### 10.4 Git

**Checklist:**
- [ ] Všechny soubory jsou commitnuté
- [ ] Commit message je popisná
- [ ] .gitignore je správně nastaven
- [ ] Žádné velké soubory v commitu

---

## Rychlý checklist (TL;DR)

### Soubory k vytvoření:

- [ ] `module.config.js` (1 soubor)
- [ ] `db.js` (1 soubor)
- [ ] `type-schemas.js` (1 soubor)
- [ ] `tiles/prehled.js` (1 soubor)
- [ ] `tiles/osoba.js` (1 soubor)
- [ ] `tiles/osvc.js` (1 soubor)
- [ ] `tiles/firma.js` (1 soubor)
- [ ] `tiles/spolek.js` (1 soubor)
- [ ] `tiles/stat.js` (1 soubor)
- [ ] `tiles/zastupce.js` (1 soubor)
- [ ] `forms/chooser.js` (1 soubor)
- [ ] `forms/detail.js` (1 soubor)
- [ ] `forms/form.js` (1 soubor)

**Celkem: 13 souborů**

### Soubory k úpravě:

- [ ] `src/app/modules.index.js` (přidat import)
- [ ] `README.md` (přidat do seznamu modulů)

**Celkem: 2 soubory**

### Databáze:

- [ ] Tabulka `subjects` existuje ✅ (sdílená s modulem 030)
- [ ] RLS policies aktivní ✅
- [ ] Triggery vytvořeny ✅

**Žádné DB změny nejsou potřeba!**

---

## Časový odhad

| Fáze | Časový odhad | Poznámka |
|------|--------------|----------|
| Fáze 1: Příprava | 10 min | Kontrola prostředí |
| Fáze 2: db.js | 15 min | Kopírovat a upravit |
| Fáze 3: Manifest | 10 min | Kopírovat a upravit |
| Fáze 4: Tiles | 45 min | 7 tiles, každý ~5-10 min |
| Fáze 5: Forms | 30 min | 3 forms |
| Fáze 6: Type schemas | 10 min | Kopírovat |
| Fáze 7: Registrace | 5 min | Jeden řádek kódu |
| Fáze 8: Testování | 60 min | Důkladné testování |
| Fáze 9: Dokumentace | 20 min | Aktualizace docs |
| Fáze 10: Finalizace | 15 min | Review a commit |

**Celkem: ~3.5 hodiny**

---

## Častá úskalí a řešení

### Problém 1: Modul se nezobrazuje v sidebaru

**Řešení:**
- Zkontroluj, že je modul přidán do `modules.index.js`
- Zkontroluj konzoli prohlížeče na chyby
- Zkontroluj, že `getManifest()` vrací platný objekt

### Problém 2: Data se nezobrazují

**Řešení:**
- Zkontroluj, že `role = 'najemnik'` ve všech DB dotazech
- Zkontroluj RLS policies
- Zkontroluj, že uživatel má oprávnění

### Problém 3: Formulář neuloží data

**Řešení:**
- Zkontroluj validaci povinných polí
- Zkontroluj, že `role = 'najemnik'` je vždy nastaveno
- Zkontroluj RLS policies pro INSERT
- Zkontroluj konzoli na chyby

### Problém 4: Archivace nefunguje

**Řešení:**
- Zkontroluj, že používáš UPDATE místo DELETE
- Zkontroluj RLS policy pro UPDATE
- Zkontroluj, že `archived` a `archived_at` jsou nastaveny

### Problém 5: Search nefunguje

**Řešení:**
- Zkontroluj, že používáš `.or()` filter s více poli
- Zkontroluj, že používáš `.ilike` pro case-insensitive search
- Zkontroluj, že search term je trimovaný

---

## Finální kontrola před mergem

### Code Quality

- [ ] Kód je konzistentní s modulem 030
- [ ] Všechny funkce mají JSDoc
- [ ] Žádné console.log()
- [ ] Žádné TODO
- [ ] Žádné hardcoded values

### Functionality

- [ ] Všechny CRUD operace fungují
- [ ] Všechny tiles fungují
- [ ] Všechny forms fungují
- [ ] Validace funguje
- [ ] Archivace funguje

### Security

- [ ] RLS policies aktivní
- [ ] Validace na frontendu i backendu
- [ ] Žádné SQL injection rizika
- [ ] Žádné XSS rizika

### Documentation

- [ ] README.md kompletní
- [ ] permissions.md kompletní
- [ ] datovy-model.md kompletní
- [ ] checklist.md kompletní

### Testing

- [ ] Testováno s admin rolí
- [ ] Testováno s user rolí
- [ ] Testováno s viewer rolí
- [ ] Všechny edge cases testovány

---

## Kontakt a podpora

Pro otázky kontaktujte:
- **Lead Developer**: dev@example.com
- **Dokumentace**: /NEW/ adresář v projektu

---

**Konec dokumentu - Implementační Checklist** ✅

**Hodně štěstí s implementací! 🚀**
