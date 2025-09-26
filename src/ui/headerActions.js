// Ikony vpravo v headeru (bez profilu – ten je samostatně)
export function renderHeaderActions(root){
  if (!root) return;
  root.innerHTML = `
    <button class="px-2 py-1 border rounded bg-white text-sm" title="Hledat">🔎</button>
    <button class="px-2 py-1 border rounded bg-white text-sm" title="Notifikace">🔔</button>
    <button class="px-2 py-1 border rounded bg-white text-sm" title="Nápověda">🆘</button>
  `;
}
