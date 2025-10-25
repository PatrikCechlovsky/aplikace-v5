# Chybějící pole v modulech 030 a 050

Tento dokument analyzuje chybějící pole v modulech 030 (Pronajímatel) a 050 (Nájemník) podle specifikace v `smlouvy_moduly_030-080.md`.

## Modul 030 - Pronajímatel

### Aktuální stav (v subjects tabulce)
- ✅ id: UUID
- ✅ typ_subjektu (odpovídá "typ_subjektu")
- ✅ display_name (odpovídá "obchodní_jméno / jméno")
- ✅ ico
- ✅ dic
- ✅ primary_email (odpovídá "email")
- ✅ telefon
- ✅ ulice, cislo_popisne, mesto, psc, stat (odpovídá "adresa_sídla")
- ✅ created_at, updated_at, created_by, updated_by

### Chybějící pole podle specifikace

#### 1. kontaktní_osoba: { jméno, email, telefon }
**Návrh:** Přidat JSON sloupec `kontaktni_osoba` do subjects tabulky
```json
{
  "jmeno": "Jan Novák",
  "email": "jan.novak@example.cz",
  "telefon": "+420601000000"
}
```

#### 2. bankovní_účty: list { banka, iban, bic, poznámka }
**Návrh:** Přidat JSON sloupec `bankovni_ucty` do subjects tabulky
```json
[
  {
    "banka": "ČSOB",
    "iban": "CZ6508000000192000145399",
    "bic": "GIBACZPX",
    "poznámka": "Hlavní účet pro kauce"
  }
]
```

**Poznámka:** Aktuálně existuje pouze jedno pole `bankovni_ucet` (string), což by mělo být rozšířeno na array objektů.

#### 3. preferovaný_způsob_komunikace
**Návrh:** Přidat sloupec `preferovany_zpusob_komunikace` typu VARCHAR(50)
- Hodnoty: 'email', 'telefon', 'posta'

#### 4. podpisové_práva: list
**Návrh:** Přidat JSON sloupec `podpisove_prava` do subjects tabulky
```json
[
  {
    "user_id": "uuid-user-1",
    "jmeno": "Jan Novák",
    "role": "jednatel",
    "od": "2024-01-01"
  }
]
```

#### 5. poznámky: text
**Status:** ✅ Již existuje jako `poznamka` (TEXT)

---

## Modul 050 - Nájemník

### Aktuální stav (v subjects tabulce)
- ✅ id: UUID
- ✅ jméno / obchodní_jméno (display_name)
- ✅ typ: enum { fyzická_osoba, právnická_osoba }
- ✅ rodné_cislo (rodne_cislo)
- ✅ datum_narození (datum_narozeni)
- ✅ ic / dic
- ✅ email (primary_email)
- ✅ telefon
- ✅ trvalé_bydliště_adresa (ulice, cislo_popisne, mesto, psc, stat)
- ✅ created_at, updated_at, created_by, updated_by

### Chybějící pole podle specifikace

#### 1. doručovací_adresa: object (nullable)
**Návrh:** Přidat JSON sloupec `dorucovaci_adresa` do subjects tabulky
```json
{
  "ulice": "Nová ulice",
  "cislo_popisne": "123",
  "mesto": "Praha",
  "psc": "11000",
  "stat": "ČR"
}
```

#### 2. kontaktní_osoba: { jméno, email, telefon } (u firem)
**Návrh:** Použít stejný sloupec `kontaktni_osoba` jako u pronajímatele (již navrženo výše)

#### 3. platební_info: { preferovaný_způsob, defaultní_iban }
**Návrh:** Přidat JSON sloupec `platebni_info` do subjects tabulky
```json
{
  "preferovany_zpusob": "bankovni_prevod",
  "defaultni_iban": "CZ6508000000192000145399"
}
```

#### 4. průkaz_identita: attachments (volitelné)
**Návrh:** Použít existující tabulku `attachments` s vazbou na subjects
- Již existuje pole `entity_type` a `entity_id` v attachments tabulce
- Přidat nový typ dokumentu: 'identity_document' nebo 'prukaz_identita'

#### 5. smlouvy_ids: list[uuid] (historie)
**Návrh:** Nepřidávat jako sloupec, ale řešit přes vazbu v tabulce contracts
- Získat pomocí query: `SELECT id FROM contracts WHERE najemnik_id = ?`

---

## SQL migrace - Návrh změn

```sql
-- ============================================================================
-- Migration: Add missing fields to subjects table for modules 030 and 050
-- ============================================================================

-- Přidat nové sloupce
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS kontaktni_osoba JSONB;
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS bankovni_ucty JSONB;
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS preferovany_zpusob_komunikace VARCHAR(50);
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS podpisove_prava JSONB;
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS dorucovaci_adresa JSONB;
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS platebni_info JSONB;

-- Komentáře
COMMENT ON COLUMN subjects.kontaktni_osoba IS 'Kontaktní osoba (pro firmy): {jmeno, email, telefon}';
COMMENT ON COLUMN subjects.bankovni_ucty IS 'Seznam bankovních účtů: [{banka, iban, bic, poznámka}]';
COMMENT ON COLUMN subjects.preferovany_zpusob_komunikace IS 'Preferovaný způsob komunikace: email, telefon, posta';
COMMENT ON COLUMN subjects.podpisove_prava IS 'Podpisová práva: [{user_id, jmeno, role, od}]';
COMMENT ON COLUMN subjects.dorucovaci_adresa IS 'Doručovací adresa (pokud se liší od trvalé): {ulice, cislo_popisne, mesto, psc, stat}';
COMMENT ON COLUMN subjects.platebni_info IS 'Platební informace: {preferovany_zpusob, defaultni_iban}';

-- Indexy (pokud potřeba)
CREATE INDEX IF NOT EXISTS idx_subjects_preferovany_zpusob_komunikace 
  ON subjects(preferovany_zpusob_komunikace);

-- ============================================================================
-- KONEC MIGRACE
-- ============================================================================
```

---

## Aktualizace type-schemas.js

Je potřeba aktualizovat `/src/lib/type-schemas/subjects.js` aby obsahoval nová pole:

### Pro všechny typy subjektů (osoba, firma, osvc, spolek, stat):
- Přidat `kontaktni_osoba` jako objekt (rozbalený do samostatných polí v UI)
- Přidat `preferovany_zpusob_komunikace` jako select
- Přidat `bankovni_ucty` jako array s možností přidat více účtů

### Speciálně pro nájemníky:
- Přidat `dorucovaci_adresa` jako objekt (rozbalený do samostatných polí v UI)
- Přidat `platebni_info` jako objekt

### Speciálně pro pronajímatele:
- Přidat `podpisove_prava` jako array

---

## Priority implementace

1. **Vysoká priorita:**
   - Kontaktní osoba (společné pro 030 i 050)
   - Bankovní účty (rozšíření stávajícího pole)
   - Platební info (pro 050)

2. **Střední priorita:**
   - Doručovací adresa (pro 050)
   - Preferovaný způsob komunikace (pro 030)

3. **Nízká priorita:**
   - Podpisová práva (pro 030) - může počkat na implementaci modulu 060

---

## Další kroky

1. Vytvořit SQL migraci s novými sloupci
2. Aktualizovat `docs/database-schema.md`
3. Aktualizovat `type-schemas.js` pro UI formuláře
4. Otestovat vytváření a úpravu subjektů s novými poli
5. Aktualizovat existující záznamy (pokud potřeba)

---

**Autor:** Copilot Agent  
**Datum:** 2025-10-25  
**Stav:** Návrh k implementaci
