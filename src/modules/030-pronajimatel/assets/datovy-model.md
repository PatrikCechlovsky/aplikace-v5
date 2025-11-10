# Datový model - Modul 030 (Pronajímatel)

## Přehled
Modul pracuje s tabulkou `subjects` která obsahuje všechny subjekty (pronajímatelé i nájemníci).
Pronajímatelé se od nájemníků liší hodnotou v poli `role` ('pronajimatel' vs 'najemnik').

## 1. Subjekt (subjects)

### Tabulka: `subjects`

| Sloupec | Typ | Povinné | Výchozí | Popis |
|---------|-----|---------|---------|-------|
| **Identifikace** |
| `id` | UUID | Ano | auto | Primární klíč |
| `role` | VARCHAR(50) | Ano | - | 'pronajimatel' nebo 'najemnik' |
| `type` | VARCHAR(50) | Ano | - | Typ subjektu (enum) |
| **Základní údaje** |
| `display_name` | VARCHAR(255) | Ano | - | Zobrazované jméno |
| `titul_pred` | VARCHAR(50) | Ne | NULL | Titul před jménem (Ing., Mgr., atd.) |
| `jmeno` | VARCHAR(255) | Ne | NULL | Křestní jméno |
| `prijmeni` | VARCHAR(255) | Ne | NULL | Příjmení |
| `titul_za` | VARCHAR(50) | Ne | NULL | Titul za jménem (Ph.D., CSc., atd.) |
| **Identifikační údaje** |
| `ico` | VARCHAR(20) | Ne | NULL | IČO (pro firmy, OSVČ) |
| `dic` | VARCHAR(20) | Ne | NULL | DIČ |
| `typ_dokladu` | VARCHAR(20) | Ne | NULL | 'op', 'pas', 'rid' |
| `cislo_dokladu` | VARCHAR(50) | Ne | NULL | Číslo dokladu totožnosti |
| `datum_narozeni` | DATE | Ne | NULL | Datum narození |
| **Adresa** |
| `country` | VARCHAR(100) | Ano | 'Česká republika' | Stát |
| `street` | VARCHAR(255) | Ne | NULL | Ulice |
| `cislo_popisne` | VARCHAR(20) | Ne | NULL | Číslo popisné/orientační |
| `city` | VARCHAR(255) | Ne | NULL | Město |
| `zip` | VARCHAR(10) | Ne | NULL | PSČ |
| **Kontakty** |
| `primary_phone` | VARCHAR(50) | Ne | NULL | Primární telefon |
| `primary_email` | VARCHAR(255) | Ano | - | Primární email |
| **Banking & Login** |
| `bankovni_ucet` | VARCHAR(50) | Ne | NULL | Bankovní účet (legacy pole) |
| `prihlasovaci_jmeno` | VARCHAR(100) | Ne | NULL | Přihlašovací jméno |
| `prihlasovaci_heslo` | VARCHAR(255) | Ne | NULL | Přihlašovací heslo (hashované) |
| **Zastupování** |
| `zastupce` | BOOLEAN | Ano | false | Je toto osoba zastupující jiný subjekt? |
| `zastupuje_id` | UUID | Ne | NULL | FK na subjects - koho zastupuje |
| **Rozšířené údaje (JSONB)** |
| `kontaktni_osoba` | JSONB | Ne | NULL | Kontaktní osoba (pro firmy) |
| `bankovni_ucty` | JSONB | Ne | NULL | Array bankovních účtů |
| `preferovany_zpusob_komunikace` | VARCHAR(50) | Ne | NULL | 'email', 'telefon', 'posta' |
| `podpisove_prava` | JSONB | Ne | NULL | Array osob s podpisovým právem |
| `dorucovaci_adresa` | JSONB | Ne | NULL | Jiná doručovací adresa |
| `platebni_info` | JSONB | Ne | NULL | Platební informace |
| **Metadata** |
| `archived` | BOOLEAN | Ano | false | Příznak archivace |
| `archived_at` | TIMESTAMPTZ | Ne | NULL | Datum archivace |
| `created_at` | TIMESTAMPTZ | Ano | NOW() | Datum vytvoření |
| `updated_at` | TIMESTAMPTZ | Ano | NOW() | Datum poslední úpravy |
| `created_by` | UUID | Ne | NULL | FK na auth.users |
| `updated_by` | UUID | Ne | NULL | FK na auth.users |

### Enum: typ subjektu (type)
```javascript
typySubjektu = {
  'osoba':    { name: 'Osoba', icon: 'person', emoji: '👤' },
  'osvc':     { name: 'OSVČ', icon: 'briefcase', emoji: '💼' },
  'firma':    { name: 'Firma', icon: 'building', emoji: '🏢' },
  'spolek':   { name: 'Spolek / Skupina', icon: 'people', emoji: '👥' },
  'stat':     { name: 'Státní instituce', icon: 'bank', emoji: '🏛️' },
  'zastupce': { name: 'Zástupce', icon: 'handshake', emoji: '🤝' }
}
```

### Indexy
```sql
CREATE INDEX idx_subjects_role ON subjects(role);
CREATE INDEX idx_subjects_type ON subjects(type);
CREATE INDEX idx_subjects_archived ON subjects(archived);
CREATE INDEX idx_subjects_ico ON subjects(ico);
CREATE INDEX idx_subjects_city ON subjects(city);
CREATE INDEX idx_subjects_zastupuje ON subjects(zastupuje_id);
CREATE INDEX idx_subjects_display_name ON subjects(display_name);
CREATE INDEX idx_subjects_preferovany_zpusob_komunikace ON subjects(preferovany_zpusob_komunikace);
```

### Foreign Keys
```sql
ALTER TABLE subjects
  ADD CONSTRAINT fk_subjects_zastupuje 
  FOREIGN KEY (zastupuje_id) REFERENCES subjects(id) ON DELETE SET NULL;

ALTER TABLE subjects
  ADD CONSTRAINT fk_subjects_created_by 
  FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE subjects
  ADD CONSTRAINT fk_subjects_updated_by 
  FOREIGN KEY (updated_by) REFERENCES auth.users(id) ON DELETE SET NULL;
```

### RLS Policies
```sql
-- Čtení: všichni přihlášení uživatelé
CREATE POLICY "subjects_read" ON subjects
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Vytváření: uživatelé s právem subjects.create
CREATE POLICY "subjects_create" ON subjects
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_permissions WHERE user_id = auth.uid() AND permission = 'subjects.create')
  );

-- Úprava: uživatelé s právem subjects.update
CREATE POLICY "subjects_update" ON subjects
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_permissions WHERE user_id = auth.uid() AND permission = 'subjects.update')
  );

-- Delete: pouze superadmin
CREATE POLICY "subjects_delete" ON subjects
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin')
  );
```

### Validační pravidla
- `display_name`: min 1 znak, max 255 znaků
- `primary_email`: validní email formát
- `ico`: 8 číslic (pokud je vyplněno)
- `dic`: validní formát DIČ (pokud je vyplněno)
- `zip`: regex `^[0-9]{3}\s?[0-9]{2}$`
- `datum_narozeni`: nesmí být v budoucnosti
- `primary_phone`: validní telefonní číslo (pokud je vyplněno)
- `preferovany_zpusob_komunikace`: pouze 'email', 'telefon', 'posta'

---

## 2. Typy subjektů (subject_types)

### Tabulka: `subject_types`

Konfigurovatelné typy subjektů.

| Sloupec | Typ | Povinné | Výchozí | Popis |
|---------|-----|---------|---------|-------|
| `id` | UUID | Ano | auto | Primární klíč |
| `slug` | VARCHAR(50) | Ano | - | Slug (unikátní identifikátor) |
| `label` | VARCHAR(255) | Ano | - | Zobrazovaný název |
| `icon` | VARCHAR(50) | Ne | NULL | Ikona (CSS class nebo emoji) |
| `description` | TEXT | Ne | NULL | Popis typu |
| `active` | BOOLEAN | Ano | true | Aktivní / neaktivní |
| `display_order` | INTEGER | Ano | 0 | Pořadí zobrazení |
| `created_at` | TIMESTAMPTZ | Ano | NOW() | Datum vytvoření |
| `updated_at` | TIMESTAMPTZ | Ano | NOW() | Datum poslední úpravy |

### Výchozí data
```sql
INSERT INTO subject_types (slug, label, icon, display_order) VALUES
  ('osoba', 'Osoba', 'person', 1),
  ('osvc', 'OSVČ', 'briefcase', 2),
  ('firma', 'Firma', 'building', 3),
  ('spolek', 'Spolek / Skupina', 'people', 4),
  ('stat', 'Státní instituce', 'bank', 5),
  ('zastupce', 'Zástupce', 'handshake', 6);
```

---

## 3. JSONB struktury

### kontaktni_osoba
Používá se pro firmy a státní instituce k zaznamenání kontaktní osoby.

```json
{
  "jmeno": "Jana Nováková",
  "email": "jana@firma.cz",
  "telefon": "+420601234567",
  "pozice": "Vedoucí správy"
}
```

### bankovni_ucty
Array bankovních účtů subjektu.

```json
[
  {
    "banka": "ČSOB",
    "iban": "CZ6508000000192000145399",
    "bic": "GIBACZPX",
    "poznamka": "Hlavní účet",
    "default": true
  },
  {
    "banka": "KB",
    "iban": "CZ6501000000192000145400",
    "bic": "KOMBCZPP",
    "poznamka": "Účet pro kauce",
    "default": false
  }
]
```

### podpisove_prava
Array osob s podpisovým právem (pro firmy).

```json
[
  {
    "user_id": "uuid-1",
    "jmeno": "Petr Svoboda",
    "role": "jednatel",
    "od": "2024-01-01",
    "do": null
  },
  {
    "user_id": "uuid-2",
    "jmeno": "Jana Nováková",
    "role": "prokuristka",
    "od": "2024-06-01",
    "do": null
  }
]
```

### dorucovaci_adresa
Jiná doručovací adresa (pokud se liší od trvalé).

```json
{
  "ulice": "Jiná ulice",
  "cislo_popisne": "456",
  "mesto": "Brno",
  "psc": "60200",
  "stat": "Česká republika"
}
```

### platebni_info
Platební informace subjektu.

```json
{
  "preferovany_zpusob": "bankovni_prevod",
  "defaultni_iban": "CZ6508000000192000145399",
  "poznamka": "Vždy uvádět variabilní symbol"
}
```

---

## 4. Vazby mezi tabulkami

```
subjects (pronajímatelé) (1) ←--→ (N) properties
  id                              pronajimatel_id

subjects (zastupovaný)    (1) ←--→ (N) subjects (zástupci)
  id                              zastupuje_id

subjects                  (1) ←--→ (N) contracts
  id                              pronajimatel_id / najemnik_id

subjects                  (1) ←--→ (N) payments
  id                              plat_od_id / plat_pro_id
```

---

## 5. Triggers

### Automatická aktualizace `updated_at`
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER subjects_updated_at
  BEFORE UPDATE ON subjects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Automatická aktualizace `display_name`
Pro typy 'osoba' a 'zastupce' automaticky sestaví `display_name` z titulů a jména/příjmení.

```sql
CREATE OR REPLACE FUNCTION update_subject_display_name()
RETURNS TRIGGER AS $$
BEGIN
  IF (NEW.type = 'osoba' OR NEW.type = 'zastupce') AND 
     (NEW.jmeno IS NOT NULL OR NEW.prijmeni IS NOT NULL) THEN
    NEW.display_name := COALESCE(NEW.titul_pred || ' ', '') || 
                        COALESCE(NEW.jmeno, '') || ' ' || 
                        COALESCE(NEW.prijmeni, '') || 
                        COALESCE(' ' || NEW.titul_za, '');
    NEW.display_name := TRIM(NEW.display_name);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER subjects_display_name
  BEFORE INSERT OR UPDATE ON subjects
  FOR EACH ROW
  EXECUTE FUNCTION update_subject_display_name();
```

---

## 6. Ukázkové JSON záznamy

### Osoba
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "role": "pronajimatel",
  "type": "osoba",
  "display_name": "Ing. Jan Novák Ph.D.",
  "titul_pred": "Ing.",
  "jmeno": "Jan",
  "prijmeni": "Novák",
  "titul_za": "Ph.D.",
  "typ_dokladu": "op",
  "cislo_dokladu": "123456789",
  "datum_narozeni": "1980-05-15",
  "country": "Česká republika",
  "street": "Hlavní",
  "cislo_popisne": "123",
  "city": "Praha",
  "zip": "110 00",
  "primary_phone": "+420601234567",
  "primary_email": "jan.novak@example.cz",
  "bankovni_ucet": null,
  "preferovany_zpusob_komunikace": "email",
  "archived": false,
  "archived_at": null,
  "created_at": "2024-01-01T12:00:00.000Z",
  "updated_at": "2024-01-15T14:30:00.000Z"
}
```

### Firma
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "role": "pronajimatel",
  "type": "firma",
  "display_name": "ABC s.r.o.",
  "ico": "12345678",
  "dic": "CZ12345678",
  "country": "Česká republika",
  "street": "Nová",
  "cislo_popisne": "456",
  "city": "Brno",
  "zip": "602 00",
  "primary_phone": "+420543210987",
  "primary_email": "info@abc.cz",
  "kontaktni_osoba": {
    "jmeno": "Jana Nováková",
    "email": "jana@abc.cz",
    "telefon": "+420601234567",
    "pozice": "Vedoucí správy"
  },
  "bankovni_ucty": [
    {
      "banka": "ČSOB",
      "iban": "CZ6508000000192000145399",
      "bic": "GIBACZPX",
      "poznamka": "Hlavní účet",
      "default": true
    }
  ],
  "preferovany_zpusob_komunikace": "email",
  "podpisove_prava": [
    {
      "user_id": "uuid-1",
      "jmeno": "Petr Svoboda",
      "role": "jednatel",
      "od": "2024-01-01"
    }
  ],
  "archived": false,
  "created_at": "2024-01-01T12:00:00.000Z",
  "updated_at": "2024-01-01T12:00:00.000Z"
}
```

---

## 7. UI stavy

### Načítací stav
- Skeleton loader při načítání seznamu
- Spinner při načítání detailu
- Disabled tlačítka během ukládání

### Prázdný stav
- "Zatím nemáte žádné pronajímatele. Klikněte na 'Přidat' pro vytvoření prvního."
- Ikonka + text

### Chybový stav
- Toast notifikace při chybě ukládání
- Inline validační chyby u polí formuláře
- Error boundary pro kritické chyby

---

## 8. Performance optimalizace

### Indexy pro časté dotazy
- Seznam pronajímatelů filtrovaný podle typu: `idx_subjects_type`
- Seznam podle města: `idx_subjects_city`
- Vyhledávání podle IČO: `idx_subjects_ico`
- Filtr archivovaných: `idx_subjects_archived`

### Caching strategie
- Client-side cache seznamu pronajímatelů (1 minuta)
- Revalidace při vytvoření/úpravě/archivaci
- Optimistic updates pro lepší UX

---

## 9. Audit log
Veškeré změny v `subjects` tabulce se logují do `audit_log` tabulky:
- Kdo změnil (user_id)
- Co změnil (table_name, record_id)
- Kdy (timestamp)
- Jaké změny (old_values, new_values v JSONB)

---

## 10. Migration z localStorage

### Původní localStorage klíče
- `pronajimatel_data` → `subjects` table (s role='pronajimatel')

### Mapping polí
```javascript
// localStorage → Supabase
id → id (keep string, nebo convert to UUID)
typ → type
nazev → display_name
ico → ico
dic → dic
email → primary_email
telefon → primary_phone
ulice → street
cisloPopisne → cislo_popisne
mesto → city
psc → zip
stat → country
poznamka → (uložit do kontaktni_osoba nebo platebni_info)
archived → archived
archivedAt → archived_at
created_at → created_at
updated_at → updated_at
```

---

## Reference

- **Agent specifikace**: `./AGENT-SPECIFIKACE.md`
- **Oprávnění**: `./permissions.md`
- **Checklist**: `./checklist.md`
- **Database migrations**: `/docs/tasks/supabase-migrations/003_add_subjects_missing_fields.sql`
