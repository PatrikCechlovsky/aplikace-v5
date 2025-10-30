// src/modules/060-smlouva/meta.js
// Metadata definition for Contracts module

export const moduleMeta = {
  id: '060-smlouva',
  title: 'Smlouvy',
  table: 'contracts', // Supabase table name
  
  tiles: [
    { id: 'prehled', title: 'Přehled', icon: 'list' },
    { id: 'aktivni', title: 'Aktivní', icon: 'check_circle' },
    { id: 'koncepty', title: 'Koncepty', icon: 'draft' },
    { id: 'expirujici', title: 'Expirující', icon: 'warning' },
    { id: 'ukoncene', title: 'Ukončené', icon: 'archive' }
  ],
  
  forms: [
    {
      id: 'detail',
      title: 'Detail smlouvy',
      icon: 'visibility',
      fields: [
        { key: 'id', label: 'ID', type: 'text', readOnly: true },
        { key: 'cislo_smlouvy', label: 'Číslo smlouvy', type: 'text', required: true },
        { key: 'stav', label: 'Stav', type: 'select', required: true, options: [
          { value: 'koncept', label: 'Koncept' },
          { value: 'cekajici_podepsani', label: 'Čeká na podpis' },
          { value: 'aktivni', label: 'Aktivní' },
          { value: 'ukoncena', label: 'Ukončená' },
          { value: 'zrusena', label: 'Zrušená' },
          { value: 'propadla', label: 'Propadlá' }
        ]},
        { key: 'landlord_id', label: 'Pronajímatel', type: 'chooser', entity: 'subjects', role: 'pronajimatel' },
        { key: 'tenant_id', label: 'Nájemník', type: 'chooser', entity: 'subjects', role: 'najemnik' },
        { key: 'property_id', label: 'Nemovitost', type: 'chooser', entity: 'properties' },
        { key: 'unit_id', label: 'Jednotka', type: 'chooser', entity: 'units' },
        { key: 'datum_zacatek', label: 'Datum začátku', type: 'date', required: true },
        { key: 'datum_konec', label: 'Datum konce', type: 'date' },
        { key: 'najem_vyse', label: 'Výše nájmu', type: 'number', step: '0.01' },
        { key: 'periodicita_najmu', label: 'Periodicita', type: 'select', options: [
          { value: 'tydenni', label: 'Týdenní' },
          { value: 'mesicni', label: 'Měsíční' },
          { value: 'ctvrtletni', label: 'Čtvrtletní' },
          { value: 'rocni', label: 'Roční' }
        ]},
        { key: 'kauce_potreba', label: 'Kauce požadována', type: 'checkbox' },
        { key: 'kauce_castka', label: 'Výše kauce', type: 'number', step: '0.01' },
        { key: 'stav_kauce', label: 'Stav kauce', type: 'select', options: [
          { value: 'nevyzadovana', label: 'Nevyžadována' },
          { value: 'drzena', label: 'Držena' },
          { value: 'vracena', label: 'Vrácena' },
          { value: 'castecne_vracena', label: 'Částečně vrácena' }
        ]},
        { key: 'poznamky', label: 'Poznámky', type: 'textarea', fullWidth: true },
        { key: 'archived', label: 'Archivováno', type: 'checkbox' },
        { key: 'created_at', label: 'Vytvořeno', type: 'text', readOnly: true },
        { key: 'created_by', label: 'Vytvořil', type: 'text', readOnly: true },
        { key: 'updated_at', label: 'Upraveno', type: 'text', readOnly: true },
        { key: 'updated_by', label: 'Upravil', type: 'text', readOnly: true }
      ]
    },
    {
      id: 'edit',
      title: 'Editace smlouvy',
      icon: 'edit',
      fields: [
        { key: 'cislo_smlouvy', label: 'Číslo smlouvy', type: 'text', required: true },
        { key: 'stav', label: 'Stav', type: 'select', required: true, options: [
          { value: 'koncept', label: 'Koncept' },
          { value: 'cekajici_podepsani', label: 'Čeká na podpis' },
          { value: 'aktivni', label: 'Aktivní' },
          { value: 'ukoncena', label: 'Ukončená' },
          { value: 'zrusena', label: 'Zrušená' },
          { value: 'propadla', label: 'Propadlá' }
        ]},
        { key: 'landlord_id', label: 'Pronajímatel', type: 'chooser', entity: 'subjects', role: 'pronajimatel', required: true },
        { key: 'tenant_id', label: 'Nájemník', type: 'chooser', entity: 'subjects', role: 'najemnik', required: true },
        { key: 'property_id', label: 'Nemovitost', type: 'chooser', entity: 'properties' },
        { key: 'unit_id', label: 'Jednotka', type: 'chooser', entity: 'units', required: true },
        { key: 'datum_zacatek', label: 'Datum začátku', type: 'date', required: true },
        { key: 'datum_konec', label: 'Datum konce', type: 'date' },
        { key: 'najem_vyse', label: 'Výše nájmu (Kč)', type: 'number', step: '0.01', required: true },
        { key: 'periodicita_najmu', label: 'Periodicita', type: 'select', required: true, options: [
          { value: 'tydenni', label: 'Týdenní' },
          { value: 'mesicni', label: 'Měsíční' },
          { value: 'ctvrtletni', label: 'Čtvrtletní' },
          { value: 'rocni', label: 'Roční' }
        ]},
        { key: 'kauce_potreba', label: 'Kauce požadována', type: 'checkbox' },
        { key: 'kauce_castka', label: 'Výše kauce (Kč)', type: 'number', step: '0.01' },
        { key: 'poznamky', label: 'Poznámky', type: 'textarea', fullWidth: true }
      ]
    },
    {
      id: 'predavaci-protokol',
      title: 'Předávací protokol',
      icon: 'assignment',
      fields: [
        { key: 'contract_id', label: 'ID smlouvy', type: 'text', readOnly: true },
        { key: 'datum_predani', label: 'Datum předání', type: 'date', required: true },
        { key: 'typ_protokolu', label: 'Typ protokolu', type: 'select', required: true, options: [
          { value: 'predani', label: 'Předání' },
          { value: 'vraceni', label: 'Vrácení' }
        ]},
        { key: 'stav_jednotky', label: 'Stav jednotky', type: 'textarea', fullWidth: true },
        { key: 'meraky_stav', label: 'Stavy měřáků', type: 'textarea' },
        { key: 'poznamky', label: 'Poznámky', type: 'textarea', fullWidth: true }
      ]
    }
  ]
};

export default moduleMeta;
