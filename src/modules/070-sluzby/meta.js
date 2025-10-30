// src/modules/070-sluzby/meta.js
// Metadata definition for Services module

export const moduleMeta = {
  id: '070-sluzby',
  title: 'Služby',
  table: 'service_definitions', // Supabase table name
  
  tiles: [
    { id: 'prehled', title: 'Přehled', icon: 'list' },
    { id: 'katalog', title: 'Katalog služeb', icon: 'list_alt' },
    { id: 'energie', title: 'Energie', icon: 'bolt' },
    { id: 'voda', title: 'Voda', icon: 'water_drop' },
    { id: 'internet', title: 'Internet', icon: 'wifi' },
    { id: 'spravne-poplatky', title: 'Správné poplatky', icon: 'account_balance' }
  ],
  
  forms: [
    {
      id: 'detail',
      title: 'Detail služby',
      icon: 'visibility',
      fields: [
        { key: 'id', label: 'ID', type: 'text', readOnly: true },
        { key: 'kod', label: 'Kód služby', type: 'text', required: true },
        { key: 'nazev', label: 'Název služby', type: 'text', required: true },
        { key: 'kategorie', label: 'Kategorie', type: 'select', required: true, options: [
          { value: 'energie', label: 'Energie' },
          { value: 'voda', label: 'Voda' },
          { value: 'plyn', label: 'Plyn' },
          { value: 'internet', label: 'Internet' },
          { value: 'telefon', label: 'Telefon' },
          { value: 'TV', label: 'Televize' },
          { value: 'vytapeni', label: 'Vytápění' },
          { value: 'teplota_voda', label: 'Teplá voda' },
          { value: 'odpady', label: 'Odpady' },
          { value: 'spravne_poplatky', label: 'Správné poplatky' },
          { value: 'pojisteni', label: 'Pojištění' },
          { value: 'jine', label: 'Jiné' }
        ]},
        { key: 'popis', label: 'Popis', type: 'textarea', fullWidth: true },
        { key: 'typ_uctovani', label: 'Typ účtování', type: 'select', required: true, options: [
          { value: 'pevna_sazba', label: 'Pevná sazba' },
          { value: 'merena_spotreba', label: 'Měřená spotřeba' },
          { value: 'na_pocet_osob', label: 'Dle počtu osob' },
          { value: 'na_m2', label: 'Dle m²' },
          { value: 'procento_z_najmu', label: 'Procento z nájmu' }
        ]},
        { key: 'jednotka', label: 'Jednotka', type: 'text' },
        { key: 'zakladni_cena', label: 'Základní cena', type: 'number', step: '0.01' },
        { key: 'sazba_dph', label: 'DPH sazba (0.21 = 21%)', type: 'number', step: '0.01' },
        { key: 'aktivni', label: 'Aktivní', type: 'checkbox' },
        { key: 'poznamky', label: 'Poznámky', type: 'textarea', fullWidth: true },
        { key: 'created_at', label: 'Vytvořeno', type: 'text', readOnly: true },
        { key: 'created_by', label: 'Vytvořil', type: 'text', readOnly: true },
        { key: 'updated_at', label: 'Upraveno', type: 'text', readOnly: true },
        { key: 'updated_by', label: 'Upravil', type: 'text', readOnly: true }
      ]
    },
    {
      id: 'edit',
      title: 'Editace služby',
      icon: 'edit',
      fields: [
        { key: 'kod', label: 'Kód služby', type: 'text', required: true, 
          helpText: 'Jedinečný kód služby (např. ELEK, VODA, PLYN)' },
        { key: 'nazev', label: 'Název služby', type: 'text', required: true },
        { key: 'kategorie', label: 'Kategorie', type: 'select', required: true, options: [
          { value: 'energie', label: 'Energie' },
          { value: 'voda', label: 'Voda' },
          { value: 'plyn', label: 'Plyn' },
          { value: 'internet', label: 'Internet' },
          { value: 'telefon', label: 'Telefon' },
          { value: 'TV', label: 'Televize' },
          { value: 'vytapeni', label: 'Vytápění' },
          { value: 'teplota_voda', label: 'Teplá voda' },
          { value: 'odpady', label: 'Odpady' },
          { value: 'spravne_poplatky', label: 'Správné poplatky' },
          { value: 'pojisteni', label: 'Pojištění' },
          { value: 'jine', label: 'Jiné' }
        ]},
        { key: 'popis', label: 'Popis', type: 'textarea', fullWidth: true },
        { key: 'typ_uctovani', label: 'Typ účtování', type: 'select', required: true, options: [
          { value: 'pevna_sazba', label: 'Pevná sazba' },
          { value: 'merena_spotreba', label: 'Měřená spotřeba' },
          { value: 'na_pocet_osob', label: 'Dle počtu osob' },
          { value: 'na_m2', label: 'Dle m²' },
          { value: 'procento_z_najmu', label: 'Procento z nájmu' }
        ]},
        { key: 'jednotka', label: 'Jednotka', type: 'text', 
          helpText: 'Např. kWh, m³, paušál, měsíc' },
        { key: 'zakladni_cena', label: 'Základní cena (Kč)', type: 'number', step: '0.01' },
        { key: 'sazba_dph', label: 'DPH sazba (0.21 = 21%)', type: 'number', step: '0.01' },
        { key: 'aktivni', label: 'Aktivní', type: 'checkbox' },
        { key: 'poznamky', label: 'Poznámky', type: 'textarea', fullWidth: true }
      ]
    },
    {
      id: 'pridat-do-smlouvy',
      title: 'Přidat službu do smlouvy',
      icon: 'add_circle',
      fields: [
        { key: 'contract_id', label: 'ID smlouvy', type: 'text', readOnly: true },
        { key: 'service_definition_id', label: 'Služba', type: 'chooser', entity: 'service_definitions', required: true },
        { key: 'mnozstvi', label: 'Množství', type: 'number', step: '0.01' },
        { key: 'cena_za_jednotku', label: 'Cena za jednotku', type: 'number', step: '0.01' },
        { key: 'pausal', label: 'Paušál', type: 'checkbox' },
        { key: 'poznamky', label: 'Poznámky', type: 'textarea', fullWidth: true }
      ]
    }
  ]
};

export default moduleMeta;
