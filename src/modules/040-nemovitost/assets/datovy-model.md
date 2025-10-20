# Datový model - Modul 040 (Nemovitosti)

## Přehled
Modul pracuje se dvěma hlavními entitami:
1. **Nemovitost (property)** - Budova/objekt/pozemek
2. **Jednotka (unit)** - Jednotlivá jednotka v rámci nemovitosti

## 1. Nemovitost (properties)

### Tabulka: `properties`

| Sloupec | Typ | Povinné | Výchozí | Popis |
|---------|-----|---------|---------|-------|
| `id` | UUID | Ano | auto | Primární klíč |
| `typ` | VARCHAR(50) | Ano | - | Typ nemovitosti (enum) |
| `nazev` | VARCHAR(255) | Ano | - | Název nemovitosti |
| `pocet_jednotek` | INTEGER | Ano | 0 | Počet jednotek (0 pro pozemek) |
| `pronajimatel_id` | UUID | Ne | NULL | FK na subjects (vlastník) |
| `spravce` | VARCHAR(255) | Ne | NULL | Jméno správce |
| `ulice` | VARCHAR(255) | Ne | NULL | Ulice |
| `cislo_popisne` | VARCHAR(20) | Ne | NULL | Číslo popisné/orientační |
| `mesto` | VARCHAR(255) | Ne | NULL | Město |
| `psc` | VARCHAR(10) | Ne | NULL | PSČ (validace: "[0-9]{3} ?[0-9]{2}") |
| `stat` | VARCHAR(100) | Ano | 'Česká republika' | Stát |
| `pocet_nadzemních_podlazi` | INTEGER | Ne | NULL | Počet nadzemních podlaží |
| `pocet_podzemních_podlazi` | INTEGER | Ne | NULL | Počet podzemních podlaží |
| `rok_vystavby` | INTEGER | Ne | NULL | Rok výstavby (min: 1800, max: currentYear) |
| `rok_rekonstrukce` | INTEGER | Ne | NULL | Rok rekonstrukce (min: 1800, max: currentYear) |
| `vybaveni` | JSONB | Ne | '[]' | Pole vybavení ["vytah","parkovani","kolarna"] |
| `poznamka` | TEXT | Ne | NULL | Poznámka |
| `archived` | BOOLEAN | Ano | false | Příznak archivace |
| `archived_at` | TIMESTAMPTZ | Ne | NULL | Datum archivace |
| `created_at` | TIMESTAMPTZ | Ano | NOW() | Datum vytvoření |
| `updated_at` | TIMESTAMPTZ | Ano | NOW() | Datum poslední úpravy |

### Enum: typ nemovitosti
```javascript
typyNemovitosti = {
  'bytovy_dum':    { name: 'Bytový dům', icon: '🏢', jednotka: 'byt' },
  'rodinny_dum':   { name: 'Rodinný dům', icon: '🏠', jednotka: 'byt' },
  'admin_budova':  { name: 'Administrativní budova', icon: '🏬', jednotka: 'kancelar' },
  'prumyslovy':    { name: 'Průmyslový objekt', icon: '🏭', jednotka: 'sklad' },
  'pozemek':       { name: 'Pozemek', icon: '🌳', jednotka: null },
  'jiny':          { name: 'Jiný objekt', icon: '🏘️', jednotka: 'jina' }
}
```

### Indexy
- `idx_properties_typ` na `typ`
- `idx_properties_pronajimatel` na `pronajimatel_id`
- `idx_properties_archived` na `archived`
- `idx_properties_mesto` na `mesto`

### Foreign Keys
- `pronajimatel_id` → `subjects.id` (ON DELETE SET NULL)

### RLS Policies
```sql
-- Čtení: všichni přihlášení uživatelé
CREATE POLICY "properties_read" ON properties
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Vytváření: uživatelé s právem properties.create
CREATE POLICY "properties_create" ON properties
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_permissions WHERE user_id = auth.uid() AND permission = 'properties.create')
  );

-- Úprava: uživatelé s právem properties.update
CREATE POLICY "properties_update" ON properties
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_permissions WHERE user_id = auth.uid() AND permission = 'properties.update')
  );

-- Archivace: speciální právo properties.archive
-- (Soft delete - nepoužívá DELETE, ale UPDATE archived = true)
```

### Validační pravidla
- `nazev`: min 1 znak, max 255 znaků
- `psc`: regex `^[0-9]{3}\s?[0-9]{2}$`
- `rok_vystavby`: >= 1800, <= currentYear
- `rok_rekonstrukce`: >= 1800, <= currentYear, >= rok_vystavby
- `pocet_jednotek`: >= 0
- `pocet_nadzemních_podlazi`: >= 0
- `pocet_podzemních_podlazi`: >= 0
- `vybaveni`: pole stringů, validní hodnoty: ["vytah", "parkovani", "kolarna", "klimatizace", "zabezpeceni", "bezbariery"]

---

## 2. Jednotka (units)

### Tabulka: `units`

| Sloupec | Typ | Povinné | Výchozí | Popis |
|---------|-----|---------|---------|-------|
| `id` | UUID | Ano | auto | Primární klíč |
| `nemovitost_id` | UUID | Ano | - | FK na properties |
| `oznaceni` | VARCHAR(50) | Ano | - | Označení jednotky (např. "1A", "101") |
| `typ` | VARCHAR(50) | Ano | - | Typ jednotky (enum) |
| `podlazi` | VARCHAR(20) | Ne | NULL | Podlaží (text: "1", "přízemí", "-1") |
| `plocha` | DECIMAL(10,2) | Ano | - | Plocha v m² |
| `dispozice` | VARCHAR(20) | Ne | NULL | Dispozice (např. "2+1", "3+kk") |
| `pocet_mistnosti` | INTEGER | Ne | NULL | Počet místností |
| `stav` | VARCHAR(20) | Ano | 'volna' | Stav jednotky (enum) |
| `najemce_id` | UUID | Ne | NULL | FK na subjects (nájemce) |
| `najemce` | VARCHAR(255) | Ne | NULL | Ručně zadané jméno nájemce (fallback) |
| `mesicni_najem` | DECIMAL(10,2) | Ne | NULL | Měsíční nájem v Kč |
| `datum_zacatku_najmu` | DATE | Ne | NULL | Datum začátku nájmu |
| `datum_konce_najmu` | DATE | Ne | NULL | Datum konce nájmu |
| `poznamka` | TEXT | Ne | NULL | Poznámka |
| `archived` | BOOLEAN | Ano | false | Příznak archivace |
| `archived_at` | TIMESTAMPTZ | Ne | NULL | Datum archivace |
| `created_at` | TIMESTAMPTZ | Ano | NOW() | Datum vytvoření |
| `updated_at` | TIMESTAMPTZ | Ano | NOW() | Datum poslední úpravy |

### Enum: typ jednotky
```javascript
typyJednotek = {
  'byt':    { name: 'Byt', icon: '🏠' },
  'kancelar': { name: 'Kancelář', icon: '💼' },
  'obchod':   { name: 'Obchodní prostor', icon: '🛍️' },
  'sklad':    { name: 'Sklad', icon: '📦' },
  'garaz':    { name: 'Garáž/Parking', icon: '🚗' },
  'sklep':    { name: 'Sklep', icon: '📦' },
  'puda':     { name: 'Půda', icon: '🏠' },
  'jina':     { name: 'Jiná jednotka', icon: '🔑' }
}
```

### Enum: stav jednotky
```javascript
stavyJednotek = {
  'volna':         { name: 'Volná', color: '#10b981', badge: 'success' },
  'obsazena':      { name: 'Obsazená', color: '#ef4444', badge: 'danger' },
  'rezervovana':   { name: 'Rezervovaná', color: '#f59e0b', badge: 'warning' },
  'rekonstrukce':  { name: 'Rekonstrukce', color: '#6b7280', badge: 'secondary' }
}
```

### Indexy
- `idx_units_nemovitost` na `nemovitost_id`
- `idx_units_typ` na `typ`
- `idx_units_stav` na `stav`
- `idx_units_najemce` na `najemce_id`
- `idx_units_archived` na `archived`

### Foreign Keys
- `nemovitost_id` → `properties.id` (ON DELETE CASCADE)
- `najemce_id` → `subjects.id` (ON DELETE SET NULL)

### RLS Policies
```sql
-- Čtení: všichni přihlášení uživatelé
CREATE POLICY "units_read" ON units
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Vytváření: uživatelé s právem units.create
CREATE POLICY "units_create" ON units
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_permissions WHERE user_id = auth.uid() AND permission = 'units.create')
  );

-- Úprava: uživatelé s právem units.update
CREATE POLICY "units_update" ON units
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_permissions WHERE user_id = auth.uid() AND permission = 'units.update')
  );
```

### Validační pravidla
- `oznaceni`: min 1 znak, max 50 znaků, unikátní v rámci nemovitosti
- `plocha`: > 0
- `pocet_mistnosti`: >= 0
- `mesicni_najem`: >= 0
- `datum_konce_najmu`: >= datum_zacatku_najmu (pokud oba zadány)
- `stav`: pouze validní hodnoty z enum
- Pokud `stav` = 'obsazena', pak `najemce_id` nebo `najemce` by mělo být vyplněno

---

## 3. Vazby mezi tabulkami

```
properties (1) ←--→ (N) units
  id               nemovitost_id

subjects (pronajímatelé)
  id
  ↑
  |
properties.pronajimatel_id

subjects (nájemci)
  id
  ↑
  |
units.najemce_id
```

---

## 4. Pomocné views

### View: `properties_with_stats`
Agregovaná statistika pro každou nemovitost:
```sql
CREATE VIEW properties_with_stats AS
SELECT 
  p.*,
  COUNT(u.id) AS total_units,
  COUNT(CASE WHEN u.stav = 'volna' AND u.archived = false THEN 1 END) AS free_units,
  COUNT(CASE WHEN u.stav = 'obsazena' AND u.archived = false THEN 1 END) AS occupied_units
FROM properties p
LEFT JOIN units u ON u.nemovitost_id = p.id
GROUP BY p.id;
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

CREATE TRIGGER properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER units_updated_at
  BEFORE UPDATE ON units
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Validace počtu jednotek
```sql
CREATE OR REPLACE FUNCTION validate_unit_count()
RETURNS TRIGGER AS $$
DECLARE
  property_type VARCHAR(50);
BEGIN
  SELECT typ INTO property_type FROM properties WHERE id = NEW.nemovitost_id;
  
  IF property_type = 'pozemek' THEN
    RAISE EXCEPTION 'Nelze přidat jednotku k pozemku';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER units_validate_property_type
  BEFORE INSERT OR UPDATE ON units
  FOR EACH ROW
  EXECUTE FUNCTION validate_unit_count();
```

---

## 6. Migration z localStorage

### Původní localStorage klíče
- `nemovitosti_data` → `properties` table
- `jednotky_data` → `units` table

### Mapping polí
```javascript
// Nemovitost
localStorage                  → Supabase
--------------------------------
id                           → id (keep string, nebo convert to UUID)
typ                          → typ
nazev                        → nazev
pocetJednotek                → pocet_jednotek
pronajimatel_id              → pronajimatel_id
spravce                      → spravce
ulice                        → ulice
cisloPopisne                 → cislo_popisne
mesto                        → mesto
psc                          → psc
stat                         → stat
pocetNadzemnichPodlazi       → pocet_nadzemních_podlazi
pocetPodzemnichPodlazi       → pocet_podzemních_podlazi
rokVystavby                  → rok_vystavby
rokRekonstrukce              → rok_rekonstrukce
vybaveni (array)             → vybaveni (JSONB)
poznamka                     → poznamka
archived                     → archived
archivedAt                   → archived_at
created_at                   → created_at
updated_at                   → updated_at

// Jednotka
id                           → id
nemovitost_id                → nemovitost_id
oznaceni                     → oznaceni
typ                          → typ
podlazi                      → podlazi
plocha                       → plocha
dispozice                    → dispozice
pocetMistnosti               → pocet_mistnosti
stav                         → stav
najemce_id                   → najemce_id
najemce                      → najemce
mesicniNajem                 → mesicni_najem
datumZacatkuNajmu            → datum_zacatku_najmu
datumKonceNajmu              → datum_konce_najmu
poznamka                     → poznamka
archived                     → archived
archivedAt                   → archived_at
created_at                   → created_at
updated_at                   → updated_at
```

---

## 7. Ukázkové JSON záznamy

### Nemovitost
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "typ": "bytovy_dum",
  "nazev": "Bytový dům Centrum",
  "pocet_jednotek": 10,
  "pronajimatel_id": "660e8400-e29b-41d4-a716-446655440001",
  "spravce": "Správa s.r.o.",
  "ulice": "Hlavní",
  "cislo_popisne": "123/4",
  "mesto": "Praha",
  "psc": "110 00",
  "stat": "Česká republika",
  "pocet_nadzemních_podlazi": 5,
  "pocet_podzemních_podlazi": 1,
  "rok_vystavby": 1990,
  "rok_rekonstrukce": 2018,
  "vybaveni": ["vytah", "parkovani", "zabezpeceni"],
  "poznamka": "V blízkosti MHD, nový výtah 2018",
  "archived": false,
  "archived_at": null,
  "created_at": "2024-01-01T12:00:00.000Z",
  "updated_at": "2024-01-15T14:30:00.000Z"
}
```

### Jednotka
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "nemovitost_id": "550e8400-e29b-41d4-a716-446655440000",
  "oznaceni": "1A",
  "typ": "byt",
  "podlazi": "1",
  "plocha": 45.50,
  "dispozice": "2+1",
  "pocet_mistnosti": 2,
  "stav": "obsazena",
  "najemce_id": "880e8400-e29b-41d4-a716-446655440003",
  "najemce": null,
  "mesicni_najem": 15000.00,
  "datum_zacatku_najmu": "2024-01-01",
  "datum_konce_najmu": "2025-12-31",
  "poznamka": "Nově zrekonstruovaný, balkón",
  "archived": false,
  "archived_at": null,
  "created_at": "2024-01-01T12:05:00.000Z",
  "updated_at": "2024-01-01T12:05:00.000Z"
}
```

---

## 8. UI stavy

### Načítací stav
- Skeleton loader při načítání seznamu nemovitostí
- Spinner při načítání detailu
- Disabled tlačítka během ukládání

### Prázdný stav
- "Zatím nemáte žádné nemovitosti. Klikněte na 'Přidat' pro vytvoření první."
- Ikonka + text

### Chybový stav
- Toast notifikace při chybě ukládání
- Inline validační chyby u polí formuláře
- Error boundary pro kritické chyby

---

## 9. Performance optimalizace

### Indexy pro časté dotazy
- Seznam nemovitostí filtrovaný podle typu: `idx_properties_typ`
- Seznam jednotek podle stavu: `idx_units_stav`
- Vyhledávání podle města: `idx_properties_mesto`

### Caching strategie
- Client-side cache seznamu nemovitostí (1 minuta)
- Revalidace při vytvoření/úpravě/archivaci
- Optimistic updates pro lepší UX

---

## 10. Audit log
Veškeré změny v `properties` a `units` tabulkách se logují do `audit_log` tabulky:
- Kdo změnil (user_id)
- Co změnil (table_name, record_id)
- Kdy (timestamp)
- Jaké změny (old_values, new_values v JSONB)
