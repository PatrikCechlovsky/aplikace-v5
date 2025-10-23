
# app‑v5 — Kontrolní checklist (bez kódu)

Tento dokument ti dá **pomalý, jasný postup** pro ověření, proč se UI někdy „tváří prázdné“, **bez psaní nového kódu**. Vždy si odškrtni krok a teprve pak pokračuj dál.

---

## 0) Co teď máme (stručný obraz)
- [ ] `app.html` má všechny cílové „sloty“: `#homebtnbox`, `#headeractions`, `#sidebarbox`, `#crumb`, `#commonactions`, `#content`.  
- [ ] `app.js` dělá 3 věci:  
      ① inicializuje **registry modulů** přes `MODULE_SOURCES`,  
      ② router (`route()` + `hashchange`) a *redirect* na výchozí sekci modulu,  
      ③ dynamicky importuje `.../<baseDir>/(tiles|forms)/<id>.js`.  
- [ ] `modules.index.js` existuje a **obsahuje alespoň jeden modul** (např. 010, 020…).  
- [ ] `app.render-shim.js` existuje (volitelný „airbag“ pro bezpečné spuštění rendereru).  
- [ ] `auth.js` chrání `app.html` (nepřihlášené pošle na `index.html`) a umí **tvrdý logout** (local → server).  
- [ ] `supabase.js` je inicializovaný a dostupný jako `window.supabase` v konzoli.

> Pozn.: Tohle je **inventura** – nic neměň, jen potvrď, že to tak je.

---

## 1) Registrované moduly (nejčastější příčina prázdna)
**Cíl:** Ověříme, že se moduly skutečně načetly do registry.

1. Otevři `app.html` v prohlížeči a v konzoli napiš:  
   ```js
   window.registry && window.registry.size
   ```
   - [ ] Výsledek je **větší než 0**.  
     - Pokud **0 nebo undefined** → aplikace nenašla `modules.index.js` nebo je prázdný.

2. Zobraz si celou registry:  
   ```js
   Array.from(window.registry.values())
   ```
   - [ ] Uvidíš objekty s klíči jako `id`, `title`, `icon`, `defaultTile`, `tiles`, `forms`, `baseDir`.
   - [ ] **Zapiš si `baseDir`** pro modul, který chceš testovat (např. `010-sprava-uzivatelu`).

> Pokud registry není naplněná: zkontroluj, **zda je soubor `modules.index.js` přesně v cestě**, kterou importuje `app.js` (relativní import musí sedět), a že `MODULE_SOURCES` **opravdu** vrací aspoň jeden `() => import('…/module.config.js')`.

---

## 2) Dynamický import dlaždice / formuláře
**Cíl:** Ověřit, že *cesty a názvy souborů* sedí (častá chyba).

1. V konzoli si ulož modul z registry:  
   ```js
   const m = window.registry.get('010-sprava-uzivatelu');
   m
   ```
   - [ ] `m.baseDir` vypadá správně (končí složkou modulu).

2. Zkus ručně naimportovat dlaždici:  
   ```js
   import(m.baseDir + '/tiles/prehled.js?cb=' + Date.now())
   ```
   - [ ] Import **proběhne bez chyby**.  
     - Pokud padne **404 / NetworkError** → **název souboru/umístění nesedí** (nejčastěji jiný název, překlep, diakritika, nebo jiná složka).  
     - Pokud padne **Renderer missing** → modul exportuje něco jiného, než `render` / `default.render` / `default funkci`.

> Tímto krokem vyloučíš všechny problémy s cestami a názvy *ještě před* routerem.

---

## 3) Router & přesměrování na výchozí sekci
**Cíl:** Ověřit, že router funguje a dovede tě z `#/m/<id>` na výchozí `tile/form`.

1. Nastav hash pouze na modul:  
   ```js
   location.hash = '#/m/010-sprava-uzivatelu'
   ```
   - [ ] Během chvíle se URL **sama přepne** na něco jako `#/m/010-sprava-uzivatelu/t/prehled` (nebo `f/<id>`).  
     - Pokud **zůstane jen `#/m/<id>`** → modul v manifestu nemá `defaultTile` a nemá ani `tiles/forms` → **modul je prázdný**.

2. Zkontroluj breadcrumbs a obsah:  
   - [ ] V `#crumb` vidíš **Domů › Uživatelé › Přehled** (nebo analogii pro jiný modul).  
   - [ ] V `#content` se **zobrazí obsah** nebo korektní hláška z loaderu.

---

## 4) Cílové kontejnery v DOM (aby „nezmizely“ akce)
**Cíl:** Ověřit, že moduly zapisují do existujících ID.

- [ ] V `app.html` opravdu *existuje* `#commonactions`.  
- [ ] Moduly, které vykreslují akce, **míří do `#commonactions`** (ne do `#crumb-actions` apod.).  
- [ ] Pokud akce nevidíš, otevři konzoli a zkontroluj, **jestli výstup modulu nevypisuje chybu** o neexistujícím elementu.

> Cílové ID je **pevně dáno layoutem** – pokud modul cílí jinam, UI působí prázdně.

---

## 5) Ověření Auth vrstvy (bez úprav)
**Cíl:** Mít jistotu, že se `app.html` chrání a že `logout` funguje, až bude potřeba.

- [ ] V `app.html` je **načten `auth.js`** (ideálně před `app.js`).  
- [ ] Pokud máš v headeru tlačítko „Odhlásit“, má `id="logoutBtn"` (aby se na něj `auth.js` navázal).  
- [ ] Když nejsi přihlášen, **app tě přesměruje na `index.html`**.  
- [ ] `window.supabase` je v konzoli dostupné (ověření inicializace klienta).

> Jen ověř – nic nepřepisuj. Cílem je vyloučit, že „prázdno“ způsobuje přesměrování/ochrana.

---

## 6) Data v tabulce (aby „nevypadala prázdně“)
**Cíl:** Ujistit se, že zobrazené sloupce opravdu existují v **SELECT** dotazu a v datech.

- [ ] Pokud dlaždice zobrazuje `phone`, `mesto`, `note` apod., ověř, že funkce pro načtení (např. `listProfiles()`) tyto sloupce **vybírá**.  
- [ ] Když jsou sloupce prázdné, ale není chyba, většinou **jen nejsou vybrané** nebo v DB **nejsou data**.

> Tohle je logická kontrola – UI se vykreslí, ale vidíš „nic“, protože vlastně není co zobrazit.

---

## 7) Ikony (neblokující, ale matoucí)
**Cíl:** Zbavit se zbytečných varování v konzoli.

- [ ] Sleduj konzoli: hláška „Neznámá ikona: …“ znamená, že klíč není v registru `icons.js`.  
- [ ] Poznamenej si chybějící názvy (např. `folder`, `close`) – doplníme je **po diagnostice**.

---

## 8) Rozhodovací strom (rychlé vyhodnocení)
- Pokud **`window.registry.size === 0`** → problém v `modules.index.js` (cesta/importy prázdné).  
- Pokud **ruční `import(m.baseDir + '/tiles/...')` padá** → **cesta/název souboru**.  
- Pokud **router nepřesměruje** z `#/m/<id>` → modul nemá `defaultTile` a/nebo `tiles/forms`.  
- Pokud **nevidíš akce** → modul míří do **špatného ID** (má být `#commonactions`).  
- Pokud **tabulka vypadá prázdná** → **SELECT** neobsahuje sloupce (nebo DB nemá data).  
- Pokud **logout/redirect nefunguje** → `auth.js` **není načten** / chybí `#logoutBtn` / nejsi na `app.html` atd.

---

## 9) Poznámky a odškrtávání
Níže si zapisuj výsledky jednotlivých kroků (pro mě je super to pak vidět najednou):

- [ ] `window.registry.size` = …  
- [ ] `Array.from(window.registry.values())` vypadá OK (ano/ne): …  
- [ ] `baseDir` pro modul 010 = …  
- [ ] Ruční `import()` dlaždice funguje (ano/ne): …  
- [ ] Router přesměroval na výchozí sekci (ano/ne): …  
- [ ] `#commonactions` existuje + modul do něj renderuje (ano/ne): …  
- [ ] Auth: `auth.js` načten + `logoutBtn` přítomen (ano/ne): …  
- [ ] Data: vybrané sloupce odpovídají tomu, co tabulka zobrazuje (ano/ne): …  
- [ ] Ikony: chybějící klíče: …

---

### Jak s tím pracovat
1. Projdi **1 → 3**. Jakmile potvrdíš registry + import + router, máš jistotu, že **struktura modulů/cesty jsou v pořádku**.  
2. Pak **4 → 7** (kontejnery, auth, data, ikony).  
3. Až tohle všechno odškrtneš, rozhodneme o **nejkratším „fixu“** (případně jednu precizní úpravu), aby se UI chovalo přesně podle plánu.

> Kdykoli mi pošli vyplněnou sekci **9) Poznámky a odškrtávání** — na základě ní ti navrhnu **jedinou** konkrétní změnu, bez skákání mezi tématy.
