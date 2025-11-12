# Implementace DetailTabsPanel pro moduly 030, 040, 050, 060, 080

## Přehled změn

V rámci rozšíření funkcionality z PR #51 byly přidány detailní pohledy s použitím komponenty `DetailTabsPanel` do následujících modulů:

### Implementované moduly

#### 1. Modul 030 - Pronajímatel
**Soubor:** `src/modules/030-pronajimatel/forms/detail-tabs.js`

**Zobrazované záložky:**
- **Nemovitosti** - Seznam nemovitostí vlastněných pronajímatelem
- **Jednotky** - Seznam všech jednotek napříč nemovitostmi
- **Nájemníci** - Seznam nájemníků z aktivních smluv
- **Smlouvy** - Seznam všech smluv pronajímatele
- **Platby** - Seznam plateb souvisejících se smlouvami

**Přístup:** `#/m/030-pronajimatel/f/detail-tabs?id={ID_PRONAJIMATELE}`

#### 2. Modul 040 - Nemovitost
**Soubor:** `src/modules/040-nemovitost/forms/detail-tabs.js`

**Zobrazované záložky:**
- **Pronajímatelé** - Vlastníci nemovitosti
- **Jednotky** - Seznam jednotek v nemovitosti
- **Nájemníci** - Nájemníci v této nemovitosti
- **Smlouvy** - Smlouvy vztahující se k nemovitosti
- **Platby** - Platby za tuto nemovitost

**Přístup:** `#/m/040-nemovitost/f/detail-tabs?id={ID_NEMOVITOSTI}`

#### 3. Modul 050 - Nájemník
**Soubor:** `src/modules/050-najemnik/forms/detail-tabs.js`

**Zobrazované záložky:**
- **Pronajímatelé** - Pronajímatelé, se kterými má nájemník smlouvy
- **Nemovitosti** - Nemovitosti, ve kterých nájemník bydlí/pronajímá
- **Jednotky** - Konkrétní jednotky nájemníka
- **Smlouvy** - Smlouvy nájemníka
- **Platby** - Historie plateb nájemníka

**Přístup:** `#/m/050-najemnik/f/detail-tabs?id={ID_NAJEMNIKA}`

#### 4. Modul 060 - Smlouva
**Soubor:** `src/modules/060-smlouva/forms/detail-tabs.js`

**Zobrazované záložky:**
- **Pronajímatel** - Detail pronajímatele smlouvy
- **Nemovitost** - Nemovitost uvedená ve smlouvě
- **Jednotka** - Jednotka uvedená ve smlouvě
- **Nájemník** - Detail nájemníka
- **Platby** - Platby související se smlouvou

**Přístup:** `#/m/060-smlouva/f/detail-tabs?id={ID_SMLOUVY}`

#### 5. Modul 080 - Platby
**Soubor:** `src/modules/080-platby/forms/detail-tabs.js`

**Zobrazované záložky:**
- **Smlouva** - Smlouva, ke které platba náleží
- **Pronajímatel** - Pronajímatel z dané smlouvy
- **Nájemník** - Nájemník z dané smlouvy
- **Nemovitost** - Nemovitost související s platbou
- **Jednotka** - Jednotka související s platbou

**Přístup:** `#/m/080-platby/f/detail-tabs?id={ID_PLATBY}`

## Technická implementace

### Použitá komponenta
Všechny moduly využívají sdílenou komponentu `DetailTabsPanel` z `/src/ui/detailTabsPanel.js`, která poskytuje:
- Záložkové rozhraní
- Breadcrumbs navigaci
- Seznam položek (max 10, výška ~300px)
- Detail panel pro vybranou položku
- Double-click navigaci na plný detail
- URL parameter podporu (`?tab=`)

### Datové zdroje
Každý modul využívá existující databázové funkce:
- `listSubjects()` - pro pronajímatele a nájemníky
- `listProperties()`, `listUnits()` - pro nemovitosti a jednotky
- `listContracts()` - pro smlouvy
- `listPayments()` - pro platby

### Aktualizace konfigurace
V každém modulu byl aktualizován `module.config.js` pro přidání nové formy `detail-tabs`:

```javascript
forms: [
  // ...existing forms...
  { id: 'detail-tabs', title: 'Přehled vazeb', icon: 'grid', showInSidebar: false }
]
```

## Použití

### URL pattern
```
#/m/{MODULE_ID}/f/detail-tabs?id={ENTITY_ID}
```

### Navigace mezi záložkami
- Kliknutím na záložku se načte příslušný obsah
- URL se automaticky aktualizuje s parametrem `?tab={TAB_KEY}`
- Double-click na položku v seznamu otevře plný detail entity

### Příklad
Pro zobrazení přehledu pronajímatele s ID `123`:
```
#/m/030-pronajimatel/f/detail-tabs?id=123
```

Pro zobrazení konkrétní záložky (např. smlouvy):
```
#/m/030-pronajimatel/f/detail-tabs?id=123&tab=smlouva
```

## Poznámky

### Modul 090 (Finance)
Modul 090 nebyl implementován, protože zatím neexistuje v systému.

### Budoucí rozšíření
- Možnost přidání dalších záložek (Dokumenty, Systém)
- Implementace filtrování a řazení v seznamech
- Přidání export/import funkcionalit
- Rozšíření o grafické přehledy a statistiky

## Závěr

Implementace poskytuje jednotný způsob zobrazení vztahů mezi entitami v různých modulech. Všechny moduly sdílejí stejnou komponentu a UI pattern, což zajišťuje konzistentní uživatelskou zkušenost napříč celou aplikací.
