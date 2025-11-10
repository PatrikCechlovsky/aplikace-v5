# Modul 050 - Nájemník (Tenant Module)

**Verze:** 1.0  
**Poslední aktualizace:** 2025-11-10  
**Účel:** Kompletní specifikace modulu pro správu nájemníků

---

## 📋 Obsah

1. [Přehled modulu](#přehled-modulu)
2. [Struktura modulu](#struktura-modulu)
3. [Manifest (module.config.js)](#manifest-moduleconfigjs)
4. [Přehledy (Tiles)](#přehledy-tiles)
5. [Formuláře (Forms)](#formuláře-forms)
6. [Databázová vrstva (db.js)](#databázová-vrstva-dbjs)
7. [Typy subjektů (type-schemas.js)](#typy-subjektů-type-schemasjs)
8. [Bezpečnost a oprávnění](#bezpečnost-a-oprávnění)
9. [Integrace s ostatními moduly](#integrace-s-ostatními-moduly)
10. [Implementační checklist](#implementační-checklist)

---

## Přehled modulu

### Základní informace

- **ID modulu:** `050-najemnik`
- **Název:** Nájemník
- **Ikona:** `person` (👤)
- **Defaultní tile:** `prehled`
- **Role:** `najemnik`

### Účel modulu

Modul 050 slouží ke správě všech typů nájemníků v aplikaci. Využívá sdílenou tabulku `subjects` s rozlišením pomocí pole `role = 'najemnik'`. Podporuje různé typy subjektů:

- **Osoba** (fyzická osoba)
- **OSVČ** (osoba samostatně výdělečně činná)
- **Firma** (s.r.o., a.s., atd.)
- **Spolek/Skupina** (spolky, sdružení)
- **Státní instituce** (úřady, ministerstva)
- **Zástupce** (právní zástupce jiného subjektu)

### Klíčové vlastnosti

- ✅ Sdílená databázová struktura s modulem 030 (Pronajímatel)
- ✅ Dynamické načítání typů subjektů z databáze
- ✅ Podpora různých typů subjektů s vlastními přehledy
- ✅ Společný formulář pro všechny typy
- ✅ Historie změn a přílohy
- ✅ Podpora archivace
- ✅ Row Level Security (RLS)

---

## Struktura modulu

```
src/modules/050-najemnik/
├── module.config.js          # Manifest modulu - konfigurace
├── db.js                      # Databázové funkce specifické pro nájemníky
├── type-schemas.js            # Definice schémat pro různé typy subjektů
├── assets/                    # Dokumentace a statické soubory
│   ├── README.md             # Tento soubor - kompletní specifikace
│   ├── permissions.md        # Detailní popis oprávnění a RLS
│   ├── datovy-model.md       # Databázové schéma a vztahy
│   └── checklist.md          # Implementační checklist pro agenta
├── tiles/                     # Přehledy (seznamy)
│   ├── prehled.js            # Hlavní přehled všech nájemníků
│   ├── osoba.js              # Přehled fyzických osob
│   ├── osvc.js               # Přehled OSVČ
│   ├── firma.js              # Přehled firem
│   ├── spolek.js             # Přehled spolků
│   ├── stat.js               # Přehled státních institucí
│   └── zastupce.js           # Přehled zástupců
└── forms/                     # Formuláře
    ├── chooser.js            # Výběr typu nového subjektu
    ├── detail.js             # Detail nájemníka (read-only)
    └── form.js               # Editace/vytvoření nájemníka
```

---

## Manifest (module.config.js)

### Účel

Manifest definuje strukturu modulu, jeho tiles a forms. Dynamicky načítá typy subjektů z databáze a počty záznamů pro každý typ.

### Kompletní kód manifestu

```javascript
import { listSubjectTypes, getSubjectsCountsByType } from '/src/db/subjects.js';

export async function getManifest() {
  // Vytvoření hlavního přehledu s vnořenými typy
  const tiles = [
    {
      id: 'prehled',
      title: 'Přehled nájemníků',
      icon: 'list',
      collapsible: true,
      children: []
    }
  ];

  // Načtení typů subjektů z databáze a jejich počtů
  try {
    // Načíst typy subjektů
    const resTypes = await listSubjectTypes();
    const subjectTypes = Array.isArray(resTypes?.data) ? resTypes.data : [];

    // Načíst počty (s bezpečným fallbackem)
    const { data: countData, error: countError } = await getSubjectsCountsByType({
      role: 'najemnik',
      showArchived: false
    });

    if (countError) {
      console.error('Error loading subject counts:', countError);
      // Pokračovat s prázdnými počty při chybě
    }

    const countsMap = Object.fromEntries((countData || []).map(c => [c.type, c.count]));

    // Přidat typy s počty do sidebaru
    for (const typeConfig of subjectTypes) {
      // Guard: přeskočit neplatné záznamy
      if (!typeConfig || typeof typeConfig !== 'object') continue;
      const slug = typeConfig.slug;
      const label = typeConfig.label || slug || 'Typ';
      const count = countsMap[slug] || 0;

      if (count > 0) {
        tiles[0].children.push({
          id: slug,
          title: `${label} (${count})`,
          icon: typeConfig.icon || 'person',
          count: count,
          type: slug
        });
      }
    }
  } catch (e) {
    console.error('Error loading subject types:', e);
  }

  return {
    id: '050-najemnik',
    title: 'Nájemník',
    icon: 'person',
    defaultTile: 'prehled',
    tiles,
    // Formuláře by se NEMĚLY objevovat v sidebaru (showInSidebar: false)
    forms: [
      { id: 'chooser', title: 'Nový subjekt', icon: 'add', showInSidebar: false },
      { id: 'detail', title: 'Detail nájemníka', icon: 'view', showInSidebar: false },
      { id: 'form', title: 'Formulář', icon: 'form', showInSidebar: false }
    ]
  };
}

export default { getManifest };
```

### Klíčové vlastnosti manifestu

1. **Dynamické načítání typů**: Typy subjektů se načítají z databáze, ne natvrdo v kódu
2. **Počítání záznamů**: Počty se zobrazují v závorce u každého typu
3. **Bezpečné chybové stavy**: Při chybě načítání pokračuje s prázdnými daty
4. **Collapsible sidebar**: Typy subjektů jsou vnořené pod hlavní přehled
5. **Skryté formuláře**: Formuláře se nezobrazují v sidebaru

---

## Přehledy (Tiles)

### 1. Přehled (prehled.js)

**ID:** `prehled`  
**Ikona:** `list` (📋)  
**Účel:** Hlavní přehled všech nájemníků

#### Akce (CommonActions)

- `add` - Přidat nového nájemníka (navigace na chooser)
- `edit` - Upravit vybraného nájemníka
- `archive` - Archivovat vybraného nájemníka
- `attach` - Spravovat přílohy vybraného nájemníka
- `refresh` - Obnovit seznam
- `history` - Zobrazit historii změn

#### Sloupce tabulky

| Klíč | Název | Šířka | Řazení | Popis |
|------|-------|-------|--------|-------|
| `typ_subjektu` | Typ | 10% | Ano | Typ subjektu (osoba, firma, ...) |
| `display_name` | Název / Jméno | 20% | Ne | Zobrazované jméno |
| `ico` | IČO | 10% | Ne | IČO (pokud je firma/OSVČ) |
| `primary_phone` | Telefon | 15% | Ne | Primární telefon |
| `primary_email` | Email | 18% | Ne | Primární email |
| `city` | Město | 15% | Ne | Město z adresy |
| `archivedLabel` | Archivován | 10% | Ne | Stav archivace |

#### Události

- **onRowClick**: Navigace na detail (`#/m/050-najemnik/f/detail?id={id}`)
- **onRowSelect**: Uložení vybraného řádku pro akce

#### Filtry

- **Fulltextové vyhledávání**: Hledá v display_name, ico, email, telefon
- **Checkbox "Zobrazit archivované"**: Přepíná zobrazení archivovaných

---

### 2. Osoba (osoba.js)

**ID:** `osoba`  
**Ikona:** `person` (👤)  
**Účel:** Seznam fyzických osob (typ_subjektu = 'osoba')

#### Akce (CommonActions)

- `add` - Přidat novou osobu
- `edit` - Upravit vybranou osobu
- `archive` - Archivovat vybranou osobu
- `attach` - Spravovat přílohy
- `refresh` - Obnovit seznam
- `history` - Zobrazit historii

#### Sloupce tabulky

| Klíč | Název | Šířka | Řazení |
|------|-------|-------|--------|
| `id` | ID | - | Ne |
| `display_name` | Jméno | - | Ne |
| `primary_email` | E-mail | - | Ne |
| `primary_phone` | Telefon | - | Ne |
| `city` | Město | - | Ne |

---

### 3. OSVČ (osvc.js)

**ID:** `osvc`  
**Ikona:** `briefcase` (💼)  
**Účel:** Seznam OSVČ (typ_subjektu = 'osvc')

#### Akce (CommonActions)

- `add`, `edit`, `archive`, `attach`, `refresh`, `history`

#### Sloupce tabulky

| Klíč | Název | Šířka | Řazení |
|------|-------|-------|--------|
| `display_name` | Jméno / Firma | - | Ne |
| `ico` | IČO | - | Ne |
| `primary_email` | E-mail | - | Ne |
| `primary_phone` | Telefon | - | Ne |

---

### 4. Firma (firma.js)

**ID:** `firma`  
**Ikona:** `building` (🏢)  
**Účel:** Seznam firem (typ_subjektu = 'firma')

#### Akce (CommonActions)

- `add`, `edit`, `archive`, `attach`, `refresh`, `history`

#### Sloupce tabulky

| Klíč | Název | Šířka | Řazení |
|------|-------|-------|--------|
| `id` | ID | - | Ne |
| `display_name` | Firma | - | Ne |
| `ico` | IČO | - | Ne |
| `primary_email` | E-mail | - | Ne |
| `primary_phone` | Telefon | - | Ne |
| `city` | Město | - | Ne |

---

### 5. Spolek / Skupina (spolek.js)

**ID:** `spolek`  
**Ikona:** `people` (👥)  
**Účel:** Seznam spolků a skupin (typ_subjektu = 'spolek')

#### Akce (CommonActions)

- `add`, `edit`, `archive`, `attach`, `refresh`, `history`

#### Sloupce tabulky

| Klíč | Název | Šířka | Řazení |
|------|-------|-------|--------|
| `display_name` | Název | - | Ne |
| `primary_email` | E-mail | - | Ne |
| `primary_phone` | Telefon | - | Ne |

---

### 6. Státní instituce (stat.js)

**ID:** `stat`  
**Ikona:** `bank` (🏛️)  
**Účel:** Seznam státních institucí (typ_subjektu = 'stat')

#### Akce (CommonActions)

- `add`, `edit`, `archive`, `attach`, `refresh`, `history`

#### Sloupce tabulky

| Klíč | Název | Šířka | Řazení |
|------|-------|-------|--------|
| `display_name` | Název | - | Ne |
| `primary_email` | E-mail | - | Ne |
| `city` | Město | - | Ne |

---

### 7. Zástupci (zastupce.js)

**ID:** `zastupce`  
**Ikona:** `handshake` (🤝)  
**Účel:** Seznam zástupců (typ_subjektu = 'zastupce')

#### Akce (CommonActions)

- `add`, `edit`, `archive`, `attach`, `refresh`, `history`

#### Sloupce tabulky

| Klíč | Název | Šířka | Řazení |
|------|-------|-------|--------|
| `display_name` | Jméno zástupce | - | Ne |
| `zastupuje_id` | Zastupuje (ID) | - | Ne |
| `primary_email` | E-mail | - | Ne |
| `primary_phone` | Telefon | - | Ne |

---

## Formuláře (Forms)

### 1. Chooser (chooser.js)

**ID:** `chooser`  
**Ikona:** `add` (➕)  
**Účel:** Výběr typu nového subjektu před vytvořením

#### Funkce

Zobrazí grid s kartami pro různé typy subjektů:

- Osoba
- OSVČ
- Firma
- Spolek/Skupina
- Státní instituce
- Zástupce

#### Navigace

Po výběru naviguje na: `#/m/050-najemnik/f/form?type={typ_subjektu}`

#### UI design

```
┌─────────────────────────────────────┐
│  Vyberte typ nového nájemníka:      │
├─────────────────────────────────────┤
│  ┌──────┐  ┌──────┐  ┌──────┐      │
│  │ 👤   │  │ 💼   │  │ 🏢   │      │
│  │Osoba │  │OSVČ  │  │Firma │      │
│  └──────┘  └──────┘  └──────┘      │
│  ┌──────┐  ┌──────┐  ┌──────┐      │
│  │ 👥   │  │ 🏛️   │  │ 🤝   │      │
│  │Spolek│  │ Stát │  │Zást. │      │
│  └──────┘  └──────┘  └──────┘      │
└─────────────────────────────────────┘
```

---

### 2. Detail (detail.js)

**ID:** `detail`  
**Ikona:** `view` (👁️)  
**Účel:** Zobrazení detailu nájemníka (read-only)

#### Akce (CommonActions)

- `edit` - Přejít do režimu editace
- `attach` - Spravovat přílohy
- `archive` - Archivovat subjekt
- `history` - Zobrazit historii změn

#### Sekce formuláře

##### 1. Základní údaje

**Pro osobu:**
- Jméno (jmeno)
- Příjmení (prijmeni)
- Rodné číslo (rodne_cislo)
- Datum narození (datum_narozeni)

**Pro firmu/OSVČ:**
- Název firmy (nazev_firmy)
- IČO (ico)
- DIČ (dic)

**Pro všechny:**
- Zobrazované jméno (display_name) - computed field

##### 2. Kontaktní údaje

- Primární email (primary_email)
- Sekundární email (secondary_email)
- Telefon (telefon)
- Telefon 2 (telefon_2)

##### 3. Adresa

- Ulice (ulice)
- Číslo popisné (cislo_popisne)
- Město (mesto)
- PSČ (psc)
- Stát (stat)

##### 4. Další informace

- Poznámka (poznamka)

##### 5. Systémové informace (read-only, šedé pozadí)

- Vytvořeno (created_at)
- Upraveno (updated_at)
- Vytvořil (created_by)
- Upravil (updated_by)
- Archivován (archived)
- Datum archivace (archived_at)

#### Breadcrumb

```
Domů > Nájemník > Přehled > Detail: {display_name}
```

---

### 3. Formulář (form.js)

**ID:** `form`  
**Ikona:** `form` (📝)  
**Účel:** Vytvoření nového nebo editace existujícího nájemníka

#### Režimy

- **Create**: `?type={typ_subjektu}` - vytvoření nového
- **Edit**: `?id={id}` - editace existujícího

#### Akce (CommonActions)

- `save` - Uložit změny
- `archive` - Archivovat (pouze edit mode)
- `attach` - Přílohy (pouze edit mode)
- `history` - Historie (pouze edit mode)

#### Sekce formuláře

Viz samostatný dokument **datovy-model.md** pro kompletní seznam polí a validaci.

#### Computed field: display_name

Automaticky se generuje podle typu:

```javascript
// Pro osobu
display_name = `${prijmeni} ${jmeno}`.trim()

// Pro firmu/OSVČ/spolek/stat
display_name = nazev_firmy

// Pro zástupce
display_name = `${prijmeni} ${jmeno} (zástupce)`.trim()
```

#### Unsaved Changes Warning

Pokud uživatel začne editovat a pokusí se opustit stránku, zobrazí se varování.

#### Breadcrumb

**Create mode:**
```
Domů > Nájemník > Nový subjekt
```

**Edit mode:**
```
Domů > Nájemník > Přehled > Detail: {display_name} > Editace
```

---

## Databázová vrstva (db.js)

### Účel

Poskytuje funkce pro práci s nájemníky. Všechny funkce pracují s tabulkou `subjects` a filtrují podle `role = 'najemnik'`.

### Seznam funkcí

1. `getAllTenants(includeArchived)` - Načte všechny nájemníky
2. `getTenantById(id)` - Načte jednoho nájemníka podle ID
3. `getTenantsByType(typ_subjektu, includeArchived)` - Načte nájemníky podle typu
4. `createTenant(data)` - Vytvoří nového nájemníka
5. `updateTenant(id, data)` - Aktualizuje nájemníka
6. `archiveTenant(id)` - Archivuje nájemníka
7. `searchTenants(searchTerm, includeArchived)` - Fulltextové vyhledávání

Pro detailní implementaci viz samostatný dokument **datovy-model.md**.

---

## Typy subjektů (type-schemas.js)

Definuje schémata polí pro různé typy subjektů. Slouží k dynamickému generování formulářů.

Pro detailní specifikaci viz samostatný dokument **datovy-model.md**.

---

## Bezpečnost a oprávnění

Viz samostatný dokument: **permissions.md**

### Základní principy

1. **Row Level Security (RLS)**: Všechny operace jsou zabezpečeny na úrovni databáze
2. **Role-based access**: Přístup podle role uživatele (admin, user, viewer)
3. **Validace na frontendu i backendu**: Dvojitá validace dat
4. **Audit log**: Všechny změny se logují

---

## Integrace s ostatními moduly

### 1. Modul 030 - Pronajímatel

- **Sdílená tabulka**: `subjects` (rozlišení pomocí pole `role`)
- **Sdílené funkce**: Některé DB funkce jsou sdílené v `/src/db/subjects.js`
- **Stejná struktura**: Oba moduly mají identickou strukturu

### 2. Modul 060 - Smlouva

- **Foreign key**: `contracts.tenant_id` → `subjects.id`
- **Navigace**: Z detailu nájemníka lze zobrazit všechny jeho smlouvy
- **Filtrování**: V modulu Smlouva lze filtrovat podle nájemníka

### 3. Modul 080 - Platby

- **Vztah přes smlouvy**: Platby jsou vázány na smlouvy, které mají nájemníka
- **Reporting**: Přehled plateb podle nájemníka

### 4. Historie a přílohy

- **Společný systém**: Všechny entity sdílí stejný systém historie a příloh
- **Tabulky**: `subject_history`, `attachments`

---

## Implementační checklist

Viz samostatný dokument: **checklist.md**

### Rychlý přehled

- [ ] Manifest (module.config.js)
- [ ] Databázová vrstva (db.js)
- [ ] Typy subjektů (type-schemas.js)
- [ ] 7 Tiles (prehled, osoba, osvc, firma, spolek, stat, zastupce)
- [ ] 3 Forms (chooser, detail, form)
- [ ] Registrace v modules.index.js
- [ ] Testování

---

## Poznámky pro implementaci

### Klíčové body

1. **Kopírovat z modulu 030**: Modul 050 je téměř identický s modulem 030, jen se liší role
2. **Změnit role**: Ve všech DB funkcích změnit `role = 'pronajimatel'` na `role = 'najemnik'`
3. **Ikona modulu**: Použít `person` místo `home`
4. **Texty**: Nahradit "Pronajímatel" za "Nájemník"
5. **Zachovat strukturu**: Neměnit strukturu souborů a funkcí

### Časté chyby

❌ **NESPRÁVNĚ**: Vytvořit novou tabulku pro nájemníky  
✅ **SPRÁVNĚ**: Použít sdílenou tabulku `subjects` s `role = 'najemnik'`

❌ **NESPRÁVNĚ**: Změnit strukturu formulářů  
✅ **SPRÁVNĚ**: Zachovat stejnou strukturu jako v modulu 030

❌ **NESPRÁVNĚ**: Hardcodovat typy subjektů  
✅ **SPRÁVNĚ**: Načítat dynamicky z databáze

---

**Konec dokumentu - README.md modulu 050** ✅
