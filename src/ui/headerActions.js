export function renderHeaderActions(root){
  if (!root) return
  root.innerHTML = `
    <button class="px-2 py-1 border rounded text-sm bg-white" title="Hledat">🔎</button>
    <button class="px-2 py-1 border rounded text-sm bg-white" title="Notifikace">🔔</button>
    <a href="#/m/020-muj-ucet" class="px-2 py-1 border rounded text-sm bg-white" title="Můj účet">👤</a>
    <a href="#/m/990-help" class="px-2 py-1 border rounded text-sm bg-white" title="Nápověda">🆘</a>
  `
}
