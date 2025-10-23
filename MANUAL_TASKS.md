# Manuální úkoly (pro tebe)

Tento soubor obsahuje povinné manuální kroky, které agent (Copilot) nemůže provést přes GitHub API z bezpečnostních důvodů. Proveď je prosím přes GitHub UI nebo lokálně přes git.

DŮLEŽITÉ (povinné)
1) Uzavření (Close) starých Pull Requestů
- PR #7 — "Standardize module structure with shared schemas and universal form wrapper"  
  URL: https://github.com/PatrikCechlovsky/aplikace-v5/pull/7  
  Akce: pokud chcete čistou historii a reimplementaci, klikněte "Close pull request".
- PR #8 — "Add test module (999-test-moduly)"  
  URL: https://github.com/PatrikCechlovsky/aplikace-v5/pull/8  
  Akce: klikněte "Close pull request".

Poznámka: pokud místo zavření preferujete, aby Git historie zachovala PRy, stačí je nechat otevřené a vytvořit nové PR z čisté branch — doporučuji PR uzavřít a otevřít nové s reimplementací.

2) Smazání nepotřebných větví (po uzavření PRů)
- Branchy ke smazání:
  - copilot/add-test-module
  - copilot/validate-module-structure
  - test-moduly

Jak smazat přes GitHub UI:
- Repo → Code → Branches → klik na ikonu koše u větve.

Jak smazat lokálně + remote (git):
```bash
# Lokálně
git branch -d copilot/add-test-module
git branch -d copilot/validate-module-structure
git branch -d test-moduly

# Na remote
git push origin --delete copilot/add-test-module
git push origin --delete copilot/validate-module-structure
git push origin --delete test-moduly
```

3) Vytvoření nové pracovní větve (doporučeno před reimplementací)
- Název: feature/reimplement-pr7
```bash
git checkout main
git pull origin main
git checkout -b feature/reimplement-pr7
```

4) Nasazení SQL migrace (po reimplementaci)
- Po vytvoření a review PR a před produkčním nasazením spusťte migraci v Supabase:
  - Otevřete Supabase Dashboard → SQL Editor → vložte obsah souboru docs/tasks/supabase-migrations/002_update_properties_and_units_schema.sql → Run.
- Ověřte existence tabulek: properties, units; view: properties_with_stats; funkce create_property_with_unit.

5) Merge a deploy
- Po review a úspěšném testování proveďte merge PR do main.  
- Proveďte nasazení podle standardního workflow (tag/release + CI).

Kontrolní checklist po vašich manuálních krocích:
- [ ] PR #7 uzavřen/archivován
- [ ] PR #8 uzavřen/archivován
- [ ] Nepotřebné větve smazány
- [ ] Nová branch feature/reimplement-pr7 vytvořena
- [ ] SQL migrace připravena v docs a otestována v stagingu

Kontakt: pokud chcete, mohu připravit kompletní PR (včetně commitů) — potvrďte a já připravím změny, které pak pouze zkontrolujete a mergnete.
OLD
# Manuální úkoly, které vyžadují akci uživatele

## ⚠️ DŮLEŽITÉ: Úkoly, které agent nemůže provést

Tyto úkoly musí být provedeny manuálně přes GitHub UI, protože agent nemá oprávnění:

### 1. Uzavření otevřených Pull Requestů

Aktuálně jsou otevřeny 3 Pull Requesty, z nichž **2 by měly být uzavřeny** podle požadavku:

#### PR #11 (TENTO PR - PONECHAT OTEVŘENÝ) ✅
- **Název**: [WIP] Update Modul 040 - Specifikace pro agenta: Nemovitosti
- **Branch**: `copilot/update-modul-040-specifikace`
- **Stav**: Draft
- **Akce**: ✅ **PONECHAT OTEVŘENÝ** - Tento PR obsahuje aktuální práci na aktualizaci specifikace Modulu 040

#### PR #8 (UZAVŘÍT) ❌
- **Název**: Add test module (999-test-moduly) for development and testing purposes
- **Branch**: `copilot/add-test-module`
- **Base branch**: `test-moduly`
- **Stav**: Draft
- **Akce**: ❌ **UZAVŘÍT** - Merge do větve `test-moduly`, která již není potřeba

**Jak uzavřít:**
1. Jít na https://github.com/PatrikCechlovsky/aplikace-v5/pull/8
2. Kliknout na "Close pull request"
3. Volitelně: Přidat komentář s důvodem uzavření

#### PR #7 (UZAVŘÍT) ❌
- **Název**: Standardize module structure with shared schemas and universal form wrapper
- **Branch**: `copilot/validate-module-structure`
- **Stav**: Draft
- **Akce**: ❌ **UZAVŘÍT** - Pokud již byla práce dokončena nebo není potřeba

**Jak uzavřít:**
1. Jít na https://github.com/PatrikCechlovsky/aplikace-v5/pull/7
2. Kliknout na "Close pull request"
3. Volitelně: Přidat komentář s důvodem uzavření

---

### 2. Smazání nepotřebných větví

Po uzavření PRs by měly být smazány následující větve:

#### Větve ke smazání:
- `copilot/add-test-module` (po uzavření PR #8)
- `copilot/validate-module-structure` (po uzavření PR #7)
- `test-moduly` (base branch pro PR #8, pokud již není potřeba)

#### Jak smazat větev:
1. **Přes GitHub UI:**
   - Jít na https://github.com/PatrikCechlovsky/aplikace-v5/branches
   - Kliknout na ikonu koše u příslušné větve

2. **Nebo lokálně a na remote:**
   ```bash
   # Smazat lokálně
   git branch -d copilot/add-test-module
   git branch -d copilot/validate-module-structure
   git branch -d test-moduly
   
   # Smazat na remote
   git push origin --delete copilot/add-test-module
   git push origin --delete copilot/validate-module-structure
   git push origin --delete test-moduly
   ```

---

## ✅ Co bylo provedeno agentem

### Aktualizace specifikace Modulu 040

Agent aktualizoval následující soubory podle detailní specifikace:

1. **`src/modules/040-nemovitost/assets/README.md`** (nový, 4.8 KB)
   - Kompletní popis modulu
   - Hlavní funkce
   - Struktura modulu
   - Datové modely
   - Typy nemovitostí a jednotek
   - Závislosti na jiných modulech
   - Známé problémy z původního kódu
   - Plán implementace

2. **`src/modules/040-nemovitost/assets/datovy-model.md`** (nový, 11.2 KB)
   - Detailní specifikace tabulek `properties` a `units`
   - Všechny sloupce s datovými typy
   - Enum definice pro typy nemovitostí a jednotek
   - Indexy pro optimální výkon
   - Foreign Keys a vazby
   - RLS Policies pro Supabase
   - Validační pravidla
   - Triggers pro automatickou aktualizaci
   - Mapping z localStorage na Supabase
   - Ukázkové JSON záznamy
   - UI stavy a performance optimalizace

3. **`src/modules/040-nemovitost/assets/checklist.md`** (nový, 16.8 KB)
   - Detailní checklist implementace rozdělený do 11 fází
   - Fáze 1: Příprava a konfigurace
   - Fáze 2: Datová vrstva (Supabase)
   - Fáze 3: UI - Tiles (Přehledy)
   - Fáze 4: UI - Forms (Formuláře)
   - Fáze 5: Správa jednotek
   - Fáze 6: Integrace s dalšími moduly
   - Fáze 7: Pokročilé funkce
   - Fáze 8: Testování
   - Fáze 9: Dokumentace
   - Fáze 10: Optimalizace
   - Fáze 11: Deployment a monitoring
   - Celkový progress tracking
   - Doporučený postup implementace (6-8 týdnů)

4. **`src/modules/040-nemovitost/assets/permissions.md`** (nový, 12.5 KB)
   - Kompletní katalog oprávnění pro modul
   - Oprávnění pro nemovitosti (properties.*)
   - Oprávnění pro jednotky (units.*)
   - Maticový přehled oprávnění podle rolí
   - Speciální oprávnění (view_archived, bulk_operations, manage_attachments)
   - Vazby na oprávnění jiných modulů
   - Implementace v UI (příklady kódu)
   - RLS Policies v Supabase
   - Audit log
   - Error messages
   - Testovací scénáře

5. **`src/modules/040-nemovitost/module.config.js`** (aktualizováno, 672 B)
   - Kompletní manifest modulu
   - Definice všech tiles a forms
   - Správná struktura podle standardů aplikace v5

---

## 📊 Shrnutí

### ✅ Hotovo
- Kompletní specifikace modulu 040 (45+ stran dokumentace)
- Datový model s detaily pro Supabase migraci
- Checklist implementace s 11 fázemi
- Katalog oprávnění s RLS policies
- Aktualizovaný module.config.js

### ⏳ Čeká na manuální provedení
- Uzavření PR #8 (copilot/add-test-module)
- Uzavření PR #7 (copilot/validate-module-structure)
- Smazání větví: copilot/add-test-module, copilot/validate-module-structure, test-moduly

### 🔜 Další kroky
Po provedení manuálních úkolů:
1. Merge tento PR (#11) do main
2. Začít implementaci podle checklistu v `checklist.md`
3. Začít s Fází 2: Vytvoření database schema v Supabase
4. Implementovat services/db.js s CRUD funkcemi
5. Pokračovat podle priorit v checklistu

---

## 📞 Kontakt

Pokud máte otázky k dokumentaci nebo potřebujete další informace, agent připravil veškerou dokumentaci tak, aby byla samostatná a kompletní. Všechny potřebné detaily jsou v souborech:

- `assets/README.md` - Přehled modulu
- `assets/datovy-model.md` - Datový model
- `assets/checklist.md` - Checklist implementace
- `assets/permissions.md` - Oprávnění
