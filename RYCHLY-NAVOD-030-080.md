# Rychlý návod - Jak dokončit implementaci modulů 030-080

Tento dokument poskytuje krok-za-krokem návod, jak dokončit implementaci modulů 060-080.

## 🚀 Aktuální stav

✅ **HOTOVO:**
- Vytvořena struktura modulů 060, 070, 080
- Připraveny SQL migrace pro databázové tabulky
- Moduly jsou viditelné v aplikaci (zakomentovány v modules.index.js)
- Placeholder UI pro všechny tiles a forms

⏳ **ZBÝVÁ:**
- Spustit SQL migrace v Supabase
- Implementovat CRUD operace
- Implementovat funkční UI

---

## 📝 Krok 1: Spuštění SQL migrací (15-30 minut)

### V Supabase Dashboard:

1. Přihlaste se do [Supabase Dashboard](https://supabase.com)
2. Otevřete SQL Editor
3. Postupně spusťte následující migrace:

#### a) Migration 003 - Rozšíření subjects tabulky
```bash
# Soubor: docs/tasks/supabase-migrations/003_add_subjects_missing_fields.sql
```
**Co dělá:**
- Přidá nová pole do subjects tabulky (kontaktní_osoba, bankovní_účty, atd.)
- Potřebné pro moduly 030 (Pronajímatel) a 050 (Nájemník)

**Očekávaný výstup:**
```
Migration 003 completed: Added missing fields to subjects table
```

#### b) Migration 004 - Tabulky pro smlouvy
```bash
# Soubor: docs/tasks/supabase-migrations/004_create_contracts_table.sql
```
**Co dělá:**
- Vytvoří tabulky `contracts` a `handover_protocols`
- Potřebné pro modul 060 (Smlouvy)

**Očekávaný výstup:**
```
Migration 004 completed: contracts and handover_protocols tables created
```

#### c) Migration 005 - Tabulky pro služby
```bash
# Soubor: docs/tasks/supabase-migrations/005_create_services_tables.sql
```
**Co dělá:**
- Vytvoří tabulky `service_definitions` a `contract_service_lines`
- Předvyplní katalog základními službami (voda, elektřina, plyn, atd.)
- Potřebné pro modul 070 (Služby)

**Očekávaný výstup:**
```
Migration 005 completed: service_definitions and contract_service_lines tables created
```

#### d) Migration 006 - Tabulky pro platby
```bash
# Soubor: docs/tasks/supabase-migrations/006_create_payments_tables.sql
```
**Co dělá:**
- Vytvoří tabulky `payments`, `payment_service_items`, `payment_allocations`
- Potřebné pro modul 080 (Platby)

**Očekávaný výstup:**
```
Migration 006 completed: payments, payment_service_items, and payment_allocations tables created
```

### Kontrola:
Po spuštění migrací zkontrolujte v Supabase Table Editor, že byly vytvořeny nové tabulky:
- ✅ contracts
- ✅ handover_protocols
- ✅ service_definitions
- ✅ contract_service_lines
- ✅ payments
- ✅ payment_service_items
- ✅ payment_allocations

---

## 📝 Krok 2: Aktualizace type-schemas (30-60 minut)

### Upravte soubor: `/src/lib/type-schemas/subjects.js`

Přidejte nová pole podle návodu v `docs/tasks/type-schemas-extensions.js`:

#### Pro firmy (osvc, firma, spolek, stat):
```javascript
// Kontaktní osoba
{ key: 'kontaktni_osoba_jmeno', label: 'Kontaktní osoba - Jméno', type: 'text' },
{ key: 'kontaktni_osoba_email', label: 'Kontaktní osoba - E-mail', type: 'email' },
{ key: 'kontaktni_osoba_telefon', label: 'Kontaktní osoba - Telefon', type: 'text' },
```

#### Pro všechny typy:
```javascript
// Bankovní účet
{ key: 'banka_nazev', label: 'Banka', type: 'text' },
{ key: 'banka_iban', label: 'IBAN', type: 'text' },
{ key: 'banka_bic', label: 'BIC / SWIFT', type: 'text' },
```

#### Pro nájemníky:
```javascript
// Doručovací adresa
{ key: 'dorucovaci_ulice', label: 'Doručovací adresa - Ulice', type: 'text' },
{ key: 'dorucovaci_cislo_popisne', label: 'Číslo popisné', type: 'text' },
{ key: 'dorucovaci_mesto', label: 'Město', type: 'text' },
{ key: 'dorucovaci_psc', label: 'PSČ', type: 'text' },
```

### Implementujte transformační funkce

Vytvořte helper funkce pro konverzi mezi flat formulářem a JSON strukturou v DB:
```javascript
// Před uložením do DB
function prepareSubjectForDb(formData) {
  const { 
    kontaktni_osoba_jmeno, 
    kontaktni_osoba_email, 
    kontaktni_osoba_telefon,
    banka_nazev,
    banka_iban,
    banka_bic,
    ...rest 
  } = formData;
  
  return {
    ...rest,
    kontaktni_osoba: kontaktni_osoba_jmeno ? {
      jmeno: kontaktni_osoba_jmeno,
      email: kontaktni_osoba_email,
      telefon: kontaktni_osoba_telefon
    } : null,
    bankovni_ucty: banka_iban ? [{
      banka: banka_nazev,
      iban: banka_iban,
      bic: banka_bic
    }] : null
  };
}

// Po načtení z DB
function flattenSubjectForForm(dbRecord) {
  return {
    ...dbRecord,
    kontaktni_osoba_jmeno: dbRecord.kontaktni_osoba?.jmeno,
    kontaktni_osoba_email: dbRecord.kontaktni_osoba?.email,
    kontaktni_osoba_telefon: dbRecord.kontaktni_osoba?.telefon,
    banka_nazev: dbRecord.bankovni_ucty?.[0]?.banka,
    banka_iban: dbRecord.bankovni_ucty?.[0]?.iban,
    banka_bic: dbRecord.bankovni_ucty?.[0]?.bic
  };
}
```

---

## 📝 Krok 3: Implementace CRUD operací (2-4 hodiny)

### Modul 060 - Smlouvy

Upravte `/src/modules/060-smlouva/db.js`:

```javascript
// Příklad: listContracts
export async function listContracts(options = {}) {
  const { status, showArchived = false, limit = 500 } = options;
  
  let query = supabase
    .from('contracts')
    .select(`
      *,
      landlord:subjects!landlord_id(id, display_name),
      tenant:subjects!tenant_id(id, display_name),
      unit:units(id, oznaceni),
      property:properties(id, nazev)
    `)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (status) query = query.eq('stav', status);
  if (!showArchived) query = query.eq('archived', false);
  
  const { data, error } = await query;
  return { data: data || [], error };
}
```

**Implementujte podobně:**
- `getContract(id)`
- `upsertContract(contract)`
- `archiveContract(id)`

### Modul 070 - Služby

Upravte `/src/modules/070-sluzby/db.js`:

```javascript
export async function listServiceDefinitions(options = {}) {
  const { kategorie, aktivni = true } = options;
  
  let query = supabase
    .from('service_definitions')
    .select('*')
    .order('nazev');
  
  if (kategorie) query = query.eq('kategorie', kategorie);
  if (aktivni !== null) query = query.eq('aktivni', aktivni);
  
  const { data, error } = await query;
  return { data: data || [], error };
}
```

### Modul 080 - Platby

Upravte `/src/modules/080-platby/db.js`:

```javascript
export async function listPayments(options = {}) {
  const { contract_id, status } = options;
  
  let query = supabase
    .from('payments')
    .select(`
      *,
      contract:contracts(cislo_smlouvy),
      party:subjects!party_id(display_name)
    `)
    .order('payment_date', { ascending: false });
  
  if (contract_id) query = query.eq('contract_id', contract_id);
  if (status) query = query.eq('status', status);
  
  const { data, error } = await query;
  return { data: data || [], error };
}
```

---

## 📝 Krok 4: Implementace UI - Přehledové tiles (2-3 hodiny)

### Vzorový příklad pro modul 060 - Smlouvy

Upravte `/src/modules/060-smlouva/tiles/prehled.js`:

```javascript
import { renderTable } from '/src/ui/table.js';
import { listContracts } from '/src/modules/060-smlouva/db.js';
import { setBreadcrumb } from '/src/ui/breadcrumb.js';

export default async function render(root) {
  setBreadcrumb(document.getElementById('crumb'), [
    { icon: 'home', label: 'Domů', href: '#/' },
    { icon: 'description', label: 'Smlouvy', href: '#/m/060-smlouva' },
    { icon: 'list', label: 'Přehled' }
  ]);

  const { data, error } = await listContracts({});
  
  if (error) {
    root.innerHTML = `<div class="p-4 text-red-600">Chyba: ${error.message}</div>`;
    return;
  }

  const columns = [
    { key: 'cislo_smlouvy', label: 'Číslo smlouvy', sortable: true },
    { key: 'tenant_name', label: 'Nájemník' },
    { key: 'unit_name', label: 'Jednotka' },
    { key: 'datum_zacatek', label: 'Od', sortable: true },
    { key: 'datum_konec', label: 'Do' },
    { key: 'najem_vyse', label: 'Nájem (Kč)', sortable: true },
    { key: 'stav', label: 'Stav' }
  ];

  renderTable(root, {
    columns,
    rows: data.map(r => ({
      ...r,
      tenant_name: r.tenant?.display_name || '—',
      unit_name: r.unit?.oznaceni || '—'
    })),
    options: {
      moduleId: '060-smlouva',
      onRowDblClick: row => {
        window.location.hash = `#/m/060-smlouva/f/detail?id=${row.id}`;
      }
    }
  });
}
```

**Implementujte podobně pro:**
- Modul 070 - katalog služeb
- Modul 080 - přehled plateb

---

## 📝 Krok 5: Testování (1-2 hodiny)

### Kontrolní seznam:

1. **Moduly se načítají**
   - [ ] Modul 060 se zobrazuje v sidebaru
   - [ ] Modul 070 se zobrazuje v sidebaru
   - [ ] Modul 080 se zobrazuje v sidebaru

2. **Přehledové tiles fungují**
   - [ ] Modul 060 - zobrazuje seznam smluv
   - [ ] Modul 070 - zobrazuje katalog služeb
   - [ ] Modul 080 - zobrazuje platby

3. **CRUD operace fungují**
   - [ ] Lze vytvořit novou smlouvu
   - [ ] Lze přidat službu do katalogu
   - [ ] Lze evidovat platbu

4. **Vazby mezi entitami**
   - [ ] Smlouva se správně propojí s pronajímatelem, nájemníkem a jednotkou
   - [ ] Služby se správně přiřadí ke smlouvě
   - [ ] Platba se správně propojí se smlouvou

---

## 🔧 Troubleshooting

### Problém: Migrace selže s chybou "relation already exists"
**Řešení:** Tabulka už existuje. Přeskočte tuto migraci nebo ji upravte na `CREATE TABLE IF NOT EXISTS`.

### Problém: RLS policy odmítá přístup
**Řešení:** Zkontrolujte, že jste přihlášeni a máte správnou roli v `profiles` tabulce.

### Problém: Foreign key constraint fails
**Řešení:** Ujistěte se, že existují záznamy v propojených tabulkách (subjects, units, properties).

### Problém: Modul se nezobrazuje v sidebaru
**Řešení:** Zkontrolujte, že je modul odkomentován v `src/app/modules.index.js`.

---

## 📚 Užitečné odkazy

- **Dokumentace Supabase**: https://supabase.com/docs
- **Module quick reference**: `docs/module-quick-reference.md`
- **Database schema**: `docs/database-schema.md`
- **Specifikace**: `smlouvy_moduly_030-080.md`

---

## 💡 Tipy

1. **Začněte s modulem 070 (Služby)** - je nejjednodušší, má předvyplněný katalog
2. **Použijte modul 040 jako referenci** - je kompletně implementovaný
3. **Testujte průběžně** - po každé změně otestujte, že aplikace funguje
4. **Commitujte často** - malé commity jsou lepší než velké

---

**Poznámka:** Pro podrobné příklady kódu se podívejte do existujících modulů:
- `/src/modules/010-sprava-uzivatelu/` - referenční implementace
- `/src/modules/040-nemovitost/` - kompletní modul s vazbami

**Úspěšnou implementaci!** 🚀
