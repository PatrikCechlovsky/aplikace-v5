-- ============================================================================
-- Migration 006: Create payments tables (Module 080)
-- ============================================================================
-- Vytváří tabulky pro modul 080 - Platby
-- Podle specifikace v smlouvy_moduly_030-080.md
-- ============================================================================

-- ============================================================================
-- PAYMENTS TABLE - Hlavní tabulka plateb
-- ============================================================================

CREATE TABLE IF NOT EXISTS payments (
  -- Primární klíč
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Vazby
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  party_id UUID NOT NULL REFERENCES subjects(id) ON DELETE RESTRICT,
  -- party_id = kdo platí (typicky nájemník)
  
  -- Částka
  amount DECIMAL(12,2) NOT NULL CHECK (amount >= 0),
  currency VARCHAR(3) DEFAULT 'CZK',
  
  -- Datum platby
  payment_date TIMESTAMPTZ NOT NULL,
  value_date DATE,
  -- Bankovní valuta (den připsání na účet)
  
  -- Typ platby
  payment_type VARCHAR(50) NOT NULL,
  -- Možné hodnoty: najem, sluzba, kauce, poplatek, vratka
  
  -- Alokace platby (rozložení na nájem a služby)
  allocated_to JSONB,
  -- Formát: [{"type": "najem", "target_id": null, "amount": 15000}, {"type": "service", "target_id": "service-line-uuid", "amount": 2000}]
  
  -- Způsob platby
  payment_method VARCHAR(50),
  -- Možné hodnoty: bankovni_prevod, direct_debit, kartou, hotove, jinak
  
  -- Reference platby
  payment_reference VARCHAR(100),
  -- Variabilní symbol, zpráva pro příjemce
  bank_transaction_id VARCHAR(100),
  -- ID bankovní transakce (pokud dostupné)
  
  -- Stav platby
  status VARCHAR(50) DEFAULT 'cekajici',
  -- Možné hodnoty: cekajici, potvrzeno, uspesne_rekoncilovano, selhalo, vraceno
  
  -- Potvrzení o platbě
  doklad_potvrzeni_document_id UUID,
  -- Odkaz na vygenerovaný dokument s potvrzením
  auto_odeslano_potvrzeni VARCHAR(50) DEFAULT 'neodeslano',
  -- Možné hodnoty: neodeslano, fronta, odeslano, selhalo
  potvrzeni_odeslano_v TIMESTAMPTZ,
  
  -- Elektronický podpis potvrzení
  podpis_info JSONB,
  -- Formát: {"provider": "BankID", "signed_at": "2024-01-01T10:00:00Z", "signer_id": "uuid", "document_id": "uuid"}
  
  -- Poznámky
  poznamky TEXT,
  
  -- Audit fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  updated_by UUID
);

-- Indexy
CREATE INDEX IF NOT EXISTS idx_payments_contract ON payments(contract_id);
CREATE INDEX IF NOT EXISTS idx_payments_party ON payments(party_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_payments_value_date ON payments(value_date);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_payment_type ON payments(payment_type);
CREATE INDEX IF NOT EXISTS idx_payments_reference ON payments(payment_reference);
CREATE INDEX IF NOT EXISTS idx_payments_bank_transaction ON payments(bank_transaction_id);

-- Komentáře
COMMENT ON TABLE payments IS 'Platby - modul 080';
COMMENT ON COLUMN payments.party_id IS 'Kdo platí (typicky nájemník)';
COMMENT ON COLUMN payments.payment_type IS 'Typ platby: najem, sluzba, kauce, poplatek, vratka';
COMMENT ON COLUMN payments.payment_method IS 'Způsob platby: bankovni_prevod, direct_debit, kartou, hotove, jinak';
COMMENT ON COLUMN payments.status IS 'Stav: cekajici, potvrzeno, uspesne_rekoncilovano, selhalo, vraceno';
COMMENT ON COLUMN payments.allocated_to IS 'Alokace platby na jednotlivé položky (nájem, služby)';
COMMENT ON COLUMN payments.auto_odeslano_potvrzeni IS 'Stav odeslání potvrzení: neodeslano, fronta, odeslano, selhalo';

-- Trigger pro automatickou aktualizaci updated_at
CREATE TRIGGER payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PAYMENT SERVICE ITEMS TABLE - Detailní rozpis služeb v platbě
-- ============================================================================

CREATE TABLE IF NOT EXISTS payment_service_items (
  -- Primární klíč
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Vazby
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  service_line_id UUID REFERENCES contract_service_lines(id) ON DELETE SET NULL,
  
  -- Částka za službu
  amount DECIMAL(12,2) NOT NULL CHECK (amount >= 0),
  
  -- Období
  period_from DATE,
  period_to DATE,
  
  -- Výpočet (pro měřené služby)
  price_per_unit DECIMAL(12,4),
  units DECIMAL(12,4),
  -- Např. 150 kWh * 5.5 Kč/kWh = 825 Kč
  
  -- DPH
  tax DECIMAL(12,2),
  
  -- Poznámky
  poznamky TEXT,
  
  -- Audit fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  updated_by UUID
);

-- Indexy
CREATE INDEX IF NOT EXISTS idx_payment_service_items_payment ON payment_service_items(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_service_items_service_line ON payment_service_items(service_line_id);
CREATE INDEX IF NOT EXISTS idx_payment_service_items_period ON payment_service_items(period_from, period_to);

-- Komentáře
COMMENT ON TABLE payment_service_items IS 'Detailní rozpis služeb v platbě - modul 080';
COMMENT ON COLUMN payment_service_items.units IS 'Počet jednotek (např. kWh, m³)';
COMMENT ON COLUMN payment_service_items.price_per_unit IS 'Cena za jednotku';

-- Trigger pro automatickou aktualizaci updated_at
CREATE TRIGGER payment_service_items_updated_at
  BEFORE UPDATE ON payment_service_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PAYMENT ALLOCATIONS TABLE - Alokace plateb (pro komplexnější případy)
-- ============================================================================

CREATE TABLE IF NOT EXISTS payment_allocations (
  -- Primární klíč
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Vazby
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  
  -- Typ alokace
  allocation_type VARCHAR(50) NOT NULL,
  -- Možné hodnoty: najem, service, kauce, fee, other
  
  -- Částka
  amount DECIMAL(12,2) NOT NULL CHECK (amount >= 0),
  
  -- Odkaz na cílovou položku (podle typu)
  target_id UUID,
  -- Např. ID service_line pokud allocation_type = 'service'
  
  -- Období
  period_from DATE,
  period_to DATE,
  
  -- Poznámky
  poznamky TEXT,
  
  -- Audit fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  updated_by UUID
);

-- Indexy
CREATE INDEX IF NOT EXISTS idx_payment_allocations_payment ON payment_allocations(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_allocations_type ON payment_allocations(allocation_type);
CREATE INDEX IF NOT EXISTS idx_payment_allocations_target ON payment_allocations(target_id);

-- Komentáře
COMMENT ON TABLE payment_allocations IS 'Alokace plateb na konkrétní položky - modul 080';
COMMENT ON COLUMN payment_allocations.allocation_type IS 'Typ alokace: najem, service, kauce, fee, other';
COMMENT ON COLUMN payment_allocations.target_id IS 'ID cílové položky (např. service_line_id)';

-- Trigger pro automatickou aktualizaci updated_at
CREATE TRIGGER payment_allocations_updated_at
  BEFORE UPDATE ON payment_allocations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- View pro přehled plateb na smlouvě
-- ============================================================================

CREATE OR REPLACE VIEW contract_payments_summary AS
SELECT 
  p.contract_id,
  COUNT(*) as pocet_plateb,
  SUM(CASE WHEN p.status = 'uspesne_rekoncilovano' THEN p.amount ELSE 0 END) as celkem_zaplaceno,
  SUM(CASE WHEN p.payment_type = 'najem' AND p.status = 'uspesne_rekoncilovano' THEN p.amount ELSE 0 END) as zaplaceno_najem,
  SUM(CASE WHEN p.payment_type = 'sluzba' AND p.status = 'uspesne_rekoncilovano' THEN p.amount ELSE 0 END) as zaplaceno_sluzby,
  SUM(CASE WHEN p.payment_type = 'kauce' AND p.status = 'uspesne_rekoncilovano' THEN p.amount ELSE 0 END) as zaplaceno_kauce,
  MAX(p.payment_date) as posledni_platba
FROM payments p
GROUP BY p.contract_id;

COMMENT ON VIEW contract_payments_summary IS 'Sumář plateb podle smlouvy';

-- ============================================================================
-- Funkce pro validaci alokace platby
-- ============================================================================

CREATE OR REPLACE FUNCTION validate_payment_allocation()
RETURNS TRIGGER AS $$
DECLARE
  v_total_allocated DECIMAL;
  v_payment_amount DECIMAL;
BEGIN
  -- Získat celkovou částku platby
  SELECT amount INTO v_payment_amount
  FROM payments
  WHERE id = NEW.payment_id;
  
  -- Spočítat celkovou alokovanou částku
  SELECT COALESCE(SUM(amount), 0) INTO v_total_allocated
  FROM payment_allocations
  WHERE payment_id = NEW.payment_id;
  
  -- Kontrola, že celková alokace nepřesáhne částku platby
  IF v_total_allocated + NEW.amount > v_payment_amount THEN
    RAISE EXCEPTION 'Celková alokovaná částka (% + %) přesahuje částku platby (%)', 
      v_total_allocated, NEW.amount, v_payment_amount;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payment_allocations_validate
  BEFORE INSERT OR UPDATE ON payment_allocations
  FOR EACH ROW
  EXECUTE FUNCTION validate_payment_allocation();

-- ============================================================================
-- RLS Policies
-- ============================================================================

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_service_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_allocations ENABLE ROW LEVEL SECURITY;

-- Payments policies
CREATE POLICY payments_select ON payments
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY payments_insert ON payments
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY payments_update ON payments
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY payments_delete ON payments
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
  );

-- Payment service items policies
CREATE POLICY payment_service_items_select ON payment_service_items
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY payment_service_items_insert ON payment_service_items
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY payment_service_items_update ON payment_service_items
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Payment allocations policies
CREATE POLICY payment_allocations_select ON payment_allocations
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY payment_allocations_insert ON payment_allocations
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY payment_allocations_update ON payment_allocations
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- ============================================================================
-- KONEC MIGRACE
-- ============================================================================
SELECT 'Migration 006 completed: payments, payment_service_items, and payment_allocations tables created' as status;
