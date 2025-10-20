# 📊 VIZUÁLNÍ SROVNÁNÍ – Před a Po standardizaci

## 🔴 PŘED standardizací (aktuální stav)

### Modul 010-sprava-uzivatelu ✅ (SPRÁVNĚ - použij jako vzor)
```
tiles/prehled.js:
  ✅ Breadcrumbs (Domů › Uživatelé › Přehled)
  ✅ CommonActions v #commonactions
  ✅ Filtr + checkbox "Zobrazit archivované"
  ✅ Výběr řádku (selectedRow)
  ✅ Dvojklik pro editaci
  ✅ Akce se mění podle výběru

forms/form.js:
  ✅ Breadcrumbs
  ✅ CommonActions (save, attach, history, reject, archive)
  ✅ Readonly pole (created_at, updated_at, updated_by)
  ✅ Historie změn (tlačítko + modal)
  ✅ Přílohy
  ✅ updated_by se automaticky nastavuje
  ✅ unsavedHelper

forms/history.js:
  ✅ Existuje
  ✅ Tabulka profiles_history v DB
  ✅ Trigger pro automatické ukládání
```

### Modul 030-pronajimatel ⚠️ (NEÚPLNÉ)
```
tiles/prehled.js:
  ❌ Breadcrumbs CHYBÍ
  ❌ CommonActions CHYBÍ
  ⚠️ Filtr existuje, ale chybí checkbox "Zobrazit archivované"
  ❌ Výběr řádku CHYBÍ
  ❌ Dvojklik NEFUNGUJE správně
  ❌ Akce se nemění podle výběru

forms/form.js:
  ❌ Breadcrumbs CHYBÍ
  ❌ CommonActions CHYBÍ nebo špatně
  ❌ Readonly pole CHYBÍ (created_at, updated_at, updated_by)
  ❌ Historie změn CHYBÍ
  ⚠️ Přílohy možná existují
  ❌ updated_by se NENASTAVUJE
  ❌ unsavedHelper CHYBÍ

forms/history.js:
  ❌ NEEXISTUJE
  ❌ Tabulka subjects_history NEEXISTUJE v DB
  ❌ Trigger NEEXISTUJE
```

### Modul 040-nemovitost ❌ (KRITICKÝ PROBLÉM)
```
tiles/prehled.js:
  ❌ SOUBOR JE PRÁZDNÝ (1 byte)
  ❌ VŠECHNO CHYBÍ

tiles/seznam.js:
  ❌ SOUBOR JE PRÁZDNÝ (1 byte)

forms/detail.js:
  ❌ SOUBOR JE PRÁZDNÝ (1 byte)

forms/edit.js:
  ❌ SOUBOR JE PRÁZDNÝ (1 byte)

forms/history.js:
  ❌ NEEXISTUJE
```

### Modul 050-najemnik ⚠️ (NEÚPLNÉ - podobné jako 030)
```
tiles/prehled.js:
  ❌ Breadcrumbs CHYBÍ
  ❌ CommonActions CHYBÍ
  ⚠️ Filtr existuje, ale chybí checkbox "Zobrazit archivované"
  ❌ Výběr řádku CHYBÍ
  ❌ Dvojklik NEFUNGUJE správně

forms/form.js:
  ❌ Breadcrumbs CHYBÍ
  ❌ CommonActions CHYBÍ
  ❌ Readonly pole CHYBÍ
  ❌ Historie změn CHYBÍ
  ❌ updated_by se NENASTAVUJE
  ❌ unsavedHelper CHYBÍ

forms/history.js:
  ❌ NEEXISTUJE
```

---

## 🟢 PO standardizaci (cílový stav)

### VŠECHNY MODULY budou mít STEJNOU strukturu:

### tiles/prehled.js (KAŽDÝ MODUL)
```javascript
✅ Importy:
   - renderTable, renderCommonActions, setBreadcrumb
   - navigateTo, route, getUserPermissions
   - showAttachmentsModal
   - listXXX, archiveXXX

✅ State:
   let selectedRow = null;
   let showArchived = false;
   let filterValue = '';

✅ Breadcrumbs:
   setBreadcrumb([
     { icon: 'home', label: 'Domů', href: '#/' },
     { icon: 'xxx', label: 'Název modulu', href: '#/m/XXX' },
     { icon: 'list', label: 'Přehled' }
   ]);

✅ CommonActions (v #commonactions):
   renderCommonActions(ca, {
     moduleActions: ['add', 'edit', 'archive', 'attach', 'refresh'],
     handlers: {
       onAdd, onEdit, onArchive, onAttach, onRefresh
     }
   });

✅ Tabulka:
   renderTable({
     columns: [...],
     rows: [...],
     options: {
       moduleId: 'XXX',
       filterValue: filterValue,
       customHeader: filtr + checkbox "Zobrazit archivované",
       onRowSelect: mění selectedRow + volá drawActions(),
       onRowDblClick: otevře formulář v edit módu
     }
   });

✅ Handler archivace:
   - Kontroluje vazby (hasActiveVazby)
   - Zobrazuje varování pokud existují vazby
   - Archivuje záznam (archiveXXX)
   - Znovu načte přehled
```

### forms/form.js (KAŽDÝ MODUL)
```javascript
✅ Importy:
   - setBreadcrumb, renderForm, renderCommonActions
   - navigateTo, getXXX, updateXXX, archiveXXX
   - useUnsavedHelper, showAttachmentsModal
   - showHistoryModal (⚠️ POVINNÉ!)
   - setUnsaved

✅ Pomocné funkce:
   - getHashParams() - parsování URL
   - formatCzechDate() - formátování datumů

✅ FIELDS:
   - Všechna pole entity
   - ⚠️ MUSÍ obsahovat readonly pole:
     * updated_at (label, readOnly, format: formatCzechDate)
     * updated_by (label, readOnly)
     * created_at (label, readOnly, format: formatCzechDate)

✅ Breadcrumbs:
   setBreadcrumb([
     { icon: 'home', label: 'Domů', href: '#/' },
     { icon: 'xxx', label: 'Modul', href: '#/m/XXX' },
     { icon: 'form', label: 'Formulář' },
     { icon: 'account', label: jmeno }
   ]);

✅ CommonActions:
   READ mód: ['edit', 'reject', 'attach', 'history']
   EDIT mód: ['save', 'attach', 'archive', 'reject', 'history']

✅ Handlers:
   onSave:
     - grabValues(root)
     - Nastaví updated_by z window.currentUser
     - updateXXX(id, values, currentUser)
     - setUnsaved(false)
     - Znovu načte a vykreslí data
   
   onHistory:
     - showHistoryModal(id)  ⚠️ POVINNÉ!
   
   onAttach:
     - showAttachmentsModal({entity, entityId})
   
   onArchive:
     - hasActiveVazby(id)
     - archiveXXX(id, currentUser)

✅ renderForm:
   - readOnly podle módu
   - showSubmit: false
   - layout: columns (responsive), density: compact
   - sections: logické rozdělení polí

✅ unsavedHelper:
   const formEl = root.querySelector("form");
   if (formEl) useUnsavedHelper(formEl);

✅ grabValues:
   - PŘESKAKUJE readonly pole! ⚠️ KRITICKÉ!
   - Správně zpracovává checkboxy
```

### forms/history.js (KAŽDÝ MODUL)
```javascript
✅ Existuje soubor

✅ Import supabase

✅ FIELD_LABELS:
   - Obsahuje VŠECHNA pole z FIELDS
   - České názvy polí

✅ showHistoryModal(entityId):
   - Načítá z xxx_history tabulky
   - Filtruje podle entity_id
   - Řadí podle changed_at DESC
   - Zobrazuje alert při chybě
   - Vytváří HTML tabulku
   - Vytváří modal s křížkem

✅ Export funkce
```

### Databáze (KAŽDÝ MODUL)
```sql
✅ Hlavní tabulka (xxx):
   - id (uuid, PK)
   - Pole entity
   - archived (boolean, default false)
   - created_at (timestamptz, default now())
   - updated_at (timestamptz)
   - updated_by (text)
   - profile_id (uuid, FK)

✅ Tabulka historie (xxx_history):
   - id (uuid, PK)
   - entity_id (uuid, FK)
   - field (text)
   - old_value (text)
   - new_value (text)
   - changed_by (text)
   - changed_at (timestamptz)
   - Index na entity_id

✅ Trigger (track_xxx_changes):
   - AFTER UPDATE
   - Prochází všechny sloupce
   - Ukládá změny do historie
   - Používá updated_by z NEW

✅ RLS pravidla:
   - SELECT, INSERT, UPDATE pro vlastní záznamy
   - Podle profile_id
```

---

## 📊 SROVNÁNÍ KÓDU

### ❌ PŘED (modul 030 - tiles/prehled.js)
```javascript
import { renderTable } from '/src/ui/table.js';
import { listSubjects } from '/src/db/subjects.js';
import { formatDate } from '/src/app/utils.js';

export async function render(root) {
  root.innerHTML = '<h2>Všichni subjekty</h2>';  // ❌ Není h2 potřeba
  const { data, error } = await listSubjects({ profileId, limit: 500 });
  if (error) {
    root.innerHTML += `<div class="error">Chyba: ${error.message}</div>`;
    return;
  }
  const columns = [
    // ... sloupce
  ];
  renderTable(root, { columns, rows: data || [] });
  // ❌ CHYBÍ breadcrumbs
  // ❌ CHYBÍ commonActions
  // ❌ CHYBÍ filtr s archivovanými
  // ❌ CHYBÍ výběr řádku
  // ❌ CHYBÍ dvojklik
}
```

### ✅ PO (standardizovaný modul)
```javascript
import { renderTable } from '../../../ui/table.js';
import { renderCommonActions } from '../../../ui/commonActions.js';
import { setBreadcrumb } from '../../../ui/breadcrumb.js';
import { navigateTo, route } from '../../../app.js';
import { getUserPermissions } from '../../../security/permissions.js';
import { showAttachmentsModal } from '../../../ui/attachments.js';
import { listSubjects, archiveSubject } from '../../../db/subjects.js';

let selectedRow = null;
let showArchived = false;
let filterValue = '';

export async function render(root) {
  // ✅ BREADCRUMBS
  setBreadcrumb(document.getElementById('crumb'), [
    { icon: 'home', label: 'Domů', href: '#/' },
    { icon: 'users', label: 'Pronajímatelé', href: '#/m/030-pronajimatel' },
    { icon: 'list', label: 'Přehled' }
  ]);

  root.innerHTML = `<div id="subjects-table"></div>`;

  const { data, error } = await listSubjects({ profileId, limit: 500 });
  if (error) {
    root.querySelector('#subjects-table').innerHTML = 
      `<div class="p-4 text-red-600">Chyba: ${error.message}</div>`;
    return;
  }

  // ✅ FILTROVÁNÍ ARCHIVOVANÝCH
  const rows = (data || [])
    .filter(r => showArchived ? true : !r.archived)
    .map(r => ({
      ...r,
      archivedLabel: r.archived ? 'Ano' : ''
    }));

  const columns = [
    // ... sloupce
    { key: 'archivedLabel', label: 'Archivován', sortable: true }
  ];

  // ✅ COMMON ACTIONS
  function drawActions() {
    const ca = document.getElementById('commonactions');
    if (!ca) return;
    
    const hasSel = !!selectedRow && !selectedRow.archived;
    
    renderCommonActions(ca, {
      moduleActions: ['add', 'edit', 'archive', 'attach', 'refresh'],
      handlers: {
        onAdd: () => navigateTo('#/m/030-pronajimatel/f/create'),
        onEdit: hasSel ? () => navigateTo(`#/m/030-pronajimatel/f/form?id=${selectedRow.id}`) : undefined,
        onArchive: hasSel ? () => handleArchive(selectedRow) : undefined,
        onAttach: !!selectedRow ? () => showAttachmentsModal({ entity: 'subjects', entityId: selectedRow.id }) : undefined,
        onRefresh: () => route()
      }
    });
  }

  async function handleArchive(row) {
    if (!row) return;
    const hasVazby = await hasActiveVazby(row.id);
    if (hasVazby) {
      alert('Nelze archivovat, existují aktivní vazby!');
      return;
    }
    await archiveSubject(row.id);
    selectedRow = null;
    await render(root);
  }

  async function hasActiveVazby(id) {
    // TODO: implementovat kontrolu vazeb
    return false;
  }

  drawActions();

  // ✅ TABULKA S FILTREM A VÝBĚREM
  renderTable(root.querySelector('#subjects-table'), {
    columns,
    rows,
    options: {
      moduleId: '030-pronajimatel',
      filterValue: filterValue,
      customHeader: ({ filterInputHtml }) => `
        <div class="flex items-center gap-4">
          ${filterInputHtml}
          <label class="flex items-center gap-1 text-sm cursor-pointer ml-2">
            <input type="checkbox" id="toggle-archived" ${showArchived ? 'checked' : ''}/>
            Zobrazit archivované
          </label>
        </div>
      `,
      onRowSelect: row => {
        selectedRow = (selectedRow && selectedRow.id === row.id) ? null : row;
        drawActions();
      },
      onRowDblClick: row => {
        selectedRow = row;
        navigateTo(`#/m/030-pronajimatel/f/form?id=${row.id}&mode=edit`);
      }
    }
  });

  // ✅ CHECKBOX HANDLER
  root.querySelector('#subjects-table').addEventListener('change', (e) => {
    if (e.target && e.target.id === 'toggle-archived') {
      showArchived = e.target.checked;
      render(root);
    }
  });
}

export default { render };
```

---

## 📈 STATISTIKY

### Před standardizací:
```
Modul 010: ████████████████████ 100% (VZOR)
Modul 020: ████████░░░░░░░░░░░░  40% (základní funkcionalita)
Modul 030: ██████░░░░░░░░░░░░░░  30% (chybí většina funkcí)
Modul 040: ░░░░░░░░░░░░░░░░░░░░   0% (prázdné soubory)
Modul 050: ██████░░░░░░░░░░░░░░  30% (chybí většina funkcí)

Průměr: 40% kompletní
```

### Po standardizaci (cíl):
```
Modul 010: ████████████████████ 100% ✅
Modul 020: ████████████████████ 100% ✅
Modul 030: ████████████████████ 100% ✅
Modul 040: ████████████████████ 100% ✅
Modul 050: ████████████████████ 100% ✅

Průměr: 100% kompletní 🎉
```

---

## 🎯 SHRNUTÍ ZMĚN

| Funkce | Modul 010 | Modul 030 (před) | Modul 030 (po) |
|--------|-----------|------------------|----------------|
| Breadcrumbs | ✅ | ❌ | ✅ |
| CommonActions | ✅ | ❌ | ✅ |
| Filtr + archivované | ✅ | ⚠️ | ✅ |
| Výběr řádku | ✅ | ❌ | ✅ |
| Dvojklik | ✅ | ❌ | ✅ |
| Historie změn | ✅ | ❌ | ✅ |
| Readonly pole | ✅ | ❌ | ✅ |
| updated_by | ✅ | ❌ | ✅ |
| unsavedHelper | ✅ | ❌ | ✅ |
| Přílohy | ✅ | ⚠️ | ✅ |
| **CELKEM** | **10/10** | **1/10** | **10/10** |

---

## 📋 KONTROLNÍ SEZNAM PRO UŽIVATELE

### Pro KAŽDÝ modul zkontroluj:

#### tiles/prehled.js:
- [ ] Má breadcrumbs?
- [ ] Má commonActions v #commonactions?
- [ ] Má filtr + checkbox "Zobrazit archivované"?
- [ ] Má selectedRow state?
- [ ] Má onRowSelect handler?
- [ ] Má onRowDblClick handler?
- [ ] Má handleArchive s kontrolou vazeb?

#### forms/form.js:
- [ ] Má breadcrumbs?
- [ ] Má commonActions?
- [ ] Má readonly pole (created_at, updated_at, updated_by)?
- [ ] Má tlačítko Historie?
- [ ] Má import showHistoryModal?
- [ ] Nastavuje updated_by při ukládání?
- [ ] Používá useUnsavedHelper?
- [ ] grabValues() přeskakuje readonly pole?

#### forms/history.js:
- [ ] Soubor existuje?
- [ ] FIELD_LABELS obsahuje všechna pole?
- [ ] Načítá z xxx_history tabulky?

#### Databáze:
- [ ] Tabulka xxx existuje?
- [ ] Má sloupce: archived, created_at, updated_at, updated_by?
- [ ] Tabulka xxx_history existuje?
- [ ] Trigger track_xxx_changes existuje?

---

**Použij dokumenty pro detailní návody jak opravit každý bod!**

- **ODPOVED-NA-POZADAVKY.md** - Seznam problémů a rychlé řešení
- **STANDARDIZACNI-NAVOD.md** - Kompletní šablony kódu
- **MODUL-CHECKLIST.md** - 189 kontrolních bodů
- **RYCHLY-PRUVODCE.md** - Vytvoř nový modul za 30 minut
