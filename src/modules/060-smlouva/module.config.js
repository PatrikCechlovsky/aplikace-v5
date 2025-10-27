// src/modules/060-smlouva/module.config.js
// Manifest modulu 060 - Smlouvy (kompatibilní s dynamickým loaderem)

export async function getManifest() {
  return {
    id: '060-smlouva',
    title: 'Smlouvy',
    icon: 'description',
    defaultTile: 'prehled',
    tiles: [
      { id: 'prehled', title: 'Přehled', icon: 'list' },
      { id: 'aktivni', title: 'Aktivní', icon: 'check_circle' },
      { id: 'koncepty', title: 'Koncepty', icon: 'draft' },
      { id: 'expirujici', title: 'Expirující', icon: 'warning' },
      { id: 'ukoncene', title: 'Ukončené', icon: 'archive' }
    ],
    forms: [
      { id: 'detail', title: 'Detail smlouvy', icon: 'visibility' },
      { id: 'edit', title: 'Editace smlouvy', icon: 'edit' },
      { id: 'predavaci-protokol', title: 'Předávací protokol', icon: 'assignment' }
    ]
  };
}
