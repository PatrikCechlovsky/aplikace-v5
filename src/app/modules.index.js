import { icon } from '../ui/icons.js';

const mk = (id, title, iconName, tiles=[]) =>
  ({ id, title, icon: icon(iconName), tiles, defaultTile: tiles[0]?.id });

// src/app/modules.index.js
// Každý nový modul = 1 řádek. Lazy import manifestu (module.config.js).
export const MODULE_SOURCES = [
  () => import('../modules/010-sprava-uzivatelu/module.config.js'),
  () => import('../modules/020-muj-ucet/module.config.js'),
  () => import('../modules/030-pronajimatel/module.config.js'),
  () => import('../modules/040-nemovitost/module.config.js'),
  () => import('../modules/050-najemnik/module.config.js'),
  // ... další přidáš stejně
];
