// module.config.js — manifest pro modul "Pronajímatel"
export async function getManifest() {
  return {
    id: '030a-pronajimatel',
    title: 'Pronajímatel',
    icon: 'home',
    defaultTile: 'prehled',
    tiles: [
      { id: 'prehled', title: 'Všichni', icon: 'list' },
      { id: 'osoba', title: 'Osoba', icon: 'person' },
      { id: 'osvc', title: 'OSVČ', icon: 'briefcase' },
      { id: 'firma', title: 'Firma', icon: 'building' },
      { id: 'spolek', title: 'Spolek / Skupina', icon: 'people' },
      { id: 'stat', title: 'Státní instituce', icon: 'bank' },
      { id: 'zastupce', title: 'Zástupci', icon: 'handshake' }
    ],
    forms: [
      { id: 'chooser', title: 'Nový subjekt', icon: 'grid' },
      { id: 'form', title: 'Formulář', icon: 'form' }
    ]
  };
}
