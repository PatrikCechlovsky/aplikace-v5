# Checklist implementace - Modul 070 (Služby)

Tento checklist slouží k systematické kontrole všech aspektů implementace modulu 070.

---

## 📋 1. Příprava databáze

### Migrace
- [ ] Spuštěna migrace 005 v Supabase
- [ ] Tabulka `service_definitions` existuje a má správnou strukturu
- [ ] Tabulka `contract_service_lines` existuje a má správnou strukturu
- [ ] View `contract_services_summary` existuje
- [ ] Funkce `calculate_monthly_cost` existuje
- [ ] Funkce `update_monthly_cost` existuje
- [ ] Trigger `update_updated_at_column` je aktivní

### Indexy
- [ ] Index na `service_definitions.kod` (UNIQUE)
- [ ] Index na `service_definitions.kategorie`
- [ ] Index na `service_definitions.aktivni`
- [ ] Index na `contract_service_lines.contract_id`
- [ ] Index na `contract_service_lines.service_definition_id`
- [ ] Index na `contract_service_lines.plati`
- [ ] Index na `contract_service_lines(od_data, do_data)`

### RLS Policies
- [ ] `service_definitions_select` - všichni mohou číst
- [ ] `service_definitions_insert` - pouze admin/manager
- [ ] `service_definitions_update` - pouze admin/manager
- [ ] `contract_service_lines_select` - všichni přihlášení
- [ ] `contract_service_lines_insert` - všichni přihlášení
- [ ] `contract_service_lines_update` - všichni přihlášení
- [ ] `contract_service_lines_delete` - všichni přihlášení

### Testovací data
- [ ] V katalogu jsou základní služby (VODA, ELEKTRINA, PLYN, INTERNET, atd.)
- [ ] Služby mají správné kategorie
- [ ] Služby mají správné typy účtování
- [ ] Základní ceny jsou vyplněny

---

## 📁 2. Struktura modulu

### Adresáře
- [ ] `/src/modules/070-sluzby/` existuje
- [ ] `/src/modules/070-sluzby/tiles/` existuje
- [ ] `/src/modules/070-sluzby/forms/` existuje
- [ ] `/src/modules/070-sluzby/assets/` existuje
- [ ] `/src/modules/070-sluzby/services/` existuje (volitelné)

### Povinné soubory
- [ ] `module.config.js` - manifest modulu
- [ ] `db.js` - databázové operace
- [ ] `meta.js` - metadata (volitelné)

---

## ⚙️ 3. Module config (module.config.js)

### Základní konfigurace
- [ ] `id` = '070-sluzby'
- [ ] `title` = 'Služby'
- [ ] `icon` = 'settings'
- [ ] `defaultTile` = 'prehled'

### Tiles
- [ ] `prehled` - Hlavní přehled (icon: 'list')
- [ ] `katalog` - Katalog služeb (icon: 'list_alt')
- [ ] `energie` - Energetické služby (icon: 'bolt')
- [ ] `voda` - Vodní služby (icon: 'water_drop')
- [ ] `internet` - Internet (icon: 'wifi')
- [ ] `spravne-poplatky` - Správní poplatky (icon: 'account_balance')
- [ ] `seznam` - Služby na smlouvách (icon: 'list')
- [ ] `nastaveni` - Nastavení (icon: 'settings')

### Forms
- [ ] `detail` - Detail služby (icon: 'visibility')
- [ ] `edit` - Editace/vytvoření (icon: 'edit')
- [ ] `pridat-do-smlouvy` - Přidání do smlouvy (icon: 'add_circle')

### Validace manifestu
- [ ] `defaultTile` existuje v `tiles`
- [ ] Všechna `id` jsou unikátní
- [ ] Všechny ikony jsou platné Material Icons
- [ ] `getManifest()` je async funkce

---

## 💾 4. Database vrstva (db.js)

### Service Definitions funkce
- [ ] `listServiceDefinitions(options)` - načte seznam služeb
- [ ] `getServiceDefinition(id)` - načte detail služby
- [ ] `createServiceDefinition(data)` - vytvoří novou službu
- [ ] `updateServiceDefinition(id, data)` - aktualizuje službu
- [ ] `deactivateServiceDefinition(id)` - deaktivuje službu

### Contract Service Lines funkce
- [ ] `listContractServices(contractId)` - služby na smlouvě
- [ ] `addServiceToContract(data)` - přidá službu ke smlouvě
- [ ] `updateContractService(id, data)` - aktualizuje službu na smlouvě
- [ ] `removeServiceFromContract(id)` - odstraní službu ze smlouvy
- [ ] `getContractServicesSummary(contractId)` - sumář nákladů

### Error handling
- [ ] Všechny funkce správně zpracovávají chyby
- [ ] Funkce vracejí `{ data, error }` strukturu
- [ ] Chyby jsou logovány do console

### Dokumentace
- [ ] Všechny funkce mají JSDoc komentáře
- [ ] Parametry jsou popsány
- [ ] Return typy jsou popsány

---

## 🎯 5. Tiles (Přehledy)

### tiles/prehled.js
- [ ] Soubor existuje a exportuje `render` funkci
- [ ] Nastavuje breadcrumb správně
- [ ] Zobrazuje CommonActions (add, edit, archive, refresh)
- [ ] Načítá data pomocí `listServiceDefinitions()`
- [ ] Zobrazuje tabulku pomocí `renderTable()`
- [ ] Implementuje `onRowClick` (výběr)
- [ ] Implementuje `onRowDblClick` (navigace na detail)
- [ ] Sloupce: kod, nazev, kategorie, typ_uctovani, zakladni_cena, jednotka, aktivni
- [ ] Má loading state
- [ ] Má empty state
- [ ] Má error state
- [ ] Filtry fungují správně

### tiles/katalog.js
- [ ] Podobná implementace jako prehled
- [ ] Zobrazuje i neaktivní služby

### tiles/energie.js
- [ ] Filtruje služby podle `kategorie = 'energie'`
- [ ] Správně zobrazuje breadcrumb
- [ ] CommonActions fungují

### tiles/voda.js
- [ ] Filtruje služby podle `kategorie = 'voda'`
- [ ] Správně zobrazuje breadcrumb
- [ ] CommonActions fungují

### tiles/internet.js
- [ ] Filtruje služby podle `kategorie = 'internet'`
- [ ] Správně zobrazuje breadcrumb
- [ ] CommonActions fungují

### tiles/spravne-poplatky.js
- [ ] Filtruje služby podle `kategorie = 'spravne_poplatky'`
- [ ] Správně zobrazuje breadcrumb
- [ ] CommonActions fungují

### tiles/seznam.js
- [ ] Zobrazuje služby na smlouvách
- [ ] Sloupce: contract_cislo, nazev, plati, cena_za_jednotku, odhadovane_mesicni_naklady, od_data, do_data
- [ ] Implementuje navigaci na detail smlouvy

### tiles/nastaveni.js
- [ ] Zobrazuje nastavení modulu
- [ ] Umožňuje konfiguraci (pokud implementováno)

---

## 📝 6. Forms (Formuláře)

### forms/detail.js
- [ ] Soubor existuje a exportuje `render` funkci
- [ ] Načítá data pomocí `getServiceDefinition(id)`
- [ ] Nastavuje breadcrumb s názvem služby
- [ ] Zobrazuje CommonActions (edit, archive, history, refresh)
- [ ] Zobrazuje všechna pole (read-only)
- [ ] Sekce: Základní údaje, Účtování, Stav, Systémové údaje
- [ ] Formátuje data správně
- [ ] Má error state při nenalezení

### forms/edit.js
- [ ] Soubor existuje a exportuje `render` funkci
- [ ] Rozlišuje CREATE vs UPDATE režim
- [ ] Načítá data při editaci pomocí `getServiceDefinition(id)`
- [ ] Nastavuje breadcrumb správně
- [ ] Zobrazuje CommonActions (save, archive, history)
- [ ] Používá `renderForm()` nebo vlastní implementaci
- [ ] Všechna pole jsou správně definována (viz specifikace)
- [ ] Validace polí funguje:
  - [ ] `kod` - povinné, unikátní, regex
  - [ ] `nazev` - povinné, min 2 znaky
  - [ ] `kategorie` - povinné, z enum
  - [ ] `typ_uctovani` - povinné, z enum
  - [ ] `zakladni_cena` - >= 0
  - [ ] `sazba_dph` - 0 <= x <= 1
- [ ] `onSubmit` handler ukládá data
- [ ] Navigace po úspěšném uložení
- [ ] Toast notifikace fungují
- [ ] Error handling funguje

### forms/pridat-do-smlouvy.js
- [ ] Soubor existuje a exportuje `render` funkci
- [ ] Parametr `contract_id` je zpracován
- [ ] Načítá katalog služeb pro select
- [ ] Pole pro výběr služby z katalogu
- [ ] Pole pro custom název
- [ ] Pole pro `plati` (najemnik/pronajimatel/sdilene)
- [ ] Pole pro `cena_za_jednotku`
- [ ] Pole pro `zaklad_pro_vypocet`
- [ ] Pole pro `perioda_fakturace`
- [ ] Pole pro `od_data` a `do_data`
- [ ] Při výběru z katalogu se předvyplní údaje
- [ ] Validace funguje
- [ ] Uložení pomocí `addServiceToContract()`
- [ ] Toast notifikace

---

## 🔐 7. Oprávnění a bezpečnost

### Role-based access
- [ ] Admin má plný přístup ke všemu
- [ ] Manager má plný přístup ke všemu
- [ ] User může číst katalog, ale ne upravovat
- [ ] User může upravovat služby na vlastních smlouvách
- [ ] Readonly může pouze číst

### UI podle role
- [ ] CommonActions zobrazují správné akce podle role
- [ ] Tlačítka "Přidat/Upravit" jsou skrytá pro user/readonly v katalogu
- [ ] Forms kontrolují oprávnění před zobrazením editace
- [ ] Chybové hlášky při nedostatečných oprávněních

### RLS testování
- [ ] Admin může vše
- [ ] Manager může vše
- [ ] User nemůže upravovat katalog
- [ ] User může upravovat služby na vlastních smlouvách
- [ ] Readonly nemůže nic upravovat

---

## 🎨 8. UI komponenty

### Breadcrumb
- [ ] Všechny tiles mají breadcrumb
- [ ] Všechny forms mají breadcrumb
- [ ] Breadcrumb obsahuje navigační odkazy
- [ ] Ikony jsou správné

### CommonActions
- [ ] Všechny tiles mají CommonActions
- [ ] Všechny forms mají CommonActions
- [ ] Akce odpovídají kontextu
- [ ] Handlery fungují správně
- [ ] Akce jsou filtrovány podle role

### Tabulky
- [ ] Používají `renderTable()` nebo vlastní implementaci
- [ ] Sloupce jsou správně definovány
- [ ] Řazení funguje
- [ ] Výběr řádku funguje
- [ ] Double-click navigace funguje

### Formuláře
- [ ] Používají `renderForm()` nebo vlastní implementaci
- [ ] Všechna pole jsou správně definována
- [ ] Validace funguje
- [ ] Error messages jsou zobrazovány
- [ ] Success messages po uložení

### Toast notifikace
- [ ] Success notifikace po uložení
- [ ] Error notifikace při chybách
- [ ] Warning notifikace při upozorněních
- [ ] Info notifikace při informacích

---

## 🔄 9. Navigace a integrace

### Registrace modulu
- [ ] Modul je zaregistrován v `src/app/modules.index.js`
- [ ] Import cesta je správná
- [ ] Modul se zobrazuje v sidebaru
- [ ] Kliknutí na modul otevře defaultTile

### Navigace mezi tiles
- [ ] Navigace mezi tiles funguje
- [ ] URL hash se správně mění
- [ ] History funguje (back/forward)

### Navigace mezi forms
- [ ] Navigace z tile na form funguje
- [ ] Navigace z formu zpět na tile funguje
- [ ] Query parametry jsou zpracovány

### Integrace s modulem 060 (Smlouvy)
- [ ] Lze přidat službu ze smlouvy
- [ ] Služby se zobrazují v detailu smlouvy
- [ ] Výpočet nákladů funguje
- [ ] Odstranění služby funguje

### Integrace s modulem 080 (Platby)
- [ ] Služby ovlivňují výpočet platby (pokud implementováno)

---

## ✅ 10. Validace a chybové stavy

### Loading states
- [ ] Všechny tiles zobrazují spinner při načítání
- [ ] Všechny forms zobrazují loading při načítání dat

### Empty states
- [ ] Prázdný katalog má smysluplnou hlášku
- [ ] Tlačítko "Přidat první službu" funguje
- [ ] Ikona a text jsou přívětivé

### Error states
- [ ] Chyby při načítání zobrazují error message
- [ ] Tlačítko "Zkusit znovu" funguje
- [ ] Chyby při ukládání zobrazují toast
- [ ] 404 při neexistující službě

### Validační pravidla
- [ ] Povinná pole jsou označena
- [ ] Validační chyby se zobrazují u polí
- [ ] Formulář nelze odeslat s nevalidními daty
- [ ] Server-side validace je zpracována

---

## 🧪 11. Testování

### Funkční testy

#### Test 1: Základní navigace
- [ ] Otevření modulu ze sidebaru
- [ ] Zobrazení defaultního tile (prehled)
- [ ] Navigace mezi tiles
- [ ] Navigace na detail služby
- [ ] Navigace zpět

#### Test 2: CRUD operace - katalog
- [ ] Vytvoření nové služby (admin/manager)
- [ ] Úprava služby (admin/manager)
- [ ] Deaktivace služby (admin/manager)
- [ ] Zobrazení detailu služby (všichni)
- [ ] Pokus o vytvoření duplicitního kódu (chyba)

#### Test 3: CRUD operace - služby na smlouvách
- [ ] Přidání služby ze smlouvy
- [ ] Úprava služby na smlouvě
- [ ] Odstranění služby ze smlouvy
- [ ] Výpočet měsíčních nákladů je správný

#### Test 4: Filtry
- [ ] Filtr podle kategorie (energie)
- [ ] Filtr podle kategorie (voda)
- [ ] Filtr podle kategorie (internet)
- [ ] Filtr podle aktivity

#### Test 5: Oprávnění
- [ ] Admin vidí všechny akce
- [ ] Manager vidí všechny akce
- [ ] User nevidí edit/delete v katalogu
- [ ] Readonly vidí pouze refresh

#### Test 6: Výpočty
- [ ] Měsíční výpočet (perioda = mesicni)
- [ ] Čtvrtletní výpočet (perioda = ctvrtletni)
- [ ] Roční výpočet (perioda = rocni)
- [ ] Sumář nákladů na smlouvě

### Performance testy
- [ ] Načítání katalogu je rychlé (< 1s)
- [ ] Načítání detailu je rychlé (< 500ms)
- [ ] Tabulka zvládá 100+ záznamů
- [ ] Žádné memory leaky

### Kompatibilita
- [ ] Funguje v Chrome
- [ ] Funguje v Firefox
- [ ] Funguje v Safari
- [ ] Responzivní design (mobil/tablet)

---

## 📚 12. Dokumentace

### Kód
- [ ] Všechny funkce mají JSDoc komentáře
- [ ] Složité části mají inline komentáře
- [ ] Konstanty jsou popsány
- [ ] TODO komentáře pro budoucí práci

### Markdown soubory
- [ ] README.md je kompletní a aktuální
- [ ] datovy-model.md popisuje tabulky
- [ ] permissions.md popisuje oprávnění
- [ ] checklist.md je aktuální
- [ ] SPECIFIKACE-PRO-AGENTA.md je kompletní

### Příklady
- [ ] Ukázkové JSON pro service_definitions
- [ ] Ukázkové JSON pro contract_service_lines
- [ ] Ukázkové SQL dotazy

---

## 🚀 13. Před mergem do main

### Code review
- [ ] Kód je čitelný a konzistentní
- [ ] Žádné console.log v produkčním kódu
- [ ] Žádné hardcodované hodnoty
- [ ] Žádné TODO bez komentáře

### Git
- [ ] Všechny změny jsou commitnuty
- [ ] Commit messages jsou popisné
- [ ] Branch je aktuální s main
- [ ] Žádné merge konflikty

### Cleanup
- [ ] Žádné nepoužívané soubory
- [ ] Žádné nepoužívané importy
- [ ] Žádné commented-out kód
- [ ] Formátování je konzistentní

### Final check
- [ ] Modul funguje end-to-end
- [ ] Žádné console errors
- [ ] Žádné 404 errors v network
- [ ] RLS policies fungují správně
- [ ] Všechny testy prošly

---

## ✨ 14. Nice-to-have (volitelné)

- [ ] Export dat do CSV/Excel
- [ ] Import služeb z CSV
- [ ] Hromadné operace (aktivace/deaktivace)
- [ ] Pokročilé filtry (fulltextové vyhledávání)
- [ ] Kopírování služeb mezi smlouvami
- [ ] Šablony sad služeb
- [ ] Grafy a statistiky
- [ ] Upozornění na změny cen
- [ ] Historie verzování služeb

---

**Poznámka:** Tento checklist slouží jako kompletní návod. Nemusí být všechny položky implementovány najednou - můžete začít s MVP (Minimum Viable Product) a postupně rozšiřovat funkcionalitu.

---

**Konec checklistu - Modul 070** ✅
