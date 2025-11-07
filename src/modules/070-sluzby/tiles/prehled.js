// src/modules/070-sluzby/tiles/prehled.js
// Přehled služeb - katalog definic služeb

import { setBreadcrumb } from '/src/ui/breadcrumb.js';
import { renderTable } from '/src/ui/table.js';
import { renderCommonActions } from '/src/ui/commonActions.js';
import { navigateTo } from '/src/app.js';
import { listServiceDefinitions } from '/src/modules/070-sluzby/db.js';
import { getUserPermissions } from '/src/security/permissions.js';

function escapeHtml(s = '') {
  return ('' + s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function formatCurrency(amount) {
  if (!amount && amount !== 0) return '-';
  return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK' }).format(amount);
}

let selectedRow = null;
let showInactive = false;

export default async function render(root) {
  try {
    setBreadcrumb(document.getElementById('crumb'), [
      { icon: 'home', label: 'Domů', href: '#/' },
      { icon: 'settings', label: 'Služby', href: '#/m/070-sluzby' },
      { icon: 'list', label: 'Přehled' }
    ]);
  } catch (e) { /* ignore */ }

  root.innerHTML = `
    <div id="commonactions" class="mb-4"></div>
    <div id="services-table"></div>
  `;

  // Load service definitions
  const { data: services = [], error } = await listServiceDefinitions({ aktivni: showInactive ? null : true, limit: 500 });
  if (error) {
    root.querySelector('#services-table').innerHTML = `<div class="p-4 text-red-600">Chyba při načítání služeb: ${error.message || JSON.stringify(error)}</div>`;
    return;
  }

  const rows = services || [];

  const columns = [
    {
      key: 'kod',
      label: 'Kód',
      width: '12%',
      sortable: true,
      render: (row) => `<span class="font-mono font-semibold">${escapeHtml(row.kod || '—')}</span>`
    },
    {
      key: 'nazev',
      label: 'Název služby',
      width: '25%',
      sortable: true,
      render: (row) => `<a href="#/m/070-sluzby/f/detail?id=${encodeURIComponent(row.id)}" class="text-blue-600 hover:underline">${escapeHtml(row.nazev || '—')}</a>`
    },
    {
      key: 'kategorie',
      label: 'Kategorie',
      width: '15%',
      sortable: true,
      render: (row) => {
        const katMap = {
          'energie': { label: 'Energie', color: '#f59e0b' },
          'voda': { label: 'Voda', color: '#3b82f6' },
          'internet': { label: 'Internet', color: '#8b5cf6' },
          'spravne_poplatky': { label: 'Správné poplatky', color: '#10b981' },
          'jina': { label: 'Jiná', color: '#6b7280' }
        };
        const kat = katMap[row.kategorie] || { label: row.kategorie || '—', color: '#ddd' };
        return `<span style="
          display:inline-block;
          padding:3px 8px;
          border-radius:10px;
          background:${kat.color};
          color:#fff;
          font-weight:600;
          font-size:0.8em;
        ">${escapeHtml(kat.label)}</span>`;
      }
    },
    {
      key: 'typ_uctovani',
      label: 'Typ účtování',
      width: '18%',
      sortable: true,
      render: (row) => {
        const typMap = {
          'pevna_sazba': 'Pevná sazba',
          'merena_spotreba': 'Měřená spotřeba',
          'na_pocet_osob': 'Na počet osob',
          'na_m2': 'Na m²',
          'procento_z_najmu': 'Procento z nájmu'
        };
        return typMap[row.typ_uctovani] || row.typ_uctovani || '—';
      }
    },
    {
      key: 'zakladni_cena',
      label: 'Základní cena',
      width: '12%',
      render: (row) => `<span class="font-semibold">${formatCurrency(row.zakladni_cena)}</span>`
    },
    {
      key: 'jednotka',
      label: 'Jednotka',
      width: '10%',
      render: (row) => escapeHtml(row.jednotka || '—')
    },
    {
      key: 'aktivni',
      label: 'Aktivní',
      width: '8%',
      render: (row) => row.aktivni ? '✓' : ''
    }
  ];

  function drawActions() {
    const ca = document.getElementById('commonactions');
    if (!ca) return;
    const hasSel = !!selectedRow;
    const userRole = window.currentUserRole || 'admin';

    renderCommonActions(ca, {
      moduleActions: ['add', 'edit', 'refresh'],
      handlers: {
        onAdd: () => navigateTo('#/m/070-sluzby/f/edit'),
        onEdit: !!selectedRow ? () => navigateTo(`#/m/070-sluzby/f/edit?id=${selectedRow.id}`) : undefined,
        onRefresh: () => location.reload()
      }
    });
  }

  renderTable(root.querySelector('#services-table'), {
    columns,
    rows,
    options: {
      moduleId: '070-sluzby-prehled',
      filterValue: '',
      showArchived: showInactive,
      archivedLabel: 'Zobrazit neaktivní',
      onArchivedChange: (val) => {
        showInactive = val;
        render(root);
      },
      onRowSelect: (row) => {
        selectedRow = row;
        drawActions();
      },
      onRowDoubleClick: (row) => {
        navigateTo(`#/m/070-sluzby/f/detail?id=${row.id}`);
      }
    }
  });

  drawActions();
}
