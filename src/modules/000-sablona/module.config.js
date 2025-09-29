// src/modules/000-sablona/module.config.js
// "Hloupý" modul: manifest definuje jen seznam částí a jejich pořadí.
// Vlastní chování má každá tile/form ve svém souboru.

const MANIFEST = {
  // !!! NAHRAĎ __MODULE_ID__ a __MODULE_TITLE__ a __ICON__ po zkopírování složky !!!
  id: '__MODULE_ID__',            // např. '030-pronajimatel'
  title: '__MODULE_TITLE__',      // např. 'Pronajímatel'
  icon: '__ICON__',               // např. '🏢' nebo klíč do icons.js
  defaultTile: 'seznam',

  // pořadí v sidebaru = pořadí v těchto polích
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

// Jednotné vykreslení: dlaždice vs formuláře
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

// Volitelné: akce do pravé lišty u breadcrumbs (můžeš vracet prázdné)
export async function getActions(ctx) {
  // ctx: { kind: 'tile'|'form', id: '...' }
  // Příklad: pro tile 'seznam' nabídnout Obnovit
  if (ctx.kind === 'tile' && ctx.id === 'seznam') {
    return [
      { label: 'Obnovit', icon: '🔄', onClick: () => location.reload() }
    ];
  }
  return [];
}

