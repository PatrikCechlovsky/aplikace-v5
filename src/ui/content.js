// src/ui/content.js

/**
 * Vykreslí hlavní obsah (hnědá oblast)
 * @param {HTMLElement} root - kam se obsah vykreslí
 * @param {Object} opts - { mod, kind, id }
 */
export function renderContent(root, { mod, kind, id } = {}){
  if (!root) return;
  const title = mod ? `${mod.title}${kind ? ' – ' + kind : ''}` : 'Dashboard';
  root.innerHTML = `
    <div class="p-4 bg-white rounded-2xl border">
      <div class="text-sm text-slate-500 mb-2">Aktivní: <b>${title}</b>${id?` (#${id})`:''}</div>
      <p class="text-sm">Zde bude obsah modulu (Fáze 1 – placeholder).</p>
    </div>
  `;
}
