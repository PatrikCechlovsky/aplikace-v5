# 04 - Vzorové Formuláře

> **Tento dokument popisuje standardní strukturu formulářů, jejich chování, validaci a všechny vzory používané v aplikaci.**

---

## 📖 Obsah

1. [Struktura Formuláře](#struktura-formuláře)
2. [Typy Formulářů](#typy-formulářů)
3. [Pole a Validace](#pole-a-validace)
4. [Tlačítka a Akce](#tlačítka-a-akce)
5. [Unsaved Helper](#unsaved-helper)
6. [Historie Změn](#historie-změn)
7. [Přílohy](#přílohy)

---

## 🏗️ Struktura Formuláře

### Základní layout

```html
<div class="max-w-6xl mx-auto space-y-6">
  
  <!-- SEKCE 1: Hlavní údaje -->
  <section class="bg-white p-6 rounded-lg shadow">
    <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
      📝 Profil
    </h3>
    
    <div class="grid grid-cols-2 gap-4">
      <!-- Pole formuláře -->
    </div>
  </section>
  
  <!-- SEKCE 2: Další údaje -->
  <section class="bg-white p-6 rounded-lg shadow">
    <h3 class="text-lg font-semibold mb-4">
      📊 Systém
    </h3>
    
    <div class="grid grid-cols-2 gap-4">
      <!-- Readonly pole -->
    </div>
  </section>
  
</div>
```

### Pravidla pro strukturu:

1. **Sekce** - logické bloky (Profil, Adresa, Systém, ...)
2. **Grid layout** - 2 sloupce na desktopu, 1 na mobilu
3. **Spacing** - konzistentní mezery (gap-4, space-y-6)
4. **Shadow** - jemný stín pro oddělení sekcí
5. **Readonly pole** - vždy v samostatné sekci (Systém)

---

## 📋 Typy Formulářů

### 1. Detail Form (jen čtení)

**Účel:** Zobrazení detailu záznamu (read-only)

**CommonActions:** `edit`, `archive`, `attach`, `history`, `refresh`

```javascript
// forms/detail.js
export async function render(root, manifest, { query }) {
  const id = query.id;
  const { data, error } = await getRecordById(id);
  
  if (error || !data) {
    root.innerHTML = '<div class="text-red-500">Záznam nenalezen</div>';
    return;
  }
  
  root.innerHTML = `
    <div class="max-w-6xl mx-auto space-y-6">
      <section class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-lg font-semibold mb-4">📝 Profil</h3>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">
              Jméno
            </label>
            <div class="text-base">${data.display_name}</div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">
              E-mail
            </label>
            <div class="text-base">${data.email}</div>
          </div>
        </div>
      </section>
    </div>
  `;
  
  // CommonActions
  renderCommonActions(document.getElementById('commonactions'), {
    moduleActions: ['edit', 'archive', 'attach', 'history', 'refresh'],
    userRole: window.currentUser.role,
    handlers: {
      onEdit: () => navigateTo(`#/m/${manifest.id}/f/edit?id=${id}`),
      onArchive: async () => { /* ... */ },
      onAttach: () => { /* ... */ },
      onHistory: () => { /* ... */ },
      onRefresh: () => render(root, manifest, { query })
    }
  });
}
```

### 2. Edit Form (úprava)

**Účel:** Editace existujícího záznamu

**CommonActions:** `save`, `reject`, `attach`, `history`

```javascript
// forms/edit.js
export async function render(root, manifest, { query }) {
  const id = query.id;
  const { data, error } = await getRecordById(id);
  
  root.innerHTML = `
    <form id="editForm" class="max-w-6xl mx-auto space-y-6">
      <section class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-lg font-semibold mb-4">📝 Profil</h3>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1">
              Jméno <span class="text-red-500">*</span>
            </label>
            <input type="text" name="display_name" required
              value="${data.display_name}"
              class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">
              E-mail <span class="text-red-500">*</span>
            </label>
            <input type="email" name="email" required
              value="${data.email}"
              class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
          </div>
        </div>
      </section>
      
      <!-- Readonly sekce -->
      <section class="bg-slate-50 p-6 rounded-lg">
        <h3 class="text-lg font-semibold mb-4">📊 Systém</h3>
        
        <div class="grid grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1">Vytvořeno</label>
            <input type="text" value="${formatDate(data.created_at)}" readonly
              class="w-full px-3 py-2 bg-slate-100 border rounded-lg">
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Upraveno</label>
            <input type="text" value="${formatDate(data.updated_at)}" readonly
              class="w-full px-3 py-2 bg-slate-100 border rounded-lg">
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Upravil</label>
            <input type="text" value="${data.updated_by}" readonly
              class="w-full px-3 py-2 bg-slate-100 border rounded-lg">
          </div>
        </div>
      </section>
    </form>
  `;
  
  // Unsaved helper
  setupUnsavedHelper(document.getElementById('editForm'));
  
  // CommonActions
  renderCommonActions(document.getElementById('commonactions'), {
    moduleActions: ['save', 'reject', 'attach', 'history'],
    handlers: {
      onSave: async () => {
        const formData = new FormData(document.getElementById('editForm'));
        const result = await updateRecord(id, Object.fromEntries(formData));
        
        if (result.error) {
          toast('Chyba při ukládání', 'error');
        } else {
          toast('Uloženo', 'success');
          markAsSaved();
          navigateTo(`#/m/${manifest.id}/f/detail?id=${id}`);
        }
      },
      onReject: () => {
        if (hasUnsavedChanges()) {
          if (!confirm('Máte neuložené změny. Opravdu chcete odejít?')) return;
        }
        navigateTo(`#/m/${manifest.id}/f/detail?id=${id}`);
      }
    }
  });
}
```

### 3. Create Form (vytvoření)

**Účel:** Vytvoření nového záznamu

**CommonActions:** `save`, `reject`

```javascript
// forms/create.js
export async function render(root, manifest, { query }) {
  root.innerHTML = `
    <form id="createForm" class="max-w-6xl mx-auto space-y-6">
      <section class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-lg font-semibold mb-4">➕ Nový záznam</h3>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1">
              Jméno <span class="text-red-500">*</span>
            </label>
            <input type="text" name="display_name" required
              class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">
              E-mail <span class="text-red-500">*</span>
            </label>
            <input type="email" name="email" required
              class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
          </div>
        </div>
      </section>
    </form>
  `;
  
  renderCommonActions(document.getElementById('commonactions'), {
    moduleActions: ['save', 'reject'],
    handlers: {
      onSave: async () => {
        const form = document.getElementById('createForm');
        
        // Validace
        if (!form.checkValidity()) {
          form.reportValidity();
          return;
        }
        
        const formData = new FormData(form);
        const result = await createRecord(Object.fromEntries(formData));
        
        if (result.error) {
          toast('Chyba při vytváření', 'error');
        } else {
          toast('Vytvořeno', 'success');
          navigateTo(`#/m/${manifest.id}/f/detail?id=${result.data.id}`);
        }
      },
      onReject: () => {
        navigateTo(`#/m/${manifest.id}/t/prehled`);
      }
    }
  });
}
```

### 4. Chooser Form (výběr)

**Účel:** Výběr z existujících záznamů nebo vytvoření nového

```javascript
// forms/chooser.js
export async function render(root, manifest, { query }) {
  const { data: records } = await getAllRecords();
  
  root.innerHTML = `
    <div class="max-w-4xl mx-auto">
      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-lg font-semibold mb-4">Vyberte nebo vytvořte nový</h3>
        
        <!-- Seznam existujících -->
        <div class="space-y-2 mb-6">
          ${records.map(r => `
            <button type="button" data-id="${r.id}"
              class="w-full p-4 border rounded-lg hover:bg-blue-50 text-left">
              <div class="font-medium">${r.display_name}</div>
              <div class="text-sm text-slate-600">${r.email}</div>
            </button>
          `).join('')}
        </div>
        
        <!-- Nebo vytvořit nový -->
        <button id="createNew" 
          class="w-full p-4 border-2 border-dashed border-blue-300 
                 rounded-lg hover:bg-blue-50 text-blue-600 font-medium">
          ➕ Vytvořit nový
        </button>
      </div>
    </div>
  `;
  
  // Event listenery
  root.querySelectorAll('[data-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      navigateTo(`#/m/${manifest.id}/f/detail?id=${id}`);
    });
  });
  
  root.querySelector('#createNew').addEventListener('click', () => {
    navigateTo(`#/m/${manifest.id}/f/create`);
  });
}
```

---

## 📝 Pole a Validace

### Typy polí

#### 1. Text Input

```html
<div>
  <label class="block text-sm font-medium mb-1">
    Jméno <span class="text-red-500">*</span>
  </label>
  <input type="text" name="display_name" required
    minlength="3" maxlength="255"
    placeholder="Zadejte jméno"
    class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
  <p class="text-xs text-slate-500 mt-1">Min. 3 znaky</p>
</div>
```

#### 2. Email Input

```html
<div>
  <label class="block text-sm font-medium mb-1">
    E-mail <span class="text-red-500">*</span>
  </label>
  <input type="email" name="email" required
    placeholder="priklad@email.cz"
    class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
</div>
```

#### 3. Number Input

```html
<div>
  <label class="block text-sm font-medium mb-1">
    Výměra (m²)
  </label>
  <input type="number" name="vymera" 
    min="0" step="0.01"
    class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
</div>
```

#### 4. Select (dropdown)

```html
<div>
  <label class="block text-sm font-medium mb-1">
    Role <span class="text-red-500">*</span>
  </label>
  <select name="role" required
    class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
    <option value="">-- Vyberte roli --</option>
    <option value="admin">Administrátor</option>
    <option value="pronajimatel">Pronajímatel</option>
    <option value="najemnik">Nájemník</option>
  </select>
</div>
```

#### 5. Textarea

```html
<div>
  <label class="block text-sm font-medium mb-1">
    Poznámka
  </label>
  <textarea name="poznamka" rows="4"
    placeholder="Volitelná poznámka..."
    class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"></textarea>
</div>
```

#### 6. Date Input

```html
<div>
  <label class="block text-sm font-medium mb-1">
    Datum narození
  </label>
  <input type="date" name="datum_narozeni"
    class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
</div>
```

#### 7. Checkbox

```html
<div class="flex items-center gap-2">
  <input type="checkbox" name="archived" id="archived"
    class="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500">
  <label for="archived" class="text-sm font-medium">
    Archivován
  </label>
</div>
```

#### 8. Radio Buttons

```html
<div>
  <label class="block text-sm font-medium mb-2">
    Typ subjektu
  </label>
  
  <div class="space-y-2">
    <div class="flex items-center gap-2">
      <input type="radio" name="typ_subjektu" value="osoba" id="osoba"
        class="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500">
      <label for="osoba">Fyzická osoba</label>
    </div>
    
    <div class="flex items-center gap-2">
      <input type="radio" name="typ_subjektu" value="firma" id="firma"
        class="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500">
      <label for="firma">Právnická osoba (firma)</label>
    </div>
  </div>
</div>
```

#### 9. Readonly Input

```html
<div>
  <label class="block text-sm font-medium mb-1">
    Vytvořeno
  </label>
  <input type="text" value="2025-01-15 10:30" readonly
    class="w-full px-3 py-2 bg-slate-100 border rounded-lg cursor-not-allowed">
</div>
```

### Validace

#### HTML5 validace

```javascript
const form = document.getElementById('myForm');

// Zkontroluj validitu
if (!form.checkValidity()) {
  form.reportValidity(); // Zobrazí chybové hlášky
  return;
}
```

#### Custom validace

```javascript
function validateForm(formData) {
  const errors = [];
  
  // Email
  if (!formData.email || !formData.email.includes('@')) {
    errors.push({ field: 'email', message: 'Neplatný e-mail' });
  }
  
  // IČO (8 číslic)
  if (formData.ico && !/^\d{8}$/.test(formData.ico)) {
    errors.push({ field: 'ico', message: 'IČO musí mít 8 číslic' });
  }
  
  // PSČ (5 číslic)
  if (formData.psc && !/^\d{5}$/.test(formData.psc)) {
    errors.push({ field: 'psc', message: 'PSČ musí mít 5 číslic' });
  }
  
  return errors;
}

// Použití
const errors = validateForm(formData);
if (errors.length > 0) {
  errors.forEach(err => {
    showFieldError(err.field, err.message);
  });
  return;
}
```

#### Zobrazení chyb

```javascript
function showFieldError(fieldName, message) {
  const input = document.querySelector(`[name="${fieldName}"]`);
  
  // Přidej červený border
  input.classList.add('border-red-500', 'focus:ring-red-500');
  
  // Přidej error message
  const errorEl = document.createElement('p');
  errorEl.className = 'text-xs text-red-500 mt-1';
  errorEl.textContent = message;
  input.parentElement.appendChild(errorEl);
}
```

---

## 🔘 Tlačítka a Akce

### CommonActions tlačítka

Viz dokument **02-STRUKTURA-UI.md** sekce Common Actions.

### V formuláři specifická tlačítka

#### Uložit a zůstat

```javascript
onSave: async () => {
  const result = await saveData();
  if (!result.error) {
    toast('Uloženo', 'success');
    markAsSaved(); // Vypne unsaved helper
    // ZŮSTÁVÁME na formuláři
  }
}
```

#### Uložit a zavřít

```javascript
onSaveAndClose: async () => {
  const result = await saveData();
  if (!result.error) {
    toast('Uloženo', 'success');
    navigateTo(`#/m/${manifest.id}/t/prehled`);
  }
}
```

#### Zrušit (bez uložení)

```javascript
onReject: () => {
  if (hasUnsavedChanges()) {
    if (!confirm('Máte neuložené změny. Opravdu chcete odejít?')) {
      return;
    }
  }
  navigateTo(`#/m/${manifest.id}/t/prehled`);
}
```

---

## 💾 Unsaved Helper

### Účel

Chrání před **ztátou dat** při omylem opuštění formuláře.

### Implementace

```javascript
// ui/unsavedHelper.js
let _hasUnsavedChanges = false;

export function setupUnsavedHelper(formEl) {
  if (!formEl) return;
  
  // Při změně pole nastav flag
  formEl.addEventListener('input', () => {
    _hasUnsavedChanges = true;
  });
  
  // Varování před odchodem
  window.addEventListener('beforeunload', (e) => {
    if (_hasUnsavedChanges) {
      e.preventDefault();
      e.returnValue = ''; // Chrome vyžaduje
    }
  });
}

export function markAsSaved() {
  _hasUnsavedChanges = false;
}

export function hasUnsavedChanges() {
  return _hasUnsavedChanges;
}
```

### Použití

```javascript
import { setupUnsavedHelper, markAsSaved, hasUnsavedChanges } from '../../../ui/unsavedHelper.js';

export async function render(root, manifest, { query }) {
  // Vykresli formulář
  root.innerHTML = `<form id="editForm">...</form>`;
  
  // Aktivuj unsaved helper
  setupUnsavedHelper(document.getElementById('editForm'));
  
  // Po uložení označ jako saved
  async function save() {
    const result = await saveData();
    if (!result.error) {
      markAsSaved(); // Vypne varování
    }
  }
}
```

---

## 📜 Historie Změn

### Tlačítko v CommonActions

```javascript
renderCommonActions(commonActionsEl, {
  moduleActions: ['save', 'reject', 'history'],
  handlers: {
    onHistory: () => showHistory(entityType, entityId)
  }
});
```

### Historie modal

```javascript
async function showHistory(entityType, entityId) {
  const { data, error } = await supabase
    .from('audit_log')
    .select('*, user:profiles(display_name)')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .order('created_at', { ascending: false });
  
  if (error) {
    toast('Chyba při načítání historie', 'error');
    return;
  }
  
  // Vykresli modal
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
  modal.innerHTML = `
    <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
      <div class="p-6 border-b">
        <h2 class="text-xl font-bold">📜 Historie změn</h2>
      </div>
      
      <div class="overflow-y-auto p-6 max-h-[60vh]">
        <div class="space-y-4">
          ${data.map(log => `
            <div class="border-l-4 border-blue-500 pl-4 py-2">
              <div class="flex items-center justify-between mb-2">
                <div class="font-medium">${log.user?.display_name || 'Systém'}</div>
                <div class="text-sm text-slate-600">${formatDate(log.created_at)}</div>
              </div>
              <div class="text-sm text-slate-700">
                ${formatAction(log.action)}
              </div>
              ${log.changes ? `
                <details class="mt-2">
                  <summary class="cursor-pointer text-sm text-blue-600">
                    Zobrazit změny
                  </summary>
                  <pre class="mt-2 p-2 bg-slate-50 rounded text-xs overflow-x-auto">
${JSON.stringify(log.changes, null, 2)}
                  </pre>
                </details>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>
      
      <div class="p-6 border-t">
        <button id="closeHistoryModal" 
          class="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg">
          Zavřít
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Close handler
  modal.querySelector('#closeHistoryModal').addEventListener('click', () => {
    modal.remove();
  });
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
}

function formatAction(action) {
  const actions = {
    'INSERT': '✅ Záznam vytvořen',
    'UPDATE': '✏️ Záznam upraven',
    'DELETE': '🗑️ Záznam smazán'
  };
  return actions[action] || action;
}
```

---

## 📎 Přílohy

Viz dokument **06-HISTORIE-PRILOHY.md** pro detailní popis.

---

## ✅ Checklist Formuláře

### Při vytváření nového formuláře zkontroluj:

- [ ] Správná struktura (sekce, grid layout)
- [ ] Všechna povinná pole označena `*`
- [ ] Validace (HTML5 + custom)
- [ ] Readonly pole v samostatné sekci
- [ ] CommonActions správně nastavené
- [ ] Unsaved helper aktivován
- [ ] Breadcrumb nastavena
- [ ] Error handling (toast notifikace)
- [ ] Responsive (2 sloupce → 1 na mobilu)
- [ ] Tlačítko Historie (pokud entita má history)
- [ ] Tlačítko Přílohy (pokud entita má attachments)

---

## 📚 Další Čtení

- **[05-VZOROVE-PREHLEDY.md](./05-VZOROVE-PREHLEDY.md)** - Vzory přehledů
- **[06-HISTORIE-PRILOHY.md](./06-HISTORIE-PRILOHY.md)** - Historie a přílohy
- **[08-SABLONA-MODULU.md](./08-SABLONA-MODULU.md)** - Kompletní modul

---

**Konec dokumentu - Vzorové Formuláře** ✅
