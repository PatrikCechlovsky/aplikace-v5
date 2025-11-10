# Modul 030 - Pronajímatel

**Verze:** 2.0 (pro aplikaci v5)  
**Stav:** Částečně implementováno - infrastruktura připravena, UI komponenty ve vývoji

---

## 📖 Účel modulu

Modul **030-pronajimatel** spravuje subjekty v roli pronajímatele (vlastníků nemovitostí). Subjekty mohou být různých typů od fyzických osob po firmy a státní instituce.

### Hlavní funkce

- **CRUD operace** - Vytváření, úprava, zobrazení a archivace pronajímatelů
- **Správa typů subjektů** - Osoba, OSVČ, Firma, Spolek, Státní instituce, Zástupce
- **ARES integrace** - Automatické načítání údajů firem podle IČO
- **Vazby na nemovitosti** - Propojení s modulem 040 (Nemovitost)
- **Archivace** - Soft delete s možností obnovy
- **Přílohy** - Podpora příloh přes AttachmentSystem
- **Historie změn** - Sledování všech změn v entitách
- **Pokročilé vyhledávání** - Filtrace podle typu, města, IČO

---

## 🗂️ Struktura modulu

```
src/modules/030-pronajimatel/
├── module.config.js     # Manifest modulu (✅ hotovo)
├── db.js                # Proxy na /src/db/subjects.js (✅ hotovo)
├── type-schemas.js      # Schema polí pro typy subjektů
├── tiles/               # Přehledy (seznamy)
│   ├── prehled.js      # ⏳ Hlavní přehled všech pronajímatelů
│   ├── osoba.js        # ⏳ Filtr: pouze osoby
│   ├── osvc.js         # ⏳ Filtr: pouze OSVČ
│   ├── firma.js        # ⏳ Filtr: pouze firmy
│   ├── spolek.js       # ⏳ Filtr: pouze spolky
│   ├── stat.js         # ⏳ Filtr: pouze státní instituce
│   └── zastupce.js     # ⏳ Filtr: pouze zástupci
├── forms/               # Formuláře
│   ├── chooser.js      # ⏳ Výběr typu subjektu
│   ├── detail.js       # ⏳ Detail (read-only)
│   ├── form.js         # ⏳ Vytvoření/úprava
│   └── subject-type.js # Správa typů subjektů (admin)
└── assets/              # Dokumentace
    ├── README.md              # ✅ Tento soubor
    ├── AGENT-SPECIFIKACE.md   # ✅ Kompletní specifikace pro agenta
    ├── datovy-model.md        # ✅ Database schema
    ├── permissions.md         # ✅ Oprávnění a RLS
    └── checklist.md           # ✅ Checklist implementace
```

**Legenda:**
- ✅ Hotovo
- ⏳ Ve vývoji / Připraveno k implementaci
- ❌ Neimplementováno

---

## 💾 Datový model

### Hlavní tabulky

#### 1. `subjects`
Hlavní tabulka pro všechny subjekty (pronajímatelé i nájemníci).

**Klíčová pole:**
- `id` (UUID) - Primární klíč
- `role` ('pronajimatel' | 'najemnik') - Role subjektu
- `type` ('osoba' | 'osvc' | 'firma' | 'spolek' | 'stat' | 'zastupce') - Typ subjektu
- `display_name` - Zobrazované jméno
- `ico` - IČO (pro firmy, OSVČ)
- `primary_email` - Primární email (povinný)
- `primary_phone` - Primární telefon
- `city`, `street`, `zip` - Adresa
- `archived` - Příznak archivace

**Rozšířená pole (JSONB):**
- `kontaktni_osoba` - Kontaktní osoba (pro firmy)
- `bankovni_ucty` - Array bankovních účtů
- `podpisove_prava` - Osoby s podpisovým právem
- `dorucovaci_adresa` - Jiná doručovací adresa
- `platebni_info` - Platební informace

Pro kompletní schema viz [datovy-model.md](./datovy-model.md)

#### 2. `subject_types`
Konfigurovatelné typy subjektů.

**Výchozí typy:**
- Osoba 👤
- OSVČ 💼
- Firma 🏢
- Spolek / Skupina 👥
- Státní instituce 🏛️
- Zástupce 🤝

---

## 🎨 UI komponenty

### Tiles (Přehledy)

#### Přehled (prehled)
Zobrazuje **všechny** pronajímatele v jedné tabulce.

**Sloupce:**
- Typ (s ikonou)
- Název / Jméno
- IČO
- Telefon
- Email
- Město
- Archivován

**Akce:** add, edit, archive, attach, refresh, history

#### Filtrované seznamy
Každý typ subjektu má vlastní tile s filtrem:
- `osoba.js` - Pouze osoby
- `osvc.js` - Pouze OSVČ
- `firma.js` - Pouze firmy
- `spolek.js` - Pouze spolky
- `stat.js` - Pouze státní instituce
- `zastupce.js` - Pouze zástupci

### Forms (Formuláře)

#### Chooser
Výběr typu subjektu před vytvořením nového pronajímatele.
Zobrazí karty s typy, po kliknutí naviguje na formulář.

#### Detail
Read-only zobrazení detailu pronajímatele.
- Všechna pole zobrazena jako text
- Boční akce: Upravit, Přílohy, Historie, Archivovat/Obnovit

#### Form
Vytvoření nebo úprava pronajímatele.
- Dynamická pole podle typu subjektu
- ARES integrace pro typy s IČO
- Validace na klientu
- Dirty state tracking

---

## 🔐 Oprávnění

| Oprávnění | Superadmin | Správce | Manažer | Účetní | Čtenář |
|-----------|------------|---------|---------|--------|--------|
| subjects.read | ✅ | ✅ | ✅ | ✅ | ✅ |
| subjects.create | ✅ | ✅ | ✅ | ❌ | ❌ |
| subjects.update | ✅ | ✅ | ✅ | ❌ | ❌ |
| subjects.archive | ✅ | ✅ | ❌ | ❌ | ❌ |
| subjects.delete | ✅ | ❌ | ❌ | ❌ | ❌ |

Detaily viz [permissions.md](./permissions.md)

---

## 🔗 Vazby na jiné moduly

### Modul 040 (Nemovitost)
- Pronajímatel je vlastníkem nemovitostí (vztah 1:N)
- V detailu pronajímatele se zobrazuje seznam jeho nemovitostí
- Při vytváření nemovitosti lze vybrat pronajímatele

### Modul 060 (Smlouva)
- Pronajímatel je stranou nájemní smlouvy
- V detailu pronajímatele se zobrazují jeho smlouvy

### Modul 080 (Platby)
- Pronajímatel přijímá platby nájemného
- Vazba přes bankovní účty

---

## 🚀 Rychlý start

### Jako uživatel

1. **Zobrazit seznam pronajímatelů**
   - Klikni na modul "Pronajímatel" v sidebaru
   - Otevře se přehled všech pronajímatelů

2. **Přidat nového pronajímatele**
   - Klikni na "Přidat" v horní liště
   - Vyber typ subjektu (Osoba, Firma, atd.)
   - Vyplň formulář
   - Klikni "Uložit"

3. **Použít ARES** (pro firmy a OSVČ)
   - Zadej IČO
   - Klikni "Načíst z ARES"
   - Údaje se automaticky vyplní

4. **Zobrazit detail**
   - Dvojklik na řádek v seznamu
   - Nebo vyber řádek a klikni "Detail"

5. **Upravit pronajímatele**
   - V detailu klikni "Upravit"
   - Nebo vyber řádek v seznamu a klikni "Upravit"

### Jako vývojář

1. **Načíst seznam pronajímatelů**
```javascript
import { listSubjects } from '/src/modules/030-pronajimatel/db.js';

const { data, error } = await listSubjects({
  showArchived: false
});
```

2. **Načíst detail pronajímatele**
```javascript
import { getSubject } from '/src/modules/030-pronajimatel/db.js';

const { data, error } = await getSubject(id);
```

3. **Vytvořit nového pronajímatele**
```javascript
import { upsertSubject } from '/src/modules/030-pronajimatel/db.js';

const payload = {
  type: 'osoba',
  display_name: 'Jan Novák',
  primary_email: 'jan@example.com',
  // ... další pole
};

const { data, error } = await upsertSubject(payload, currentUser);
```

4. **Archivovat pronajímatele**
```javascript
import { archiveSubject } from '/src/modules/030-pronajimatel/db.js';

const { error } = await archiveSubject(id);
```

---

## 🧪 Testování

### Manuální testování
1. Přidat nového pronajímatele každého typu
2. Upravit existujícího pronajímatele
3. Archivovat a obnovit pronajímatele
4. Otestovat ARES integraci s reálným IČO
5. Otestovat validaci (neplatný email, PSČ, atd.)
6. Otestovat oprávnění s různými rolemi

### Automatické testy
```bash
# Jednotkové testy
npm test src/modules/030-pronajimatel

# E2E testy
npm run test:e2e -- --spec=030-pronajimatel
```

---

## 📚 Dokumentace

### Pro uživatele
- **Uživatelská příručka**: `/docs/uzivatelska-prirucka/030-pronajimatel.md` (TODO)
- **FAQ**: Nejčastější dotazy o správě pronajímatelů (TODO)

### Pro vývojáře
- **[AGENT-SPECIFIKACE.md](./AGENT-SPECIFIKACE.md)** - Kompletní specifikace pro agenta (✅)
- **[datovy-model.md](./datovy-model.md)** - Database schema (✅)
- **[permissions.md](./permissions.md)** - Oprávnění a RLS (✅)
- **[checklist.md](./checklist.md)** - Checklist implementace (✅)
- **API dokumentace**: `/docs/api/subjects.md` (TODO)

### Pravidla aplikace v5
- **[10-CHECKLIST-PRAVIDLA.md](/NEW/10-CHECKLIST-PRAVIDLA.md)** - Obecná pravidla
- **[08-SABLONA-MODULU.md](/NEW/08-SABLONA-MODULU.md)** - Šablona modulu

---

## ⚙️ Konfigurace

### Manifest (module.config.js)
```javascript
{
  id: '030-pronajimatel',
  title: 'Pronajímatel',
  icon: 'home',
  defaultTile: 'prehled',
  tiles: [
    {
      id: 'prehled',
      title: 'Přehled pronajímatelů',
      icon: 'list',
      collapsible: true,
      children: [] // Dynamicky načtené typy
    }
  ],
  forms: [
    { id: 'chooser', title: 'Nový subjekt', icon: 'add', showInSidebar: false },
    { id: 'detail', title: 'Detail pronajímatele', icon: 'view', showInSidebar: false },
    { id: 'form', title: 'Formulář', icon: 'form', showInSidebar: false },
    { id: 'subject-type', title: 'Správa typu subjektů', icon: 'settings', showInSidebar: true }
  ]
}
```

### Datová vrstva (db.js)
Modul používá proxy na `/src/db/subjects.js` s defaultní rolí `'pronajimatel'`.

```javascript
export const listSubjects = (opts = {}) => 
  subjects.listSubjects({ ...opts, role: opts.role || 'pronajimatel' });
```

---

## 🐛 Známé problémy a TODO

### Známé problémy
- ❌ UI komponenty (tiles, forms) nejsou implementovány
- ❌ ARES integrace není implementována
- ❌ Validační funkce nejsou implementovány

### TODO
- [ ] Implementovat všechny tiles (prehled, osoba, osvc, atd.)
- [ ] Implementovat všechny forms (chooser, detail, form)
- [ ] Implementovat ARES integraci
- [ ] Implementovat validační funkce
- [ ] Implementovat integraci s AttachmentSystem
- [ ] Implementovat integraci s HistoryModal
- [ ] Přidat E2E testy
- [ ] Přidat uživatelskou dokumentaci

---

## 🤝 Přispívání

### Pro agenty
Pokud jsi agent a máš za úkol implementovat tento modul, přečti si:
1. **[AGENT-SPECIFIKACE.md](./AGENT-SPECIFIKACE.md)** - Kompletní specifikace
2. **[checklist.md](./checklist.md)** - Checklist implementace
3. **Pravidla aplikace v5** v `/NEW/10-CHECKLIST-PRAVIDLA.md`

### Pro vývojáře
1. Dodržuj konvence aplikace v5
2. Před implementací si prostuduj existující moduly (např. 040-nemovitost)
3. Používej existující UI komponenty (`renderTable`, `renderForm`, atd.)
4. Nepřepisuj working code, pouze doplňuj chybějící funkce
5. Vždy přidej testy pro nový kód

---

## 📞 Kontakt a podpora

- **Issues**: GitHub Issues v repozitáři
- **Dokumentace**: `/NEW/` adresář
- **Slack**: #aplikace-v5 kanál (TODO)

---

## 📄 Licence

Interní projekt - všechna práva vyhrazena.

---

## 📝 Changelog

### Verze 2.0 (2025-11-10)
- ✅ Kompletní přepracování dokumentace
- ✅ Vytvoření AGENT-SPECIFIKACE.md
- ✅ Aktualizace datového modelu
- ✅ Aktualizace checklistu
- ✅ Příprava pro implementaci UI

### Verze 1.0
- Základní struktura modulu
- Database schema
- Manifest s dynamickým načítáním typů

---

**Poslední aktualizace:** 2025-11-10  
**Autor dokumentace:** Copilot Agent  
**Stav:** Připraveno k implementaci UI komponent
