# Databázové schéma Supabase - Aplikace v5

> **Důležité**: Tento dokument slouží jako centrální dokumentace všech tabulek v Supabase databázi. 
> Při přidávání, odstraňování nebo úpravě tabulek/sloupců **VŽDY aktualizujte tento soubor**.

**Poslední aktualizace:** 2025-10-24  
**Verze aplikace:** v5

---

## 📋 Obsah

1. [Přehled tabulek](#přehled-tabulek)
2. [Moduly](#moduly)
   - [Správa uživatelů (010)](#modul-010---správa-uživatelů)
   - [Pronajímatelé a nájemníci (030, 050)](#moduly-030-a-050---subjekty)
   - [Nemovitosti (040)](#modul-040---nemovitosti)
3. [Systémové tabulky](#systémové-tabulky)
4. [Konvence](#konvence-a-standardy)
5. [Jak aktualizovat dokumentaci](#jak-aktualizovat-dokumentaci)

---

## Přehled tabulek

### Základní přehled všech tabulek

| Tabulka | Modul | Účel | Počet sloupců | RLS |
|---------|-------|------|---------------|-----|
| `profiles` | 010 | Profily uživatelů | ~15 | ✅ |
| `user_permissions` | 010 | Oprávnění uživatelů | ~5 | ✅ |
| `subjects` | 030, 050 | Pronajímatelé, nájemníci, zástupci | ~25 | ✅ |
| `user_subjects` | 030, 050 | Vazba uživatelů na subjekty | ~5 | ✅ |
| `subject_history` | 030, 050 | Historie změn subjektů | ~8 | ✅ |
| `properties` | 040 | Nemovitosti (budovy, pozemky) | ~30 | ✅ |
| `units` | 040 | Jednotky nemovitostí (byty, kanceláře) | ~25 | ✅ |
| `property_types` | 040 | Typy nemovitostí (справочник) | ~5 | ✅ |
| `unit_types` | 040 | Typy jednotek (справочник) | ~5 | ✅ |
| `attachments` | * | Přílohy k entitám | ~10 | ✅ |
| `audit_log` | * | Audit změn | ~8 | ✅ |

---

## Moduly

### Modul 010 - Správa uživatelů

#### Tabulka: `profiles`

**Účel**: Uživatelské profily aplikace (rozšíření Supabase Auth)

| Sloupec | Typ | Povinné | Výchozí | Popis |
|---------|-----|---------|---------|-------|
| `id` | UUID | ✅ | PK | Primární klíč (= auth.users.id) |
| `username` | VARCHAR(50) | ✅ | - | Uživatelské jméno (unique) |
| `email` | VARCHAR(255) | ✅ | - | E-mail (unique) |
| `display_name` | VARCHAR(255) | ❌ | NULL | Zobrazované jméno |
| `first_name` | VARCHAR(100) | ❌ | NULL | Křestní jméno |
| `last_name` | VARCHAR(100) | ❌ | NULL | Příjmení |
| `phone` | VARCHAR(20) | ❌ | NULL | Telefon |
| `avatar_url` | TEXT | ❌ | NULL | URL avatara |
| `role` | VARCHAR(50) | ✅ | 'user' | Role (admin, user, viewer) |
| `active` | BOOLEAN | ✅ | true | Aktivní účet |
| `archived` | BOOLEAN | ✅ | false | Archivován |
| `archived_at` | TIMESTAMPTZ | ❌ | NULL | Datum archivace |
| `created_at` | TIMESTAMPTZ | ✅ | NOW() | Datum vytvoření |
| `updated_at` | TIMESTAMPTZ | ✅ | NOW() | Datum poslední úpravy |
| `last_login` | TIMESTAMPTZ | ❌ | NULL | Poslední přihlášení |

**Indexy:**
- `idx_profiles_username` na `username`
- `idx_profiles_email` na `email`
- `idx_profiles_role` na `role`
- `idx_profiles_active` na `active`

**Foreign Keys:**
- `id` → `auth.users.id` (ON DELETE CASCADE)

**RLS Policies:**
```sql
-- Čtení: všichni přihlášení
CREATE POLICY profiles_select ON profiles FOR SELECT USING (auth.uid() IS NOT NULL);

-- Úprava: pouze vlastní profil nebo admin
CREATE POLICY profiles_update ON profiles FOR UPDATE 
  USING (auth.uid() = id OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));
```

---

#### Tabulka: `user_permissions`

**Účel**: Granulární oprávnění pro uživatele

| Sloupec | Typ | Povinné | Výchozí | Popis |
|---------|-----|---------|---------|-------|
| `id` | UUID | ✅ | PK | Primární klíč |
| `user_id` | UUID | ✅ | - | FK na profiles.id |
| `permission` | VARCHAR(100) | ✅ | - | Název oprávnění |
| `created_at` | TIMESTAMPTZ | ✅ | NOW() | Datum přidělení |
| `created_by` | UUID | ❌ | NULL | Kdo přidělil |

**Příklady oprávnění:**
- `properties.create`, `properties.update`, `properties.delete`, `properties.archive`
- `units.create`, `units.update`, `units.delete`, `units.archive`
- `subjects.create`, `subjects.update`, `subjects.delete`
- `users.manage`, `roles.assign`

**Indexy:**
- `idx_user_permissions_user` na `user_id`
- `idx_user_permissions_permission` na `permission`
- `unique_user_permission` na `(user_id, permission)`

---

### Moduly 030 a 050 - Subjekty

#### Tabulka: `subjects`

**Účel**: Pronajímatelé (030), Nájemníci (050), Zástupci - všechny typy subjektů

| Sloupec | Typ | Povinné | Výchozí | Popis |
|---------|-----|---------|---------|-------|
| `id` | UUID | ✅ | PK | Primární klíč |
| `typ_subjektu` | VARCHAR(50) | ✅ | - | Typ: osoba, osvc, firma, spolek, stat, zastupce |
| `role` | VARCHAR(50) | ✅ | - | Role: pronajimatel, najemnik, zastupce |
| `display_name` | VARCHAR(255) | ✅ | - | Zobrazované jméno |
| `jmeno` | VARCHAR(100) | ❌ | NULL | Křestní jméno (pro osobu) |
| `prijmeni` | VARCHAR(100) | ❌ | NULL | Příjmení (pro osobu) |
| `nazev_firmy` | VARCHAR(255) | ❌ | NULL | Název (pro firmu/spolek) |
| `ico` | VARCHAR(20) | ❌ | NULL | IČO (pro firmu/OSVČ) |
| `dic` | VARCHAR(20) | ❌ | NULL | DIČ |
| `rodne_cislo` | VARCHAR(20) | ❌ | NULL | Rodné číslo (pro osobu) |
| `datum_narozeni` | DATE | ❌ | NULL | Datum narození |
| `primary_email` | VARCHAR(255) | ❌ | NULL | Primární email |
| `secondary_email` | VARCHAR(255) | ❌ | NULL | Sekundární email |
| `telefon` | VARCHAR(20) | ❌ | NULL | Telefon |
| `telefon_2` | VARCHAR(20) | ❌ | NULL | Další telefon |
| `ulice` | VARCHAR(255) | ❌ | NULL | Ulice |
| `cislo_popisne` | VARCHAR(20) | ❌ | NULL | Číslo popisné |
| `mesto` | VARCHAR(100) | ❌ | NULL | Město |
| `psc` | VARCHAR(10) | ❌ | NULL | PSČ |
| `stat` | VARCHAR(100) | ✅ | 'ČR' | Stát |
| `poznamka` | TEXT | ❌ | NULL | Poznámka |
| `archived` | BOOLEAN | ✅ | false | Archivován |
| `archived_at` | TIMESTAMPTZ | ❌ | NULL | Datum archivace |
| `created_at` | TIMESTAMPTZ | ✅ | NOW() | Datum vytvoření |
| `updated_at` | TIMESTAMPTZ | ✅ | NOW() | Datum poslední úpravy |
| `created_by` | UUID | ❌ | NULL | Kdo vytvořil |
| `updated_by` | UUID | ❌ | NULL | Kdo upravil |

**Indexy:**
- `idx_subjects_typ` na `typ_subjektu`
- `idx_subjects_role` na `role`
- `idx_subjects_display_name` na `display_name`
- `idx_subjects_ico` na `ico`
- `idx_subjects_email` na `primary_email`
- `idx_subjects_archived` na `archived`

**Triggery:**
- `subjects_updated_at` - automatická aktualizace `updated_at`

---

#### Tabulka: `user_subjects`

**Účel**: Vazební tabulka mezi profily (uživateli) a subjekty (pronajímatelé/nájemníci)

| Sloupec | Typ | Povinné | Výchozí | Popis |
|---------|-----|---------|---------|-------|
| `id` | UUID | ✅ | PK | Primární klíč |
| `profile_id` | UUID | ✅ | - | FK na profiles.id |
| `subject_id` | UUID | ✅ | - | FK na subjects.id |
| `created_at` | TIMESTAMPTZ | ✅ | NOW() | Datum přiřazení |
| `created_by` | UUID | ❌ | NULL | Kdo přiřadil |

**Indexy:**
- `idx_user_subjects_profile` na `profile_id`
- `idx_user_subjects_subject` na `subject_id`
- `unique_user_subject` na `(profile_id, subject_id)`

**Foreign Keys:**
- `profile_id` → `profiles.id` (ON DELETE CASCADE)
- `subject_id` → `subjects.id` (ON DELETE CASCADE)

---

#### Tabulka: `subject_history`

**Účel**: Historie změn subjektů

| Sloupec | Typ | Povinné | Výchozí | Popis |
|---------|-----|---------|---------|-------|
| `id` | UUID | ✅ | PK | Primární klíč |
| `subject_id` | UUID | ✅ | - | FK na subjects.id |
| `changed_at` | TIMESTAMPTZ | ✅ | NOW() | Datum změny |
| `changed_by` | UUID | ❌ | NULL | Kdo změnil |
| `action` | VARCHAR(50) | ✅ | - | Typ akce: create, update, archive, unarchive |
| `old_values` | JSONB | ❌ | NULL | Staré hodnoty |
| `new_values` | JSONB | ❌ | NULL | Nové hodnoty |
| `note` | TEXT | ❌ | NULL | Poznámka |

**Indexy:**
- `idx_subject_history_subject` na `subject_id`
- `idx_subject_history_changed_at` na `changed_at DESC`

---

### Modul 040 - Nemovitosti

#### Tabulka: `properties`

**Účel**: Nemovitosti (budovy, objekty, pozemky)

| Sloupec | Typ | Povinné | Výchozí | Popis |
|---------|-----|---------|---------|-------|
| `id` | UUID | ✅ | PK | Primární klíč |
| `typ_nemovitosti` | VARCHAR(50) | ✅ | - | Typ (bytovy_dum, rodinny_dum, admin_budova, prumyslovy_objekt, pozemek, jiny_objekt) |
| `nazev` | VARCHAR(255) | ✅ | - | Název nemovitosti |
| `popis` | TEXT | ❌ | NULL | Popis |
| `ulice` | VARCHAR(255) | ❌ | NULL | Ulice |
| `cislo_popisne` | VARCHAR(20) | ❌ | NULL | Číslo popisné |
| `cislo_orientacni` | VARCHAR(20) | ❌ | NULL | Číslo orientační |
| `mesto` | VARCHAR(255) | ✅ | - | Město |
| `psc` | VARCHAR(10) | ❌ | NULL | PSČ |
| `kraj` | VARCHAR(100) | ❌ | NULL | Kraj |
| `stat` | VARCHAR(100) | ✅ | 'Česká republika' | Stát |
| `rok_vystavby` | INTEGER | ❌ | NULL | Rok výstavby (1800-současnost) |
| `rok_rekonstrukce` | INTEGER | ❌ | NULL | Rok rekonstrukce |
| `celkova_plocha` | DECIMAL(10,2) | ❌ | NULL | Celková plocha v m² |
| `pocet_podlazi` | INTEGER | ❌ | NULL | Počet nadzemních podlaží |
| `pocet_podzemních_podlazi` | INTEGER | ❌ | NULL | Počet podzemních podlaží |
| `pocet_jednotek` | INTEGER | ✅ | 0 | Počet jednotek (auto-počítané) |
| `spravce` | VARCHAR(255) | ❌ | NULL | Správce nemovitosti |
| `pronajimatel_id` | UUID | ❌ | NULL | FK na subjects.id (vlastník) |
| `vybaveni` | JSONB | ❌ | '[]' | Pole vybavení ["vytah", "parkovani", ...] |
| `poznamky` | TEXT | ❌ | NULL | Poznámky |
| `prilohy` | JSONB | ❌ | '[]' | Pole příloh |
| `archived` | BOOLEAN | ✅ | false | Archivován |
| `archived_at` | TIMESTAMPTZ | ❌ | NULL | Datum archivace |
| `archived_by` | UUID | ❌ | NULL | Kdo archivoval |
| `created_at` | TIMESTAMPTZ | ✅ | NOW() | Datum vytvoření |
| `updated_at` | TIMESTAMPTZ | ✅ | NOW() | Datum poslední úpravy |
| `created_by` | UUID | ❌ | NULL | Kdo vytvořil |
| `updated_by` | UUID | ❌ | NULL | Kdo upravil |

**Indexy:**
- `idx_properties_typ` na `typ_nemovitosti`
- `idx_properties_mesto` na `mesto`
- `idx_properties_pronajimatel` na `pronajimatel_id`
- `idx_properties_archived` na `archived`
- `idx_properties_created_at` na `created_at DESC`

**Foreign Keys:**
- `pronajimatel_id` → `subjects.id` (ON DELETE SET NULL)

**Check Constraints:**
- `rok_vystavby >= 1800 AND rok_vystavby <= current_year`
- `rok_rekonstrukce >= rok_vystavby` (pokud není NULL)
- `celkova_plocha >= 0`
- `pocet_podlazi >= 0`
- `pocet_podzemních_podlazi >= 0`

**Triggery:**
- `properties_updated_at` - automatická aktualizace `updated_at`

---

#### Tabulka: `units`

**Účel**: Jednotky nemovitostí (byty, kanceláře, garáže, sklady)

| Sloupec | Typ | Povinné | Výchozí | Popis |
|---------|-----|---------|---------|-------|
| `id` | UUID | ✅ | PK | Primární klíč |
| `nemovitost_id` | UUID | ✅ | - | FK na properties.id |
| `typ_jednotky` | VARCHAR(50) | ✅ | - | Typ: byt, kancelar, obchod, sklad, garaz, sklep, puda, jina_jednotka |
| `oznaceni` | VARCHAR(50) | ✅ | - | Označení (např. "1.01", "A12") |
| `nazev` | VARCHAR(255) | ❌ | NULL | Název jednotky |
| `popis` | TEXT | ❌ | NULL | Popis |
| `podlazi` | VARCHAR(20) | ❌ | NULL | Podlaží (text: "1", "přízemí", "-1") |
| `plocha` | DECIMAL(10,2) | ✅ | - | Plocha v m² |
| `dispozice` | VARCHAR(20) | ❌ | NULL | Dispozice (např. "2+1", "3+kk") |
| `pocet_mistnosti` | INTEGER | ❌ | NULL | Počet místností |
| `stav` | VARCHAR(20) | ✅ | 'volna' | Stav: volna, obsazena, rezervovana, rekonstrukce |
| `vybaveni` | JSONB | ❌ | '[]' | Pole vybavení |
| `mesicni_najem` | DECIMAL(10,2) | ❌ | NULL | Měsíční nájem v Kč |
| `kauce` | DECIMAL(10,2) | ❌ | NULL | Kauce v Kč |
| `najemce_id` | UUID | ❌ | NULL | FK na subjects.id (nájemce) |
| `najemce` | VARCHAR(255) | ❌ | NULL | Legacy textové jméno nájemce |
| `datum_zahajeni_najmu` | DATE | ❌ | NULL | Datum začátku nájmu |
| `datum_ukonceni_najmu` | DATE | ❌ | NULL | Datum konce nájmu |
| `poznamky` | TEXT | ❌ | NULL | Poznámky |
| `prilohy` | JSONB | ❌ | '[]' | Pole příloh |
| `archived` | BOOLEAN | ✅ | false | Archivován |
| `archived_at` | TIMESTAMPTZ | ❌ | NULL | Datum archivace |
| `archived_by` | UUID | ❌ | NULL | Kdo archivoval |
| `created_at` | TIMESTAMPTZ | ✅ | NOW() | Datum vytvoření |
| `updated_at` | TIMESTAMPTZ | ✅ | NOW() | Datum poslední úpravy |
| `created_by` | UUID | ❌ | NULL | Kdo vytvořil |
| `updated_by` | UUID | ❌ | NULL | Kdo upravil |

**Indexy:**
- `idx_units_nemovitost` na `nemovitost_id`
- `idx_units_typ` na `typ_jednotky`
- `idx_units_stav` na `stav`
- `idx_units_najemce` na `najemce_id`
- `idx_units_archived` na `archived`

**Foreign Keys:**
- `nemovitost_id` → `properties.id` (ON DELETE CASCADE)
- `najemce_id` → `subjects.id` (ON DELETE SET NULL)

**Check Constraints:**
- `plocha >= 0`
- `pocet_mistnosti >= 0` (pokud není NULL)
- `mesicni_najem >= 0` (pokud není NULL)
- `kauce >= 0` (pokud není NULL)
- `datum_ukonceni_najmu >= datum_zahajeni_najmu` (pokud oba zadány)

**Triggery:**
- `units_updated_at` - automatická aktualizace `updated_at`
- `units_update_count` - automatická aktualizace `properties.pocet_jednotek`

---

#### Tabulka: `property_types`

**Účel**: Справочник typů nemovitostí (dynamické typy)

| Sloupec | Typ | Povinné | Výchozí | Popis |
|---------|-----|---------|---------|-------|
| `slug` | VARCHAR(50) | ✅ | PK | Slug (např. "bytovy_dum") |
| `label` | VARCHAR(100) | ✅ | - | Zobrazovaný název (např. "Bytový dům") |
| `color` | VARCHAR(20) | ❌ | '#3b82f6' | Barva pro badge |
| `icon` | VARCHAR(50) | ❌ | 'building' | Ikona |
| `created_at` | TIMESTAMPTZ | ✅ | NOW() | Datum vytvoření |

**Příklady záznamů:**
```sql
INSERT INTO property_types (slug, label, color, icon) VALUES
  ('bytovy_dum', 'Bytový dům', '#3b82f6', 'building'),
  ('rodinny_dum', 'Rodinný dům', '#10b981', 'home'),
  ('admin_budova', 'Administrativní budova', '#8b5cf6', 'office'),
  ('prumyslovy_objekt', 'Průmyslový objekt', '#f59e0b', 'factory'),
  ('pozemek', 'Pozemek', '#22c55e', 'terrain'),
  ('jiny_objekt', 'Jiný objekt', '#6b7280', 'location');
```

---

#### Tabulka: `unit_types`

**Účel**: Справочник typů jednotek (dynamické typy)

| Sloupec | Typ | Povinné | Výchozí | Popis |
|---------|-----|---------|---------|-------|
| `slug` | VARCHAR(50) | ✅ | PK | Slug (např. "byt") |
| `label` | VARCHAR(100) | ✅ | - | Zobrazovaný název (např. "Byt") |
| `color` | VARCHAR(20) | ❌ | '#3b82f6' | Barva pro badge |
| `icon` | VARCHAR(50) | ❌ | 'home' | Ikona |
| `created_at` | TIMESTAMPTZ | ✅ | NOW() | Datum vytvoření |

**Příklady záznamů:**
```sql
INSERT INTO unit_types (slug, label, color, icon) VALUES
  ('byt', 'Byt', '#3b82f6', 'home'),
  ('kancelar', 'Kancelář', '#8b5cf6', 'desk'),
  ('obchod', 'Obchodní prostor', '#f59e0b', 'store'),
  ('sklad', 'Sklad', '#6b7280', 'warehouse'),
  ('garaz', 'Garáž/Parking', '#ef4444', 'car'),
  ('sklep', 'Sklep', '#78716c', 'basement'),
  ('puda', 'Půda', '#a3a3a3', 'attic'),
  ('jina_jednotka', 'Jiná jednotka', '#9ca3af', 'location');
```

---

## Systémové tabulky

### Tabulka: `attachments`

**Účel**: Univerzální správa příloh pro všechny entity

| Sloupec | Typ | Povinné | Výchozí | Popis |
|---------|-----|---------|---------|-------|
| `id` | UUID | ✅ | PK | Primární klíč |
| `entity_type` | VARCHAR(50) | ✅ | - | Typ entity (properties, units, subjects, ...) |
| `entity_id` | UUID | ✅ | - | ID entity |
| `file_name` | VARCHAR(255) | ✅ | - | Název souboru |
| `file_url` | TEXT | ✅ | - | URL souboru (Supabase Storage) |
| `file_size` | INTEGER | ❌ | NULL | Velikost v bajtech |
| `mime_type` | VARCHAR(100) | ❌ | NULL | MIME typ |
| `description` | TEXT | ❌ | NULL | Popis přílohy |
| `uploaded_at` | TIMESTAMPTZ | ✅ | NOW() | Datum nahrání |
| `uploaded_by` | UUID | ❌ | NULL | Kdo nahrál |

**Indexy:**
- `idx_attachments_entity` na `(entity_type, entity_id)`
- `idx_attachments_uploaded_at` na `uploaded_at DESC`

---

### Tabulka: `audit_log`

**Účel**: Centrální audit log všech důležitých změn

| Sloupec | Typ | Povinné | Výchozí | Popis |
|---------|-----|---------|---------|-------|
| `id` | UUID | ✅ | PK | Primární klíč |
| `table_name` | VARCHAR(100) | ✅ | - | Název tabulky |
| `record_id` | UUID | ✅ | - | ID záznamu |
| `action` | VARCHAR(50) | ✅ | - | Akce: INSERT, UPDATE, DELETE, ARCHIVE |
| `old_values` | JSONB | ❌ | NULL | Staré hodnoty |
| `new_values` | JSONB | ❌ | NULL | Nové hodnoty |
| `changed_at` | TIMESTAMPTZ | ✅ | NOW() | Datum změny |
| `changed_by` | UUID | ❌ | NULL | Kdo změnil |

**Indexy:**
- `idx_audit_log_table` na `table_name`
- `idx_audit_log_record` on `(table_name, record_id)`
- `idx_audit_log_changed_at` na `changed_at DESC`
- `idx_audit_log_changed_by` na `changed_by`

---

## Konvence a standardy

### Pojmenování

**Tabulky:**
- Plural (množné číslo): `properties`, `units`, `subjects`
- Snake_case: `property_types`, `user_subjects`

**Sloupce:**
- Snake_case: `typ_nemovitosti`, `created_at`, `updated_by`
- Jednotné názvy pro audit sloupce: `created_at`, `created_by`, `updated_at`, `updated_by`
- Jednotné názvy pro archivaci: `archived`, `archived_at`, `archived_by`

**Foreign Keys:**
- Vzor: `{entita}_id`, např. `pronajimatel_id`, `nemovitost_id`, `najemce_id`
- Vždy UUID typ

### Datové typy

| Účel | Typ | Poznámka |
|------|-----|----------|
| ID | UUID | PK, FK |
| Krátký text | VARCHAR(50-255) | Názvy, označení |
| Dlouhý text | TEXT | Poznámky, popisy |
| Datum | DATE | Pouze datum |
| Datum+čas | TIMESTAMPTZ | S časovou zónou |
| Částka | DECIMAL(10,2) | Peníze v Kč |
| Plocha | DECIMAL(10,2) | m² |
| Boolean | BOOLEAN | true/false |
| Pole | JSONB | Arrays, objekty |

### Audit sloupce (standardní sada)

Každá hlavní tabulka by měla mít:
```sql
created_at TIMESTAMPTZ DEFAULT NOW()
created_by UUID
updated_at TIMESTAMPTZ DEFAULT NOW()  -- s triggerem
updated_by UUID
archived BOOLEAN DEFAULT false
archived_at TIMESTAMPTZ
archived_by UUID
```

### RLS (Row Level Security)

Všechny tabulky mají **RLS povolené**.

Základní politiky:
```sql
-- Čtení: všichni přihlášení
CREATE POLICY {table}_select ON {table}
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Zápis: podle oprávnění
CREATE POLICY {table}_insert ON {table}
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_permissions 
            WHERE user_id = auth.uid() 
            AND permission = '{module}.create')
  );
```

---

## Jak aktualizovat dokumentaci

### Při přidání nové tabulky:

1. Přidej tabulku do sekce [Přehled tabulek](#přehled-tabulek)
2. Vytvoř novou sekci s úplným popisem tabulky:
   - Název a účel
   - Všechny sloupce s typy a popisem
   - Indexy
   - Foreign keys
   - Check constraints
   - Triggery
   - RLS policies
3. Přidej příklady dat (pokud je to справочник)
4. Aktualizuj datum poslední aktualizace nahoře

### Při změně existující tabulky:

1. Aktualizuj popis sloupců
2. Poznamenej změny v commit message
3. Aktualizuj datum poslední aktualizace

### Při odstranění tabulky:

1. Přesuň dokumentaci do sekce "Odstraněné tabulky" (vytvoř pokud neexistuje)
2. Poznač datum odstranění
3. Aktualizuj [Přehled tabulek](#přehled-tabulek)

### Template pro novou tabulku:

```markdown
#### Tabulka: `table_name`

**Účel**: Popis účelu tabulky

| Sloupec | Typ | Povinné | Výchozí | Popis |
|---------|-----|---------|---------|-------|
| `id` | UUID | ✅ | PK | Primární klíč |
| ... | ... | ... | ... | ... |

**Indexy:**
- `idx_table_column` na `column`

**Foreign Keys:**
- `column_id` → `other_table.id` (ON DELETE ...)

**Check Constraints:**
- Popis omezení

**Triggery:**
- `table_updated_at` - automatická aktualizace `updated_at`

**RLS Policies:**
```sql
-- Políčky...
```
```

---

## Poznámky

- Všechny časové značky používají **TIMESTAMPTZ** (s časovou zónou)
- Všechny ID jsou **UUID**
- Všechny texty jsou v **UTF-8**
- Soft delete přes **archived** flag (ne DELETE)
- Historie změn se loguje do `audit_log` nebo specifických `*_history` tabulek

---

**Kontakt pro dotazy k databázi:** Správce databáze nebo vedoucí vývoje
