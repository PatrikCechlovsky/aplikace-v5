// src/modules/060-smlouva/tiles/prehled.js
// Přehled všech smluv

import { setBreadcrumb } from '/src/ui/breadcrumb.js';
import { renderTable } from '/src/ui/table.js';
import { renderCommonActions } from '/src/ui/commonActions.js';
import { navigateTo } from '/src/app.js';
import { listContracts } from '/src/modules/060-smlouva/db.js';
import { showAttachmentsModal } from '/src/ui/attachments.js';
import { getUserPermissions } from '/src/security/permissions.js';

function escapeHtml(s = '') {
  return ('' + s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function formatCzechDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return '';
  return d.toLocaleDateString('cs-CZ');
}

function formatCurrency(amount) {
  if (!amount && amount !== 0) return '-';
  return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK' }).format(amount);
}

let selectedRow = null;
let showArchived = false;

export default async function render(root) {
  try {
    setBreadcrumb(document.getElementById('crumb'), [
      { icon: 'home', label: 'Domů', href: '#/' },
      { icon: 'description', label: 'Smlouvy', href: '#/m/060-smlouva' },
      { icon: 'list', label: 'Přehled' }
    ]);
  } catch (e) { /* ignore */ }

  root.innerHTML = `
    <div id="commonactions" class="mb-4"></div>
    <div id="contracts-table"></div>
  `;

  // Load contracts
  // TODO: Implement pagination for better performance with large datasets
  const { data: contracts = [], error } = await listContracts({ showArchived, limit: 1000 });
  if (error) {
    root.querySelector('#contracts-table').innerHTML = `<div class="p-4 text-red-600">Chyba při načítání smluv: ${error.message || JSON.stringify(error)}</div>`;
    return;
  }

  const rows = contracts || [];

  const columns = [
    {
      key: 'cislo_smlouvy',
      label: 'Číslo smlouvy',
      width: '15%',
      sortable: true,
      render: (row) => `<a href="#/m/060-smlouva/f/detail?id=${encodeURIComponent(row.id)}" class="text-blue-600 hover:underline font-semibold">${escapeHtml(row.cislo_smlouvy || '—')}</a>`
    },
    {
      key: 'stav',
      label: 'Stav',
      width: '12%',
      sortable: true,
      render: (row) => {
        const stavMap = {
          'koncept': { label: 'Koncept', color: '#94a3b8' },
          'cekajici_podepsani': { label: 'Čeká na podpis', color: '#f59e0b' },
          'aktivni': { label: 'Aktivní', color: '#10b981' },
          'ukoncena': { label: 'Ukončená', color: '#6b7280' },
          'zrusena': { label: 'Zrušená', color: '#ef4444' },
          'propadla': { label: 'Propadlá', color: '#dc2626' }
        };
        const stav = stavMap[row.stav] || { label: row.stav || '—', color: '#ddd' };
        return `<span style="
          display:inline-block;
          padding:4px 10px;
          border-radius:12px;
          background:${stav.color};
          color:#fff;
          font-weight:600;
          font-size:0.85em;
          box-shadow:0 1px 2px 0 #0001;
        ">${escapeHtml(stav.label)}</span>`;
      }
    },
    {
      key: 'tenant',
      label: 'Nájemník',
      width: '18%',
      sortable: true,
      render: (row) => escapeHtml(row.tenant?.display_name || '—')
    },
    {
      key: 'unit',
      label: 'Jednotka',
      width: '15%',
      render: (row) => escapeHtml(row.unit?.oznaceni || '—')
    },
    {
      key: 'property',
      label: 'Nemovitost',
      width: '15%',
      render: (row) => escapeHtml(row.property?.nazev || '—')
    },
    {
      key: 'datum_zacatek',
      label: 'Od',
      width: '10%',
      render: (row) => formatCzechDate(row.datum_zacatek)
    },
    {
      key: 'najem_vyse',
      label: 'Nájem',
      width: '10%',
      render: (row) => `<span class="font-semibold text-green-600">${formatCurrency(row.najem_vyse)}</span>`
    },
    {
      key: 'archived',
      label: 'Archiv',
      width: '5%',
      render: (row) => row.archived ? 'Ano' : ''
    }
  ];

  function drawActions() {
    const ca = document.getElementById('commonactions');
    if (!ca) return;
    const hasSel = !!selectedRow && !selectedRow.archived;
    const userRole = window.currentUserRole || 'admin';
    const canArchive = getUserPermissions(userRole).includes('archive');

    renderCommonActions(ca, {
      moduleActions: ['add', 'edit', 'archive', 'attach', 'refresh'],
      handlers: {
        onAdd: () => navigateTo('#/m/060-smlouva/f/edit'),
        onEdit: !!selectedRow ? () => navigateTo(`#/m/060-smlouva/f/edit?id=${selectedRow.id}`) : undefined,
        onArchive: canArchive && hasSel ? () => handleArchive(selectedRow) : undefined,
        onAttach: !!selectedRow ? () => showAttachmentsModal({ entity: 'contracts', entityId: selectedRow.id }) : undefined,
        onRefresh: () => location.reload()
      }
    });
  }

  async function handleArchive(row) {
    if (!row) return;
    const confirmed = confirm(`Opravdu chcete archivovat smlouvu ${row.cislo_smlouvy}?`);
    if (!confirmed) return;
    const { archiveContract } = await import('/src/modules/060-smlouva/db.js');
    const { error } = await archiveContract(row.id);
    if (error) {
      alert('Chyba při archivaci: ' + (error.message || JSON.stringify(error)));
    } else {
      alert('Smlouva byla archivována');
      location.reload();
    }
  }

  renderTable(root.querySelector('#contracts-table'), {
    columns,
    rows,
    options: {
      moduleId: '060-smlouva-prehled',
      filterValue: '',
      showArchived,
      onArchivedChange: (val) => {
        showArchived = val;
        render(root);
      },
      onRowSelect: (row) => {
        selectedRow = row;
        drawActions();
      },
      onRowDoubleClick: (row) => {
        navigateTo(`#/m/060-smlouva/f/detail?id=${row.id}`);
      }
    }
  });

  drawActions();
}
