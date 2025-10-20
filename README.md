# aplikace-v5

## 📋 Dokumentace k standardizaci modulů

Tato aplikace používá **jednotnou strukturu modulů** pro zajištění konzistence a kvality kódu.

### 🎯 Hlavní dokumenty:

1. **[ODPOVED-NA-POZADAVKY.md](docs/ODPOVED-NA-POZADAVKY.md)** ⭐ ZAČNI TADY!
   - Přehled všech identifikovaných problémů
   - Seznam věcí které neodpovídají nastavení
   - Rychlý návod jak to opravit
   - Prioritizace úkolů

2. **[STANDARDIZACNI-NAVOD.md](docs/STANDARDIZACNI-NAVOD.md)** 📚 KOMPLETNÍ NÁVOD
   - Podrobné šablony pro dlaždice a formuláře
   - SQL skripty pro databázi
   - Kompletní příklady kódu
   - Kontrolní checklisty

3. **[MODUL-CHECKLIST.md](docs/MODUL-CHECKLIST.md)** ✅ KONTROLNÍ SEZNAM
   - 189 kontrolních bodů
   - Formulář pro hodnocení modulu
   - Akční plán

4. **[RYCHLY-PRUVODCE.md](docs/RYCHLY-PRUVODCE.md)** 🚀 VYTVOŘ NOVÝ MODUL
   - Krok-za-krokem návod (30 minut)
   - Copy-paste šablony
   - Troubleshooting

### 📊 Aktuální stav modulů:

```
✅ 010-sprava-uzivatelu  (REFERENČNÍ - VZOR pro ostatní)
✅ 020-muj-ucet          (potřebuje rozšíření)
⚠️ 030-pronajimatel      (potřebuje doplnit historii, breadcrumbs)
❌ 040-nemovitost        (prázdné soubory - nutná reimplementace)
⚠️ 050-najemnik          (potřebuje doplnit historii, breadcrumbs)
❌ 060-990 moduly        (zakomentované, zatím nepřipravené)
```

### 🎯 Priority:

1. **KRITICKÉ**: Opravit modul 040-nemovitost (prázdné soubory)
2. **KRITICKÉ**: Přidat historii změn do modulů 030, 050
3. **DŮLEŽITÉ**: Sjednotit commonActions ve všech modulech
4. **DŮLEŽITÉ**: Přidat breadcrumbs všude kde chybí

### 🔧 Struktura aplikace:

```
src/
├── app/
│   ├── app.js              # Hlavní aplikace
│   └── modules.index.js    # Registry modulů
├── modules/
│   ├── 010-sprava-uzivatelu/  # ⭐ REFERENČNÍ MODUL (použij jako vzor)
│   ├── 020-muj-ucet/
│   ├── 030-pronajimatel/
│   ├── 040-nemovitost/
│   └── 050-najemnik/
├── ui/
│   ├── table.js           # Komponenta tabulky
│   ├── form.js            # Komponenta formuláře
│   ├── commonActions.js   # Akční lišta
│   ├── breadcrumb.js      # Breadcrumbs
│   └── ...
├── db/
│   └── db.js              # Databázové funkce
└── security/
    └── permissions.js     # Oprávnění

docs/
├── ODPOVED-NA-POZADAVKY.md      # ⭐ ZAČNI TADY
├── STANDARDIZACNI-NAVOD.md      # Kompletní návod
├── MODUL-CHECKLIST.md           # Kontrolní seznam
└── RYCHLY-PRUVODCE.md           # Vytvoř nový modul
```

### 📖 Jak používat dokumentaci:

**Pokud chceš:**
- 👉 Zjistit co je špatně → `ODPOVED-NA-POZADAVKY.md`
- 👉 Opravit existující modul → `STANDARDIZACNI-NAVOD.md` + `MODUL-CHECKLIST.md`
- 👉 Vytvořit nový modul → `RYCHLY-PRUVODCE.md`
- 👉 Vidět vzorový kód → `/src/modules/010-sprava-uzivatelu/`

### 🎯 Klíčové standardy:

- ✅ Každý modul má `module.config.js` manifest
- ✅ Breadcrumbs v každém view (Domů › Modul › Sekce)
- ✅ CommonActions VŽDY v `#commonactions` kontejneru
- ✅ Historie změn pro všechny hlavní entity
- ✅ Filtrace + checkbox "Zobrazit archivované"
- ✅ Readonly pole v formulářích (created_at, updated_at, updated_by)
- ✅ Unsaved helper pro ochranu dat
- ✅ Výběr řádku a dvojklik v tabulkách

---

**Verze:** v5  
**Poslední aktualizace:** 2025-10-20