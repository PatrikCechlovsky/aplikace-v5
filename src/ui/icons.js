// src/ui/icons.js
// Jednoduchý registr ikon (emoji). Kdykoliv můžeme vyměnit za SVG.
// Zachovává původní klíče a přidává nové (star, send, save, exit, ...).

const I = {
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
  filter: '🔍',      // můžeš případně změnit na jiné emoji/SVG „funnel“

  // CRUD / NAV
  add: '➕',
  edit: '✏️',
  detail: '👁️',
  delete: '🗑️',
  archive: '🗄️',
  paperclip: '📎',
  refresh: '🔄',
  'chevron-right': '▶️',

  // WORKFLOW
  approve: '✔️',     // uložit / potvrdit
  save: '💾',        // explicitní "Uložit"
  reject: '❌',      // zpět / zrušit
  exit: '🚪',        // odhlásit / zavřít

  // OPRÁVNĚNÍ / ÚČTY
  block: '⛔',
  resetPwd: '🔁',
  perms: '✳️',
  history: '🧑‍💻',

  // DOKUMENTY / KOMUNIKACE
  docs: '📑',
  note: '📝',
  comment: '💬',
  invite: '📨',      // pozvánka e-mailem
  send: '📤',        // odeslat dokument/e-mail
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
  star: '⭐️',        // oblíbené
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
};

export function icon(name, fallback = '•') {
  const key = ALIASES[name] || name;
  if (!I[key]) console.warn('Neznámá ikona:', name);
  return I[key] || fallback;
}

// Volitelně, když chceš někde rychle zkontrolovat dostupné klíče:
// export function listIconKeys() { return Object.keys(I); }
