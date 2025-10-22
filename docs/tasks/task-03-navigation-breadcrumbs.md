# Úkol 03: Navigace a breadcrumbs

## 📋 Popis
Navigace na "Přehled" musí být jasně označena v sidebaru i breadcrumbs. "Přehled" je defaultní sekce při otevření modulu.

## 🎯 Cíl
Zajistit intuitivní navigaci a orientaci uživatele v aplikaci pomocí breadcrumbs.

## 🎨 Referenční obrázky
Viz v agent-task.md: image3 (zeleně označená navigace)

## ✅ Akceptační kritéria
- [ ] Breadcrumbs jsou zobrazeny v každém view
- [ ] Breadcrumbs obsahují: Domů › Název modulu › Název sekce
- [ ] "Přehled" je jasně označen v sidebaru
- [ ] "Přehled" je první položka v navigaci
- [ ] Kliknutí na breadcrumb vede na příslušnou sekci
- [ ] Breadcrumbs jsou správně aktualizovány při změně view

## 📁 Dotčené moduly
- [x] 010-sprava-uzivatelu (REFERENČNÍ - již má)
- [ ] 020-muj-ucet
- [ ] 030-pronajimatel (potřebuje doplnit dle README.md)
- [ ] 040-nemovitost
- [ ] 050-najemnik (potřebuje doplnit dle README.md)
- [ ] Všechny budoucí moduly

## 🔧 Implementační kroky

### 1. Import breadcrumb komponenty
V každém tile/form souboru:

```javascript
import { setBreadcrumb } from '../../ui/breadcrumb.js';
```

### 2. Nastavit breadcrumbs v render funkci
Na začátku každé `render()` funkce:

```javascript
export async function render(container) {
  // Nastavit breadcrumbs
  setBreadcrumb([
    { label: 'Domů', path: '/' },
    { label: 'Název Modulu', path: '#modul-id' },
    { label: 'Název Sekce', path: '#modul-id/sekce-id' }
  ]);
  
  // zbytek render logiky...
}
```

### 3. Příklady breadcrumbs pro různé sekce

#### Přehled
```javascript
setBreadcrumb([
  { label: 'Domů', path: '/' },
  { label: 'Nemovitosti', path: '#040-nemovitost' },
  { label: 'Přehled', path: '#040-nemovitost/prehled' }
]);
```

#### Detail entity
```javascript
setBreadcrumb([
  { label: 'Domů', path: '/' },
  { label: 'Nemovitosti', path: '#040-nemovitost' },
  { label: 'Přehled', path: '#040-nemovitost/prehled' },
  { label: entityName || 'Detail', path: null } // null = aktuální stránka
]);
```

#### Editační formulář
```javascript
setBreadcrumb([
  { label: 'Domů', path: '/' },
  { label: 'Nemovitosti', path: '#040-nemovitost' },
  { label: 'Přehled', path: '#040-nemovitost/prehled' },
  { label: entityId ? 'Upravit' : 'Nový', path: null }
]);
```

### 4. Sidebar navigace
Ujistit se, že sidebar obsahuje "Přehled" jako první položku:

```javascript
// V module.config.js
tiles: [
  {
    id: 'prehled',
    title: 'Přehled',     // ← Tento text se zobrazí v sidebaru
    icon: 'list',
    render: () => import('./tiles/prehled.js')
  },
  // další tiles...
]
```

### 5. Kontrola UI komponenty breadcrumb.js
Ověřit že `/src/ui/breadcrumb.js` správně funguje:

```javascript
/**
 * Nastaví breadcrumb navigaci
 * @param {Array} items - Pole objektů s label a path
 */
export function setBreadcrumb(items) {
  const breadcrumbContainer = document.getElementById('breadcrumb');
  if (!breadcrumbContainer) {
    console.warn('Breadcrumb container not found');
    return;
  }
  
  breadcrumbContainer.innerHTML = items.map((item, index) => {
    const isLast = index === items.length - 1;
    if (isLast || !item.path) {
      return `<span class="breadcrumb-item active">${item.label}</span>`;
    }
    return `<a href="${item.path}" class="breadcrumb-item">${item.label}</a>`;
  }).join('<span class="breadcrumb-separator">›</span>');
}
```

### 6. Aktualizovat HTML layout
Ujistit se, že `index.html` nebo `app.html` obsahuje breadcrumb kontejner:

```html
<div id="app">
  <header>
    <div id="breadcrumb" class="breadcrumb-container"></div>
  </header>
  <main>
    <!-- obsah -->
  </main>
</div>
```

## 📝 Checklist pro každý modul

### Pro každý tile (prehled.js, seznam.js, atd.)
- [ ] Import `setBreadcrumb` z `../../ui/breadcrumb.js`
- [ ] Volání `setBreadcrumb()` na začátku `render()` funkce
- [ ] Breadcrumbs obsahují: Domů › Modul › Sekce
- [ ] Cesty jsou správně nastaveny

### Pro každý form (edit.js, detail.js, atd.)
- [ ] Import `setBreadcrumb` z `../../ui/breadcrumb.js`
- [ ] Volání `setBreadcrumb()` na začátku `render()` funkce
- [ ] Breadcrumbs obsahují: Domů › Modul › Přehled › Akce
- [ ] Poslední položka (aktuální stránka) má `path: null`

## 📝 Reference
- **Vzorový modul:** `/src/modules/010-sprava-uzivatelu/`
- **UI komponenta:** `/src/ui/breadcrumb.js`
- **Dokumentace:** `/docs/STANDARDIZACNI-NAVOD.md`
- **README poznámky:** `/src/modules/030-pronajimatel/README.md` (obsahuje TODO pro breadcrumbs)

## 🔗 Související úkoly
- Task 01: Hlavní sekce "Přehled"
- Task 07: Odstranit duplicity "Přehled" vs. "Seznam"

## ⏱️ Odhadovaný čas
- **Per modul:** 30-45 minut (všechny tiles a forms)
- **Per soubor:** 5-10 minut

## 📊 Priority
**VYSOKÁ** - Breadcrumbs jsou kritické pro navigaci a UX.

## ✅ Ověření
Po dokončení ověřit:
1. Otevřít modul → breadcrumbs se zobrazí
2. Breadcrumbs obsahují správnou cestu: Domů › Modul › Sekce
3. Kliknutí na breadcrumb vede na správnou stránku
4. Přejít na detail/form → breadcrumbs se aktualizují
5. Breadcrumbs jsou konzistentní napříč všemi moduly
6. Breadcrumbs jsou vizuálně oddělené (např. pomocí › nebo /)
7. Aktuální stránka je označena (není klikatelná nebo má jiný styl)
