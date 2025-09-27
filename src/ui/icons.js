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

export function icon(name, fallback = '•') {
  return I[name] || fallback;
}
