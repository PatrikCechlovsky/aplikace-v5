// src/modules/999-test-moduly/module.config.js
// Testovací modul pro vývojové účely

export async function getManifest() {
  return {
    id: '999-test-moduly',
    title: 'Test moduly',
    icon: 'test',
    defaultTile: 'prehled',
    tiles: [
      { id: 'prehled', title: 'Přehled', icon: 'list' },
      { id: 'seznam', title: 'Seznam', icon: 'table' },
    ],
    forms: [
      { id: 'detail', title: 'Detail', icon: 'view' },
      { id: 'edit', title: 'Editace', icon: 'edit' },
    ],
  };
}

export default { getManifest };
