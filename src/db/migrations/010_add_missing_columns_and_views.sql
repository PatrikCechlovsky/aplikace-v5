-- Migration 010_add_missing_columns_and_views.sql
-- Purpose: add missing document columns, ensure wizard tables, create compatibility views and indexes
-- Run this migration as service_role / superuser (to ensure extension creation works)
-- Recommended: run on test DB first.


-- Ensure pgcrypto for gen_random_uuid
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1) Add missing columns to documents
ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS name text,
  ADD COLUMN IF NOT EXISTS type text,
  ADD COLUMN IF NOT EXISTS size integer,
  ADD COLUMN IF NOT EXISTS owner_id uuid,
  ADD COLUMN IF NOT EXISTS related_entity text,
  ADD COLUMN IF NOT EXISTS related_id uuid,
  ADD COLUMN IF NOT EXISTS storage_path text,
  ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- 2) Ensure wizard tables exist (safe creations)
CREATE TABLE IF NOT EXISTS wizard_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  wizard_key text NOT NULL,
  entity_code text,
  mode text DEFAULT 'create',
  target_id uuid,
  total_steps integer DEFAULT 1,
  current_step_order integer DEFAULT 1,
  status text DEFAULT 'draft',
  payload jsonb,
  meta jsonb,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wizard_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id uuid REFERENCES wizard_drafts(id) ON DELETE CASCADE,
  step_order integer NOT NULL,
  step_code text NOT NULL,
  entity_code text,
  form_code text,
  list_code text,
  tab_code text,
  data jsonb,
  status text DEFAULT 'pending',
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3) Recreate compatibility views: drop if exist then create
DROP VIEW IF EXISTS v_units;
DROP VIEW IF EXISTS v_properties;
DROP VIEW IF EXISTS v_payments;
DROP VIEW IF EXISTS v_documents;

CREATE OR REPLACE VIEW v_properties AS
SELECT
  id,
  nazev,
  typ_nemovitosti,
  ulice,
  cislo_popisne,
  cislo_orientacni,
  mesto,
  psc,
  kraj,
  rok_vystavby,
  pocet_jednotek,
  pronajimatel_id AS landlord_id,
  subject_id,
  metadata
FROM properties;

CREATE OR REPLACE VIEW v_units AS
SELECT
  id,
  nemovitost_id AS property_id,
  oznaceni,
  typ AS typ_jednotky,
  plocha,
  dispozice,
  pocet_mistnosti,
  stav,
  najemce_id AS tenant_id,
  mesicni_najem,
  metadata
FROM units;

CREATE OR REPLACE VIEW v_payments AS
SELECT
  id,
  contract_id,
  amount,
  currency,
  payment_date,
  paid_at,
  status,
  poznamky AS description,
  party_id AS payer_id,
  doklad_potvrzeni_document_id,
  created_at
FROM payments;

CREATE OR REPLACE VIEW v_documents AS
SELECT
  id,
  name,
  type,
  size,
  owner_id,
  related_entity,
  related_id,
  storage_path,
  metadata,
  created_at
FROM documents;

-- 4) Indexes (IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_properties_pronajimatel_id ON properties(pronajimatel_id);
CREATE INDEX IF NOT EXISTS idx_units_nemovitost_id ON units(nemovitost_id);
CREATE INDEX IF NOT EXISTS idx_payments_contract_id ON payments(contract_id);

-- End of migration 010
