-- Migration 010: Create Wizard System Tables
-- Purpose: Create tables for multi-step wizard functionality
-- Author: Copilot
-- Date: 2025-11-14

-- =============================================================================
-- 1. Create wizard_drafts table
-- =============================================================================
CREATE TABLE IF NOT EXISTS wizard_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  wizard_key TEXT NOT NULL,
  entity_code TEXT NOT NULL CHECK (entity_code IN ('LORD', 'PROP', 'UNIT', 'TEN', 'AGR', 'PAY', 'DOC')),
  mode TEXT NOT NULL CHECK (mode IN ('create', 'update')),
  target_id UUID,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'canceled', 'expired')),
  current_step_code TEXT,
  current_step_order INTEGER DEFAULT 1,
  total_steps INTEGER DEFAULT 1,
  payload JSONB DEFAULT '{}'::jsonb,
  meta JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- Add indexes for wizard_drafts
CREATE INDEX IF NOT EXISTS idx_wizard_drafts_user_id ON wizard_drafts(user_id);
CREATE INDEX IF NOT EXISTS idx_wizard_drafts_wizard_key ON wizard_drafts(wizard_key);
CREATE INDEX IF NOT EXISTS idx_wizard_drafts_entity_code ON wizard_drafts(entity_code);
CREATE INDEX IF NOT EXISTS idx_wizard_drafts_status ON wizard_drafts(status);
CREATE INDEX IF NOT EXISTS idx_wizard_drafts_expires_at ON wizard_drafts(expires_at);

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_wizard_drafts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER wizard_drafts_updated_at
  BEFORE UPDATE ON wizard_drafts
  FOR EACH ROW
  EXECUTE FUNCTION update_wizard_drafts_updated_at();

-- =============================================================================
-- 2. Create wizard_steps table
-- =============================================================================
CREATE TABLE IF NOT EXISTS wizard_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id UUID NOT NULL REFERENCES wizard_drafts(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  step_code TEXT NOT NULL,
  entity_code TEXT NOT NULL CHECK (entity_code IN ('LORD', 'PROP', 'UNIT', 'TEN', 'AGR', 'PAY', 'DOC')),
  form_code TEXT,
  list_code TEXT,
  tab_code TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'valid', 'invalid', 'skipped', 'done')),
  data JSONB DEFAULT '{}'::jsonb,
  errors JSONB DEFAULT '{}'::jsonb,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT wizard_steps_unique_draft_order UNIQUE (draft_id, step_order)
);

-- Add indexes for wizard_steps
CREATE INDEX IF NOT EXISTS idx_wizard_steps_draft_id ON wizard_steps(draft_id);
CREATE INDEX IF NOT EXISTS idx_wizard_steps_step_order ON wizard_steps(step_order);
CREATE INDEX IF NOT EXISTS idx_wizard_steps_status ON wizard_steps(status);

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_wizard_steps_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER wizard_steps_updated_at
  BEFORE UPDATE ON wizard_steps
  FOR EACH ROW
  EXECUTE FUNCTION update_wizard_steps_updated_at();

-- =============================================================================
-- 3. Enable RLS (Row Level Security)
-- =============================================================================
ALTER TABLE wizard_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE wizard_steps ENABLE ROW LEVEL SECURITY;

-- RLS Policies for wizard_drafts
CREATE POLICY wizard_drafts_select ON wizard_drafts
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  ));

CREATE POLICY wizard_drafts_insert ON wizard_drafts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY wizard_drafts_update ON wizard_drafts
  FOR UPDATE USING (auth.uid() = user_id OR auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  ));

CREATE POLICY wizard_drafts_delete ON wizard_drafts
  FOR DELETE USING (auth.uid() = user_id OR auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'admin'
  ));

-- RLS Policies for wizard_steps
CREATE POLICY wizard_steps_select ON wizard_steps
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM wizard_drafts WHERE id = wizard_steps.draft_id AND (
      user_id = auth.uid() OR auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
    )
  ));

CREATE POLICY wizard_steps_insert ON wizard_steps
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM wizard_drafts WHERE id = wizard_steps.draft_id AND user_id = auth.uid()
  ));

CREATE POLICY wizard_steps_update ON wizard_steps
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM wizard_drafts WHERE id = wizard_steps.draft_id AND (
      user_id = auth.uid() OR auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
    )
  ));

CREATE POLICY wizard_steps_delete ON wizard_steps
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM wizard_drafts WHERE id = wizard_steps.draft_id AND (
      user_id = auth.uid() OR auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
    )
  ));

-- =============================================================================
-- 4. Add comments for documentation
-- =============================================================================
COMMENT ON TABLE wizard_drafts IS 'Wizard draft instances for multi-step processes';
COMMENT ON TABLE wizard_steps IS 'Individual steps within a wizard draft';

COMMENT ON COLUMN wizard_drafts.wizard_key IS 'Type of wizard (e.g., create-prop-with-units)';
COMMENT ON COLUMN wizard_drafts.entity_code IS 'Primary entity code (LORD, PROP, UNIT, TEN, AGR, PAY, DOC)';
COMMENT ON COLUMN wizard_drafts.mode IS 'create or update mode';
COMMENT ON COLUMN wizard_drafts.target_id IS 'Existing entity ID if mode is update';
COMMENT ON COLUMN wizard_drafts.status IS 'Current status of the wizard';
COMMENT ON COLUMN wizard_drafts.payload IS 'Aggregated data from all steps';
COMMENT ON COLUMN wizard_drafts.meta IS 'Additional metadata';
COMMENT ON COLUMN wizard_drafts.expires_at IS 'Expiration timestamp for automatic cleanup';

COMMENT ON COLUMN wizard_steps.step_order IS 'Order of the step in the wizard';
COMMENT ON COLUMN wizard_steps.step_code IS 'Unique identifier for the step';
COMMENT ON COLUMN wizard_steps.form_code IS 'Form to display for this step (e.g., form-prop-detail)';
COMMENT ON COLUMN wizard_steps.list_code IS 'List to display for this step (optional)';
COMMENT ON COLUMN wizard_steps.tab_code IS 'Related tab code (optional)';
COMMENT ON COLUMN wizard_steps.data IS 'User input data for this step';
COMMENT ON COLUMN wizard_steps.errors IS 'Validation errors for this step';
