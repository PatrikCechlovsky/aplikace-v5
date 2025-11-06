// Upravený detail.js - 050 Nájemník (zobrazí Profil, Smlouvy, Jednotky, Nemovitosti, Účty, Dokumenty, Systém)
import { setBreadcrumb } from '/src/ui/breadcrumb.js';
import { renderForm } from '/src/ui/form.js';
import { renderCommonActions } from '/src/ui/commonActions.js';
import { renderTabs, createRelatedEntitiesTable } from '/src/ui/tabs.js';
import { navigateTo } from '/src/app.js';
import { getSubject } from '/src/modules/050-najemnik/db.js';
import { listContracts } from '/src/modules/060-smlouva/db.js';
import { listUnits } from '/src/modules/040-nemovitost/db.js';
import { showHistoryModal } from '/src/ui/history.js';
import TYPE_SCHEMAS from '/src/modules/050-najemnik/type-schemas.js';

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

function escapeHtml(s = '') {
  return String(s ?? '').replace(/[&<>"']/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));
}

async function initPaymentsHelpers() {
  let payments = null;
  let supabase = null;
  try { payments = await import('/src/services/payments.js'); payments = payments.default || payments; } catch (e) { payments = null; }
  try { supabase = (await import('/src/supabase.js')).supabase; } catch (e) { supabase = null; }

  const listPaymentAccounts = payments && payments.listPaymentAccounts ? payments.listPaymentAccounts : (async () => ({ data: [], error: null }));
  const upsertPaymentAccount = payments && payments.upsertPaymentAccount ? payments.upsertPaymentAccount : (async () => ({ data: null, error: new Error('upsertPaymentAccount not implemented') }));
  const deletePaymentAccount = payments && payments.deletePaymentAccount ? payments.deletePaymentAccount : (async () => ({ data: null, error: new Error('deletePaymentAccount not implemented') }));

  async function loadBankCodes() {
    let bankCodes = [];
    if (payments && typeof payments.listBankCodes === 'function') {
      try {
        const res = await payments.listBankCodes();
        bankCodes = (res && res.data) ? res.data : [];
        return bankCodes;
      } catch (e) { /* ignore */ }
    }
    if (supabase) {
      try {
        const { data, error } = await supabase.from('bank_codes').select('code,name').order('name', { ascending: true });
        if (!error && Array.isArray(data)) bankCodes = data;
      } catch (e) { /* ignore */ }
    }
    return bankCodes;
  }

  return { listPaymentAccounts, upsertPaymentAccount, deletePaymentAccount, loadBankCodes };
}

export async function render(root) {
  const { id, type: qtype } = getHashParams();
  const type = qtype || 'osoba';

  if (!id) {
    root.innerHTML = `<div class="p-4 text-red-600">Chybí ID nájemníka.</div>`;
    return;
  }

  try {
    setBreadcrumb(document.getElementById('crumb'), [
      { icon: 'home',  label: 'Domů', href: '#/' },
      { icon: 'users', label: 'Nájemník', href: '#/m/050-najemnik' },
      { icon: 'account', label: 'Detail' }
    ]);
  } catch (e) {}

  const { data, error } = await getSubject(id);
  if (error) {
    root.innerHTML = `<div class="p-4 text-red-600">Chyba při načítání: ${error.message || JSON.stringify(error)}</div>`;
    return;
  }
  if (!data) {
    root.innerHTML = `<div class="p-4 text-red-600">Nájemník nenalezen.</div>`;
    return;
  }

  data.updated_at = formatCzechDate(data.updated_at);
  data.created_at = formatCzechDate(data.created_at);

  const schema = TYPE_SCHEMAS[type] || [];
  const fields = schema.map(f => ({ ...f, readOnly: true }));

  root.innerHTML = '';
  const mainContainer = document.createElement('div');
  mainContainer.className = 'p-4';
  const tabsContainer = document.createElement('div');
  tabsContainer.className = 'mt-6';
  mainContainer.appendChild(tabsContainer);
  root.appendChild(mainContainer);

  const paymentsHelpers = await initPaymentsHelpers();
  const { listPaymentAccounts, upsertPaymentAccount, deletePaymentAccount, loadBankCodes } = paymentsHelpers;
  const subjectId = id;

  const accountsTabContent = async (container) => {
    container.innerHTML = '<div class="text-center py-4">Načítání účtů...</div>';
    try {
      const { data: accounts, error: accErr } = await listPaymentAccounts({ profileId: subjectId });
      if (accErr) {
        container.innerHTML = `<div class="text-red-600 p-4">Chyba při načítání účtů: ${accErr.message || JSON.stringify(accErr)}</div>`;
        return;
      }
      const list = Array.isArray(accounts) ? accounts : [];
      container.innerHTML = '';
      if (list.length === 0) {
        container.innerHTML = '<div class="text-gray-500 p-2">Žádné účty.</div>';
        return;
      }
      list.forEach(a => {
        const el = document.createElement('div');
        el.className = 'p-3 border rounded bg-white mb-2';
        el.innerHTML = `<div class="font-medium">${escapeHtml(a.label || a.name || 'Bankovní účet')} ${a.is_primary ? '<span class="text-xs text-slate-500">• primární</span>' : ''}</div>
                        <div class="text-sm text-gray-600">${escapeHtml(a.account_number || a.iban || '')}${a.bank_code ? ' / ' + escapeHtml(a.bank_code) : ''}</div>`;
        container.appendChild(el);
      });
    } catch (e) {
      container.innerHTML = `<div class="text-red-600 p-4">Chyba: ${escapeHtml(e?.message || String(e))}</div>`;
    }
  };

  const tabs = [
    {
      label: 'Profil nájemníka',
      icon: '👤',
      content: (container) => {
        const sections = [
          { id: 'profil', label: 'Profil', fields: fields.map(f => f.key) },
          { id: 'system', label: 'Systém', fields: ['archived','created_at','updated_at','updated_by'] }
        ];
        renderForm(container, fields, data, null, { readOnly: true, showSubmit: false, layout: { columns: { base:1, md:2 }, density: 'compact' }, sections});
      }
    },
    {
      label: 'Smlouvy',
      icon: '📄',
      content: async (container) => {
        container.innerHTML = '<div class="text-center py-4">Načítání smluv...</div>';
        try {
          const { data: contracts, error: contractsError } = await listContracts({ tenantId: id });
          if (contractsError) { container.innerHTML = `<div class="text-red-600 p-4">Chyba při načítání smluv: ${contractsError.message}</div>`; return; }
          if (!contracts || contracts.length === 0) { container.innerHTML = '<div class="text-gray-500 p-4">Žádné smlouvy</div>'; return; }
          const table = createRelatedEntitiesTable(contracts, [
            { label: 'Číslo smlouvy', field: 'cislo_smlouvy', render: v => `<strong>${v || 'Bez čísla'}</strong>` },
            { label: 'Jednotka', field: 'unit', render: v => v ? `${v.oznaceni || '-'} (${v.typ_jednotky || '-'})` : '-' },
            { label: 'Nemovitost', field: 'property', render: v => v ? `${v.nazev || '-'}, ${v.mesto || '-'}` : '-' }
          ], { emptyMessage: 'Žádné smlouvy', onRowClick: r => navigateTo(`#/m/060-smlouva/f/detail?id=${r.id}`), className: 'cursor-pointer' });
          container.innerHTML = ''; container.appendChild(table);
        } catch (e) { container.innerHTML = `<div class="text-red-600 p-4">${e.message}</div>`; }
      }
    },
    {
      label: 'Jednotky',
      icon: '📦',
      content: async (container) => {
        container.innerHTML = '<div class="text-center py-4">Načítání jednotek...</div>';
        try {
          const { data: contracts } = await listContracts({ tenantId: id, status: 'aktivni' });
          const units = (contracts || []).map(c => c.unit).filter(Boolean);
          if (!units.length) { container.innerHTML = '<div class="text-gray-500 p-4">Žádné jednotky</div>'; return; }
          const table = createRelatedEntitiesTable(units, [
            { label: 'Označení', field: 'oznaceni' }, { label: 'Typ', field: 'typ_jednotky' }, { label: 'Stav', field: 'stav' }
          ], { emptyMessage: 'Žádné jednotky', onRowClick: r => navigateTo(`#/m/040-nemovitost/f/unit-detail?id=${r.id}`), className: 'cursor-pointer' });
          container.innerHTML = ''; container.appendChild(table);
        } catch (e) { container.innerHTML = `<div class="text-red-600 p-4">${e.message}</div>`; }
      }
    },
    {
      label: 'Nemovitosti',
      icon: '🏢',
      content: async (container) => {
        container.innerHTML = '<div class="text-center py-4">Načítání nemovitostí...</div>';
        try {
          const { data: contracts } = await listContracts({ tenantId: id, status: 'aktivni' });
          const properties = (contracts || []).map(c => c.property).filter(Boolean);
          if (!properties.length) { container.innerHTML = '<div class="text-gray-500 p-4">Žádné nemovitosti</div>'; return; }
          const table = createRelatedEntitiesTable(properties, [
            { label: 'Název', field: 'nazev' }, { label: 'Adresa', field: 'ulice' }, { label: 'Typ', field: 'typ_nemovitosti' }
          ], { emptyMessage: 'Žádné nemovitosti', onRowClick: r => navigateTo(`#/m/040-nemovitost/f/detail?id=${r.id}`), className: 'cursor-pointer' });
          container.innerHTML = ''; container.appendChild(table);
        } catch (e) { container.innerHTML = `<div class="text-red-600 p-4">${e.message}</div>`; }
      }
    },
    {
      label: 'Účty',
      icon: '💳',
      content: accountsTabContent
    },
    {
      label: 'Dokumenty',
      icon: '📎',
      content: (container) => {
        container.innerHTML = `<div class="p-4"><h3 class="text-lg font-semibold mb-2">Dokumenty a přílohy</h3><button id="tenant-attachments-btn" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Spravovat přílohy</button></div>`;
        const btn = container.querySelector('#tenant-attachments-btn');
        if (btn) btn.addEventListener('click', () => window.showAttachmentsModal && window.showAttachmentsModal({ entity: 'subjects', entityId: id }));
      }
    },
    {
      label: 'Systém',
      icon: '⚙️',
      content: `
        <div class="p-4">
          <h3 class="text-lg font-semibold mb-2">Systémové informace</h3>
          <div class="space-y-2">
            <div><strong>Vytvořeno:</strong> ${data.created_at || '-'}</div>
            <div><strong>Poslední úprava:</strong> ${data.updated_at || '-'}</div>
            <div><strong>Upravil:</strong> ${data.updated_by || '-'}</div>
            <div><strong>Archivní:</strong> ${data.archived ? 'Ano' : 'Ne'}</div>
          </div>
        </div>
      `
    }
  ];

  renderTabs(tabsContainer, tabs, { defaultTab: 0 });

  const handlers = {
    onEdit: () => navigateTo(`#/m/050-najemnik/f/form?id=${id}&type=${type}`),
    onAttach: () => id && window.showAttachmentsModal && window.showAttachmentsModal({ entity: 'subjects', entityId: id }),
    onWizard: () => { alert('Průvodce zatím není k dispozici.'); },
    onHistory: () => {
      if (!id) { alert('Historie dostupná po uložení'); return; }
      showHistoryModal(async (subjectId) => {
        return await (await import('/src/modules/050-najemnik/db.js')).getSubjectHistory(subjectId);
      }, id);
    },
    onArchive: async () => {
      if (!id) { alert('Uložte nejprve záznam.'); return; }
      const { data: d, error: err } = await (await import('/src/modules/050-najemnik/db.js')).archiveSubject(id, window.currentUser);
      if (err) alert('Chyba: ' + (err.message || JSON.stringify(err))); else { alert('Archivováno'); navigateTo('#/m/050-najemnik/t/prehled'); }
    }
  };

  renderCommonActions(document.getElementById('commonactions'), {
    moduleActions: ['edit','attach','wizard','archive','history'],
    userRole: window.currentUserRole || 'admin',
    handlers
  });
}

export default { render };
