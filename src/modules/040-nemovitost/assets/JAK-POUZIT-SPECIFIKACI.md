# JAK POUŽÍT SPECIFIKACI PRO AGENTA

## 📖 Úvod

Vytvořil jsem pro vás **kompletní a detailní specifikaci** pro implementaci modulu 040 (Nemovitosti). Tento dokument kombinuje všechny existující informace a rozšiřuje je o praktické příklady kódu a step-by-step návody.

## 📁 Co bylo vytvořeno

### Hlavní dokument: AGENT-SPECIFICATION.md

Soubor obsahuje **2,196 řádků** detailní specifikace, včetně:

1. **Kompletní databázové schéma**
   - Tabulky `properties` a `units` se všemi sloupci
   - Indexy pro optimální výkon
   - RLS policies pro bezpečnost
   - Triggery pro automatizaci
   - Views pro statistiky

2. **Kompletní strukturu modulu**
   - Manifest (module.config.js)
   - Datová vrstva (db.js) s všemi CRUD funkcemi
   - Tiles (přehledy) s funkčním kódem
   - Forms (formuláře) s funkčním kódem

3. **Funkční ukázky kódu**
   - tiles/prehled.js - kompletní implementace
   - forms/detail.js - kompletní implementace
   - forms/edit.js - kompletní implementace
   - validators.js - validační funkce
   - utils.js - pomocné funkce

4. **Implementační checklist**
   - 9 fází implementace
   - Více než 100 konkrétních úkolů
   - Časové odhady pro každou fázi
   - Priority úkolů

5. **Testování a validace**
   - Funkční testy
   - Bezpečnostní testy
   - UI testy
   - Kontrolní seznam

## 🎯 Pro koho je tato specifikace

Specifikace je navržena pro:

1. **Automatizovaného agenta (AI)** - např. GitHub Copilot, který vytvoří kompletní modul
2. **Lidského vývojáře** - který potřebuje přesný návod krok za krokem
3. **Code review** - jako referenční dokument pro kontrolu implementace

## 📝 Jak použít tuto specifikaci

### Varianta A: Předat automatizovanému agentovi

Můžete celý dokument `AGENT-SPECIFICATION.md` předat AI agentovi s instrukcí:

```
Prosím, implementuj modul 040-nemovitost podle této specifikace.
Dodržuj všechny detaily a postupuj krok za krokem podle checklistu.
```

Agent dostane:
- Kompletní databázové schema pro vytvoření
- Přesné příklady všech potřebných souborů
- Validační pravidla
- Bezpečnostní požadavky
- Testovací scénáře

### Varianta B: Použít jako návod pro manuální implementaci

Pokud budete implementovat sami, postupujte podle checklistu v sekci 13:

1. **Fáze 1: Databáze** (2-4 hodiny)
   - Vytvořte tabulky `properties` a `units`
   - Nastavte indexy
   - Implementujte RLS policies
   - Vytvořte triggery

2. **Fáze 2: Struktura modulu** (1-2 hodiny)
   - Vytvořte adresářovou strukturu
   - Vytvořte manifest
   - Zaregistrujte modul

3. **Fáze 3: Datová vrstva** (3-4 hodiny)
   - Implementujte všechny funkce v db.js
   - Otestujte CRUD operace

4. **Fáze 4: Tiles** (3-5 hodin)
   - Implementujte prehled.js
   - Přidejte filtraci
   - Implementujte CommonActions

5. **Fáze 5: Forms** (4-6 hodin)
   - Implementujte detail.js
   - Implementujte edit.js
   - Přidejte validaci

6. **Fáze 6: Validace a utility** (1-2 hodiny)
   - Implementujte validators.js
   - Implementujte utils.js

7. **Fáze 7: Testování** (2-3 hodiny)
   - Projděte všechny testovací scénáře
   - Opravte nalezené chyby

### Varianta C: Kombinovaný přístup

Můžete použít agenta pro základní strukturu a pak ručně doladit:

1. Nechte agenta vytvořit databázové schema (Fáze 1)
2. Nechte agenta vytvořit základní strukturu (Fáze 2-3)
3. Ručně dokončete UI (Fáze 4-5)
4. Ručně přidejte validace (Fáze 6)
5. Ručně otestujte (Fáze 7)

## 🔍 Klíčové sekce specifikace

### Sekce 4: Databázové schéma
**Najdete zde:**
- Kompletní SQL příkazy pro vytvoření tabulek
- Definici všech sloupců s typy aConstrainty
- Indexy pro optimalizaci
- RLS policies pro bezpečnost
- Triggery pro automatizaci

### Sekce 7: Tiles (Přehledy)
**Najdete zde:**
- Kompletní funkční kód pro tiles/prehled.js
- Příklady tabulek s řazením a filtrací
- CommonActions integrace
- Breadcrumb nastavení

### Sekce 8: Forms (Formuláře)
**Najdete zde:**
- Kompletní funkční kód pro forms/detail.js
- Kompletní funkční kód pro forms/edit.js
- Validace formulářů
- Ukládání dat

### Sekce 10: Validace a utility
**Najdete zde:**
- Validační funkce pro všechna pole
- Formátovací funkce
- Pomocné funkce pro ikony a badgy

### Sekce 13: Checklist implementace
**Najdete zde:**
- Kompletní seznam všech úkolů
- Rozdělení do fází
- Časové odhady
- Priority

## ⏱️ Časové odhady

**Celková doba implementace:** 17-28 hodin

Rozložení:
- Databáze: 2-4 hodiny
- Struktura: 1-2 hodiny  
- Datová vrstva: 3-4 hodiny
- Tiles: 3-5 hodin
- Forms: 4-6 hodin
- Validace: 1-2 hodiny
- Jednotky (volitelné): 4-6 hodin
- Testování: 2-3 hodiny
- Dokumentace: 1-2 hodiny

**Bez správy jednotek:** 13-22 hodin

## 🎓 Doporučený postup

### Pro zkušeného vývojáře:

1. Přečtěte sekci 1-3 (kontext a principy)
2. Vytvořte databázi podle sekce 4
3. Použijte kód ze sekcí 7-8 jako základ
4. Upravte podle potřeb vašeho projektu
5. Otestujte podle sekce 12

### Pro méně zkušeného vývojáře:

1. Přečtěte celou specifikaci
2. Postupujte přesně podle checklistu v sekci 13
3. Kopírujte kód ze sekcí 6-10
4. Neměňte nic, dokud nepochopíte proč
5. Testujte každou fázi před přechodem na další

### Pro AI agenta:

```
Implementuj modul 040-nemovitost podle AGENT-SPECIFICATION.md.

Důležité:
- Dodržuj všechny detaily ve specifikaci
- Postupuj podle checklistu v sekci 13
- Používej přesně uvedené příklady kódu
- Implementuj všechny bezpečnostní kontroly
- Otestuj podle sekce 12
```

## 📚 Související dokumenty

Specifikace odkazuje a vychází z těchto existujících dokumentů:

1. **README.md** - Obecný přehled modulu
2. **datovy-model.md** - Detailní popis datového modelu
3. **permissions.md** - Oprávnění a bezpečnost
4. **checklist.md** - Původní checklist implementace

Nová specifikace **kombinuje a rozšiřuje** všechny tyto dokumenty + přidává:
- Kompletní ukázky kódu
- SQL příkazy pro databázi
- Detailní implementační návod
- Testovací scénáře

## ✅ Kontrola kvality

Před dokončením implementace zkontrolujte:

- [ ] Všechny úkoly v checklistu (sekce 13) jsou hotové
- [ ] Všechny testy (sekce 12) prošly
- [ ] Žádné console errory
- [ ] Bezpečnostní kontroly implementovány
- [ ] Dokumentace aktualizována
- [ ] Kód odpovídá standardům aplikace v5

## 🚀 Začínáme

**Nejjednodušší způsob, jak začít:**

1. Otevřete `AGENT-SPECIFICATION.md`
2. Přejděte na sekci 13 "Checklist implementace"
3. Začněte od prvního bodu "Před začátkem"
4. Postupujte krok za krokem

**Nebo použijte AI asistenta:**

```
Přečti si specifikaci v souboru AGENT-SPECIFICATION.md 
a implementuj modul 040-nemovitost podle ní.
```

## 💡 Tipy a triky

### Tip 1: Používejte modul 030 jako vzor
Modul 030-pronajimatel je referenční implementace. Pokud nevíte, jak něco udělat, podívejte se, jak je to řešeno tam.

### Tip 2: Testujte průběžně
Neimplementujte celý modul najednou. Po každé fázi otestujte, že vše funguje.

### Tip 3: Dodržujte konvence
- Soubory: kebab-case (prehled.js, detail.js)
- Funkce: camelCase (getProperty, listUnits)
- Konstanty: UPPER_SNAKE_CASE (PROPERTY_TYPES)

### Tip 4: Bezpečnost je priorita
- Vždy validujte vstupy
- Vždy používejte RLS policies
- Vždy escapujte HTML

### Tip 5: Dokumentujte, co děláte
- JSDoc pro veřejné funkce
- Komentáře pro složitou logiku
- README pro každý modul

## 📞 Další kroky

Po implementaci modulu 040:

1. **Testujte kompletně** - Projděte všechny testovací scénáře
2. **Code review** - Nechte zkontrolovat kód
3. **Dokumentujte** - Aktualizujte README a další dokumenty
4. **Deploy** - Nasaďte do produkce

## 📖 Závěr

Specifikace v `AGENT-SPECIFICATION.md` je **kompletní průvodce** implementací modulu 040. 

Obsahuje:
- ✅ Vše, co potřebujete vědět
- ✅ Všechny příklady kódu
- ✅ Všechny kontrolní seznamy
- ✅ Všechny testovací scénáře

**Můžete začít hned!**

---

**Vytvořeno:** 2025-11-10  
**Pro modul:** 040-nemovitost  
**Aplikace:** v5
