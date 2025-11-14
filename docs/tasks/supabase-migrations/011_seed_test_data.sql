-- Migration 011: Seed Test Data for Entities
-- Purpose: Create 2 test entities for each entity type
-- Author: Copilot
-- Date: 2025-11-14

-- =============================================================================
-- 1. Test Landlords (Pronajímatelé)
-- =============================================================================

-- Test Landlord 1: Fyzická osoba
INSERT INTO subjects (
  id,
  typ_subjektu,
  role,
  display_name,
  jmeno,
  prijmeni,
  primary_email,
  telefon,
  ulice,
  cislo_popisne,
  mesto,
  psc,
  stat,
  archived
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'osoba',
  'pronajimatel',
  'Jan Novák',
  'Jan',
  'Novák',
  'jan.novak@example.com',
  '+420 777 123 456',
  'Hlavní',
  '123',
  'Praha',
  '11000',
  'ČR',
  false
) ON CONFLICT (id) DO NOTHING;

-- Test Landlord 2: Právnická osoba
INSERT INTO subjects (
  id,
  typ_subjektu,
  role,
  display_name,
  nazev_firmy,
  ico,
  dic,
  primary_email,
  telefon,
  ulice,
  cislo_popisne,
  mesto,
  psc,
  stat,
  archived
) VALUES (
  '11111111-1111-1111-1111-111111111112',
  'firma',
  'pronajimatel',
  'Reality Development s.r.o.',
  'Reality Development s.r.o.',
  '12345678',
  'CZ12345678',
  'info@realitydevelopment.cz',
  '+420 222 333 444',
  'Václavské náměstí',
  '10',
  'Praha',
  '11000',
  'ČR',
  false
) ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 2. Test Properties (Nemovitosti)
-- =============================================================================

-- Test Property 1: Bytový dům
INSERT INTO properties (
  id,
  typ_nemovitosti,
  nazev,
  popis,
  ulice,
  cislo_popisne,
  cislo_orientacni,
  mesto,
  psc,
  kraj,
  stat,
  rok_vystavby,
  celkova_plocha,
  pocet_podlazi,
  pocet_podzemních_podlazi,
  pocet_jednotek,
  pronajimatel_id,
  archived
) VALUES (
  '22222222-2222-2222-2222-222222222221',
  'bytovy_dum',
  'Bytový dům Hlavní 123',
  'Moderní bytový dům v centru Prahy',
  'Hlavní',
  '123',
  '5a',
  'Praha',
  '11000',
  'Praha',
  'Česká republika',
  2015,
  2500.00,
  5,
  1,
  12,
  '11111111-1111-1111-1111-111111111112',
  false
) ON CONFLICT (id) DO NOTHING;

-- Test Property 2: Kancelářská budova
INSERT INTO properties (
  id,
  typ_nemovitosti,
  nazev,
  popis,
  ulice,
  cislo_popisne,
  mesto,
  psc,
  kraj,
  stat,
  rok_vystavby,
  rok_rekonstrukce,
  celkova_plocha,
  pocet_podlazi,
  pocet_jednotek,
  pronajimatel_id,
  archived
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  'admin_budova',
  'Business Centrum Brno',
  'Moderní administrativní budova',
  'Masarykova',
  '25',
  'Brno',
  '60200',
  'Jihomoravský',
  'Česká republika',
  2010,
  2020,
  3500.00,
  6,
  8,
  '11111111-1111-1111-1111-111111111112',
  false
) ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 3. Test Units (Jednotky)
-- =============================================================================

-- Test Unit 1: Byt 2+1
INSERT INTO units (
  id,
  nemovitost_id,
  typ_jednotky,
  oznaceni,
  nazev,
  podlazi,
  plocha,
  dispozice,
  pocet_mistnosti,
  stav,
  mesicni_najem,
  kauce,
  archived
) VALUES (
  '33333333-3333-3333-3333-333333333331',
  '22222222-2222-2222-2222-222222222221',
  'byt',
  '1.01',
  'Byt 2+1 v 1. patře',
  '1',
  65.50,
  '2+1',
  3,
  'volna',
  15000.00,
  30000.00,
  false
) ON CONFLICT (id) DO NOTHING;

-- Test Unit 2: Kancelář
INSERT INTO units (
  id,
  nemovitost_id,
  typ_jednotky,
  oznaceni,
  nazev,
  podlazi,
  plocha,
  dispozice,
  pocet_mistnosti,
  stav,
  mesicni_najem,
  kauce,
  archived
) VALUES (
  '33333333-3333-3333-3333-333333333332',
  '22222222-2222-2222-2222-222222222222',
  'kancelar',
  'A3.05',
  'Kancelář 120m² - 3. patro',
  '3',
  120.00,
  'open space',
  1,
  'volna',
  45000.00,
  90000.00,
  false
) ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 4. Test Tenants (Nájemníci)
-- =============================================================================

-- Test Tenant 1: Fyzická osoba
INSERT INTO subjects (
  id,
  typ_subjektu,
  role,
  display_name,
  jmeno,
  prijmeni,
  primary_email,
  telefon,
  ulice,
  cislo_popisne,
  mesto,
  psc,
  stat,
  archived
) VALUES (
  '44444444-4444-4444-4444-444444444441',
  'osoba',
  'najemnik',
  'Petra Svobodová',
  'Petra',
  'Svobodová',
  'petra.svobodova@example.com',
  '+420 777 999 888',
  'Nádražní',
  '45',
  'Praha',
  '11000',
  'ČR',
  false
) ON CONFLICT (id) DO NOTHING;

-- Test Tenant 2: Firma
INSERT INTO subjects (
  id,
  typ_subjektu,
  role,
  display_name,
  nazev_firmy,
  ico,
  dic,
  primary_email,
  telefon,
  ulice,
  cislo_popisne,
  mesto,
  psc,
  stat,
  archived
) VALUES (
  '44444444-4444-4444-4444-444444444442',
  'firma',
  'najemnik',
  'Tech Solutions s.r.o.',
  'Tech Solutions s.r.o.',
  '87654321',
  'CZ87654321',
  'office@techsolutions.cz',
  '+420 555 666 777',
  'Průmyslová',
  '789',
  'Brno',
  '60200',
  'ČR',
  false
) ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- 5. Test Contracts (Smlouvy)
-- Note: Contracts table may not exist yet, this is a placeholder
-- =============================================================================

-- We'll add contracts after confirming table structure exists
-- For now, leaving commented out

-- =============================================================================
-- 6. Test Payments (Platby)  
-- Note: Payments table may not exist yet, this is a placeholder
-- =============================================================================

-- We'll add payments after confirming table structure exists
-- For now, leaving commented out

-- =============================================================================
-- 7. Test Documents (Dokumenty)
-- Note: Documents/attachments table may already exist
-- =============================================================================

-- Check if attachments table exists and add sample documents
-- For now, leaving commented out pending table confirmation

-- =============================================================================
-- 8. Add comments for documentation
-- =============================================================================

COMMENT ON COLUMN subjects.id IS 'Test landlords: 11111111-1111-1111-1111-111111111111, 11111111-1111-1111-1111-111111111112';
COMMENT ON COLUMN properties.id IS 'Test properties: 22222222-2222-2222-2222-222222222221, 22222222-2222-2222-2222-222222222222';
COMMENT ON COLUMN units.id IS 'Test units: 33333333-3333-3333-3333-333333333331, 33333333-3333-3333-3333-333333333332';
