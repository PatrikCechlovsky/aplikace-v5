// v5: integrace v4 UI – sidebar, breadcrumbs, content, header actions
import { supabase } from './supabase.js'
import { MODULES } from './app/modules.index.js'
import { renderSidebar } from './ui/sidebar.js'        // v4 sidebar – generuje z MODULES  :contentReference[oaicite:3]{index=3}
import { renderBreadcrumbs } from './ui/breadcrumbs.js'// v4 breadcrumbs                :contentReference[oaicite:4]{index=4}
import { renderContent } from './ui/content.js'        // v4 content placeholder         :contentReference[oaicite:5]{index=5}
import { renderHeaderActions } from './ui/headerActions.js' // globální ikony            :contentReference[oaicite:6]{index=6}

function $(id){ return document.getElementById(id) }

async function ensureSignedIn() {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { location.replace('./index.html'); return null }
    return session
  } catch {
    location.replace('./index.html'); return null
  }
}

async function hardLogout() {
  try { await supabase.auth.signOut({ scope: 'local' }) } catch {}
  try { await supabase.auth.signOut() } catch {}
  try {
    Object.keys(localStorage).forEach(k => { if (k.startsWith('sb-')) localStorage.removeItem(k) })
    Object.keys(sessionStorage).forEach(k => { if (k.startsWith('sb-')) sessionStorage.removeItem(k) })
  } catch {}
  location.replace('./index.html?_' + Date.now())
}

// url → stav
function parseHash() {
  const raw = (location.hash || '').replace(/^#\/?/, '')
  const [path, q] = raw.split('?')
  const p = (path || '').split('/').filter(Boolean)
  const params = new URLSearchParams(q || '')
  if (p[0] !== 'm') return { view:'dashboard', params }
  const mod = p[1]; if (!mod) return { view:'dashboard', params }
  if (p[2] === 't' && p[3]) return { view:'module', mod, kind:'tile', id:p[3], params }
  if (p[2] === 'f' && p[3]) return { view:'module', mod, kind:'form', id:p[3], params }
  return { view:'module', mod, kind:'tile', id:null, params }
}

function findModule(id){ return MODULES.find(m => m.id === id) }

function mountDashboard(){
  $('breadcrumbs').innerHTML = `<a id="home-link" class="inline-flex items-center gap-1 px-2 py-1 rounded border bg-white text-sm" href="#/dashboard">🏠 Domů</a>`
  $('crumb-actions').innerHTML = ''
  $('actions-bar').innerHTML = ''
  $('content').innerHTML = `<div class="card p-4">Dashboard – placeholder.</div>`
}

function mountModuleView({ mod, kind, id }){
  renderBreadcrumbs($('breadcrumbs'), { mod, kind, id })
  $('actions-bar').innerHTML = '' // chips vypneme; strom řeší sidebar
  renderContent($('content'))
}

async function route(){
  const h = parseHash()

  if (h.view === 'dashboard') {
    mountDashboard()
    return
  }

  const mod = findModule(h.mod)
  if (!mod) {
    $('content').innerHTML = `<div class="card p-4">Neznámý modul.</div>`
    return
  }

  const activeTile = h.kind === 'tile'
    ? (h.id || mod.defaultTile || mod.tiles?.[0]?.id || null)
    : (mod.defaultTile || mod.tiles?.[0]?.id || null)

  mountModuleView({ mod, kind:h.kind, id: h.kind==='tile' ? activeTile : h.id })
}

document.addEventListener('DOMContentLoaded', async () => {
  const session = await ensureSignedIn()
  if (!session) return

  // email do headeru (spolehlivě)
  try {
    const { data: { user } } = await supabase.auth.getUser()
    $('userName').textContent = user?.email || session.user?.email || '—'
  } catch {
    $('userName').textContent = session.user?.email || '—'
  }

  // globální akce (lupa, zvonek, účet, help)
  renderHeaderActions($('header-actions'))  // :contentReference[oaicite:7]{index=7}

  // logout
  $('logoutBtn')?.addEventListener('click', hardLogout)

  // sidebar (v4)
  renderSidebar($('sidebar'))               // :contentReference[oaicite:8]{index=8}

  // první vykreslení
  await route()
})

window.addEventListener('hashchange', route)
