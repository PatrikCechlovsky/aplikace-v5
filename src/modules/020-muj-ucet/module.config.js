// Modul 020 – Můj účet (uživatel může upravit jen své zobrazené jméno)
export async function getManifest() {
  return {
    id: '020-muj-ucet',
    title: 'Můj účet',
    icon: '👤',
    tiles: [
      { id: 'prehled', title: 'Přehled' },
      { id: 'seznam',  title: 'Seznam' } // volitelně, pokud bude dávat smysl
    ],
    forms: [
      { id: 'detail', title: 'Detail' },
      { id: 'edit',   title: 'Upravit profil' }
    ],
    defaultTile: 'prehled',
  };
}
