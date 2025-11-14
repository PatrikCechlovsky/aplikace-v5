// src/modules/090-finance/module.config.js
// Modul 090 – Finance (dashboard / přehledy)

const MANIFEST = {
  id: '090-finance',
  title: 'Finance',
  icon: 'account_balance',
  defaultTile: 'finance',

  tiles: [
    { id: 'finance', title: 'Finance', icon: 'account_balance_wallet' },
    { id: 'dashboard', title: 'Přehledy', icon: 'dashboard' },
  ],
  forms: [
    { id: 'bankaccount-detail', title: 'Detail bankovního účtu', icon: 'account_balance' },
    { id: 'context-readonly', title: 'Kontext', icon: 'visibility' },
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
  if (ctx.kind === 'tile' && ctx.id === 'dashboard') {
    return [
      { label: 'Obnovit', icon: '🔄', onClick: () => location.reload() }
    ];
  }
  return [];
}
