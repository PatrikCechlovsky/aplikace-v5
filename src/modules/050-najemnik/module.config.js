export async function getManifest() {
  return {
    id: '050-najemnik',
    title: 'Nájemník',
    icon: 'users',
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
