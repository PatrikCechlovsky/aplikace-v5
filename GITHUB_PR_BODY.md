# db(migrations): add missing documents columns, compatibility views and seed demo data

## 📋 Popis

Tato PR přidává databázové migrace pro:
1. Rozšíření tabulky `documents` o chybějící sloupce
2. Vytvoření wizard tabulek pro budoucí funkcionalitu
3. Vytvoření kompatibilních SQL views
4. Naplnění databáze testovacími daty

## 🔧 Změny

### Migrace 010: Schema Updates
- ✅ Přidány sloupce do `documents`: name, type, size, owner_id, related_entity, related_id, storage_path, metadata
- ✅ Vytvořeny tabulky: `wizard_drafts`, `wizard_steps`
- ✅ Vytvořeny views: `v_properties`, `v_units`, `v_payments`, `v_documents`
- ✅ Přidány indexy pro optimalizaci

### Migrace 011: Demo Data
- ✅ 2 pronajímatelé + 2 nájemníci
- ✅ 2 nemovitosti + 2 jednotky
- ✅ 2 smlouvy + 2 platby
- ✅ 2 dokumenty + další testovací data

## 🚀 Jak spustit migrace na Supabase

### Krok 1: Migrace 010
1. Otevřete [supabase.com](https://supabase.com) → váš projekt → **SQL Editor** → **New query**
2. Zkopírujte obsah souboru `src/db/migrations/010_add_missing_columns_and_views.sql`
3. Vložte do editoru a klikněte **Run**
4. Spusťte kontrolní dotaz:
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'documents' ORDER BY ordinal_position;
```
✅ Měli byste vidět nové sloupce: name, type, size, owner_id, atd.

### Krok 2: Migrace 011
1. Otevřete nový SQL query v Supabase
2. Zkopírujte obsah souboru `src/db/migrations/011_seed_demo_data.sql`
3. Vložte a klikněte **Run**
4. Spusťte kontrolní dotaz:
```sql
SELECT display_name, typ_subjektu FROM subjects 
WHERE typ_subjektu IN ('pronajimatel', 'najemnik') ORDER BY display_name;
```
✅ Měli byste vidět 4 záznamy (2 pronajímatelé, 2 nájemníci)

### Další kontrolní dotazy

**Ověření views:**
```sql
SELECT table_name FROM information_schema.views 
WHERE table_schema = 'public' AND table_name LIKE 'v_%';
```

**Ověření dat:**
```sql
SELECT 
  (SELECT COUNT(*) FROM subjects WHERE typ_subjektu = 'pronajimatel') as pronajimatel,
  (SELECT COUNT(*) FROM properties) as nemovitosti,
  (SELECT COUNT(*) FROM contracts) as smlouvy,
  (SELECT COUNT(*) FROM documents) as dokumenty;
```

## ✅ Checklist

### Po migraci 010:
- [ ] Tabulka `documents` má nové sloupce
- [ ] Views `v_properties`, `v_units`, `v_payments`, `v_documents` existují
- [ ] Tabulky `wizard_drafts` a `wizard_steps` vytvořeny
- [ ] Indexy jsou aktivní

### Po migraci 011:
- [ ] Existují demo pronajímatelé
- [ ] Existují demo nemovitosti
- [ ] Existují demo smlouvy s vazbami
- [ ] Existují demo dokumenty

### Manuální test v aplikaci:
- [ ] Modul Pronajímatelé (030) - zobrazení demo dat
- [ ] Modul Nemovitosti (040) - zobrazení demo nemovitostí
- [ ] Modul Nájemníci (050) - zobrazení demo nájemníků
- [ ] Tab Dokumenty - funkční zobrazení dokumentů

## 🔍 Řešení problémů

| Chyba | Řešení |
|-------|--------|
| "relation already exists" | OK - migrace používá IF NOT EXISTS |
| "duplicate key value" | OK - používá ON CONFLICT DO NOTHING |
| "permission denied" | Ujistěte se, že jste vlastník projektu |
| "foreign key constraint" | Spusťte celou migraci od BEGIN do COMMIT |

## 📁 Soubory

```
src/db/migrations/
├── 010_add_missing_columns_and_views.sql
└── 011_seed_demo_data.sql

PR_MIGRATIONS_DESCRIPTION.md  (detailní dokumentace)
```

## 📝 Poznámky

- ⚠️ Migrace 011 (demo data) **NESPOUŠTĚT na produkci**
- ✅ Obě migrace jsou idempotentní (bezpečné pro opakované spuštění)
- ✅ Všechny změny jsou zpětně kompatibilní
- 📖 Detailní dokumentace: viz `PR_MIGRATIONS_DESCRIPTION.md`

## 🔗 Related

- Related to PR #56
- Implements: Missing documents columns
- Prepares: Wizard functionality tables
- Database schema: `/docs/database-schema.md`

## 👥 Review

**Labels:** `database`, `migration`, `enhancement`  
**Reviewers:** @PatrikCechlovsky
