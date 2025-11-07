# Dokumentace Ikon a Tlačítek - Souhrn

Tento dokument shrnuje kompletní dokumentaci ikon a tlačítek v aplikaci.

## 📁 Vytvořené soubory

### 1. icon_button.md (27 KB)
Markdown dokumentace obsahující:
- Statistiky použití (242 ikon celkem, 84 použitých, 19 tlačítek, 17 kategorií)
- Kompletní přehled všech tlačítek s českými a anglickými názvy
- Seznam použitých ikon v kódu
- Všechny dostupné ikony seřazené podle kategorií s překlady a aliasy

### 2. icon_button.xlsx (27 KB)
Excel sešit se dvěma listy:
- **List 1: "Použité v aplikaci"** (115 řádků, 7 sloupců)
  - Statistiky
  - Tlačítka: Klíč, Ikona, Emoji, Název CZ, Název EN, Popis, Kategorie
  - Použité ikony: Ikona, Klíč, Název CZ, Název EN, Aliasy CZ, Aliasy EN, Kategorie

- **List 2: "Dostupné ikony pro výběr"** (284 řádků, 6 sloupců)
  - Všechny 242 ikon podle kategorií
  - Sloupce: Ikona, Klíč, Název CZ, Název EN, Aliasy CZ, Aliasy EN
  - Barevné formátování pro kategorie

### 3. icon-translations.json (31 KB)
Databáze překladů obsahující:
- 244 ikon s plnými překlady
- České a anglické názvy
- Vícero aliasů v obou jazycích
- Kontextové překlady pro doménově specifické termíny

### 4. generate-comprehensive-icon-docs.js (13 KB)
Automatizační skript:
- Skenuje všechny JS/JSX soubory v repozitáři
- Extrahuje použití ikon pomocí regex vzorů
- Načítá překlady z JSON souboru
- Generuje MD a XLSX dokumentaci

## 🎯 Jak to funguje

### Skenování kódu
Skript prochází všechny soubory v `src/` a hledá:
```javascript
icon: 'nazev-ikony'
icon('nazev-ikony')
ICONS.nazev
ICONS['nazev-ikony']
```

### Kategorie ikon
Ikony jsou rozděleny do 17 kategorií:
1. ZÁKLAD / NAV (navigace, domů, menu, uživatelé...)
2. CRUD / ACTIONS (přidat, upravit, smazat, uložit...)
3. NAV/FILE (složky, soubory, nahrání, stažení...)
4. COMMUNICATION (pošta, zprávy, chat...)
5. MEDIA / PLAYER (přehrát, pauza, záznam...)
6. STATUS / STATE (hotovo, chyba, varování...)
7. DATA / CHARTS (grafy, statistiky...)
8. CALENDAR / TIME (kalendář, hodiny, časovač...)
9. SOCIAL / FAVORITES (hvězdička, srdce, záložka...)
10. E-COMMERCE / FINANCE (košík, karta, faktura...)
11. MAP / GEO (mapa, poloha, kompas...)
12. TRANSPORT (auto, vlak, letadlo...)
13. BUILDINGS / PROPERTY (budova, byt, sklad...)
14. HEALTH / WEATHER / NATURE (slunce, déšť, list...)
15. DEVOPS / INFRA (server, API, bezpečnost...)
16. ACCESSIBILITY / UI TYPES (dlaždice, mřížka, formulář...)
17. MISC (telefon, tisk, export...)

## 📊 Příklad použití

### V Markdown dokumentaci
```markdown
| Klíč | Ikona | Název CZ | Název EN | Kategorie |
|------|-------|----------|----------|-----------|
| `home` | 🏠 | Domů | Home | ZÁKLAD / NAV |
| `add` | ➕ | Přidat | Add | CRUD / ACTIONS |
| `car` | 🚗 | Auto | Car | TRANSPORT |
```

### V Excelu - List 2
```
Ikona | Klíč      | Název CZ | Název EN | Aliasy CZ                    | Aliasy EN
🏠    | home      | Domů     | Home     | domovská stránka, úvod       | house, main
📊    | dashboard | Nástěnka | Dashboard| přehled, panel               | overview, panel
👥    | users     | Uživatelé| Users    | lidé, osoby                  | people, persons
```

## 🔄 Aktualizace dokumentace

Kdykoli potřebujete aktualizovat dokumentaci:

```bash
node generate-comprehensive-icon-docs.js
```

Skript automaticky:
1. Naskenuje celý repozitář
2. Načte nejnovější ikony a tlačítka
3. Aplikuje překlady z JSON souboru
4. Vygeneruje oba výstupní soubory (MD a XLSX)

## 💡 Tipy

- Pro přidání nové ikony: přidejte ji do `src/ui/icons.js` a `icon-translations.json`
- Pro změnu překladu: upravte `icon-translations.json`
- Pro nové tlačítko: přidejte do `src/ui/commonActions.js` nebo `src/ui/actionButtons.js`

---

**Celková statistika:**
- ✅ 242 ikon v systému
- ✅ 84 ikon skutečně použitých
- ✅ 19 tlačítek/akcí
- ✅ 17 kategorií
- ✅ 244 překladů
- ✅ Plná podpora CZ/EN
