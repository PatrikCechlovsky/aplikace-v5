// Ikony: jednotný registr (emoji / inline SVG)
const EMOJI = {
  users: '👥',
  account: '👤',
  home: '🏠',
  settings: '⚙️',
  list: '📄',
  bell: '🔔',
  help: '❓',
  search: '🔍',
  org: '🏢',
};

export function icon(name, fallback = '•') {
  return EMOJI[name] || fallback;
}

// Volitelné: SVG registry (pokud budeš chtít hezčí set)
// export function iconSvg(name) { ... }
