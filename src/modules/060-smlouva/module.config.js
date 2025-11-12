// src/modules/060-smlouva/module.config.js
// Manifest modulu 060 - Smlouvy
// Kompatibilní s dynamickým loaderem + zpětně kompatibilní export `render`
// - getManifest() vrací manifest (stejně jako 030-pronajimatel)
// - export render(root, params) poskytuje fallback pro loader, který volá render
//   přímo z module.config (pokud existuje). Render dynamicky importuje příslušný
//   tile/form modul a zavolá jeho renderer (podporuje různé tvary exportů).
//
// Ulož tento soubor přes existující module.config.js (udělej si nejdřív zálohu).

export async function getManifest() {
  return {
    id: '060-smlouva',
    title: 'Smlouvy',
    icon: 'description',
    defaultTile: 'prehled',
    tiles: [
      { id: 'prehled', title: 'Přehled', icon: 'list' },
      { id: 'aktivni', title: 'Aktivní', icon: 'check_circle' },
      { id: 'koncepty', title: 'Koncepty', icon: 'draft' },
      { id: 'expirujici', title: 'Expirující', icon: 'warning' },
      { id: 'ukoncene', title: 'Ukončené', icon: 'archive' },
      { id: 'nastaveni', title: 'Nastavení', icon: 'settings' }
    ],
    forms: [
      { id: 'detail', title: 'Detail smlouvy', icon: 'visibility' },
      { id: 'detail-tabs', title: 'Přehled vazeb', icon: 'grid' },
      { id: 'edit', title: 'Editace smlouvy', icon: 'edit' },
      { id: 'predavaci-protokol', title: 'Předávací protokol', icon: 'assignment' }
    ]
  };
}

/**
 * Zpětně kompatibilní render API
 * - loader může volat render(root, params)
 * - params může obsahovat { kind: 'tile'|'form', id: '...' }
 * - pokud chybí, pokusíme se odvodit z location.hash
 * - dynamicky importujeme ./tiles/<id>.js nebo ./forms/<id>.js a zavoláme jejich renderer
 */
export async function render(root, params = {}) {
  root.innerHTML = `<div class="text-slate-500 p-2">Načítám…</div>`;

  // zjistit kind/id z params nebo z hashe
  let kind = params.kind || params.k || null; // safe aliases
  let id = params.id || params.form || params.tile || null;

  if (!kind || !id) {
    const hash = location.hash || '';
    const m = hash.match(/#\/m\/([^\/]+)\/(t|f)\/([^?\s/]+)/);
    if (m) {
      kind = kind || (m[2] === 't' ? 'tile' : 'form');
      id = id || m[3];
    }
  }

  if (!kind || !id) {
    root.innerHTML = `
      <div class="p-3 bg-rose-50 border border-rose-200 rounded text-rose-700">
        Modul <b>060-smlouva</b> byl zavolán bez určení sekce (tile/form) nebo id.
      </div>`;
    return;
  }

  try {
    const folder = kind === 'tile' ? 'tiles' : 'forms';
    const mod = await import(`./${folder}/${id}.js`);

    // najít volatelnou funkci renderer ve všech běžných tvarech exportu
    const renderer =
      (typeof mod.render === 'function' && mod.render) ||
      (mod.default && typeof mod.default.render === 'function' && mod.default.render) ||
      (mod.default && typeof mod.default === 'function' && mod.default) ||
      null;

    if (!renderer) {
      root.innerHTML = `
        <div class="p-3 bg-rose-50 border border-rose-200 rounded text-rose-700">
          Načtený modul <b>060-smlouva/${kind}/${id}</b> neobsahuje volatelnou funkci render.
        </div>`;
      console.error('[060-smlouva] no renderer found for', kind, id, mod);
      return;
    }

    // zavoláme renderer; preferujeme (root, params) pokud funkce očekává 2+ argumenty
    if ((renderer.length || 0) >= 2) {
      await renderer(root, params);
    } else {
      // fallback: volat jako renderer(root)
      await renderer(root);
    }
  } catch (err) {
    console.error('[060-smlouva render error]', err);
    root.innerHTML = `
      <div class="p-3 bg-rose-50 border border-rose-200 rounded text-rose-700">
        Tuto sekci se nepodařilo načíst: <b>${kind}/${id}</b>.
        <div class="mt-2 text-sm text-rose-600">${err && err.message ? err.message : err}</div>
      </div>`;
  }
}

// Opcionalně: getActions pro breadcrumbs area (stejné jako dříve)
export async function getActions(ctx) {
  if (ctx.kind === 'tile' && ctx.id === 'prehled') {
    return [
      { label: 'Obnovit', icon: '🔄', onClick: () => location.reload() }
    ];
  }
  return [];
}

// Export default pro kompatibilitu s různými loadery
export default { getManifest, render, getActions };
