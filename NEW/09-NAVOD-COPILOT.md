# 09 - Návod pro Práci s GitHub Copilot

> **Tento dokument poskytuje tipy a triky pro efektivní práci s GitHub Copilotem na tomto projektu.**

---

## 📖 Obsah

1. [Nastavení Prostředí](#nastavení-prostředí)
2. [Promptovací Strategie](#promptovací-strategie)
3. [Běžné Úkoly](#běžné-úkoly)
4. [Anti-Patterns](#anti-patterns)
5. [Tipy a Triky](#tipy-a-triky)

---

## ⚙️ Nastavení Prostředí

### Prerekvizity

```bash
# Nainstaluj Node.js (pokud je potřeba)
node --version  # v18+

# Naklonuj repository
git clone https://github.com/PatrikCechlovsky/aplikace-v5.git
cd aplikace-v5

# Nainstaluj závislosti (pokud existují)
npm install

# Spusť lokální server
python -m http.server 8000
# nebo
npx serve .
```

### VS Code Extensions

Doporučené rozšíření:
- GitHub Copilot
- GitHub Copilot Chat
- Live Server (pro lokální testování)
- ESLint (pro kontrolu kódu)
- Tailwind CSS IntelliSense

---

## 💬 Promptovací Strategie

### 1. Kontext je klíč

**❌ Špatně:**
```
vytvoř nový modul
```

**✅ Správně:**
```
Vytvoř nový modul "060-smlouva" podle šablony z dokumentu 08-SABLONA-MODULU.md.
Modul bude spravovat nájemní smlouvy s následujícími funkcemi:
- Přehled všech smluv
- Detail smlouvy
- Vytvoření nové smlouvy
- Editace smlouvy
- Historie změn

Použij stejnou strukturu jako modul 010-sprava-uzivatelu.
```

### 2. Odkaz na existující kód

**❌ Špatně:**
```
přidej tlačítko pro export
```

**✅ Správně:**
```
Přidej tlačítko pro export do CommonActions v souboru 
src/modules/030-pronajimatel/tiles/prehled.js.

Použij stejný pattern jako v modulu 010-sprava-uzivatelu/tiles/prehled.js.
Tlačítko by mělo exportovat data do Excel pomocí exceljs.
```

### 3. Specifikuj formát

**❌ Špatně:**
```
vytvoř tabulku v databázi
```

**✅ Správně:**
```
Vytvoř PostgreSQL tabulku "contracts" s následujícími sloupci:
- id (UUID, PK)
- cislo_smlouvy (VARCHAR(50), UNIQUE)
- tenant_id (UUID, FK → subjects)
- datum_od (DATE)
- najemne (DECIMAL(10,2))
- archived (BOOLEAN)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)

Přidej RLS policies podle vzoru z dokumentu 07-DATABASE-SCHEMA.md.
Vytvoř trigger pro automatickou aktualizaci updated_at.
```

---

## 🎯 Běžné Úkoly

### Vytvoření nového modulu

**Prompt:**
```
Vytvoř nový modul "070-sluzby" pro správu služeb (energie, voda, internet).

Struktura:
1. src/modules/070-sluzby/module.config.js
   - id: '070-sluzby'
   - title: 'Služby'
   - icon: 'settings'
   - tiles: prehled, aktivni
   - forms: detail, edit, create

2. src/modules/070-sluzby/db.js
   - getAllServices()
   - getServiceById(id)
   - createService(data)
   - updateService(id, data)
   - archiveService(id)

3. src/modules/070-sluzby/tiles/prehled.js
   - Tabulka se sloupci: nazev, typ, cena, periodicita
   - CommonActions: add, edit, archive, refresh
   - Filtr pro typ služby

4. src/modules/070-sluzby/forms/detail.js
   - Detail služby (read-only)
   - Sekce: Základní údaje, Ceny, Systém

Použij stejný pattern jako modul 010-sprava-uzivatelu.
```

### Přidání nového pole do formuláře

**Prompt:**
```
Přidej nové pole "email_2" (sekundární email) do formuláře 
src/modules/030-pronajimatel/forms/edit.js.

Pole by mělo být:
- Type: email
- Optional (ne required)
- Umístěné pod polem "primary_email"
- S validací email formátu
- Label: "Sekundární e-mail"

Přidej také odpovídající sloupec do databáze (subjects tabulka).
```

### Oprava chyby

**Prompt:**
```
V souboru src/modules/040-nemovitost/tiles/prehled.js 
se vyskytuje chyba při načítání dat.

Chyba: "Cannot read property 'id' of undefined"

Prosím:
1. Zkontroluj funkci loadData()
2. Přidej error handling
3. Zkontroluj, zda data existují před přístupem k .id
4. Přidej fallback hodnotu pokud data chybí
```

### Refactoring

**Prompt:**
```
Refaktoruj soubor src/ui/table.js:

1. Extrahuj renderování řádku do samostatné funkce
2. Přidej podporu pro custom renderer pro buňky
3. Přidej podporu pro sorting (klik na hlavičku sloupce)
4. Přidej keyboard navigation (šipky pro pohyb mezi řádky)

Zachovej stávající API a zpětnou kompatibilitu.
```

---

## ⚠️ Anti-Patterns

### Co NEDĚLAT:

#### 1. Příliš obecné prompty

❌ "oprav to"  
❌ "udělej to lépe"  
❌ "přidej funkci"

✅ Vždy specifikuj:
- Co chceš udělat
- Kde (soubor, funkce)
- Podle jakého vzoru
- S jakými parametry

#### 2. Ignorování kontextu

❌ Vytvářet nový kód bez kontroly stávajícího  
❌ Používat jiný pattern než zbytek aplikace

✅ Vždy:
- Prostuduj existující kód
- Použij stejný pattern
- Respektuj strukturu projektu

#### 3. Slepé přejímání návrhů

❌ Přijmout každý návrh Copilota bez kontroly  
❌ Neověřit, zda kód funguje

✅ Vždy:
- Zkontroluj návrh
- Otestuj kód
- Ověř, že funguje správně

---

## 💡 Tipy a Triky

### 1. Používej komentáře jako prompty

```javascript
// Vytvoř funkci pro filtrování subjektů podle typu
// Parametry: data (array), typ (string)
// Vrátí: filtrovaný array
// Pokud typ je prázdný, vrátí všechna data
export function filterByType(data, typ) {
  // Copilot tu navrhne implementaci
}
```

### 2. Rozděluj velké úkoly

❌ "vytvoř celý modul"

✅ 
1. "vytvoř module.config.js"
2. "vytvoř db.js s CRUD funkcemi"
3. "vytvoř tiles/prehled.js"
4. "vytvoř forms/detail.js"

### 3. Používej TODO komentáře

```javascript
// TODO: Přidat validaci email formátu
// TODO: Přidat error handling
// TODO: Přidat loading spinner
```

Copilot často navrhne implementaci při psaní kódu pod TODO.

### 4. Používej příklady

```javascript
// Příklad volání:
// const result = await createContract({
//   cislo_smlouvy: '2025/001',
//   tenant_id: 'abc-123',
//   datum_od: '2025-01-01'
// });
export async function createContract(data) {
  // Copilot navrhne implementaci na základě příkladu
}
```

### 5. Pojmenuj věci konzistentně

✅ `getAllUsers()` → Copilot pochopí pattern  
✅ `getUserById(id)` → Copilot navrhne podobné funkce  
✅ `createUser(data)` → Konzistentní API

❌ `getUsers()`, `fetchUserByID()`, `addNewUser()` → Zmatenlivé

### 6. Používej TypeScript JSDoc

```javascript
/**
 * Vytvoří novou smlouvu
 * @param {Object} data - Data smlouvy
 * @param {string} data.cislo_smlouvy - Číslo smlouvy
 * @param {string} data.tenant_id - ID nájemníka
 * @param {string} data.datum_od - Datum začátku (YYYY-MM-DD)
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function createContract(data) {
  // Copilot navrhne implementaci včetně validace
}
```

### 7. Chat místo inline suggestions

Pro komplexní úkoly použij **GitHub Copilot Chat**:

1. Otevři soubor
2. Vyber kód (nebo celý soubor)
3. Otevři Copilot Chat
4. Napiš prompt s kontextem
5. Zkopíruj návrh a ověř ho

---

## 🎓 Checklist pro efektivní práci

- [ ] Prostudoval jsem dokumentaci v NEW/
- [ ] Znám strukturu projektu
- [ ] Vím, kde najít vzorový kód (modul 010)
- [ ] Používám specifické prompty s kontextem
- [ ] Odkazuji na existující kód
- [ ] Používám komentáře jako prompty
- [ ] Rozdělám velké úkoly na menší
- [ ] Vždy testuji vygenerovaný kód
- [ ] Používám konzistentní pojmenování
- [ ] Používám JSDoc pro dokumentaci

---

## 📚 Užitečné Prompty

### Vytvoření databázové tabulky

```
Vytvoř PostgreSQL tabulku pro [entitu] s následujícími vlastnostmi:
[seznam vlastností]

Přidej:
- Primární klíč (UUID)
- Foreign keys podle potřeby
- Indexy na často vyhledávané sloupce
- RLS policies podle vzoru z 07-DATABASE-SCHEMA.md
- Trigger pro updated_at
- Historie tabulku ([entita]_history)
```

### Vytvoření CRUD funkcí

```
Vytvoř CRUD funkce v db.js pro tabulku [název_tabulky]:

- getAll[Entity](includeArchived = false)
- get[Entity]ById(id)
- create[Entity](data)
- update[Entity](id, data)
- archive[Entity](id)

Použij Supabase client a vrať {data, error} formát.
```

### Vytvoření tile (přehledu)

```
Vytvoř přehled v tiles/prehled.js pro [entitu]:

- Tabulka se sloupci: [seznam sloupců]
- Filtr: fulltext search + checkbox "Zobrazit archivované"
- CommonActions: add, edit, archive, refresh
- onRowClick: navigace na detail
- onRowSelect: uložení vybraného řádku
- Breadcrumb: Domů › [Modul] › Přehled

Použij pattern z 010-sprava-uzivatelu/tiles/prehled.js
```

---

**Konec dokumentu - Návod pro GitHub Copilot** ✅
