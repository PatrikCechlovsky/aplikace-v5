# 📋 Úkoly z agent-task.md

Tento adresář obsahuje rozpracované úkoly z hlavního dokumentu `agent-task.md`. Každý úkol je samostatný soubor s detailním popisem implementace.

## 🎯 Přehled úkolů

### ✅ Úkol 01: Hlavní sekce "Přehled" ve všech modulech
**Soubor:** [task-01-prehled-section.md](./task-01-prehled-section.md)  
**Priorita:** 🔴 VYSOKÁ  
**Čas:** 30-60 minut per modul  
**Popis:** Každý modul musí mít hlavní dlaždici/sekci "Přehled" jako první položku v navigaci a defaultní landing sekci.

**Dotčené moduly:**
- ✅ 010-sprava-uzivatelu (referenční)
- ⚠️ 020-muj-ucet
- ⚠️ 030-pronajimatel
- ⚠️ 040-nemovitost
- ⚠️ 050-najemnik

---

### 🎨 Úkol 02: Vizuální styl "Přehledu" — barevné označení v prvním sloupci
**Soubor:** [task-02-colored-badges.md](./task-02-colored-badges.md)  
**Priorita:** 🔴 VYSOKÁ  
**Čas:** 20-30 minut per modul + 30-45 minut (badge komponenta)  
**Popis:** V tabulce "Přehledu" musí být v prvním sloupci barevný badge podle typu/role entity.

**Dotčené moduly:**
- ✅ 010-sprava-uzivatelu (referenční)
- ⚠️ 030-pronajimatel
- ⚠️ 040-nemovitost
- ⚠️ 050-najemnik

---

### 🧭 Úkol 03: Navigace a breadcrumbs
**Soubor:** [task-03-navigation-breadcrumbs.md](./task-03-navigation-breadcrumbs.md)  
**Priorita:** 🔴 VYSOKÁ  
**Čas:** 30-45 minut per modul  
**Popis:** Navigace na "Přehled" musí být jasně označena v sidebaru i breadcrumbs.

**Dotčené moduly:**
- ✅ 010-sprava-uzivatelu (referenční)
- ⚠️ 020-muj-ucet
- ⚠️ 030-pronajimatel (README.md říká že chybí)
- ⚠️ 040-nemovitost
- ⚠️ 050-najemnik (README.md říká že chybí)

---

### ☑️ Úkol 04: Checkbox "Zobrazit archivované"
**Soubor:** [task-04-archived-checkbox.md](./task-04-archived-checkbox.md)  
**Priorita:** 🟡 STŘEDNÍ  
**Čas:** 30-45 minut per modul  
**Popis:** V horní části tabulky musí být checkbox pro zobrazení archivovaných záznamů.

**Dotčené moduly:**
- ✅ 010-sprava-uzivatelu (referenční)
- ⚠️ 030-pronajimatel
- ⚠️ 040-nemovitost
- ⚠️ 050-najemnik

---

### ➕ Úkol 05: Ikonka "+" pro zakládání nových entit
**Soubor:** [task-05-plus-icon-sidebar.md](./task-05-plus-icon-sidebar.md)  
**Priorita:** 🔴 VYSOKÁ  
**Čas:** 15-20 minut (jednoduchá) nebo 45-60 minut (s výběrem typu) per modul  
**Popis:** V sidebaru i horním panelu musí být vždy viditelná ikonka "+" pro založení nové entity.

**Dotčené moduly:**
- ✅ 010-sprava-uzivatelu (referenční)
- ⚠️ 030-pronajimatel
- ⚠️ 040-nemovitost
- ⚠️ 050-najemnik

---

### 🔀 Úkol 06: Logika zakládání — žádné matoucí formuláře v sidebaru
**Soubor:** [task-06-unified-creation-flow.md](./task-06-unified-creation-flow.md)  
**Priorita:** 🔴 VYSOKÁ  
**Čas:** 20-30 minut (jednoduchá) nebo 60-90 minut (s výběrem typu) per modul  
**Popis:** V sidebaru nebude zbytečně mnoho odkazů na různé typy formulářů. Všechny možnosti jsou sjednoceny do jednoho flow.

**Dotčené moduly:**
- ⚠️ 030-pronajimatel
- ⚠️ 040-nemovitost (6 typů nemovitostí)
- ⚠️ 050-najemnik

**Poznámka:** Vyžaduje vytvoření type selection modalu (60-90 minut jednou).

---

### 🗑️ Úkol 07: Odstranit duplicity "Přehled" vs. "Seznam"
**Soubor:** [task-07-remove-duplicates.md](./task-07-remove-duplicates.md)  
**Priorita:** 🟡 STŘEDNÍ  
**Čas:** 15-30 minut (jednoduchá) nebo 45-60 minut (komplexní) per modul  
**Popis:** V modulech, kde existuje současně "Přehled" i "Seznam", sloučit do jedné sekce "Přehled".

**Dotčené moduly:**
- ⚠️ 030-pronajimatel (zkontrolovat)
- ⚠️ 040-nemovitost (zkontrolovat)
- ⚠️ 050-najemnik (zkontrolovat)

---

### 💾 Úkol 08: Datový model pro modul 040 (Nemovitosti + Jednotky)
**Soubor:** [task-08-data-model-module-040.md](./task-08-data-model-module-040.md)  
**Priorita:** 🔴 KRITICKÁ  
**Čas:** 5-8 hodin  
**Popis:** Implementovat kompletní datový model pro modul 040 s podporou nemovitostí a jednotek.

**Dotčený modul:**
- ⚠️ 040-nemovitost

**Zahrnuje:**
- Database schema (tabulky `properties` a `units`)
- ENUMy pro typy
- Foreign keys a vazby
- RLS policies
- Indexy
- DB services (CRUD operace)

---

### 🏗️ Úkol 09: Automatické vytvoření jednotky při zakládání nové nemovitosti
**Soubor:** [task-09-auto-create-unit.md](./task-09-auto-create-unit.md)  
**Priorita:** 🔴 VYSOKÁ  
**Čas:** 3-5 hodin  
**Popis:** Při vytváření nové nemovitosti se automaticky vytvoří jedna defaultní jednotka odpovídající typu nemovitosti.

**Dotčený modul:**
- ⚠️ 040-nemovitost

**Zahrnuje:**
- Helper funkce pro mapping typu
- Transakční vytvoření (nemovitost + jednotka)
- Frontend integrace
- Možnost upravit/smazat jednotku

---

### 🏢 Úkol 10: Tlačítko "Načíst z ARES" — automatické vyplnění firemních údajů
**Soubor:** [task-10-ares-integration.md](./task-10-ares-integration.md)  
**Priorita:** 🟡 STŘEDNÍ-VYSOKÁ  
**Čas:** 5-9 hodin  
**Popis:** Ve formuláři pro subjekt musí být viditelné tlačítko "Načíst z ARES" pro automatické načtení firemních údajů.

**Dotčené moduly:**
- ⚠️ 030-pronajimatel
- ⚠️ 050-najemnik

**Zahrnuje:**
- ARES API service
- UI komponenta (tlačítko)
- Validace IČO
- Automatické vyplnění formuláře
- Error handling

---

## 📊 Celkový přehled

### Podle priority

#### 🔴 KRITICKÁ (1)
1. **Úkol 08** - Datový model pro modul 040 (5-8 hodin)

#### 🔴 VYSOKÁ (5)
1. **Úkol 01** - Hlavní sekce "Přehled" (30-60 min/modul)
2. **Úkol 02** - Barevné badges (20-30 min/modul)
3. **Úkol 03** - Navigace a breadcrumbs (30-45 min/modul)
4. **Úkol 05** - Ikonka "+" (15-60 min/modul)
5. **Úkol 06** - Unified creation flow (20-90 min/modul)
6. **Úkol 09** - Auto-create jednotky (3-5 hodin)

#### 🟡 STŘEDNÍ (3)
1. **Úkol 04** - Checkbox "Zobrazit archivované" (30-45 min/modul)
2. **Úkol 07** - Odstranit duplicity (15-60 min/modul)
3. **Úkol 10** - ARES integrace (5-9 hodin)

### Podle časové náročnosti

**Rychlé (< 1 hodina per modul):**
- Úkol 01, 02, 03, 04, 05, 07

**Středně náročné (1-3 hodiny):**
- Úkol 06 (s type selection modal)

**Náročné (3+ hodin):**
- Úkol 08 (5-8 hodin)
- Úkol 09 (3-5 hodin)
- Úkol 10 (5-9 hodin)

### Podle modulů

**Modul 010-sprava-uzivatelu** ✅ REFERENČNÍ
- Všechny úkoly jsou již implementovány
- Používat jako vzor pro ostatní moduly

**Modul 020-muj-ucet**
- Úkol 01, 03

**Modul 030-pronajimatel**
- Úkoly 01, 02, 03, 04, 05, 06, 07, 10

**Modul 040-nemovitost**
- Úkoly 01, 02, 03, 04, 05, 06, 07, 08, 09

**Modul 050-najemnik**
- Úkoly 01, 02, 03, 04, 05, 06, 07, 10

---

## 🚀 Doporučený postup implementace

### Fáze 1: Základní struktura (všechny moduly)
1. **Úkol 01** - Přehled sekce ✓
2. **Úkol 03** - Breadcrumbs ✓
3. **Úkol 07** - Odstranit duplicity ✓

**Čas:** ~2-3 hodiny per modul  
**Důvod:** Základní navigace a struktura

### Fáze 2: Vizuální jednotnost (všechny moduly)
1. **Úkol 02** - Barevné badges ✓
2. **Úkol 04** - Checkbox archivované ✓

**Čas:** ~1-2 hodiny per modul  
**Důvod:** Vizuální konzistence

### Fáze 3: Vytváření entit (všechny moduly)
1. **Úkol 05** - Ikonka "+" ✓
2. **Úkol 06** - Unified creation flow ✓

**Čas:** ~1-3 hodiny per modul  
**Důvod:** Zjednodušení UX pro vytváření

### Fáze 4: Modul 040 specifika
1. **Úkol 08** - Datový model ✓
2. **Úkol 09** - Auto-create jednotky ✓

**Čas:** ~8-13 hodin  
**Důvod:** Komplexní funkcionalita modulu 040

### Fáze 5: Pokročilé funkce
1. **Úkol 10** - ARES integrace ✓

**Čas:** ~5-9 hodin  
**Důvod:** Nice-to-have funkce

---

## 📝 Poznámky

### Závislosti mezi úkoly
- **Úkol 09** vyžaduje dokončení **Úkolu 08**
- **Úkol 06** může využít **Úkol 05**
- **Úkol 02** by měl být hotový před **Úkolem 06** (pro type selection modal)

### Referenční soubory
- **Vzorový modul:** `/src/modules/010-sprava-uzivatelu/`
- **Standardizace:** `/docs/STANDARDIZACNI-NAVOD.md`
- **Checklist:** `/docs/MODUL-CHECKLIST.md`
- **Rychlý průvodce:** `/docs/RYCHLY-PRUVODCE.md`

### Kontrolní body
Po dokončení každého úkolu:
1. ✅ Otestovat funkcionalit
2. ✅ Zkontrolovat konzistenci s referenčním modulem
3. ✅ Aktualizovat dokumentaci modulu
4. ✅ Commitnout změny

---

## 📞 Další kroky

Po dokončení všech úkolů:
1. Provést kompletní testování všech modulů
2. Aktualizovat dokumentaci
3. Code review
4. Deployment

---

**Poslední aktualizace:** 2025-10-22  
**Celkový počet úkolů:** 10  
**Odhadovaný celkový čas:** 30-50 hodin (závisí na počtu modulů a složitosti)
