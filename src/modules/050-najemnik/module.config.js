import { listSubjects } from '/src/db/subjects.js';

export async function getManifest() {
  // Define subject types with their configuration
  const subjectTypes = [
    { id: 'osoba', title: 'Osoba', icon: 'person', type: 'osoba' },
    { id: 'osvc', title: 'OSVČ', icon: 'briefcase', type: 'osvc' },
    { id: 'firma', title: 'Firma', icon: 'building', type: 'firma' },
    { id: 'spolek', title: 'Spolek / Skupina', icon: 'people', type: 'spolek' },
    { id: 'stat', title: 'Státní instituce', icon: 'bank', type: 'stat' },
    { id: 'zastupce', title: 'Zástupci', icon: 'handshake', type: 'zastupce' }
  ];

  // Create overview tile with nested type views
  const tiles = [
    {
      id: 'prehled',
      title: 'Přehled nájemníků',
      icon: 'list',
      collapsible: true,
      children: []
    }
  ];

  // Fetch counts for each type and add as children only if count > 0
  try {
    for (const typeConfig of subjectTypes) {
      try {
        const { data: items = [] } = await listSubjects({
          role: 'najemnik',
          type: typeConfig.type,
          showArchived: false,
          limit: 500
        });
        const count = Array.isArray(items) ? items.length : 0;
        
        if (count > 0) {
          tiles[0].children.push({
            id: typeConfig.id,
            title: `${typeConfig.title} (${count})`,
            icon: typeConfig.icon,
            count: count,
            type: typeConfig.type
          });
        }
      } catch (e) {
        console.error(`Error counting ${typeConfig.type}:`, e);
      }
    }
  } catch (e) {
    console.error('Error loading subject types:', e);
  }

  return {
    id: '050-najemnik',
    title: 'Nájemník',
    icon: 'users',
    defaultTile: 'prehled',
    tiles,
    // Forms should NOT appear in sidebar (showInSidebar: false)
    forms: [
      { id: 'chooser', title: 'Nový nájemník', icon: 'grid', showInSidebar: false },
      { id: 'detail', title: 'Detail nájemníka', icon: 'view', showInSidebar: false },
      { id: 'subject-type', title: 'Správa typu subjektů', icon: 'settings', showInSidebar: true }
    ]
  };
}
