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
    unsaved-helper.js ← helper pro hlídání rozpracované práce ve formuláři 🆕
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

## 🛡 Hlídání rozpracované práce ve formulářích (`unsaved-helper.js`)

Pokud máš ve formuláři pole, která mohou být editována, používej univerzální helper pro hlídání rozpracované práce.  
Tento helper automaticky upozorní uživatele při odchodu z formuláře bez uložení změn.

**Použití v každém formuláři:**
1. **Importuj helper na začátek souboru:**
   ```js
   import { useUnsavedHelper } from '../../../ui/unsaved-helper.js';
   ```
2. **Po vykreslení formuláře zavolej na hlavní `<form>` element:**
   ```js
   const formEl = root.querySelector('form');
   if (formEl) useUnsavedHelper(formEl);
   ```
3. **To vše!** Helper sám nastaví změněný stav při úpravě pole a po submitu stav vyčistí.

**Ukázka ve formuláři:**
```js
export async function render(root) {
  // ... renderování formuláře ...
  const formEl = root.querySelector('form');
  if (formEl) useUnsavedHelper(formEl);
}
```

### Proč to používat?
- Zabráníš ztrátě rozpracovaných údajů při přepnutí sekce nebo zavření okna.
- Nemusíš psát vlastní logiku pro každý formulář.
- Funguje univerzálně pro všechny typy formulářů.

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
import { updateProfile, getProfile, listRoles } from '/src/db.js';
import { useUnsavedHelper } from '/src/ui/unsaved-helper.js';

export async function render(root, params) {
  const { data } = await getProfile(params?.id);
  const { data: roles } = await listRoles();
  const fields = [
    { key: 'display_name', label: 'Jméno', type: 'text', required: true },
    { key: 'email', label: 'E-mail', type: 'email' },
    { key: 'role', label: 'Role', type: 'select', options: roles?.map(r => ({ value: r.slug, label: r.label })) ?? [] },
  ];
  renderForm(root, fields, data, async (values) => {
    await updateProfile(data.id, values);
    return true;
  });
  // Hlídání rozpracované práce:
  const formEl = root.querySelector('form');
  if (formEl) useUnsavedHelper(formEl);
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
---markdown
## Workflow — jak pracovat s AI (one-step režim)

Krátce a prakticky: vždy děláme pouze JEDEN konkrétní krok najednou.
1) AI ti pošle přesný soubor nebo přesný SQL příkaz (JEDEN krok).  
2) Ty vložíš / commitneš / spustíš TEN SOUBOR nebo TEN SQL příkaz.  
3) Otevřeš dev console a spustíš JEDEN krátký testovací snippet (poskytnutý AI), zkopíruješ výsledky do chatu.  
4) AI vyhodnotí výstup a pošle další jediný krok.

Checklist pro testování nových servisů (payments / accountMemberships)
- Po vložení souborů commitni a pusni do repa.  
- V browser konzoli spusť test snippet (AI poskytne přesný snippet), např.:
  - vytvoří test účet (upsertPaymentAccount)
  - přiřadí roli (assignRoleToAccount)
  - načte členy (listAccountMembers)
- Interpretace console:
  - pokud vidíš data objekt s id → OK (záznam vytvořen),
  - pokud vidíš 400 Bad Request → zkopíruj přesnou chybu do chatu (AI opraví jediným patchem),
  - pokud vidíš 404 → znamená chybějící tabulku/view (AI přidá SQL).
- Po úspěšném testu pokračujeme dalším krokem (UI napojení).

Poznámka o komunikaci s AI:
- AI nebude klást spoustu otázek najednou. Dostaneš vždy jediný krok (soubor, SQL nebo krátký příkaz).  
- Pokud chceš jiný režim (PR přímo, nebo abych commitoval za tebe), napiš jednou větu s owner/repo.

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

## TODO / Backlog (z konverzace)
Níže je souhrn otevřených úkolů vycházejících z naší konverzace. Položky jsou seřazeny přibližně podle priority — můžeš je rovnou vložit do Issues / projekt boardu.

### Vysoká priorita
- [ ] Implementovat Import/Export (MVP) pro "Profiles" (Uživatelé)
  - CSV export (stáhnout z listProfiles()).
  - CSV import (client-side) s parsingem, validací, náhledem (preview) a per-row volbou: Skip / Overwrite / Create.
  - Validace polí: email (syntaktika + duplicity), role (musí existovat), povinná pole, color hex.
  - Limit velikosti souboru a povolení operace pouze pro adminy.
- [ ] Ověřit dynamické permissions (loadPermissionsForRole)
  - Zajistit, že `ACTIONS_CONFIG` a `ROLE_PERMISSIONS` jsou konzistentní.
  - Ošetřit fallback, když DB loader nic nevrátí.

### Střední priorita
- [ ] Dokončit a otestovat modul "Role & barvy"
  - Testovat chování: zámek slug pokud je role používána (countProfilesByRole).
  - Ověřit, že delete je blokován pro používané role.
  - Doladit dark-mode kontrast pro paletu barev.
- [ ] Přidat mapování polí pro import (pokročilé) — fáze B.

### Nízká priorita / UX drobnosti
- [ ] Zvýraznit primární tlačítko "Uložit" v commonActions.
- [ ] Přidat animaci outline u palet při výběru.
- [ ] Rozšířit import/export i pro další entity (roles, attachments).
- [ ] Audit log pro importy (kdo importoval, kdy, jaké změny).

### Poznámky
- Formát CSV pro Profiles: `id,display_name,email,first_name,last_name,phone,role,archived,note,street,house_number,city,zip,birth_number`
- Doporučená default politika pro konflikty: Skip (uživatel ve preview zvolí Overwrite, pokud chce).
- Import v MVP bude client-side; pro velké soubory později plánovat backend job/queue.

---

**Autor / Správce:** ChatGPT (asistent projektu)  
**Aktualizováno:** 2025-10-17
