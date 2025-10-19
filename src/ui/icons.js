// src/ui/icons.js
// Jednoduchý registr ikon (emoji). Kdykoliv lze nahradit SVG.

export const ICONS = {
  // ZÁKLAD
  home: '🏠',
  users: '👥',
  account: '👤',
  org: '🏢',
  settings: '⚙️',
  list: '📄',
  bell: '🔔',
  help: '❓',
  info: 'ℹ️',
  search: '🔍',
  filter: '🔍',
  'chevron-right': '▶️',

  // CRUD / NAV
  add: '➕',
  edit: '✏️',
  detail: '👁️',
  delete: '🗑️',
  archive: '🗄️',
  paperclip: '📎',
  refresh: '🔄',

  // WORKFLOW
  approve: '✔️',   // potvrdit / uložit
  save: '💾',      // explicitní „Uložit“
  reject: '❌',    // zpět / zrušit
  exit: '🚪',      // odhlásit / zavřít

  // DOKUMENTY / KOMUNIKACE
  docs: '📑',
  note: '📝',
  comment: '💬',
  invite: '📨',    // pozvánka e-mailem
  send: '📤',      // odeslat dokument/e-mail
  mail: '✉️',

  // EXPORT/IMPORT/TISK
  export: '📤',
  import: '📥',
  print: '🖨️',

  // STAVY
  stats: '📊',
  reminder: '📨',
  inprogress: '⏳',
  done: '✅',
  removed: '🚫',

  // UI TYPY
  tile: '🟦',
  form: '📝',

  // PREFERENCES
  star: '⭐️',

  // HISTORY / ZMĚNY
  history: '⏳', // historie změn / čas

  // Doplňkové ikony (pokryjí chybějící názvy z modulů)
  person: '👤',
  briefcase: '💼',
  building: '🏢',
  people: '👥',
  bank: '🏦',
  handshake: '🤝',
  grid: '🟦',
};

 // Aliasy – pohodlnější klíče na totéž
const ALIASES = {
  plus: 'add',
  user: 'account',
  logout: 'exit',
  attach: 'paperclip',
  favorite: 'star',
  email: 'mail',
  remove: 'delete',

  // drobné aliasy pro kompatibilitu se staršími názvy
  person: 'account',
  briefcase: 'briefcase',
  building: 'building',
  people: 'users',
  bank: 'bank',
  handshake: 'handshake',
  grid: 'grid',
};

/**
 * Vrátí znak/SVG pro daný klíč.
 * Používej: import { icon } from './icons.js';  ->  innerHTML = icon('edit')
 */
export function icon(name, fallback = '•') {
  const key = ALIASES[name] || name;
  const val = ICONS[key];
  if (!val) {
    console.warn('[icons] neznámá ikona:', name);
    return fallback;
  }
  return val;
}
