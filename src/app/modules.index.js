// src/app/modules.index.js
export async function registerModules() {
  const reg = window.registry; // Map
  const loaders = [
  () => import('../modules/010-sprava-uzivatelu/module.config.js'),
  () => import('../modules/020-muj-ucet/module.config.js'),
  () => import('../modules/030-pronajimatel/module.config.js'),
  // () => import('../modules/040-nemovitost/module.config.js'),
  // () => import('../modules/050-najemnik/module.config.js'),
  // () => import('../modules/060-smlouva/module.config.js'),
  // () => import('../modules/070-sluzby/module.config.js'),
  // () => import('../modules/080-platby/module.config.js'),
  // () => import('../modules/090-finance/module.config.js'),
  // () => import('../modules/100-energie/module.config.js'),
  // () => import('../modules/110-udrzba/module.config.js'),
  // () => import('../modules/120-dokumenty/module.config.js'),
  // () => import('../modules/130-komunikace/module.config.js'),
  // () => import('../modules/900-nastaveni/module.config.js'),
  // () => import('../modules/990-help/module.config.js'),
];
// Odkomentuj další řádky až budou moduly vytvořené.
for (const load of loaders) {
    try {
      const mod = (await load()).default;
      if (reg && typeof reg.set === 'function') reg.set(mod.id, mod);
      else if (reg?.register) reg.register(mod);
      else (window.registry ??= new Map()).set(mod.id, mod);
    } catch (e) {
      console.error('[MODULE LOAD FAILED]', e);
    }
  }
}
