// src/modules/120-dokumenty/module.config.js
// Modul 120 – Dokumenty

const MANIFEST = {
  id: '120-dokumenty',
  title: 'Dokumenty',
  icon: 'description',
  defaultTile: 'dokumenty',

  tiles: [
    { id: 'dokumenty', title: 'Dokumenty', icon: 'folder' },
    { id: 'sablony', title: 'Šablony', icon: 'article' },
  ],
  forms: [
    { id: 'document-detail', title: 'Detail dokumentu', icon: 'visibility' },
    { id: 'document-edit', title: 'Editace dokumentu', icon: 'edit' },
    { id: 'template-detail', title: 'Detail šablony', icon: 'visibility' },
    { id: 'template-edit', title: 'Editace šablony', icon: 'edit' },
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
  if (ctx.kind === 'tile' && ctx.id === 'dokumenty') {
    return [
      { label: 'Obnovit', icon: '🔄', onClick: () => location.reload() }
    ];
  }
  return [];
}
