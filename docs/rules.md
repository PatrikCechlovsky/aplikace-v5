# Pravidla pro app v5 (živé)

Tento dokument je závazný pro v5. Historii a detaily necháváme v `docs/archive/v4/*`.

## Struktura modulů
- Každý modul má složku `src/modules/<NNN-nazev>/` se `module.config.js`, `tiles/`, volitelně `forms/`, `services/`.
- ID modulu: tři čísla + kebab-case (např. `010-uzivatele`).
- Dlaždice (tiles) se načítají lazy a přepínají bez reloadu.

> Detaily a strom modulů viz pův. „struktura-app“ (v4). V5 přebírá obsah, ale UI se renderuje dynamicky a modulárně. :contentReference[oaicite:4]{index=4}

## Ikony a společné akce
- Používáme centrální registr ikon a akčních tlačítek.
- Seznam opakovaných akcí (Přidat, Upravit, Detail, Archivovat, Filtrování, Export, …) je převzat z v4 a průběžně aktualizován. :contentReference[oaicite:5]{index=5}
- V UI používáme komponentu `headerActions` + per-tile akční lištu.

## Oprávnění (roles/permissions)
- Logika oprávnění vychází z katalogu v4 (prefixy `modul.sekce.akce`), který rozšiřujeme dle potřeby. :contentReference[oaicite:6]{index=6}
- V UI platí: co neumožní RLS/policies, **nezobrazujeme** (nebo disable + tooltip proč).

## Dokumentace dlaždic a formulářů
- Každá nová dlaždice/formulář má v `docs/modules/<id>.md` úvodní **checklist** (účel, sloupce, akce, chyby, oprávnění…). Šablona viz v4 checklist. :contentReference[oaicite:7]{index=7}

## UX a navigace
- „Home“ 🏠 vždy vrací na dashboard. Při rozdělané práci se ptáme, zda odejít bez uložení.
- Dvojklik na řádek seznamu → čtecí detail (read), akce vpravo u breadcrumbs.
- Filtrování/řazení: v liště nad tabulkou; u sloupců indikátory směru řazení.

## Stav „dirty“
- `window.AppState.setDirty(true|false)` nastavuje „rozdělanou práci“.
- Při odchodu Home a dalších „navigačních“ akcích z UI vždy kontrolujeme `isDirty()`.

## Kód a styly
- Tailwind utility; vlastní CSS jen lokálně k modulu/komponentě.
- Žádné globální závislosti na externích ikonfontech (emoji/SVG z registru).

## Git a deploy
- 1 malý krok = 1 commit = viditelná změna. Revert je vždy snadný.
- Po commitu automatický deploy na Vercel.

---
### Poznámky k v4
- `struktura-app.md` ponecháme jako zdrojový strom (přeneseme položky postupně). :contentReference[oaicite:8]{index=8}  
- `common-actions.md` používáme jako katalog akcí (průběžně aktualizujeme). :contentReference[oaicite:9]{index=9}  
- `permissions-catalog.md` je master pro názvy práv. :contentReference[oaicite:10]{index=10}  
- `checklist-dlazdice-formular.md` je šablona dokumentace dlaždic/formulářů. :contentReference[oaicite:11]{index=11}
