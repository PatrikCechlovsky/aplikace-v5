// src/modules/070-sluzby/module.config.js
// Modul pro správu služeb (energie, voda, internet atd.)

const MANIFEST = {
  id: '070-sluzby',
  title: 'Služby',
  icon: 'settings',
  defaultTile: 'prehled',

  tiles: [
    { id: 'prehled', title: 'Přehled', icon: 'list' },
    { id: 'katalog', title: 'Katalog služeb', icon: 'list_alt' },
    { id: 'energie', title: 'Energie', icon: 'bolt' },
    { id: 'voda', title: 'Voda', icon: 'water_drop' },
    { id: 'internet', title: 'Internet', icon: 'wifi' },
    { id: 'spravne-poplatky', title: 'Správné poplatky', icon: 'account_balance' },
  ],
  forms: [
    { id: 'detail', title: 'Detail služby', icon: 'visibility' },
    { id: 'edit', title: 'Editace služby', icon: 'edit' },
    { id: 'pridat-do-smlouvy', title: 'Přidat službu do smlouvy', icon: 'add_circle' },
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
