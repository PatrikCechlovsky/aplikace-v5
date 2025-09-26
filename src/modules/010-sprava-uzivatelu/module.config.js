// Konfigurace modulu 010 – Správa uživatelů (v4 styl)
export default {
  id: '010-uzivatele',
  title: 'Uživatelé',
  icon: '👥',
  tiles: [
    { id: 'seznam',  label: 'Seznam',  icon: '📄' },
    { id: 'prehled', label: 'Přehled', icon: '🗂️' },
    { id: 'list',    label: 'List',    icon: '🧾' },
  ],
  forms: [
    { id: 'create', label: 'Nový',    icon: '➕' },
    { id: 'edit',   label: 'Upravit', icon: '✏️' },
    { id: 'novy',   label: 'Nový (alt)', icon: '🆕' },
  ],
};
