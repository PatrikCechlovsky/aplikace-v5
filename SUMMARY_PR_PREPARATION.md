# Souhrn přípravy Pull Requestu - Databázové migrace

## ✅ Co je hotové

### 1. Databázové migrace
- ✅ **010_add_missing_columns_and_views.sql** - připraveno
  - Přidává chybějící sloupce do `documents`
  - Vytváří wizard tabulky
  - Vytváří kompatibilní views
  - Přidává indexy pro optimalizaci

- ✅ **011_seed_demo_data.sql** - připraveno
  - Demo pronajímatelé a nájemníci
  - Demo nemovitosti a jednotky
  - Demo smlouvy a platby
  - Demo dokumenty a další testovací data

### 2. Dokumentace
- ✅ **GITHUB_PR_BODY.md** - text pro GitHub PR (zkopírovat do PR description)
- ✅ **PR_MIGRATIONS_DESCRIPTION.md** - detailní dokumentace s kontrolními dotazy
- ✅ **HOW_TO_CREATE_PR_MIGRATIONS.md** - návod jak vytvořit PR
- ✅ **SUMMARY_PR_PREPARATION.md** - tento soubor

### 3. Git branch
- ✅ Branch `copilot/add-missing-documents-columns` je připraven
- ✅ Všechny změny jsou commitnuty
- ✅ Branch je pushnutý na GitHub

---

## 🚀 Jak vytvořit Pull Request (3 kroky)

### Krok 1: Otevřít GitHub a zahájit PR

1. Jděte na: **https://github.com/PatrikCechlovsky/aplikace-v5**
2. Měli byste vidět zelený banner **"Compare & pull request"** - klikněte na něj
3. Pokud banner nevidíte:
   - Klikněte na záložku **"Pull requests"**
   - Klikněte na **"New pull request"**
   - **Base:** `main`
   - **Compare:** `copilot/add-missing-documents-columns`
   - Klikněte **"Create pull request"**

### Krok 2: Vyplnit údaje PR

#### Title (zkopírujte přesně):
```
db(migrations): add missing documents columns, compatibility views and seed demo data
```

#### Description/Body:
1. Otevřete soubor **`GITHUB_PR_BODY.md`** (je v root adresáři tohoto repo)
2. Zkopírujte **celý obsah** souboru
3. Vložte do pole **"Write"** v GitHub PR

#### Reviewers:
- Přidejte: **@PatrikCechlovsky**

#### Labels (pokud jsou dostupné):
- `database`
- `migration`
- `enhancement`

### Krok 3: Vytvořit PR
- Zkontrolujte, že všechno vypadá správně
- Klikněte **"Create pull request"**

---

## 📋 Checklist před vytvořením PR

- [x] Migrace 010 je připravena a otestována syntaxí
- [x] Migrace 011 je připravena a otestována syntaxí
- [x] PR dokumentace je kompletní
- [x] Návody pro testování jsou připraveny
- [x] Branch je pushnutý na GitHub
- [ ] PR je vytvořen na GitHubu
- [ ] Reviewers jsou přidáni
- [ ] Labels jsou přidány

---

## 🧪 Co udělat PO vytvoření PR

### 1. Otestovat migrace na Supabase (důležité!)

Postupujte podle návodu v **GITHUB_PR_BODY.md** sekce "🚀 Jak spustit migrace na Supabase":

1. **Spustit migraci 010** na testovací DB
   - Zkopírovat `src/db/migrations/010_add_missing_columns_and_views.sql`
   - Vložit do Supabase SQL Editor
   - Kliknout Run
   - Spustit kontrolní dotazy

2. **Spustit migraci 011** na testovací DB
   - Zkopírovat `src/db/migrations/011_seed_demo_data.sql`
   - Vložit do Supabase SQL Editor
   - Kliknout Run
   - Spustit kontrolní dotazy

3. **Ověřit výsledky**
   - Spustit všechny kontrolní SELECT dotazy z dokumentace
   - Zkontrolovat, že výsledky odpovídají očekávání
   - Zaškrtnout položky v checklistu v PR description

### 2. Manuální test v aplikaci

1. Otevřít aplikaci připojenou k testovací DB
2. Otevřít modul **030 - Pronajímatelé**
   - Zkontrolovat zobrazení demo pronajímatelů
   - Otevřít detail jednoho pronajímatele
3. Otevřít modul **040 - Nemovitosti**
   - Zkontrolovat zobrazení demo nemovitostí
   - Otevřít detail nemovitosti
4. Otevřít modul **050 - Nájemníci**
   - Zkontrolovat zobrazení demo nájemníků
5. Zkontrolovat tab **Dokumenty** v detailu entity
   - Ověřit, že se dokumenty zobrazují správně

### 3. Aktualizovat PR

Po dokončení testování:
1. Jděte zpět na PR na GitHubu
2. V description zaškrtněte dokončené položky v checklistu
3. Přidejte komentář s výsledky testování

---

## 📚 Reference dokumenty

| Soubor | Účel |
|--------|------|
| `GITHUB_PR_BODY.md` | **Text pro GitHub PR** - zkopírovat do PR description |
| `PR_MIGRATIONS_DESCRIPTION.md` | Detailní dokumentace s kompletními kontrolními dotazy |
| `HOW_TO_CREATE_PR_MIGRATIONS.md` | Podrobný návod jak vytvořit PR |
| `SUMMARY_PR_PREPARATION.md` | Tento soubor - přehled a checklist |
| `src/db/migrations/010_*.sql` | Migrace pro schema updates |
| `src/db/migrations/011_*.sql` | Migrace pro demo/test data |

---

## ⚠️ Důležité poznámky

### PŘED mergem do main:
- ✅ Spustit obě migrace na **testovací** Supabase DB
- ✅ Ověřit všechny kontrolní dotazy
- ✅ Otestovat aplikaci s demo daty
- ✅ Získat review approval od @PatrikCechlovsky

### PO mergi do main:
- ⚠️ Na **produkci** spustit POUZE migraci **010** (schema updates)
- ⚠️ Na **produkci** NESPOUŠTĚT migraci **011** (demo data)
- ✅ Nejprve vytvořit zálohu produkční DB
- ✅ Aktualizovat dokumentaci `/docs/database-schema.md`

---

## 🆘 Pomoc

Pokud narazíte na problém:

1. **Kontrolní dotazy selhávají** → viz sekce "Řešení problémů" v `GITHUB_PR_BODY.md`
2. **Syntaktické chyby v SQL** → zkontrolujte, že jste zkopírovali celý soubor včetně BEGIN/COMMIT
3. **Permission denied** → ujistěte se, že jste vlastník projektu v Supabase
4. **Aplikace nefunguje** → zkontrolujte console pro chyby, ověřte připojení k DB

Pro detailní pomoc kontaktujte @PatrikCechlovsky

---

## 📊 Statistiky

- **Migračních souborů:** 2
- **Řádků SQL kódu:** 278 (130 + 148)
- **Demo entit:** 20+ (subjects, properties, contracts, payments, documents, atd.)
- **Nových dokumentačních souborů:** 4
- **Kontrolních dotazů:** 10+

---

**Připravil:** GitHub Copilot Agent  
**Datum:** 2025-11-15  
**Branch:** copilot/add-missing-documents-columns  
**Status:** ✅ Připraveno k vytvoření PR
