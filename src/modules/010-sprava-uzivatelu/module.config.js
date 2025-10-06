// src/modules/010-sprava-uzivatelu/module.config.js
export default {
  id: '010-sprava-uzivatelu',
  title: 'Uživatelé',
  icon: 'users',
  baseDir: '/src/modules/010-sprava-uzivatelu',

  defaultTitle: 'Přehled',

  tiles: [
    {
      id: 'prehled',
      title: 'Přehled',
      icon: 'list',
      renderer: () => import('./tiles/prehled.js'),
    },
  ],

  forms: [
    {
      id: 'form',
      title: 'Formulář',
      icon: 'form',
      renderer: () => import('./forms/form.js'),
    },
    {
      id: 'create',
      title: 'Nový / Pozvat',
      icon: 'add',
      renderer: () => import('./forms/create.js'),
    },
    {
      id: 'role',
      title: 'Role & barvy',
      icon: 'settings',
      renderer: () => import('./forms/role.js'),
    },
  ],
};
