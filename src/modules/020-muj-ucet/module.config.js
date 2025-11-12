export async function getManifest() {
  return {
    id: '020-muj-ucet',
    title: 'Můj účet',
    icon: 'account',
    // Forms including new detail overview
    forms: [
      { id: 'form', title: 'Upravit profil', icon: 'account', showInSidebar: false },
      { id: 'detail', title: 'Přehled', icon: 'view', showInSidebar: true }
    ],
    // Tiles for navigation
    tiles: [
      { id: 'prehled', title: 'Přehled', icon: 'list' }
    ]
  };
}

export default { getManifest };
