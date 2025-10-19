export async function getManifest() {
  return {
    id: '030-pronajimatel',
    title: 'Pronajímatel',
    icon: 'home',
    defaultTile: 'prehled',
    // tiles jsou položky v levém menu, FORM NEPATŘÍ mezi ně (formy jsou v sekci forms)
    tiles: [
      { id: 'prehled', title: 'Přehled', icon: 'list' },
      { id: 'osoba', title: 'Osoba', icon: 'person' },
      { id: 'osvc', title: 'OSVČ', icon: 'briefcase' },
      { id: 'firma', title: 'Firma', icon: 'building' },
      { id: 'spolek', title: 'Spolek / Skupina', icon: 'people' },
      { id: 'stat', title: 'Státní instituce', icon: 'bank' },
      { id: 'zastupce', title: 'Zástupci', icon: 'handshake' },
      // { id: 'novy', title: 'Nový subjekt', icon: 'add' }
    ],
    // sem patří formy (nezobrazují se jako běžné menu-tile)
    forms: [
      { id: 'chooser', title: 'Nový subjekt', icon: 'grid' },
      // { id: 'form', title: 'Formulář', icon: 'form' }
    ]
  };
}
