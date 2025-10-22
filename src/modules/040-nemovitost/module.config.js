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
      { id: 'admin-budova', title: 'Administrativní budova', icon: 'briefcase' },
      { id: 'prumyslovy-objekt', title: 'Průmyslový objekt', icon: 'warehouse' },
      { id: 'pozemek', title: 'Pozemek', icon: 'map' },
      { id: 'jiny-objekt', title: 'Jiný objekt', icon: 'grid' },
    ],
    forms: [
      { id: 'chooser', title: 'Výběr typu nemovitosti', icon: 'grid' },
      { id: 'edit', title: 'Úprava / Nová nemovitost', icon: 'edit' },
      { id: 'detail', title: 'Detail nemovitosti', icon: 'eye' },
    ],
  };
}

export default { getManifest };


