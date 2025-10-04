// src/ui/table.js
// Univerzální tabulka s řazením, filtrem, výběrem řádku. ŽÁDNÉ akce v řádku!
// columns: [{ key, label, width?, render?(row), sortable?:true, className? }]
// rows: array objektů
// options: { filterPlaceholder, columnsOrder?: string[], onRowDblClick?(row), onRowSelect?(row), selectedRow? }

export function renderTable(root, { columns, rows, options = {}, selectedRow }) {
  if (!root) return;
  const state = {
    sortKey: columns.find(c => c.sortable !== false)?.key || columns[0]?.key,
    sortDir: 'asc',
    filter: '',
  };

  // volitelné pořadí sloupců (např. z uživatelského nastavení)
  const order = Array.isArray(options.columnsOrder) && options.columnsOrder.length
    ? options.columnsOrder
    : columns.map(c => c.key);

  const cols = order
    .map(k => columns.find(c => c.key === k))
    .filter(Boolean);

  root.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.className = 'bg-white rounded-2xl border';
  root.appendChild(wrap);

  // HEAD: filtr (možno vypnout/skryt zvenku)
  let showFilter = typeof options.showFilter === 'undefined' ? true : options.showFilter;
  let filterPlaceholder = options.filterPlaceholder || 'Filtrovat…';
  let filterValue = typeof options.filterValue === 'string' ? options.filterValue : state.filter;

  let headHtml = '';
  if (showFilter) {
    headHtml = `
      <input type="text" id="tblFilter" class="border rounded px-2 py-1 text-sm w-full sm:w-72"
             placeholder="${filterPlaceholder}" value="${escapeHtml(filterValue)}" />
    `;
  }
  const head = document.createElement('div');
  head.className = 'p-3 border-b flex items-center gap-2';
  head.innerHTML = headHtml;
  wrap.appendChild(head);

  const scroller = document.createElement('div');
  scroller.className = 'overflow-auto';
  wrap.appendChild(scroller);

  const table = document.createElement('table');
  table.className = 'min-w-full text-sm';
  scroller.appendChild(table);

  const thead = document.createElement('thead');
  thead.innerHTML = `<tr class="bg-slate-50">
    ${cols.map(c => `
      <th class="text-left px-3 py-2 whitespace-nowrap ${c.className||''}" style="${c.width ? `width:${c.width}`:''}">
        <button class="flex items-center gap-1 ${c.sortable===false?'pointer-events-none':''}" data-sort="${c.key}">
          <span>${c.label}</span>
          <span class="opacity-60 text-xs" data-dir="${c.key}"></span>
        </button>
      </th>`).join('')}
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
      out = out.filter(r => cols.some(c => String(r[c.key] ?? '').toLowerCase().includes(f)));
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
      // Zvýraznění vybraného řádku
      const isSelected = (options.selectedRow && row.id && options.selectedRow.id === row.id);
      tr.className = 'border-t hover:bg-slate-50' + (isSelected ? ' bg-amber-100' : '');
      tr.innerHTML = cols.map(c => {
        const val = c.render ? c.render(row) : escapeHtml(row[c.key]);
        return `<td class="px-3 py-2 align-top ${c.className||''}">${val}</td>`;
      }).join('');
      tbody.appendChild(tr);

      // Výběr řádku (klik)
      if (typeof options.onRowSelect === 'function') {
        tr.addEventListener('click', () => options.onRowSelect(row));
        tr.style.cursor = 'pointer';
      }
      // Dvojklik řádek – pokud není handler, použij default na detail
      if (typeof options.onRowDblClick === 'function') {
        tr.addEventListener('dblclick', (e) => {
          e.stopPropagation();
          options.onRowDblClick(row);
        });
        tr.style.cursor = 'pointer';
      } else {
        // Výchozí: otevři detail (read)
        tr.addEventListener('dblclick', (e) => {
          e.stopPropagation();
          if (window.navigateTo) {
            window.navigateTo(`#/m/${options.moduleId || 'unknown'}/f/read?id=${row.id}`);
          } else {
            alert(`Detail pro ID: ${row.id}`);
          }
        });
        tr.style.cursor = 'pointer';
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
    const col = cols.find(c => c.key === key);
    if (col && col.sortable !== false) {
      btn.addEventListener('click', () => {
        if (state.sortKey === key) state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
        else { state.sortKey = key; state.sortDir = 'asc'; }
        renderBody();
      });
    }
  });
  if (showFilter && head.querySelector('#tblFilter')) {
    head.querySelector('#tblFilter').addEventListener('input', e => {
      state.filter = e.target.value || '';
      renderBody();
    });
  }

  renderBody();
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}
