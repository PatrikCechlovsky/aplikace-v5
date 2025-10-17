// Manifest musí být vrácen funkcí getManifest().
// app.js si sama spočítá baseDir a podle id importuje tiles/<id>.js nebo forms/<id>.js.
// Tzn. do manifestu NEpatří baseDir ani renderer funkce.

export async function getManifest() {
  return {
    id: '010-sprava-uzivatelu',
    title: 'Uživatelé',
    icon: 'users',
    defaultTile: 'prehled', // POZOR: defaultTile (ne defaultTitle)
    tiles: [
      { id: 'prehled', title: 'Přehled', icon: 'list' },
    ],
    forms: [
      { id: 'form',   title: 'Formulář',      icon: 'form' },
      { id: 'create', title: 'Nový / Pozvat', icon: 'add'  },
      { id: 'role',   title: 'Role & barvy',  icon: 'settings' },
    ],
  };
}

export default { getManifest };
