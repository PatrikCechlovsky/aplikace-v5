# 🚀 Implementační průvodce - Úkoly z agent-task.md

## 📖 O tomto průvodci

Tento dokument poskytuje rychlý přehled a doporučení jak postupovat při implementaci úkolů z `agent-task.md`.

## 🎯 Rychlý start

### 1. Přečíst si přehled
Začněte s [README.md](./README.md) v tomto adresáři pro kompletní přehled všech úkolů.

### 2. Rozhodnout se o pořadí implementace

**Doporučené pořadí:**

#### Fáze A: Modul 040 - Základ (8-13 hodin)
Začít s modulem 040, protože je nejkomplexnější a ostatní moduly z něj budou čerpat:
1. **Task 08** - Datový model (5-8 hodin) 🔴 KRITICKÁ
2. **Task 09** - Auto-create jednotky (3-5 hodin) 🔴 VYSOKÁ

#### Fáze B: Základní struktura všech modulů (2-3 hodiny per modul)
Pro moduly 020, 030, 050:
1. **Task 01** - Přehled sekce (30-60 min)
2. **Task 03** - Breadcrumbs (30-45 min)
3. **Task 07** - Odstranit duplicity (15-30 min)

#### Fáze C: Vizuální jednotnost (1-2 hodiny per modul)
Pro všechny moduly:
1. **Task 02** - Barevné badges (20-30 min)
2. **Task 04** - Checkbox archivované (30-45 min)

#### Fáze D: Vytváření entit (1-3 hodiny per modul)
Pro všechny moduly:
1. **Task 05** - Ikonka "+" (15-60 min)
2. **Task 06** - Unified creation flow (20-90 min)

#### Fáze E: Pokročilé funkce (5-9 hodin)
Volitelné, ale velmi užitečné:
1. **Task 10** - ARES integrace (5-9 hodin) 🟡 STŘEDNÍ-VYSOKÁ

## 📋 Checklist před začátkem každého úkolu

- [ ] Přečíst celý task file
- [ ] Zkontrolovat závislosti (Související úkoly)
- [ ] Připravit testovací prostředí
- [ ] Zkontrolovat referenční modul (010-sprava-uzivatelu)
- [ ] Vytvořit branch pro změny (volitelné)

## 📋 Checklist po dokončení každého úkolu

- [ ] Otestovat implementaci
- [ ] Zkontrolovat že odpovídá akceptačním kritériím
- [ ] Porovnat s referenčním modulem
- [ ] Aktualizovat dokumentaci modulu (assets/README.md)
- [ ] Commitnout změny s popisnou zprávou
- [ ] Označit úkol jako hotový v tracking dokumentu

## 🔧 Užitečné nástroje

### Referenční soubory
```bash
# Vzorový modul
/src/modules/010-sprava-uzivatelu/

# UI komponenty
/src/ui/

# Dokumentace
/docs/STANDARDIZACNI-NAVOD.md
/docs/MODUL-CHECKLIST.md
```

### Testování
```bash
# Spustit aplikaci
npm run dev

# Otevřít modul
# Navigovat na http://localhost:XXXX/#XXX-modul/prehled

# Zkontrolovat console pro errory
# Otevřít DevTools → Console
```

### Kontrola kódu
```bash
# Zkontrolovat změny
git status
git diff

# Porovnat s referenčním modulem
diff src/modules/010-sprava-uzivatelu/tiles/prehled.js \
     src/modules/030-pronajimatel/tiles/prehled.js
```

## 💡 Tipy a triky

### 1. Používat copy-paste z referenčního modulu
Modul 010-sprava-uzivatelu je kompletně implementovaný. Neváhejte kopírovat strukturu a upravit podle potřeby.

### 2. Testovat průběžně
Netestujte až po dokončení všeho. Testujte po každé menší změně.

### 3. Commitovat často
Commitujte po dokončení každého logického celku (např. po implementaci jednoho úkolu).

### 4. Dokumentovat změny
Aktualizujte `assets/README.md` každého modulu s informacemi o tom co bylo změněno.

### 5. Používat checklists v task files
Každý task file má checklist na konci. Používejte ho pro sledování pokroku.

## ⚠️ Časté chyby

### 1. Zapomenutí na breadcrumbs
❌ **Chyba:** Implementovat tile bez nastavení breadcrumbs  
✅ **Správně:** Vždy volat `setBreadcrumb()` na začátku `render()` funkce

### 2. Nesprávné ID kontejneru pro commonActions
❌ **Chyba:** `document.getElementById('actions')`  
✅ **Správně:** `document.getElementById('commonactions')`

### 3. Zapomenutí na RLS policies
❌ **Chyba:** Vytvořit tabulku bez RLS policies  
✅ **Správně:** Vždy povolit RLS a vytvořit policies

### 4. Nevalidovat data na frontendu
❌ **Chyba:** Poslat data rovnou na backend  
✅ **Správně:** Validovat data na frontendu před odesláním

### 5. Ignorovat archivované záznamy
❌ **Chyba:** Načíst všechna data bez filtru  
✅ **Správně:** Defaultně skrýt archivované, přidat checkbox pro zobrazení

## 📊 Tracking pokroku

### Vytvoření tracking tabulky

Můžete si vytvořit jednoduchý tracking dokument:

```markdown
# Tracking implementace úkolů

## Modul 030-pronajimatel
- [ ] Task 01 - Přehled sekce
- [ ] Task 02 - Barevné badges
- [ ] Task 03 - Breadcrumbs
- [ ] Task 04 - Checkbox archivované
- [ ] Task 05 - Ikonka "+"
- [ ] Task 06 - Unified creation flow
- [ ] Task 07 - Odstranit duplicity
- [ ] Task 10 - ARES integrace

## Modul 040-nemovitost
- [ ] Task 01 - Přehled sekce
- [ ] Task 02 - Barevné badges
- [ ] Task 03 - Breadcrumbs
- [ ] Task 04 - Checkbox archivované
- [ ] Task 05 - Ikonka "+"
- [ ] Task 06 - Unified creation flow
- [ ] Task 07 - Odstranit duplicity
- [ ] Task 08 - Datový model
- [ ] Task 09 - Auto-create jednotky

## Modul 050-najemnik
- [ ] Task 01 - Přehled sekce
- [ ] Task 02 - Barevné badges
- [ ] Task 03 - Breadcrumbs
- [ ] Task 04 - Checkbox archivované
- [ ] Task 05 - Ikonka "+"
- [ ] Task 06 - Unified creation flow
- [ ] Task 07 - Odstranit duplicity
- [ ] Task 10 - ARES integrace
```

## 🎓 Učení se z kódu

### Studovat referenční modul

```bash
# Přečíst si strukturu
cat src/modules/010-sprava-uzivatelu/module.config.js

# Prozkoumat tiles
ls -la src/modules/010-sprava-uzivatelu/tiles/

# Prozkoumat forms
ls -la src/modules/010-sprava-uzivatelu/forms/
```

### Porozumět flow

1. **Navigace:** URL hash → Router → Module → Tile/Form
2. **Data flow:** UI → Service → Supabase → DB
3. **Permissions:** UI → Check permission → Allow/Deny

## 📞 Kde hledat pomoc

1. **Task files** - Detailní implementační kroky
2. **Referenční modul** - Vzorový kód (010-sprava-uzivatelu)
3. **STANDARDIZACNI-NAVOD.md** - Kompletní standardy
4. **MODUL-CHECKLIST.md** - 189 kontrolních bodů
5. **Supabase dokumentace** - Pro práci s databází

## ✅ Závěrečná kontrola projektu

Po dokončení všech úkolů:

### Kontrola modulů
- [ ] Všechny moduly mají "Přehled" jako defaultní sekci
- [ ] Breadcrumbs jsou všude implementovány
- [ ] Barevné badges jsou konzistentní
- [ ] Checkbox "Zobrazit archivované" funguje
- [ ] Tlačítko "+" je všude viditelné
- [ ] Není žádná duplicita "Přehled" vs "Seznam"

### Kontrola modulu 040
- [ ] Database schema je vytvořeno
- [ ] RLS policies jsou aktivní
- [ ] Auto-create jednotky funguje
- [ ] Lze přidávat další jednotky
- [ ] Vazby na pronajímatele/nájemníky fungují

### Kontrola ARES integrace
- [ ] Tlačítko "Načíst z ARES" je implementováno
- [ ] Načítání z ARES funguje
- [ ] Error handling funguje
- [ ] Formulář se automaticky vyplní

### Dokumentace
- [ ] README.md každého modulu je aktualizovaný
- [ ] Checklists jsou aktualizované
- [ ] Změny jsou zdokumentované

### Testování
- [ ] Všechny moduly byly manuálně otestovány
- [ ] Žádné console errory
- [ ] UI je konzistentní
- [ ] Navigace funguje správně

---

**Good luck! 🚀**

Tento průvodce byl vytvořen k usnadnění implementace úkolů. Pokud narazíte na problémy, vraťte se k task files pro detailní informace.
