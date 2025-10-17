// src/ui/form.js
// Univerzální renderer formulářů: kompaktní grid, záložky, plně responsivní.
// Ošetřuje převod "" na null a vynechává auditní pole při submitu.

import { emptyStringsToNull } from './utils.js';

const AUDIT_FIELDS = [
  'created_at', 'updated_at', 'last_login', 'updated_by'
];

function filterSaveFields(obj) {
  const out = {};
  for (const key in obj) {
    if (!AUDIT_FIELDS.includes(key)) out[key] = obj[key];
  }
  return out;
}

export function renderForm(
  root,
  fields = [],
  initialData = {},
  onSubmit = async () => true,
  options = {}
) {
  if (!root) return;

  const opt = {
    readOnly: !!options.readOnly || options.mode === 'read',
    showSubmit: options.showSubmit !== false,
    submitLabel: options.submitLabel || 'Uložit',
    layout: {
      columns: { base: 1, md: 2, xl: 2, ...(options.layout?.columns || {}) },
      density: options.layout?.density || 'compact',
    },
    sections: Array.isArray(options.sections) ? options.sections : null,
  };

  const data = { ...(initialData || {}) };

  // === DOM ===
  root.innerHTML = '';
  const card = document.createElement('div');
  card.className = 'bg-white rounded-2xl border p-4 md:p-6 max-w-5xl mx-auto';
  root.appendChild(card);

  // Tabs
  let tabsBar = null;
  let activeSectionId = null;
  if (opt.sections && opt.sections.length > 1) {
    tabsBar = document.createElement('div');
    tabsBar.className = 'border-b mb-4 -mt-2 overflow-x-auto';
    const ul = document.createElement('div');
    ul.className = 'flex gap-1 md:gap-2 min-w-max';
    tabsBar.appendChild(ul);
    card.appendChild(tabsBar);

    activeSectionId = opt.sections[0].id;

    opt.sections.forEach(sec => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = tabBtnClass(sec.id === activeSectionId);
      btn.textContent = sec.label;
      btn.dataset.tab = sec.id;
      btn.addEventListener('click', () => setActiveSection(sec.id));
      ul.appendChild(btn);
    });
  }

  // Form element
  const formEl = document.createElement('form');
  formEl.className = opt.layout.density === 'compact'
    ? 'space-y-4'
    : 'space-y-6';
  card.appendChild(formEl);

  // Sekce / plocha pro pole
  const sectionsToRender = opt.sections && opt.sections.length
    ? opt.sections
    : [{ id: '_default', label: '', fields: fields.map(f => f.key) }];

  const sectionEls = new Map();

  sectionsToRender.forEach(sec => {
    const secWrap = document.createElement('div');
    secWrap.dataset.section = sec.id;

    if ((!tabsBar) && sec.label) {
      const h = document.createElement('div');
      h.className = 'text-sm font-semibold text-slate-700 mb-2';
      h.textContent = sec.label;
      secWrap.appendChild(h);
    }

    const grid = document.createElement('div');
    grid.className = gridClass(opt.layout);
    secWrap.appendChild(grid);

    const keysInSec = new Set(sec.fields || []);
    const fieldsInSection = keysInSec.size
      ? fields.filter(f => keysInSec.has(f.key))
      : fields;

    fieldsInSection.forEach(f => {
      const cell = document.createElement('div');
      if (f.fullWidth || f.span === 2) cell.className = 'md:col-span-2';
      grid.appendChild(cell);

      renderField(cell, f, data[f.key], {
        readOnly: opt.readOnly,
        density: opt.layout.density,
        onChange: val => { data[f.key] = val; }
      });
    });

    formEl.appendChild(secWrap);
    sectionEls.set(sec.id, secWrap);
  });

  // Submit row
  if (opt.showSubmit && !opt.readOnly) {
    const actions = document.createElement('div');
    actions.className = 'pt-2 mt-2 border-t flex gap-2';
    const btn = document.createElement('button');
    btn.type = 'submit';
    btn.className =
      'inline-flex items-center px-4 py-2 rounded-md bg-slate-900 text-white hover:bg-slate-800 text-sm';
    btn.textContent = opt.submitLabel;
    actions.appendChild(btn);

    const cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.className =
      'inline-flex items-center px-3 py-2 rounded-md border text-sm';
    cancel.textContent = 'Zpět';
    cancel.addEventListener('click', (e) => {
      e.preventDefault();
      history.back();
    });
    actions.appendChild(cancel);

    formEl.appendChild(actions);
  }

  // Submit handler
  formEl.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (opt.readOnly) return;
    try {
      // převod "" na null, odstranění auditních polí
      let values = emptyStringsToNull({ ...data });
      values = filterSaveFields(values);
      const ok = await onSubmit(values);
      if (ok) {
        // řízení si převezme volající
      }
    } catch (err) {
      console.error('[FORM SUBMIT ERROR]', err);
      alert(err?.message || String(err));
    }
  });

  if (tabsBar) setActiveSection(activeSectionId);

  // === helpers ===
  function setActiveSection(id) {
    activeSectionId = id;
    for (const [secId, el] of sectionEls.entries()) {
      el.style.display = (secId === id) ? '' : 'none';
    }
    tabsBar.querySelectorAll('button[data-tab]').forEach(b => {
      b.className = tabBtnClass(b.dataset.tab === id);
    });
  }
}

function gridClass(layout) {
  const cols = layout.columns || { base: 1, md: 2, xl: 2 };
  const parts = ['grid gap-3 md:gap-4'];
  const mdCols = cols.md || 1;
  const xlCols = cols.xl || mdCols;
  parts.push('grid-cols-1');
  if (mdCols > 1) parts.push(`md:grid-cols-${clampCols(mdCols)}`);
  if (xlCols > mdCols) parts.push(`xl:grid-cols-${clampCols(xlCols)}`);
  return parts.join(' ');
}

function clampCols(n) { return Math.max(1, Math.min(4, n)); }

function tabBtnClass(active) {
  return [
    'px-3 py-2 text-sm border-b-2',
    active
      ? 'border-slate-900 text-slate-900 font-medium'
      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
  ].join(' ');
}

function renderField(cell, f, value, ctx) {
  const dense = ctx.density === 'compact';

  const wrap = document.createElement('div');
  wrap.className = dense ? 'space-y-1' : 'space-y-2';
  cell.appendChild(wrap);

  if (f.label && f.type !== 'checkbox') {
    const lab = document.createElement('label');
    lab.className = 'block text-sm text-slate-700';
    lab.textContent = f.label + (f.required ? ' *' : '');
    lab.htmlFor = `f_${f.key}`;
    wrap.appendChild(lab);
  }

  // NOVÁ PODPORA pro "label" (prostý text místo inputu)
  if (f.type === 'label') {
    const val = (value == null || value === '') ? '—' : value;
    const txt = document.createElement('div');
    txt.className = 'block text-slate-700 bg-slate-50 rounded px-3 py-2 min-h-[2.2em] border border-slate-200';
    txt.textContent = val;
    wrap.appendChild(txt);
    return;
  }

  const common = (el) => {
    el.name = f.key;
    el.id = `f_${f.key}`;
    el.disabled = !!ctx.readOnly || !!f.disabled;
    el.required = !!f.required;
    if (f.placeholder) el.placeholder = f.placeholder;
    el.className = baseInputClass(ctx, f, el);
    if (value != null) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') {
        if (el.type === 'checkbox') el.checked = !!value;
        else el.value = value;
      }
    }
    el.addEventListener('input', () => {
      let val = (el.type === 'checkbox') ? !!el.checked : el.value;
      ctx.onChange?.(val);
    });
    return el;
  };

  let ctrl = null;

  switch ((f.type || 'text')) {
    case 'textarea': {
      ctrl = common(document.createElement('textarea'));
      ctrl.rows = f.rows || (dense ? 3 : 4);
      break;
    }
    case 'select': {
      ctrl = common(document.createElement('select'));
      (f.options || []).forEach(opt => {
        const o = document.createElement('option');
        if (typeof opt === 'string') {
          o.value = opt; o.textContent = opt;
        } else {
          o.value = opt.value; o.textContent = opt.label;
        }
        ctrl.appendChild(o);
      });
      break;
    }
    case 'checkbox': {
      const boxWrap = document.createElement('label');
      boxWrap.className = 'inline-flex items-center gap-2';
      ctrl = common(document.createElement('input'));
      ctrl.type = 'checkbox';
      boxWrap.appendChild(ctrl);
      const t = document.createElement('span');
      t.textContent = f.label || '';
      t.className = 'text-sm text-slate-700';
      boxWrap.appendChild(t);
      wrap.appendChild(boxWrap);
      // skip extra label (už je vedle checkboxu)
      return;
    }
    default: {
      ctrl = common(document.createElement('input'));
      ctrl.type = f.type || 'text';
    }
  }

  wrap.appendChild(ctrl);

  if (f.help) {
    const help = document.createElement('div');
    help.className = 'text-xs text-slate-500';
    help.textContent = f.help;
    wrap.appendChild(help);
  }
}

function baseInputClass(ctx, f, el) {
  const dense = ctx.density === 'compact';
  const base = [
    'w-full border rounded-md',
    'focus:outline-none focus:ring-2 focus:ring-slate-300',
    'disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed'
  ];
  if (el.tagName === 'INPUT' && el.type !== 'checkbox' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') {
    base.push(dense ? 'px-3 py-1.5 text-sm' : 'px-3 py-2');
  }
  return base.join(' ');
}

export default { renderForm };
