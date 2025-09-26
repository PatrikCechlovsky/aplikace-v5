export function renderBreadcrumbs(root, { mod, kind, id }){
  if (!root) return
  const parts = []
  parts.push(`<a class="inline-flex items-center gap-1 px-2 py-1 rounded border bg-white text-sm" href="#/dashboard">🏠 Domů</a>`)

  if (mod){
    const modLink = `#/m/${mod.id}/t/${mod.defaultTile || mod.tiles?.[0]?.id || ''}`
    parts.push(`<span class="opacity-60 mx-1">/</span>
      <a class="inline-flex items-center gap-1 px-2 py-1 rounded border bg-white text-sm" href="${modLink}">
        ${mod.icon||''} ${mod.title}
      </a>`)

    let second = ''
    if (kind === 'tile') {
      const t = (mod.tiles||[]).find(x => x.id === id)
      if (t) second = `<span class="opacity-60 mx-1">/</span><span>${t.icon||''} ${t.label}</span>`
    } else if (kind === 'form') {
      const f = (mod.forms||[]).find(x => x.id === id)
      if (f) second = `<span class="opacity-60 mx-1">/</span><span>${f.icon||''} ${f.label}</span>`
    }
    parts.push(second)
  }

  root.innerHTML = parts.join('')
}
