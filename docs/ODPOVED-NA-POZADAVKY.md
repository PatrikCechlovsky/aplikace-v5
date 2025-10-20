# 🎯 ODPOVĚĎ NA VAŠE POŽADAVKY – Seznám nekonzistencí a návod

> **Vaše otázka:** "Máš rozdělanou aplikaci, je možné udělat seznam věcí které neodpovídají nastavení? Chceš aby bylo dynamické, ale všechno bylo nastavováno stejně..."

## ✅ CO JSEM UDĚLAL

Vytvořil jsem **3 kompletní dokumenty** které přesně odpovídají na vaše požadavky:

### 1. 📋 **STANDARDIZACNI-NAVOD.md** (hlavní dokument)
- **Co obsahuje:**
  - ✅ Přehled všech modulů a jejich aktuálního stavu
  - ✅ Seznam VŠECH identifikovaných problémů a nekonzistencí
  - ✅ Přesné šablony kódu pro dlaždice (tiles)
  - ✅ Přesné šablony kódu pro formuláře (forms)
  - ✅ Návod jak implementovat historii změn
  - ✅ Standardy pro CommonActions, Breadcrumbs, Sidebar
  - ✅ Požadavky na filtrace a seznamy
  - ✅ Databázové struktury a SQL skripty
  - ✅ Kontrolní checklist pro každý modul
  
### 2. ✅ **MODUL-CHECKLIST.md** (kontrolní seznam)
- **Co obsahuje:**
  - ✅ 189 kontrolních bodů pro každý modul
  - ✅ Formulář k vyplnění pro kontrolu modulu
  - ✅ Bodování (kolik % je hotovo)
  - ✅ Akční plán co je potřeba dodělat

### 3. 🚀 **RYCHLY-PRUVODCE.md** (praktický návod)
- **Co obsahuje:**
  - ✅ Krok-za-krokem návod na vytvoření nového modulu (30 minut)
  - ✅ Copy-paste šablony kódu
  - ✅ SQL skripty pro databázi
  - ✅ Troubleshooting časté problémy

---

## 📊 SEZNAM VĚCÍ KTERÉ NEODPOVÍDAJÍ NASTAVENÍ

### ❌ KRITICKÉ PROBLÉMY (musí se opravit)

#### 1. **Modul 040-nemovitost – PRÁZDNÉ SOUBORY**
```
Problém: Soubory mají pouze 1 byte, jsou nepoužitelné
Soubory: prehled.js, detail.js, edit.js
Řešení: Kompletní reimplementace podle šablony
```

#### 2. **Chybí historie změn ve všech modulech kromě 010**
```
Moduly bez historie: 020, 030, 040, 050
Co chybí:
  - forms/history.js soubor
  - xxx_history tabulka v databázi
  - Trigger pro automatické ukládání změn
  - Tlačítko Historie v formulářích
```

#### 3. **Nejednotné CommonActions**
```
Problémy:
  - Modul 010: Správně v #commonactions kontejneru ✅
  - Moduly 030, 050: CommonActions chybí nebo jsou špatně umístěné ❌
  - CommonActions nejsou ve všech view (tiles i forms)
```

#### 4. **Chybějící breadcrumbs**
```
Problémy:
  - Modul 010: Breadcrumbs OK (Domů › Uživatelé › Přehled) ✅
  - Moduly 030, 050: Breadcrumbs chybí nebo neúplné ❌
  - Není dodržená struktura (Domů › Modul › Sekce › Detail)
```

---

### ⚠️ STŘEDNĚ ZÁVAŽNÉ PROBLÉMY

#### 5. **Nejednotné formuláře**
```
Modul 010 má:
  - Sekce (Profil, Systém)
  - Readonly pole (created_at, updated_at, updated_by)
  - Formátování datumů
  - unsavedHelper (ochrana dat)
  - Tlačítko Historie
  - Tlačítko Přílohy
  
Moduly 030, 050:
  - Zjednodušené formuláře bez těchto funkcí
  - Chybí readonly pole
  - Chybí sekce
```

#### 6. **Různé implementace filtrů**
```
Modul 010:
  - Fulltext filtr bez diakritiky
  - Checkbox "Zobrazit archivované"
  - customHeader s flexibilním layoutem
  
Moduly 030, 050:
  - Jednodušší filtry
  - Není checkbox pro archivované
```

#### 7. **Nejednotné dlaždice/přehledy**
```
Modul 010:
  - Výběr řádku (selectedRow)
  - Dvojklik pro editaci
  - Akce se mění podle výběru
  - Archivace s kontrolou vazeb
  
Moduly 030, 050:
  - Chybí výběr řádku
  - Chybí interaktivita
```

---

### 📝 DROBNÉ PROBLÉMY

#### 8. **Zakomentované moduly**
```
V modules.index.js jsou zakomentovány:
  - 040-nemovitost
  - 060-smlouva
  - 070-sluzby
  - 080-platby
  - 090-finance
  - 100-energie
  - 110-udrzba
  - 120-dokumenty
  - 130-komunikace
  - 900-nastaveni
  - 990-help
  
Důvod: Asi ještě nejsou připravené
Řešení: Postupně odkomentovat až budou hotové
```

#### 9. **Chybějící ikony**
```
Některé ikony v module.config.js neexistují v icons.js
Řešení: Doplnit do /src/ui/icons.js
```

#### 10. **Není jednotný způsob načítání dat**
```
Modul 010: Používá db.js s centralizovanými funkcemi
Moduly 030, 050: Používají /src/db/subjects.js
Není jednotné kde jsou DB funkce
```

---

## 🎯 JAK TO OPRAVIT – NÁVOD PRO KAŽDOU DLAŽDICI

### Pro KAŽDOU dlaždici (tiles/xxx.js):

#### ✅ 1. IMPORTY (musí být VŽDY tyto)
```javascript
import { renderTable } from '../../../ui/table.js';
import { renderCommonActions } from '../../../ui/commonActions.js';
import { setBreadcrumb } from '../../../ui/breadcrumb.js';
import { navigateTo, route } from '../../../app.js';
import { getUserPermissions } from '../../../security/permissions.js';
import { showAttachmentsModal } from '../../../ui/attachments.js';
import { listXXX, archiveXXX } from '../../../db.js';
```

#### ✅ 2. STATE PROMĚNNÉ (musí být VŽDY tyto)
```javascript
let selectedRow = null;
let showArchived = false;
let filterValue = '';
```

#### ✅ 3. BREADCRUMBS (musí být VŽDY nastavené)
```javascript
setBreadcrumb(document.getElementById('crumb'), [
  { icon: 'home',  label: 'Domů',      href: '#/' },
  { icon: 'xxx',   label: 'Název modulu', href: '#/m/XXX-modul' },
  { icon: 'list',  label: 'Přehled' }
]);
```

#### ✅ 4. COMMON ACTIONS (musí být VŽDY v #commonactions)
```javascript
function drawActions() {
  const ca = document.getElementById('commonactions');
  if (!ca) return;
  
  renderCommonActions(ca, {
    moduleActions: ['add', 'edit', 'archive', 'attach', 'refresh'],
    handlers: {
      onAdd:    () => navigateTo('#/m/XXX/f/create'),
      onEdit:   !!selectedRow ? () => navigateTo(`#/m/XXX/f/form?id=${selectedRow.id}`) : undefined,
      onArchive: !!selectedRow && !selectedRow.archived ? () => handleArchive(selectedRow) : undefined,
      onAttach: !!selectedRow ? () => showAttachmentsModal({ entity: 'xxx', entityId: selectedRow.id }) : undefined,
      onRefresh: () => route()
    }
  });
}
```

#### ✅ 5. TABULKA (musí mít tyto options)
```javascript
renderTable(root.querySelector('#xxx-table'), {
  columns,
  rows,
  options: {
    moduleId: 'XXX-modul',
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
      navigateTo(`#/m/XXX/f/form?id=${row.id}&mode=edit`);
    }
  }
});
```

---

## 🎯 JAK TO OPRAVIT – NÁVOD PRO KAŽDÝ FORMULÁŘ

### Pro KAŽDÝ formulář (forms/form.js):

#### ✅ 1. MUSÍ MÍT TYTO IMPORTY
```javascript
import { setBreadcrumb } from '../../../ui/breadcrumb.js';
import { renderForm } from '../../../ui/form.js';
import { renderCommonActions } from '../../../ui/commonActions.js';
import { navigateTo } from '../../../app.js';
import { getXXX, updateXXX, archiveXXX } from '../../../db.js';
import { useUnsavedHelper } from '../../../ui/unsaved-helper.js';
import { showAttachmentsModal } from '../../../ui/attachments.js';
import { showHistoryModal } from './history.js';  // ⚠️ POVINNÉ!
import { setUnsaved } from '../../../app.js';
```

#### ✅ 2. MUSÍ MÍT READONLY POLE V FIELDS
```javascript
const FIELDS = [
  // ... tvoje pole ...
  
  // ⚠️ MUSÍ BÝT VŽDY:
  { key: 'updated_at',  label: 'Poslední úprava', type: 'label', readOnly: true, format: formatCzechDate },
  { key: 'updated_by',  label: 'Upravil',         type: 'label', readOnly: true },
  { key: 'created_at',  label: 'Vytvořen',        type: 'label', readOnly: true, format: formatCzechDate }
];
```

#### ✅ 3. MUSÍ MÍT TLAČÍTKO HISTORIE
```javascript
// V handlers:
handlers.onHistory = () => id && showHistoryModal(id);

// V moduleActions:
const actionsByMode = {
  read:   ['edit', 'reject', 'attach', 'history'],  // <-- 'history' MUSÍ BÝT
  edit:   ['save', 'attach', 'archive', 'reject', 'history']  // <-- 'history' MUSÍ BÝT
};
```

#### ✅ 4. MUSÍ MÍT UPDATED_BY PŘI UKLÁDÁNÍ
```javascript
handlers.onSave = async () => {
  const values = grabValues(root);
  
  // ⚠️ MUSÍ BÝT:
  if (window.currentUser) {
    values.updated_by =
      window.currentUser.display_name ||
      window.currentUser.username ||
      window.currentUser.email;
  }
  
  const { data, error } = await updateXXX(id, values, window.currentUser);
  // ...
};
```

#### ✅ 5. MUSÍ MÍT UNSAVED HELPER
```javascript
// Na konci render():
const formEl = root.querySelector("form");
if (formEl) useUnsavedHelper(formEl);
```

---

## 🎯 JAK TO OPRAVIT – HISTORIE ZMĚN

### Pro KAŽDÝ hlavní modul musíš vytvořit:

#### ✅ 1. SOUBOR forms/history.js
```javascript
// Viz šablona v RYCHLY-PRUVODCE.md nebo STANDARDIZACNI-NAVOD.md
```

#### ✅ 2. TABULKA V DATABÁZI
```sql
CREATE TABLE IF NOT EXISTS public.xxx_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_id uuid NOT NULL,
  field text NOT NULL,
  old_value text,
  new_value text,
  changed_by text,
  changed_at timestamptz DEFAULT now(),
  FOREIGN KEY (entity_id) REFERENCES public.xxx(id) ON DELETE CASCADE
);
```

#### ✅ 3. TRIGGER V DATABÁZI
```sql
-- Viz kompletní SQL v RYCHLY-PRUVODCE.md nebo STANDARDIZACNI-NAVOD.md
```

---

## 📋 KONTROLNÍ CHECKLIST PRO KAŽDÝ MODUL

Použij tento checklist pro kontrolu KAŽDÉHO modulu:

### Dlaždice (tiles/prehled.js):
- [ ] Má všechny potřebné importy
- [ ] Nastavuje breadcrumbs
- [ ] Vykresluje commonActions do #commonactions
- [ ] Má filtr + checkbox "Zobrazit archivované"
- [ ] Má výběr řádku (selectedRow)
- [ ] Má dvojklik pro editaci
- [ ] Akce se mění podle výběru
- [ ] Má refresh button

### Formulář (forms/form.js):
- [ ] Má všechny potřebné importy
- [ ] Nastavuje breadcrumbs
- [ ] Vykresluje commonActions
- [ ] Má READONLY pole (updated_at, updated_by, created_at)
- [ ] Má tlačítko Historie (onHistory)
- [ ] Má tlačítko Přílohy (onAttach)
- [ ] Nastavuje updated_by při ukládání
- [ ] Používá useUnsavedHelper
- [ ] grabValues() NEUKLÁDÁ readonly pole

### Historie (forms/history.js):
- [ ] Soubor existuje
- [ ] showHistoryModal() je exportovaná
- [ ] FIELD_LABELS obsahuje všechna pole
- [ ] Tabulka xxx_history existuje v DB
- [ ] Trigger funguje

---

## 🎯 PRIORITIZACE – CO DĚLAT NEJDŘÍVE

### 1. KRITICKÉ (udělej IHNED):
1. ✅ **Oprav modul 040-nemovitost** – soubory jsou prázdné, kompletně reimplementuj
2. ✅ **Přidej historii do modulů 030, 050** – vytvoř history.js + DB strukturu

### 2. DŮLEŽITÉ (udělej brzy):
3. ✅ **Sjednoť commonActions** ve všech modulech – vždy do #commonactions
4. ✅ **Přidej breadcrumbs** všude kde chybí
5. ✅ **Sjednoť filtrace** – všude checkbox "Zobrazit archivované"

### 3. ŽÁDOUCÍ (udělej později):
6. ✅ Odkomentuj další moduly (060-990) postupně
7. ✅ Doplň chybějící ikony
8. ✅ Sjednoť DB funkce (centralizovat do db.js)

---

## 📚 KDE NAJDEŠ PODROBNÉ INFORMACE

### 1. **STANDARDIZACNI-NAVOD.md**
- Nejpodrobnější dokument
- Kompletní šablony kódu
- SQL skripty
- Příklady pro každou komponentu
- **Začni tady pokud chceš vědět "PROČ" a "JAK přesně"**

### 2. **MODUL-CHECKLIST.md**
- 189 kontrolních bodů
- Formulář k vyplnění
- Bodování (kolik % je hotovo)
- **Použij pro kontrolu každého modulu**

### 3. **RYCHLY-PRUVODCE.md**
- Krok-za-krokem návod (30 minut)
- Copy-paste šablony
- **Použij když vytváříš NOVÝ modul**

### 4. **Referenční modul: 010-sprava-uzivatelu**
- VZOROVÁ implementace
- Vše je tam správně
- **Kopíruj odsud když si nejsi jistý**

---

## 💡 JAK S TÍM PRACOVAT

### KROK 1: Přečti si toto shrnutí (tento soubor)
→ Pochopíš co je špatně a co musíš opravit

### KROK 2: Otevři STANDARDIZACNI-NAVOD.md
→ Najdi tam šablony kódu které potřebuješ

### KROK 3: Pro každý modul:
1. Otevři MODUL-CHECKLIST.md
2. Projdi checklist bod po bodu
3. Oprav co chybí
4. Odškrtni splněné položky
5. Až je všechno ✅, modul je hotový

### KROK 4: Když vytváříš nový modul:
→ Použij RYCHLY-PRUVODCE.md (30 minut)

---

## ✅ ZÁVĚR

Vytvořil jsem ti **KOMPLETNÍ NÁVOD** jak:
1. ✅ Identifikovat co je špatně (tento dokument)
2. ✅ Opravit každý modul (STANDARDIZACNI-NAVOD.md)
3. ✅ Zkontrolovat že je vše OK (MODUL-CHECKLIST.md)
4. ✅ Vytvořit nový modul (RYCHLY-PRUVODCE.md)

**Všechny dokumenty jsou v češtině a obsahují:**
- Přesný kód který můžeš zkopírovat
- SQL skripty které můžeš spustit
- Checklisty které můžeš použít
- Vysvětlení PROČ to má být tak

**Podle těchto návodů můžeš:**
- Sjednotit všechny existující moduly
- Vytvářet nové moduly konzistentně
- Kontrolovat že vše funguje správně
- Mít krásnou, funkční a jednotnou aplikaci

---

**Máš nějaké otázky?**
- Přečti si STANDARDIZACNI-NAVOD.md pro detaily
- Podívej se na modul 010-sprava-uzivatelu jako VZOR
- Použij checklisty pro kontrolu

**Všechno je tam podrobně popsáno! 🎉**
