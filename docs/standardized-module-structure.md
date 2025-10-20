# Standardizovaná struktura modulů

## Přehled

Všechny moduly v aplikaci nyní používají **jednotnou strukturu** s následujícími komponenty:

1. **Sdílené schémata typů** (`src/db/type-schemas.js`)
2. **Univerzální formulářový wrapper** (`src/ui/universal-form.js`)
3. **Konzistentní struktura modulů**
4. **Společné akce, historie, přílohy a archivace**

## Struktura modulů

Každý modul má tuto strukturu:

```
src/modules/XXX-nazev-modulu/
├── assets/
│   ├── README.md           # Dokumentace modulu
│   ├── checklist.md        # Kontrolní seznam implementace
│   ├── datovy-model.md     # Popis datového modelu
│   └── permissions.md      # Popis oprávnění
├── forms/
│   ├── detail.js           # Formulář pro zobrazení (read-only)
│   └── edit.js             # Formulář pro úpravu/vytvoření
├── tiles/
│   ├── prehled.js          # Hlavní přehled
│   └── ...                 # Další dlaždice
├── services/
│   └── api.js              # (volitelné) API služby modulu
└── module.config.js        # Manifest modulu
```

## Sdílené schémata typů

### Umístění: `src/db/type-schemas.js`

Tento soubor obsahuje:

- **SUBJECT_TYPE_SCHEMAS**: Schémata pro subjekty (osoba, osvc, firma, spolek, stat, zastupce)
- **PROPERTY_SCHEMA**: Schéma pro nemovitosti
- Funkce pro získání schémat:
  - `getSubjectTypeSchema(type)` - vrátí schéma pro daný typ subjektu
  - `getSubjectTypes()` - vrátí seznam všech typů subjektů
  - `getPropertySchema()` - vrátí schéma pro nemovitosti

### Příklad použití:

```javascript
import { getSubjectTypeSchema } from '/src/db/type-schemas.js';

const schema = getSubjectTypeSchema('osoba');
// schema obsahuje definici polí pro osobu
```

## Univerzální formulářový wrapper

### Umístění: `src/ui/universal-form.js`

Poskytuje funkci `renderUniversalForm()`, která automaticky přidává:

✅ **Breadcrumbs** (drobečková navigace)  
✅ **Common Actions** (akční tlačítka: Uložit, Zpět, atd.)  
✅ **Attachments** (přílohy) - pro existující záznamy  
✅ **History** (historie změn) - pro existující záznamy  
✅ **Archive** (archivace) - volitelné  
✅ **Unsaved Changes Warning** (varování před neuloženými změnami)  
✅ **Read-only mode** (režim jen pro čtení)

### Základní použití:

```javascript
import { renderUniversalForm, navigateToModuleOverview } from '/src/ui/universal-form.js';
import { toast } from '/src/ui/commonActions.js';

export async function render(root, params = {}) {
  const schema = [...]; // pole definující formulář
  const entityId = params?.id || null;
  
  // Načíst data pokud editujeme
  let initial = {};
  if (entityId) {
    const { data, error } = await getData(entityId);
    if (error) {
      root.innerHTML = `<div class="error">Chyba: ${error.message}</div>`;
      return;
    }
    initial = data;
  }

  await renderUniversalForm({
    root,
    schema,
    initialData: initial,
    breadcrumbs: [
      { icon: 'home', label: 'Domů', href: '#/' },
      { icon: 'folder', label: 'Modul', href: '#/m/XXX-modul/t/prehled' },
      { label: entityId ? 'Úprava' : 'Nový' }
    ],
    onSave: async (values) => {
      const { data, error } = await saveData(values);
      if (error) {
        toast('Chyba při ukládání: ' + error.message, 'error');
        return { success: false, error };
      }
      toast('Uloženo', 'success');
      navigateToModuleOverview('XXX-modul');
      return { success: true, data };
    },
    options: {
      entity: 'nazev_entity',
      entityId: entityId,
      showAttachments: !!entityId,
      showHistory: !!entityId,
      showArchive: false,
      readOnly: false, // true pro detail view
      onCancel: () => navigateToModuleOverview('XXX-modul')
    }
  });
}
```

## Definice schématu

Schéma je pole objektů, kde každý objekt definuje jedno pole formuláře:

```javascript
const schema = [
  { 
    key: 'name',              // klíč v datech
    label: 'Název *',         // popisek
    type: 'text',             // typ pole (text, email, number, select, checkbox, textarea, label)
    required: true            // povinné pole?
  },
  {
    key: 'status',
    label: 'Stav',
    type: 'select',
    options: [                // možnosti pro select
      { value: 'active', label: 'Aktivní' },
      { value: 'inactive', label: 'Neaktivní' }
    ]
  },
  {
    key: 'description',
    label: 'Popis',
    type: 'textarea',
    fullWidth: true           // pole přes celou šířku
  },
  {
    key: 'is_public',
    label: 'Veřejné',
    type: 'checkbox'
  }
];
```

## Příklady modulů

### Modul 030 - Pronajímatel (používá sdílené schéma subjektů)

```javascript
import { getSubject, upsertSubject } from '/src/db/subjects.js';
import { getSubjectTypeSchema } from '/src/db/type-schemas.js';
import { renderUniversalForm, navigateToModuleOverview } from '/src/ui/universal-form.js';

export async function render(root, params = {}) {
  const type = params?.type || 'osoba';
  const schema = getSubjectTypeSchema(type);
  // ... zbytek implementace
}
```

### Modul 040 - Nemovitosti (používá schéma nemovitostí)

```javascript
import { getPropertySchema } from '/src/db/type-schemas.js';
import { renderUniversalForm, navigateToModuleOverview } from '/src/ui/universal-form.js';

export async function render(root, params = {}) {
  const schema = getPropertySchema();
  // ... zbytek implementace
}
```

### Modul 000 - Šablona (ukázkový vlastní modul)

Obsahuje kompletní příklad s vlastním schématem a komentáři.

## Výhody standardizace

✅ **Žádná duplikace kódu** - schémata jsou na jednom místě  
✅ **Konzistentní UX** - všechny formuláře vypadají a chovají se stejně  
✅ **Automatické funkce** - přílohy, historie, breadcrumbs přidávány automaticky  
✅ **Snadná údržba** - změna na jednom místě se promítne všude  
✅ **Jasná struktura** - každý ví, kde co najít  
✅ **Rychlejší vývoj** - nové moduly lze vytvořit rychleji

## Checklist pro nový modul

- [ ] Vytvořit složku `src/modules/XXX-nazev/`
- [ ] Přidat `module.config.js` s manifestem
- [ ] Vytvořit `forms/edit.js` s použitím `renderUniversalForm()`
- [ ] Vytvořit `forms/detail.js` s `readOnly: true`
- [ ] Vytvořit tiles (`tiles/prehled.js` atd.)
- [ ] Definovat schéma (buď v `type-schemas.js` nebo lokálně)
- [ ] Vyplnit dokumentaci v `assets/`
- [ ] Registrovat modul v `src/app/modules.index.js`

## Poznámky

- **Read-only mode**: Pro detail view nastavte `readOnly: true` a `onSave: null`
- **Přílohy a historie**: Zobrazují se automaticky, pokud `entityId` existuje a `showAttachments/showHistory` jsou true
- **Archivace**: Zapněte přes `showArchive: true` a `onArchive` handler
- **Vlastní akce**: Můžete přidat přes `additionalActions` v options
