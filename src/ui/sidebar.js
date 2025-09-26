// Jednoduchý sidebar – nepotřebuje další importy
export function renderSidebar(root, modules = [], opts = {}) {
  if (!root) return
  root.innerHTML = `
    <nav class="space-y-1">
      <ul id="sb-list" class="space-y-1"></ul>
    </nav>
  `
  const ul = root.querySelector('#sb-list')

  modules.forEach(m => {
    const li = document.createElement('li')
    const a  = document.createElement('a')
    const firstTile = m.defaultTile || m.tiles?.[0]?.id
    a.href = `#/m/${m.id}${firstTile ? `/t/${firstTile}` : ''}`
    a.dataset.mod = m.id
    a.className = 'block px-3 py-2 rounded hover:bg-slate-100'
    a.innerHTML = `<span class="mr-2">${m.icon || '📁'}</span><span>${m.title}</span>`
    li.appendChild(a)
    ul.appendChild(li)
  })

  function markActive() {
    const hash = location.hash || ''
    const m = (/#\/m\/([^\/]+)/.exec(hash) || [])[1] || modules[0]?.id || ''
    ul.querySelectorAll('a[data-mod]').forEach(a => {
      const active = a.dataset.mod === m
      a.classList.toggle('bg-slate-900', active)
      a.classList.toggle('text-white', active)
      a.classList.toggle('hover:bg-slate-100', !active)
    })
  }

  ul.addEventListener('click', ev => {
    const a = ev.target.closest('a[data-mod]')
    if (!a) return
    const mod = modules.find(x => x.id === a.dataset.mod)
    if (opts.onSelect && mod) setTimeout(() => opts.onSelect(mod), 0)
  })

  window.addEventListener('hashchange', markActive)
  markActive()
}
