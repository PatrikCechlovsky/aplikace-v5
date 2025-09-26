// FÁZE 1 – jednoduchý přehled modulů (zatím bez reálných module.config.js)
const mk = (id, title, icon, tiles = []) =>
  ({ id, title, icon, tiles, defaultTile: tiles[0]?.id });

export const MODULES = [
  mk('020-muj-ucet',     'Můj účet',     '👤', [{ id:'profil',  label:'Profil',  icon:'🪪' }]),
  mk('030-pronajimatel', 'Pronajímatel', '🏢', [{ id:'prehled', label:'Přehled', icon:'📋' }]),
  mk('050-najemnik',     'Nájemník',     '👥', [{ id:'seznam',  label:'Seznam',  icon:'📄' }]),
  mk('070-sluzby',       'Služby',       '🛠️', [{ id:'sprava',  label:'Správa',  icon:'🧰' }]),
  mk('090-finance',      'Finance',      '💶', [{ id:'reporty', label:'Reporty', icon:'📊' }]),
  mk('900-nastaveni',    'Nastavení',    '⚙️', [{ id:'aplikace',label:'Aplikace',icon:'🔧' }]),
];
