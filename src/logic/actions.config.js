// src/logic/actions.config.js
// Centrální registr všech akcí (tlačítek) v aplikaci
// Každá akce má klíč, popis, ikonu, případně handler nebo vazbu na oprávnění

export const ACTIONS_CONFIG = [
  {
    key: 'add',
    label: 'Přidat',
    icon: 'add',
    color: 'green',
    requiresPermission: 'can_add',
    handler: 'openCreateForm'
  },
  {
    key: 'edit',
    label: 'Upravit',
    icon: 'edit',
    color: 'blue',
    requiresPermission: 'can_edit',
    handler: 'openEditForm'
  },
  {
    key: 'archive',
    label: 'Archivovat',
    icon: 'archive',
    color: 'amber',
    requiresPermission: 'can_archive',
    handler: 'archiveItem'
  },
  {
    key: 'attach',
    label: 'Příloha',
    icon: 'paperclip',
    color: 'gray',
    requiresPermission: 'can_attach',
    handler: 'openAttachments'
  },
  {
    key: 'refresh',
    label: 'Obnovit',
    icon: 'refresh',
    color: 'gray',
    requiresPermission: 'can_refresh',
    handler: 'refreshView'
  },
  {
    key: 'detail',
    label: 'Detail',
    icon: 'detail',
    color: 'blue',
    requiresPermission: 'can_view',
    handler: 'openDetail'
  },
  {
    key: 'search',
    label: 'Hledat',
    icon: 'search',
    color: 'gray',
    requiresPermission: 'can_search',
    handler: 'toggleSearch'
  },
  {
    key: 'print',
    label: 'Tisk',
    icon: 'print',
    color: 'gray',
    requiresPermission: 'can_print',
    handler: 'printData'
  },
  {
    key: 'export',
    label: 'Exportovat',
    icon: 'export',
    color: 'gray',
    requiresPermission: 'can_export',
    handler: 'exportData'
  },
  {
    key: 'import',
    label: 'Importovat',
    icon: 'import',
    color: 'gray',
    requiresPermission: 'can_import',
    handler: 'importData'
  },
  {
    key: 'delete',
    label: 'Smazat',
    icon: 'delete',
    color: 'red',
    requiresPermission: 'can_delete',
    handler: 'deleteItem'
  },
  {
    key: 'approve',
    label: 'Schválit',
    icon: 'approve',
    color: 'green',
    requiresPermission: 'can_approve',
    handler: 'approveItem'
  },
  {
    key: 'reject',
    label: 'Zamítnout',
    icon: 'reject',
    color: 'red',
    requiresPermission: 'can_reject',
    handler: 'rejectItem'
  }
];

// 🔸 Pomocná funkce – najde definici akce podle klíče
export function getActionConfig(key) {
  return ACTIONS_CONFIG.find(a => a.key === key);
}

// 🔸 Vrátí seznam všech známých klíčů
export function getAllActionKeys() {
  return ACTIONS_CONFIG.map(a => a.key);
}
