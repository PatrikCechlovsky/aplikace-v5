-- Migration 011_seed_demo_data.sql (OPRAVENÉ UUID)
BEGIN;


-- 1) Subjects (pronajímatelé)
INSERT INTO subjects (id, display_name, typ_subjektu, ico, primary_email, primary_phone, city, created_at)
VALUES
('11111111-1111-1111-1111-111111111111'::uuid, 'Pronajímatel Demo 1', 'pronajimatel', '12345678', 'lord1@example.com', '+420111111111', 'Praha', now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO subjects (id, display_name, typ_subjektu, ico, primary_email, primary_phone, city, created_at)
VALUES
('22222222-2222-2222-2222-222222222222'::uuid, 'Pronajímatel Demo 2', 'pronajimatel', '87654321', 'lord2@example.com', '+420222222222', 'Brno', now())
ON CONFLICT (id) DO NOTHING;

-- 2) Tenants as subjects
INSERT INTO subjects (id, display_name, typ_subjektu, primary_email, primary_phone, created_at)
VALUES
('55555555-5555-5555-5555-555555555555'::uuid, 'Nájemník Demo 1', 'najemnik', 'tenant1@example.com', '+420333333333', now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO subjects (id, display_name, typ_subjektu, primary_email, primary_phone, created_at)
VALUES
('66666666-6666-6666-6666-666666666666'::uuid, 'Nájemník Demo 2', 'najemnik', 'tenant2@example.com', '+420444444444', now())
ON CONFLICT (id) DO NOTHING;

-- 3) tenants table link
INSERT INTO tenants (id, subject_id, display_name, primary_email, primary_phone, created_at)
VALUES
('55555555-5555-5555-5555-555555555555'::uuid, '55555555-5555-5555-5555-555555555555'::uuid, 'Nájemník Demo 1', 'tenant1@example.com', '+420333333333', now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO tenants (id, subject_id, display_name, primary_email, primary_phone, created_at)
VALUES
('66666666-6666-6666-6666-666666666666'::uuid, '66666666-6666-6666-6666-666666666666'::uuid, 'Nájemník Demo 2', 'tenant2@example.com', '+420444444444', now())
ON CONFLICT (id) DO NOTHING;

-- 4) Properties
INSERT INTO properties (id, nazev, typ_nemovitosti, ulice, mesto, psc, rok_vystavby, pocet_jednotek, pronajimatel_id, subject_id, created_at)
SELECT '33333333-3333-3333-3333-333333333333'::uuid, 'Nemovitost Demo A', 'bytovy_dum', 'Ulice 1', 'Praha', '11000', 1990, 2, '11111111-1111-1111-1111-111111111111'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, now()
WHERE NOT EXISTS (SELECT 1 FROM properties WHERE id='33333333-3333-3333-3333-333333333333');

INSERT INTO properties (id, nazev, typ_nemovitosti, ulice, mesto, psc, rok_vystavby, pocet_jednotek, pronajimatel_id, subject_id, created_at)
SELECT '44444444-4444-4444-4444-444444444444'::uuid, 'Nemovitost Demo B', 'rodinny_dum', 'Ulice 2', 'Brno', '60200', 1985, 1, '22222222-2222-2222-2222-222222222222'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, now()
WHERE NOT EXISTS (SELECT 1 FROM properties WHERE id='44444444-4444-4444-4444-444444444444');

-- 5) Units
INSERT INTO units (id, nemovitost_id, oznaceni, typ, plocha, stav, created_at)
SELECT 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, 'A-1','byt',55.5,'volna', now()
WHERE NOT EXISTS (SELECT 1 FROM units WHERE id='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')
  AND EXISTS (SELECT 1 FROM properties WHERE id='33333333-3333-3333-3333-333333333333');

INSERT INTO units (id, nemovitost_id, oznaceni, typ, plocha, stav, created_at)
SELECT 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, 'A-2','byt',42.0,'obsazena', now()
WHERE NOT EXISTS (SELECT 1 FROM units WHERE id='bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb')
  AND EXISTS (SELECT 1 FROM properties WHERE id='33333333-3333-3333-3333-333333333333');

-- 6) Contracts
INSERT INTO contracts (id, landlord_id, tenant_id, unit_id, property_id, cislo_smlouvy, nazev, stav, datum_zacatek, datum_konec, najem_vyse, created_at)
SELECT '77777777-7777-7777-7777-777777777777'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, '55555555-5555-5555-5555-555555555555'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, '33333333-3333-3333-3333-333333333333'::uuid,'SML-001','Nájemní smlouva Demo 1','active','2024-01-01','2025-01-01',12000, now()
WHERE NOT EXISTS (SELECT 1 FROM contracts WHERE id='77777777-7777-7777-7777-777777777777')
  AND EXISTS (SELECT 1 FROM subjects WHERE id='11111111-1111-1111-1111-111111111111')
  AND EXISTS (SELECT 1 FROM tenants WHERE id='55555555-5555-5555-5555-555555555555')
  AND EXISTS (SELECT 1 FROM units WHERE id='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');

INSERT INTO contracts (id, landlord_id, tenant_id, unit_id, property_id, cislo_smlouvy, nazev, stav, datum_zacatek, datum_konec, najem_vyse, created_at)
SELECT '88888888-8888-8888-8888-888888888888'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, '66666666-6666-6666-6666-666666666666'::uuid, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, '44444444-4444-4444-4444-444444444444'::uuid,'SML-002','Nájemní smlouva Demo 2','expired','2023-06-01','2024-06-01',9000, now()
WHERE NOT EXISTS (SELECT 1 FROM contracts WHERE id='88888888-8888-8888-8888-888888888888')
  AND EXISTS (SELECT 1 FROM subjects WHERE id='22222222-2222-2222-2222-222222222222')
  AND EXISTS (SELECT 1 FROM tenants WHERE id='66666666-6666-6666-6666-666666666666')
  AND EXISTS (SELECT 1 FROM units WHERE id='bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');

-- 7) Payments
INSERT INTO payments (id, contract_id, amount, currency, payment_date, paid_at, status, poznamky, party_id, doklad_potvrzeni_document_id, created_at)
VALUES
('99999999-9999-9999-9999-999999999999'::uuid, '77777777-7777-7777-7777-777777777777'::uuid, 12000, 'CZK', '2024-02-01'::timestamptz, NULL, 'completed', 'Únor 2024 nájem', NULL, NULL, now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO payments (id, contract_id, amount, currency, payment_date, paid_at, status, poznamky, party_id, doklad_potvrzeni_document_id, created_at)
VALUES
('aaaaaaaa-1111-2222-3333-444444444444'::uuid, '77777777-7777-7777-7777-777777777777'::uuid, 12000, 'CZK', '2024-03-01'::timestamptz, NULL, 'pending', 'Březen 2024 nájem', NULL, NULL, now())
ON CONFLICT (id) DO NOTHING;

-- 8) Documents
INSERT INTO documents (id, name, type, size, owner_id, related_entity, related_id, storage_path, metadata, created_at)
VALUES
('dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid, 'Smlouva_SML-001.pdf', 'application/pdf', 345678, '11111111-1111-1111-1111-111111111111'::uuid, 'contract', '77777777-7777-7777-7777-777777777777'::uuid, '/files/Smlouva_SML-001.pdf', '{"note":"demo"}'::jsonb, now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO documents (id, name, type, size, owner_id, related_entity, related_id, storage_path, metadata, created_at)
VALUES
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid, 'Protokol_Audit.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 123456, '22222222-2222-2222-2222-222222222222'::uuid, 'property', '33333333-3333-3333-3333-333333333333'::uuid, '/files/Protokol_Audit.docx', '{"note":"demo"}'::jsonb, now())
ON CONFLICT (id) DO NOTHING;

-- 9) Finance bank accounts
INSERT INTO finance_bank_accounts (id, owner_id, bank_name, account_number, iban, currency, created_at)
VALUES
('fb1fb1fb-0000-0000-0000-000000000001'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'Demo Banka', '123456/0100', 'CZ650100000000123456789', 'CZK', now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO finance_bank_accounts (id, owner_id, bank_name, account_number, iban, currency, created_at)
VALUES
('fb2fb2fb-0000-0000-0000-000000000002'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, 'Banka 2', '987654/0300', 'CZ760300000000987654321', 'CZK', now())
ON CONFLICT (id) DO NOTHING;

-- 10) Energie meters/readings (OPRAVENÉ UUID)
INSERT INTO energie_meters (id, property_id, unit_id, meter_number, commodity, created_at)
VALUES
('a0000000-0000-0000-0000-000000000011'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, NULL, 'MTR-0001', 'electricity', now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO energie_meters (id, property_id, unit_id, meter_number, commodity, created_at)
VALUES
('a0000000-0000-0000-0000-000000000012'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, NULL, 'MTR-0002', 'water', now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO energie_readings (id, meter_id, reading_date, value, created_at)
VALUES
('b0000000-0000-0000-0000-000000000021'::uuid, 'a0000000-0000-0000-0000-000000000011'::uuid, '2024-01-01', 1234.5, now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO energie_readings (id, meter_id, reading_date, value, created_at)
VALUES
('b0000000-0000-0000-0000-000000000022'::uuid, 'a0000000-0000-0000-0000-000000000012'::uuid, '2024-01-15', 234.0, now())
ON CONFLICT (id) DO NOTHING;

-- 11) Communication templates / messages (OPRAVENÉ UUID)
INSERT INTO communication_templates (id, name, body, tags, created_at)
VALUES
('c0000000-0000-0000-0000-000000000031'::uuid, 'Upomínka nájem', 'Dobrý den {{tenant.name}}, prosíme uhraďte...', ARRAY['rent','reminder']::text[], now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO communication_templates (id, name, body, tags, created_at)
VALUES
('c0000000-0000-0000-0000-000000000032'::uuid, 'Potvrzení platby', 'Děkujeme, platba přijata: {{amount}}', ARRAY['payment','confirmation']::text[], now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO communication_messages (id, channel, subject, body, to_subject_id, from_subject_id, status, created_at)
VALUES
('d0000000-0000-0000-0000-000000000041'::uuid, 'email', 'Upomínka nájem', 'Prosíme o úhradu...', '55555555-5555-5555-5555-555555555555'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'queued', now())
ON CONFLICT (id) DO NOTHING;

INSERT INTO communication_messages (id, channel, subject, body, to_subject_id, from_subject_id, status, created_at)
VALUES
('d0000000-0000-0000-0000-000000000042'::uuid, 'sms', 'Platba přijata', 'Děkujeme za platbu', '55555555-5555-5555-5555-555555555555'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'sent', now())
ON CONFLICT (id) DO NOTHING;

COMMIT;
