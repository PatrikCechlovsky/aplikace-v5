// src/ui/icons.js
// Jednoduchý registr ikon (emoji + SVG). Kdykoliv lze nahradit SVG/ikony dalším setem.

// Původní emoji fallback/aliasy - nic jsem nemazal, jen doplnil SVG mapu níže
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

  // NEMOVITOSTI - Property Types (modul 040)
  'building-2': '🏢',      // Bytový dům
  'warehouse': '🏭',       // Průmyslový objekt / Sklad
  'map': '🗺️',            // Pozemek
  'office-building': '🏬', // Administrativní budova (alternativní k briefcase)
  'apartment': '🏘️',      // Jiný objekt nemovitosti
  
  // JEDNOTKY - Unit Types (modul 040)
  'shopping-cart': '🛒',   // Obchodní prostor
  'car': '🚗',             // Garáž/Parking
  'basement': '🔒',        // Sklep (unikátní, nepoužívat archive)
  'attic': '🏚️',          // Půda (unikátní, odlišná od home)
  'apartment-unit': '🚪',  // Byt (unikátní, odlišná od home)
  'office': '💼',          // Kancelář (stejný jako briefcase, ale alias)
  'storage': '📦',         // Sklad (unikátní)
  'unit-key': '🔑',        // Jiná jednotka (unikátní klíč)
  'pencil-alt': '✏️',      // Ikona tužky pro editaci (alias na edit)
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
 * SVG map: pokud chceme konkrétní SVG pro lepší vzhled, přidej sem klíč -> SVG string.
 * SVG používají currentColor takže budou respektovat barvu textu/ikonky.
 * Neodstraňuji ani nepřepisují emoji variantu - fallback zůstává.
 */
const SVG_ICONS = {
  // small grid of four squares
  grid: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="3" y="3" width="7" height="7" rx="1.4" fill="currentColor"></rect>
    <rect x="14" y="3" width="7" height="7" rx="1.4" fill="currentColor"></rect>
    <rect x="3" y="14" width="7" height="7" rx="1.4" fill="currentColor"></rect>
    <rect x="14" y="14" width="7" height="7" rx="1.4" fill="currentColor"></rect>
  </svg>`,

  // paperclip (attachment)
  paperclip: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M21 8.5v8a4.5 4.5 0 0 1-9 0V9a3 3 0 0 1 6 0v7a1 1 0 0 1-2 0V9a1 1 0 0 0-2 0v7a3 3 0 1 0 6 0v-8.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,

  // add (plus)
  add: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,

  // edit (pencil)
  edit: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M3 21l3-1 11-11 1-3-3 1L4 20z" fill="currentColor" />
  </svg>`,

  // refresh
  refresh: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M21 12a9 9 0 1 0-2.3 5.7L21 21" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M21 3v6h-6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,

  // archive / box
  archive: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="3" y="3" width="18" height="6" rx="1.5" stroke="currentColor" stroke-width="1.2" fill="none"/>
    <path d="M21 9v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M9 13h6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
  </svg>`,

  // history (clock)
  history: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M21 12a9 9 0 1 0-2.1 5.7L21 21" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M12 7v6l4 2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,

  // detail / eye
  detail: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <circle cx="12" cy="12" r="2.2" fill="currentColor"/>
  </svg>`,

  // default small square (used as fallback in svg mode)
  default: `<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2" fill="currentColor"/></svg>`,
};

/**
 * Vrátí znak/SVG pro daný klíč.
 * Používej: import { icon } from './icons.js';  ->  innerHTML = icon('edit')
 *
 * Pokud je definované SVG v SVG_ICONS, vrátí ho (string). Jinak vrátí emoji z ICONS.
 * Fallback: vrátí default SVG nebo fallback znak.
 */
export function icon(name, fallback = '•') {
  const key = ALIASES[name] || name;
  // pokud máme SVG definici, preferuj ji
  if (SVG_ICONS[key]) return SVG_ICONS[key];
  const val = ICONS[key];
  if (!val) {
    console.warn('[icons] neznámá ikona:', name);
    return SVG_ICONS.default || fallback;
  }
  return val;
}
