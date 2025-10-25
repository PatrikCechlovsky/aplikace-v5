-- ============================================================================
-- Migration 005: Create services tables (Module 070)
-- ============================================================================
-- Vytváří tabulky pro modul 070 - Služby
-- Podle specifikace v smlouvy_moduly_030-080.md
-- ============================================================================

-- ============================================================================
-- SERVICE DEFINITIONS TABLE - Katalog služeb
-- ============================================================================

CREATE TABLE IF NOT EXISTS service_definitions (
  -- Primární klíč
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identifikace služby
  kod VARCHAR(50) UNIQUE NOT NULL,
  nazev VARCHAR(255) NOT NULL,
  popis TEXT,
  
  -- Typ účtování
  typ_uctovani VARCHAR(50) NOT NULL,
  -- Možné hodnoty: pevna_sazba, merena_spotreba, na_pocet_osob, na_m2, procento_z_najmu
  
  -- Cena a jednotka
  jednotka VARCHAR(50),
  -- Např.: 'Kč', 'Kč/m2', 'Kč/osoba', 'Kč/kWh'
  zakladni_cena DECIMAL(12,2),
  -- Výchozí cena za jednotku
  
  -- DPH
  sazba_dph DECIMAL(5,4) DEFAULT 0.21,
  -- Např. 0.21 pro 21%
  
  -- Kategorie
  kategorie VARCHAR(50),
  -- Možné hodnoty: energie, voda, internet, spravne_poplatky, jina
  
  -- Stav
  aktivni BOOLEAN DEFAULT true,
  
  -- Poznámky
  poznamky TEXT,
  
  -- Audit fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  updated_by UUID
);

-- Indexy
CREATE INDEX IF NOT EXISTS idx_service_definitions_kod ON service_definitions(kod);
CREATE INDEX IF NOT EXISTS idx_service_definitions_kategorie ON service_definitions(kategorie);
CREATE INDEX IF NOT EXISTS idx_service_definitions_aktivni ON service_definitions(aktivni);

-- Komentáře
COMMENT ON TABLE service_definitions IS 'Katalog služeb - modul 070';
COMMENT ON COLUMN service_definitions.kod IS 'Unikátní kód služby (např. "VODA", "ELEKTRINA")';
COMMENT ON COLUMN service_definitions.typ_uctovani IS 'Způsob účtování: pevna_sazba, merena_spotreba, na_pocet_osob, na_m2, procento_z_najmu';
COMMENT ON COLUMN service_definitions.kategorie IS 'Kategorie služby: energie, voda, internet, spravne_poplatky, jina';

-- Trigger pro automatickou aktualizaci updated_at
CREATE TRIGGER service_definitions_updated_at
  BEFORE UPDATE ON service_definitions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- CONTRACT SERVICE LINES TABLE - Služby přiřazené ke smlouvám
-- ============================================================================

CREATE TABLE IF NOT EXISTS contract_service_lines (
  -- Primární klíč
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Vazby
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  service_definition_id UUID REFERENCES service_definitions(id) ON DELETE SET NULL,
  -- Může být NULL pokud je to custom služba bez definice v katalogu
  
  -- Kopie údajů ze service_definition (pro historii)
  nazev VARCHAR(255) NOT NULL,
  typ_uctovani VARCHAR(50) NOT NULL,
  jednotka VARCHAR(50),
  
  -- Kdo platí
  plati VARCHAR(50) NOT NULL,
  -- Možné hodnoty: najemnik, pronajimatel, sdilene
  
  -- Výpočet ceny
  zaklad_pro_vypocet DECIMAL(12,4),
  -- Např. počet osob, m2, nebo měřená hodnota
  cena_za_jednotku DECIMAL(12,2) NOT NULL,
  
  -- Periodicita
  perioda_fakturace VARCHAR(50) DEFAULT 'mesicni',
  -- Možné hodnoty: mesicni, ctvrtletni, rocni
  
  -- Měřidla (pokud měřená spotřeba)
  meridlo_id UUID,
  -- Odkaz na měřidlo (v budoucnu propojit s tabulkou meters)
  
  -- Období platnosti
  od_data DATE,
  do_data DATE,
  
  -- Odhadované měsíční náklady (computed/cached)
  odhadovane_mesicni_naklady DECIMAL(12,2),
  
  -- Zda je služba zahrnuta v nájmu
  zahrnuto_v_najmu BOOLEAN DEFAULT false,
  
  -- Typ položky (pro vyúčtování)
  typ_line VARCHAR(50) DEFAULT 'zalohova',
  -- Možné hodnoty: zalohova, vypocet, korekce
  
  -- Vazba na jinou položku (pro korekce/refundace)
  linked_line_id UUID REFERENCES contract_service_lines(id) ON DELETE SET NULL,
  
  -- Poznámky
  poznamky TEXT,
  
  -- Audit fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  updated_by UUID
);

-- Indexy
CREATE INDEX IF NOT EXISTS idx_contract_service_lines_contract ON contract_service_lines(contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_service_lines_service_def ON contract_service_lines(service_definition_id);
CREATE INDEX IF NOT EXISTS idx_contract_service_lines_plati ON contract_service_lines(plati);
CREATE INDEX IF NOT EXISTS idx_contract_service_lines_dates ON contract_service_lines(od_data, do_data);

-- Komentáře
COMMENT ON TABLE contract_service_lines IS 'Služby přiřazené ke smlouvám - modul 070';
COMMENT ON COLUMN contract_service_lines.plati IS 'Kdo platí službu: najemnik, pronajimatel, sdilene';
COMMENT ON COLUMN contract_service_lines.perioda_fakturace IS 'Periodicita fakturace: mesicni, ctvrtletni, rocni';
COMMENT ON COLUMN contract_service_lines.typ_line IS 'Typ položky: zalohova (pravidelná platba), vypocet (skutečná spotřeba), korekce (rozdíl)';

-- Trigger pro automatickou aktualizaci updated_at
CREATE TRIGGER contract_service_lines_updated_at
  BEFORE UPDATE ON contract_service_lines
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Funkce pro výpočet měsíčních nákladů
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_monthly_cost(
  p_zaklad DECIMAL,
  p_cena_za_jednotku DECIMAL,
  p_perioda VARCHAR
)
RETURNS DECIMAL AS $$
DECLARE
  v_monthly_cost DECIMAL;
BEGIN
  v_monthly_cost := p_zaklad * p_cena_za_jednotku;
  
  -- Přepočet podle periodicity na měsíční hodnotu
  CASE p_perioda
    WHEN 'mesicni' THEN
      -- Nic, už je měsíční
      NULL;
    WHEN 'ctvrtletni' THEN
      v_monthly_cost := v_monthly_cost / 3;
    WHEN 'rocni' THEN
      v_monthly_cost := v_monthly_cost / 12;
    ELSE
      -- Default: považujeme za měsíční
      NULL;
  END CASE;
  
  RETURN ROUND(v_monthly_cost, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION calculate_monthly_cost IS 'Vypočítá měsíční náklady služby na základě periodicity';

-- ============================================================================
-- Trigger pro automatický výpočet odhadovaných měsíčních nákladů
-- ============================================================================

CREATE OR REPLACE FUNCTION update_monthly_cost()
RETURNS TRIGGER AS $$
BEGIN
  NEW.odhadovane_mesicni_naklady := calculate_monthly_cost(
    NEW.zaklad_pro_vypocet,
    NEW.cena_za_jednotku,
    NEW.perioda_fakturace
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER contract_service_lines_calculate_cost
  BEFORE INSERT OR UPDATE ON contract_service_lines
  FOR EACH ROW
  EXECUTE FUNCTION update_monthly_cost();

-- ============================================================================
-- View pro přehled služeb na smlouvě
-- ============================================================================

CREATE OR REPLACE VIEW contract_services_summary AS
SELECT 
  csl.contract_id,
  COUNT(*) as pocet_sluzeb,
  SUM(CASE WHEN csl.plati = 'najemnik' THEN csl.odhadovane_mesicni_naklady ELSE 0 END) as naklady_najemnik,
  SUM(CASE WHEN csl.plati = 'pronajimatel' THEN csl.odhadovane_mesicni_naklady ELSE 0 END) as naklady_pronajimatel,
  SUM(CASE WHEN csl.plati = 'sdilene' THEN csl.odhadovane_mesicni_naklady ELSE 0 END) as naklady_sdilene
FROM contract_service_lines csl
WHERE csl.do_data IS NULL OR csl.do_data >= CURRENT_DATE
GROUP BY csl.contract_id;

COMMENT ON VIEW contract_services_summary IS 'Sumář nákladů na služby podle smlouvy';

-- ============================================================================
-- RLS Policies
-- ============================================================================

ALTER TABLE service_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_service_lines ENABLE ROW LEVEL SECURITY;

-- Service definitions policies (všichni mohou číst katalog)
CREATE POLICY service_definitions_select ON service_definitions
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY service_definitions_insert ON service_definitions
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
  );

CREATE POLICY service_definitions_update ON service_definitions
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
  );

-- Contract service lines policies
CREATE POLICY contract_service_lines_select ON contract_service_lines
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY contract_service_lines_insert ON contract_service_lines
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY contract_service_lines_update ON contract_service_lines
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY contract_service_lines_delete ON contract_service_lines
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- ============================================================================
-- Vložení základních služeb do katalogu
-- ============================================================================

INSERT INTO service_definitions (kod, nazev, popis, typ_uctovani, jednotka, zakladni_cena, kategorie, aktivni) VALUES
  ('VODA', 'Voda', 'Studená voda', 'merena_spotreba', 'Kč/m³', 100.00, 'voda', true),
  ('TEPLA_VODA', 'Teplá voda', 'Teplá užitková voda', 'merena_spotreba', 'Kč/m³', 150.00, 'voda', true),
  ('ELEKTRINA', 'Elektřina', 'Elektrická energie', 'merena_spotreba', 'Kč/kWh', 5.50, 'energie', true),
  ('PLYN', 'Plyn', 'Zemní plyn', 'merena_spotreba', 'Kč/kWh', 2.50, 'energie', true),
  ('INTERNET', 'Internet', 'Připojení k internetu', 'pevna_sazba', 'Kč/měsíc', 500.00, 'internet', true),
  ('UKLID', 'Úklid společných prostor', 'Úklid chodeb a schodiště', 'na_m2', 'Kč/m²', 15.00, 'spravne_poplatky', true),
  ('FOND_OPRAV', 'Fond oprav', 'Příspěvek do fondu oprav', 'pevna_sazba', 'Kč/měsíc', 200.00, 'spravne_poplatky', true),
  ('ODVOZ_ODPADU', 'Odvoz odpadu', 'Likvidace komunálního odpadu', 'na_pocet_osob', 'Kč/osoba', 100.00, 'spravne_poplatky', true)
ON CONFLICT (kod) DO NOTHING;

-- ============================================================================
-- KONEC MIGRACE
-- ============================================================================
SELECT 'Migration 005 completed: service_definitions and contract_service_lines tables created' as status;
