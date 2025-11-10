# RYCHLÝ NÁVOD PRO AGENTA - Modul 050 Nájemník

**Datum:** 2025-11-10  
**Účel:** Jednoduchý návod jak zadat agentovi vytvoření modulu 050

---

## 🎯 Pro koho je tento návod

Tento návod je pro vás, pokud chcete zadat **AI agentovi** (např. GitHub Copilot, Claude, ChatGPT) úkol vytvořit modul 050 - Nájemník.

---

## 📝 Prompt pro agenta (kopíruj a vlož)

### Varianta A: Stručný prompt

```
Vytvoř modul 050-najemnik podle těchto dokumentů:
- src/modules/050-najemnik/assets/README.md
- src/modules/050-najemnik/assets/permissions.md
- src/modules/050-najemnik/assets/datovy-model.md
- src/modules/050-najemnik/assets/checklist.md

Postupuj přesně podle checklist.md (fáze 1-10).

Klíčové body:
1. Zkopíruj všechny soubory z modulu 030-pronajimatel
2. Změň role = 'pronajimatel' na role = 'najemnik'
3. Změň texty "Pronajímatel" na "Nájemník"
4. Změň ID '030-pronajimatel' na '050-najemnik'
5. Změň ikonu 'home' na 'person'
6. Otestuj podle testovacích scénářů

Referenční modul: src/modules/030-pronajimatel/
```

### Varianta B: Detailní prompt

```
# Úkol: Implementace modulu 050-najemnik

## Kontext
Vytvoř modul pro správu nájemníků podle pravidel a vzorů aplikace v5.
Kompletní dokumentace je v src/modules/050-najemnik/assets/.

## Dokumenty k prostudování
1. README.md - kompletní specifikace modulu
2. permissions.md - bezpečnost a RLS policies
3. datovy-model.md - databázové schéma
4. checklist.md - krok-za-krokem průvodce (HLAVNÍ DOKUMENT)

## Postup
Postupuj přesně podle checklist.md, fáze 1-10:

**Fáze 1-3: Příprava a základy**
- Ověř strukturu
- Vytvoř db.js (zkopíruj z modulu 030, změň role na 'najemnik')
- Vytvoř module.config.js (zkopíruj z 030, změň ID, title, ikonu)

**Fáze 4: Tiles (7 souborů)**
- prehled.js, osoba.js, osvc.js, firma.js, spolek.js, stat.js, zastupce.js
- Všechny zkopíruj z modulu 030, změň role na 'najemnik'

**Fáze 5: Forms (3 soubory)**
- chooser.js, detail.js, form.js
- Všechny zkopíruj z modulu 030, změň role na 'najemnik'

**Fáze 6: Type schemas**
- Zkopíruj type-schemas.js z modulu 030

**Fáze 7: Registrace**
- Přidej import do src/app/modules.index.js

**Fáze 8-10: Testování a finalizace**
- Otestuj podle scénářů v checklist.md
- Zkontroluj bezpečnost
- Commit

## Klíčová pravidla
❗ POUŽÍT sdílenou tabulku subjects (NETVOŘIT novou!)
❗ VŽDY filtrovat podle role = 'najemnik'
❗ ZACHOVAT strukturu z modulu 030
❗ ZMĚNIT pouze: role, texty, ID, ikonu

## Reference
Modul 030-pronajimatel je IDENTICKÝ - použij jako vzor.

## Časový odhad
~3.5 hodiny podle checklist.md
```

---

## 📚 Co agent najde v dokumentaci

### README.md
- Úplnou specifikaci modulu
- Seznam všech tiles a forms
- Struktura souborů
- Příklady kódu

### permissions.md
- RLS policies pro bezpečnost
- Oprávnění podle rolí
- Validace

### datovy-model.md
- Databázové schéma
- Kompletní kód db.js
- Type schemas
- Triggery

### checklist.md
- **NEJDŮLEŽITĚJŠÍ DOKUMENT**
- Krok-za-krokem průvodce
- Všechny kontrolní seznamy
- Testovací scénáře
- Řešení problémů

---

## ✅ Kontrola po dokončení

Zeptej se agenta, zda:
- [ ] Vytvořil všech 13 souborů (1 config, 1 db, 1 schemas, 7 tiles, 3 forms)
- [ ] Přidal modul do modules.index.js
- [ ] Otestoval všechny funkce
- [ ] Zkontroloval bezpečnost (RLS)
- [ ] Všechny záznamy mají role = 'najemnik'

---

## 🆘 Pokud něco nefunguje

Agent má v checklist.md sekci "Častá úskalí a řešení" s:
- Řešením problémů s načítáním modulu
- Řešením problémů s daty
- Řešením problémů s formuláři
- Řešením problémů s archivací
- Řešením problémů se searchem

---

## 🎓 Příklad dialogu s agentem

**Vy:**
```
Vytvoř modul 050-najemnik podle dokumentace v assets/.
Postupuj podle checklist.md.
```

**Agent odpověď měla by být:**
```
Chápu. Začínám implementaci modulu 050-najemnik.

Fáze 1: Příprava...
✓ Struktura ověřena
✓ Modul 030 existuje jako reference

Fáze 2: Databázová vrstva...
✓ db.js vytvořen
✓ Všechny funkce filtrují podle role = 'najemnik'

... atd ...
```

---

## 📋 Minimální verze promptu

Pokud chceš jen nejkratší možnou verzi:

```
Implementuj modul 050-najemnik podle checklist.md v assets/.
Referenční modul: 030-pronajimatel.
Změň pouze: role → 'najemnik', texty, ID, ikonu.
```

---

## 🔗 Důležité odkazy v projektu

- **Referenční modul:** `src/modules/030-pronajimatel/`
- **Dokumentace modulu 050:** `src/modules/050-najemnik/assets/`
- **Registrace modulů:** `src/app/modules.index.js`
- **Globální dokumentace:** `NEW/` adresář
- **Pravidla pro agenta:** `NEW/10-CHECKLIST-PRAVIDLA.md`
- **Šablona modulu:** `NEW/08-SABLONA-MODULU.md`

---

## 💡 Tipy

1. **Začni s checklist.md** - je to hlavní průvodce
2. **Ukaž agentovi modul 030** - ať vidí jak to má vypadat
3. **Emphasizuj "NEMĚNIT strukturu"** - jen kopírovat a upravit
4. **Požaduj testování** - podle testovacích scénářů v checklist.md

---

## ⏱️ Očekávaný čas

| Aktivita | Čas |
|----------|-----|
| Kopírování a úpravy souborů | 1.5h |
| Testování | 1h |
| Dokumentace a commit | 1h |
| **CELKEM** | **~3.5h** |

---

## ✨ Závěr

Tato dokumentace poskytuje agentovi **VŠE potřebné** k implementaci modulu 050.

**Stačí:**
1. Zadat agentovi prompt (viz výše)
2. Odkázat na checklist.md
3. Nechat agenta pracovat
4. Zkontrolovat výsledek

**Agent má k dispozici:**
- ✅ Kompletní specifikaci
- ✅ Krok-za-krokem průvodce
- ✅ Referenční modul 030
- ✅ Testovací scénáře
- ✅ Řešení problémů

**Hodně štěstí! 🚀**

---

**Připraveno:** 2025-11-10  
**Pro:** Implementaci modulu 050 - Nájemník
