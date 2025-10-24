# Návod: Jak udržovat dokumentaci databázového schématu

Tento soubor obsahuje pokyny pro vývojáře, jak správně aktualizovat dokumentaci databázového schématu při změnách v Supabase.

## 📍 Kde je dokumentace?

Hlavní dokumentace databázového schématu je v souboru:
**`docs/database-schema.md`**

## 📝 Kdy aktualizovat dokumentaci?

Dokumentaci **MUSÍTE** aktualizovat vždy, když:

1. ✅ Vytváříte novou tabulku
2. ✅ Přidáváte nebo odstraňujete sloupec
3. ✅ Měníte datový typ sloupce
4. ✅ Přidáváte nebo měníte index
5. ✅ Přidáváte nebo měníte foreign key
6. ✅ Přidáváte nebo měníte check constraint
7. ✅ Přidáváte nebo měníte trigger
8. ✅ Přidáváte nebo měníte RLS policy
9. ✅ Měníte účel nebo význam tabulky/sloupce

## 🔄 Workflow pro změny v databázi

### 1. Vytvoření SQL migrace

Všechny změny v databázi musí být popsány v SQL migračním souboru:

```bash
# Vytvořte nový migrační soubor
touch docs/tasks/supabase-migrations/XXX_description_of_change.sql
```

**Pojmenování:**
- Číslujte postupně: `001_`, `002_`, `003_`, ...
- Používejte popisný název: `create_contracts_table`, `add_tenant_to_units`, etc.
- Používejte snake_case

**Struktura migračního souboru:**

```sql
-- ============================================================================
-- Migration XXX: Description
-- ============================================================================
-- Tento soubor popisuje změnu v databázi...
-- ============================================================================

-- Změny zde...
CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ...
);

-- Komentáře
COMMENT ON TABLE contracts IS 'Smlouvy o pronájmu';

-- Indexy
CREATE INDEX IF NOT EXISTS idx_contracts_unit ON contracts(unit_id);

-- RLS policies
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY contracts_select ON contracts FOR SELECT USING (auth.uid() IS NOT NULL);

-- ============================================================================
-- KONEC MIGRACE
-- ============================================================================
SELECT 'Migration XXX completed successfully!' as status;
```

### 2. Spuštění migrace v Supabase

```bash
# V Supabase Dashboard: SQL Editor
# Zkopírujte obsah migračního souboru a spusťte
```

### 3. Aktualizace dokumentace

Po úspěšné migraci **IHNED** aktualizujte `docs/database-schema.md`:

#### Pro novou tabulku:

1. Přidejte řádek do [Přehled tabulek](#přehled-tabulek)
2. Vytvořte novou sekci s popisem tabulky pomocí šablony níže
3. Aktualizujte datum poslední aktualizace

**Šablona pro novou tabulku:**

```markdown
#### Tabulka: `table_name`

**Účel**: Krátký popis účelu tabulky

| Sloupec | Typ | Povinné | Výchozí | Popis |
|---------|-----|---------|---------|-------|
| `id` | UUID | ✅ | PK | Primární klíč |
| `name` | VARCHAR(255) | ✅ | - | Název |
| `created_at` | TIMESTAMPTZ | ✅ | NOW() | Datum vytvoření |
| ... | ... | ... | ... | ... |

**Indexy:**
- `idx_table_column` na `column`

**Foreign Keys:**
- `foreign_id` → `other_table.id` (ON DELETE CASCADE)

**Check Constraints:**
- Popis omezení

**Triggery:**
- `table_updated_at` - automatická aktualizace `updated_at`

**RLS Policies:**
```sql
CREATE POLICY table_select ON table
  FOR SELECT USING (auth.uid() IS NOT NULL);
```
```

#### Pro změnu sloupce:

1. Najděte tabulku v dokumentaci
2. Aktualizujte řádek s daným sloupcem
3. Poznamenejte změnu v commit message
4. Aktualizujte datum poslední aktualizace

#### Pro odstranění tabulky:

1. Přesuňte sekci do "Odstraněné tabulky" (vytvoř pokud neexistuje)
2. Přidej datum odstranění
3. Odstraň z [Přehled tabulek](#přehled-tabulek)
4. Aktualizuj datum poslední aktualizace

### 4. Commit změn

```bash
git add docs/database-schema.md
git add docs/tasks/supabase-migrations/XXX_*.sql
git commit -m "Database: Add/Update/Remove table_name

- Added migration XXX
- Updated database schema documentation
- [popis změn]
"
```

## 📐 Konvence

### Pojmenování tabulek
- **Množné číslo**: `properties`, `units`, `contracts`
- **Snake_case**: `property_types`, `user_subjects`

### Pojmenování sloupců
- **Snake_case**: `typ_nemovitosti`, `created_at`, `updated_by`
- **Jednotné audit sloupce**: `created_at`, `created_by`, `updated_at`, `updated_by`
- **Jednotné archivace**: `archived`, `archived_at`, `archived_by`

### Foreign Keys
- **Vzor**: `{entita}_id`
- **Příklady**: `pronajimatel_id`, `nemovitost_id`, `najemce_id`
- **Vždy UUID**

### Standardní audit sloupce

Každá hlavní tabulka by měla obsahovat:

```sql
created_at TIMESTAMPTZ DEFAULT NOW(),
created_by UUID,
updated_at TIMESTAMPTZ DEFAULT NOW(),
updated_by UUID,
archived BOOLEAN DEFAULT false,
archived_at TIMESTAMPTZ,
archived_by UUID
```

### RLS (Row Level Security)

- **Všechny tabulky mají RLS povolené**
- Základní políčka: SELECT (všichni přihlášení), INSERT/UPDATE/DELETE (podle oprávnění)

## 🎯 Checklist před commitem

Před commitem změn ověřte:

- [ ] SQL migrace je vytvořena a otestována
- [ ] Migrace je spuštěna v Supabase
- [ ] `docs/database-schema.md` je aktualizovaná
- [ ] Datum poslední aktualizace je aktuální
- [ ] Všechny sloupce mají popis
- [ ] Indexy, FK, constraints jsou zdokumentované
- [ ] RLS políčka jsou zdokumentované
- [ ] Commit message popisuje změnu

## 🔍 Kontrola kvality dokumentace

Pravidelně kontrolujte:

1. **Úplnost**: Jsou všechny tabulky zdokumentované?
2. **Přesnost**: Odpovídá dokumentace skutečnosti v Supabase?
3. **Aktuálnost**: Je datum poslední aktualizace správné?
4. **Čitelnost**: Jsou popisy jasné a srozumitelné?

## 📞 Kontakt

Pokud máte dotazy nebo narazíte na nesrovnalosti, kontaktujte:
- Vedoucího vývoje
- Správce databáze

---

**Pamatujte:** Dobrá dokumentace šetří čas všem vývojářům! 🎉
