// src/app/app.render-shim.js
export function pickRenderer(mod) {
  return mod?.render
      || mod?.default?.render
      || (typeof mod?.default === 'function' ? mod.default : null)
      || (typeof mod === 'function' ? mod : null);
}