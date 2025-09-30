// Konfigurace modulu: id/název a veřejné „dlaždice“ (tiles)
export async function getManifest() {
  return {
    id: '010-uzivatele',
    title: 'Uživatelé',
    icon: '👥',
    tiles: [
      { id: 'seznam', title: 'Seznam', icon: 'list' },
      { id: 'prehled', title: 'Přehled', icon: 'dashboard' },
    ],
    forms: [
      { id: 'read', title: 'Detail' },
      { id: 'edit', title: 'Upravit' },
      { id: 'create', title: 'Nový' },
    ],
    defaultTile: 'seznam',
  };
}
