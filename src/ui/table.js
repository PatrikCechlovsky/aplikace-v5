// src/ui/table.js
// Jednoduchá tabulka s řazením klikem na header a fulltext filtrem.
// columns: [{ key, label, width?, render?(row), sortable?:true, className? }]
// rows: array objektů
// rowActions: [{ label, icon, onClick(row) }]
// options: { filterPlaceholder }

export function renderTable(root, { columns, rows, rowActions = [], options = {} }) {
  if (!root) return;
  const state = {
    sortKey: columns.find(c => c.sortable !== false)?.key || columns[0]?.key,
    sortDir: 'asc',
    filter: '',
  };

  const wrap = document.createElement('div');
  wrap.className = 'bg-white rounded-2xl border';
  root.innerHTML = '';
  root.appendChild(wrap);

  const head = document.createElement('div');
  head.className = 'p-3 border-b flex items-center gap-2';
  head.innerHTML = `
    <input type="text" id="tblFilter" class="border rounded px-2 py-1 text-sm w-full sm:w-72"
           placeholder="${options.filterPlaceholder || 'Filtrovat…'}" />
  `;
  wrap.appendChild(head);

  const scroller = document.createElement('div');
  scroller.className = 'overflow-auto';
  wrap.appendChild(scroller);

  const table = document.createElement('table');
  table.className = 'min-w-full text-sm';
  scroller.appendChild(table);

  const thead = document.createElement('thead');
  thead.innerHTML = `<tr class="bg-slate-50">
    ${columns.map(c => `
      <th class="text-left px-3 py-2 whitespace-nowrap ${c.className||''}" style="${c.width ? `width:${c.width}`:''}">
        <button class="flex items-center gap-1 ${c.sortable===false?'pointer-events-none':''}" data-sort="${c.key}">
          <span>${c.label}</span>
          <span class="opacity-60 text-xs" data-dir="${c.key}"></span>
        </button>
      </th>`).join('')}
      ${rowActions.length ? `<th class="px-3 py-2 text-right">Akce</th>` : ''}
  </tr>`;
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  table.appendChild(tbody);

  function cmp(a, b) {
    const av = (a ?? '').toString().toLowerCase();
    const bv = (b ?? '').toString().toLowerCase();
    if (av < bv) return -1;
    if (av > bv) return 1;
    return 0;
  }

  function applySortAndFilter(data) {
    let out = data;
    if (state.filter) {
      const f = state.filter.toLowerCase();
      out = out.filter(r => columns.some(c => String(r[c.key] ?? '').toLowerCase().includes(f)));
    }
    if (state.sortKey) {
      out = out.slice().sort((r1, r2) => {
        const dir = state.sortDir === 'asc' ? 1 : -1;
        return dir * cmp(r1[state.sortKey], r2[state.sortKey]);
      });
    }
    return out;
  }

  function renderBody() {
    tbody.innerHTML = '';
    const data = applySortAndFilter(rows);

    data.forEach(row => {
      const tr = document.createElement('tr');
      tr.className = 'border-t hover:bg-slate-50';
      tr.innerHTML = columns.map(c => {
        const val = c.render ? c.render(row) : escapeHtml(row[c.key]);
        return `<td class="px-3 py-2 align-top ${c.className||''}">${val}</td>`;
      }).join('') + (rowActions.length ? `
        <td class="px-3 py-2 text-right whitespace-nowrap">
          ${rowActions.map((a,i) => `<button data-act="${i}" class="px-2 py-1 border rounded bg-white ml-1" title="${a.label}">${a.icon||'⋯'}</button>`).join('')}
        </td>` : '');
      tbody.appendChild(tr);

      if (rowActions.length) {
        tr.querySelectorAll('button[data-act]').forEach(btn => {
          const i = Number(btn.dataset.act);
          btn.addEventListener('click', () => rowActions[i].onClick?.(row));
        });
      }
    });

    // směrové šipky v head
    thead.querySelectorAll('[data-dir]').forEach(span => span.textContent = '');
    const arrow = thead.querySelector(`[data-dir="${state.sortKey}"]`);
    if (arrow) arrow.textContent = state.sortDir === 'asc' ? '▲' : '▼';
  }

  // events
  thead.querySelectorAll('button[data-sort]').forEach(btn => {
    const key = btn.dataset.sort;
    const col = columns.find(c => c.key === key);
    if (col && col.sortable !== false) {
      btn.addEventListener('click', () => {
        if (state.sortKey === key) state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
        else { state.sortKey = key; state.sortDir = 'asc'; }
        renderBody();
      });
    }
  });
  head.querySelector('#tblFilter').addEventListener('input', e => {
    state.filter = e.target.value || '';
    renderBody();
  });

  renderBody();
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}
