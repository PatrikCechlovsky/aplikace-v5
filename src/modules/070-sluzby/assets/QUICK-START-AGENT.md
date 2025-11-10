# Quick Start Guide pro AI Agenta - Modul 070

> **Pro AI agenta:** Tento dokument poskytuje rychlý přehled a odkazy na hlavní dokumentaci.

---

## 🎯 Tvůj úkol

Implementovat funkční modul 070 (Služby) podle poskytnuté specifikace.

---

## 📚 Hlavní dokumenty (čti v tomto pořadí)

### 1. SPECIFIKACE-PRO-AGENTA.md
**→ ZAČNI TADY!**

Toto je tvůj hlavní dokument. Obsahuje:
- ✅ Kompletní datový model (2 tabulky)
- ✅ Přesné specifikace všech 8 tiles
- ✅ Přesné specifikace všech 3 forms
- ✅ Všechny database funkce (db.js)
- ✅ Oprávnění a RLS
- ✅ UI komponenty
- ✅ Validace a chyby

### 2. datovy-model.md
Detailní popis databáze:
- Tabulky service_definitions a contract_service_lines
- Sloupce, typy, constraints
- RLS policies
- Funkce a triggery

### 3. permissions.md
Oprávnění podle rolí:
- admin - plný přístup
- manager - plný přístup
- user - omezený přístup
- readonly - pouze čtení

### 4. checklist.md
Kontrolní seznam s 200+ položkami pro validaci implementace.

### 5. README.md
User-friendly přehled modulu.

---

## 🚀 Doporučené pořadí implementace

### Fáze 1: Database vrstva (1-2 hodiny)
```
1. Ověř, že migrace 005 byla spuštěna ✓
2. Implementuj src/modules/070-sluzby/db.js
   - listServiceDefinitions()
   - getServiceDefinition()
   - createServiceDefinition()
   - updateServiceDefinition()
   - deactivateServiceDefinition()
   - listContractServices()
   - addServiceToContract()
   - updateContractService()
   - removeServiceFromContract()
   - getContractServicesSummary()
```

### Fáze 2: Základní tile (1-2 hodiny)
```
3. Implementuj src/modules/070-sluzby/tiles/prehled.js
   - Breadcrumb
   - CommonActions
   - Načtení dat
   - Tabulka
   - Výběr a navigace
   - Loading/empty/error states
```

### Fáze 3: Detail form (1 hodina)
```
4. Implementuj src/modules/070-sluzby/forms/detail.js
   - Breadcrumb
   - CommonActions
   - Načtení dat
   - Zobrazení všech polí (read-only)
   - Sekce (Základní, Účtování, Stav, Systém)
```

### Fáze 4: Edit form (2-3 hodiny)
```
5. Implementuj src/modules/070-sluzby/forms/edit.js
   - Režim CREATE vs UPDATE
   - Všechna pole (viz specifikace)
   - Validace
   - onSubmit handler
   - Toast notifikace
   - Navigace
```

### Fáze 5: Ostatní tiles (2-3 hodiny)
```
6. Implementuj filtrovací tiles:
   - tiles/katalog.js
   - tiles/energie.js
   - tiles/voda.js
   - tiles/internet.js
   - tiles/spravne-poplatky.js
   - tiles/seznam.js
```

### Fáze 6: Integrace se smlouvami (1-2 hodiny)
```
7. Implementuj forms/pridat-do-smlouvy.js
   - Výběr z katalogu
   - Vyplnění ceny a podmínek
   - Uložení
```

### Fáze 7: Testování (2-3 hodiny)
```
8. Projdi checklist.md a otestuj:
   - CRUD operace
   - Oprávnění podle rolí
   - Navigace
   - Validace
   - Error states
   - Výpočty nákladů
```

---

## 📋 Klíčové soubory k vytvoření/úpravě

```
src/modules/070-sluzby/
├── module.config.js          ← Už existuje, zkontroluj
├── db.js                      ← IMPLEMENTUJ
├── tiles/
│   ├── prehled.js            ← IMPLEMENTUJ (priorita 1)
│   ├── katalog.js            ← IMPLEMENTUJ
│   ├── energie.js            ← IMPLEMENTUJ
│   ├── voda.js               ← IMPLEMENTUJ
│   ├── internet.js           ← IMPLEMENTUJ
│   ├── spravne-poplatky.js   ← IMPLEMENTUJ
│   ├── seznam.js             ← IMPLEMENTUJ
│   └── nastaveni.js          ← Už existuje
└── forms/
    ├── detail.js             ← IMPLEMENTUJ (priorita 2)
    ├── edit.js               ← IMPLEMENTUJ (priorita 3)
    └── pridat-do-smlouvy.js  ← IMPLEMENTUJ
```

---

## ⚠️ Důležité zásady

1. **Konzistence:** Drž se vzorů z modulu 030 (pronajimatel)
2. **Bezpečnost:** Respektuj RLS a oprávnění podle rolí
3. **Error handling:** Všude ošetři chybové stavy
4. **Validace:** Validuj vstupy na frontendu i backendu (RLS)
5. **UI stavy:** Loading, empty, error pro každý view
6. **Breadcrumb:** Všude nastav breadcrumb
7. **CommonActions:** Používej podle kontextu a role
8. **Toast:** Notifikuj uživatele o úspěchu/chybě

---

## 🔍 Reference k existujícím modulům

Pokud si nejsi jistý, jak něco implementovat, podívej se na:

- **Module 030 (pronajimatel):** Podobná struktura, reference implementace
- **Module 040 (nemovitost):** Komplexní modul s vazbami
- **NEW/08-SABLONA-MODULU.md:** Šablona pro nové moduly
- **aplikace-v5_stav.md:** Celková dokumentace aplikace

---

## ✅ Checklist před dokončením

Před tím, než označíš úkol za hotový:

- [ ] Všechny tiles fungují
- [ ] Všechny forms fungují
- [ ] CRUD operace fungují
- [ ] Validace funguje
- [ ] Oprávnění fungují podle rolí
- [ ] Error states jsou implementovány
- [ ] Toast notifikace fungují
- [ ] Navigace funguje
- [ ] Breadcrumb je všude
- [ ] CommonActions jsou všude
- [ ] Modul se zobrazuje v sidebaru
- [ ] Výpočet měsíčních nákladů funguje
- [ ] Integrace s modulem 060 funguje
- [ ] Žádné console errors
- [ ] Projel jsi kompletní checklist.md

---

## 🆘 Pokud něco nefunguje

1. **Zkontroluj console** - jsou tam chyby?
2. **Zkontroluj network tab** - jsou RLS chyby?
3. **Zkontroluj databázi** - je migrace 005 spuštěna?
4. **Zkontroluj oprávnění** - má uživatel správnou roli?
5. **Zkontroluj URL** - jsou parametry správně předány?
6. **Zkontroluj import paths** - jsou správné relativní cesty?

---

## 📞 Struktura manifestu (module.config.js)

Ověř, že manifest obsahuje:

```javascript
{
  id: '070-sluzby',
  title: 'Služby',
  icon: 'settings',
  defaultTile: 'prehled',
  tiles: [
    // 8 tiles - viz specifikace
  ],
  forms: [
    // 3 forms - viz specifikace
  ]
}
```

---

## 🎓 Tipy pro efektivní implementaci

1. **Začni od db.js** - bez správné datové vrstvy nic nebude fungovat
2. **Testuj průběžně** - po každé implementované části otestuj
3. **Používej console.log** při vývoji (pak odstraň)
4. **Kopíruj vzory** z modulu 030, nemusíš vymýšlet znovu
5. **Validuj data** - nikdy nevěř vstupům od uživatele
6. **Piš komentáře** u složitějších částí
7. **Commituj často** - malé commity jsou lepší než velké

---

## 🎯 Minimální funkční verze (MVP)

Pokud máš časový limit, zaměř se na MVP:

**MUST HAVE:**
- ✅ db.js s CRUD funkcemi
- ✅ tiles/prehled.js
- ✅ forms/detail.js
- ✅ forms/edit.js
- ✅ Základní validace
- ✅ Error handling

**NICE TO HAVE:**
- Filtrovací tiles (energie, voda, atd.)
- forms/pridat-do-smlouvy.js
- Pokročilé validace
- Export/import
- Statistiky

---

**Hodně štěstí s implementací! 🚀**

Pokud máš jakékoliv dotazy, přečti si znovu SPECIFIKACE-PRO-AGENTA.md - obsahuje všechny odpovědi.
