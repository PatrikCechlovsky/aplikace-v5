// Modul 010 – Správa uživatelů
export async function getManifest() {
  return {
    id: '010-uzivatele',
    title: 'Uživatelé',
    icon: '👥',
    tiles: [
      { id: 'seznam', title: 'Seznam', icon: 'list' }
    ],
    forms: [
      { id: 'read',   title: 'Detail' },
      { id: 'edit',   title: 'Upravit' },
      { id: 'create', title: 'Nový / Pozvat' }
    ],
    defaultTile: 'seznam',
  };
}
