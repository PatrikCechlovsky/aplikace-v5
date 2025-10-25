// src/modules/060-smlouva/module.config.js
// Modul pro správu nájemních smluv

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
  // ctx: { kind: 'tile'|'form', id: '...' }
  if (ctx.kind === 'tile' && ctx.id === 'prehled') {
    return [
      { label: 'Obnovit', icon: '🔄', onClick: () => location.reload() }
    ];
  }
  return [];
}
