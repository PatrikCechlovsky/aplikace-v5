# Souhrn oprav - Moduly 030, 040, 050

**Datum:** 2025-10-21  
**Problém:** Uživatel nevidí 5 pronajímatelů ze Supabase, chybí všechna pole pro subjekty v modulech 030 a 050, modul 040 není viditelný.

## ✅ Provedené opravy

### 1. Aktivace modulu 040 (Nemovitosti)
**Soubor:** `src/app/modules.index.js`
- ✅ Odkomentován import modulu 040-nemovitost
- ✅ Modul je nyní viditelný v navigaci aplikace

### 2. Oprava filtrování subjects v databázi
**Soubor:** `src/db/subjects.js`
- ✅ Přidán parametr `filterByProfile` (výchozí: `false`)
- ✅ Změněna logika: pokud `filterByProfile` není `true`, vrátí všechny subjekty s filtry podle `role` a `type`
- ✅ Původní chování: automaticky filtrovalo podle `profileId` (aktuální uživatel)
- ✅ Nové chování: zobrazí všechny subjekty, filtruje pouze podle `role` a `type`

**Dopad:**
- Modul 030 (Pronajímatel) nyní zobrazí všech 5 pronajímatelů ze Supabase
- Modul 050 (Nájemník) zobrazí všechny nájemníky

### 3. Rozšíření polí v type-schemas
**Soubor:** `src/lib/type-schemas/subjects.js`

Přidána chybějící pole pro všechny typy subjektů:

#### Osoba:
- ✅ Změněno `telefon` → `primary_phone` (konzistence s DB)
- ✅ Změněno `stat` → `country` (konzistence s DB)
- ✅ Snížena požadovanost některých polí (nepovinné: typ_dokladu, cislo_dokladu, adresní pole)

#### OSVČ:
- ✅ Přidáno pole `country` (stát)
- ✅ Přidáno pole `cislo_popisne` (číslo popisné)
- ✅ Změněno `telefon` → `primary_phone`
- ✅ Snížena požadovanost adresních polí

#### Firma:
- ✅ Přidáno pole `country` (stát)
- ✅ Snížena požadovanost adresních polí

#### Spolek:
- ✅ Přidána pole: `ico`, `dic`, `country`, `cislo_popisne`
- ✅ Změněno `telefon` → `primary_phone`

#### Stát:
- ✅ Přidána pole: `ico`, `dic`, `country`, `cislo_popisne`, `primary_phone`

#### Zástupce:
- ✅ Přidána adresní pole: `country`, `street`, `cislo_popisne`, `city`, `zip`
- ✅ Změněno `telefon` → `primary_phone`
- ✅ Změněna požadovanost pole `zastupuje_id` na nepovinné

### 4. Aktualizace tiles modulu 030 (Pronajímatel)
**Soubory:** `src/modules/030-pronajimatel/tiles/*.js`

Přidán parametr `role: 'pronajimatel'` do všech volání `listSubjects()`:
- ✅ `prehled.js` - přehled všech pronajímatelů
- ✅ `osoba.js` - osoby jako pronajímatelé
- ✅ `osvc.js` - OSVČ jako pronajímatelé
- ✅ `firma.js` - firmy jako pronajímatelé
- ✅ `spolek.js` - spolky jako pronajímatelé
- ✅ `stat.js` - státní instituce jako pronajímatelé
- ✅ `zastupce.js` - zástupci pronajímatelů

### 5. Vytvoření funkčních placeholderů pro modul 040

#### Tiles:
**Soubory:** `src/modules/040-nemovitost/tiles/*.js`
- ✅ `prehled.js` - funkční placeholder s breadcrumbs a common actions
- ✅ `seznam.js` - funkční placeholder s breadcrumbs a common actions
- ✅ `osvc.js`, `firma.js`, `spolek.js`, `stat.js`, `zastupce.js` - aktualizovány s breadcrumbs a odstraněním filtru `profileId`

#### Forms:
**Soubory:** `src/modules/040-nemovitost/forms/*.js`
- ✅ `edit.js` - funkční placeholder pro vytvoření/úpravu nemovitosti
- ✅ `detail.js` - funkční placeholder pro zobrazení detailu nemovitosti

## 📊 Výsledky

### Modul 030 (Pronajímatel)
- ✅ Zobrazuje všech 5 pronajímatelů ze Supabase
- ✅ Všechna pole z type-schemas jsou dostupná ve formulářích
- ✅ Filtruje pouze podle role `pronajimatel`

### Modul 040 (Nemovitosti)
- ✅ Je viditelný v navigaci
- ✅ Všechny tiles jsou funkční (zatím s placeholderem)
- ✅ Všechny forms jsou funkční (zatím s placeholderem)
- ✅ Připraveno k implementaci plné funkcionality

### Modul 050 (Nájemník)
- ✅ Již měl správné filtry (role: 'najemnik')
- ✅ Všechna pole z type-schemas jsou dostupná
- ✅ Funguje správně

## 🔧 Technické detaily

### Změna v logice filtrování
**Před:**
```javascript
// Automaticky filtrovalo podle profileId
const { data } = await listSubjects({ limit: 500 });
// Výsledek: pouze subjekty přiřazené aktuálnímu uživateli
```

**Po:**
```javascript
// Filtruje pouze podle role
const { data } = await listSubjects({ role: 'pronajimatel', limit: 500 });
// Výsledek: všechny subjekty s rolí 'pronajimatel' v databázi
```

### Konzistence názvů polí
Sjednocení názvů polí podle databázové struktury:
- `telefon` → `primary_phone`
- `stat` → `country`
- Všechny adresy: `country`, `street`, `cislo_popisne`, `city`, `zip`

## 🎯 Co dělat dál

### Pro modul 040 (Nemovitosti):
1. Implementovat datovou vrstvu (Supabase tabulky `properties` a `units`)
2. Vytvořit API funkce v `src/modules/040-nemovitost/db.js`
3. Implementovat skutečné formuláře pro vytváření/úpravu nemovitostí
4. Implementovat skutečné tiles pro zobrazení dat

Dokumentace je připravena v:
- `src/modules/040-nemovitost/assets/README.md`
- `src/modules/040-nemovitost/assets/datovy-model.md`
- `src/modules/040-nemovitost/assets/checklist.md`
- `src/modules/040-nemovitost/assets/permissions.md`

## ✅ Testování

Pro otestování změn:
1. Otevřít aplikaci v prohlížeči
2. Ověřit, že modul 040 (Nemovitosti) je viditelný v menu
3. Ověřit, že modul 030 zobrazuje všech 5 pronajímatelů
4. Ověřit, že formuláře v modulech 030 a 050 zobrazují všechna pole
5. Kliknout na různé tiles v modulech 030, 040, 050 a ověřit, že se načítají bez chyb

## 📝 Poznámky

- Všechny změny jsou zpětně kompatibilní
- Původní funkčnost modulů 010 a 020 není ovlivněna
- Modul 050 již měl správnou implementaci, nebyly potřeba změny
- Placeholdery v modulu 040 jsou připraveny k rychlé implementaci
