// src/modules/100-energie/module.config.js
// Modul 100 – Energie (měřidla, odečty, rozúčtování)

const MANIFEST = {
  id: '100-energie',
  title: 'Energie',
  icon: 'bolt',
  defaultTile: 'meridla',

  tiles: [
    { id: 'meridla', title: 'Měřidla', icon: 'speed' },
    { id: 'odecty', title: 'Odečty', icon: 'fact_check' },
    { id: 'rozuctovani', title: 'Rozúčtování', icon: 'calculate' },
  ],
  forms: [
    { id: 'meter-detail', title: 'Detail měřidla', icon: 'visibility' },
    { id: 'meter-edit', title: 'Editace měřidla', icon: 'edit' },
    { id: 'reading-detail', title: 'Detail odečtu', icon: 'visibility' },
    { id: 'reading-edit', title: 'Zadání odečtu', icon: 'add' },
    { id: 'allocation-detail', title: 'Detail rozúčtování', icon: 'visibility' },
  ],
};

export function getManifest() {
  return MANIFEST;
}

// Jednotné vykreslení: 'tile' (dlaždice) / 'form' (formuláře)
export async function render(kind, id, mountEl) {
  mountEl.innerHTML = `<div class="text-slate-500 p-2">Načítám…</div>`;
  try {
    if (kind === 'tile') {
      const mod = await import(`./tiles/${id}.js`);
      await mod.default(mountEl);
    } else {
      const mod = await import(`./forms/${id}.js`);
      await mod.default(mountEl);
    }
  } catch (err) {
    console.error('[MODULE render error]', MANIFEST.id, kind, id, err);
    mountEl.innerHTML = `
      <div class="p-3 bg-rose-50 border border-rose-200 rounded text-rose-700">
        Tuto sekci se nepodařilo načíst: <b>${kind}/${id}</b>.
      </div>`;
  }
}

// Volitelné: akce vpravo u breadcrumbs (může vracet prázdné pole)
export async function getActions(ctx) {
  if (ctx.kind === 'tile' && ctx.id === 'meridla') {
    return [
      { label: 'Obnovit', icon: '🔄', onClick: () => location.reload() }
    ];
  }
  return [];
}
