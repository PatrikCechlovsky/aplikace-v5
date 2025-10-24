// Manifest modulu 040 - Nemovitosti
// Dynamicky generuje tiles pro každý typ nemovitosti pouze pokud existuje alespoň 1 záznam.

import { listPropertyTypes, listProperties } from './db.js';

export async function getManifest() {
  const tiles = [
    { id: 'prehled', title: 'Přehled', icon: 'list' } // stále vždy dostupné
  ];

  try {
    // Načti definované typy z DB (pokud modul podporuje)
    const { data: types = [] } = await listPropertyTypes();
    // Pro každý typ zkontroluj, jestli existuje alespoň jeden záznam
    for (const t of types) {
      try {
        const { data: items = [] } = await listProperties({ type: t.slug, limit: 1 });
        if (Array.isArray(items) && items.length > 0) {
          // Přidej tile do sidebaru pouze pokud existuje záznam
          tiles.push({
            id: t.slug,                // očekává se odpovídající soubor tiles/<slug>.js
            title: t.label || t.slug,
            icon: t.icon || 'building'
          });
        }
      } catch (e) {
        // Pokud dotaz na properties pro tento typ selže, ignoruj a pokračuj
        // (nezpůsobí to pád celého manifestu)
        // console.warn('[module.manifest] listProperties failed for', t.slug, e);
      }
    }
  } catch (e) {
    // pokud načtení typů selže, vynechíme dynamické položky (fallback je jen 'prehled')
    // console.warn('[module.manifest] listPropertyTypes failed', e);
  }

  return {
    id: '040-nemovitost',
    title: 'Nemovitosti',
    icon: 'building',
    defaultTile: 'prehled',
    tiles,
    forms: [
      // skryté ve sidebaru (zobrazí se jako drobečková navigace při výběru detailu/formy)
      { id: 'edit', title: 'Nová nemovitost', icon: 'add', showInSidebar: false },
      { id: 'detail', title: 'Detail nemovitosti', icon: 'eye', showInSidebar: false },
      { id: 'unit-edit', title: 'Nová jednotka', icon: 'add', showInSidebar: false },
      { id: 'unit-detail', title: 'Detail jednotky', icon: 'eye', showInSidebar: false },
      { id: 'chooser', title: 'Výběr typu nemovitosti', icon: 'grid', showInSidebar: false },
      { id: 'unit-chooser', title: 'Výběr typu jednotky', icon: 'grid', showInSidebar: false },
      { id: 'property-type', title: 'Správa typů nemovitostí', icon: 'settings', showInSidebar: false },
      { id: 'unit-type', title: 'Správa typů jednotek', icon: 'settings', showInSidebar: false }
    ],
  };
}

export default { getManifest };
