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
      // Task 07: Removed duplicate tiles (seznam, bytovy-dum, rodinny-dum, etc.)
      // All functionality consolidated into 'prehled' with type filtering
    ],
    forms: [
      { id: 'chooser', title: 'Výběr typu nemovitosti', icon: 'grid', showInSidebar: false },
      { id: 'edit', title: 'Úprava / Nová nemovitost', icon: 'edit', showInSidebar: false },
      { id: 'detail', title: 'Detail nemovitosti', icon: 'eye', showInSidebar: false },
      { id: 'unit-chooser', title: 'Výběr typu jednotky', icon: 'grid', showInSidebar: false },
      { id: 'unit-edit', title: 'Úprava / Nová jednotka', icon: 'edit', showInSidebar: false },
      { id: 'property-type', title: 'Správa typů nemovitostí', icon: 'settings', showInSidebar: false },
      { id: 'unit-type', title: 'Správa typů jednotek', icon: 'settings', showInSidebar: false },
    ],
  };
}

export default { getManifest };




