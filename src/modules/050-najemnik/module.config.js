export async function getManifest() {
  return {
    id: '050-najemnik',
    title: 'Nájemník',
    icon: 'users',
    defaultTile: 'prehled',
    tiles: [
      { id: 'prehled', title: 'Přehled', icon: 'list' },
      { id: 'osoba', title: 'Osoba', icon: 'person' },
      { id: 'osvc', title: 'OSVČ', icon: 'briefcase' },
      { id: 'firma', title: 'Firma', icon: 'building' },
      { id: 'spolek', title: 'Spolek / Skupina', icon: 'people' },
      { id: 'stat', title: 'Státní instituce', icon: 'bank' },
      { id: 'zastupce', title: 'Zástupci', icon: 'handshake' }
    ],
    forms: [
      { id: 'chooser', title: 'Nový nájemník', icon: 'grid' },
      // { id: 'form', title: 'Formulář', icon: 'form' }
    ]
  };
}
