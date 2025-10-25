-- ============================================================================
-- Migration 004: Create contracts and related tables (Module 060)
-- ============================================================================
-- Vytváří tabulky pro modul 060 - Smlouvy
-- Podle specifikace v smlouvy_moduly_030-080.md
-- ============================================================================

-- ============================================================================
-- CONTRACTS TABLE - Hlavní tabulka smluv
-- ============================================================================

CREATE TABLE IF NOT EXISTS contracts (
  -- Primární klíč
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Vazby na subjekty a nemovitosti
  landlord_id UUID NOT NULL REFERENCES subjects(id) ON DELETE RESTRICT,
  tenant_id UUID NOT NULL REFERENCES subjects(id) ON DELETE RESTRICT,
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE RESTRICT,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  
  -- Základní identifikace smlouvy
  cislo_smlouvy VARCHAR(50) UNIQUE NOT NULL,
  nazev VARCHAR(255),
  
  -- Stav smlouvy
  stav VARCHAR(50) DEFAULT 'koncept' NOT NULL,
  -- Možné hodnoty: koncept, cekajici_podepsani, aktivni, ukoncena, zrusena, propadla
  
  -- Datum a období
  datum_zacatek DATE NOT NULL,
  datum_konec DATE,
  typ_ukonceni VARCHAR(50) DEFAULT 'fixed_term',
  -- Možné hodnoty: fixed_term, indefinite
  upominek_ukonceni_dny INTEGER DEFAULT 60,
  
  -- Nájem
  najem_vyse DECIMAL(12,2) NOT NULL CHECK (najem_vyse >= 0),
  -- Ukládáme v Kč s desetinnými místy (nebo v haléřích jako integer)
  periodicita_najmu VARCHAR(50) DEFAULT 'mesicni',
  -- Možné hodnoty: mesicni, tydenni, rocni, jednorazovy
  platebni_podminky TEXT,
  
  -- Správné poplatky (režie, fond oprav)
  spravne_poplatky JSONB,
  -- Formát: {"rezijni_fond": 500, "fond_oprav": 200, ...}
  
  -- Kauce
  kauce_potreba BOOLEAN DEFAULT false,
  kauce_castka DECIMAL(12,2) CHECK (kauce_castka IS NULL OR kauce_castka >= 0),
  stav_kauce VARCHAR(50) DEFAULT 'nevyzadovana',
  -- Možné hodnoty: nevyzadovana, drzena, vracena, castecne_vracena
  
  -- Dokumenty a šablony
  linked_templates JSONB,
  -- Formát: [{"template_id": "uuid", "document_id": "uuid", "url": "...", "editable": true}]
  template_fields JSONB,
  -- Formát: {"najemnik_jmeno": "Jan Novák", "cislo_jednotky": "3+1", ...}
  
  -- Podpisy
  podpisy JSONB,
  -- Formát: {"status": "podepsano", "provider": "BankID", "flow_id": "...", "podpisnici": [...]}
  
  -- Notifikace a upomínky
  notifikace JSONB,
  
  -- Sumář plateb (vypočítaný)
  sumar_platby JSONB,
  -- Formát: {"celkem_splatne": 15000, "celkem_zaplaceno": 10000, "zustava": 5000}
  
  -- Další informace
  poznamka TEXT,
  pozice_smlouvy TEXT,
  
  -- Archivace
  archived BOOLEAN DEFAULT false,
  archived_at TIMESTAMPTZ,
  archived_by UUID,
  
  -- Audit fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  updated_by UUID,
  
  -- Constraints
  CONSTRAINT contracts_dates_check CHECK (datum_konec IS NULL OR datum_konec >= datum_zacatek),
  CONSTRAINT contracts_kauce_check CHECK (
    (kauce_potreba = false) OR 
    (kauce_potreba = true AND kauce_castka > 0)
  )
);

-- Indexy pro rychlejší vyhledávání
CREATE INDEX IF NOT EXISTS idx_contracts_landlord ON contracts(landlord_id);
CREATE INDEX IF NOT EXISTS idx_contracts_tenant ON contracts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_contracts_unit ON contracts(unit_id);
CREATE INDEX IF NOT EXISTS idx_contracts_property ON contracts(property_id);
CREATE INDEX IF NOT EXISTS idx_contracts_stav ON contracts(stav);
CREATE INDEX IF NOT EXISTS idx_contracts_cislo ON contracts(cislo_smlouvy);
CREATE INDEX IF NOT EXISTS idx_contracts_dates ON contracts(datum_zacatek, datum_konec);
CREATE INDEX IF NOT EXISTS idx_contracts_archived ON contracts(archived);

-- Komentáře
COMMENT ON TABLE contracts IS 'Nájemní smlouvy - modul 060';
COMMENT ON COLUMN contracts.cislo_smlouvy IS 'Číslo smlouvy (unique, lidsky čitelné)';
COMMENT ON COLUMN contracts.stav IS 'Stav smlouvy: koncept, cekajici_podepsani, aktivni, ukoncena, zrusena, propadla';
COMMENT ON COLUMN contracts.najem_vyse IS 'Výše nájmu v Kč';
COMMENT ON COLUMN contracts.periodicita_najmu IS 'Periodicita platby: mesicni, tydenni, rocni, jednorazovy';
COMMENT ON COLUMN contracts.kauce_castka IS 'Výše kauce v Kč';
COMMENT ON COLUMN contracts.stav_kauce IS 'Stav kauce: nevyzadovana, drzena, vracena, castecne_vracena';

-- Trigger pro automatickou aktualizaci updated_at
CREATE TRIGGER contracts_updated_at
  BEFORE UPDATE ON contracts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- HANDOVER PROTOCOLS TABLE - Předávací protokoly
-- ============================================================================

CREATE TABLE IF NOT EXISTS handover_protocols (
  -- Primární klíč
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Vazba na smlouvu
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  
  -- Základní údaje
  datum_predani DATE NOT NULL,
  typ_protokolu VARCHAR(50) DEFAULT 'predani',
  -- Možné hodnoty: predani (na začátku), vraceni (na konci)
  
  -- Strany protokolu
  predavajici JSONB,
  -- Formát: {"jmeno": "Jan Novák", "role": "pronajímatel"}
  preberajici JSONB,
  -- Formát: {"jmeno": "Petr Svoboda", "role": "nájemník"}
  
  -- Seznam položek a jejich stav
  seznam_polozek JSONB,
  -- Formát: [{"nazev": "Lednička", "stav_pri_predani": "funkční", "poznamka": "Drobné škrábance", "fotografie": ["url1", "url2"]}]
  
  -- Stavy měřidel
  stavy_meridel JSONB,
  -- Formát: [{"typ": "elektrina", "cislo_merice": "12345", "stav": 15234}, {"typ": "voda", "cislo_merice": "67890", "stav": 8456}]
  
  -- Podpisy
  podpisy_predani JSONB,
  -- Formát: {"landlord": {"signed": true, "date": "2024-01-01", "signature_url": "..."}, "tenant": {...}}
  
  -- Poznámky
  poznamka TEXT,
  
  -- Audit fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  updated_by UUID
);

-- Indexy
CREATE INDEX IF NOT EXISTS idx_handover_protocols_contract ON handover_protocols(contract_id);
CREATE INDEX IF NOT EXISTS idx_handover_protocols_datum ON handover_protocols(datum_predani);
CREATE INDEX IF NOT EXISTS idx_handover_protocols_typ ON handover_protocols(typ_protokolu);

-- Komentáře
COMMENT ON TABLE handover_protocols IS 'Předávací protokoly - součást modulu 060';
COMMENT ON COLUMN handover_protocols.typ_protokolu IS 'Typ protokolu: predani (začátek nájmu), vraceni (konec nájmu)';
COMMENT ON COLUMN handover_protocols.seznam_polozek IS 'Seznam předávaných věcí a jejich stav';
COMMENT ON COLUMN handover_protocols.stavy_meridel IS 'Stavy elektroměrů, vodoměrů atd. při předání';

-- Trigger pro automatickou aktualizaci updated_at
CREATE TRIGGER handover_protocols_updated_at
  BEFORE UPDATE ON handover_protocols
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- RLS Policies
-- ============================================================================

ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE handover_protocols ENABLE ROW LEVEL SECURITY;

-- Contracts policies
CREATE POLICY contracts_select ON contracts
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY contracts_insert ON contracts
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY contracts_update ON contracts
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY contracts_delete ON contracts
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Handover protocols policies
CREATE POLICY handover_protocols_select ON handover_protocols
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY handover_protocols_insert ON handover_protocols
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY handover_protocols_update ON handover_protocols
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- ============================================================================
-- KONEC MIGRACE
-- ============================================================================
SELECT 'Migration 004 completed: contracts and handover_protocols tables created' as status;
