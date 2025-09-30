*** src/modules/010-sprava-uzivatelu/module.config.js
@@

export async function getManifest() {
   return {
     id: '010-uzivatele',
     title: 'Uživatelé',
     icon: '👥',
     tiles: [

      { id: 'prehled', title: 'Přehled', icon: 'list' }
     ],
     forms: [
       { id: 'read',   title: 'Detail' },
       { id: 'edit',   title: 'Upravit' },
       { id: 'create', title: 'Nový / Pozvat' }
     ],

    defaultTile: 'prehled',
   };
 }
