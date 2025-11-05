// Manifest modulu 040 - Nemovitosti
// Dynamicky generuje hierarchické tiles pro nemovitosti a jednotky podle typů

import { listPropertyTypes, listProperties, listUnitTypes } from './db.js';
import { supabase } from '/src/supabase.js';

// Normalize slug to match filenames in tiles/ (lowercase, underscores -> dashes)
function normalizeSlug(slug) {
  if (!slug && slug !== 0) return slug;
  return String(slug).trim().toLowerCase().replace(/_/g, '-');
}

export async function getManifest() {
  // Přehled nemovitostí - collapsible with property type children
  const prehledNemovitosti = {
    id: 'prehled',
    title: 'Přehled nemovitostí',
    icon: 'list',
    collapsible: true,
    children: []
  };

  // Přehled jednotek - collapsible with unit type children
  const prehledJednotek = {
    id: 'unit-prehled',
    title: 'Přehled jednotek',
    icon: 'grid',
    collapsible: true,
    children: []
  };

  try {
    // Načti definované typy nemovitostí z DB
    const { data: propertyTypes = [] } = await listPropertyTypes();
    // Pro každý typ zkontroluj, jestli existuje alespoň jeden záznam a spočti počet
    for (const t of propertyTypes) {
      try {
        const { data: items = [] } = await listProperties({ type: t.slug, showArchived: false, limit: 500 });
        const count = Array.isArray(items) ? items.filter(item => !item.archived).length : 0;
        if (count > 0) {
          // Normalize slug => match filename convention (e.g. admin-budova.js)
          const id = normalizeSlug(t.slug || t.id || t.name);

          prehledNemovitosti.children.push({
            id: id,
            title: `${t.label || t.slug} (${count})`,
            icon: t.icon || 'building',
            count: count,
            type: t.slug
          });
        }
      } catch (e) {
        console.error(`Error counting property type ${t.slug}:`, e);
      }
    }
  } catch (e) {
    console.error('Error loading property types:', e);
  }

  try {
    // Načti definované typy jednotek z DB
    const { data: unitTypes = [] } = await listUnitTypes();
    // Pro každý typ zkontroluj počet jednotek
    for (const t of unitTypes) {
      try {
        let query = supabase
          .from('units')
          .select('id, typ_jednotky, archived')
          .eq('typ_jednotky', t.slug)
          .limit(500);
        
        // Filter out archived
        query = query.or('archived.is.null,archived.eq.false');
        
        const { data: items = [] } = await query;
        const count = Array.isArray(items) ? items.length : 0;
        
        if (count > 0) {
          const id = normalizeSlug(t.slug || t.id || t.name);
          prehledJednotek.children.push({
            id: `unit-${id}`,
            title: `${t.label || t.slug} (${count})`,
            icon: t.icon || 'box',
            count: count,
            type: t.slug
          });
        }
      } catch (e) {
        console.error(`Error counting unit type ${t.slug}:`, e);
      }
    }
  } catch (e) {
    console.error('Error loading unit types:', e);
  }

  const tiles = [prehledNemovitosti, prehledJednotek];

  return {
    id: '040-nemovitost',
    title: 'Nemovitosti',
    icon: 'building',
    defaultTile: 'prehled',
    tiles,
    forms: [
      { id: 'chooser', title: 'Nová nemovitost', icon: 'add', showInSidebar: false },
      { id: 'unit-chooser', title: 'Nová jednotka', icon: 'add', showInSidebar: false },
      { id: 'property-type', title: 'Správa typů nemovitostí', icon: 'settings', showInSidebar: true },
      { id: 'unit-type', title: 'Správa typů jednotek', icon: 'settings', showInSidebar: true },
      { id: 'edit', title: 'Editace nemovitosti', icon: 'edit', showInSidebar: false },
      { id: 'detail', title: 'Detail nemovitosti', icon: 'eye', showInSidebar: false },
      { id: 'unit-edit', title: 'Editace jednotky', icon: 'edit', showInSidebar: false },
      { id: 'unit-detail', title: 'Detail jednotky', icon: 'eye', showInSidebar: false }
    ],
  };
}

export default { getManifest };
