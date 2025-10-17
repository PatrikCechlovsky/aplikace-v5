// src/security/permissions.js
// Jednotná vrstva pro řízení oprávnění podle role uživatele
// Verze 1.1 – umožněné dynamické načtení/registrace per-role oprávnění

import { ACTIONS_CONFIG } from '../logic/actions.config.js';

// ====== START: výchozí statické demo (může být přepsáno dynamicky) ======
let ROLE_PERMISSIONS = {
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
// ====== END: výchozí statické demo ======

// Volitelná loader funkce, kterou lze zaregistrovat (např. v app.js nebo přes window)
let _permissionsLoader = null;

/**
 * Register callback for loading permissions for a role.
 * Callback must be: async function(role) => Array<string> | null
 */
export function registerPermissionsLoader(fn) {
  if (typeof fn === 'function') _permissionsLoader = fn;
}

/**
 * Explicitně nastavit oprávnění pro roli (přepíše/nahraď).
 */
export function setRolePermissions(role, keys = []) {
  ROLE_PERMISSIONS = { ...ROLE_PERMISSIONS, [role]: Array.isArray(keys) ? keys : [] };
}

/**
 * Merging helper – přidá chybějící položky k existujícímu seznamu.
 */
export function mergeRolePermissions(role, keys = []) {
  const existing = ROLE_PERMISSIONS[role] || [];
  const merged = Array.from(new Set([...existing, ...(Array.isArray(keys) ? keys : [])]));
  ROLE_PERMISSIONS = { ...ROLE_PERMISSIONS, [role]: merged };
}

/**
 * Pokusí se načíst oprávnění pro roli:
 * - pokud je registrovaný _permissionsLoader → zavolá ho
 * - jinak se pokusí dynamicky importovat '../db.js' a volat getRolePermissions(role) pokud existuje
 * - pokud nic nevrátí, zůstane použit výchozí ROLE_PERMISSIONS (statické)
 *
 * Vrací aktuální seznam povolených klíčů pro roli (pole stringů).
 */
export async function loadPermissionsForRole(role) {
  if (!role) return [];

  try {
    // 1) registrovaný loader (preferovaný)
    if (typeof _permissionsLoader === 'function') {
      const res = await _permissionsLoader(role);
      if (Array.isArray(res)) {
        setRolePermissions(role, res);
        return getUserPermissions(role);
      }
    }

    // 2) fallback: pokusit se dynamicky importovat db helper a zavolat getRolePermissions
    try {
      const db = await import('../db.js');
      if (db && typeof db.getRolePermissions === 'function') {
        const { data, error } = await db.getRolePermissions(role);
        if (!error && Array.isArray(data)) {
          setRolePermissions(role, data);
          return getUserPermissions(role);
        }
      }
    } catch (e) {
      // ignoruj, není to kritické — použijeme lokální ROLE_PERMISSIONS
    }
  } catch (e) {
    // swallow errors — nechceme, aby selhání načítání permissions zlomilo aplikaci
    console.warn('[permissions] loadPermissionsForRole failed', e);
  }

  // 3) fallback: vrať to, co máme lokálně
  return getUserPermissions(role);
}

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

export default {
  getUserPermissions,
  canPerform,
  getAllowedActions,
  getAllRoles,
  describeRole,
  setRolePermissions,
  mergeRolePermissions,
  loadPermissionsForRole,
  registerPermissionsLoader
};
