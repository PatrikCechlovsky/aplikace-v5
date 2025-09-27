// Konfigurace modulu: id/název a veřejné „dlaždice“ (tiles)
export default {
  id: '010-uzivatele',
  title: 'Uživatelé',
  tiles: [
    { id: 'seznam', label: 'Seznam', icon: 'list' },
    // později přidáme další: { id: 'archiv', ... }, { id: 'role', ... }
  ],
  defaultTile: 'seznam',
};
