// module.config.js — manifest pro modul "Pronajímatel"
export async function getManifest() {
  return {
    id: '030a-pronajimatel',
    title: 'Pronajímatel',
    icon: 'home',
    defaultTile: 'prehled',
    tiles: [
      { id: 'prehled', title: 'Přehled', icon: 'list' },
      { id: 'seznam', title: 'Seznam', icon: 'list' }
    ],
    forms: [
      { id: 'form', title: 'Formulář', icon: 'form' }
    ]
  };
}
