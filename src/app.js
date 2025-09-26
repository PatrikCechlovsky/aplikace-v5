// v5 – sidebar + modules z v4, breadcrumbs + content
import { supabase } from './supabase.js'
import { MODULES } from './app/modules.index.js'
import { renderSidebar } from './ui/sidebar.js'
import { renderBreadcrumbs } from './ui/breadcrumbs.js'
import { renderContent } from './ui/content.js'
import { getState, setModule } from './app/state.js'

async function ensureSignedIn() {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      location.replace('./index.html')
      return null
    }
    return session
  } catch (e) {
    console.error('Auth guard error:', e)
    location.replace('./index.html')
    return null
  }
}

async function hardLogout() {
  try {
    await supabase.auth.signOut({ scope: 'local' })
  } catch {}
  try {
    await supabase.auth.signOut()
  } catch {}
  try {
    Object.keys(localStorage).forEach(k => { if (k.startsWith('sb-')) localStorage.removeItem(k) })
    Object.keys(sessionStorage).forEach(k => { if (k.startsWith('sb-')) sessionStorage.removeItem(k) })
  } catch {}
  location.replace('./index.html?_' + Date.now())
}

function mountModule(mod) {
  const bcRoot = document.getElementById('breadcrumbs')
  const actionsRoot = document.getElementById('crumb-actions')
  const contentRoot = document.getElementById('content')

  if (!mod) {
    bcRoot.textContent = 'Neznámý modul'
    contentRoot.innerHTML = '<div class="p-4 bg-white rounded-2xl border">Modul nebyl nalezen.</div>'
    return
  }

  setModule(mod.id)

  renderBreadcrumbs(bcRoot, { mod })
  actionsRoot.innerHTML = ''
  renderContent(contentRoot)
}

async function initApp() {
  const session = await ensureSignedIn()
  if (!session) return

  // email do headeru
  const userName = document.getElementById('userName')
  if (userName) userName.textContent = session.user?.email ?? '—'

  // logout
  document.getElementById('logoutBtn')?.addEventListener('click', hardLogout)

  // sidebar
  const sidebarRoot = document.getElementById('sidebar')
  renderSidebar(sidebarRoot, MODULES, {
    onSelect: (mod) => mountModule(mod)
  })

  // startovní modul
  const first = MODULES[0]
  mountModule(first)
}

document.addEventListener('DOMContentLoaded', initApp)
