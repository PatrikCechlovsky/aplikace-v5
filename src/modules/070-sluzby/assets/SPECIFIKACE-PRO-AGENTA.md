# Modul 070 - Služby - Kompletní specifikace pro AI agenta

> **Datum vytvoření:** 2025-11-10  
> **Verze:** 1.0  
> **Účel:** Kompletní a detailní specifikace modulu 070 pro implementaci AI agentem

---

## 📋 Obsah

1. [Přehled modulu](#přehled-modulu)
2. [Datový model](#datový-model)
3. [Struktura modulu](#struktura-modulu)
4. [Tiles (Přehledy)](#tiles-přehledy)
5. [Forms (Formuláře)](#forms-formuláře)
6. [Database operace (db.js)](#database-operace-dbjs)
7. [Oprávnění a bezpečnost](#oprávnění-a-bezpečnost)
8. [UI komponenty](#ui-komponenty)
9. [Validace a chybové stavy](#validace-a-chybové-stavy)
10. [Checklist implementace](#checklist-implementace)

---

## 1. Přehled modulu

### 1.1 Účel modulu

Modul **070-sluzby** slouží pro správu:
- **Katalogu služeb** - centrální seznam všech nabízených služeb (voda, elektřina, internet, správní poplatky atd.)
- **Služeb na smlouvách** - přiřazení služeb ke konkrétním smlouvám s cenami a podmínkami
- **Výpočtů nákladů** - automatický výpočet měsíčních nákladů na základě typu účtování

### 1.2 Klíčové funkce

- ✅ Správa katalogu služeb (CRUD operace)
- ✅ Přiřazování služeb ke smlouvám
- ✅ Výpočet nákladů podle typu účtování (pevná sazba, měřená spotřeba, na m², na osobu)
- ✅ Kategorizace služeb (energie, voda, internet, správní poplatky)
- ✅ Historie změn a verzování
- ✅ Integrace s modulem 060 (Smlouvy)

### 1.3 Identifikace modulu

```javascript
{
  id: '070-sluzby',
  title: 'Služby',
  icon: 'settings',
  defaultTile: 'prehled'
}
```

---

## 2. Datový model

### 2.1 Tabulka: service_definitions (Katalog služeb)

Hlavní tabulka pro definice služeb.

#### Struktura:

| Sloupec | Typ | Povinné | Popis |
|---------|-----|---------|-------|
| id | UUID | Ano | Primární klíč |
| kod | VARCHAR(50) | Ano | Unikátní kód (např. "VODA", "ELEKTRINA") |
| nazev | VARCHAR(255) | Ano | Název služby |
| popis | TEXT | Ne | Detailní popis |
| typ_uctovani | VARCHAR(50) | Ano | Typ účtování (viz níže) |
| jednotka | VARCHAR(50) | Ne | Jednotka (Kč, Kč/m³, Kč/kWh, Kč/osoba) |
| zakladni_cena | DECIMAL(12,2) | Ne | Výchozí cena za jednotku |
| sazba_dph | DECIMAL(5,4) | Ne | Sazba DPH (default 0.21) |
| kategorie | VARCHAR(50) | Ne | Kategorie služby |
| aktivni | BOOLEAN | Ne | Aktivní/neaktivní (default true) |
| poznamky | TEXT | Ne | Poznámky |
| created_at | TIMESTAMPTZ | Auto | Datum vytvoření |
| updated_at | TIMESTAMPTZ | Auto | Datum poslední úpravy |
| created_by | UUID | Ne | Kdo vytvořil |
| updated_by | UUID | Ne | Kdo upravil |

#### Možné hodnoty typ_uctovani:
- `pevna_sazba` - Pevná částka (např. internet 500 Kč/měsíc)
- `merena_spotreba` - Podle skutečné spotřeby (voda, elektřina)
- `na_pocet_osob` - Podle počtu osob (odvoz odpadu)
- `na_m2` - Podle plochy (úklid)
- `procento_z_najmu` - Procento z nájemného (provize)

#### Možné hodnoty kategorie:
- `energie` - Elektřina, plyn, teplo
- `voda` - Studená a teplá voda
- `internet` - Internetové připojení
- `spravne_poplatky` - Fond oprav, úklid, správa
- `jina` - Ostatní služby

#### Indexy:
- `idx_service_definitions_kod` - na sloupci `kod`
- `idx_service_definitions_kategorie` - na sloupci `kategorie`
- `idx_service_definitions_aktivni` - na sloupci `aktivni`

### 2.2 Tabulka: contract_service_lines (Služby na smlouvách)

Propojení služeb ze smlouvami, včetně konkrétních cen a podmínek.

#### Struktura:

| Sloupec | Typ | Povinné | Popis |
|---------|-----|---------|-------|
| id | UUID | Ano | Primární klíč |
| contract_id | UUID | Ano | FK na contracts(id) |
| service_definition_id | UUID | Ne | FK na service_definitions(id) |
| nazev | VARCHAR(255) | Ano | Název služby (kopie) |
| typ_uctovani | VARCHAR(50) | Ano | Typ účtování (kopie) |
| jednotka | VARCHAR(50) | Ne | Jednotka (kopie) |
| plati | VARCHAR(50) | Ano | Kdo platí (najemnik/pronajimatel/sdilene) |
| zaklad_pro_vypocet | DECIMAL(12,4) | Ne | Základ pro výpočet (m², osoby, apod.) |
| cena_za_jednotku | DECIMAL(12,2) | Ano | Cena za jednotku |
| perioda_fakturace | VARCHAR(50) | Ne | Periodicita (mesicni/ctvrtletni/rocni) |
| meridlo_id | UUID | Ne | Odkaz na měřidlo (budoucí) |
| od_data | DATE | Ne | Platnost od |
| do_data | DATE | Ne | Platnost do |
| odhadovane_mesicni_naklady | DECIMAL(12,2) | Auto | Vypočtené měsíční náklady |
| zahrnuto_v_najmu | BOOLEAN | Ne | Je zahrnuto v nájmu? |
| typ_line | VARCHAR(50) | Ne | Typ položky (zalohova/vypocet/korekce) |
| linked_line_id | UUID | Ne | Vazba na jinou položku |
| poznamky | TEXT | Ne | Poznámky |
| created_at | TIMESTAMPTZ | Auto | Datum vytvoření |
| updated_at | TIMESTAMPTZ | Auto | Datum poslední úpravy |
| created_by | UUID | Ne | Kdo vytvořil |
| updated_by | UUID | Ne | Kdo upravil |

#### Indexy:
- `idx_contract_service_lines_contract` - na sloupci `contract_id`
- `idx_contract_service_lines_service_def` - na sloupci `service_definition_id`
- `idx_contract_service_lines_plati` - na sloupci `plati`
- `idx_contract_service_lines_dates` - na sloupcích `od_data, do_data`

### 2.3 View: contract_services_summary

Agregovaný pohled na náklady služeb podle smlouvy.

```sql
SELECT 
  contract_id,
  COUNT(*) as pocet_sluzeb,
  SUM(CASE WHEN plati = 'najemnik' THEN odhadovane_mesicni_naklady ELSE 0 END) as naklady_najemnik,
  SUM(CASE WHEN plati = 'pronajimatel' THEN odhadovane_mesicni_naklady ELSE 0 END) as naklady_pronajimatel,
  SUM(CASE WHEN plati = 'sdilene' THEN odhadovane_mesicni_naklady ELSE 0 END) as naklady_sdilene
FROM contract_service_lines
WHERE do_data IS NULL OR do_data >= CURRENT_DATE
GROUP BY contract_id
```

### 2.4 Funkce: calculate_monthly_cost

Vypočítá měsíční náklady na základě periodicity.

```sql
calculate_monthly_cost(zaklad DECIMAL, cena_za_jednotku DECIMAL, perioda VARCHAR) RETURNS DECIMAL
```

**Logika:**
- `mesicni`: náklady = zaklad × cena
- `ctvrtletni`: náklady = (zaklad × cena) / 3
- `rocni`: náklady = (zaklad × cena) / 12

---

## 3. Struktura modulu

```
src/modules/070-sluzby/
├── module.config.js          # Manifest modulu
├── db.js                      # Databázové funkce
├── meta.js                    # Metadata (volitelné)
├── tiles/                     # Přehledové tiles
│   ├── prehled.js            # Hlavní přehled všech služeb
│   ├── katalog.js            # Katalog služeb
│   ├── energie.js            # Filtr: energetické služby
│   ├── voda.js               # Filtr: vodní služby
│   ├── internet.js           # Filtr: internet
│   ├── spravne-poplatky.js   # Filtr: správní poplatky
│   ├── seznam.js             # Seznam služeb na smlouvách
│   └── nastaveni.js          # Nastavení modulu
├── forms/                     # Formuláře
│   ├── detail.js             # Detail služby (read-only)
│   ├── edit.js               # Editace služby
│   └── pridat-do-smlouvy.js  # Přidání služby do smlouvy
├── services/                  # Pomocné služby (volitelné)
└── assets/                    # Dokumentace a assets
    ├── README.md
    ├── datovy-model.md
    ├── permissions.md
    ├── checklist.md
    └── SPECIFIKACE-PRO-AGENTA.md
```

---

## 4. Tiles (Přehledy)

### 4.1 Tile: prehled (Hlavní přehled)

**Účel:** Zobrazí všechny služby z katalogu s možností filtrace a vyhledávání.

#### Konfigurace:
```javascript
{
  id: 'prehled',
  title: 'Přehled',
  icon: 'list'
}
```

#### Breadcrumb:
```javascript
[
  { icon: 'home', label: 'Domů', href: '#/' },
  { icon: 'settings', label: 'Služby' },
  { icon: 'list', label: 'Přehled' }
]
```

#### CommonActions:
- `add` - Přidat novou službu
- `edit` - Upravit vybranou službu
- `archive` - Deaktivovat službu
- `refresh` - Obnovit data

#### Sloupce tabulky:

| Klíč | Název | Šířka | Řazení | Popis |
|------|-------|-------|--------|-------|
| kod | Kód | 10% | Ano | Unikátní kód služby |
| nazev | Název | 25% | Ano | Název služby |
| kategorie | Kategorie | 15% | Ano | Kategorie (energie/voda/...) |
| typ_uctovani | Typ účtování | 15% | Ne | Způsob účtování |
| zakladni_cena | Základní cena | 12% | Ano | Cena za jednotku |
| jednotka | Jednotka | 10% | Ne | Měrná jednotka |
| aktivni | Aktivní | 8% | Ano | Stav služby |

#### Callbacks:
- `onRowClick(row)` - Výběr řádku (selekce)
- `onRowDblClick(row)` - Navigace na detail: `#/m/070-sluzby/f/detail?id={row.id}`

#### Implementace:
```javascript
// src/modules/070-sluzby/tiles/prehled.js
import { listServiceDefinitions } from '../db.js';
import { renderTable } from '/src/ui/table.js';
import { renderCommonActions } from '/src/ui/commonActions.js';
import { setBreadcrumb } from '/src/ui/breadcrumb.js';
import { navigateTo } from '/src/app.js';

let selectedRow = null;

export async function render(root, manifest, params = {}) {
  const { userRole = 'user' } = params;
  
  // Breadcrumb
  setBreadcrumb(document.getElementById('crumb'), [
    { icon: 'home', label: 'Domů', href: '#/' },
    { icon: manifest.icon, label: manifest.title },
    { icon: 'list', label: 'Přehled' }
  ]);
  
  // CommonActions
  renderCommonActions(document.getElementById('commonactions'), {
    moduleActions: ['add', 'edit', 'archive', 'refresh'],
    userRole,
    handlers: {
      onAdd: () => navigateTo(`#/m/${manifest.id}/f/edit`),
      onEdit: () => {
        if (!selectedRow) {
          toast('Nejprve vyberte službu', 'warning');
          return;
        }
        navigateTo(`#/m/${manifest.id}/f/edit?id=${selectedRow.id}`);
      },
      onArchive: async () => {
        if (!selectedRow) {
          toast('Nejprve vyberte službu', 'warning');
          return;
        }
        // Implementace archivace
      },
      onRefresh: () => render(root, manifest, params)
    }
  });
  
  // Načti data
  const { data, error } = await listServiceDefinitions({ aktivni: true });
  
  if (error) {
    root.innerHTML = `<div class="text-red-500 p-4">Chyba: ${error.message}</div>`;
    return;
  }
  
  // Vykresli tabulku
  renderTable(root, {
    columns: [
      { key: 'kod', label: 'Kód', sortable: true, width: '10%' },
      { key: 'nazev', label: 'Název', sortable: true, width: '25%' },
      { key: 'kategorie', label: 'Kategorie', sortable: true, width: '15%' },
      { key: 'typ_uctovani', label: 'Typ účtování', width: '15%' },
      { key: 'zakladni_cena', label: 'Základní cena', sortable: true, width: '12%' },
      { key: 'jednotka', label: 'Jednotka', width: '10%' },
      { key: 'aktivni', label: 'Aktivní', sortable: true, width: '8%' }
    ],
    data: data || [],
    onRowClick: (row) => { selectedRow = row; },
    onRowDblClick: (row) => {
      navigateTo(`#/m/${manifest.id}/f/detail?id=${row.id}`);
    }
  });
}

export default render;
```

### 4.2 Tile: katalog (Katalog služeb)

**Účel:** Zobrazí katalog všech dostupných služeb bez ohledu na aktivitu.

Podobná implementace jako `prehled`, ale bez filtru na `aktivni`.

### 4.3 Tile: energie (Energetické služby)

**Účel:** Filtrovaný pohled pouze na energetické služby.

```javascript
const { data, error } = await listServiceDefinitions({ kategorie: 'energie' });
```

### 4.4 Tile: voda (Vodní služby)

**Účel:** Filtrovaný pohled pouze na vodní služby.

```javascript
const { data, error } = await listServiceDefinitions({ kategorie: 'voda' });
```

### 4.5 Tile: internet

**Účel:** Filtrovaný pohled pouze na internetové služby.

```javascript
const { data, error } = await listServiceDefinitions({ kategorie: 'internet' });
```

### 4.6 Tile: spravne-poplatky

**Účel:** Filtrovaný pohled pouze na správní poplatky.

```javascript
const { data, error } = await listServiceDefinitions({ kategorie: 'spravne_poplatky' });
```

### 4.7 Tile: seznam (Služby na smlouvách)

**Účel:** Zobrazí služby přiřazené ke smlouvám.

#### Sloupce:

| Klíč | Název | Šířka | Řazení |
|------|-------|-------|--------|
| contract_cislo | Číslo smlouvy | 15% | Ano |
| nazev | Služba | 20% | Ano |
| plati | Platí | 10% | Ano |
| cena_za_jednotku | Cena/jednotka | 12% | Ano |
| odhadovane_mesicni_naklady | Měsíční náklady | 15% | Ano |
| od_data | Od | 10% | Ano |
| do_data | Do | 10% | Ne |

---

## 5. Forms (Formuláře)

### 5.1 Form: detail (Detail služby)

**Účel:** Zobrazí detail služby v read-only režimu.

#### Breadcrumb:
```javascript
[
  { icon: 'home', label: 'Domů', href: '#/' },
  { icon: 'settings', label: 'Služby', href: '#/m/070-sluzby/t/prehled' },
  { icon: 'list', label: 'Přehled', href: '#/m/070-sluzby/t/prehled' },
  { label: `Detail: ${data.nazev}` }
]
```

#### CommonActions:
- `edit` - Přejít na editaci
- `archive` - Deaktivovat službu
- `history` - Zobrazit historii změn
- `refresh` - Obnovit data

#### Sekce formuláře:

**Základní údaje:**
- Kód (read-only)
- Název (read-only)
- Popis (read-only)
- Kategorie (read-only)

**Účtování:**
- Typ účtování (read-only)
- Jednotka (read-only)
- Základní cena (read-only)
- Sazba DPH (read-only)

**Stav:**
- Aktivní (read-only)
- Poznámky (read-only)

**Systémové údaje:**
- Vytvořeno (created_at)
- Vytvořil (created_by)
- Upraveno (updated_at)
- Upravil (updated_by)

### 5.2 Form: edit (Editace služby)

**Účel:** Umožní vytvořit novou nebo upravit existující službu.

#### Breadcrumb:
```javascript
// Pro novou službu:
[
  { icon: 'home', label: 'Domů', href: '#/' },
  { icon: 'settings', label: 'Služby', href: '#/m/070-sluzby/t/prehled' },
  { icon: 'add', label: 'Nová služba' }
]

// Pro editaci:
[
  { icon: 'home', label: 'Domů', href: '#/' },
  { icon: 'settings', label: 'Služby', href: '#/m/070-sluzby/t/prehled' },
  { icon: 'list', label: 'Přehled', href: '#/m/070-sluzby/t/prehled' },
  { label: `Editace: ${data.nazev}` }
]
```

#### CommonActions:
- `save` - Uložit změny
- `archive` - Deaktivovat službu (pouze při editaci)
- `history` - Historie změn (pouze při editaci)

#### Pole formuláře:

```javascript
const fields = [
  // Základní údaje
  { 
    key: 'kod', 
    label: 'Kód služby', 
    type: 'text', 
    required: true,
    placeholder: 'VODA',
    help: 'Unikátní kód služby (např. VODA, ELEKTRINA)'
  },
  { 
    key: 'nazev', 
    label: 'Název služby', 
    type: 'text', 
    required: true,
    placeholder: 'Studená voda'
  },
  { 
    key: 'popis', 
    label: 'Popis', 
    type: 'textarea', 
    rows: 3,
    placeholder: 'Detailní popis služby...'
  },
  
  // Kategorie a typ
  { 
    key: 'kategorie', 
    label: 'Kategorie', 
    type: 'select', 
    required: true,
    options: [
      { value: 'energie', label: 'Energie' },
      { value: 'voda', label: 'Voda' },
      { value: 'internet', label: 'Internet' },
      { value: 'spravne_poplatky', label: 'Správní poplatky' },
      { value: 'jina', label: 'Jiná' }
    ]
  },
  { 
    key: 'typ_uctovani', 
    label: 'Typ účtování', 
    type: 'select', 
    required: true,
    options: [
      { value: 'pevna_sazba', label: 'Pevná sazba' },
      { value: 'merena_spotreba', label: 'Měřená spotřeba' },
      { value: 'na_pocet_osob', label: 'Na počet osob' },
      { value: 'na_m2', label: 'Na m²' },
      { value: 'procento_z_najmu', label: 'Procento z nájmu' }
    ]
  },
  
  // Cena a jednotka
  { 
    key: 'jednotka', 
    label: 'Jednotka', 
    type: 'text',
    placeholder: 'Kč/m³, Kč/kWh, Kč/měsíc',
    help: 'Měrná jednotka pro účtování'
  },
  { 
    key: 'zakladni_cena', 
    label: 'Základní cena', 
    type: 'number',
    step: '0.01',
    min: '0',
    placeholder: '100.00',
    help: 'Výchozí cena za jednotku v Kč'
  },
  { 
    key: 'sazba_dph', 
    label: 'Sazba DPH', 
    type: 'number',
    step: '0.0001',
    min: '0',
    max: '1',
    placeholder: '0.21',
    help: 'Sazba DPH jako desetinné číslo (0.21 = 21%)'
  },
  
  // Stav
  { 
    key: 'aktivni', 
    label: 'Aktivní', 
    type: 'checkbox',
    help: 'Neaktivní služby se nezobrazují v katalozích'
  },
  
  // Poznámky
  { 
    key: 'poznamky', 
    label: 'Poznámky', 
    type: 'textarea',
    rows: 3
  }
];
```

#### Validace:
- `kod` - povinné, unikátní, pouze velká písmena a podtržítka
- `nazev` - povinné, min 2 znaky
- `kategorie` - povinné
- `typ_uctovani` - povinné
- `zakladni_cena` - pokud vyplněno, musí být >= 0
- `sazba_dph` - pokud vyplněno, musí být 0-1

#### OnSubmit:
```javascript
async function handleSubmit(formData) {
  // Validace
  if (!formData.kod || !formData.nazev) {
    toast('Vyplňte povinná pole', 'error');
    return;
  }
  
  // Uložení
  const { data, error } = id 
    ? await updateServiceDefinition(id, formData)
    : await createServiceDefinition(formData);
  
  if (error) {
    toast(`Chyba při ukládání: ${error.message}`, 'error');
    return;
  }
  
  toast('Služba byla uložena', 'success');
  navigateTo(`#/m/070-sluzby/f/detail?id=${data.id}`);
}
```

### 5.3 Form: pridat-do-smlouvy (Přidání služby do smlouvy)

**Účel:** Modal/form pro přidání služby ze smlouvy.

#### Parametry:
- `contract_id` - ID smlouvy, kam se služba přidává

#### Pole:
```javascript
const fields = [
  {
    key: 'service_definition_id',
    label: 'Služba z katalogu',
    type: 'select',
    options: serviceDefinitions.map(s => ({ value: s.id, label: s.nazev })),
    help: 'Vyberte službu z katalogu nebo vytvořte vlastní'
  },
  {
    key: 'nazev',
    label: 'Název služby',
    type: 'text',
    required: true
  },
  {
    key: 'plati',
    label: 'Platí',
    type: 'select',
    required: true,
    options: [
      { value: 'najemnik', label: 'Nájemník' },
      { value: 'pronajimatel', label: 'Pronajímatel' },
      { value: 'sdilene', label: 'Sdílené' }
    ]
  },
  {
    key: 'cena_za_jednotku',
    label: 'Cena za jednotku',
    type: 'number',
    required: true,
    step: '0.01'
  },
  {
    key: 'zaklad_pro_vypocet',
    label: 'Základ pro výpočet',
    type: 'number',
    help: 'Počet osob, m², apod.'
  },
  {
    key: 'perioda_fakturace',
    label: 'Perioda fakturace',
    type: 'select',
    options: [
      { value: 'mesicni', label: 'Měsíční' },
      { value: 'ctvrtletni', label: 'Čtvrtletní' },
      { value: 'rocni', label: 'Roční' }
    ]
  },
  {
    key: 'od_data',
    label: 'Platnost od',
    type: 'date'
  },
  {
    key: 'do_data',
    label: 'Platnost do',
    type: 'date'
  }
];
```

---

## 6. Database operace (db.js)

### 6.1 Struktura db.js

```javascript
// src/modules/070-sluzby/db.js
import { supabase } from '/src/supabase.js';

// ============================================================================
// SERVICE DEFINITIONS - Katalog služeb
// ============================================================================

/**
 * Načte seznam služeb z katalogu
 * @param {Object} options - Filtry
 * @param {string} options.kategorie - Filtr podle kategorie
 * @param {boolean} options.aktivni - Filtr podle aktivity
 * @returns {Promise<{data: Array, error: Error}>}
 */
export async function listServiceDefinitions(options = {}) {
  const { kategorie, aktivni } = options;
  
  let query = supabase
    .from('service_definitions')
    .select('*')
    .order('nazev', { ascending: true });
  
  if (kategorie) {
    query = query.eq('kategorie', kategorie);
  }
  
  if (aktivni !== undefined && aktivni !== null) {
    query = query.eq('aktivni', aktivni);
  }
  
  const { data, error } = await query;
  return { data: data || [], error };
}

/**
 * Načte detail služby podle ID
 * @param {string} id - UUID služby
 * @returns {Promise<{data: Object, error: Error}>}
 */
export async function getServiceDefinition(id) {
  const { data, error } = await supabase
    .from('service_definitions')
    .select('*')
    .eq('id', id)
    .single();
  
  return { data, error };
}

/**
 * Vytvoří novou službu v katalogu
 * @param {Object} serviceData - Data služby
 * @returns {Promise<{data: Object, error: Error}>}
 */
export async function createServiceDefinition(serviceData) {
  const { data, error } = await supabase
    .from('service_definitions')
    .insert({
      ...serviceData,
      created_at: new Date().toISOString()
    })
    .select()
    .single();
  
  return { data, error };
}

/**
 * Aktualizuje existující službu
 * @param {string} id - UUID služby
 * @param {Object} serviceData - Nová data
 * @returns {Promise<{data: Object, error: Error}>}
 */
export async function updateServiceDefinition(id, serviceData) {
  const { data, error } = await supabase
    .from('service_definitions')
    .update({
      ...serviceData,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();
  
  return { data, error };
}

/**
 * Deaktivuje službu (soft delete)
 * @param {string} id - UUID služby
 * @returns {Promise<{data: Object, error: Error}>}
 */
export async function deactivateServiceDefinition(id) {
  return await updateServiceDefinition(id, { aktivni: false });
}

// ============================================================================
// CONTRACT SERVICE LINES - Služby na smlouvách
// ============================================================================

/**
 * Načte služby přiřazené ke smlouvě
 * @param {string} contractId - UUID smlouvy
 * @returns {Promise<{data: Array, error: Error}>}
 */
export async function listContractServices(contractId) {
  const { data, error } = await supabase
    .from('contract_service_lines')
    .select(`
      *,
      service_definition:service_definitions(kod, nazev, kategorie)
    `)
    .eq('contract_id', contractId)
    .order('created_at', { ascending: false });
  
  return { data: data || [], error };
}

/**
 * Přidá službu ke smlouvě
 * @param {Object} lineData - Data služby
 * @returns {Promise<{data: Object, error: Error}>}
 */
export async function addServiceToContract(lineData) {
  const { data, error } = await supabase
    .from('contract_service_lines')
    .insert({
      ...lineData,
      created_at: new Date().toISOString()
    })
    .select()
    .single();
  
  return { data, error };
}

/**
 * Aktualizuje službu na smlouvě
 * @param {string} id - UUID service line
 * @param {Object} lineData - Nová data
 * @returns {Promise<{data: Object, error: Error}>}
 */
export async function updateContractService(id, lineData) {
  const { data, error } = await supabase
    .from('contract_service_lines')
    .update({
      ...lineData,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();
  
  return { data, error };
}

/**
 * Odstraní službu ze smlouvy
 * @param {string} id - UUID service line
 * @returns {Promise<{error: Error}>}
 */
export async function removeServiceFromContract(id) {
  const { error } = await supabase
    .from('contract_service_lines')
    .delete()
    .eq('id', id);
  
  return { error };
}

/**
 * Načte sumář nákladů služeb pro smlouvu
 * @param {string} contractId - UUID smlouvy
 * @returns {Promise<{data: Object, error: Error}>}
 */
export async function getContractServicesSummary(contractId) {
  const { data, error } = await supabase
    .from('contract_services_summary')
    .select('*')
    .eq('contract_id', contractId)
    .single();
  
  return { data, error };
}

// Export všech funkcí
export default {
  listServiceDefinitions,
  getServiceDefinition,
  createServiceDefinition,
  updateServiceDefinition,
  deactivateServiceDefinition,
  listContractServices,
  addServiceToContract,
  updateContractService,
  removeServiceFromContract,
  getContractServicesSummary
};
```

---

## 7. Oprávnění a bezpečnost

### 7.1 Row Level Security (RLS)

#### service_definitions:
- **SELECT**: Všichni přihlášení uživatelé mohou číst katalog
- **INSERT**: Pouze admin a manager
- **UPDATE**: Pouze admin a manager
- **DELETE**: Zakázáno (pouze deaktivace)

#### contract_service_lines:
- **SELECT**: Všichni přihlášení uživatelé
- **INSERT**: Všichni přihlášení uživatelé
- **UPDATE**: Všichni přihlášení uživatelé
- **DELETE**: Všichni přihlášení uživatelé

### 7.2 Role a oprávnění

| Role | Katalog (read) | Katalog (write) | Služby na smlouvách |
|------|----------------|-----------------|---------------------|
| admin | ✅ | ✅ | ✅ |
| manager | ✅ | ✅ | ✅ |
| user | ✅ | ❌ | ✅ (vlastní) |
| readonly | ✅ | ❌ | ✅ (read-only) |

---

## 8. UI komponenty

### 8.1 Použité UI komponenty

- `renderTable` - Tabulky s daty
- `renderForm` - Formuláře
- `renderCommonActions` - Akční lišta
- `setBreadcrumb` - Navigační breadcrumb
- `toast` - Notifikace
- `modal` - Modální okna
- `tabs` - Záložky (pro detail)

### 8.2 Ikony

| Položka | Ikona |
|---------|-------|
| Modul | settings |
| Přehled | list |
| Katalog | list_alt |
| Energie | bolt |
| Voda | water_drop |
| Internet | wifi |
| Správní poplatky | account_balance |
| Detail | visibility |
| Edit | edit |
| Přidat | add_circle |

---

## 9. Validace a chybové stavy

### 9.1 Validace dat

#### service_definitions:
- `kod`: povinné, unikátní, regex: `^[A-Z_]+$`
- `nazev`: povinné, min 2 znaky, max 255 znaků
- `kategorie`: povinné, z enum
- `typ_uctovani`: povinné, z enum
- `zakladni_cena`: >= 0
- `sazba_dph`: 0 <= x <= 1

#### contract_service_lines:
- `contract_id`: povinné, musí existovat
- `nazev`: povinné
- `plati`: povinné, z enum (najemnik/pronajimatel/sdilene)
- `cena_za_jednotku`: povinné, > 0
- `od_data` <= `do_data` (pokud oba vyplněny)

### 9.2 Chybové stavy

#### Prázdný stav (no data):
```html
<div class="text-center p-8 text-slate-500">
  <div class="text-4xl mb-4">📋</div>
  <div class="text-lg font-medium mb-2">Žádné služby</div>
  <div class="text-sm">Zatím nebyla přidána žádná služba do katalogu.</div>
  <button class="mt-4 btn-primary">Přidat první službu</button>
</div>
```

#### Loading state:
```html
<div class="text-center p-8">
  <div class="spinner mb-4"></div>
  <div class="text-slate-600">Načítám služby...</div>
</div>
```

#### Error state:
```html
<div class="p-4 bg-red-50 border border-red-200 rounded text-red-700">
  <div class="font-medium mb-1">⚠️ Chyba při načítání</div>
  <div class="text-sm">${error.message}</div>
  <button class="mt-2 btn-sm" onclick="retry()">Zkusit znovu</button>
</div>
```

---

## 10. Checklist implementace

### 10.1 Příprava

- [ ] Zkontrolovat, že migrace 005 byla spuštěna v Supabase
- [ ] Ověřit existenci tabulek `service_definitions` a `contract_service_lines`
- [ ] Ověřit základní data v katalogu služeb
- [ ] Zkontrolovat RLS policies

### 10.2 Module config

- [ ] `module.config.js` správně vyplněn
- [ ] ID modulu: `070-sluzby`
- [ ] Default tile: `prehled`
- [ ] Všechny tiles definovány (7 tiles)
- [ ] Všechny forms definovány (3 forms)

### 10.3 Database vrstva

- [ ] `db.js` obsahuje všechny CRUD funkce pro service_definitions
- [ ] `db.js` obsahuje všechny CRUD funkce pro contract_service_lines
- [ ] Funkce správně používají supabase client
- [ ] Error handling implementován
- [ ] Funkce jsou dokumentovány (JSDoc)

### 10.4 Tiles

- [ ] `prehled.js` - kompletní implementace
- [ ] `katalog.js` - implementace
- [ ] `energie.js` - filtr na energii
- [ ] `voda.js` - filtr na vodu
- [ ] `internet.js` - filtr na internet
- [ ] `spravne-poplatky.js` - filtr na správní poplatky
- [ ] `seznam.js` - služby na smlouvách
- [ ] Všechny tiles mají breadcrumb
- [ ] Všechny tiles mají CommonActions
- [ ] Implementován loading state
- [ ] Implementován empty state
- [ ] Implementován error state

### 10.5 Forms

- [ ] `detail.js` - read-only detail
- [ ] `edit.js` - editace/vytváření
- [ ] `pridat-do-smlouvy.js` - přidání do smlouvy
- [ ] Všechny forms mají breadcrumb
- [ ] Všechny forms mají CommonActions
- [ ] Validace formulářů implementována
- [ ] Error handling implementován
- [ ] Success/error toast notifikace

### 10.6 Integrace

- [ ] Modul zaregistrován v `src/app/modules.index.js`
- [ ] Navigace funguje mezi tiles a forms
- [ ] Integrace s modulem 060 (Smlouvy)
- [ ] Historie změn (pokud implementováno)
- [ ] Přílohy (pokud implementováno)

### 10.7 Testování

- [ ] Modul se zobrazuje v sidebaru
- [ ] Lze otevřít všechny tiles
- [ ] Lze otevřít všechny forms
- [ ] Lze vytvořit novou službu
- [ ] Lze upravit službu
- [ ] Lze deaktivovat službu
- [ ] Lze přidat službu ke smlouvě
- [ ] Výpočty měsíčních nákladů fungují správně
- [ ] Filtrování funguje
- [ ] Řazení funguje
- [ ] Vyhledávání funguje (pokud implementováno)

### 10.8 Dokumentace

- [ ] README.md aktualizován
- [ ] datovy-model.md kompletní
- [ ] permissions.md kompletní
- [ ] checklist.md kompletní
- [ ] Kód obsahuje komentáře na kritických místech

---

## Závěr

Tato specifikace poskytuje kompletní návod pro implementaci modulu 070 - Služby. Agent by měl postupovat podle checklistu a implementovat každou část modulárně.

**Klíčové zásady:**
1. Konzistence s ostatními moduly (030, 040, 060)
2. Bezpečnost na prvním místě (RLS, validace)
3. Uživatelská přívětivost (error stavy, loading)
4. Čistý a čitelný kód
5. Dokumentace

**Doporučené pořadí implementace:**
1. Database vrstva (db.js)
2. Základní tile (prehled.js)
3. Detail form (detail.js)
4. Edit form (edit.js)
5. Ostatní tiles (filtry)
6. Přidání do smlouvy (pridat-do-smlouvy.js)
7. Testování a ladění

---

**Konec specifikace - Modul 070** ✅
