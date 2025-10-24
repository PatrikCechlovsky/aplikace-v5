// Sdílená definice polí pro modul 040 - Nemovitosti
export const FIELDS = [
  { key: 'nazev', label: 'Název nemovitosti', type: 'text', required: true },
  { key: 'typ_nemovitosti', label: 'Typ nemovitosti', type: 'select', required: true, options: [
    { value: 'bytovy_dum', label: 'Bytový dům' },
    { value: 'rodinny_dum', label: 'Rodinný dům' },
    { value: 'admin_budova', label: 'Administrativní budova' },
    { value: 'prumyslovy_objekt', label: 'Průmyslový objekt' },
    { value: 'pozemek', label: 'Pozemek' },
    { value: 'jiny_objekt', label: 'Jiný objekt' }
  ]},
  { key: 'ulice', label: 'Ulice', type: 'text' },
  { key: 'cislo_popisne', label: 'Číslo popisné', type: 'text' },
  { key: 'cislo_orientacni', label: 'Číslo orientační', type: 'text' },
  { key: 'mesto', label: 'Město', type: 'text' },
  { key: 'psc', label: 'PSČ', type: 'text' },
  { key: 'kraj', label: 'Kraj', type: 'text' },
  { key: 'stat', label: 'Stát', type: 'text' },
  { key: 'pocet_podlazi', label: 'Počet podlaží', type: 'number' },
  { key: 'rok_vystavby', label: 'Rok výstavby', type: 'number' },
  { key: 'rok_rekonstrukce', label: 'Rok rekonstrukce', type: 'number' },
  { key: 'celkova_plocha', label: 'Celková plocha', type: 'text' },
  { key: 'pocet_jednotek', label: 'Počet jednotek', type: 'number' },
  { key: 'poznamky', label: 'Poznámka', type: 'textarea', fullWidth: true },
  { key: 'vybaveni', label: 'Vybavení', type: 'text' },
  { key: 'prilohy', label: 'Přílohy', type: 'text' },
  { key: 'pronajimatel', label: 'Pronajímatel', type: 'text' },
  { key: 'archived', label: 'Archivní', type: 'checkbox' },
  { key: 'archivedLabel', label: 'Archivní (text)', type: 'text' },
  { key: 'updated_at', label: 'Poslední úprava', type: 'label', readOnly: true },
  { key: 'updated_by', label: 'Upravil', type: 'label', readOnly: true },
  { key: 'created_at', label: 'Vytvořen', type: 'label', readOnly: true }
];
export default { FIELDS };
