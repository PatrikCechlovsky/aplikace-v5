// src/modules/080-platby/module.config.js
// Modul pro správu plateb

const MANIFEST = {
  id: '080-platby',
  title: 'Platby',
  icon: 'payments',
  defaultTile: 'prehled',

  tiles: [
    { id: 'prehled', title: 'Přehled', icon: 'list' },
    { id: 'prijate', title: 'Přijaté platby', icon: 'south' },
    { id: 'cekajici', title: 'Čekající na zpracování', icon: 'schedule' },
    { id: 'pouzite', title: 'Použité', icon: 'check_circle' },
    { id: 'vratky', title: 'Vrácené platby', icon: 'undo' },
  ],
  forms: [
    { id: 'detail', title: 'Detail platby', icon: 'visibility' },
    { id: 'edit', title: 'Vložit platbu', icon: 'add' },
    { id: 'alokace', title: 'Alokace platby', icon: 'account_tree' },
    { id: 'import', title: 'Import plateb', icon: 'upload_file' },
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
