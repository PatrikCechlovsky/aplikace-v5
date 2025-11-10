# Checklist modulu 060-smlouva (Pronajímatel)

## ✅ Struktura modulu

- [ ] Adresář `src/modules/060-smlouva/` vytvořen
- [ ] `module.config.js` implementován
- [ ] `db.js` implementován
- [ ] `type-schemas.js` implementován (optional)
- [ ] Složka `tiles/` vytvořena
- [ ] Složka `forms/` vytvořena
- [ ] Složka `assets/` vytvořena

## ✅ Manifest (module.config.js)

- [ ] `id` = '060-smlouva' (odpovídá názvu adresáře)
- [ ] `title` = 'Pronajímatel'
- [ ] `icon` = 'home'
- [ ] `defaultTile` = 'prehled'
- [ ] `tiles` pole definováno s přehledy
- [ ] `forms` pole definováno s formuláři
- [ ] Dynamické načítání counts implementováno
- [ ] Export `getManifest()` funkce
- [ ] Export `default { getManifest }`

## ✅ Databázové operace (db.js)

- [ ] `listLandlords(options)` implementováno
- [ ] `getLandlord(id)` implementováno
- [ ] `upsertLandlord(landlord)` implementováno
- [ ] `archiveLandlord(id)` implementováno
- [ ] `unarchiveLandlord(id)` implementováno (optional)
- [ ] Všechny funkce vrací `{data, error}` formát
- [ ] Error handling implementován (try/catch)
- [ ] Funkce `generateDisplayName()` implementována

## ✅ Tiles (Přehledy)

- [ ] `prehled.js` - Hlavní přehled všech pronajímatelů
- [ ] `osoba.js` - Filtrovaný přehled osob
- [ ] `osvc.js` - Filtrovaný přehled OSVČ
- [ ] `firma.js` - Filtrovaný přehled firem
- [ ] `spolek.js` - Filtrovaný přehled spolků
- [ ] `stat.js` - Filtrovaný přehled státních institucí
- [ ] `zastupce.js` - Filtrovaný přehled zástupců

### Pro každý tile:

- [ ] Breadcrumb nastaven pomocí `setBreadcrumb()`
- [ ] CommonActions vykresleny pomocí `renderCommonActions()`
- [ ] Tabulka vykreslena pomocí `renderTable()`
- [ ] Filtr "Zobrazit archivované" implementován
- [ ] Search implementován (pro prehled.js)
- [ ] `onRowSelect` handler implementován
- [ ] `onRowDblClick` naviguje na detail
- [ ] Akce: add, edit, archive, attach, refresh, history
- [ ] Prázdný stav implementován
- [ ] Chybový stav implementován
- [ ] Export `render(root)` funkce
- [ ] Export `default { render }`

## ✅ Forms (Formuláře)

- [ ] `chooser.js` - Výběr typu subjektu
- [ ] `detail.js` - Read-only detail
- [ ] `form.js` - Editace/vytvoření

### chooser.js:

- [ ] Breadcrumb nastaven
- [ ] Grid s kartami typů subjektů
- [ ] Navigace na form s parametrem `?type=...`
- [ ] Export `render(root)`

### detail.js:

- [ ] Breadcrumb nastaven
- [ ] CommonActions: edit, attach, archive, history
- [ ] Načtení dat pomocí `getLandlord(id)`
- [ ] Sekce: Základní údaje, Kontaktní údaje, Adresa, Systém
- [ ] Podmíněné zobrazení polí podle typu subjektu
- [ ] Export `render(root, manifest, { query, userRole })`

### form.js:

- [ ] Breadcrumb nastaven
- [ ] CommonActions: save, archive, attach, history
- [ ] Načtení dat (edit mode) nebo inicializace (create mode)
- [ ] `renderForm()` použito
- [ ] Pole definována pomocí `getFieldsForType()`
- [ ] Podmíněné pole podle typu subjektu
- [ ] `onSubmit` handler implementován
- [ ] `upsertLandlord()` volána při uložení
- [ ] Navigace na detail po uložení
- [ ] Toast notifikace po uložení
- [ ] Unsaved helper aktivován (`setUnsavedChanges(true)`)
- [ ] AUDIT_FIELDS odstraněna před uložením
- [ ] Export `render(root, manifest, { query, userRole })`

## ✅ UI Integrace

- [ ] Breadcrumbs ve VŠECH views
- [ ] CommonActions ve VŠECH views
- [ ] Toast notifikace po akcích (success/error)
- [ ] Unsaved helper ve formulářích
- [ ] Loading stavy implementovány
- [ ] Prázdné stavy implementovány
- [ ] Chybové stavy implementovány

## ✅ Databáze

- [ ] Tabulka `subjects` existuje
- [ ] Tabulka `user_subjects` existuje
- [ ] Tabulka `subject_history` existuje (optional, pro historii)
- [ ] RLS policies nastaveny na `subjects`
- [ ] RLS policies nastaveny na `user_subjects`
- [ ] Indexy vytvořeny (typ_subjektu, role, display_name, ico, email, archived)
- [ ] Trigger `updated_at` funguje
- [ ] Constraints (NOT NULL, UNIQUE) nastaveny

## ✅ Oprávnění a bezpečnost

- [ ] RLS policies aktivní na všech tabulkách
- [ ] Oprávnění definována v `permissions.md`
- [ ] Input validace (frontend): required, type, pattern
- [ ] Input validace (backend): RLS, constraints
- [ ] XSS ochrana: escapování HTML (textContent vs innerHTML)
- [ ] Žádné secrets v kódu
- [ ] Role kontrola: admin, user, viewer

## ✅ Registrace a navigace

- [ ] Modul zaregistrován v `src/app/modules.index.js`
- [ ] Modul se zobrazuje v sidebaru
- [ ] Defaultní tile se otevírá po kliknutí na modul
- [ ] Navigace mezi tiles funguje
- [ ] Navigace mezi forms funguje
- [ ] Hash routing funguje (#/m/060-smlouva/t/prehled)

## ✅ Dokumentace

- [ ] `README.md` vytvořen/aktualizován
- [ ] `permissions.md` vyplněn
- [ ] `datovy-model.md` vyplněn
- [ ] `checklist.md` vyplněn (tento soubor)
- [ ] `AGENT-SPEC.md` vytvořen (kompletní specifikace)
- [ ] Komentáře v kódu (kde potřeba)
- [ ] JSDoc pro veřejné funkce (optional)

## ✅ Testování

### Manuální testy:

- [ ] Otevření modulu v sidebaru funguje
- [ ] Defaultní tile (prehled) se načte
- [ ] Všechny tiles jsou dostupné a funkční
- [ ] Vytvoření nového subjektu funguje (všechny typy)
- [ ] Editace subjektu funguje
- [ ] Archivace subjektu funguje
- [ ] Filtr "Zobrazit archivované" funguje
- [ ] Search funguje (v prehled.js)
- [ ] Row selection funguje
- [ ] Double click naviguje na detail
- [ ] Breadcrumbs správné na všech views
- [ ] CommonActions fungují na všech views
- [ ] Toast notifikace se zobrazují
- [ ] Unsaved helper varuje při odchodu z formuláře
- [ ] Žádné chyby v konzoli prohlížeče
- [ ] Prázdný stav se zobrazuje správně
- [ ] Chybový stav se zobrazuje správně

### Testovací scénáře:

- [ ] Scénář 1: Vytvoření nové fyzické osoby
- [ ] Scénář 2: Editace firmy
- [ ] Scénář 3: Archivace OSVČ
- [ ] Scénář 4: Vyhledávání v přehledu
- [ ] Scénář 5: Filtrování podle typu subjektu
- [ ] Scénář 6: Zobrazení archivovaných

### Role testy:

- [ ] Admin: Plný přístup funguje
- [ ] User: Čtení + editace vlastních dat funguje
- [ ] Viewer: Pouze čtení funguje

## ✅ Performance

- [ ] Načtení modulu < 500ms
- [ ] Načtení dat < 1s (< 100 záznamů)
- [ ] Render tabulky < 300ms
- [ ] Uložení formuláře < 2s

## ✅ Git a deployment

- [ ] Změny commitnuty
- [ ] Commit message popisná
- [ ] Branch vytvořen (pokud workflow vyžaduje)
- [ ] Pull Request vytvořen (pokud workflow vyžaduje)
- [ ] Code review proveden (pokud workflow vyžaduje)

## ✅ Závěrečná kontrola

- [ ] Všechny body výše jsou splněny
- [ ] Modul funguje bez chyb
- [ ] Dokumentace je kompletní
- [ ] Kód je čitelný a udržovatelný
- [ ] Bezpečnostní standardy jsou dodrženy
- [ ] Modul je připraven k nasazení

---

**Poznámka:** Tento checklist použij jako kontrolní seznam před dokončením modulu. Každý zaškrtnutý bod znamená, že daná část je implementována a otestována.
