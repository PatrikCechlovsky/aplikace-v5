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
  filter: '🔍',     // zůstává stejné, případně vyměníme za ⚲
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
};
// … tvůj původní registr I = { … }

I.refresh = I.refresh || '🔄'; // doplníme chybějící refresh
// aliasy — ať je jedno, jestli někdo napíše plus/user/logout apod.
const ALIASES = { plus: 'add', user: 'account', logout: 'exit' };

export function icon(name, fallback = '•') {
  const key = ALIASES[name] || name;
  return I[key] || fallback;
}
