export async function getManifest() {
  return {
    id: '010-sprava-uzivatelu',
    title: 'Uživatelé',
    icon: 'users',
    tiles: [
      { id: 'prehled', title: 'Přehled', icon: 'list', renderer: () => import('./tiles/prehled.js') }
    ],
    forms: [
      { id: 'read',    title: 'Detail',          renderer: () => import('./forms/form.js') },
      { id: 'edit',    title: 'Upravit',         renderer: () => import('./forms/form.js') },
      { id: 'create',  title: 'Nový / Pozvat',   renderer: () => import('./forms/form.js') },
      { id: 'form',    title: 'Formulář',        renderer: () => import('./forms/form.js') }
    ],
    defaultTile: 'prehled',
  };
}
