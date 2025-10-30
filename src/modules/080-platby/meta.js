// src/modules/080-platby/meta.js
// Metadata definition for Payments module

export const moduleMeta = {
  id: '080-platby',
  title: 'Platby',
  table: 'payments', // Supabase table name
  
  tiles: [
    { id: 'prehled', title: 'Přehled', icon: 'list' },
    { id: 'prijate', title: 'Přijaté platby', icon: 'south' },
    { id: 'cekajici', title: 'Čekající na zpracování', icon: 'schedule' },
    { id: 'pouzite', title: 'Použité', icon: 'check_circle' },
    { id: 'vratky', title: 'Vrácené platby', icon: 'undo' }
  ],
  
  forms: [
    {
      id: 'detail',
      title: 'Detail platby',
      icon: 'visibility',
      fields: [
        { key: 'id', label: 'ID', type: 'text', readOnly: true },
        { key: 'cislo_platby', label: 'Číslo platby', type: 'text' },
        { key: 'amount', label: 'Částka', type: 'number', step: '0.01', required: true },
        { key: 'payment_date', label: 'Datum platby', type: 'date', required: true },
        { key: 'payment_type', label: 'Typ platby', type: 'select', required: true, options: [
          { value: 'prevodem', label: 'Převodem' },
          { value: 'hotove', label: 'Hotově' },
          { value: 'kartou', label: 'Kartou' },
          { value: 'jine', label: 'Jiné' }
        ]},
        { key: 'status', label: 'Stav', type: 'select', required: true, options: [
          { value: 'prijata', label: 'Přijatá' },
          { value: 'ceka_na_zpracovani', label: 'Čeká na zpracování' },
          { value: 'alokovana', label: 'Alokovaná' },
          { value: 'vracena', label: 'Vrácená' },
          { value: 'storno', label: 'Storno' }
        ]},
        { key: 'contract_id', label: 'Smlouva', type: 'chooser', entity: 'contracts' },
        { key: 'party_id', label: 'Strana', type: 'chooser', entity: 'subjects' },
        { key: 'variabilni_symbol', label: 'Variabilní symbol', type: 'text' },
        { key: 'specificky_symbol', label: 'Specifický symbol', type: 'text' },
        { key: 'konstantni_symbol', label: 'Konstantní symbol', type: 'text' },
        { key: 'poznamky', label: 'Poznámky', type: 'textarea', fullWidth: true },
        { key: 'created_at', label: 'Vytvořeno', type: 'text', readOnly: true },
        { key: 'created_by', label: 'Vytvořil', type: 'text', readOnly: true },
        { key: 'updated_at', label: 'Upraveno', type: 'text', readOnly: true },
        { key: 'updated_by', label: 'Upravil', type: 'text', readOnly: true }
      ]
    },
    {
      id: 'edit',
      title: 'Vložit platbu',
      icon: 'add',
      fields: [
        { key: 'cislo_platby', label: 'Číslo platby', type: 'text', 
          helpText: 'Interní číslo platby pro evidenci' },
        { key: 'amount', label: 'Částka (Kč)', type: 'number', step: '0.01', required: true },
        { key: 'payment_date', label: 'Datum platby', type: 'date', required: true },
        { key: 'payment_type', label: 'Typ platby', type: 'select', required: true, options: [
          { value: 'prevodem', label: 'Převodem' },
          { value: 'hotove', label: 'Hotově' },
          { value: 'kartou', label: 'Kartou' },
          { value: 'jine', label: 'Jiné' }
        ]},
        { key: 'status', label: 'Stav', type: 'select', required: true, options: [
          { value: 'prijata', label: 'Přijatá' },
          { value: 'ceka_na_zpracovani', label: 'Čeká na zpracování' },
          { value: 'alokovana', label: 'Alokovaná' },
          { value: 'vracena', label: 'Vrácená' },
          { value: 'storno', label: 'Storno' }
        ]},
        { key: 'contract_id', label: 'Smlouva', type: 'chooser', entity: 'contracts',
          helpText: 'Vyberte smlouvu, ke které se platba vztahuje' },
        { key: 'party_id', label: 'Plátce', type: 'chooser', entity: 'subjects', required: true,
          helpText: 'Vyberte plátce (nájemník nebo pronajímatel)' },
        { key: 'variabilni_symbol', label: 'Variabilní symbol', type: 'text' },
        { key: 'specificky_symbol', label: 'Specifický symbol', type: 'text' },
        { key: 'konstantni_symbol', label: 'Konstantní symbol', type: 'text' },
        { key: 'poznamky', label: 'Poznámky', type: 'textarea', fullWidth: true }
      ]
    },
    {
      id: 'alokace',
      title: 'Alokace platby',
      icon: 'account_tree',
      fields: [
        { key: 'payment_id', label: 'ID platby', type: 'text', readOnly: true },
        { key: 'allocation_type', label: 'Typ alokace', type: 'select', required: true, options: [
          { value: 'najem', label: 'Nájem' },
          { value: 'kauce', label: 'Kauce' },
          { value: 'sluzby', label: 'Služby' },
          { value: 'poplatek', label: 'Poplatek' },
          { value: 'penale', label: 'Penále' },
          { value: 'jine', label: 'Jiné' }
        ]},
        { key: 'amount', label: 'Částka', type: 'number', step: '0.01', required: true },
        { key: 'period_from', label: 'Období od', type: 'date' },
        { key: 'period_to', label: 'Období do', type: 'date' },
        { key: 'poznamky', label: 'Poznámky', type: 'textarea', fullWidth: true }
      ]
    },
    {
      id: 'import',
      title: 'Import plateb',
      icon: 'upload_file',
      fields: [
        { key: 'soubor', label: 'Soubor', type: 'file', 
          helpText: 'Vyberte soubor CSV s platbami z banky' },
        { key: 'format', label: 'Formát', type: 'select', required: true, options: [
          { value: 'csv_kb', label: 'KB CSV' },
          { value: 'csv_csob', label: 'ČSOB CSV' },
          { value: 'csv_unicredit', label: 'UniCredit CSV' },
          { value: 'csv_generic', label: 'Obecný CSV' }
        ]},
        { key: 'automaticke_parovani', label: 'Automatické párování podle VS', type: 'checkbox' }
      ]
    }
  ]
};

export default moduleMeta;
