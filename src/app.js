// v5 – čistá integrace: sidebar, breadcrumbs, content, header actions (bez 404)
import { supabase } from './supabase.js'
import { MODULES } from './app/modules.index.js'
import { renderSidebar } from './ui/sidebar.js'
import { renderBreadcrumbs } from './ui/breadcrumbs.js'
import { renderContent } from './ui/content.js'
import { renderHeaderActions } from './ui/headerActions.js'

const $ = (id) => document.getElementById(id)

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

// --- routing z hash ---
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
  $('breadcrumbs').innerHTML =
    `<a class="inline-flex items-center gap-1 px-2 py-1 rounded border bg-white text-sm" href="#/dashboard">🏠 Domů</a>`
  $('crumb-actions').innerHTML = ''
  $('actions-bar').innerHTML = ''
  $('content').innerHTML = `<div class="p-4 bg-white rounded-2xl border">Dashboard – placeholder.</div>`
}

function mountModuleView({ mod, kind, id }){
  renderBreadcrumbs($('breadcrumbs'), { mod, kind, id })
  $('crumb-actions').innerHTML = ''
  $('actions-bar').innerHTML = ''
  renderContent($('content'), { mod, kind, id })
}

async function route(){
  const h = parseHash()
  if (h.view === 'dashboard') { mountDashboard(); return }
