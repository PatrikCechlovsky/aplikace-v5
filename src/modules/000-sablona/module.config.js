// src/modules/000-sablona/module.config.js
// „Hloupý“ modul: manifest říká jen CO a v jakém pořadí. Chování má každá část ve svém souboru.

// !!! PO ZKOPÍROVÁNÍ NAHRAĎ PLACEHOLDERY:
// __MODULE_ID__     → např. '030-pronajimatel'
// __MODULE_TITLE__  → např. 'Pronajímatel'
// __ICON__          → např. '🏢' nebo klíč z registru ikon

const MANIFEST = {
  id: '__MODULE_ID__',
  title: '__MODULE_TITLE__',
  icon: '__ICON__',
  defaultTile: 'seznam',

  tiles: [
    { id: 'prehled', title: 'Přehled' },
    { id: 'seznam',  title: 'Seznam'  },
  ],
  forms: [
    { id: 'detail',  title: 'Detail'  },
    { id: 'edit',    title: 'Editace' },
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
  if (ctx.kind === 'tile' && ctx.id === 'seznam') {
    return [
      { label: 'Obnovit', icon: '🔄', onClick: () => location.reload() }
    ];
  }
  return [];
}
