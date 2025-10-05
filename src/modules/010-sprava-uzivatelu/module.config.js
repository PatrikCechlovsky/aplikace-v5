// src/modules/010-sprava-uzivatelu/module.config.js
export async function getManifest() {
  return {
    id: '010-sprava-uzivatelu',
    title: 'Uživatelé',
    icon: 'users',

    // Dlaždice (tiles) – lazy import (renderer je funkce)
    tiles: [
      {
        id: 'prehled',
        title: 'Přehled',
        icon: 'list',
        renderer: () => import('./tiles/prehled.js')
      }
    ],

    // Formuláře (forms) – lazy import
    forms: [
      {
        id: 'create',
        title: 'Nový / Pozvat',
        icon: 'add',
        renderer: () => import('./forms/create.js')
      },
      {
        id: 'form',
        title: 'Formulář',
        icon: 'edit',
        renderer: () => import('./forms/form.js')
      }
    ],

    // výchozí sekce pro /m/010-sprava-uzivatelu
    defaultTile: 'prehled',
  };
}
