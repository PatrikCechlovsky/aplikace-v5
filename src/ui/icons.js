// Jednoduchý registr ikon (emoji). Pokud bude třeba, doplníme SVG varianty.

const I = {
  home: '🏠',
  users: '👥',
  account: '👤',
  org: '🏢',
  settings: '⚙️',
  list: '📄',
  bell: '🔔',
  help: '❓',
  search: '🔍',
  add: '➕',
  edit: '✏️',
  detail: '👁️',
  archive: '🗄️',
  block: '⛔',
  resetPwd: '🔁',
  invite: '📨',
  history: '🧑‍💻',
  docs: '📑',
  perms: '✳️',
  delete: '🗑️',
  export: '📤',
  import: '📥',
  print: '🖨️',
  filter: '🔍',
  stats: '📊',
  reminder: '📨',
  sign: '🖋️',
  approve: '✔️',
  reject: '❌',
  note: '📝',
  info: 'ℹ️',
  comment: '💬',
  inprogress: '⏳',
  done: '✅',
  removed: '🚫',
  tile: '🟦',
  form: '📝',
  paperclip: '📎',
  refresh: '🔄',
  "chevron-right": "▶️", // ← přidej tuto ikonu do hlavního registru
};
// aliasy — ať je jedno, jestli někdo napíše plus/user/logout apod.
const ALIASES = { plus: 'add', user: 'account', logout: 'exit', attach: 'paperclip' };

export function icon(name, fallback = '•') {
  const key = ALIASES[name] || name;
  if (!I[key]) console.warn("Neznámá ikona:", name);
  return I[key] || fallback;
}
