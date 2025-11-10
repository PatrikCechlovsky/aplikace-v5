# Datový model - Modul 070 (Služby)

## Přehled

Modul 070 pracuje se dvěma hlavními tabulkami:
1. **service_definitions** - Katalog služeb
2. **contract_service_lines** - Služby přiřazené ke smlouvám

## 1. Tabulka: service_definitions

Centrální katalog všech dostupných služeb v systému.

### Struktura

| Sloupec | Typ | Povinné | Default | Popis |
|---------|-----|---------|---------|-------|
| id | UUID | Ano | gen_random_uuid() | Primární klíč |
| kod | VARCHAR(50) | Ano | - | Unikátní kód služby (VODA, ELEKTRINA, atd.) |
| nazev | VARCHAR(255) | Ano | - | Název služby |
| popis | TEXT | Ne | NULL | Detailní popis služby |
| typ_uctovani | VARCHAR(50) | Ano | - | Způsob účtování |
| jednotka | VARCHAR(50) | Ne | NULL | Měrná jednotka (Kč, Kč/m³, Kč/kWh) |
| zakladni_cena | DECIMAL(12,2) | Ne | NULL | Výchozí cena za jednotku |
| sazba_dph | DECIMAL(5,4) | Ne | 0.21 | Sazba DPH (0.21 = 21%) |
| kategorie | VARCHAR(50) | Ne | NULL | Kategorie služby |
| aktivni | BOOLEAN | Ne | TRUE | Je služba aktivní? |
| poznamky | TEXT | Ne | NULL | Interní poznámky |
| created_at | TIMESTAMPTZ | Auto | NOW() | Datum vytvoření |
| updated_at | TIMESTAMPTZ | Auto | NOW() | Datum poslední úpravy |
| created_by | UUID | Ne | NULL | Kdo vytvořil |
| updated_by | UUID | Ne | NULL | Kdo upravil |

### Možné hodnoty typ_uctovani

| Hodnota | Popis | Příklad použití |
|---------|-------|-----------------|
| pevna_sazba | Pevná částka bez ohledu na spotřebu | Internet 500 Kč/měsíc |
| merena_spotreba | Podle skutečné spotřeby | Voda, elektřina, plyn |
| na_pocet_osob | Podle počtu osob | Odvoz odpadu 100 Kč/osoba |
| na_m2 | Podle plochy jednotky | Úklid 15 Kč/m² |
| procento_z_najmu | Procento z výše nájemného | Správa 5% z nájmu |

### Možné hodnoty kategorie

| Hodnota | Popis | Příklady |
|---------|-------|----------|
| energie | Energetické služby | Elektřina, plyn, teplo |
| voda | Vodní služby | Studená voda, teplá voda |
| internet | Internetové připojení | Internet, Wi-Fi |
| spravne_poplatky | Správní a provozní poplatky | Fond oprav, úklid, správa |
| jina | Ostatní služby | Parkování, ostatní |

### Indexy

- **PRIMARY KEY:** id
- **UNIQUE:** kod
- **INDEX:** kategorie
- **INDEX:** aktivni

### Constraints

- `kod` musí být unikátní
- `typ_uctovani` musí být z povoleného seznamu
- `kategorie` by měla být z povoleného seznamu (není vynuceno)

### Příklady dat

```sql
-- Studená voda
{
  "kod": "VODA",
  "nazev": "Studená voda",
  "popis": "Studená užitková voda",
  "typ_uctovani": "merena_spotreba",
  "jednotka": "Kč/m³",
  "zakladni_cena": 100.00,
  "sazba_dph": 0.21,
  "kategorie": "voda",
  "aktivni": true
}

-- Internet
{
  "kod": "INTERNET",
  "nazev": "Internetové připojení",
  "popis": "Vysokorychlostní internet 100 Mb/s",
  "typ_uctovani": "pevna_sazba",
  "jednotka": "Kč/měsíc",
  "zakladni_cena": 500.00,
  "sazba_dph": 0.21,
  "kategorie": "internet",
  "aktivni": true
}

-- Úklid
{
  "kod": "UKLID",
  "nazev": "Úklid společných prostor",
  "popis": "Úklid chodeb a schodiště",
  "typ_uctovani": "na_m2",
  "jednotka": "Kč/m²",
  "zakladni_cena": 15.00,
  "sazba_dph": 0.21,
  "kategorie": "spravne_poplatky",
  "aktivni": true
}
```

---

## 2. Tabulka: contract_service_lines

Služby přiřazené ke konkrétním smlouvám s individuálními cenami a podmínkami.

### Struktura

| Sloupec | Typ | Povinné | Default | Popis |
|---------|-----|---------|---------|-------|
| id | UUID | Ano | gen_random_uuid() | Primární klíč |
| contract_id | UUID | Ano | - | FK na contracts(id) |
| service_definition_id | UUID | Ne | NULL | FK na service_definitions(id) |
| nazev | VARCHAR(255) | Ano | - | Název služby (kopie pro historii) |
| typ_uctovani | VARCHAR(50) | Ano | - | Typ účtování (kopie) |
| jednotka | VARCHAR(50) | Ne | NULL | Jednotka (kopie) |
| plati | VARCHAR(50) | Ano | - | Kdo platí službu |
| zaklad_pro_vypocet | DECIMAL(12,4) | Ne | NULL | Základ pro výpočet (m², osoby) |
| cena_za_jednotku | DECIMAL(12,2) | Ano | - | Cena za jednotku v Kč |
| perioda_fakturace | VARCHAR(50) | Ne | 'mesicni' | Periodicita fakturace |
| meridlo_id | UUID | Ne | NULL | Odkaz na měřidlo (budoucí) |
| od_data | DATE | Ne | NULL | Platnost od |
| do_data | DATE | Ne | NULL | Platnost do |
| odhadovane_mesicni_naklady | DECIMAL(12,2) | Auto | - | Vypočtené měsíční náklady |
| zahrnuto_v_najmu | BOOLEAN | Ne | FALSE | Je zahrnuto v nájemném? |
| typ_line | VARCHAR(50) | Ne | 'zalohova' | Typ položky |
| linked_line_id | UUID | Ne | NULL | Vazba na jinou položku |
| poznamky | TEXT | Ne | NULL | Poznámky |
| created_at | TIMESTAMPTZ | Auto | NOW() | Datum vytvoření |
| updated_at | TIMESTAMPTZ | Auto | NOW() | Datum poslední úpravy |
| created_by | UUID | Ne | NULL | Kdo vytvořil |
| updated_by | UUID | Ne | NULL | Kdo upravil |

### Možné hodnoty plati

| Hodnota | Popis |
|---------|-------|
| najemnik | Platí nájemník |
| pronajimatel | Platí pronajímatel |
| sdilene | Sdílené náklady |

### Možné hodnoty perioda_fakturace

| Hodnota | Popis |
|---------|-------|
| mesicni | Měsíční fakturace |
| ctvrtletni | Čtvrtletní fakturace |
| rocni | Roční fakturace |

### Možné hodnoty typ_line

| Hodnota | Popis |
|---------|-------|
| zalohova | Zálohy (pravidelné platby) |
| vypocet | Skutečná spotřeba |
| korekce | Rozdíl/úprava |

### Indexy

- **PRIMARY KEY:** id
- **INDEX:** contract_id
- **INDEX:** service_definition_id
- **INDEX:** plati
- **INDEX:** (od_data, do_data)

### Foreign Keys

- `contract_id` → `contracts(id)` ON DELETE CASCADE
- `service_definition_id` → `service_definitions(id)` ON DELETE SET NULL
- `linked_line_id` → `contract_service_lines(id)` ON DELETE SET NULL

### Automatické výpočty

Sloupec `odhadovane_mesicni_naklady` se automaticky vypočítá triggerem při INSERT/UPDATE:

```sql
odhadovane_mesicni_naklady = calculate_monthly_cost(
  zaklad_pro_vypocet,
  cena_za_jednotku,
  perioda_fakturace
)
```

Funkce `calculate_monthly_cost`:
- **mesicni:** náklady = zaklad × cena
- **ctvrtletni:** náklady = (zaklad × cena) / 3
- **rocni:** náklady = (zaklad × cena) / 12

### Příklad dat

```sql
-- Studená voda pro smlouvu
{
  "contract_id": "uuid-smlouvy-123",
  "service_definition_id": "uuid-voda",
  "nazev": "Studená voda",
  "typ_uctovani": "merena_spotreba",
  "jednotka": "Kč/m³",
  "plati": "najemnik",
  "zaklad_pro_vypocet": 5.0,  -- odhadovaná spotřeba 5m³/měsíc
  "cena_za_jednotku": 100.00,
  "perioda_fakturace": "mesicni",
  "od_data": "2025-01-01",
  "do_data": null,
  "odhadovane_mesicni_naklady": 500.00,  -- auto-vypočteno
  "zahrnuto_v_najmu": false,
  "typ_line": "zalohova"
}
```

---

## 3. View: contract_services_summary

Agregovaný pohled na náklady služeb podle smlouvy.

### Struktura

| Sloupec | Typ | Popis |
|---------|-----|-------|
| contract_id | UUID | ID smlouvy |
| pocet_sluzeb | INTEGER | Počet aktivních služeb |
| naklady_najemnik | DECIMAL(12,2) | Náklady, které platí nájemník |
| naklady_pronajimatel | DECIMAL(12,2) | Náklady, které platí pronajímatel |
| naklady_sdilene | DECIMAL(12,2) | Sdílené náklady |

### SQL definice

```sql
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
```

---

## 4. Funkce: calculate_monthly_cost

Vypočítá měsíční náklady služby na základě periodicity.

### Signatura

```sql
calculate_monthly_cost(
  p_zaklad DECIMAL,
  p_cena_za_jednotku DECIMAL,
  p_perioda VARCHAR
) RETURNS DECIMAL
```

### Logika

```javascript
function calculate_monthly_cost(zaklad, cena, perioda) {
  let monthly_cost = zaklad * cena;
  
  switch(perioda) {
    case 'mesicni':
      // Nic, už je měsíční
      break;
    case 'ctvrtletni':
      monthly_cost = monthly_cost / 3;
      break;
    case 'rocni':
      monthly_cost = monthly_cost / 12;
      break;
    default:
      // Default: považujeme za měsíční
      break;
  }
  
  return Math.round(monthly_cost * 100) / 100;
}
```

---

## 5. Triggery

### update_updated_at_column

Automaticky aktualizuje `updated_at` při UPDATE:

```sql
CREATE TRIGGER service_definitions_updated_at
  BEFORE UPDATE ON service_definitions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER contract_service_lines_updated_at
  BEFORE UPDATE ON contract_service_lines
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### contract_service_lines_calculate_cost

Automaticky vypočítá `odhadovane_mesicni_naklady` při INSERT/UPDATE:

```sql
CREATE TRIGGER contract_service_lines_calculate_cost
  BEFORE INSERT OR UPDATE ON contract_service_lines
  FOR EACH ROW
  EXECUTE FUNCTION update_monthly_cost();
```

---

## 6. RLS (Row Level Security)

### service_definitions

```sql
ALTER TABLE service_definitions ENABLE ROW LEVEL SECURITY;

-- SELECT: Všichni přihlášení
CREATE POLICY service_definitions_select ON service_definitions
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- INSERT/UPDATE: Pouze admin a manager
CREATE POLICY service_definitions_insert ON service_definitions
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
  );

CREATE POLICY service_definitions_update ON service_definitions
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'manager'))
  );
```

### contract_service_lines

```sql
ALTER TABLE contract_service_lines ENABLE ROW LEVEL SECURITY;

-- SELECT/INSERT/UPDATE/DELETE: Všichni přihlášení
CREATE POLICY contract_service_lines_select ON contract_service_lines
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY contract_service_lines_insert ON contract_service_lines
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY contract_service_lines_update ON contract_service_lines
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY contract_service_lines_delete ON contract_service_lines
  FOR DELETE USING (auth.uid() IS NOT NULL);
```

---

## 7. UI stavy

### Načítací stav
Zobrazit spinner a text "Načítám služby..."

### Prázdný stav
Zobrazit ikonu 📋 a text "Žádné služby" s tlačítkem "Přidat první službu"

### Chybový stav
Zobrazit chybovou hlášku s možností "Zkusit znovu"

---

## 8. Vazby na ostatní moduly

### Modul 060 (Smlouvy)
- `contract_service_lines.contract_id` → `contracts.id`
- Služby se přidávají/upravují v kontextu smlouvy

### Modul 080 (Platby)
- Služby ovlivňují výpočet celkové platby
- `payment_service_items` odkazují na `contract_service_lines`

### Modul 040 (Nemovitosti)
- Některé služby (např. úklid) se počítají podle m² jednotky
- `zaklad_pro_vypocet` může být načten z `units.velikost_m2`

---

**Konec dokumentu - Datový model modulu 070** ✅
