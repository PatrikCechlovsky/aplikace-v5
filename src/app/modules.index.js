// Jednoduchý seznam modulů pro sidebar a breadcrumbs (Fáze 1)
const mk = (id, title, icon, tiles = []) =>
  ({ id, title, icon, tiles, defaultTile: tiles[0]?.id });

export const MODULES = [
  mk('010-uzivatele',   'Uživatelé',   '👥', [{ id:'seznam',  label:'Seznam',  icon:'📄' }]),
  mk('020-muj-ucet',    'Můj účet',    '👤', [{ id:'profil',  label:'Profil',  icon:'🪪' }]),
  mk('030-pronajimatel','Pronajímatel','🏢', [{ id:'prehled', label:'Přehled', icon:'📋' }]),
  mk('900-nastaveni',   'Nastavení',   '⚙️', [{ id:'aplikace',label:'Aplikace',icon:'🔧' }]),
];
