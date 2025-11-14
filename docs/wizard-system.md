# Průvodce (Wizard) – Technická dokumentace

Tento dokument popisuje kompletní návrh **wizard systému** v aplikaci Pronajímatel.  
Systém je **obecný**, modulární a navázaný na existující entitní kódy, formuláře a seznamy.

---

# 1. Účel průvodce

Wizard slouží pro:

- vícekrokové zakládání nebo úpravy záznamů,
- možnost uložit rozpracovaný stav,
- plynulý postup krok za krokem,
- validace na úrovni každého kroku,
- finální uložení v jedné transakci,
- použití pro libovolnou entitu (LORD, PROP, UNIT, TEN, AGR, PAY, DOC).

---

# 2. Architektura

Wizard používá dva hlavní datové objekty:

1. **wizard_drafts** – hlavičková tabulka jednoho průvodce  
2. **wizard_steps** – jednotlivé kroky v rámci průvodce  

Systém je navázaný na existující:

- entitní kódy: `LORD`, `PROP`, `UNIT`, `TEN`, `AGR`, `PAY`, `DOC`
- kódy formulářů: `form-<entity>-detail`
- kódy seznamů: `list-<entity>-all`, `list-prop-by-lord`, …
- kódy oušek: `tab-<zdroj>-<cil>`

---

# 3. Tabulka `wizard_drafts`

Každý řádek = jedna instance průvodce, např. „Nová nemovitost“.

## Struktura

```
id (uuid)                     – identifikátor draftu
user_id (uuid)                – kdo průvodce rozpracoval
wizard_key (text)             – typ průvodce (např. create-prop-with-units)
entity_code (text)            – LORD / PROP / UNIT / TEN / AGR / PAY / DOC
mode (text)                   – create | update
target_id (uuid)              – pokud update, existující objekt

status (text)                 – draft | in_progress | completed | canceled | expired

current_step_code (text)      – aktuální krok
current_step_order (int)      – pořadí kroku
total_steps (int)             – kolik kroků má průvodce celkem

payload (jsonb)               – agregovaná data z kroků
meta (jsonb)                  – doplňující technická metadata

created_at (timestamp)
updated_at (timestamp)
expires_at (timestamp)        – pro automatické čištění nedokončených draftů
```

---

# 4. Tabulka `wizard_steps`

Reprezentuje jednotlivé kroky v jednom průvodci.

## Struktura

```
id (uuid)
draft_id (uuid)               – FK → wizard_drafts
step_order (int)              – pořadí kroku
step_code (text)              – identifikátor kroku

entity_code (text)            – entita, které se krok týká
form_code (text)              – např. form-prop-detail
list_code (text)              – pokud krok používá seznam
tab_code (text)               – případná vazba na ouško

status (text)                 – pending | in_progress | valid | invalid | skipped | done

data (jsonb)                  – uživatelský vstup
errors (jsonb)                – validační chyby

started_at (timestamp)
completed_at (timestamp)

created_at (timestamp)
updated_at (timestamp)
```

---

# 5. Logika průvodce

Wizard postupuje následovně:

1. Uživateli se zobrazí první krok.
2. Uživatel vyplní data → odešle.
3. Backend provede validaci.
4. Pokud OK → krok se označí `valid`, přejde se na další.
5. Pokud ne → krok zůstává `invalid` a vrací chyby.
6. Uložená data se sbírají do `wizard_drafts.payload`.
7. Po validaci všech kroků lze provést **finální uložené operace**.

---

# 6. API přehled

## 6.1 Definice průvodců (volitelné)
```
GET  /api/wizard/definitions
GET  /api/wizard/definitions/{wizard_key}
```

## 6.2 Drafty
```
POST   /api/wizard/drafts               – vytvořit nový draft
GET    /api/wizard/drafts/{id}          – detail draftu
PATCH  /api/wizard/drafts/{id}          – změna stavu draftu
DELETE /api/wizard/drafts/{id}          – zrušit draft
```

## 6.3 Kroky
```
GET  /api/wizard/drafts/{id}/steps                  – seznam kroků
GET  /api/wizard/drafts/{id}/steps/{step_code}      – detail kroku
PUT  /api/wizard/drafts/{id}/steps/{step_code}      – uložit data kroku
```

## 6.4 Dokončení průvodce
```
POST /api/wizard/drafts/{id}/complete
```

---

# 7. Mapování na formuláře a seznamy

Každý krok obsahuje odkaz na:

- `form_code` → reprezentuje **formulář**, který UI vykreslí  
- `list_code` → seznam pro krok založený na výběru více položek  
- `entity_code` → primární entita kroku  
- `tab_code` → pokud krok odpovídá konkrétnímu oušku

Tím je wizard plně kompatibilní se strukturou z Excelu:
- jednotná ouška,
- jednotné seznamy,
- jednotné detailové formuláře.

---

# 8. Dokončení (commit)

Při volání:

```
POST /api/wizard/drafts/{id}/complete
```

Backend:

1. provede kontrolu, zda jsou všechny kroky `valid`,
2. data složí z `wizard_steps.data` a `wizard_drafts.payload`,
3. provede zakládání/editaci entit v **jedné transakci**,
4. uloží stav:
   ```
   status = completed
   meta = {
     "created": { ...id nových záznamů... }
   }
   ```

---

# 9. Výhody systému

- jeden wizard framework pro všechny entity,
- lze přidávat nové průvodce bez psaní backend logiky znovu,
- vždy stejné ovládání (zpět/další),
- možnost rozpracovat a pokračovat později,
- validace na úrovni kroků,
- transakční bezpečnost při finálním uložení,
- čistá integrace s existující strukturou aplikace (ouška / listy / formuláře).

---

# 10. Další kroky

Pokud budeš chtít:

- udělám **SQL soubor ke stažení** s definicí tabulek,
- připravím **flow diagram** wizardu,
- nebo vytvořím **UI mockup**.

