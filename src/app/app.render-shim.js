// src/app/app.render-shim.js

/**
 * Bezpečně spustí renderer z dynamicky importovaného modulu.
 * Podporuje různé varianty exportu (render, default.render, default funkce).
 * Pokud selže, ukáže hezkou chybu a zaloguje detaily do konzole.
 */
export async function runRenderer(modPromise, root, params, debugTag) {
  try {
    const mod = await modPromise;

    // Najdeme render funkci v několika variantách
    const r =
      mod?.render ||
      mod?.default?.render ||
      (typeof mod?.default === 'function' ? mod.default : null) ||
      (typeof mod === 'function' ? mod : null);

    // Pro debug do konzole
    console.log('[ROUTE]', debugTag, Object.keys(mod || {}), mod);

    if (typeof r !== 'function') {
      throw new Error(`Renderer missing in ${debugTag}`);
    }

    // Spuštění renderu
    await r(root, params);
  } catch (err) {
    console.error('[ROUTE ERROR]', debugTag, err);
    root.innerHTML = `
      <div class="p-3 rounded bg-red-50 border border-red-200 text-red-700 text-sm">
        Nepodařilo se načíst modul/sekci.<br>
        <code>${debugTag}</code><br>
        ${err?.message || err}
      </div>`;
  }
}
