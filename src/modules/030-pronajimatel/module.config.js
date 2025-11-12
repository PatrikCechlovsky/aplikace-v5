import { listSubjectTypes, getSubjectsCountsByType } from '/src/db/subjects.js';

export async function getManifest() {
  // Create overview tile with nested type views
  const tiles = [
    {
      id: 'prehled',
      title: 'Přehled pronajímatelů',
      icon: 'list',
      collapsible: true,
      children: []
    }
  ];

  // Fetch subject types from database and counts efficiently
  try {
    // call helper and ensure we always have an array
    const resTypes = await listSubjectTypes();
    const subjectTypes = Array.isArray(resTypes?.data) ? resTypes.data : [];

    // get counts (with safe fallback)
    const { data: countData, error: countError } = await getSubjectsCountsByType({
      role: 'pronajimatel',
      showArchived: false
    });

    if (countError) {
      console.error('Error loading subject counts:', countError);
      // Continue with empty counts on error
    }

    const countsMap = Object.fromEntries((countData || []).map(c => [c.type, c.count]));

    // Add types with counts to sidebar
    for (const typeConfig of subjectTypes) {
      // guard: skip invalid entries
      if (!typeConfig || typeof typeConfig !== 'object') continue;
      const slug = typeConfig.slug;
      const label = typeConfig.label || slug || 'Typ';
      const count = countsMap[slug] || 0;

      if (count > 0) {
        tiles[0].children.push({
          id: slug,
          title: `${label} (${count})`,
          icon: typeConfig.icon || 'person',
          count: count,
          type: slug
        });
      }
    }
  } catch (e) {
    console.error('Error loading subject types:', e);
  }

  return {
    id: '030-pronajimatel',
    title: 'Pronajímatel',
    icon: 'home',
    defaultTile: 'prehled',
    tiles,
    // Forms should NOT appear in sidebar (showInSidebar: false)
    forms: [
      { id: 'chooser', title: 'Nový subjekt', icon: 'add', showInSidebar: false },
      { id: 'detail', title: 'Detail pronajímatele', icon: 'view', showInSidebar: false },
      { id: 'detail-tabs', title: 'Přehled vazeb', icon: 'grid', showInSidebar: false },
      { id: 'form', title: 'Formulář', icon: 'form', showInSidebar: false },
      { id: 'subject-type', title: 'Správa typu subjektů', icon: 'settings', showInSidebar: true }
    ]
  };
}
