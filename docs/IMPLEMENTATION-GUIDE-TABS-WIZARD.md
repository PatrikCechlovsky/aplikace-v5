# Průvodce implementací - Tabs, Forms, Lists a Wizard System

## Přehled

Tento dokument popisuje implementaci systému jednotných tabs (oušek), seznamů, formulářů a wizard systému podle specifikace z Excel souboru `docs/excel-pro-moduly-ouska-seznamy-formulare.xlsx`.

## 1. Databázové schéma

### Wizard tabulky

Byly vytvořeny dvě hlavní tabulky pro wizard systém:

#### `wizard_drafts`
Ukládá hlavní instance průvodců (rozpracované nebo dokončené).

```sql
-- Viz: docs/tasks/supabase-migrations/010_create_wizard_tables.sql
```

**Klíčové sloupce:**
- `wizard_key` - typ průvodce (např. `create-prop-with-units`)
- `entity_code` - kód entity (LORD, PROP, UNIT, TEN, AGR, PAY, DOC)
- `mode` - režim (create, update)
- `status` - stav (draft, in_progress, completed, canceled, expired)
- `payload` - agregovaná data ze všech kroků (JSONB)

#### `wizard_steps`
Ukládá jednotlivé kroky v rámci jednoho průvodce.

**Klíčové sloupce:**
- `draft_id` - FK na wizard_drafts
- `step_order` - pořadí kroku
- `step_code` - identifikátor kroku
- `form_code` - kód formuláře pro tento krok
- `data` - data zadaná uživatelem (JSONB)
- `status` - stav kroku (pending, valid, invalid, done)

### Testovací data

Vytvořen seed soubor s 2 testovacími entitami pro každý typ:

```sql
-- Viz: docs/tasks/supabase-migrations/011_seed_test_data.sql
```

**Vytvořené entity:**
- **Landlords** (Pronajímatelé): Jan Novák (osoba), Reality Development s.r.o. (firma)
- **Properties** (Nemovitosti): Bytový dům Hlavní 123, Business Centrum Brno
- **Units** (Jednotky): Byt 2+1, Kancelář 120m²
- **Tenants** (Nájemníci): Petra Svobodová (osoba), Tech Solutions s.r.o. (firma)

## 2. Konfigurace jednotných tabs

### Soubor: `src/config/tabs-config.js`

Poskytuje centralizovanou konfiguraci pro jednotný systém 7 tabs napříč všemi entitami:

1. Pronajímatel (LORD)
2. Nemovitost (PROP)
3. Jednotka (UNIT)
4. Nájemníci (TEN)
5. Smlouvy (AGR)
6. Platby (PAY)
7. Dokumenty (DOC)

### Použití

```javascript
import { getTabsForEntity, getColumnsForList } from '/src/config/tabs-config.js';

// Získat tabs pro detail nemovitosti
const tabs = getTabsForEntity('PROP', propertyId);
// Vrátí pole 7 tabs, kde PROP tab je typu 'detail' a ostatní jsou 'relation-list'

// Získat sloupce pro seznam
const columns = getColumnsForList('list-prop-all');
// Vrátí definici sloupců pro daný seznam
```

### Struktura tab objektu

```javascript
{
  tabOrder: 2,
  label: 'Nemovitost',
  icon: '🏢',
  entityCode: 'PROP',
  module: '040-nemovitost',
  tabType: 'detail', // nebo 'relation-list'
  tabCode: 'tab-prop-prop',
  defaultFormCode: 'form-prop-detail', // pro detail
  defaultListCode: 'list-prop-by-lord', // pro relation-list
  isActive: true // aktivní tab
}
```

## 3. Wizard systém

### Database Service: `src/db/wizard.js`

Poskytuje CRUD operace pro wizard:

```javascript
import { 
  createWizardDraft,
  getWizardDraft,
  updateWizardDraft,
  getWizardSteps,
  updateWizardStep,
  completeWizard
} from '/src/db/wizard.js';

// Vytvořit nový wizard draft
const { data, error } = await createWizardDraft({
  wizardKey: 'create-prop-with-units',
  entityCode: 'PROP',
  mode: 'create',
  totalSteps: 5
});
```

### UI Component: `src/ui/wizard.js`

Univerzální komponenta pro renderování multi-step wizardů.

```javascript
import { renderWizard } from '/src/ui/wizard.js';

await renderWizard(container, {
  wizardKey: 'create-prop-with-units',
  entityCode: 'PROP',
  title: 'Průvodce vytvořením nemovitosti',
  steps: [
    {
      code: 'step-1',
      label: 'Základní údaje',
      description: 'Zadejte základní informace',
      renderForm: (formContainer, data) => {
        // Vykreslit formulář
      },
      collectData: (formContainer) => {
        // Získat data z formuláře
        return { ... };
      },
      validate: (data) => {
        // Validovat data
        return []; // pole chyb
      }
    },
    // další kroky...
  ],
  onComplete: (draft, stepsData) => {
    // Callback po dokončení
  },
  onCancel: () => {
    // Callback při zrušení
  }
});
```

### Příklad: Property Creation Wizard

Soubor: `src/modules/040-nemovitost/forms/wizard-create-property.js`

5-krokový wizard pro vytvoření nemovitosti:
1. **Základní údaje** - název, typ, popis
2. **Adresa** - ulice, město, PSČ, kraj
3. **Technické údaje** - rok výstavby, plocha, počet podlaží
4. **Jednotky** - kolik jednotek vytvořit
5. **Shrnutí** - přehled všech zadaných dat

## 4. Použití v modulech

### Přidání wizardu do modulu

1. Vytvořit wizard soubor v `src/modules/{module}/forms/wizard-{name}.js`
2. Přidat do `module.config.js`:

```javascript
forms: [
  { 
    id: 'wizard-create-property', 
    title: 'Průvodce vytvořením nemovitosti', 
    icon: 'wizard', 
    showInSidebar: true 
  },
  // další formy...
]
```

3. Wizard bude dostupný v menu modulu

## 5. Struktura seznamů (Lists)

Podle Excel specifikace jsou definovány tyto typy seznamů:

### Hlavní seznamy (list-{entity}-all)
- `list-lord-all` - všichni pronajímatelé
- `list-prop-all` - všechny nemovitosti
- `list-unit-all` - všechny jednotky
- `list-ten-all` - všichni nájemníci
- `list-agr-all` - všechny smlouvy
- `list-pay-all` - všechny platby
- `list-doc-all` - všechny dokumenty

### Filtrované seznamy (list-{entity}-by-{parent})
- `list-prop-by-lord` - nemovitosti podle pronajímatele
- `list-unit-by-prop` - jednotky v nemovitosti
- `list-agr-by-unit` - smlouvy k jednotce
- `list-pay-by-agr` - platby ke smlouvě
- `list-doc-by-any` - dokumenty k jakékoli entitě

## 6. Struktura formulářů (Forms)

Každá entita má hlavní detailový formulář:

- `form-lord-detail` - detail pronajímatele
- `form-prop-detail` - detail nemovitosti
- `form-unit-detail` - detail jednotky
- `form-ten-detail` - detail nájemníka
- `form-agr-detail` - detail smlouvy
- `form-pay-detail` - detail platby
- `form-doc-detail` - detail dokumentu

### Režimy formuláře
- `create` - vytvoření nového záznamu
- `edit` - editace existujícího záznamu
- `view` - pouze čtení

## 7. Migrace databáze

Pro aplikaci změn v Supabase:

1. Spustit migrace v pořadí:
   ```sql
   010_create_wizard_tables.sql
   011_seed_test_data.sql
   ```

2. V Supabase SQL Editor:
   - Otevřít každý soubor
   - Zkopírovat obsah
   - Spustit SQL příkaz
   - Ověřit, že tabulky a data byla vytvořena

## 8. Testování

### Test wizard systému

1. Otevřít aplikaci
2. Přejít na modul "Nemovitosti" (#/m/040-nemovitost)
3. V menu kliknout na "Průvodce vytvořením nemovitosti"
4. Projít všechny kroky wizardu
5. Ověřit:
   - Navigace mezi kroky funguje
   - Validace kontroluje povinná pole
   - Progress bar se aktualizuje
   - Shrnutí zobrazuje všechna zadaná data
   - Po dokončení se zobrazí success message

### Test testovacích dat

1. Po spuštění migrací ověřit v Supabase:
   ```sql
   SELECT * FROM subjects WHERE id LIKE '11111111%' OR id LIKE '44444444%';
   SELECT * FROM properties WHERE id LIKE '22222222%';
   SELECT * FROM units WHERE id LIKE '33333333%';
   ```

2. V aplikaci:
   - Modul Pronajímatel měl by zobrazit 2 pronajímatele
   - Modul Nemovitosti měl by zobrazit 2 nemovitosti
   - Detail nemovitosti měl by zobrazit jednotky

## 9. Další kroky

### Pro implementaci kompletního systému:

1. **Rozšířit wizard příklady**
   - Vytvořit wizardy pro ostatní entity
   - Přidat pokročilé validace
   - Implementovat skutečné ukládání do databáze

2. **Implementovat unified tabs v detail views**
   - Upravit existující detail-tabs.js soubory
   - Použít `getTabsForEntity()` z konfigurace
   - Implementovat dynamické načítání related lists

3. **Doplnit chybějící entity**
   - Contracts (Smlouvy)
   - Payments (Platby) - již částečně existuje
   - Documents (Dokumenty) - již existuje

4. **Optimalizace**
   - Cachování wizard draftů
   - Lazy loading tab obsahu
   - Optimalizace DB dotazů pro seznamy

## 10. Reference

### Dokumentace
- `docs/struktura-modulu-ouska-seznamy-formulare.md` - Struktura oušek, seznamů a formulářů
- `docs/wizard-system.md` - Technická dokumentace wizard systému
- `docs/excel-pro-moduly-ouska-seznamy-formulare.xlsx` - Excel specifikace

### Kód
- `src/config/tabs-config.js` - Konfigurace tabs
- `src/db/wizard.js` - Wizard database service
- `src/ui/wizard.js` - Wizard UI component
- `src/modules/040-nemovitost/forms/wizard-create-property.js` - Příklad wizardu

### Migrace
- `docs/tasks/supabase-migrations/010_create_wizard_tables.sql`
- `docs/tasks/supabase-migrations/011_seed_test_data.sql`
