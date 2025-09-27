import { icon } from '../ui/icons.js';

const mk = (id, title, iconName, tiles=[]) =>
  ({ id, title, icon: icon(iconName), tiles, defaultTile: tiles[0]?.id });

export const MODULES = [
  mk('010-uzivatele', 'Uživatelé', 'users', [{ id:'seznam', label:'Seznam', icon:'list' }]),
  mk('020-muj-ucet', 'Můj účet', 'account', [{ id:'profil', label:'Profil', icon:'account' }]),
  mk('030-pronajimatel', 'Pronajímatel', 'org', [{ id:'prehled', label:'Přehled', icon:'list' }]),
  mk('900-nastaveni', 'Nastavení', 'settings', [{ id:'aplikace', label:'Aplikace', icon:'settings' }]),
];
