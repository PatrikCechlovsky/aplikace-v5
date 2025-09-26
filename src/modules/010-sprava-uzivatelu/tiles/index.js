// Mapování tilů → rendererů (snadné přepínání podle id)
export async function renderTile(id, root) {
  switch (id) {
    case 'seznam': {
      const m = await import('./seznam.js'); return m.default(root);
    }
    case 'prehled': {
      const m = await import('./prehled.js'); return m.default(root);
    }
    case 'list': {
      const m = await import('./list.js'); return m.default(root);
    }
    default:
      root.innerHTML = `<div class="p-4 bg-white rounded-2xl border">Neznámý tile.</div>`;
  }
}
