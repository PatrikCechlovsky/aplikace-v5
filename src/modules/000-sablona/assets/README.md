# Modul 000-sablona

Tento modul slouzi jako **vzorova sablona** pro vytvareni novych modulu.

## Ucel

- Demonstrovat standardizovanou strukturu modulu
- Ukazat pouziti univerzalniho formularoveho wrapperu
- Poskytnout referencni implementaci pro nove moduly

## Struktura

```
000-sablona/
├── assets/
│   ├── README.md           # Tento soubor
│   ├── checklist.md        # Kontrolni seznam
│   ├── datovy-model.md     # Popis datoveho modelu
│   └── permissions.md      # Popis opravneni
├── forms/
│   ├── detail.js           # Detail (read-only) s renderUniversalForm
│   └── edit.js             # Editace/vytvoreni s renderUniversalForm
├── tiles/
│   ├── prehled.js          # Hlavni prehled
│   └── seznam.js           # Seznam zaznamu
├── services/
│   └── api.js              # API sluzby (demo)
└── module.config.js        # Manifest modulu
```

## Klicove vlastnosti

### Univerzalni formularovy wrapper

Oba formulare (`detail.js` a `edit.js`) pouzivaji `renderUniversalForm()`, ktery automaticky zajistuje:

- **Breadcrumbs** (drobeckova navigace)
- **Common Actions** (Ulozit, Zpet, Prilohy, Historie)
- **Unsaved Changes Warning** (varovani pred neulozenymi zmenami)
- **Read-only mode** (pro detail view)
- **Konzistentni UX** napric vsemi moduly

## Pouziti jako sablona

1. Zkopirujte celou slozku jako zaklad pro novy modul
2. Upravte `module.config.js` (id, title, icon, tiles, forms)
3. Upravte schema v `forms/edit.js` podle potreb modulu
4. Implementujte DB funkce (getRecord, upsertRecord, listRecords)
5. Propojte onSave s DB funkcemi
6. Aktualizujte dokumentaci

## Dokumentace

Kompletni dokumentace standardizovane struktury:  
📖 `/docs/standardized-module-structure.md`

## Vyhody

- Zadna duplikace kodu
- Konzistentni UX
- Automaticke funkce (prilohy, historie, breadcrumbs)
- Snadna udrzba
- Rychlejsi vyvoj novych modulu
