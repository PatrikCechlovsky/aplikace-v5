export async function getManifest() {
  return {
    id: '020-muj-ucet',
    title: 'Můj účet',
    icon: 'account',
    // Tento modul nabízí pouze formulář "form" — žádné dlaždice (tiles)
    forms: [
      { id: 'form', title: 'Upravit profil', icon: 'account' }
    ],
    // Pokud nemáš žádné tiles, necháme pole tiles prázdné
    tiles: []
  };
}

export default { getManifest };
