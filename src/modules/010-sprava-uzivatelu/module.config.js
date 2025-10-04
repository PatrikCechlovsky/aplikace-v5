import { icon } from '../../ui/icons.js';

export async function getManifest() {
  return {
    id: '010-sprava-uzivatelu',
    title: 'Uživatelé',
    icon: 'users',
    tiles: [
      { id: 'prehled', title: 'Přehled', icon: icon('list'), renderer: () => import('./tiles/prehled.js') }
    ],
    forms: [
      { id: 'create',  title: 'Nový / Pozvat', icon: icon('add'), renderer: () => import('./forms/create.js') },
      { id: 'form',    title: 'Formulář',      icon: icon('edit'), renderer: () => import('./forms/form.js') }
    ],
    defaultTile: 'prehled',
  };
}
