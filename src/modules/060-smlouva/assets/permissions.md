# Oprávnění modulu 060-smlouva (Pronajímatel)

## Role a jejich oprávnění

### Role: **admin**
- Plný přístup ke všem funkcím modulu
- Čtení, zápis, editace, archivace, mazání
- Správa všech typů pronajímatelů

### Role: **user**
- Čtení všech pronajímatelů
- Zápis a editace vlastních dat (podle RLS)
- Možnost vytvářet nové záznamy
- NELZE archivovat nebo mazat

### Role: **viewer**
- Pouze čtení všech dat
- NELZE upravovat, vytvářet ani mazat

## Mapování oprávnění

### Přehledy (Tiles)
- `060-smlouva.prehled.read` - Čtení hlavního přehledu
- `060-smlouva.osoba.read` - Čtení přehledu osob
- `060-smlouva.osvc.read` - Čtení přehledu OSVČ
- `060-smlouva.firma.read` - Čtení přehledu firem
- `060-smlouva.spolek.read` - Čtení přehledu spolků
- `060-smlouva.stat.read` - Čtení přehledu státních institucí
- `060-smlouva.zastupce.read` - Čtení přehledu zástupců

### Formuláře (Forms)
- `060-smlouva.detail.read` - Čtení detailu pronajímatele
- `060-smlouva.chooser.read` - Přístup k výběru typu subjektu
- `060-smlouva.edit.write` - Editace existujícího pronajímatele
- `060-smlouva.create.write` - Vytvoření nového pronajímatele

### Akce
- `060-smlouva.archive.write` - Archivace pronajímatele (pouze admin)
- `060-smlouva.delete.write` - Smazání pronajímatele (pouze admin)
- `060-smlouva.attach.write` - Správa příloh
- `060-smlouva.history.read` - Zobrazení historie změn

## RLS (Row Level Security)

### Tabulka: subjects
- **SELECT**: Všichni přihlášení uživatelé (auth.uid() IS NOT NULL)
- **INSERT**: Admin nebo uživatel s oprávněním `subjects.create`
- **UPDATE**: Admin nebo vlastník dat (přes user_subjects)
- **DELETE**: Pouze admin (doporučeno používat soft delete = archived)

## Poznámky
- Všechna oprávnění jsou kontrolována na úrovni databáze (RLS policies)
- Frontend kontrola oprávnění je pouze pro UX (skrytí tlačítek)
- Backend validace je VŽDY primární

