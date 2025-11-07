# aplikace-v5
<img width="842" height="297" alt="image" src="https://github.com/user-attachments/assets/7e5f5e9b-8e11-4dba-8589-d0d512e400b9" />

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

5. **[how-to-create-module.md](docs/how-to-create-module.md)** 🔧 NOVÝ MODUL KROK ZA KROKEM
   - Kompletní návod pro vytvoření nového modulu
   - Přehled všech zakomentovaných modulů (060-990)
   - Příklady kódu pro všechny části modulu
   - Checklist před commitem

6. **[module-quick-reference.md](docs/module-quick-reference.md)** 📖 RYCHLÁ REFERENCE
   - Struktura modulu na jedné stránce
   - Code snippets pro rychlý start
   - Checklist pro nový modul

### 🗄️ Dokumentace databáze:

7. **[database-schema.md](docs/database-schema.md)** 💾 DATABÁZOVÉ SCHÉMA
   - Kompletní přehled všech Supabase tabulek
   - Popisy sloupců, typů a vazeb
   - Indexy, constraints, triggers, RLS policies
   - Konvence a standardy

8. **[database-schema-maintenance.md](docs/database-schema-maintenance.md)** 🔄 ÚDRŽBA DB DOKUMENTACE
   - Workflow pro změny v databázi
   - Návod na aktualizaci dokumentace
   - Šablony pro nové tabulky
   - Checklist před commitem

### 📊 Aktuální stav modulů:

```
✅ 010-sprava-uzivatelu  (REFERENČNÍ - VZOR pro ostatní)
✅ 020-muj-ucet          (potřebuje rozšíření)
⚠️ 030-pronajimatel      (potřebuje doplnit historii, breadcrumbs)
✅ 040-nemovitost        (DOKONČENO: units, propojení s 030/050, DB dokumentace)
⚠️ 050-najemnik          (potřebuje doplnit historii, breadcrumbs)
❌ 060-990 moduly        (připraveno k vytvoření - viz how-to-create-module.md)
```

### 🎯 Priority:

1. ✅ **DOKONČENO**: Modul 040 - jednotky, propojení s pronajímateli/nájemníky
2. ✅ **DOKONČENO**: Dokumentace databázového schématu
3. ✅ **DOKONČENO**: Návody na vytvoření nových modulů
4. **DALŠÍ**: Přidat historii změn do modulů 030, 050
5. **DALŠÍ**: Vytvořit modul 060 (Smlouvy) podle návodu

### 🆕 Nově přidáno (2025-10-24):

**Modul 040 - Nemovitosti (dokončeno):**
- ✅ Implementován seznam jednotek s filtry
- ✅ Vytvořen detail view pro jednotky
- ✅ Přidáno propojení jednotek s nájemníky (050)
- ✅ Přidáno propojení nemovitostí s pronajímateli (030)
- ✅ Rozšířen formulář jednotky o nájemní údaje

**Databázová dokumentace:**
- 📖 `docs/database-schema.md` - Kompletní přehled všech tabulek (500+ řádků)
- 🔄 `docs/database-schema-maintenance.md` - Návod na údržbu dokumentace
- Dokumentace pokrývá: profiles, subjects, properties, units, attachments, audit_log

**Návody na vytváření modulů:**
- 🚀 `docs/how-to-create-module.md` - Detailní krok-za-krokem návod (600+ řádků)
- 📖 `docs/module-quick-reference.md` - Rychlá reference se code snippets
- Obsahuje příklady pro: module.config.js, db.js, tiles, forms, SQL migrace
- 1,806 řádků dokumentace
- ~55 KB nové dokumentace
- 0 bezpečnostních chyb (CodeQL validated)
- Implementační plán: 6-8 týdnů

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
