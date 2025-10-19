import { setBreadcrumb } from '/src/ui/breadcrumb.js';
import { renderForm } from '/src/ui/form.js';
import { renderCommonActions } from '/src/ui/commonActions.js';
import { navigateTo } from '/src/app.js';
import { getSubject, upsertSubject } from '/src/modules/050-najemnik/db.js';
import { showHistoryModal } from '/src/ui/history.js';
import TYPE_SCHEMAS from '/src/modules/050-najemnik/type-schemas.js';
import { lookupIco } from '/src/lib/ares.js';
import { useUnsavedHelper } from '/src/ui/unsaved-helper.js';
import { setUnsaved } from '/src/app.js';

function getHashParams() {
  const q = (location.hash.split('?')[1] || '');
  return Object.fromEntries(new URLSearchParams(q));
}

function formatCzechDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return '';
  return d.toLocaleDateString('cs-CZ') + ' ' + d.toLocaleTimeString('cs-CZ');
}

export async function render(root) {
  const { id, type: qtype, mode: modeParam } = getHashParams();
  const type = qtype || 'firma';
  const mode = (modeParam === 'read') ? 'read' : 'edit';

  try {
    setBreadcrumb(document.getElementById('crumb'), [
      { icon: 'home',  label: 'Domů', href: '#/' },
      { icon: 'users', label: 'Nájemník', href: '#/m/050-najemnik' },
      { icon: 'form',  label: 'Formulář' },
      { icon: 'account', label: id ? 'Editace' : `Nový ${type.charAt(0).toUpperCase() + type.slice(1)}` }
    ]);
  } catch (e) {}

  let data = {};
  if (id) {
    const { data: sub, error } = await getSubject(id);
    if (error) {
      root.innerHTML = `<div class="p-4 text-red-600">Chyba při načítání: ${error.message || JSON.stringify(error)}</div>`;
      return;
    }
    data = sub || {};
    data.updated_at = formatCzechDate(data.updated_at);
    data.created_at = formatCzechDate(data.created_at);
  }

  const schema = TYPE_SCHEMAS[type] || [];
  const fields = schema.map(f => ({ ...f }));
  const sections = [
    { id: 'profil', label: 'Profil', fields: fields.map(f => f.key) },
    { id: 'system', label: 'Systém', fields: ['archived','created_at','updated_at','updated_by'] }
  ];

  renderForm(root, fields, data, async (values) => {
    try {
      const curUser = window.currentUser || null;
      const { data: saved, error } = await upsertSubject(values, curUser);
      if (error) {
        alert('Chyba při ukládání: ' + (error.message || JSON.stringify(error)));
        return false;
      }
      alert('Uloženo.');
      setUnsaved(false);
      navigateTo('#/m/050-najemnik/t/prehled');
      return true;
    } catch (e) {
      alert('Chyba při ukládání: ' + e.message);
      return false;
    }
  }, {
    readOnly: mode === 'read',
    showSubmit: mode !== 'read',
    layout: { columns: { base: 1, md: 2, xl: 2 }, density: 'compact' },
    sections
  });

  const formEl = root.querySelector('form');
  if (formEl) useUnsavedHelper(formEl);

  const icoInput = root.querySelector('input[name="ico"]');
  if (icoInput) {
    const wrapper = icoInput.parentElement || icoInput;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.title = 'Načíst z ARES';
    btn.className = 'ml-2 inline-flex items-center px-2 py-1 border rounded text-sm';
    btn.innerHTML = '🔍';
    btn.disabled = !icoInput.value;
    icoInput.addEventListener('input', () => { btn.disabled = !icoInput.value.trim(); });
    btn.addEventListener('click', async () => {
      const val = (icoInput.value || '').trim();
      if (!val) { alert('Zadejte IČO'); return; }
      try {
        const res = await lookupIco(val);
        if (!res) { alert('ARES: nic nenalezeno'); return; }
        const mapped = {};
        if (res.name) mapped.display_name = res.name;
        if (res.ico) mapped.ico = res.ico;
        if (res.dic) mapped.dic = res.dic;
        if (res.street) mapped.street = res.street;
        if (res.city) mapped.city = res.city;
        if (res.zip) mapped.zip = res.zip;
        Object.entries(mapped).forEach(([k,v]) => {
          const el = root.querySelector(`[name="${k}"]`);
          if (el) {
            el.value = v;
            el.dispatchEvent(new Event('input', { bubbles: true }));
          }
        });
        alert('Načteno z ARES.');
      } catch (e) {
        alert('Chyba ARES: ' + (e.message || e));
      }
    });
    wrapper.appendChild(btn);
  }

  const myRole = window.currentUserRole || 'admin';
  const handlers = {
    onSave: () => formEl ? formEl.requestSubmit() : null,
    onAttach: () => id && window.showAttachmentsModal && window.showAttachmentsModal({ entity: 'subjects', entityId: id }),
    onHistory: () => {
      if (!id) { alert('Historie dostupná po uložení'); return; }
      showHistoryModal(async (subjectId) => {
        return await (await import('/src/modules/050-najemnik/db.js')).getSubjectHistory(subjectId);
      }, id);
    },
    onArchive: async () => {
      if (!id) { alert('Uložte nejprve záznam.'); return; }
      const { data, error } = await (await import('/src/modules/050-najemnik/db.js')).archiveSubject(id, window.currentUser);
      if (error) alert('Chyba: ' + (error.message || JSON.stringify(error))); else { alert('Archivováno'); navigateTo('#/m/050-najemnik/t/prehled'); }
    }
  };

  renderCommonActions(document.getElementById('commonactions'), {
    moduleActions: mode === 'read' ? ['edit','attach','history'] : ['save','attach','archive','history'],
    userRole: myRole,
    handlers
  });
}

export default { render };
