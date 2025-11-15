# Jak vytvořit Pull Request pro databázové migrace

## Rychlý návod

Tento branch (`copilot/add-missing-documents-columns`) obsahuje databázové migrace a je připraven k vytvoření Pull Requestu.

## Krok 1: Vytvořit Pull Request na GitHubu

### Cesta A: Přes web rozhraní (doporučeno)

1. Jděte na: https://github.com/PatrikCechlovsky/aplikace-v5
2. Měli byste vidět banner "Compare & pull request" - klikněte na něj
3. Pokud banner nevidíte:
   - Klikněte na záložku **"Pull requests"**
   - Klikněte na **"New pull request"**
   - Base: `main` (nebo výchozí branch)
   - Compare: `copilot/add-missing-documents-columns`

### Krok 2: Vyplnit údaje PR

**Title:** (zkopírujte)
```
db(migrations): add missing documents columns, compatibility views and seed demo data
```

**Body:** 
- Otevřete soubor `GITHUB_PR_BODY.md` v tomto repositáři
- Zkopírujte celý obsah
- Vložte do pole "Description" na GitHubu

**Reviewers:**
- Přidejte @PatrikCechlovsky

**Labels:** (pokud jsou dostupné)
- `database`
- `migration`
- `enhancement`

### Krok 3: Vytvořit PR
- Klikněte **"Create pull request"**

---

## Obsah tohoto branchi

```
src/db/migrations/
├── 010_add_missing_columns_and_views.sql  - Schema updates
└── 011_seed_demo_data.sql                  - Demo/test data

GITHUB_PR_BODY.md                           - Text pro GitHub PR (zkopírovat)
PR_MIGRATIONS_DESCRIPTION.md                - Detailní dokumentace
HOW_TO_CREATE_PR_MIGRATIONS.md              - Tento soubor
```

---

## Testování migrací před mergem

Před sloučením PR do main doporučujeme:

1. **Spustit migrace na testovací Supabase DB**
   - Postupujte podle návodu v `GITHUB_PR_BODY.md`
   - Sekce "🚀 Jak spustit migrace na Supabase"

2. **Ověřit kontrolní dotazy**
   - Spusťte všechny SQL kontrolní dotazy uvedené v dokumentaci
   - Zkontrolujte, že výsledky odpovídají očekávání

3. **Manuální test v aplikaci**
   - Otevřete aplikaci připojenou k testovací DB
   - Projděte moduly 030, 040, 050
   - Ověřte, že demo data se zobrazují správně

---

## Co dělat po vytvoření PR

1. **Počkat na review** od @PatrikCechlovsky
2. **Odpovědět na komentáře** pokud budou nějaké připomínky
3. **Spustit migrace na test DB** pokud jste tak ještě neučinili
4. **Aktualizovat checklist** v PR description po dokončení testování

---

## Další kroky po merge

Po sloučení PR do main:

1. **Spustit migrace na produkční DB** (pouze 010, NE 011!)
   - Nejprve vytvořte zálohu
   - Spusťte migraci 010
   - Ověřte, že vše funguje
   - Demo data (011) nespouštějte na produkci

2. **Aktualizovat dokumentaci**
   - Aktualizujte `/docs/database-schema.md` pokud je potřeba
   - Přidejte poznámky o změnách

---

## Pomoc a řešení problémů

Kompletní návod včetně řešení problémů najdete v:
- `PR_MIGRATIONS_DESCRIPTION.md` - Detailní dokumentace
- `GITHUB_PR_BODY.md` - Stručný přehled

Pro specifické otázky kontaktujte @PatrikCechlovsky
