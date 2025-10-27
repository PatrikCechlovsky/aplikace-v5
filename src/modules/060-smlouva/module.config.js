// Modul pro správu nájemních smluv (opravený render API)
// původní manifest ponechán, nově exportujeme render(root, params)
// a zároveň zachováváme getActions.

const MANIFEST = {
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
  ],
  forms: [
    { id: 'detail', title: 'Detail smlouvy', icon: 'visibility' },
    { id: 'edit', title: 'Editace smlouvy', icon: 'edit' },
    { id: 'predavaci-protokol', title: 'Předávací protokol', icon: 'assignment' },
  ],
};

export function getManifest() {
  return MANIFEST;
}

/**
 * Robustní render, kompatibilní s routerem:
 * - očekávané volání ze systému: render(root, params)
 *   kde params může obsahovat { kind: 'tile'|'form', id: '...' }
 * - pokud params neobsahuje kind/id, pokusíme se je odvodit z location.hash
 * - dynamicky importujeme odpovídající soubor a zavoláme jeho renderer
 * - podporujeme různé tvary exportů v cílovém modulu:
 *     export function render(root, params) { ... }
 *     export default { render }   -> zavoláme default.render(root, params)
 *     export default function(root) { ... } -> zavoláme default(root, params)
 */
export async function render(root, params = {}) {
  root.innerHTML = `<div class="text-slate-500 p-2">Načítám…</div>`;

  // získat kind/id z params nebo z hashe
  let kind = params.kind; // 'tile' | 'form'
  let id = params.id || params.form || params.tile;

  if (!kind || !id) {
    // zkusíme parsovat location.hash (fallback)
    const hash = location.hash || '';
    // očekávané cesty: #/m/060-smlouva/t/prehled?... nebo #/m/060-smlouva/f/edit?...
    const m = hash.match(/#\/m\/([^\/]+)\/(t|f)\/([^?\s/]+)/);
    if (m) {
      kind = kind || (m[2] === 't' ? 'tile' : 'form');
      id = id || m[3];
    }
  }

  if (!kind || !id) {
    root.innerHTML = `
      <div class="p-3 bg-rose-50 border border-rose-200 rounded text-rose-700">
        Modul <b>${MANIFEST.id}</b> byl zavolán bez určení sekce (tile/form) nebo id.
      </div>`;
    return;
  }

  try {
    const folder = kind === 'tile' ? 'tiles' : 'forms';
    // dynamický import
    const mod = await import(`./${folder}/${id}.js`);

    // Najdeme funkci, kterou lze zavolat:
    // preferujeme exportovanou funkci render, pak default.render, pak default (pokud je to funkce).
    const renderer =
      mod.render ||
      (mod.default && (mod.default.render || (typeof mod.default === 'function' ? mod.default : null)));

    if (!renderer || typeof renderer !== 'function') {
      root.innerHTML = `
        <div class="p-3 bg-rose-50 border border-rose-200 rounded text-rose-700">
          Načtený modul <b>${MANIFEST.id}/${kind}/${id}</b> neobsahuje volatelnou funkci render.
        </div>`;
      console.error('[MODULE render error] no renderer found', MANIFEST.id, kind, id, mod);
      return;
    }

    // zavoláme renderer; některé moduly očekávají (mountEl) nebo (root, params) — zkusíme oboje
    const arity = renderer.length || 0;
    if (arity >= 2) {
      // pravděpodobně render(root, params)
      await renderer(root, params);
    } else {
      // fallback: render(mountEl)
      await renderer(root);
    }
  } catch (err) {
    console.error('[MODULE render error]', MANIFEST.id, kind, id, err);
    root.innerHTML = `
      <div class="p-3 bg-rose-50 border border-rose-200 rounded text-rose-700">
        Tuto sekci se nepodařilo načíst: <b>${kind}/${id}</b>.
        <div class="mt-2 text-sm text-rose-600">(${err && err.message ? err.message : err})</div>
      </div>`;
  }
}

export async function getActions(ctx) {
  // ctx: { kind: 'tile'|'form', id: '...' }
  if (ctx.kind === 'tile' && ctx.id === 'prehled') {
    return [
      { label: 'Obnovit', icon: '🔄', onClick: () => location.reload() }
    ];
  }
  return [];
}

// také export default pro případ, že loader očekává default objekt
export default { getManifest, render, getActions };
