# Úkol 09: Automatické vytvoření jednotky při zakládání nové nemovitosti

## 📋 Popis
Při vytváření nové nemovitosti se automaticky vytvoří jedna „defaultní" jednotka odpovídající typu nemovitosti. Uživatel může jednotku editovat, archivovat, odstranit a přidat další jednotky kdykoliv v budoucnu.

## 🎯 Cíl
Zjednodušit proces vytváření nemovitostí a zajistit že každá nemovitost má alespoň jednu jednotku.

## ✅ Akceptační kritéria
- [ ] Při vytvoření nemovitosti se automaticky vytvoří defaultní jednotka
- [ ] Jednotka má stejný typ jako nemovitost (nebo logicky odpovídající)
- [ ] Vytvoření probíhá v jedné databázové transakci
- [ ] Při chybě se rollbackne celá operace
- [ ] Uživatel může jednotku upravit nebo smazat
- [ ] Uživatel může přidat další jednotky

## 📁 Dotčený modul
- [ ] 040-nemovitost

## 🔧 Implementační kroky

### 1. Mapping typu nemovitosti na typ jednotky

#### 1.1 Vytvořit helper funkci
V `/src/modules/040-nemovitost/services/utils.js`:

```javascript
/**
 * Určí defaultní typ jednotky podle typu nemovitosti
 * @param {string} propertyType - Typ nemovitosti
 * @returns {string} Typ jednotky
 */
export function getDefaultUnitType(propertyType) {
  const mapping = {
    'byt': 'byt',           // Byt → Byt
    'dum': 'dum',           // Dům → Dům
    'garaz': 'garaz',       // Garáž → Garáž
    'pozemek': 'pozemek_cast', // Pozemek → Část pozemku
    'komercni': 'kancelar',    // Komerční → Kancelář
    'ostatni': 'ostatni'       // Ostatní → Ostatní
  };
  
  return mapping[propertyType] || 'ostatni';
}

/**
 * Vytvoří defaultní název jednotky
 * @param {string} propertyName - Název nemovitosti
 * @param {string} unitType - Typ jednotky
 * @returns {string} Název jednotky
 */
export function getDefaultUnitName(propertyName, unitType) {
  const typeLabels = {
    'byt': 'Byt',
    'dum': 'Dům',
    'garaz': 'Garáž',
    'pozemek_cast': 'Pozemek',
    'kancelar': 'Kancelář',
    'ostatni': 'Jednotka'
  };
  
  const label = typeLabels[unitType] || 'Jednotka';
  return `${label} - ${propertyName}`;
}
```

### 2. Implementovat transakční vytvoření

#### 2.1 Rozšířit DB service
V `/src/modules/040-nemovitost/services/db.js`:

```javascript
/**
 * Vytvoří nemovitost s defaultní jednotkou v jedné transakci
 * @param {Object} propertyData - Data nemovitosti
 * @returns {Promise<{property: Object, unit: Object}>}
 */
export async function createPropertyWithUnit(propertyData) {
  // Začít transakci pomocí Supabase RPC funkce
  // NEBO použít dva inserty a při chybě rollback
  
  try {
    // 1. Vytvořit nemovitost
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .insert(propertyData)
      .select()
      .single();
    
    if (propertyError) throw propertyError;
    
    // 2. Vytvořit defaultní jednotku
    const unitType = getDefaultUnitType(property.typ);
    const unitName = getDefaultUnitName(property.nazev, unitType);
    
    const unitData = {
      nemovitost_id: property.id,
      typ: unitType,
      nazev: unitName,
      popis: 'Automaticky vytvořená jednotka',
      stav: 'volna',
      // Zkopírovat relevantní údaje z nemovitosti
      plocha: property.celkova_plocha,
      // Další pole podle potřeby...
    };
    
    const { data: unit, error: unitError } = await supabase
      .from('units')
      .insert(unitData)
      .select()
      .single();
    
    if (unitError) {
      // Rollback - smazat vytvořenou nemovitost
      await supabase
        .from('properties')
        .delete()
        .eq('id', property.id);
      
      throw unitError;
    }
    
    return { property, unit };
    
  } catch (error) {
    console.error('Error creating property with unit:', error);
    throw error;
  }
}
```

#### 2.2 Alternativa: Použít Supabase RPC funkci

Vytvořit PostgreSQL funkci pro atomickou operaci:

```sql
-- Database function pro transakční vytvoření
CREATE OR REPLACE FUNCTION create_property_with_unit(
  p_property JSONB,
  p_unit JSONB DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_property properties;
  v_unit units;
  v_result JSONB;
BEGIN
  -- Vytvořit nemovitost
  INSERT INTO properties 
  SELECT * FROM jsonb_populate_record(NULL::properties, p_property)
  RETURNING * INTO v_property;
  
  -- Vytvořit defaultní jednotku pokud nebyla poskytnuta
  IF p_unit IS NULL THEN
    p_unit := jsonb_build_object(
      'nemovitost_id', v_property.id,
      'typ', get_default_unit_type(v_property.typ),
      'nazev', v_property.nazev || ' - Jednotka',
      'stav', 'volna'
    );
  ELSE
    -- Přidat nemovitost_id
    p_unit := p_unit || jsonb_build_object('nemovitost_id', v_property.id);
  END IF;
  
  -- Vytvořit jednotku
  INSERT INTO units
  SELECT * FROM jsonb_populate_record(NULL::units, p_unit)
  RETURNING * INTO v_unit;
  
  -- Vrátit oba objekty jako JSONB
  v_result := jsonb_build_object(
    'property', row_to_json(v_property),
    'unit', row_to_json(v_unit)
  );
  
  RETURN v_result;
END;
$$;

-- Helper funkce pro určení typu jednotky
CREATE OR REPLACE FUNCTION get_default_unit_type(p_property_type property_type)
RETURNS unit_type
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN CASE p_property_type
    WHEN 'byt' THEN 'byt'::unit_type
    WHEN 'dum' THEN 'dum'::unit_type
    WHEN 'garaz' THEN 'garaz'::unit_type
    WHEN 'pozemek' THEN 'pozemek_cast'::unit_type
    WHEN 'komercni' THEN 'kancelar'::unit_type
    ELSE 'ostatni'::unit_type
  END;
END;
$$;
```

Pak v JS kódu:

```javascript
export async function createPropertyWithUnit(propertyData) {
  const { data, error } = await supabase
    .rpc('create_property_with_unit', {
      p_property: propertyData,
      p_unit: null // NULL = vytvoří se defaultní jednotka
    });
  
  if (error) throw error;
  
  return {
    property: data.property,
    unit: data.unit
  };
}
```

### 3. Aktualizovat formulář pro vytváření nemovitosti

#### 3.1 Upravit forms/edit.js
V `/src/modules/040-nemovitost/forms/edit.js`:

```javascript
import { createPropertyWithUnit } from '../services/db.js';

async function handleSubmit(formData) {
  try {
    // Validace dat
    // ...
    
    // Pokud je nová nemovitost (nemá ID)
    if (!formData.id) {
      // Použít funkci která vytvoří nemovitost + jednotku
      const result = await createPropertyWithUnit(formData);
      
      // Zobrazit úspěšnou zprávu
      showNotification('success', 
        `Nemovitost "${result.property.nazev}" byla vytvořena včetně defaultní jednotky.`
      );
      
      // Navigovat na detail nemovitosti
      window.location.hash = `#040-nemovitost/detail?id=${result.property.id}`;
      
    } else {
      // Editace existující nemovitosti - použít standardní update
      const property = await updateProperty(formData.id, formData);
      
      showNotification('success', 'Nemovitost byla aktualizována.');
      window.location.hash = `#040-nemovitost/detail?id=${property.id}`;
    }
    
  } catch (error) {
    console.error('Error saving property:', error);
    showNotification('error', 'Chyba při ukládání nemovitosti: ' + error.message);
  }
}
```

### 4. Zobrazit vytvořenou jednotku v detailu

#### 4.1 Upravit forms/detail.js

```javascript
import { getProperty } from '../services/db.js';
import { listUnits } from '../services/db.js';

export async function render(container, params) {
  const propertyId = params.id;
  
  // Načíst nemovitost
  const property = await getProperty(propertyId);
  
  // Načíst jednotky
  const units = await listUnits(propertyId);
  
  // Vykreslit detail nemovitosti
  renderPropertyDetail(container, property);
  
  // Vykreslit seznam jednotek
  const unitsSection = document.createElement('div');
  unitsSection.className = 'units-section';
  unitsSection.innerHTML = '<h3>Jednotky</h3>';
  
  if (units.length === 0) {
    unitsSection.innerHTML += '<p>Žádné jednotky</p>';
  } else {
    const unitsTable = renderUnitsTable(units);
    unitsSection.appendChild(unitsTable);
  }
  
  // Tlačítko pro přidání další jednotky
  const addUnitBtn = document.createElement('button');
  addUnitBtn.textContent = 'Přidat jednotku';
  addUnitBtn.className = 'btn btn-primary';
  addUnitBtn.addEventListener('click', () => {
    window.location.hash = `#040-nemovitost/jednotka-edit?nemovitost_id=${propertyId}`;
  });
  unitsSection.appendChild(addUnitBtn);
  
  container.appendChild(unitsSection);
}
```

### 5. Možnost upravit nebo smazat jednotku

#### 5.1 Přidat akce v tabulce jednotek

```javascript
function renderUnitsTable(units) {
  return renderTable({
    columns: [
      { key: 'typ', label: 'Typ', render: (v) => renderBadge(v, unitTypeBadges) },
      { key: 'nazev', label: 'Název' },
      { key: 'stav', label: 'Stav', render: (v) => renderBadge(v, unitStatusBadges) },
      { key: 'plocha', label: 'Plocha', render: (v) => formatArea(v) },
      { 
        key: 'actions', 
        label: 'Akce',
        render: (v, row) => `
          <button onclick="editUnit('${row.id}')" class="btn-icon" title="Upravit">
            <i class="icon-edit"></i>
          </button>
          <button onclick="deleteUnit('${row.id}')" class="btn-icon" title="Smazat">
            <i class="icon-trash"></i>
          </button>
        `
      }
    ],
    data: units
  });
}

window.editUnit = (unitId) => {
  window.location.hash = `#040-nemovitost/jednotka-edit?id=${unitId}`;
};

window.deleteUnit = async (unitId) => {
  if (!confirm('Opravdu chcete smazat tuto jednotku?')) return;
  
  try {
    await supabase.from('units').delete().eq('id', unitId);
    showNotification('success', 'Jednotka byla smazána');
    // Reload stránky
    location.reload();
  } catch (error) {
    showNotification('error', 'Chyba při mazání jednotky: ' + error.message);
  }
};
```

## 📝 Checklist implementace

### Database
- [ ] Vytvořit helper funkci `get_default_unit_type()` v PostgreSQL
- [ ] Vytvořit RPC funkci `create_property_with_unit()` (volitelné)
- [ ] Otestovat transakční vytvoření

### Services
- [ ] Implementovat `getDefaultUnitType()` v utils.js
- [ ] Implementovat `getDefaultUnitName()` v utils.js
- [ ] Implementovat `createPropertyWithUnit()` v db.js
- [ ] Přidat error handling

### Forms
- [ ] Aktualizovat `forms/edit.js` pro použití `createPropertyWithUnit()`
- [ ] Aktualizovat `forms/detail.js` pro zobrazení jednotek
- [ ] Přidat tlačítko "Přidat jednotku"

### UI
- [ ] Zobrazit vytvořenou jednotku v detailu nemovitosti
- [ ] Přidat možnost upravit jednotku
- [ ] Přidat možnost smazat jednotku
- [ ] Zobrazit notifikaci o vytvoření

### Testování
- [ ] Test: Vytvořit nemovitost → automaticky se vytvoří jednotka
- [ ] Test: Zkontrolovat že jednotka má správný typ
- [ ] Test: Upravit jednotku
- [ ] Test: Smazat jednotku
- [ ] Test: Přidat další jednotku
- [ ] Test: Rollback při chybě

## 📝 Reference
- **Task 08:** Datový model pro modul 040
- **Specifikace:** `/src/modules/040-nemovitost/assets/datovy-model.md`
- **Checklist:** `/src/modules/040-nemovitost/assets/checklist.md`

## 🔗 Související úkoly
- Task 08: Datový model
- Task 06: Unified creation flow

## ⏱️ Odhadovaný čas
- **Helper funkce:** 30-45 minut
- **Database funkce:** 1-2 hodiny
- **Frontend integrace:** 1-2 hodiny
- **Testování:** 1 hodina
- **Celkem:** 3-5 hodin

## 📊 Priority
**VYSOKÁ** - Klíčová funkce pro zjednodušení workflow.

## ✅ Ověření
Po dokončení ověřit:
1. Při vytvoření nemovitosti se automaticky vytvoří jednotka
2. Jednotka má správný typ a název
3. Jednotka je viditelná v detailu nemovitosti
4. Jednotku lze upravit
5. Jednotku lze smazat
6. Lze přidat další jednotky
7. Při chybě se rollbackne celá operace
8. Zobrazují se správné notifikace
