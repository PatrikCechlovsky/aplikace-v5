# Checklist (000-sablona)

Tento modul slouží jako **šablona/vzor** pro implementaci nových modulů. 
Používá standardizovanou strukturu s univerzálním formulářovým wrapperem.

## Implementováno

- [x] Manifest vyplněn (id, title, icon, defaultTile)
- [x] Tiles: prehled.js, seznam.js
- [x] Forms: detail.js (read-only), edit.js (edit/create)
- [x] Použití univerzálního formulářového wrapperu (`renderUniversalForm`)
- [x] Breadcrumbs automaticky přidávány
- [x] Pravá akční lišta (common actions) automaticky
- [x] Podpora pro přílohy (attachments)
- [x] Podpora pro historii změn
- [x] Načítací/prázdný/chybový stav
- [x] Dokumentace struktury

## Pro skutečný modul by mělo být

- [ ] Oprávnění popsána (permissions.md)
- [ ] Datový model popsán (datovy-model.md)
- [ ] Implementace DB funkcí (get, upsert, list, delete)
- [ ] Propojení s databází místo demo dat
- [ ] Testy (pokud existuje testovací infrastruktura)

## Jak použít jako šablonu

1. Zkopírujte celou složku `000-sablona` jako `XXX-nazev-modulu`
2. Upravte `module.config.js` (id, title, icon)
3. Upravte schéma v `forms/edit.js` a `forms/detail.js`
4. Implementujte DB funkce pro daný modul
5. Propojte onSave handler s DB funkcemi
6. Aktualizujte dokumentaci v `assets/`
7. Zaregistrujte modul v `src/app/modules.index.js`

Více informací: `/docs/standardized-module-structure.md`
