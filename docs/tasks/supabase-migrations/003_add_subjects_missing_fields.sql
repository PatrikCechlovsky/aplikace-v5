-- ============================================================================
-- Migration 003: Add missing fields to subjects table for modules 030 and 050
-- ============================================================================
-- Přidává chybějící pole podle specifikace smlouvy_moduly_030-080.md
-- 
-- Modul 030 (Pronajímatel):
--   - kontaktní_osoba, bankovní_účty, preferovaný_způsob_komunikace, podpisové_práva
-- 
-- Modul 050 (Nájemník):
--   - doručovací_adresa, platební_info
-- ============================================================================

-- Přidat nové sloupce do subjects tabulky
ALTER TABLE subjects 
  ADD COLUMN IF NOT EXISTS kontaktni_osoba JSONB,
  ADD COLUMN IF NOT EXISTS bankovni_ucty JSONB,
  ADD COLUMN IF NOT EXISTS preferovany_zpusob_komunikace VARCHAR(50),
  ADD COLUMN IF NOT EXISTS podpisove_prava JSONB,
  ADD COLUMN IF NOT EXISTS dorucovaci_adresa JSONB,
  ADD COLUMN IF NOT EXISTS platebni_info JSONB;

-- Komentáře ke sloupcům
COMMENT ON COLUMN subjects.kontaktni_osoba IS 
  'Kontaktní osoba (pro firmy): {"jmeno": "Jan Novák", "email": "jan@example.cz", "telefon": "+420601000000"}';

COMMENT ON COLUMN subjects.bankovni_ucty IS 
  'Seznam bankovních účtů: [{"banka": "ČSOB", "iban": "CZ...", "bic": "GIBACZPX", "poznamka": "Hlavní účet"}]';

COMMENT ON COLUMN subjects.preferovany_zpusob_komunikace IS 
  'Preferovaný způsob komunikace: email | telefon | posta';

COMMENT ON COLUMN subjects.podpisove_prava IS 
  'Podpisová práva: [{"user_id": "uuid", "jmeno": "Jan Novák", "role": "jednatel", "od": "2024-01-01"}]';

COMMENT ON COLUMN subjects.dorucovaci_adresa IS 
  'Doručovací adresa (pokud se liší od trvalé): {"ulice": "Nová ulice", "cislo_popisne": "123", "mesto": "Praha", "psc": "11000", "stat": "ČR"}';

COMMENT ON COLUMN subjects.platebni_info IS 
  'Platební informace: {"preferovany_zpusob": "bankovni_prevod", "defaultni_iban": "CZ..."}';

-- Indexy pro rychlejší vyhledávání
CREATE INDEX IF NOT EXISTS idx_subjects_preferovany_zpusob_komunikace 
  ON subjects(preferovany_zpusob_komunikace);

-- Validace: zajistit, že preferovany_zpusob_komunikace má platné hodnoty
ALTER TABLE subjects 
  ADD CONSTRAINT chk_subjects_preferovany_zpusob_komunikace 
  CHECK (preferovany_zpusob_komunikace IS NULL OR 
         preferovany_zpusob_komunikace IN ('email', 'telefon', 'posta'));

-- ============================================================================
-- Příklady použití nových polí
-- ============================================================================

-- Příklad 1: Pronajímatel - firma s kontaktní osobou a bankovními účty
/*
UPDATE subjects SET
  kontaktni_osoba = '{"jmeno": "Jana Nováková", "email": "jana@firma.cz", "telefon": "+420601234567"}'::jsonb,
  bankovni_ucty = '[
    {"banka": "ČSOB", "iban": "CZ6508000000192000145399", "bic": "GIBACZPX", "poznamka": "Hlavní účet"},
    {"banka": "KB", "iban": "CZ6501000000192000145400", "bic": "KOMBCZPP", "poznamka": "Účet pro kauce"}
  ]'::jsonb,
  preferovany_zpusob_komunikace = 'email',
  podpisove_prava = '[
    {"user_id": "uuid-1", "jmeno": "Petr Svoboda", "role": "jednatel", "od": "2024-01-01"},
    {"user_id": "uuid-2", "jmeno": "Jana Nováková", "role": "prokuristka", "od": "2024-06-01"}
  ]'::jsonb
WHERE id = 'uuid-pronajimatel';
*/

-- Příklad 2: Nájemník - osoba s doručovací adresou
/*
UPDATE subjects SET
  dorucovaci_adresa = '{"ulice": "Jiná ulice", "cislo_popisne": "456", "mesto": "Brno", "psc": "60200", "stat": "ČR"}'::jsonb,
  platebni_info = '{"preferovany_zpusob": "bankovni_prevod", "defaultni_iban": "CZ6508000000192000145399"}'::jsonb
WHERE id = 'uuid-najemnik';
*/

-- ============================================================================
-- Kontrola integrity dat
-- ============================================================================

-- Zkontrolovat, že JSON pole jsou validní (pokud nejsou NULL)
DO $$
BEGIN
  -- Test validity JSON sloupců
  IF EXISTS (
    SELECT 1 FROM subjects 
    WHERE (kontaktni_osoba IS NOT NULL AND NOT jsonb_typeof(kontaktni_osoba) = 'object')
       OR (bankovni_ucty IS NOT NULL AND NOT jsonb_typeof(bankovni_ucty) = 'array')
       OR (podpisove_prava IS NOT NULL AND NOT jsonb_typeof(podpisove_prava) = 'array')
       OR (dorucovaci_adresa IS NOT NULL AND NOT jsonb_typeof(dorucovaci_adresa) = 'object')
       OR (platebni_info IS NOT NULL AND NOT jsonb_typeof(platebni_info) = 'object')
  ) THEN
    RAISE EXCEPTION 'Některá JSON pole mají neplatný formát!';
  END IF;
  
  RAISE NOTICE 'Migration 003: JSON fields validation passed';
END $$;

-- ============================================================================
-- KONEC MIGRACE
-- ============================================================================
SELECT 'Migration 003 completed: Added missing fields to subjects table' as status;
