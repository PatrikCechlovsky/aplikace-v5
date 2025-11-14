// src/modules/130-komunikace/module.config.js
// Modul 130 – Komunikace

const MANIFEST = {
  id: '130-komunikace',
  title: 'Komunikace',
  icon: 'email',
  defaultTile: 'komunikace',

  tiles: [
    { id: 'komunikace', title: 'Komunikace', icon: 'forum' },
    { id: 'sablony', title: 'Šablony', icon: 'mail' },
    { id: 'automatizace', title: 'Automatizace', icon: 'auto_mode' },
  ],
  forms: [
    { id: 'message-detail', title: 'Detail zprávy', icon: 'visibility' },
    { id: 'message-edit', title: 'Nová zpráva', icon: 'add' },
    { id: 'template-detail', title: 'Detail šablony', icon: 'visibility' },
    { id: 'template-edit', title: 'Editace šablony', icon: 'edit' },
    { id: 'automation-detail', title: 'Detail automatizace', icon: 'visibility' },
    { id: 'automation-edit', title: 'Editace automatizace', icon: 'edit' },
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
  if (ctx.kind === 'tile' && ctx.id === 'komunikace') {
    return [
      { label: 'Obnovit', icon: '🔄', onClick: () => location.reload() }
    ];
  }
  return [];
}
