# Checklist implementace - Modul 040 (Nemovitosti)

## ✅ Fáze 1: Příprava a konfigurace

### Základní struktura
- [x] Vytvořena složka `src/modules/040-nemovitost/`
- [x] Připraven `module.config.js` s manifestem
- [ ] Modul zaregistrován v `src/app/modules.index.js`
- [x] Vytvořeny složky: `tiles/`, `forms/`, `services/`, `assets/`
- [x] Připravena dokumentace: `README.md`, `datovy-model.md`, `checklist.md`, `permissions.md`

### Konfigurace modulu (module.config.js)
- [ ] ID: `040-nemovitost` ✓
- [ ] Title: `Nemovitosti` ✓
- [ ] Icon: `building` nebo `home` ✓
- [ ] defaultTile: `prehled` ✓
- [ ] Tiles definovány: `prehled`, `seznam` ✓
- [ ] Forms definovány: `edit`, `detail`, `jednotka-edit`, `jednotka-detail` ✓

---

## ✅ Fáze 2: Datová vrstva (Supabase)

### Database schema
- [ ] Vytvořena tabulka `properties` s všemi sloupci dle datového modelu
- [ ] Vytvořena tabulka `units` s všemi sloupci dle datového modelu
- [ ] Nastaveny indexy pro výkon (`idx_properties_typ`, `idx_units_stav`, atd.)
- [ ] Nastaveny Foreign Keys:
  - [ ] `properties.pronajimatel_id` → `subjects.id`
  - [ ] `units.nemovitost_id` → `properties.id`
  - [ ] `units.najemce_id` → `subjects.id`
- [ ] Implementovány RLS policies pro properties (read, create, update)
- [ ] Implementovány RLS policies pro units (read, create, update)
- [ ] Vytvořeny triggery pro `updated_at`
- [ ] Vytvořen trigger pro validaci typu nemovitosti při přidání jednotky
- [ ] Vytvořen view `properties_with_stats` pro agregovanou statistiku

### Services (services/db.js)
- [ ] Funkce `listProperties(filters)` - seznam nemovitostí s filtry
- [ ] Funkce `getProperty(id)` - detail nemovitosti
- [ ] Funkce `createProperty(data)` - vytvoření nemovitosti
- [ ] Funkce `updateProperty(id, data)` - úprava nemovitosti
- [ ] Funkce `archiveProperty(id)` - archivace nemovitosti
- [ ] Funkce `restoreProperty(id)` - obnovení z archivu
- [ ] Funkce `listUnits(propertyId, filters)` - seznam jednotek
- [ ] Funkce `getUnit(id)` - detail jednotky
- [ ] Funkce `createUnit(propertyId, data)` - vytvoření jednotky
- [ ] Funkce `updateUnit(id, data)` - úprava jednotky
- [ ] Funkce `archiveUnit(id)` - archivace jednotky
- [ ] Funkce `restoreUnit(id)` - obnovení jednotky z archivu
- [ ] Error handling pro všechny funkce

### Validace (services/validators.js)
- [ ] Validace PSČ (regex `^[0-9]{3}\s?[0-9]{2}$`)
- [ ] Validace roku výstavby (min 1800, max currentYear)
- [ ] Validace roku rekonstrukce (>= rok_vystavby)
- [ ] Validace plochy (> 0)
- [ ] Validace měsíčního nájmu (>= 0)
- [ ] Validace data konce nájmu (>= datum začátku)
- [ ] Normalizace pole `vybaveni` (vždy array)
- [ ] Sanitizace vstupů (XSS prevence)

### Utility (services/utils.js)
- [ ] `formatAddress(property)` - formátování adresy
- [ ] `formatArea(plocha)` - formátování plochy (m²)
- [ ] `formatPrice(price)` - formátování částky (Kč)
- [ ] `getPropertyIcon(typ)` - ikona podle typu
- [ ] `getUnitIcon(typ)` - ikona podle typu jednotky
- [ ] `getStavBadge(stav)` - badge komponenta pro stav
- [ ] `calculateTotalArea(units)` - celková plocha jednotek

---

## ✅ Fáze 3: UI - Tiles (Přehledy)

### tiles/prehled.js
- [ ] Import závislostí (`renderTable`, `renderCommonActions`, `setBreadcrumb`)
- [ ] Nastavení breadcrumbs:
  - [ ] Domů → Nemovitosti → Přehled
- [ ] Načtení dat pomocí `listProperties()`
- [ ] Načtení agregované statistiky (počet jednotek, volné, obsazené)
- [ ] Definice sloupců tabulky:
  - [ ] Typ (s ikonou a barevným badgem)
  - [ ] Název
  - [ ] Adresa (město, ulice)
  - [ ] Počet jednotek
  - [ ] Volné jednotky
  - [ ] Pronajímatel (s odkazem)
  - [ ] Archivován (Ano/Ne)
- [ ] Řazení sloupců (sortable)
- [ ] Double-click na řádek → navigace na detail
- [ ] Implementace CommonActions:
  - [ ] Přidat → navigace na formulář pro vytvoření
  - [ ] Upravit → navigace na formulář pro editaci (disabled pokud není vybrán řádek)
  - [ ] Detail → navigace na detail (disabled pokud není vybrán řádek)
  - [ ] Archivovat → archivace s potvrzením (disabled pokud není vybrán řádek)
  - [ ] Přílohy → modal s přílohami (disabled pokud není vybrán řádek)
  - [ ] Obnovit → zobrazit jen pokud je vybrán archivovaný záznam
  - [ ] Refresh → reload dat
- [ ] Checkbox "Zobrazit archivované"
- [ ] Prázdný stav: "Zatím nemáte žádné nemovitosti"
- [ ] Načítací stav (skeleton loader)
- [ ] Chybový stav (toast notifikace)

### tiles/seznam.js
- [ ] Podobně jako prehled.js, ale s možností filtrace podle typu nemovitosti
- [ ] Select box s typy: Všechny / Bytový dům / Rodinný dům / ...
- [ ] Select box s filtrem podle města
- [ ] Tlačítko "Vymazat filtry"

---

## ✅ Fáze 4: UI - Forms (Formuláře)

### forms/edit.js - Editace/Vytváření nemovitosti
- [ ] Import `renderUniversalForm` nebo custom form builder
- [ ] Nastavení breadcrumbs:
  - [ ] Domů → Nemovitosti → Nová nemovitost / Úprava nemovitosti
- [ ] Načtení dat (pokud editace): `getProperty(id)`
- [ ] Definice schema formuláře podle standardu (viz datovy-model.md):
  - [ ] **Sekce: Základní údaje**
    - [ ] Typ nemovitosti (select, povinné) - cards s ikonami při vytváření
    - [ ] Název (text, povinné)
    - [ ] Počet jednotek (number, min 0)
    - [ ] Pronajímatel (select z subjects, filtr type='pronajimatel')
    - [ ] Správce (text)
  - [ ] **Sekce: Adresa**
    - [ ] Ulice (text)
    - [ ] Číslo popisné (text)
    - [ ] Město (text)
    - [ ] PSČ (text s validací)
    - [ ] Stát (text, default "Česká republika")
  - [ ] **Sekce: Detaily**
    - [ ] Počet nadzemních podlaží (number)
    - [ ] Počet podzemních podlaží (number)
    - [ ] Rok výstavby (number, 1800-currentYear)
    - [ ] Rok rekonstrukce (number, 1800-currentYear)
  - [ ] **Sekce: Vybavení**
    - [ ] Checkboxy: Výtah, Parkování, Kolárna, Klimatizace, Zabezpečení, Bezbariérovost
  - [ ] **Sekce: Poznámka**
    - [ ] Poznámka (textarea)
- [ ] Tlačítka akcí:
  - [ ] Uložit (submit) - validace před odesláním
  - [ ] Zrušit (navigace zpět s potvrzením pokud jsou změny)
- [ ] Boční akce (pro existující záznamy):
  - [ ] Přílohy (modal)
  - [ ] Historie změn (modal)
  - [ ] Archivovat (s potvrzením)
- [ ] Validace na klientu před submit
- [ ] Dirty state tracking (varování při opuštění bez uložení)
- [ ] Úspěšné uložení → navigace na `showUnits(propertyId)` pokud počet_jednotek > 0, jinak na detail
- [ ] Chybová notifikace při selhání

### forms/detail.js - Detail nemovitosti (read-only)
- [ ] Import `renderUniversalForm` s `readOnly: true`
- [ ] Breadcrumbs: Domů → Nemovitosti → [Název nemovitosti]
- [ ] Načtení dat: `getProperty(id)`
- [ ] Zobrazení všech polí jako read-only
- [ ] Formátování hodnot:
  - [ ] Typ: s ikonou
  - [ ] Adresa: kompletní formátovaná
  - [ ] Vybavení: seznam s ikonami
  - [ ] Pronajímatel: odkaz na detail
- [ ] Info box s počtem jednotek a odkazem na správu jednotek
- [ ] Boční akce:
  - [ ] Upravit → navigace na edit.js
  - [ ] Jednotky → navigace na seznam jednotek
  - [ ] Přílohy → modal
  - [ ] Historie → modal
  - [ ] Archivovat / Obnovit
- [ ] Tlačítko Zpět

### forms/jednotka-edit.js - Editace/Vytváření jednotky
- [ ] Breadcrumbs: Domů → Nemovitosti → [Název nemovitosti] → Nová jednotka / Úprava jednotky
- [ ] Načtení dat nemovitosti: `getProperty(nemovitostId)`
- [ ] Načtení dat jednotky (pokud editace): `getUnit(id)`
- [ ] Info box: zobrazit název a adresu nemovitosti
- [ ] Definice schema formuláře:
  - [ ] **Sekce: Základní údaje**
    - [ ] Označení (text, povinné)
    - [ ] Typ jednotky (select, povinné)
    - [ ] Podlaží (text)
    - [ ] Plocha (number, povinné, > 0)
    - [ ] Dispozice (text)
    - [ ] Počet místností (number)
  - [ ] **Sekce: Stav a nájemní vztah**
    - [ ] Stav (select: volná/obsazená/rezervovaná/rekonstrukce, povinné)
    - [ ] Nájemce (select z subjects, filtr type='najemnik') - zobrazit pouze pokud stav != 'volna'
    - [ ] Nájemce (text fallback) - zobrazit pouze pokud stav != 'volna'
    - [ ] Měsíční nájem (number) - zobrazit pouze pokud stav == 'obsazena'
    - [ ] Datum začátku nájmu (date) - zobrazit pouze pokud stav == 'obsazena'
    - [ ] Datum konce nájmu (date) - zobrazit pouze pokud stav == 'obsazena'
  - [ ] **Sekce: Poznámka**
    - [ ] Poznámka (textarea)
- [ ] Dynamické zobrazení/skrytí polí podle stavu
- [ ] Validace
- [ ] Dirty state tracking
- [ ] Úspěšné uložení → navigace zpět na seznam jednotek nemovitosti
- [ ] Chybová notifikace

### forms/jednotka-detail.js - Detail jednotky (read-only)
- [ ] Breadcrumbs: Domů → Nemovitosti → [Název nemovitosti] → [Označení jednotky]
- [ ] Načtení dat: `getUnit(id)` + `getProperty(nemovitostId)`
- [ ] Info box: název a adresa nemovitosti s odkazem
- [ ] Zobrazení všech polí jako read-only
- [ ] Formátování:
  - [ ] Typ: s ikonou
  - [ ] Stav: badge s barvou
  - [ ] Plocha: "45,5 m²"
  - [ ] Nájem: "15 000 Kč / měsíc"
  - [ ] Nájemce: odkaz na detail (pokud je vyplněn)
- [ ] Boční akce:
  - [ ] Upravit
  - [ ] Přílohy
  - [ ] Historie
  - [ ] Archivovat / Obnovit
- [ ] Tlačítko Zpět (na seznam jednotek nemovitosti)

---

## ✅ Fáze 5: Správa jednotek (UI)

### Přehled jednotek nemovitosti
- [ ] Implementovat view `showUnits(propertyId)` (může být samostatný soubor nebo součást tiles)
- [ ] Info box: název, adresa, počet jednotek
- [ ] Tabulka jednotek:
  - [ ] Označení
  - [ ] Typ (s ikonou)
  - [ ] Podlaží
  - [ ] Plocha
  - [ ] Dispozice
  - [ ] Stav (badge)
  - [ ] Nájemce
  - [ ] Měsíční nájem
  - [ ] Akce (Upravit, Detail, Archivovat)
- [ ] CommonActions:
  - [ ] Přidat jednotku
  - [ ] Refresh
- [ ] Double-click → detail jednotky
- [ ] Filtr podle stavu (Všechny / Volné / Obsazené / ...)
- [ ] Checkbox "Zobrazit archivované"
- [ ] Prázdný stav: "Tato nemovitost zatím nemá žádné jednotky"

---

## ✅ Fáze 6: Integrace s dalšími moduly

### Modul 030 (Pronajímatel)
- [ ] V detailu pronajímatele zobrazit seznam jeho nemovitostí
- [ ] Odkaz z nemovitosti na detail pronajímatele

### Modul 050 (Nájemník)
- [ ] V detailu nájemníka zobrazit seznam jeho pronajatých jednotek
- [ ] Odkaz z jednotky na detail nájemce

### AttachmentSystem
- [ ] Inicializace pro entity `properties` a `units`
- [ ] Modal pro zobrazení příloh v detailu
- [ ] Počítadlo příloh v seznamu (volitelné)

### Router
- [ ] Registrace routes:
  - [ ] `#/m/040-nemovitost/t/prehled`
  - [ ] `#/m/040-nemovitost/t/seznam`
  - [ ] `#/m/040-nemovitost/f/edit?id=...`
  - [ ] `#/m/040-nemovitost/f/detail?id=...`
  - [ ] `#/m/040-nemovitost/f/jednotka-edit?propertyId=...&id=...`
  - [ ] `#/m/040-nemovitost/f/jednotka-detail?id=...`
  - [ ] `#/m/040-nemovitost/units?propertyId=...`

---

## ✅ Fáze 7: Pokročilé funkce

### Hromadné operace
- [ ] Hromadná archivace jednotek při archivaci nemovitosti (s potvrzením)
- [ ] Hromadné obnovení jednotek při obnovení nemovitosti (s nabídkou)
- [ ] Export do CSV/Excel (přehled nemovitostí i jednotek)

### Vyhledávání a filtry
- [ ] Fulltextové vyhledávání v názvu a adrese
- [ ] Pokročilé filtry:
  - [ ] Podle typu nemovitosti
  - [ ] Podle města
  - [ ] Podle pronajímatele
  - [ ] Podle roku výstavby (rozsah)
  - [ ] Podle počtu jednotek (rozsah)
  - [ ] Podle vybavení (multi-select)
- [ ] Uložení oblíbených filtrů

### Statistiky a reporty
- [ ] Dashboard widget: Celkový počet nemovitostí, jednotek, volných jednotek
- [ ] Graf obsazenosti podle typu nemovitosti
- [ ] Seznam nemovitostí s nejvíce volnými jednotkami
- [ ] Report: Příjmy z nájmů za období

### Notifikace
- [ ] Upozornění na blížící se konec nájemní smlouvy (30 dní předem)
- [ ] Upozornění na volné jednotky déle než X dní

---

## ✅ Fáze 8: Testování

### Jednotkové testy
- [ ] Test validačních funkcí (validators.js)
- [ ] Test utility funkcí (utils.js)
- [ ] Test formatovacích funkcí

### Integrační testy
- [ ] Test CRUD operací pro nemovitosti (db.js)
- [ ] Test CRUD operací pro jednotky (db.js)
- [ ] Test archivace a obnovy

### E2E testy
- [ ] Test flow: Vytvoření nemovitosti → Přidání jednotek → Úprava → Archivace
- [ ] Test flow: Přiřazení nájemce k jednotce
- [ ] Test validace formulářů
- [ ] Test navigace mezi pohledy

### Manuální testování
- [ ] Test na různých rozlišeních (desktop, tablet, mobil)
- [ ] Test s různými rolemi uživatelů
- [ ] Test s velkým počtem záznamů (výkon)
- [ ] Test edge cases (speciální znaky, velmi dlouhé názvy, atd.)

---

## ✅ Fáze 9: Dokumentace

### Uživatelská dokumentace
- [ ] Návod: Jak přidat nemovitost
- [ ] Návod: Jak spravovat jednotky
- [ ] Návod: Jak archivovat a obnovit záznamy
- [ ] FAQ: Nejčastější dotazy

### Technická dokumentace
- [x] README.md (přehled modulu)
- [x] datovy-model.md (kompletní schema)
- [x] checklist.md (tento soubor)
- [x] permissions.md (oprávnění)
- [ ] MIGRATION.md (postup migrace z localStorage)

---

## ✅ Fáze 10: Optimalizace a vylepšení

### Performance
- [ ] Lazy loading seznamů (virtualizace pro velké seznamy)
- [ ] Client-side caching s revalidací
- [ ] Optimistic updates pro lepší UX
- [ ] Debounce pro vyhledávání

### UX vylepšení
- [ ] Drag & drop pro třídění jednotek
- [ ] Inline editace v tabulkách (název, stav, nájem)
- [ ] Keyboard shortcuts (Ctrl+N pro novou nemovitost, atd.)
- [ ] Toast notifikace s progress barem

### Bezpečnost
- [ ] Input sanitization (XSS prevence)
- [ ] SQL injection prevence (Supabase RLS)
- [ ] Rate limiting pro API calls
- [ ] Audit log pro všechny změny

---

## ✅ Fáze 11: Deployment a monitoring

### Pre-deployment checklist
- [ ] Všechny testy prošly
- [ ] CodeQL security scan bez vulnerabilit
- [ ] Dokumentace aktuální
- [ ] Database migrations připraveny
- [ ] RLS policies nasazeny

### Post-deployment monitoring
- [ ] Sledování API latency
- [ ] Monitoring error rate
- [ ] User feedback collection
- [ ] Performance metrics (load time, render time)

---

## 📊 Celkový progress

### Aktuální stav: 🔴 Přípravná fáze
- Dokumentace: ✅ 100% (README, datovy-model, checklist, permissions)
- Konfigurace: ⏳ 50% (module.config připraven, ale ne zaregistrován)
- Database: ⏳ 0% (schema není vytvořeno)
- Services: ⏳ 0% (žádné funkce neimplementovány)
- UI Tiles: ⏳ 0% (prázdné soubory)
- UI Forms: ⏳ 0% (prázdné soubory)
- Testy: ⏳ 0% (žádné testy)

### Priorita úkolů
1. **HIGH**: Vytvoření database schema (Fáze 2)
2. **HIGH**: Implementace základních services funkcí (Fáze 2)
3. **HIGH**: Implementace tiles/prehled.js (Fáze 3)
4. **HIGH**: Implementace forms/edit.js a forms/detail.js (Fáze 4)
5. **MEDIUM**: Implementace správy jednotek (Fáze 5)
6. **MEDIUM**: Integrace s ostatními moduly (Fáze 6)
7. **LOW**: Pokročilé funkce (Fáze 7)
8. **LOW**: Optimalizace (Fáze 10)

---

## 🎯 Doporučený postup implementace

1. **Týden 1-2**: Fáze 2 (Database + Services)
2. **Týden 3-4**: Fáze 3-4 (UI Tiles + Forms pro nemovitosti)
3. **Týden 5**: Fáze 5 (Správa jednotek)
4. **Týden 6**: Fáze 6 (Integrace s ostatními moduly)
5. **Týden 7**: Fáze 8 (Testování)
6. **Týden 8**: Fáze 7, 10 (Pokročilé funkce + Optimalizace)

**Celková doba implementace: 6-8 týdnů**

---

## 📝 Poznámky

- Tento checklist vychází z detailní specifikace modulu nemovitosti.js (localStorage verze)
- Implementace přechází na Supabase backend
- Dodržuje standardy aplikace v5 (viz docs/STANDARDIZACNI-NAVOD.md)
- Využívá Universal Form Wrapper pro konzistentní formuláře
- Integruje se s existujícími moduly (030-pronajimatel, 050-najemnik)
