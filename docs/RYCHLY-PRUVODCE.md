# 🚀 RYCHLÝ PRŮVODCE – Vytvoření nového modulu

> **Cíl:** Vytvořit nový standardizovaný modul v aplikaci v5 za 30 minut

## Krok 1: Vytvoř strukturu složek (2 min)

```bash
cd src/modules/
mkdir -p XXX-nazev-modulu/tiles
mkdir -p XXX-nazev-modulu/forms
```

**Příklad:**
```bash
mkdir -p 060-smlouva/tiles
mkdir -p 060-smlouva/forms
```

---

## Krok 2: Vytvoř module.config.js (3 min)

**Soubor:** `src/modules/XXX-nazev/module.config.js`

```javascript
export async function getManifest() {
  return {
    id: 'XXX-nazev',
    title: 'Název modulu',
    icon: 'icon-name',
    defaultTile: 'prehled',
    tiles: [
      { id: 'prehled', title: 'Přehled', icon: 'list' },
    ],
    forms: [
      { id: 'form', title: 'Formulář', icon: 'form' },
      { id: 'create', title: 'Nový záznam', icon: 'add' },
    ],
  };
}

export default { getManifest };
```

**⚠️ Uprav:** `id`, `title`, `icon`

---

## Krok 3: Odkomentuj v modules.index.js (1 min)

**Soubor:** `src/app/modules.index.js`

```javascript
export const MODULE_SOURCES = [
  // ... ostatní moduly
  () => import('../modules/XXX-nazev/module.config.js'),  // <-- PŘIDEJ
];
```

---

## Krok 4: Vytvoř databázovou tabulku (5 min)

**V Supabase SQL Editor:**

```sql
-- Hlavní tabulka
CREATE TABLE IF NOT EXISTS public.xxx (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nazev text NOT NULL,
  email text,
  telefon text,
  street text,
  house_number text,
  city text,
  zip text,
  archived boolean DEFAULT false,
  note text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  updated_by text,
  profile_id uuid REFERENCES auth.users(id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_xxx_profile 
  ON public.xxx(profile_id);

-- RLS
ALTER TABLE public.xxx ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own records"
  ON public.xxx FOR SELECT
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can insert own records"
  ON public.xxx FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update own records"
  ON public.xxx FOR UPDATE
  USING (auth.uid() = profile_id);

-- Tabulka historie
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

CREATE INDEX IF NOT EXISTS idx_xxx_history_entity 
  ON public.xxx_history(entity_id);

-- Trigger pro historii
CREATE OR REPLACE FUNCTION track_xxx_changes()
RETURNS TRIGGER AS $$
DECLARE
  col text;
  old_val text;
  new_val text;
  user_name text;
BEGIN
  user_name := COALESCE(NEW.updated_by, current_user);
  
  FOR col IN 
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'xxx' 
      AND table_schema = 'public'
      AND column_name NOT IN ('id', 'created_at', 'updated_at', 'updated_by')
  LOOP
    EXECUTE format('SELECT ($1).%I::text, ($2).%I::text', col, col) 
      INTO old_val, new_val 
      USING OLD, NEW;
    
    IF old_val IS DISTINCT FROM new_val THEN
      INSERT INTO public.xxx_history 
        (entity_id, field, old_value, new_value, changed_by, changed_at)
      VALUES 
        (NEW.id, col, old_val, new_val, user_name, now());
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER xxx_history_trigger
  AFTER UPDATE ON public.xxx
  FOR EACH ROW
  EXECUTE FUNCTION track_xxx_changes();
```

**⚠️ Nahraď:** `xxx` → skutečný název entity

---

## Krok 5: Vytvoř DB funkce (5 min)

**Soubor:** `src/db/xxx.js` (nebo přidej do `src/db.js`)

```javascript
import { supabase } from '../supabase.js';

// Načtení seznamu
export async function listXXX() {
  const { data, error } = await supabase
    .from('xxx')
    .select('*')
    .order('created_at', { ascending: false });
  return { data, error };
}

// Načtení jednoho záznamu
export async function getXXX(id) {
  const { data, error } = await supabase
    .from('xxx')
    .select('*')
    .eq('id', id)
    .single();
  return { data, error };
}

// Aktualizace
export async function updateXXX(id, values, currentUser) {
  const payload = {
    ...values,
    updated_at: new Date().toISOString(),
    updated_by: currentUser?.display_name || currentUser?.email || 'system'
  };
  
  const { data, error } = await supabase
    .from('xxx')
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
}

// Vytvoření nového
export async function createXXX(values, currentUser) {
  const payload = {
    ...values,
    profile_id: currentUser?.id,
    created_at: new Date().toISOString()
  };
  
  const { data, error } = await supabase
    .from('xxx')
    .insert(payload)
    .select()
    .single();
  return { data, error };
}

// Archivace
export async function archiveXXX(id, currentUser) {
  return updateXXX(id, { archived: true }, currentUser);
}
```

**⚠️ Nahraď:** `XXX` a `xxx` → skutečný název

---

## Krok 6: Zkopíruj tiles/prehled.js (5 min)

**Zkopíruj z:** `src/modules/010-sprava-uzivatelu/tiles/prehled.js`

**Do:** `src/modules/XXX-nazev/tiles/prehled.js`

**Uprav:**
1. Importy DB funkcí: `listProfiles` → `listXXX`
2. Breadcrumbs: ikona, název modulu, href
3. ID kontejneru: `#user-table` → `#xxx-table`
4. Sloupce tabulky: podle tvé entity
5. moduleId: `'010-sprava-uzivatelu'` → `'XXX-nazev'`
6. Navigační odkazy: všechny `#/m/010-...` → `#/m/XXX-...`

**Hromadné nahrazení v editoru:**
```
010-sprava-uzivatelu  →  XXX-nazev
listProfiles          →  listXXX
archiveProfile        →  archiveXXX
#user-table           →  #xxx-table
Uživatelé             →  Tvůj název
users                 →  xxx (pro attachments)
```

---

## Krok 7: Zkopíruj forms/form.js (5 min)

**Zkopíruj z:** `src/modules/010-sprava-uzivatelu/forms/form.js`

**Do:** `src/modules/XXX-nazev/forms/form.js`

**Uprav:**
1. Importy DB funkcí: `getProfile`, `updateProfile` → `getXXX`, `updateXXX`
2. Definici `FIELDS` - pole tvé entity
3. Breadcrumbs: ikona, název, href
4. Navigační odkazy: `#/m/010-...` → `#/m/XXX-...`
5. Entity jméno pro attachments: `'users'` → `'xxx'`

**Hromadné nahrazení:**
```
010-sprava-uzivatelu  →  XXX-nazev
getProfile            →  getXXX
updateProfile         →  updateXXX
archiveProfile        →  archiveXXX
Uživatelé             →  Tvůj název
users                 →  xxx
```

---

## Krok 8: Vytvoř forms/history.js (3 min)

**Soubor:** `src/modules/XXX-nazev/forms/history.js`

```javascript
import { supabase } from '../../../db.js';

const FIELD_LABELS = {
  nazev: 'Název',
  email: 'E-mail',
  telefon: 'Telefon',
  street: 'Ulice',
  house_number: 'Číslo popisné',
  city: 'Město',
  zip: 'PSČ',
  archived: 'Archivován',
  note: 'Poznámka',
  updated_at: 'Poslední úprava',
  updated_by: 'Upravil',
  created_at: 'Vytvořen'
};

export async function showHistoryModal(entityId) {
  const { data, error } = await supabase
    .from('xxx_history')  // <-- ZMĚŇ!
    .select('*')
    .eq('entity_id', entityId)
    .order('changed_at', { ascending: false });

  if (error) {
    alert("Chyba při načítání historie: " + error.message);
    return;
  }
  if (!Array.isArray(data) || data.length === 0) {
    alert("Žádná historie změn zatím neexistuje.");
    return;
  }

  let html = `
    <h2 style="margin-bottom:1em;">Historie změn</h2>
    <table style="width:100%;border-collapse:collapse;">
      <thead>
        <tr>
          <th style="text-align:left;">Pole</th>
          <th style="text-align:left;">Původní hodnota</th>
          <th style="text-align:left;">Nová hodnota</th>
          <th style="text-align:left;">Upravil</th>
          <th style="text-align:left;">Kdy</th>
        </tr>
      </thead>
      <tbody>
        ${data.map(row => `
          <tr>
            <td>${FIELD_LABELS[row.field] || row.field}</td>
            <td>${row.old_value ?? '-'}</td>
            <td>${row.new_value ?? '-'}</td>
            <td>${row.changed_by ?? '-'}</td>
            <td>${new Date(row.changed_at).toLocaleString('cs-CZ')}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  let modal = document.createElement('div');
  modal.id = 'history-modal';
  modal.style.position = 'fixed';
  modal.style.left = '0'; modal.style.top = '0';
  modal.style.width = '100vw'; modal.style.height = '100vh';
  modal.style.background = 'rgba(0,0,0,0.6)';
  modal.style.zIndex = '1000';
  modal.style.display = 'flex'; 
  modal.style.justifyContent = 'center'; 
  modal.style.alignItems = 'center';
  modal.innerHTML = `
    <div style="background:#fff;max-width:900px;width:95vw;max-height:90vh;overflow:auto;padding:2em;border-radius:12px;position:relative;">
      <button onclick="document.getElementById('history-modal').remove()" 
        style="position:absolute;top:12px;right:16px;font-size:26px;background:none;border:none;cursor:pointer;" 
        title="Zavřít">&times;</button>
      ${html}
    </div>
  `;
  document.body.appendChild(modal);
}
```

**⚠️ Nahraď:**
- `xxx_history` → název tvé history tabulky
- Uprav `FIELD_LABELS` podle polí v FIELDS

---

## Krok 9: Vytvoř forms/create.js (volitelné, 2 min)

Pokud chceš samostatný formulář pro vytváření:

```javascript
import { renderForm } from '../../../ui/form.js';
import { createXXX } from '../../../db/xxx.js';
import { navigateTo } from '../../../app.js';

const FIELDS = [
  // Zkopíruj z form.js, KROMĚ readonly polí!
  { key: 'nazev', label: 'Název', type: 'text', required: true },
  { key: 'email', label: 'E-mail', type: 'email', required: true },
  // ... další pole
];

export async function render(root) {
  renderForm(root, FIELDS, {}, async (values) => {
    const { data, error } = await createXXX(values, window.currentUser);
    if (error) {
      alert('Chyba: ' + error.message);
      return false;
    }
    alert('Vytvořeno!');
    navigateTo('#/m/XXX-nazev/t/prehled');
    return true;
  });
}

export default { render };
```

---

## Krok 10: Testuj! (5+ min)

### Otevři aplikaci v prohlížeči:

1. **Sidebar:** Modul se zobrazuje?
2. **Přehled:** Data se načítají?
3. **Filtr:** Hledání funguje?
4. **Výběr řádku:** Aktivují se tlačítka?
5. **Dvojklik:** Otevře se formulář?
6. **Formulář:** Data se načítají?
7. **Uložení:** Změny se ukládají?
8. **Historie:** Modal se zobrazuje?
9. **Archivace:** Záznam zmizí ze seznamu?

### Kontrola v konzoli:
```javascript
// Registry obsahuje modul?
window.registry.get('XXX-nazev')

// Data se načítají?
const { listXXX } = await import('/src/db/xxx.js');
await listXXX()
```

---

## ✅ HOTOVO!

Tvůj modul je připravený! 🎉

### Kontrolní seznam:
- [ ] Modul v modules.index.js
- [ ] module.config.js vytvořen
- [ ] DB tabulky vytvořeny (xxx + xxx_history)
- [ ] DB funkce vytvořeny (list, get, update, create, archive)
- [ ] tiles/prehled.js vytvořen a upraven
- [ ] forms/form.js vytvořen a upraven
- [ ] forms/history.js vytvořen
- [ ] forms/create.js vytvořen (volitelné)
- [ ] Testování proběhlo úspěšně

---

## 🆘 Časté problémy

### "Modul nenalezen"
→ Zkontroluj že je odkomentován v `modules.index.js`

### "Prázdný přehled"
→ Zkontroluj RLS pravidla v Supabase
→ Zkontroluj že `listXXX()` vrací data

### "Chyba při načítání"
→ Zkontroluj console v prohlížeči
→ Zkontroluj že všechny importy jsou správné
→ Zkontroluj že cesty k souborům sedí

### "Historie nefunguje"
→ Zkontroluj že tabulka xxx_history existuje
→ Zkontroluj že trigger je vytvořen
→ Zkontroluj že import v form.js je správně: `import { showHistoryModal } from './history.js'`

### "CommonActions nejsou vidět"
→ Zkontroluj že voláš `renderCommonActions(document.getElementById('commonactions'), ...)`
→ Zkontroluj že element `#commonactions` existuje v app.html

---

## 📚 Další zdroje

- **Podrobný návod:** `/docs/STANDARDIZACNI-NAVOD.md`
- **Kontrolní checklist:** `/docs/MODUL-CHECKLIST.md`
- **Referenční modul:** `/src/modules/010-sprava-uzivatelu/`

---

**Vytvořeno:** 2025-10-20  
**Verze:** 1.0  
**Pro:** aplikace-v5
