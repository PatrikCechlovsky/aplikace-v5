# Datový model modulu 060-smlouva (Pronajímatel)

## Tabulky

### Hlavní tabulka: `subjects`
Sdílená tabulka pro všechny subjekty (pronajímatelé, nájemníci, zástupci)

**Filtrování pro tento modul:** `role = 'pronajimatel'`

#### Sloupce

**Identifikace:**
- `id` (UUID, PK) - Primární klíč
- `typ_subjektu` (VARCHAR(50)) - Typ: osoba, osvc, firma, spolek, stat, zastupce
- `role` (VARCHAR(50)) - Role: pronajimatel, najemnik, zastupce
- `display_name` (VARCHAR(255)) - Zobrazované jméno (auto-generované nebo manuální)

**Osobní údaje (pro typ: osoba, zastupce):**
- `jmeno` (VARCHAR(100)) - Křestní jméno
- `prijmeni` (VARCHAR(100)) - Příjmení
- `rodne_cislo` (VARCHAR(20)) - Rodné číslo
- `datum_narozeni` (DATE) - Datum narození

**Firemní údaje (pro typ: osvc, firma, spolek, stat):**
- `nazev_firmy` (VARCHAR(255)) - Název firmy/organizace
- `ico` (VARCHAR(20)) - IČO
- `dic` (VARCHAR(20)) - DIČ

**Kontaktní údaje:**
- `primary_email` (VARCHAR(255)) - Primární email
- `secondary_email` (VARCHAR(255)) - Sekundární email
- `primary_phone` (VARCHAR(20)) - Primární telefon
- `telefon_2` (VARCHAR(20)) - Sekundární telefon

**Adresa:**
- `ulice` (VARCHAR(255)) - Ulice
- `cislo_popisne` (VARCHAR(20)) - Číslo popisné
- `city` (VARCHAR(100)) - Město
- `mesto` (VARCHAR(100)) - Město (alternativa k city)
- `psc` (VARCHAR(10)) - PSČ
- `stat` (VARCHAR(100)) - Stát (výchozí: ČR)

**Metadata:**
- `poznamka` (TEXT) - Poznámka
- `archived` (BOOLEAN) - Příznak archivace
- `archived_at` (TIMESTAMPTZ) - Datum archivace
- `archived_by` (UUID) - Kdo archivoval
- `created_at` (TIMESTAMPTZ) - Datum vytvoření
- `updated_at` (TIMESTAMPTZ) - Datum poslední úpravy
- `created_by` (UUID) - Kdo vytvořil
- `updated_by` (UUID) - Kdo upravil

### Vazební tabulka: `user_subjects`
Propojení uživatelů (profiles) se subjekty

#### Sloupce
- `id` (UUID, PK) - Primární klíč
- `profile_id` (UUID, FK) - Reference na profiles.id
- `subject_id` (UUID, FK) - Reference na subjects.id
- `created_at` (TIMESTAMPTZ) - Datum vytvoření vazby
- `created_by` (UUID) - Kdo vytvořil vazbu

**Unique constraint:** (profile_id, subject_id)

### Historie: `subject_history`
Historie změn subjektů

#### Sloupce
- `id` (UUID, PK) - Primární klíč
- `subject_id` (UUID, FK) - Reference na subjects.id
- `changed_at` (TIMESTAMPTZ) - Datum změny
- `changed_by` (UUID) - Kdo provedl změnu
- `action` (VARCHAR(50)) - Typ akce: create, update, archive, unarchive
- `old_data` (JSONB) - Stará data (před změnou)
- `new_data` (JSONB) - Nová data (po změně)
- `change_summary` (TEXT) - Shrnutí změn

## Vazby (Foreign Keys)

```
subjects
  ├── created_by → profiles.id
  ├── updated_by → profiles.id
  └── archived_by → profiles.id

user_subjects
  ├── profile_id → profiles.id (ON DELETE CASCADE)
  └── subject_id → subjects.id (ON DELETE CASCADE)

subject_history
  ├── subject_id → subjects.id (ON DELETE CASCADE)
  └── changed_by → profiles.id
```

## RLS Policies

**subjects:**
- SELECT: Všichni přihlášení (auth.uid() IS NOT NULL)
- INSERT: Admin nebo user s oprávněním subjects.create
- UPDATE: Admin nebo vlastník dat (přes user_subjects)
- DELETE: Pouze admin

**user_subjects:**
- SELECT: Všichni přihlášení
- INSERT: Admin
- UPDATE: Admin
- DELETE: Admin

**subject_history:**
- SELECT: Všichni přihlášení
- INSERT: Automaticky přes trigger
- UPDATE: ZAKÁZÁNO (read-only)
- DELETE: Pouze admin

## Indexy

**subjects:**
- `idx_subjects_typ` na `typ_subjektu`
- `idx_subjects_role` na `role`
- `idx_subjects_display_name` na `display_name`
- `idx_subjects_ico` na `ico`
- `idx_subjects_email` na `primary_email`
- `idx_subjects_archived` na `archived`

**user_subjects:**
- `idx_user_subjects_profile` na `profile_id`
- `idx_user_subjects_subject` na `subject_id`
- `unique_user_subject` na `(profile_id, subject_id)`

**subject_history:**
- `idx_subject_history_subject` na `subject_id`
- `idx_subject_history_changed_at` na `changed_at`

## UI stavy

### Načítací stav
- Zobrazit spinner nebo skeleton screen
- Text: "Načítání..."

### Prázdný stav
- Zobrazit ikonu a text: "Žádní pronajímatelé"
- Tlačítko: "Přidat prvního pronajímatele"

### Chybový stav
- Zobrazit chybovou hlášku (červeně)
- Text: "Chyba při načítání: [error.message]"
- Tlačítko: "Zkusit znovu"

### Archivovaný stav
- Zobrazit badge "Archivován"
- Šedé pozadí nebo červené zvýraznění
- Skrýt editační tlačítka (kromě "Obnovit")

## Typy subjektů a jejich pole

### Osoba (osoba)
Povinná: jmeno, prijmeni
Volitelná: datum_narozeni, rodne_cislo, kontakty, adresa

### OSVČ (osvc)
Povinná: jmeno, prijmeni NEBO nazev_firmy
Volitelná: ico, dic, kontakty, adresa

### Firma (firma)
Povinná: nazev_firmy
Volitelná: ico, dic, kontakty, adresa

### Spolek/Skupina (spolek)
Povinná: nazev_firmy
Volitelná: kontakty, adresa

### Státní instituce (stat)
Povinná: nazev_firmy
Volitelná: kontakty, adresa

### Zástupce (zastupce)
Povinná: jmeno, prijmeni
Volitelná: kontakty, zastupuje_id (reference na jiný subject)
