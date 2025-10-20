# Test moduly - Návod k použití

## Přístup k testovacímu modulu

Po přihlášení do aplikace (app.html):

1. V levém sidebaru najdete položku **"Test moduly"** s ikonou 🧪
2. Kliknutím na ni otevřete modul

## Dostupné sekce

### Tiles (Dlaždice)
- **Přehled** - úvodní stránka s popisem testovacího modulu
- **Seznam** - tabulka s testovacími položkami
  - Dvojklik na řádek otevře detail

### Forms (Formuláře)
- **Detail** - zobrazení detailu testovací položky (read-only)
- **Editace** - formulář pro vytvoření/úpravu testovací položky

## URL navigace

Modul používá hash routing:
- Přehled: `#/m/999-test-moduly/t/prehled`
- Seznam: `#/m/999-test-moduly/t/seznam`
- Detail: `#/m/999-test-moduly/f/detail?id=1`
- Editace: `#/m/999-test-moduly/f/edit?id=1`

## Účel

Tento modul je určen pro:
- ✅ Testování nových funkcí
- ✅ Experimentování s UI komponentami
- ✅ Ověřování integrace
- ✅ Vývojové účely
- ✅ Rychlé prototypování

## Poznámky

- Všechna data jsou simulovaná (není propojeno s databází)
- Modul je izolovaný a neovlivňuje ostatní části aplikace
- Můžete volně upravovat obsah pro své testovací potřeby
