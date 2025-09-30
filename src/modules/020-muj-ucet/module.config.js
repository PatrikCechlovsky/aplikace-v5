export async function getManifest() {
  return {
    id: '020-muj-ucet',
    title: 'Můj účet',
    icon: 'user',
    tiles: [{ id: 'prehled', title: 'Přehled', icon: 'user' }],
    forms: [{ id: 'edit', title: 'Upravit profil' }],
    defaultTile: 'prehled',
  };
}