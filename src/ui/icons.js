// src/ui/icons.js
// Jednoduchý registr ikon (emoji + SVG). Kdykoliv lze nahradit SVG/ikony dalším setem.
// Rozšířeno: přidáno ~90 běžných ikon (emoji fallback) a několik SVG pro lepší rendering.
// Cílem je mít co nejvíce aliasů/názvů hotových, aby se nemuselo vracet pro chybějící ikony.

// Původní emoji fallback/aliasy - nic jsem nemazal, jen doplnil velký seznam níže
export const ICONS = {
  // ZÁKLAD / NAV
  home: '🏠',
  dashboard: '📊',
  overview: '🧭',
  apps: '🧩',
  menu: '☰',
  users: '👥',
  user: '👤',
  account: '👤',
  profile: '👤',
  person: '👤',
  org: '🏢',
  building: '🏢',
  office: '🏬',
  settings: '⚙️',
  cog: '⚙️',
  tools: '🛠️',
  list: '📄',
  table: '📋',
  columns: '📑',
  bell: '🔔',
  'bell-slash': '🔕',
  help: '❓',
  info: 'ℹ️',
  search: '🔍',
  filter: '🔍',
  'chevron-right': '▶️',
  'chevron-left': '◀️',
  'chevron-up': '▲',
  'chevron-down': '▼',

  // CRUD / ACTIONS
  add: '➕',
  plus: '➕',
  minus: '➖',
  edit: '✏️',
  pencil: '✏️',
  'pencil-alt': '✏️',
  detail: '👁️',
  view: '👁️',
  delete: '🗑️',
  trash: '🗑️',
  remove: '❌',
  archive: '🗄️',
  paperclip: '📎',
  attach: '📎',
  refresh: '🔄',
  reload: '🔁',
  save: '💾',
  approve: '✔️',
  accept: '✔️',
  reject: '❌',
  exit: '🚪',
  logout: '🚪',
  login: '🔐',
  lock: '🔒',
  unlock: '🔓',
  key: '🔑',

  // NAV/FILE
  folder: '📁',
  'folder-open': '📂',
  file: '📄',
  'file-alt': '📝',
  code: '💻',
  terminal: '🖥️',
  database: '🗄️',
  cloud: '☁️',
  sync: '🔁',
  upload: '📤',
  download: '📥',
  link: '🔗',
  'external-link': '🔗',
  share: '📤',

  // COMMUNICATION
  mail: '✉️',
  email: '✉️',
  inbox: '📥',
  outbox: '📤',
  send: '📤',
  receive: '📥',
  comment: '💬',
  chat: '💬',
  message: '💬',
  notification: '🔔',

  // MEDIA / PLAYER
  play: '▶️',
  pause: '⏸️',
  stop: '⏹️',
  record: '⏺️',
  rewind: '⏪',
  forward: '⏩',
  volume: '🔊',
  mute: '🔇',
  image: '🖼️',
  camera: '📷',
  video: '🎥',

  // STATUS / STATE
  pending: '⏳',
  inprogress: '⏳',
  done: '✅',
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info2: 'ℹ️',
  removed: '🚫',
  locked: '🔒',
  unlocked: '🔓',

  // DATA / CHARTS
  stats: '📊',
  chart: '📈',
  'chart-bar': '📊',
  'chart-pie': '🥧',
  'trend-up': '📈',
  'trend-down': '📉',

  // CALENDAR / TIME
  calendar: '📅',
  'calendar-day': '📆',
  'calendar-alt': '📆',
  'calendar-check': '✅',
  clock: '⏰',
  timer: '⏱️',
  history: '🕘',
  stopwatch: '⏱️',
  reminder: '🔔',

  // SOCIAL / FAVORITES
  star: '⭐️',
  heart: '❤️',
  like: '👍',
  dislike: '👎',
  favorite: '⭐️',
  bookmark: '🔖',
  trophy: '🏆',
  medal: '🏅',
  gift: '🎁',

  // E-COMMERCE / FINANCE
  cart: '🛒',
  'shopping-cart': '🛒',
  creditcard: '💳',
  'credit-card': '💳',
  wallet: '👛',
  cash: '💵',
  invoice: '🧾',
  price: '💲',
  discount: '🏷️',
  tag: '🏷️',

  // MAP / GEO
  map: '🗺️',
  location: '📍',
  pin: '📌',
  'map-pin': '📍',
  compass: '🧭',
  globe: '🌍',
  language: '🗣️',

  // TRANSPORT
  car: '🚗',
  bike: '🚲',
  bicycle: '🚲',
  motorcycle: '🏍️',
  bus: '🚌',
  train: '🚆',
  plane: '✈️',
  ship: '🚢',
  truck: '🚚',

  // BUILDINGS / PROPERTY (modul 040)
  'building-2': '🏢',
  warehouse: '🏭',
  'office-building': '🏬',
  apartment: '🏘️',
  'apartment-unit': '🚪',
  basement: '🔒',
  attic: '🏚️',
  garage: '🚗',
  storage: '📦',
  'unit-key': '🔑',

  // HEALTH / WEATHER / NATURE
  sun: '☀️',
  moon: '🌙',
  cloud: '☁️',
  'cloud-rain': '🌧️',
  rain: '🌧️',
  snow: '❄️',
  bolt: '⚡️',
  fire: '🔥',
  leaf: '🍃',
  recycle: '♻️',

  // DEVOPS / INFRA
  bug: '🐛',
  shield: '🛡️',
  'lock-shield': '🔐',
  server: '🖥️',
  api: '🔗',
  webhook: '🔔',

  // ACCESSIBILITY / UI TYPES
  tile: '🟦',
  grid: '🟦',
  'list-alt': '📋',
  form: '📝',
  'menu-grid': '▦',
  avatar: '👤',
  badge: '🔰',

  // MISC
  phone: '📞',
  mobile: '📱',
  laptop: '💻',
  tablet: '📱',
  tv: '📺',
  book: '📚',
  docs: '📑',
  note: '📝',
  'comment-alt': '💭',
  invite: '📨',
  report: '📝',
  export: '📤',
  import: '📥',
  print: '🖨️',
  paperclip2: '📎',
  fingerprint: '🪪',
  qr: '🔳',
  barcode: '🏷️',
  wrench: '🔧',
  hammer: '🔨',
  plug: '🔌',
  battery: '🔋',
  thermometer: '🌡️',
  eye: '👁️',
  'eye-off': '🙈',
  paint: '🎨',
  brush: '🖌️',
  bucket: '🪣',
  nodes: '🕸️',
  cluster: '⚛️',
  rocket: '🚀',
  flag: '🚩',
  check: '✔️',
  clock2: '🕒',
  'search-alt': '🔎',
  'settings-alt': '🔧',
  support: '🆘',
  'bug-report': '🐞',
  maintenance: '🛠️',
  'sort-asc': '🔼',
  'sort-desc': '🔽',
  'lock-open': '🔓',
  network: '🌐'
};

 // Rozšířené aliasy – pohodlnější klíče na totéž
const ALIASES = {
  plus: 'add',
  pluscircle: 'add',
  user: 'account',
  users: 'users',
  logout: 'exit',
  login: 'login',
  signout: 'logout',
  signin: 'login',
  attach: 'paperclip',
  attach2: 'paperclip2',
  favorite: 'star',
  fav: 'star',
  email: 'mail',
  mail: 'mail',
  remove: 'delete',
  trash: 'trash',
  person: 'account',
  briefcase: 'briefcase',
  building: 'building',
  people: 'users',
  bank: 'bank',
  handshake: 'handshake',
  grid: 'grid',
  'chev-right': 'chevron-right',
  'chev-left': 'chevron-left',
  searchbar: 'search',
  settings: 'settings',
  config: 'settings',
  info: 'info',
  warning: 'warning',
  ok: 'check',
  checkmark: 'check',
  home2: 'home',
  house: 'home',
  docs: 'docs',
  document: 'file',
  files: 'file',
  cart: 'shopping-cart',
  cart2: 'shopping-cart'
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

  // simple search magnifier
  search: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"></path>
    <path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></path>
  </svg>`,

  // home outline
  home: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M3 11.5L12 4l9 7.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"></path>
    <path d="M5 21V11h14v10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"></path>
  </svg>`,

  // user circle
  user: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="12" cy="8" r="3" stroke="currentColor" stroke-width="1.6" fill="none"></circle>
    <path d="M4 20c1.5-4 7-6 8-6s6.5 2 8 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"></path>
  </svg>`,

  // settings / gear
  settings: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7z" stroke="currentColor" stroke-width="1.4" fill="none"></path>
    <path d="M19.4 15a7.6 7.6 0 0 0 .1-1 7.6 7.6 0 0 0-.1-1l2.1-1.6-1.9-3.3-2.5 1a9 9 0 0 0-1.7-.9l-.4-2.6H9.9l-.4 2.6c-.6.2-1.1.5-1.7.9l-2.5-1L3.4 11l2.1 1.6c-.1.3-.1.7-.1 1s0 .7.1 1L3.4 15.2 5.3 18.5l2.5-1c.6.4 1.1.7 1.7.9l.4 2.6h3.8l.4-2.6c.6-.2 1.1-.5 1.7-.9l2.5 1 1.9-3.3-2.1-1.6z" stroke="currentColor" stroke-width="1.2" fill="none"></path>
  </svg>`,

  // default simple dot (fallback)
  default: `<svg width="14" height="14" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="12" cy="12" r="3" fill="currentColor"/>
  </svg>`
};


/**
 * Vrátí znak/SVG pro daný klíč.
 * Používej: import { icon } from './icons.js';  ->  element.innerHTML = icon('edit')
 *
 * Pokud je definované SVG v SVG_ICONS, vrátí ho (string). Jinak vrátí emoji z ICONS.
 * Fallback: vrátí default SVG nebo fallback znak.
 */
export function icon(name, fallback = '•') {
  if (!name && name !== 0) {
    console.warn('[icons] volání bez jména ikony, vracím fallback');
    return SVG_ICONS.default || fallback;
  }
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
