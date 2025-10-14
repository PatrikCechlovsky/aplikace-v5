# 🧭 Návod k aplikaci Pronajímatel v5
*(návazný na `rules.md`)*

Tento dokument popisuje strukturu jádra aplikace, zásady tvorby modulů a doporučený postup pro přidávání nových částí.  
Je navržen tak, aby **žádná úprava jádra** (`app.js`, `auth.js`, `/ui/`) nebyla nutná při rozšiřování o nové moduly.

---

## 📂 Základní adresářová struktura

```
/app.html
/docs/
  rules.md        ← závazná pravidla a konvence
  navod.md        ← tento návod
/src/
  app.js          ← inicializace, router, registry modulů
  auth.js         ← přihlášení/odhlášení (Supabase)
  db.js           ← DB helpery pro Supabase
  supabase.js     ← konfigurace Supabase klienta
  /app/
    modules.index.js  ← registr modulů
  /ui/
    icons.js          ← centrální registr ikon
    headerActions.js  ← pravá část hlavičky (uživatel, notifikace)
    sidebar.js        ← levé menu modulů
    breadcrumb.js     ← navigační cesta
    content.js        ← dashboard s oblíbenými dlaždicemi
    form.js           ← univerzální formulář
    table.js          ← univerzální tabulka
    commonActions.js  ← lišta akcí (Přidat/Upravit/★/…)
    homebutton.js     ← tlačítko „Domů“
    theme.js          ← přepínač vzhledu
```

---

## ⚙️ Hlavní stavební kameny

### 1️⃣ Přihlášení a odhlášení (Supabase)
- `auth.js` chrání `app.html` – při otevření kontroluje session (`getUserSafe`).
- `hardLogout()` spolehlivě odhlásí uživatele (lokálně i serverově).
- `headerActions.js` volá `hardLogout()` při kliknutí na „Odhlásit“.

### 2️⃣ Router a načítání modulů
- `app.js` importuje `modules.index.js`, kde jsou všechny moduly zaregistrované.
- Každý modul se načítá lazy (`import()`), není potřeba rebuild.
- Hash routování:  
  - `#/` – dashboard (oblíbené dlaždice)  
  - `#/m/<modul>/t/<tile>` – dlaždice (seznam)  
  - `#/m/<modul>/f/<form>` – formulář  

### 3️⃣ Dashboard a oblíbené
- `content.js` ukládá oblíbené dlaždice do `localStorage` (`favoriteTiles`, `favoriteTilesOrder`).
- Drag&Drop (SortableJS) pro změnu pořadí.
- `sanitizeFavorites()` automaticky odstraňuje dlaždice, které už neexistují.

### 4️⃣ Sidebar a Breadcrumbs
- `sidebar.js` generuje moduly vlevo.  
- `breadcrumb.js` zobrazuje aktuální cestu (Domů › Modul › Sekce).

### 5️⃣ Akční lišty
- **`commonActions.js`** – univerzální tlačítka nad tabulkou nebo formulářem.  
  Každá akce má callback (`onAdd`, `onEdit`, `onStar`, …).
- **`headerActions.js`** – pravá část hlavičky (uživatel, notifikace, logout).  
  Umí načíst jméno z profilu (`getMyProfile`) nebo e-mail (`getUserSafe`).

### 6️⃣ Univerzální komponenty
- **Formulář (`form.js`)**
  - podporuje `text`, `email`, `number`, `date`, `select`, `checkbox`, `checkbox-group`, `textarea`
  - validace `required`, `email`
  - módy `edit` / `read`
  - jediný submit: **Uložit**

- **Tabulka (`table.js`)**
  - sloupce: `columns = [{ key, label, render?, sortable? }]`
  - funkce: filtrování, řazení, výběr/dvojklik
  - na `dblclick` otevře detail (`window.navigateTo`)

- **Ikony (`icons.js`)**
  - všechny emoji/SVG ikony centrálně registrovány.
  - nové ikony přidávej pouze sem.

---

## 🧱 Přidání nového modulu

1. Vytvoř složku:
   ```
   /src/app/010-uzivatele/
   ```
2. Uvnitř:
   ```
   module.config.js
   tiles/prehled.js
   forms/detail.js
   ```
3. Zapiš modul do `modules.index.js`:
   ```js
   export const MODULE_SOURCES = [
     () => import('./010-uzivatele/module.config.js'),
   ];
   ```
4. Manifest:
   ```js
   export async function getManifest() {
     return {
       id: '010-uzivatele',
       title: 'Uživatelé',
       icon: 'users',
       defaultTile: 'prehled',
       tiles: [{ id: 'prehled', title: 'Přehled', icon: 'list' }],
       forms: [{ id: 'detail', title: 'Detail', icon: 'form' }]
     };
   }
   ```

---

## 🧩 Příklad dlaždice a formuláře

### Dlaždice (prehled.js)
```js
import { renderTable } from '/src/ui/table.js';
import { listProfiles } from '/src/db.js';

export async function render(root) {
  const { data } = await listProfiles();
  const columns = [
    { key: 'display_name', label: 'Jméno' },
    { key: 'email', label: 'E-mail' },
    { key: 'role', label: 'Role' },
  ];
  renderTable(root, { columns, rows: data });
}
```

### Formulář (detail.js)
```js
import { renderForm } from '/src/ui/form.js';
import { updateProfile, getProfile } from '/src/db.js';

export async function render(root, params) {
  const { data } = await getProfile(params?.id);
  const fields = [
    { key: 'display_name', label: 'Jméno', type: 'text', required: true },
    { key: 'email', label: 'E-mail', type: 'email' },
    { key: 'role', label: 'Role', type: 'select', options: [
        { value: 'admin', label: 'Administrátor' },
        { value: 'pronajimatel', label: 'Pronajímatel' },
        { value: 'najemnik', label: 'Nájemník' },
    ]},
  ];
  renderForm(root, fields, data, async (values) => {
    await updateProfile(data.id, values);
    return true;
  });
}
```

---

## 🧠 Zásady vývoje
- Needituj jádro (`app.js`, `/ui/`) při přidávání modulů.
- Každý modul má vlastní dokument v `docs/modules/<id>.md`.
- Před commitem vždy spusť: **vizuální kontrolu + konzoli**.
- 1 commit = 1 logická změna.
- Deploy na Vercel probíhá automaticky po commitu.

---

## ✅ Stav k 2025-10-14
| Oblast | Stav | Poznámka |
|---------|------|----------|
| Layout & Router | ✅ Hotovo | |
| Autentizace Supabase | ✅ Hotovo | |
| Sidebar + Breadcrumb | ✅ Hotovo | |
| Common & Header Actions | ✅ Hotovo | |
| Table & Form komponenty | ✅ Hotovo | univerzální |
| Dashboard (oblíbené) | ✅ Hotovo | sanitizeFavorites |
| Moduly | 🚧 | připravuje se 010-uživatelé |
| Dokumentace | ✅ | rules.md + navod.md |

---

**Autor / Správce:** ChatGPT (asistent projektu)  
**Aktualizováno:** 2025-10-14
