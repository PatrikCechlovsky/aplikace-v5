// src/db/type-schemas.js
// Shared type schemas for subjects (pronajimatel, najemnik) and other entities
// This eliminates duplication across modules

/**
 * Subject type schemas - used by modules 030 (pronajimatel) and 050 (najemnik)
 * Each type defines the form fields for that subject type
 */
export const SUBJECT_TYPE_SCHEMAS = {
  osoba: [
    { key: 'display_name', label: 'Tituly / Jméno', type: 'text', required: true },
    { key: 'jmeno', label: 'Křestní', type: 'text' },
    { key: 'prijmeni', label: 'Příjmení', type: 'text' },
    { key: 'typ_dokladu', label: 'Typ dokladu', type: 'select', options: [{value:'op',label:'Občanský průkaz'},{value:'pas',label:'Pas'},{value:'rid',label:'ŘP'}] },
    { key: 'cislo_dokladu', label: 'Číslo dokladu', type: 'text' },
    { key: 'telefon', label: 'Telefon', type: 'text' },
    { key: 'email', label: 'E-mail', type: 'email' },
    { key: 'street', label: 'Ulice', type: 'text' },
    { key: 'cislo_popisne', label: 'Číslo popisné', type: 'text' },
    { key: 'city', label: 'Město', type: 'text' },
    { key: 'zip', label: 'PSČ', type: 'text' }
  ],
  osvc: [
    { key: 'display_name', label: 'Jméno / Firma', type: 'text', required: true },
    { key: 'ico', label: 'IČO', type: 'text' },
    { key: 'dic', label: 'DIČ', type: 'text' },
    { key: 'telefon', label: 'Telefon', type: 'text' },
    { key: 'email', label: 'E-mail', type: 'email' }
  ],
  firma: [
    { key: 'display_name', label: 'Název firmy', type: 'text', required: true },
    { key: 'ico', label: 'IČO', type: 'text' },
    { key: 'dic', label: 'DIČ', type: 'text' },
    { key: 'primary_phone', label: 'Telefon', type: 'text' },
    { key: 'primary_email', label: 'E-mail', type: 'email' },
    { key: 'street', label: 'Ulice', type: 'text' },
    { key: 'cislo_popisne', label: 'Číslo popisné', type: 'text' },
    { key: 'city', label: 'Město', type: 'text' },
    { key: 'zip', label: 'PSČ', type: 'text' }
  ],
  spolek: [
    { key: 'display_name', label: 'Název spolku', type: 'text', required: true },
    { key: 'primary_email', label: 'Kontakt (e-mail)', type: 'email' },
    { key: 'telefon', label: 'Telefon', type: 'text' }
  ],
  stat: [
    { key: 'display_name', label: 'Organizace', type: 'text', required: true },
    { key: 'primary_email', label: 'Kontakt (e-mail)', type: 'email' }
  ],
  zastupce: [
    { key: 'display_name', label: 'Jméno zástupce', type: 'text', required: true },
    { key: 'zastupuje_id', label: 'Zastupuje (ID subjektu)', type: 'text' },
    { key: 'telefon', label: 'Telefon', type: 'text' },
    { key: 'email', label: 'E-mail', type: 'email' }
  ]
};

/**
 * Property schema - used by module 040 (nemovitost)
 * Basic property information schema
 */
export const PROPERTY_SCHEMA = [
  { key: 'title', label: 'Název nemovitosti *', type: 'text', required: true },
  { key: 'property_type', label: 'Typ nemovitosti', type: 'select', required: true, 
    options: [
      {value:'byt',label:'Byt'},
      {value:'dum',label:'Dům'},
      {value:'pozemek',label:'Pozemek'},
      {value:'garaz',label:'Garáž'},
      {value:'komercni',label:'Komerční prostor'},
      {value:'jine',label:'Jiné'}
    ] 
  },
  { key: 'street', label: 'Ulice', type: 'text', required: true },
  { key: 'house_number', label: 'Číslo popisné', type: 'text', required: true },
  { key: 'city', label: 'Město', type: 'text', required: true },
  { key: 'zip', label: 'PSČ', type: 'text', required: true },
  { key: 'area', label: 'Plocha (m²)', type: 'number' },
  { key: 'floor', label: 'Patro', type: 'text' },
  { key: 'description', label: 'Popis', type: 'textarea', fullWidth: true },
  { key: 'note', label: 'Poznámka', type: 'textarea', fullWidth: true }
];

/**
 * Get schema for a specific subject type
 * @param {string} type - The subject type (osoba, osvc, firma, spolek, stat, zastupce)
 * @returns {Array} The schema fields for the type, or osoba schema as fallback
 */
export function getSubjectTypeSchema(type) {
  return SUBJECT_TYPE_SCHEMAS[type] || SUBJECT_TYPE_SCHEMAS['osoba'];
}

/**
 * Get all available subject types
 * @returns {Array<string>} Array of subject type keys
 */
export function getSubjectTypes() {
  return Object.keys(SUBJECT_TYPE_SCHEMAS);
}

/**
 * Get property schema
 * @returns {Array} The property schema fields
 */
export function getPropertySchema() {
  return PROPERTY_SCHEMA;
}
