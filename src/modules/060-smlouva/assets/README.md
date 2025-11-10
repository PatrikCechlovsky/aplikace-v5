# Modul 060 - Pronajímatel

> **Správa pronajímatelů** - Komplexní modul pro evidenci a správu všech typů pronajímatelů v systému

---

## 📋 Přehled

Tento modul umožňuje správu subjektů v roli **pronajímatele** (landlord). Podporuje různé typy subjektů od fyzických osob přes firmy až po státní instituce.

### Podporované typy subjektů:

- 🧑 **Osoba** - Fyzická osoba
- 💼 **OSVČ** - Osoba samostatně výdělečně činná
- 🏢 **Firma** - Společnost (s.r.o., a.s., atd.)
- 👥 **Spolek/Skupina** - Nezisková organizace
- 🏛️ **Státní instituce** - Municipality, úřady
- 🤝 **Zástupce** - Osoba zastupující jiný subjekt

---

## 🎯 Hlavní funkce

- ✅ Vytváření, editace a archivace pronajímatelů
- ✅ Filtrování podle typu subjektu
- ✅ Fulltextové vyhledávání (název, email, IČO, telefon)
- ✅ Zobrazení archivovaných záznamů
- ✅ Historie změn (optional)
- ✅ Přílohy k subjektům (optional)
- ✅ Propojení s uživatelskými účty
- ✅ RLS (Row Level Security) na úrovni databáze

---

## 📂 Struktura modulu

```
src/modules/060-smlouva/
├── module.config.js          # Konfigurace modulu, manifest
├── db.js                     # Databázové operace (CRUD)
├── type-schemas.js           # Schémata typů (optional)
├── assets/                   # Dokumentace
│   ├── README.md            # Tento soubor
│   ├── AGENT-SPEC.md        # Kompletní specifikace pro agenta
│   ├── permissions.md       # Oprávnění a role
│   ├── datovy-model.md      # Databázové schéma
│   └── checklist.md         # Implementační checklist
├── tiles/                    # Přehledy
│   ├── prehled.js           # Hlavní přehled (všechny typy)
│   ├── osoba.js             # Filtr: pouze osoby
│   ├── osvc.js              # Filtr: pouze OSVČ
│   ├── firma.js             # Filtr: pouze firmy
│   ├── spolek.js            # Filtr: pouze spolky
│   ├── stat.js              # Filtr: pouze státní instituce
│   └── zastupce.js          # Filtr: pouze zástupci
└── forms/                    # Formuláře
    ├── chooser.js           # Výběr typu při vytváření
    ├── detail.js            # Read-only detail
    └── form.js              # Editace/vytvoření (univerzální)
```

---

## 🚀 Rychlý start

### 1. Přehled pronajímatelů

Otevři modul v sidebaru → Automaticky se načte "Přehled pronajímatelů"

**Funkce:**
- Zobrazení všech pronajímatelů (všechny typy)
- Filtrování podle typu (expandable sidebar)
- Vyhledávání (název, email, IČO, telefon)
- Checkbox "Zobrazit archivované"

**Akce:**
- Přidat nového pronajímatele
- Editovat vybraného pronajímatele
- Archivovat pronajímatele
- Přílohy
- Obnovit data
- Historie změn

### 2. Vytvoření nového pronajímatele

**Krok 1:** Klikni na tlačítko "Přidat" (nebo tile "Nový subjekt")

**Krok 2:** Vyber typ subjektu (chooser)

**Krok 3:** Vyplň formulář podle typu

**Krok 4:** Klikni "Vytvořit"

**Krok 5:** Automatický redirect na detail

### 3. Rychlý test

1) Otevři modul v sidebaru → Otevře se "Přehled pronajímatelů"
2) Dvojklik na řádek → Přepne na detail
3) Klikni "Editovat" → Otevře se formulář
4) Uprav data → Klikni "Uložit"
5) Ověř změny v detailu

---

## 📚 Dokumentace

- **AGENT-SPEC.md** - **KOMPLETNÍ SPECIFIKACE PRO AGENTA** (začni zde!)
- **permissions.md** - Oprávnění a role
- **datovy-model.md** - Databázové schéma a vazby
- **checklist.md** - Implementační checklist

---

**Pro podrobné instrukce viz `AGENT-SPEC.md`**
