# Pull Request: Database Migrations

## Title
`db(migrations): add missing documents columns, compatibility views and seed demo data`

## Description

Tato pull request přidává databázové migrace pro rozšíření tabulky `documents` o chybějící sloupce, vytváří kompatibilní view a naplňuje databázi testovacími daty.

### Změny v databázi

#### Migrace 010: Přidání sloupců a views
- ✅ Přidání chybějících sloupců do tabulky `documents`:
  - `name` (text) - název dokumentu
  - `type` (text) - MIME typ
  - `size` (integer) - velikost v bytech
  - `owner_id` (uuid) - vlastník dokumentu
  - `related_entity` (text) - typ související entity
  - `related_id` (uuid) - ID související entity
  - `storage_path` (text) - cesta k souboru
  - `metadata` (jsonb) - dodatečná metadata
  - `created_at`, `updated_at` (timestamptz) - časové značky

- ✅ Vytvoření wizard tabulek:
  - `wizard_drafts` - koncepty průvodce
  - `wizard_steps` - kroky průvodce

- ✅ Vytvoření kompatibilních views:
  - `v_properties` - pohled na nemovitosti
  - `v_units` - pohled na jednotky
  - `v_payments` - pohled na platby
  - `v_documents` - pohled na dokumenty

- ✅ Vytvoření indexů pro optimalizaci:
  - `idx_properties_pronajimatel_id`
  - `idx_units_nemovitost_id`
  - `idx_payments_contract_id`

#### Migrace 011: Naplnění testovacími daty
- ✅ 2 pronajímatelé (subjects typu "pronajimatel")
- ✅ 2 nájemníci (subjects typu "najemnik" + záznamy v tabulce tenants)
- ✅ 2 nemovitosti (properties)
- ✅ 2 jednotky (units)
- ✅ 2 smlouvy (contracts)
- ✅ 2 platby (payments)
- ✅ 2 dokumenty (documents)
- ✅ 2 bankovní účty (finance_bank_accounts)
- ✅ 2 měřiče energií (energie_meters)
- ✅ 2 odečty (energie_readings)
- ✅ 2 komunikační šablony (communication_templates)
- ✅ 2 zprávy (communication_messages)

---

## Jak spustit migrace na testovací databázi (Supabase)

### Příprava
1. Otevřete [supabase.com](https://supabase.com)
2. Přihlaste se a vyberte svůj projekt
3. V levém menu klikněte na **SQL Editor**
4. Klikněte na **New query**

### Krok 1: Spuštění migrace 010

1. **Otevřete soubor** `/src/db/migrations/010_add_missing_columns_and_views.sql` z tohoto repositáře
2. **Zkopírujte celý obsah** do SQL editoru v Supabase
3. **Klikněte na tlačítko `Run`** (nebo stiskněte `Ctrl+Enter`)
4. **Počkejte** na dokončení (mělo by to trvat několik sekund)

**Očekávaný výsledek:**
```
Success. No rows returned
```

**Kontrolní dotaz 1** - Ověření nových sloupců v `documents`:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'documents' 
ORDER BY ordinal_position;
```

**Očekávaný výstup:** Měli byste vidět všechny nové sloupce včetně `name`, `type`, `size`, `owner_id`, atd.

**Kontrolní dotaz 2** - Ověření views:
```sql
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public' 
  AND table_name IN ('v_properties', 'v_units', 'v_payments', 'v_documents');
```

**Očekávaný výstup:** 4 řádky s názvy views (v_properties, v_units, v_payments, v_documents)

**Kontrolní dotaz 3** - Ověření wizard tabulek:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('wizard_drafts', 'wizard_steps');
```

**Očekávaný výstup:** 2 řádky (wizard_drafts, wizard_steps)

### Krok 2: Spuštění migrace 011

1. **Otevřete soubor** `/src/db/migrations/011_seed_demo_data.sql` z tohoto repositáře
2. **Zkopírujte celý obsah** do nového SQL query v Supabase
3. **Klikněte na `Run`**
4. **Počkejte** na dokončení

**Očekávaný výsledek:**
```
Success. No rows returned
```
Nebo pokud už nějaká data existují, uvidíte:
```
COMMIT
```

**Kontrolní dotaz 1** - Ověření pronajímatelů:
```sql
SELECT id, display_name, typ_subjektu, ico, city
FROM subjects
WHERE typ_subjektu = 'pronajimatel'
ORDER BY display_name;
```

**Očekávaný výstup:** 2 řádky s "Pronajímatel Demo 1" a "Pronajímatel Demo 2"

**Kontrolní dotaz 2** - Ověření nemovitostí:
```sql
SELECT id, nazev, typ_nemovitosti, mesto, pocet_jednotek
FROM properties
ORDER BY nazev;
```

**Očekávaný výstup:** Alespoň 2 řádky včetně "Nemovitost Demo A" a "Nemovitost Demo B"

**Kontrolní dotaz 3** - Ověření smluv:
```sql
SELECT c.id, c.cislo_smlouvy, c.nazev, c.stav,
       s.display_name as pronajimatel,
       t.display_name as najemnik
FROM contracts c
LEFT JOIN subjects s ON c.landlord_id = s.id
LEFT JOIN tenants t ON c.tenant_id = t.id
ORDER BY c.cislo_smlouvy;
```

**Očekávaný výstup:** Alespoň 2 smlouvy s vazbami na pronajímatele a nájemníky

**Kontrolní dotaz 4** - Ověření dokumentů:
```sql
SELECT id, name, type, size, related_entity, storage_path
FROM documents
WHERE name LIKE '%Demo%' OR name LIKE '%SML-%' OR name LIKE '%Protokol%'
ORDER BY created_at DESC;
```

**Očekávaný výstup:** Alespoň 2 dokumenty (Smlouva_SML-001.pdf, Protokol_Audit.docx)

**Kontrolní dotaz 5** - Ověření celkového počtu záznamů:
```sql
SELECT 
  (SELECT COUNT(*) FROM subjects WHERE typ_subjektu = 'pronajimatel') as pronajimatel_count,
  (SELECT COUNT(*) FROM tenants) as tenant_count,
  (SELECT COUNT(*) FROM properties) as property_count,
  (SELECT COUNT(*) FROM units) as unit_count,
  (SELECT COUNT(*) FROM contracts) as contract_count,
  (SELECT COUNT(*) FROM payments) as payment_count,
  (SELECT COUNT(*) FROM documents) as document_count;
```

**Očekávaný výstup:** Všechna čísla by měla být ≥ 2 (kromě případů, kdy už existují jiná data)

---

## Řešení problémů

### Chyba: "relation already exists"
- **Důvod:** Tabulka nebo view už existuje
- **Řešení:** Migrace používá `IF NOT EXISTS`, takže to není problém. Pokračujte dál.

### Chyba: "permission denied"
- **Důvod:** Nedostatečná oprávnění
- **Řešení:** Ujistěte se, že jste v Supabase přihlášeni jako vlastník projektu nebo máte service_role přístup.

### Chyba: "column already exists"
- **Důvod:** Sloupec už byl přidán
- **Řešení:** Migrace používá `IF NOT EXISTS`, bezpečně můžete pokračovat.

### Chyba při vkládání dat: "duplicate key value violates unique constraint"
- **Důvod:** Data s těmito ID už existují
- **Řešení:** To je v pořádku. Migrace 011 používá `ON CONFLICT DO NOTHING`, takže existující data zůstanou zachována.

### Chyba: "foreign key constraint"
- **Důvod:** Chybí parent záznamy (např. pronajímatel před vložením nemovitosti)
- **Řešení:** Ujistěte se, že jste spustili celou migraci 011 od začátku (včetně BEGIN a COMMIT).

---

## Checklist pro ověření

### Po spuštění migrace 010:
- [ ] Tabulka `documents` má všechny nové sloupce
- [ ] Views `v_properties`, `v_units`, `v_payments`, `v_documents` existují
- [ ] Tabulky `wizard_drafts` a `wizard_steps` existují
- [ ] Indexy jsou vytvořeny (idx_properties_pronajimatel_id, idx_units_nemovitost_id, idx_payments_contract_id)

### Po spuštění migrace 011:
- [ ] Existují alespoň 2 pronajímatelé
- [ ] Existují alespoň 2 nájemníci (v subjects + tenants)
- [ ] Existují alespoň 2 nemovitosti
- [ ] Existují alespoň 2 jednotky
- [ ] Existují alespoň 2 smlouvy s vazbami
- [ ] Existují alespoň 2 platby
- [ ] Existují alespoň 2 dokumenty
- [ ] Existují alespoň 2 bankovní účty
- [ ] Existují alespoň 2 měřiče a 2 odečty
- [ ] Existují alespoň 2 komunikační šablony a 2 zprávy

### Manuální test v aplikaci:
- [ ] Otevřete aplikaci a zkontrolujte modul Pronajímatelé (030)
- [ ] Otevřete detail pronajímatele "Pronajímatel Demo 1"
- [ ] Ověřte, že vidíte související nemovitost
- [ ] Otevřete modul Nemovitosti (040)
- [ ] Ověřte zobrazení nemovitostí "Demo A" a "Demo B"
- [ ] Otevřete modul Nájemníci (050)
- [ ] Ověřte zobrazení demo nájemníků
- [ ] Zkontrolujte, že dokumenty jsou správně propojeny

---

## Soubory změněny v této PR

```
src/db/migrations/
├── 010_add_missing_columns_and_views.sql  (nový/upravený)
└── 011_seed_demo_data.sql                  (nový/upravený)
```

---

## Další kroky po mergi

1. **Spuštění na produkční databázi** (s opatrností):
   - Nejprve vytvořte zálohu databáze
   - Spusťte migraci 010 ve read-only módu pro test
   - Po ověření spusťte na produkci
   - Spusťte migraci 011 pouze pokud chcete demo data (obvykle NE na produkci)

2. **Monitoring**:
   - Sledujte logy aplikace po nasazení
   - Zkontrolujte, že views fungují správně
   - Ověřte výkon dotazů s novými indexy

3. **Dokumentace**:
   - Aktualizujte databázové schéma v `/docs/database-schema.md`
   - Přidejte poznámky o nových sloupcích do developer dokumentace

---

## Poznámky

- Migrace 010 je **bezpečná** pro spuštění opakovaně (idempotentní)
- Migrace 011 je **bezpečná** pro spuštění opakovaně (používá ON CONFLICT DO NOTHING)
- Všechny UUID v demo datech jsou pevně dané pro konzistenci
- Demo data jsou určena pouze pro testování a vývoj
- Na produkci **nespouštějte** migraci 011 (seed data)

---

## Autor & Reviewers

**Autor:** PatrikCechlovsky  
**Reviewers:** (přidat reviewery)  
**Labels:** `database`, `migration`, `enhancement`  
**Milestone:** Database Schema Updates

---

## Related Issues

- Related to previous PR #56
- Implements missing columns for documents module
- Prepares wizard tables for future wizard functionality
