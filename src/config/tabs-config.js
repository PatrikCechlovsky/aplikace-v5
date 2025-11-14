/**
 * Unified Tab Configuration
 * Based on docs/excel-pro-moduly-ouska-seznamy-formulare.xlsx
 * Defines tabs for all entities following the structure:
 * Pronajímatel • Nemovitost • Jednotka • Nájemníci • Smlouvy • Platby • Dokumenty
 */

/**
 * Get tab configuration for a specific entity
 * @param {string} entityCode - Entity code (LORD, PROP, UNIT, TEN, AGR, PAY, DOC)
 * @param {string} entityId - Current entity ID
 * @returns {Array} Array of tab configurations
 */
export function getTabsForEntity(entityCode, entityId) {
  const baseConfig = {
    LORD: {
      tabOrder: 1,
      label: 'Pronajímatel',
      icon: '👤',
      entityCode: 'LORD',
      module: '030-pronajimatel'
    },
    PROP: {
      tabOrder: 2,
      label: 'Nemovitost',
      icon: '🏢',
      entityCode: 'PROP',
      module: '040-nemovitost'
    },
    UNIT: {
      tabOrder: 3,
      label: 'Jednotka',
      icon: '🚪',
      entityCode: 'UNIT',
      module: '040-nemovitost'
    },
    TEN: {
      tabOrder: 4,
      label: 'Nájemníci',
      icon: '👥',
      entityCode: 'TEN',
      module: '050-najemnik'
    },
    AGR: {
      tabOrder: 5,
      label: 'Smlouvy',
      icon: '📝',
      entityCode: 'AGR',
      module: '060-smlouva'
    },
    PAY: {
      tabOrder: 6,
      label: 'Platby',
      icon: '💰',
      entityCode: 'PAY',
      module: '080-platby'
    },
    DOC: {
      tabOrder: 7,
      label: 'Dokumenty',
      icon: '📄',
      entityCode: 'DOC',
      module: '120-dokumenty'
    }
  };

  const tabs = [];

  // Add all 7 tabs in order
  Object.keys(baseConfig).forEach(code => {
    const config = baseConfig[code];
    
    if (code === entityCode) {
      // Current entity - show detail form
      tabs.push({
        ...config,
        tabType: 'detail',
        tabCode: `tab-${entityCode.toLowerCase()}-${code.toLowerCase()}`,
        defaultFormCode: `form-${code.toLowerCase()}-detail`,
        isActive: true
      });
    } else {
      // Related entity - show relation list
      tabs.push({
        ...config,
        tabType: 'relation-list',
        tabCode: `tab-${entityCode.toLowerCase()}-${code.toLowerCase()}`,
        defaultListCode: getListCodeForRelation(entityCode, code),
        isActive: false
      });
    }
  });

  return tabs.sort((a, b) => a.tabOrder - b.tabOrder);
}

/**
 * Get the appropriate list code for a relation between entities
 * @param {string} sourceEntity - Source entity code
 * @param {string} targetEntity - Target entity code
 * @returns {string} List code
 */
function getListCodeForRelation(sourceEntity, targetEntity) {
  // Map based on Excel sheet "2_Seznamy"
  const relationMap = {
    'LORD-PROP': 'list-prop-by-lord',
    'LORD-UNIT': 'list-unit-all', // indirect via properties
    'LORD-TEN': 'list-ten-all', // all tenants
    'LORD-AGR': 'list-agr-all', // all contracts
    'LORD-PAY': 'list-pay-all', // all payments
    'LORD-DOC': 'list-doc-by-any',
    
    'PROP-LORD': 'list-lord-all',
    'PROP-UNIT': 'list-unit-by-prop',
    'PROP-TEN': 'list-ten-all', // tenants in units
    'PROP-AGR': 'list-agr-all', // contracts for units
    'PROP-PAY': 'list-pay-all', // payments for units
    'PROP-DOC': 'list-doc-by-any',
    
    'UNIT-LORD': 'list-lord-all',
    'UNIT-PROP': 'list-prop-all', // parent property
    'UNIT-TEN': 'list-ten-all', // tenant of unit
    'UNIT-AGR': 'list-agr-by-unit',
    'UNIT-PAY': 'list-pay-all', // via contracts
    'UNIT-DOC': 'list-doc-by-any',
    
    'TEN-LORD': 'list-lord-all',
    'TEN-PROP': 'list-prop-all',
    'TEN-UNIT': 'list-unit-all', // units rented
    'TEN-AGR': 'list-agr-all', // tenant's contracts
    'TEN-PAY': 'list-pay-all', // tenant's payments
    'TEN-DOC': 'list-doc-by-any',
    
    'AGR-LORD': 'list-lord-all',
    'AGR-PROP': 'list-prop-all',
    'AGR-UNIT': 'list-unit-all', // contracted unit
    'AGR-TEN': 'list-ten-all', // tenant on contract
    'AGR-PAY': 'list-pay-by-agr',
    'AGR-DOC': 'list-doc-by-any',
    
    'PAY-LORD': 'list-lord-all',
    'PAY-PROP': 'list-prop-all',
    'PAY-UNIT': 'list-unit-all',
    'PAY-TEN': 'list-ten-all',
    'PAY-AGR': 'list-agr-all', // related contract
    'PAY-DOC': 'list-doc-by-any',
    
    'DOC-LORD': 'list-lord-all',
    'DOC-PROP': 'list-prop-all',
    'DOC-UNIT': 'list-unit-all',
    'DOC-TEN': 'list-ten-all',
    'DOC-AGR': 'list-agr-all',
    'DOC-PAY': 'list-pay-all'
  };

  const key = `${sourceEntity}-${targetEntity}`;
  return relationMap[key] || `list-${targetEntity.toLowerCase()}-all`;
}

/**
 * Get column configuration for a list
 * @param {string} listCode - List code from Excel
 * @returns {Array} Column configuration
 */
export function getColumnsForList(listCode) {
  const columnConfig = {
    'list-lord-all': [
      { key: 'display_name', label: 'Název / Jméno', field: 'display_name' },
      { key: 'typ_subjektu', label: 'Typ', field: 'typ_subjektu' },
      { key: 'ico', label: 'IČO', field: 'ico' },
      { key: 'mesto', label: 'Město', field: 'mesto' },
      { key: 'primary_email', label: 'Email', field: 'primary_email' }
    ],
    'list-prop-all': [
      { key: 'nazev', label: 'Název', field: 'nazev' },
      { key: 'typ_nemovitosti', label: 'Typ', field: 'typ_nemovitosti' },
      { key: 'mesto', label: 'Město', field: 'mesto' },
      { key: 'ulice', label: 'Ulice', field: 'ulice' },
      { key: 'pocet_jednotek', label: 'Jednotky', field: 'pocet_jednotek' }
    ],
    'list-unit-all': [
      { key: 'oznaceni', label: 'Označení', field: 'oznaceni' },
      { key: 'typ_jednotky', label: 'Typ', field: 'typ_jednotky' },
      { key: 'plocha', label: 'Plocha (m²)', field: 'plocha' },
      { key: 'dispozice', label: 'Dispozice', field: 'dispozice' },
      { key: 'stav', label: 'Stav', field: 'stav' }
    ],
    'list-ten-all': [
      { key: 'display_name', label: 'Jméno', field: 'display_name' },
      { key: 'typ_subjektu', label: 'Typ', field: 'typ_subjektu' },
      { key: 'primary_email', label: 'Email', field: 'primary_email' },
      { key: 'telefon', label: 'Telefon', field: 'telefon' },
      { key: 'mesto', label: 'Město', field: 'mesto' }
    ],
    'list-agr-all': [
      { key: 'contract_number', label: 'Číslo smlouvy', field: 'contract_number' },
      { key: 'tenant_name', label: 'Nájemník', field: 'tenant_name' },
      { key: 'date_from', label: 'Platnost od', field: 'date_from' },
      { key: 'date_to', label: 'Platnost do', field: 'date_to' },
      { key: 'status', label: 'Stav', field: 'status' }
    ],
    'list-pay-all': [
      { key: 'payment_date', label: 'Datum', field: 'payment_date' },
      { key: 'amount', label: 'Částka', field: 'amount' },
      { key: 'type', label: 'Typ', field: 'type' },
      { key: 'status', label: 'Stav', field: 'status' },
      { key: 'description', label: 'Popis', field: 'description' }
    ],
    'list-doc-all': [
      { key: 'name', label: 'Název', field: 'name' },
      { key: 'type', label: 'Typ', field: 'type' },
      { key: 'size', label: 'Velikost', field: 'size' },
      { key: 'created_at', label: 'Vytvořeno', field: 'created_at' }
    ]
  };

  // Return the configuration or default columns
  return columnConfig[listCode] || [
    { key: 'id', label: 'ID', field: 'id' },
    { key: 'name', label: 'Název', field: 'name' },
    { key: 'created_at', label: 'Vytvořeno', field: 'created_at' }
  ];
}

export default {
  getTabsForEntity,
  getColumnsForList
};
