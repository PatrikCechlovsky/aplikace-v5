# SHRNUTÍ - Modul 050 Nájemník - Dokumentace pro Agenta

**Datum vytvoření:** 2025-11-10  
**Účel:** Rychlý přehled kompletní dokumentace pro implementaci modulu 050

---

## 📚 Co bylo vytvořeno

Vytvořil jsem **4 kompletní dokumenty** v adresáři `src/modules/050-najemnik/assets/`:

### 1. README.md (16 KB)
**Úplná specifikace modulu zahrnující:**
- ✅ Přehled modulu a jeho účel
- ✅ Kompletní struktura souborů a adresářů
- ✅ Manifest (module.config.js) s dynamickým načítáním typů
- ✅ **7 Tiles (přehledů)**:
  - prehled.js - Hlavní přehled všech nájemníků
  - osoba.js - Fyzické osoby
  - osvc.js - OSVČ
  - firma.js - Firmy
  - spolek.js - Spolky a skupiny
  - stat.js - Státní instituce
  - zastupce.js - Zástupci
- ✅ **3 Formuláře**:
  - chooser.js - Výběr typu nového subjektu
  - detail.js - Detail nájemníka (read-only)
  - form.js - Vytvoření/editace nájemníka
- ✅ Databázová vrstva (db.js) se všemi funkcemi
- ✅ Type schemas (type-schemas.js) pro dynamické formuláře
- ✅ Integrace s ostatními moduly
- ✅ Poznámky pro implementaci

### 2. permissions.md (13 KB)
**Kompletní bezpečnostní specifikace:**
- ✅ Přehled bezpečnostních principů
- ✅ Definice uživatelských rolí (admin, user, viewer)
- ✅ **Row Level Security (RLS) policies** pro tabulku subjects:
  - SELECT policy - kdo může číst
  - INSERT policy - kdo může vytvářet
  - UPDATE policy - kdo může upravovat
  - DELETE policy - zakázáno (pouze archivace)
- ✅ Matice oprávnění podle rolí
- ✅ Validace a sanitizace vstupů
- ✅ Audit log a historie změn
- ✅ Ochrana proti útokům (SQL injection, XSS, CSRF, atd.)
- ✅ Bezpečnostní checklist

### 3. datovy-model.md (26 KB)
**Detailní popis databázového schématu:**
- ✅ ER diagram vztahů mezi tabulkami
- ✅ **Tabulka subjects** - kompletní schéma:
  - Všechny sloupce s datovými typy
  - Povinná vs volitelná pole
  - Validační pravidla
  - Příklady hodnot
- ✅ **Tabulka user_subjects** - vazba uživatelů na subjekty
- ✅ **Tabulka subject_history** - audit log
- ✅ **Tabulka subject_types** - číselník typů
- ✅ Foreign keys a vztahy
- ✅ **Indexy pro optimalizaci** výkonu
- ✅ **Database triggery**:
  - Auto-update updated_at
  - Auto-generate display_name
  - Validace role
  - Audit logging
- ✅ Views (pohledy) pro rychlé dotazy
- ✅ **Kompletní implementace db.js** se všemi funkcemi
- ✅ **Type schemas** s validací

### 4. checklist.md (20 KB)
**Krok-za-krokem průvodce implementací:**
- ✅ **10 fází implementace** s detailními kroky
- ✅ Přesné instrukce pro každý soubor
- ✅ Kontrolní seznamy (checklisty) pro každou fázi
- ✅ **Testovací scénáře**:
  - Základní funkčnost
  - Každý tile zvlášť
  - Každý formulář zvlášť
  - CRUD operace
  - Oprávnění (RLS)
  - Integrace s ostatními moduly
- ✅ Časový odhad (~3.5 hodiny)
- ✅ **Častá úskalí a jejich řešení**
- ✅ Finální checklist před mergem
- ✅ Rychlý přehled (TL;DR)

---

## 🎯 Klíčové informace pro agenta

### Základní fakta:

1. **Modul 050 je IDENTICKÝ s modulem 030**
   - Jediný rozdíl: `role = 'najemnik'` místo `role = 'pronajimatel'`
   - Stejná struktura, stejné funkce, stejná tabulka

2. **Sdílená databáze**
   - Tabulka `subjects` je sdílená mezi moduly 030 a 050
   - Rozlišení pomocí pole `role`
   - **ŽÁDNÉ nové tabulky není třeba vytvářet!**

3. **Postup implementace**
   - Zkopíruj všechny soubory z `src/modules/030-pronajimatel/`
   - Změň pouze:
     - `role = 'pronajimatel'` → `role = 'najemnik'`
     - Text "Pronajímatel" → "Nájemník"
     - ID `030-pronajimatel` → `050-najemnik`
     - Ikona `home` → `person`

4. **Soubory k vytvoření** (13 souborů):
   ```
   module.config.js
   db.js
   type-schemas.js
   tiles/prehled.js
   tiles/osoba.js
   tiles/osvc.js
   tiles/firma.js
   tiles/spolek.js
   tiles/stat.js
   tiles/zastupce.js
   forms/chooser.js
   forms/detail.js
   forms/form.js
   ```

5. **Soubory k úpravě** (2 soubory):
   ```
   src/app/modules.index.js - přidat import modulu 050
   README.md - přidat modul do seznamu
   ```

---

## 📖 Jak použít tuto dokumentaci

### Pro rychlý start:
1. Začni s **checklist.md** - krok-za-krokem průvodce
2. Konzultuj **README.md** pro detaily o struktuře
3. Při implementaci security konzultuj **permissions.md**
4. Při práci s databází konzultuj **datovy-model.md**

### Pro kompletní implementaci:
```
1. Přečti checklist.md - Fáze 1: Příprava
2. Postupuj podle checklist.md fáze po fázi (1-10)
3. Po každé fázi zkontroluj checklisty
4. Na konci proveď finální kontrolu z checklist.md
```

---

## 🚀 Příklad použití pro agenta

### Prompt pro agenta:

```
Prosím vytvoř modul 050-najemnik podle dokumentace v:
src/modules/050-najemnik/assets/

Postupuj přesně podle checklist.md a:
1. Zkopíruj všechny soubory z modulu 030-pronajimatel
2. Změň role z 'pronajimatel' na 'najemnik'
3. Změň všechny texty z "Pronajímatel" na "Nájemník"
4. Změň ID modulu z '030-pronajimatel' na '050-najemnik'
5. Změň ikonu z 'home' na 'person'
6. Otestuj podle testovacích scénářů v checklist.md

Referuj k README.md, permissions.md a datovy-model.md pro detaily.
```

---

## ✅ Kontrolní seznam dokumentace

- [x] README.md - kompletní specifikace modulu
- [x] permissions.md - bezpečnost a oprávnění
- [x] datovy-model.md - databázové schéma
- [x] checklist.md - implementační průvodce

**Celkem: ~75 KB dokumentace**

---

## 📊 Statistiky

| Dokument | Velikost | Řádků | Sekce |
|----------|----------|-------|-------|
| README.md | 16 KB | ~650 | 10 |
| permissions.md | 13 KB | ~500 | 7 |
| datovy-model.md | 26 KB | ~1000 | 11 |
| checklist.md | 20 KB | ~800 | 12 |
| **CELKEM** | **75 KB** | **~3000** | **40** |

---

## 🎓 Co dokumentace obsahuje

### README.md obsahuje:
- Přehled modulu a jeho účel
- Kompletní strukturu souborů
- Detailní specifikaci manifestu
- Specifikaci všech 7 tiles s tabulkami a akcemi
- Specifikaci všech 3 formulářů s poli
- Databázovou vrstvu (db.js)
- Type schemas
- Bezpečnost a integraci
- Poznámky pro implementaci

### permissions.md obsahuje:
- Přehled bezpečnosti
- Definice rolí (admin, user, viewer)
- RLS policies pro SELECT, INSERT, UPDATE, DELETE
- Oprávnění podle rolí
- Frontend a backend validaci
- Audit a logování
- Ochranu proti útokům
- Bezpečnostní checklist

### datovy-model.md obsahuje:
- ER diagram
- Kompletní schéma tabulky subjects
- Schémata všech souvisejících tabulek
- Foreign keys a vztahy
- Indexy a optimalizaci
- Database triggery
- Views
- Kompletní kód db.js
- Type schemas s validací

### checklist.md obsahuje:
- 10 fází implementace
- Podrobné kroky pro každou fázi
- Kontrolní seznamy
- Testovací scénáře
- Časový odhad (~3.5h)
- Častá úskalí a řešení
- Finální kontrolu
- Rychlý přehled (TL;DR)

---

## 💡 Důležité poznámky

### ⚠️ KRITICKÉ:
1. **Netvořit nové tabulky** - použít sdílenou tabulku `subjects`
2. **Vždy nastavit role = 'najemnik'** - v každém DB dotazu
3. **Zachovat strukturu** - kopírovat z modulu 030, neměnit strukturu

### ✅ SPRÁVNĚ:
- Zkopírovat z modulu 030 a upravit
- Použít sdílenou tabulku subjects
- Filtrovat podle role = 'najemnik'
- Dynamicky načítat typy z databáze

### ❌ ŠPATNĚ:
- Vytvářet novou tabulku tenants
- Měnit strukturu formulářů
- Hardcodovat typy subjektů
- Zapomenout na RLS policies

---

## 📞 Podpora

Pokud agent narazí na problém:
1. Konzultuj sekci "Častá úskalí" v checklist.md
2. Zkontroluj, že všechny kroky v checklist.md byly provedeny
3. Ověř, že modul 030 funguje jako reference
4. Zkontroluj konzoli prohlížeče na chyby

---

## 🏁 Závěr

Tato dokumentace poskytuje **kompletní specifikaci** pro implementaci modulu 050 (Nájemník). Agent má k dispozici:

✅ Detailní průvodce krok-za-krokem  
✅ Kompletní specifikaci každého souboru  
✅ Bezpečnostní požadavky a RLS policies  
✅ Databázové schéma a vztahy  
✅ Testovací scénáře  
✅ Řešení častých problémů  

**Implementace by měla trvat přibližně 3.5 hodiny** při dodržení checklistu.

---

**Vytvořeno:** 2025-11-10  
**Pro:** Modul 050 - Nájemník  
**Aplikace:** aplikace-v5  

✅ **Dokumentace je kompletní a připravená k použití**
