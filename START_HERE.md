# 🎯 START HERE - Návod k vytvoření Pull Requestu

## 📌 Co potřebujete udělat

Tento branch obsahuje připravené databázové migrace. Pro vytvoření Pull Requestu postupujte takto:

---

## ⚡ RYCHLÝ POSTUP (3 minuty)

### 1️⃣ Otevřete GitHub
Jděte na: **https://github.com/PatrikCechlovsky/aplikace-v5**

### 2️⃣ Vytvořte Pull Request
- Klikněte na zelený banner **"Compare & pull request"** (pokud ho vidíte)
- NEBO: **Pull requests** → **New pull request** → Compare: `copilot/add-missing-documents-columns`

### 3️⃣ Zkopírujte title
```
db(migrations): add missing documents columns, compatibility views and seed demo data
```

### 4️⃣ Zkopírujte description
- Otevřete soubor **`GITHUB_PR_BODY.md`**
- Zkopírujte **celý obsah**
- Vložte do pole "Description" na GitHubu

### 5️⃣ Přidejte reviewera
- Přidejte: **@PatrikCechlovsky**

### 6️⃣ Klikněte "Create pull request"

✅ **Hotovo!** PR je vytvořen.

---

## 📚 Dokumenty v tomto branchi

### Pro vytvoření PR (POUŽIJTE TENTO):
- **`GITHUB_PR_BODY.md`** ← Zkopírujte do GitHub PR description

### Detailní dokumentace:
- **`SUMMARY_PR_PREPARATION.md`** - Kompletní přehled a checklist
- **`PR_MIGRATIONS_DESCRIPTION.md`** - Detailní návod s kontrolními SQL dotazy
- **`HOW_TO_CREATE_PR_MIGRATIONS.md`** - Podrobný návod jak vytvořit PR

### Migrace:
- **`src/db/migrations/010_add_missing_columns_and_views.sql`** - Schema updates
- **`src/db/migrations/011_seed_demo_data.sql`** - Demo/test data

---

## 🧪 Po vytvoření PR: Testování

Po vytvoření PR byste měli otestovat migrace na Supabase:

1. Jděte na **supabase.com** → váš projekt → **SQL Editor**
2. Spusťte migraci 010 (zkopírujte obsah souboru, vložte, klikněte Run)
3. Spusťte migraci 011 (stejný postup)
4. Spusťte kontrolní dotazy (najdete v `GITHUB_PR_BODY.md`)

Detailní návod: viz sekce "🚀 Jak spustit migrace na Supabase" v `GITHUB_PR_BODY.md`

---

## ❓ Potřebujete pomoc?

- **Jak vytvořit PR?** → Viz `HOW_TO_CREATE_PR_MIGRATIONS.md`
- **Jak testovat migrace?** → Viz `GITHUB_PR_BODY.md` sekce "Jak spustit migrace"
- **Kompletní checklist?** → Viz `SUMMARY_PR_PREPARATION.md`
- **Detailní kontrolní dotazy?** → Viz `PR_MIGRATIONS_DESCRIPTION.md`

---

## ✅ Checklist

- [ ] PR vytvořen na GitHubu
- [ ] Title zkopírován z tohoto návodu
- [ ] Description zkopírována z `GITHUB_PR_BODY.md`
- [ ] Reviewer @PatrikCechlovsky přidán
- [ ] Migrace otestovány na Supabase
- [ ] Kontrolní dotazy spuštěny a ověřeny
- [ ] Checklist v PR description aktualizován

---

**🎉 Po dokončení těchto kroků je vaše práce hotová!**

Branch: `copilot/add-missing-documents-columns`  
Status: ✅ Připraveno
