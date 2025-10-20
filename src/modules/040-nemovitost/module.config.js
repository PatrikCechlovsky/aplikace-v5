// Manifest modulu 040 - Nemovitosti
// Tento modul implementuje správu nemovitostí (budov/objektů) a jejich jednotek.

export async function getManifest() {
  return {
    id: '040-nemovitost',
    title: 'Nemovitosti',
    icon: 'building', // nebo 'home' - záleží na dostupných ikonách v ui/icons.js
    defaultTile: 'prehled',
    tiles: [
      { id: 'prehled', title: 'Přehled', icon: 'list' },
      { id: 'seznam', title: 'Seznam nemovitostí', icon: 'grid' },
      { id: 'osvc', title: 'OSVČ', icon: 'user' },
      { id: 'firma', title: 'Firma', icon: 'briefcase' },
      { id: 'spolek', title: 'Spolek', icon: 'users' },
      { id: 'stat', title: 'Stát', icon: 'flag' },
      { id: 'zastupce', title: 'Zástupce', icon: 'user-check' },
    ],
    forms: [
      { id: 'edit', title: 'Úprava / Nová nemovitost', icon: 'edit' },
      { id: 'detail', title: 'Detail nemovitosti', icon: 'eye' },
    ],
  };
}

export default { getManifest };

