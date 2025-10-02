export async function getManifest() {
  return {
    id: '010-sprava-uzivatelu',
    title: 'Uživatelé',
    icon: 'users',
    tiles: [{ id: 'prehled', title: 'Přehled', icon: 'list' }],
    forms: [
      { id: 'read', title: 'Detail' },
      { id: 'edit', title: 'Upravit' },
      { id: 'create', title: 'Nový / Pozvat' }
    ],
    defaultTile: 'prehled',
  };
}
