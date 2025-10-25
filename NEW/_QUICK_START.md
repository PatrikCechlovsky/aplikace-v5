# 🚀 Rychlý Start - NEW Dokumentace

> **Pro okamžitý začátek práce s dokumentací**

---

## 📖 Pro koho je tato dokumentace?

### 1. Předáváš projekt někomu jinému?
👉 **Začni tady:**
- Ukážeš mu `NEW/README.md`
- Řekneš: "Tady je všechno, co potřebuješ"
- Nechej ho projít dokumenty 01-10 v pořadí

### 2. Chceš pokračovat ve vývoji?
👉 **Tvoje cesta:**
1. Přečti `NEW/README.md` (5 min)
2. Prostuduj `01-PREHLED-APLIKACE.md` (15 min)
3. Projdi `02-STRUKTURA-UI.md` (15 min)
4. Když budeš tvořit modul → `08-SABLONA-MODULU.md`
5. Když budeš s Copilotem → `09-NAVOD-COPILOT.md`

### 3. Začínáš úplně znovu?
👉 **Restart projektu:**
1. `NEW/README.md` - orientace
2. `01-PREHLED-APLIKACE.md` - co aplikace dělá
3. `07-DATABASE-SCHEMA.md` - databáze
4. `08-SABLONA-MODULU.md` - jak vytvářet moduly
5. `10-CHECKLIST-PRAVIDLA.md` - pravidla a standardy

---

## 📊 Struktura dokumentace

```
NEW/
├── README.md                          ← ZAČNI TADY
├── 01-PREHLED-APLIKACE.md            ← Co aplikace dělá
├── 02-STRUKTURA-UI.md                ← Jak funguje UI
├── 03-BEZPECNOST-AUTENTIZACE.md      ← Auth, 2FA, RLS
├── 04-VZOROVE-FORMULARE.md           ← Jak tvořit formuláře
├── 05-VZOROVE-PREHLEDY.md            ← Jak tvořit přehledy
├── 06-HISTORIE-PRILOHY.md            ← Historie a attachments
├── 07-DATABASE-SCHEMA.md             ← Databázové schéma
├── 08-SABLONA-MODULU.md              ← Jak vytvořit modul
├── 09-NAVOD-COPILOT.md               ← Práce s AI
└── 10-CHECKLIST-PRAVIDLA.md          ← Pravidla a checklisty
```

---

## ⚡ Nejčastější úkoly

### Vytvořit nový modul?
```
📖 Čti: 08-SABLONA-MODULU.md
🔍 Vzor: src/modules/010-sprava-uzivatelu/
✅ Checklist: 10-CHECKLIST-PRAVIDLA.md (sekce "Checklist Nového Modulu")
```

### Vytvořit formulář?
```
📖 Čti: 04-VZOROVE-FORMULARE.md
🔍 Vzor: src/modules/010-sprava-uzivatelu/forms/form.js
✅ Checklist: 10-CHECKLIST-PRAVIDLA.md (sekce "Checklist Formuláře")
```

### Vytvořit přehled (tile)?
```
📖 Čti: 05-VZOROVE-PREHLEDY.md
🔍 Vzor: src/modules/010-sprava-uzivatelu/tiles/prehled.js
✅ Checklist: 10-CHECKLIST-PRAVIDLA.md (sekce "Checklist Přehledu")
```

### Upravit databázi?
```
📖 Čti: 07-DATABASE-SCHEMA.md
🔍 Vzor: Tam najdeš všechny tabulky a RLS policies
⚠️ Vždy aktualizuj dokumentaci po změně!
```

### Pracovat s GitHub Copilotem?
```
📖 Čti: 09-NAVOD-COPILOT.md
💡 Tipy: Používej specifické prompty s kontextem
🔍 Vzor: "Vytvoř [co] podle [odkaz na vzor] s [parametry]"
```

---

## 🎯 3 Zlatá pravidla

### 1. VŽDY používej modul 010 jako vzor
```
src/modules/010-sprava-uzivatelu/
└── Je to referenční modul s best practices
```

### 2. VŽDY aktualizuj dokumentaci
```
Změnil kód? → Aktualizuj dokumentaci
Přidal modul? → Aktualizuj README.md
Změnil DB? → Aktualizuj 07-DATABASE-SCHEMA.md
```

### 3. VŽDY testuj
```
Před commitem:
✅ Otevři aplikaci v prohlížeči
✅ Projdi všechny view
✅ Zkus všechny akce
✅ Zkontroluj console (žádné errory)
```

---

## 📈 Roadmap

### Co je hotovo? ✅
- Modul 010 (Uživatelé) - 95%
- Modul 040 (Nemovitosti) - 90%
- Dokumentace - 100% ✅

### Co chybí? 🔨
- Modul 060 (Smlouvy) - priorita
- Modul 080 (Platby) - priorita
- Historie ve všech modulech
- 2FA autentizace

### Kam směřujeme? 🚀
- Kompletní systém pro správu pronájmů
- Mobilní verze (PWA)
- Automatizace (faktury, upomínky)
- Reporting a analytics

---

## 💡 Tipy pro úspěch

### Pro vývojáře:
✅ Čti dokumentaci postupně (ne najednou)  
✅ Praktikuj - vytvoř testovací modul  
✅ Ptej se, když nevíš (dokumentace není dokonalá)  
✅ Aktualizuj dokumentaci, když objevíš nepřesnosti  

### Pro GitHub Copilot:
✅ Dávej mu kontext (odkaz na vzorový kód)  
✅ Buď specifický v popisech  
✅ Vždy testuj vygenerovaný kód  
✅ Neakceptuj slepě každý návrh  

### Pro projekt:
✅ Commituj často (malé commity)  
✅ Popisné commit messages  
✅ Testuj před pushem  
✅ Code review (pokud tým)  

---

## 🆘 Pomoc a podpora

### Otázky?
1. Nejprve zkontroluj dokumentaci v NEW/
2. Podívej se na vzorový modul 010
3. Zkontroluj archive/ a docs/ (stará dokumentace)

### Chyba v dokumentaci?
1. Oprav ji sám
2. Nebo vytvoř issue na GitHubu
3. Nebo nech poznámku v kódu

### Potřebuješ přidat něco do dokumentace?
1. Edituj odpovídající .md soubor v NEW/
2. Commitni s popisnou zprávou
3. Updatni README.md pokud přidáváš nový soubor

---

## 🎓 Závěr

**Dokumentace je živý dokument!**
- Aktualizuj ji při změnách
- Doplňuj ji o nové poznatky
- Opravuj chyby

**Vše co potřebuješ je v NEW/ složce.**
- 11 dokumentů
- 6189 řádků
- Kompletní pokrytí

**Hodně štěstí! 🚀**

---

*Vytvořeno: 2025-10-25*  
*GitHub Copilot: v5 dokumentace*
