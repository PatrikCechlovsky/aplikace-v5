// Manifest modulu 040 - Nemovitosti
// Tento modul implementuje správu nemovitostí (budov/objektů) a jejich jednotek.

export async function getManifest() {
  return {
    id: '040-nemovitost',
    title: 'Nemovitosti',
    icon: 'building',
    defaultTile: 'prehled',
    tiles: [
      { id: 'prehled', title: 'Přehled', icon: 'list' },
      { id: 'seznam', title: 'Seznam nemovitostí', icon: 'grid' },
      { id: 'bytovy-dum', title: 'Bytový dům', icon: 'building-2' },
      { id: 'rodinny-dum', title: 'Rodinný dům', icon: 'home' },
      { id: 'admin-budova', title: 'Administrativní budova', icon: 'office-building' },
      { id: 'prumyslovy-objekt', title: 'Průmyslový objekt', icon: 'warehouse' },
      { id: 'pozemek', title: 'Pozemek', icon: 'map' },
      { id: 'jiny-objekt', title: 'Jiný objekt', icon: 'apartment' },
    ],
    forms: [
      { id: 'chooser', title: 'Výběr typu nemovitosti', icon: 'grid' },
      { id: 'edit', title: 'Úprava / Nová nemovitost', icon: 'edit' },
      { id: 'detail', title: 'Detail nemovitosti', icon: 'eye' },
      { id: 'unit-chooser', title: 'Výběr typu jednotky', icon: 'grid' },
      { id: 'unit-edit', title: 'Úprava / Nová jednotka', icon: 'edit' },
      { id: 'property-type', title: 'Správa typů nemovitostí', icon: 'settings' },
      { id: 'unit-type', title: 'Správa typů jednotek', icon: 'settings' },
    ],
  };
}

export default { getManifest };




