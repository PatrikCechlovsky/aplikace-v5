// src/security/permissions.js
// Jednotná vrstva pro řízení oprávnění podle role uživatele
// Verze 1.0 – statické demo, později napojíme na Supabase tabulky (roles, permissions, role_permissions)

import { ACTIONS_CONFIG } from '../logic/actions.config.js';

// ====== DEMO: role a jejich oprávnění (zatím lokálně) ======
export const ROLE_PERMISSIONS = {
  admin: [
    'add', 'edit', 'archive', 'attach', 'refresh',
    'detail', 'search', 'print', 'export', 'import',
    'delete', 'approve', 'reject'
  ],
  pronajimatel: [
    'add', 'edit', 'attach', 'refresh', 'detail', 'search', 'print'
  ],
  najemnik: [
    'detail', 'refresh', 'search'
  ],
  servisak: [
    'detail', 'refresh', 'attach'
  ]
};

// ====== Funkce: získat oprávnění podle role ======
export function getUserPermissions(role) {
  return ROLE_PERMISSIONS[role] || [];
}

// ====== Funkce: zjistit, zda role smí provést konkrétní akci ======
export function canPerform(role, actionKey) {
  const allowed = getUserPermissions(role);
  return allowed.includes(actionKey);
}

// ====== Funkce: vybrat povolené akce pro modul ======
export function getAllowedActions(role, moduleActions = []) {
  const allowedKeys = getUserPermissions(role);
  const filtered = moduleActions.filter(a => allowedKeys.includes(a));
  return ACTIONS_CONFIG.filter(cfg => filtered.includes(cfg.key));
}

// ====== Pomocné: seznam všech známých rolí ======
export function getAllRoles() {
  return Object.keys(ROLE_PERMISSIONS);
}

// ====== Pomocné: textový popis role (pro UI) ======
export function describeRole(role) {
  switch (role) {
    case 'admin': return 'Administrátor – má plný přístup ke všem akcím.';
    case 'pronajimatel': return 'Pronajímatel – běžná správa, úpravy a přehledy.';
    case 'najemnik': return 'Nájemník – může pouze prohlížet a tisknout.';
    case 'servisak': return 'Servisák – přístup k údržbě a přílohám.';
    default: return 'Neznámá role';
  }
}
