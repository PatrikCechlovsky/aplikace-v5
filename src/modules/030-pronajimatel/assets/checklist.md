# Checklist implementace - Modul 030 (Pronajímatel)

## ✅ Fáze 1: Příprava a konfigurace

### Základní struktura
- [x] Vytvořena složka `src/modules/030-pronajimatel/`
- [x] Připraven `module.config.js` s manifestem
- [x] Modul zaregistrován v `src/app/modules.index.js`
- [x] Vytvořeny složky: `tiles/`, `forms/`, `assets/`
- [x] Připravena dokumentace: `README.md`, `datovy-model.md`, `checklist.md`, `permissions.md`, `AGENT-SPECIFIKACE.md`

### Konfigurace modulu (module.config.js)
- [x] ID: `030-pronajimatel` ✓
- [x] Title: `Pronajímatel` ✓
- [x] Icon: `home` ✓
- [x] defaultTile: `prehled` ✓
- [x] Tiles definovány s dynamickým načítáním typů ✓
- [x] Forms definovány: `chooser`, `detail`, `form`, `subject-type` ✓

---

## ✅ Fáze 2: Datová vrstva (Supabase)

### Database schema
- [x] Vytvořena tabulka `subjects` s všemi sloupci dle datového modelu
- [x] Vytvořena tabulka `subject_types` pro konfiguraci typů
- [x] Nastaveny indexy pro výkon
- [x] Nastaveny Foreign Keys:
  - [x] `subjects.zastupuje_id` → `subjects.id`
  - [x] `subjects.created_by` → `auth.users.id`
  - [x] `subjects.updated_by` → `auth.users.id`
- [x] Implementovány RLS policies pro subjects (read, create, update, delete)
- [x] Vytvořeny triggery pro `updated_at`
- [x] Vytvořen trigger pro automatickou aktualizaci `display_name`
- [x] Naplněna tabulka `subject_types` výchozími hodnotami

### Services (db.js)
- [x] Proxy na `/src/db/subjects.js` s defaultní rolí 'pronajimatel'
- [ ] Funkce `listSubjects(filters)` - implementováno v `/src/db/subjects.js`
- [ ] Funkce `getSubject(id)` - implementováno v `/src/db/subjects.js`
- [ ] Funkce `upsertSubject(data)` - implementováno v `/src/db/subjects.js`
- [ ] Funkce `archiveSubject(id)` - implementováno v `/src/db/subjects.js`
- [ ] Funkce `unarchiveSubject(id)` - implementováno v `/src/db/subjects.js`
- [ ] Error handling pro všechny funkce

### Type schemas
- [x] Definovány schéma polí v `/src/lib/type-schemas/subjects.js`:
  - [x] Schema pro typ 'osoba'
  - [x] Schema pro typ 'osvc'
  - [x] Schema pro typ 'firma'
  - [x] Schema pro typ 'spolek'
  - [x] Schema pro typ 'stat'
  - [x] Schema pro typ 'zastupce'

---

## ✅ Fáze 3: UI - Tiles (Přehledy)

### tiles/prehled.js
- [ ] Import závislostí (`renderTable`, `renderCommonActions`, `setBreadcrumb`)
- [ ] Nastavení breadcrumbs: Domů → Pronajímatel → Přehled
- [ ] Načtení dat pomocí `listSubjects({ role: 'pronajimatel' })`
- [ ] Definice sloupců tabulky:
  - [ ] Typ (s ikonou a emoji)
  - [ ] Název / Jméno
  - [ ] IČO
  - [ ] Telefon
  - [ ] Email
  - [ ] Město
  - [ ] Archivován (Ano/Ne)
- [ ] Řazení sloupců (sortable pro typ)
- [ ] Double-click na řádek → navigace na detail
- [ ] Implementace CommonActions:
  - [ ] Přidat → navigace na chooser
  - [ ] Upravit → navigace na form s id (disabled pokud není vybrán řádek)
  - [ ] Archivovat/Obnovit → archivace s potvrzením (disabled pokud není vybrán řádek)
  - [ ] Přílohy → modal s přílohami (disabled pokud není vybrán řádek)
  - [ ] Refresh → reload dat
  - [ ] Historie → modal s historií změn (disabled pokud není vybrán řádek)
- [ ] Checkbox "Zobrazit archivované"
- [ ] Prázdný stav: "Zatím nemáte žádné pronajímatele"
- [ ] Načítací stav (spinner)
- [ ] Chybový stav (toast notifikace)

### tiles/osoba.js
- [ ] Filtr: `type: 'osoba'`
- [ ] Breadcrumbs: Domů → Pronajímatel → Osoby
- [ ] Sloupce: display_name, primary_email, primary_phone, city
- [ ] CommonActions (stejné jako prehled.js)
- [ ] Checkbox "Zobrazit archivované"

### tiles/osvc.js
- [ ] Filtr: `type: 'osvc'`
- [ ] Breadcrumbs: Domů → Pronajímatel → OSVČ
- [ ] Sloupce: display_name, ico, primary_email, primary_phone
- [ ] CommonActions
- [ ] Checkbox "Zobrazit archivované"

### tiles/firma.js
- [ ] Filtr: `type: 'firma'`
- [ ] Breadcrumbs: Domů → Pronajímatel → Firmy
- [ ] Sloupce: display_name, ico, primary_email, primary_phone, city
- [ ] CommonActions
- [ ] Checkbox "Zobrazit archivované"

### tiles/spolek.js
- [ ] Filtr: `type: 'spolek'`
- [ ] Breadcrumbs: Domů → Pronajímatel → Spolky
- [ ] Sloupce: display_name, primary_email, primary_phone
- [ ] CommonActions
- [ ] Checkbox "Zobrazit archivované"

### tiles/stat.js
- [ ] Filtr: `type: 'stat'`
- [ ] Breadcrumbs: Domů → Pronajímatel → Státní instituce
- [ ] Sloupce: display_name, primary_email, city
- [ ] CommonActions
- [ ] Checkbox "Zobrazit archivované"

### tiles/zastupce.js
- [ ] Filtr: `type: 'zastupce'`
- [ ] Breadcrumbs: Domů → Pronajímatel → Zástupci
- [ ] Sloupce: display_name, zastupuje_id (s odkazem), primary_email, primary_phone
- [ ] CommonActions
- [ ] Checkbox "Zobrazit archivované"

---

## ✅ Fáze 4: UI - Forms (Formuláře)

### forms/chooser.js - Výběr typu subjektu
- [ ] Breadcrumbs: Domů → Pronajímatel → Nový subjekt
- [ ] Načtení typů z `subject_types` tabulky
- [ ] Zobrazení karet (cards) s typy:
  - [ ] Osoba 👤
  - [ ] OSVČ 💼
  - [ ] Firma 🏢
  - [ ] Spolek 👥
  - [ ] Státní instituce 🏛️
  - [ ] Zástupce 🤝
- [ ] Kliknutí na kartu → navigace na `form.js` s parametrem `type`
- [ ] Responsivní layout (3 karty na řádek na desktop)

### forms/detail.js - Detail pronajímatele (read-only)
- [ ] Breadcrumbs: Domů → Pronajímatel → [Název subjektu]
- [ ] Načtení dat: `getSubject(id)`
- [ ] Načtení správného schema podle typu z `TYPE_SCHEMAS`
- [ ] Zobrazení všech polí jako read-only
- [ ] Formátování hodnot:
  - [ ] Typ: s ikonou a emoji
  - [ ] Adresa: kompletní formátovaná
  - [ ] Email: jako odkaz
  - [ ] Telefon: jako odkaz
  - [ ] Bankovní účty: seznam (pokud jsou)
  - [ ] Kontaktní osoba: formátovaná (pokud je)
- [ ] Boční akce:
  - [ ] Upravit → navigace na form.js
  - [ ] Přílohy → modal
  - [ ] Historie → modal
  - [ ] Archivovat / Obnovit
- [ ] Tlačítko Zpět
- [ ] Info box s počtem nemovitostí (pokud má nemovitosti)

### forms/form.js - Vytvoření/Úprava pronajímatele
- [ ] Breadcrumbs: Domů → Pronajímatel → Nový subjekt / [Název]
- [ ] Detekce režimu: vytvoření (má `type`, nemá `id`) vs úprava (má `id`)
- [ ] Načtení dat (pokud úprava): `getSubject(id)`
- [ ] Načtení správného schema podle typu z `TYPE_SCHEMAS`
- [ ] Renderování formuláře pomocí `renderForm`
- [ ] Dynamické sekce podle typu:
  - [ ] Osoba: Jméno, příjmení, tituly, doklad, datum narození
  - [ ] OSVČ: Jméno/Firma, IČO, DIČ, tlačítko ARES
  - [ ] Firma: Název, IČO, DIČ, tlačítko ARES, kontaktní osoba
  - [ ] Spolek: Název, volitelně IČO
  - [ ] Stat: Název organizace, kontakty
  - [ ] Zástupce: Jméno, příjmení, zastupuje koho (select)
- [ ] Validace na klientu:
  - [ ] display_name povinné
  - [ ] primary_email povinné + validní formát
  - [ ] ico validace formátu (8 číslic)
  - [ ] zip validace PSČ
  - [ ] datum_narozeni nesmí být v budoucnosti
- [ ] ARES integrace (pro typy s IČO):
  - [ ] Tlačítko "Načíst z ARES" u pole IČO
  - [ ] Automatické vyplnění: display_name, dic, adresa
- [ ] Tlačítka akcí:
  - [ ] Uložit (submit) - validace před odesláním
  - [ ] Zrušit (navigace zpět s potvrzením pokud jsou změny)
- [ ] Dirty state tracking (varování při opuštění bez uložení)
- [ ] Úspěšné uložení → toast + navigace na detail
- [ ] Chybová notifikace při selhání
- [ ] Loading state při ukládání

---

## ✅ Fáze 5: Integrace s dalšími moduly

### Modul 040 (Nemovitost)
- [ ] V detailu pronajímatele zobrazit seznam jeho nemovitostí
- [ ] Odkaz z nemovitosti na detail pronajímatele

### Modul 060 (Smlouva)
- [ ] V detailu pronajímatele zobrazit seznam smluv
- [ ] Možnost vytvoření nové smlouvy s pronajímatelem

### AttachmentSystem
- [ ] Inicializace pro entity `subjects`
- [ ] Modal pro zobrazení příloh v detailu
- [ ] Počítadlo příloh v seznamu (volitelné)

### HistoryModal
- [ ] Modal pro zobrazení historie změn
- [ ] Integrace s audit_log tabulkou

### Router
- [ ] Registrace routes:
  - [ ] `#/m/030-pronajimatel/t/prehled`
  - [ ] `#/m/030-pronajimatel/t/osoba`
  - [ ] `#/m/030-pronajimatel/t/osvc`
  - [ ] `#/m/030-pronajimatel/t/firma`
  - [ ] `#/m/030-pronajimatel/t/spolek`
  - [ ] `#/m/030-pronajimatel/t/stat`
  - [ ] `#/m/030-pronajimatel/t/zastupce`
  - [ ] `#/m/030-pronajimatel/f/chooser`
  - [ ] `#/m/030-pronajimatel/f/detail?id=...`
  - [ ] `#/m/030-pronajimatel/f/form?id=...&type=...`

---

## ✅ Fáze 6: Pokročilé funkce

### ARES integrace
- [ ] API call na ARES endpoint
- [ ] Parsing ARES response
- [ ] Mapování na subject fields
- [ ] Error handling (IČO nenalezeno, API nedostupné)
- [ ] Loading state při načítání

### Hromadné operace
- [ ] Hromadná archivace pronajímatelů
- [ ] Export do CSV/Excel
- [ ] Import z CSV

### Vyhledávání a filtry
- [ ] Fulltextové vyhledávání v názvu a adrese
- [ ] Pokročilé filtry:
  - [ ] Podle typu subjektu
  - [ ] Podle města
  - [ ] Podle IČO
  - [ ] Podle způsobu komunikace
- [ ] Uložení oblíbených filtrů

### Statistiky a reporty
- [ ] Dashboard widget: Celkový počet pronajímatelů podle typu
- [ ] Seznam pronajímatelů s nejvíce nemovitostmi
- [ ] Seznam pronajímatelů bez nemovitostí

---

## ✅ Fáze 7: Validace a utils

### Validační funkce
- [ ] `isValidEmail(email)` - validace email formátu
- [ ] `isValidICO(ico)` - validace IČO (8 číslic)
- [ ] `isValidDIC(dic)` - validace DIČ
- [ ] `isValidPSC(psc)` - validace PSČ
- [ ] `isValidPhone(phone)` - validace telefonního čísla
- [ ] `sanitizeInput(value)` - sanitizace vstupů (XSS prevence)

### Utility funkce
- [ ] `formatAddress(subject)` - formátování adresy
- [ ] `formatPhone(phone)` - formátování telefonu
- [ ] `getTypeLabel(type)` - název typu subjektu
- [ ] `getTypeIcon(type)` - ikona typu subjektu
- [ ] `formatBankAccount(iban)` - formátování IBAN

---

## ✅ Fáze 8: Testování

### Jednotkové testy
- [ ] Test validačních funkcí (validators.test.js)
- [ ] Test utility funkcí (utils.test.js)
- [ ] Test formatovacích funkcí

### Integrační testy
- [ ] Test CRUD operací pro subjekty (db.test.js)
- [ ] Test archivace a obnovy
- [ ] Test filtrování podle typu a role

### E2E testy
- [ ] Test flow: Výběr typu → Vyplnění formuláře → Uložení → Zobrazení v seznamu
- [ ] Test flow: Úprava subjektu
- [ ] Test flow: Archivace a obnovení
- [ ] Test flow: ARES integrace
- [ ] Test validace formulářů
- [ ] Test navigace mezi pohledy

### Manuální testování
- [ ] Test na různých rozlišeních (desktop, tablet, mobil)
- [ ] Test s různými rolemi uživatelů
- [ ] Test s velkým počtem záznamů (výkon)
- [ ] Test edge cases (speciální znaky, velmi dlouhé názvy, atd.)
- [ ] Test ARES integrace s reálnými IČO

---

## ✅ Fáze 9: Dokumentace

### Uživatelská dokumentace
- [ ] Návod: Jak přidat pronajímatele
- [ ] Návod: Jak použít ARES
- [ ] Návod: Jak spravovat bankovní účty
- [ ] FAQ: Nejčastější dotazy

### Technická dokumentace
- [x] README.md (přehled modulu)
- [x] datovy-model.md (kompletní schema)
- [x] checklist.md (tento soubor)
- [x] permissions.md (oprávnění)
- [x] AGENT-SPECIFIKACE.md (kompletní specifikace pro agenta)

---

## ✅ Fáze 10: Optimalizace a vylepšení

### Performance
- [ ] Lazy loading seznamů (virtualizace pro velké seznamy)
- [ ] Client-side caching s revalidací
- [ ] Optimistic updates pro lepší UX
- [ ] Debounce pro vyhledávání

### UX vylepšení
- [ ] Keyboard shortcuts (Ctrl+N pro nový subjekt, atd.)
- [ ] Toast notifikace s progress barem
- [ ] Autocomplete pro města a ulice
- [ ] Historie nedávno zobrazených subjektů

### Bezpečnost
- [ ] Input sanitization (XSS prevence) ✓
- [ ] SQL injection prevence (Supabase RLS) ✓
- [ ] Rate limiting pro ARES API calls
- [ ] Audit log pro všechny změny ✓

---

## ✅ Fáze 11: Deployment a monitoring

### Pre-deployment checklist
- [ ] Všechny testy prošly
- [ ] CodeQL security scan bez vulnerabilit
- [ ] Dokumentace aktuální
- [ ] Database migrations připraveny a otestovány
- [ ] RLS policies nasazeny
- [ ] Seed data pro subject_types připravena

### Post-deployment monitoring
- [ ] Sledování API latency
- [ ] Monitoring error rate
- [ ] User feedback collection
- [ ] Performance metrics (load time, render time)
- [ ] ARES API usage monitoring

---

## 📊 Celkový progress

### Aktuální stav: 🟡 Částečně implementováno

- **Dokumentace**: ✅ 100% (README, datovy-model, checklist, permissions, AGENT-SPECIFIKACE)
- **Konfigurace**: ✅ 100% (module.config, db.js proxy)
- **Database**: ✅ 100% (schema, RLS, triggers)
- **Type schemas**: ✅ 100% (všechny typy definovány)
- **Services**: 🟡 50% (proxy hotovo, implementace v /src/db/subjects.js)
- **UI Tiles**: ⏳ 0% (žádný tile implementován)
- **UI Forms**: ⏳ 0% (žádný form implementován)
- **Validace**: ⏳ 0% (není implementována)
- **Testy**: ⏳ 0% (žádné testy)
- **Integrace**: ⏳ 0% (AttachmentSystem, HistoryModal)

### Priorita úkolů

1. **HIGH**: Implementace tiles/prehled.js (Fáze 3)
2. **HIGH**: Implementace forms/chooser.js a forms/form.js (Fáze 4)
3. **HIGH**: Implementace forms/detail.js (Fáze 4)
4. **MEDIUM**: Implementace ostatních tiles (osoba, osvc, firma, atd.) (Fáze 3)
5. **MEDIUM**: Implementace validačních funkcí (Fáze 7)
6. **MEDIUM**: Integrace s AttachmentSystem a HistoryModal (Fáze 5)
7. **LOW**: ARES integrace (Fáze 6)
8. **LOW**: Pokročilé funkce (Fáze 6)
9. **LOW**: Optimalizace (Fáze 10)

---

## 🎯 Doporučený postup implementace

### Sprint 1 (Týden 1-2): Základní funkčnost
1. Implementace tiles/prehled.js
2. Implementace forms/chooser.js
3. Implementace forms/form.js (základní verze bez ARES)
4. Implementace forms/detail.js
5. Základní validace
6. Testování základního flow

### Sprint 2 (Týden 3): Rozšíření
1. Implementace zbývajících tiles (osoba, osvc, firma, atd.)
2. Integrace s AttachmentSystem
3. Integrace s HistoryModal
4. Rozšířená validace

### Sprint 3 (Týden 4): Pokročilé funkce
1. ARES integrace
2. Hromadné operace
3. Export/Import
4. E2E testy

### Sprint 4 (Týden 5): Finalizace
1. Optimalizace výkonu
2. UX vylepšení
3. Dokumentace
4. Code review a security scan

**Celková doba implementace: 4-5 týdnů**

---

## 📝 Poznámky

- Modul 030 sdílí datovou strukturu s modulem 050 (Nájemník)
- Implementace by měla být koordinována s modulem 050
- ARES integrace je volitelná funkce, může být implementována později
- Dodržovat standardy aplikace v5 (viz `/NEW/10-CHECKLIST-PRAVIDLA.md`)
- Používat Universal Form Wrapper pro konzistentní formuláře
- Veškeré změny logovat do audit_log

---

## 🔗 Reference

- **Agent specifikace**: `./AGENT-SPECIFIKACE.md` - kompletní detailní specifikace
- **Datový model**: `./datovy-model.md` - database schema
- **Oprávnění**: `./permissions.md` - RLS a oprávnění
- **Pravidla aplikace**: `/NEW/10-CHECKLIST-PRAVIDLA.md`
- **Šablona modulu**: `/NEW/08-SABLONA-MODULU.md`
- **Type schemas**: `/src/lib/type-schemas/subjects.js`
- **Database migrations**: `/docs/tasks/supabase-migrations/003_add_subjects_missing_fields.sql`
