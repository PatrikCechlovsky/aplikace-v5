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
        { key: 'payment_reference', label: 'Reference platby', type: 'text' },
        { key: 'amount', label: 'Částka', type: 'number', step: '0.01', required: true },
        { key: 'currency', label: 'Měna', type: 'text', readOnly: true },
        { key: 'payment_date', label: 'Datum platby', type: 'date', required: true },
        { key: 'value_date', label: 'Valuta', type: 'date' },
        { key: 'payment_type', label: 'Typ platby', type: 'select', required: true, options: [
          { value: 'najem', label: 'Nájem' },
          { value: 'sluzba', label: 'Služba' },
          { value: 'kauce', label: 'Kauce' },
          { value: 'poplatek', label: 'Poplatek' },
          { value: 'vratka', label: 'Vrátka' }
        ]},
        { key: 'payment_method', label: 'Způsob platby', type: 'select', options: [
          { value: 'bankovni_prevod', label: 'Bankovní převod' },
          { value: 'direct_debit', label: 'Direct debit' },
          { value: 'kartou', label: 'Kartou' },
          { value: 'hotove', label: 'Hotově' },
          { value: 'jinak', label: 'Jinak' }
        ]},
        { key: 'status', label: 'Stav', type: 'select', required: true, options: [
          { value: 'cekajici', label: 'Čekající' },
          { value: 'potvrzeno', label: 'Potvrzeno' },
          { value: 'uspesne_rekoncilovano', label: 'Úspěšně reconcilováno' },
          { value: 'selhalo', label: 'Selhalo' },
          { value: 'vraceno', label: 'Vráceno' }
        ]},
        { key: 'contract_id', label: 'Smlouva', type: 'chooser', entity: 'contracts' },
        { key: 'party_id', label: 'Strana', type: 'chooser', entity: 'subjects' },
        { key: 'bank_transaction_id', label: 'ID bankovní transakce', type: 'text' },
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
        { key: 'payment_reference', label: 'Reference platby', type: 'text', 
          helpText: 'Variabilní symbol, zpráva pro příjemce' },
        { key: 'amount', label: 'Částka (Kč)', type: 'number', step: '0.01', required: true },
        { key: 'payment_date', label: 'Datum platby', type: 'date', required: true },
        { key: 'value_date', label: 'Valuta', type: 'date' },
        { key: 'payment_type', label: 'Typ platby', type: 'select', required: true, options: [
          { value: 'najem', label: 'Nájem' },
          { value: 'sluzba', label: 'Služba' },
          { value: 'kauce', label: 'Kauce' },
          { value: 'poplatek', label: 'Poplatek' },
          { value: 'vratka', label: 'Vrátka' }
        ]},
        { key: 'payment_method', label: 'Způsob platby', type: 'select', options: [
          { value: 'bankovni_prevod', label: 'Bankovní převod' },
          { value: 'direct_debit', label: 'Direct debit' },
          { value: 'kartou', label: 'Kartou' },
          { value: 'hotove', label: 'Hotově' },
          { value: 'jinak', label: 'Jinak' }
        ]},
        { key: 'status', label: 'Stav', type: 'select', required: true, options: [
          { value: 'cekajici', label: 'Čekající' },
          { value: 'potvrzeno', label: 'Potvrzeno' },
          { value: 'uspesne_rekoncilovano', label: 'Úspěšně reconcilováno' },
          { value: 'selhalo', label: 'Selhalo' },
          { value: 'vraceno', label: 'Vráceno' }
        ]},
        { key: 'contract_id', label: 'Smlouva', type: 'chooser', entity: 'contracts', required: true,
          helpText: 'Vyberte smlouvu, ke které se platba vztahuje' },
        { key: 'party_id', label: 'Plátce', type: 'chooser', entity: 'subjects', required: true,
          helpText: 'Vyberte plátce (nájemník nebo pronajímatel)' },
        { key: 'bank_transaction_id', label: 'ID bankovní transakce', type: 'text' },
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
