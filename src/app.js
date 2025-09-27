// --- SAFE BOOT ---
console.log('[APP] start (safe boot)');

const $ = (id) => document.getElementById(id);
const setHTML = (el, html) => { if (el) el.innerHTML = html; };
const clear = (el) => { if (el) el.innerHTML = ''; };

function renderSidebarFallback(mods = []) {
  const sb = $('#sidebar'); if (!sb) return;
  sb.innerHTML = `<ul class="space-y-1 text-slate-900">
    ${mods.map(m => {
      const first = m.defaultTile || (m.tiles && m.tiles[0] && m.tiles[0].id) || '';
      const href  = `#/m/${m.id}${first ? `/t/${first}` : ''}`;
      return `<li><a class="block px-3 py-2 rounded hover:bg-slate-100" href="${href}">
        ${m.icon || '📁'} ${m.title}</a></li>`;
    }).join('')}
  </ul>`;
}

function renderFatalError(message) {
  setHTML($('#content'), `
    <div class="p-4 bg-white rounded-2xl border">
      <div class="text-red-700 font-medium">Chyba při načítání aplikace</div>
      <div class="text-sm mt-1">${message}</div>
    </div>
  `);
}

(async function init() {
  try {
    // 🔧 DŮLEŽITÉ: cesty jsou relativní k /src/app.js (NE ./src/…)
    const { supabase } = await import('./supabase.js');

    const [
      modulesIndex,
      sidebarUi,
      breadcrumbsUi,
      contentUi,
      headerUi,
      commonUi
    ] = await Promise.all([
      import('./app/modules.index.js').catch(() => { throw new Error('Nepodařilo se načíst "src/app/modules.index.js"'); }),
      import('./ui/sidebar.js').catch(() => { throw new Error('Nepodařilo se načíst "src/ui/sidebar.js"'); }),
      import('./ui/breadcrumbs.js').catch(() => { throw new Error('Nepodařilo se načíst "src/ui/breadcrumbs.js"'); }),
      import('./ui/content.js').catch(() => { throw new Error('Nepodařilo se načíst "src/ui/content.js"'); }),
      import('./ui/headerActions.js').catch(() => { throw new Error('Nepodařilo se načíst "src/ui/headerActions.js"'); }),
      import('./ui/commonActions.js').catch(() => { throw new Error('Nepodařilo se načíst "src/ui/commonActions.js"'); }),
    ]);

    const MODULES = modulesIndex?.MODULES || [];
    const renderSidebar = sidebarUi?.renderSidebar;
    const renderBreadcrumbs = breadcrumbsUi?.renderBreadcrumbs;
    const renderContent = contentUi?.renderContent;
    const renderHeaderActions = headerUi?.renderHeaderActions;
    const renderCommonActions = commonUi?.renderCommonActions;

    if (!Array.isArray(MODULES) || MODULES.length === 0) {
      renderSidebarFallback([
        { id:'010-uzivatele', title:'Uživatelé', icon:'👥', tiles:[{id:'seznam'}], defaultTile:'seznam' },
        { id:'020-muj-ucet',  title:'Můj účet',  icon:'👤', tiles:[{id:'profil'}], defaultTile:'profil' },
      ]);
      renderFatalError('Modulový index nebyl načten. Zkontroluj cestu src/app/modules.index.js');
      return;
    }

    // --- helpers ---
    window.appDirty = false;
    window.setAppDirty = (v) => { window.appDirty = !!v; };

    async function ensureSignedIn() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { location.replace('./index.html'); return null; }
        return session;
      } catch { location.replace('./index.html'); return null; }
    }

    async function hardLogout() {
      try { await supabase.auth.signOut({ scope: 'local' }); } catch {}
      try { await supabase.auth.signOut(); } catch {}
      try {
        Object.keys(localStorage).forEach(k => k.startsWith('sb-') && localStorage.removeItem(k));
        Object.keys(sessionStorage).forEach(k => k.startsWith('sb-') && sessionStorage.removeItem(k));
      } catch {}
      location.replace('./index.html?_' + Date.now());
    }

    function parseHash() {
      const raw = (location.hash || '').replace(/^#\/?/, '');
      const [path, q] = raw.split('?');
      const p = (path || '').split('/').filter(Boolean);
      const params = new URLSearchParams(q || '');
      if (p[0] !== 'm') return { view: 'dashboard', params };
      const mod = p[1]; if (!mod) return { view: 'dashboard', params };
      if (p[2] === 't' && p[3]) return { view: 'module', mod, kind: 'tile', id: p[3], params };
      if (p[2] === 'f' && p[3]) return { view: 'module', mod, kind: 'form', id: p[3], params };
      return { view: 'module', mod, kind: 'tile', id: null, params };
    }
    const findModule = (id) => MODULES.find(m => m.id === id);

    function mountDashboard() {
      setHTML($('#breadcrumbs'),
        `<a class="inline-flex items-center gap-1 px-2 py-1 rounded border bg-white text-sm" href="#/dashboard">🏠 Domů</a>`
      );
      clear($('#crumb-actions'));
      clear($('#actions-bar'));
      setHTML($('#content'), `<div class="p-4 bg-white rounded-2xl border">Dashboard – placeholder.</div>`);
    }

    async function renderModuleSpecific(root, { mod, kind, id }) {
      try {
        switch (mod.id) {
          case '010-uzivatele': {
            // ⚠️ relativně k /src/app.js → ./modules/…
            const cfg = await import('./modules/010-sprava-uzivatelu/module.config.js');
            const tiles = await import('./modules/010-sprava-uzivatelu/tiles/index.js');
            const tileId = id || cfg.default.tiles?.[0]?.id || 'seznam';
            await tiles.renderTile(tileId, root);
            return true;
          }
          case '020-muj-ucet': {
            const m = await import('./modules/my-account.js');
            await m.default(root);
            return true;
          }
          default: return false;
        }
      } catch (e) {
        console.error('[APP] module render failed:', e);
        return false;
      }
    }

    async function mountModuleView({ mod, kind, id }) {
      try { renderBreadcrumbs($('#breadcrumbs'), { mod, kind, id }); } catch {}
      try { renderCommonActions($('#crumb-actions')); } catch {}
      clear($('#actions-bar'));
      const ok = await renderModuleSpecific($('#content'), { mod, kind, id });
      if (!ok) renderContent($('#content'), { mod, kind, id });
    }

    async function route() {
      const h = parseHash();
      if (h.view === 'dashboard') { mountDashboard(); return; }
      const mod = findModule(h.mod);
      if (!mod) { setHTML($('#content'), `<div class="p-4 bg-white rounded-2xl border">Neznámý modul.</div>`); return; }
      const activeTile = h.kind === 'tile'
        ? (h.id || mod.defaultTile || (mod.tiles && mod.tiles[0] && mod.tiles[0].id) || null)
        : (mod.defaultTile || (mod.tiles && mod.tiles[0] && mod.tiles[0].id) || null);
      await mountModuleView({ mod, kind: h.kind, id: h.kind === 'tile' ? activeTile : h.id });
    }

    document.addEventListener('DOMContentLoaded', async () => {
      console.log('[APP] DOM ready');
      const session = await ensureSignedIn(); if (!session) return;

      try { renderHeaderActions($('#header-actions')); } catch {}

      const btn = $('#btnProfile');
      if (btn) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          btn.title = user?.email || session.user?.email || '—';
        } catch { btn.title = session.user?.email || '—'; }
        btn.addEventListener('click', () => { location.hash = '#/m/020-muj-ucet/t/profil'; });
      }

      $('#logoutBtn')?.addEventListener('click', hardLogout);
      $('#homeBtn')?.addEventListener('click', () => {
        if (window.appDirty && !confirm('Máš rozpracované změny. Odejít bez uložení?')) return;
        location.hash = '#/dashboard';
      });

      try {
        if (typeof renderSidebar === 'function') {
          renderSidebar($('#sidebar'), MODULES, { onSelect: () => setTimeout(route, 0) });
        } else {
          renderSidebarFallback(MODULES);
        }
      } catch (e) {
        console.warn('[APP] renderSidebar failed, using fallback:', e);
        renderSidebarFallback(MODULES);
      }

      await route();
      window.addEventListener('hashchange', route);
    });
  } catch (e) {
    console.error('[APP] safe boot error:', e);
    renderSidebarFallback([
      { id:'010-uzivatele', title:'Uživatelé', icon:'👥', tiles:[{id:'seznam'}], defaultTile:'seznam' },
      { id:'020-muj-ucet',  title:'Můj účet',  icon:'👤', tiles:[{id:'profil'}], defaultTile:'profil' },
    ]);
    renderFatalError(String(e?.message || e));
  }
})();
