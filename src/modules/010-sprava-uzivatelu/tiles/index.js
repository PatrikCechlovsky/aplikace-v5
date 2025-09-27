import { icon } from '../../../ui/icons.js';

export async function renderTile(tileId, root) {
  root.innerHTML = ''; // wipe

  switch (tileId) {
    case 'seznam': {
      const view = await import('./seznam.js'); // lazy
      return view.default(root);
    }
    default: {
      root.innerHTML = `
        <div class="p-4 bg-white rounded-2xl border">
          Neznámá dlaždice: <b>${tileId}</b>
        </div>`;
      return;
    }
  }
}

// Volitelně: export malého helperu pro breadcrumbs nebo actions
export function getTileMeta(tileId) {
  return {
    label: tileId === 'seznam' ? 'Seznam' : tileId,
    icon: icon('list'),
  };
}
