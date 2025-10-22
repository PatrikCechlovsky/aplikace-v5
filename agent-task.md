# 🟢 Zadání pro agenta — Kompletní standardizace modulů, workflow a UX

Tento dokument shrnuje všechny požadavky na refaktorizaci a vylepšení modulů aplikace v5, zejména pro moduly 030, 040, 050 a všechny budoucí. Úkoly se týkají jednotného UX, workflow, datového modelu a automatizace. Obrázky jsou referenční pro vizuální styl.

## 📋 Rozpracované úkoly

**Všechny úkoly z tohoto dokumentu byly rozpracovány do samostatných souborů s detailními implementačními kroky.**

👉 **Viz: [docs/tasks/README.md](docs/tasks/README.md)** pro kompletní přehled úkolů a implementační plán.

Každý úkol obsahuje:
- Detailní popis a akceptační kritéria
- Implementační kroky s příklady kódu
- Časové odhady
- Priority
- Checklist pro ověření

---

## 1. Každý modul musí mít hlavní sekci "Přehled"
- Každý modul (např. 010, 030, 040, 050...) má hlavní dlaždici/sekci "Přehled", která zobrazuje **seznam všech entit** modulu.
- "Přehled" je vždy první položka v navigaci a defaultní landing sekce.

📝 **Detailní úkol:** [docs/tasks/task-01-prehled-section.md](docs/tasks/task-01-prehled-section.md)

## 2. Vizuální styl "Přehledu" — barevné označení v prvním sloupci
- V tabulce "Přehledu" je v prvním sloupci barevný badge podle typu/role entity (viz ![image2](image2), ![image3](image3), ![image4](image4), ![image7](image7)).
- Badge je stylově jednotný napříč moduly (barvy, tvar, font).
- Pokud badge chybí (viz obrázek ![image7](image7)), doplnit dle standardu modulu 010.

📝 **Detailní úkol:** [docs/tasks/task-02-colored-badges.md](docs/tasks/task-02-colored-badges.md)

## 3. Navigace a breadcrumbs
- Navigace na "Přehled" je jasně označena v sidebaru i breadcrumbs (viz zeleně v ![image3](image3)).
- "Přehled" je defaultní sekce při otevření modulu.

📝 **Detailní úkol:** [docs/tasks/task-03-navigation-breadcrumbs.md](docs/tasks/task-03-navigation-breadcrumbs.md)

## 4. Checkbox "Zobrazit archivované"
- V horní části tabulky je checkbox "Zobrazit archivované" pro zobrazení i archivovaných záznamů (standard napříč moduly).

📝 **Detailní úkol:** [docs/tasks/task-04-archived-checkbox.md](docs/tasks/task-04-archived-checkbox.md)

## 5. Sidebar: Ikonka "+" pro zakládání nových entit
- V sidebaru i horním panelu je vždy viditelná ikonka "+" pro založení nové entity (subjekt, nemovitost, jednotka...), viz ![image4](image4), ![image5](image5).
- Kliknutí na "+" vede na flow pro vytvoření nové entity.

📝 **Detailní úkol:** [docs/tasks/task-05-plus-icon-sidebar.md](docs/tasks/task-05-plus-icon-sidebar.md)

## 6. Logika zakládání: žádné matoucí formuláře v sidebaru
- V sidebaru nebude zbytečně mnoho odkazů na různé typy formulářů.
- Všechny možnosti založení jsou sjednoceny do jednoho flow:
    - Klik na "Nový" nebo "+" → zobrazí se výběr typu (barevná tlačítka, viz ![image6](image6)).
    - Po výběru typu se otevře příslušný formulář pro zadání dat.

📝 **Detailní úkol:** [docs/tasks/task-06-unified-creation-flow.md](docs/tasks/task-06-unified-creation-flow.md)

## 7. Odstranit duplicity "Přehled" vs. "Seznam"
- V modulech, kde existuje současně "Přehled" a "Seznam", sloučit do **jedné sekce "Přehled"**.
- "Seznam" se ruší jako duplicita (viz fialová v ![image7](image7)).

📝 **Detailní úkol:** [docs/tasks/task-07-remove-duplicates.md](docs/tasks/task-07-remove-duplicates.md)

## 8. Datový model pro modul 040 (Nemovitosti + Jednotky)
- Každá jednotka (`units`) musí mít vazbu na nemovitost (`nemovitost_id`).
- Nemovitost může obsahovat žádné, jednu nebo více jednotek podle typu.
- Jednotka může mít přiřazeného pronajímatele a nájemníka (subjekty).
- Validace:
    - U typů, kde nemá smysl mít jednotky (např. garáž), může být jen jedna.
    - U typů, kde je běžné mít více jednotek (bytový dům, pozemek rozdělený na části), umožnit rozšíření.
- UI vždy vede uživatele: založit nemovitost → přidat jednotky → přiřadit pronajímatele/nájemníky.

📝 **Detailní úkol:** [docs/tasks/task-08-data-model-module-040.md](docs/tasks/task-08-data-model-module-040.md)

## 9. Automatické vytvoření jednotky při zakládání nové nemovitosti
- Při vytváření nové nemovitosti se automaticky vytvoří jedna „defaultní“ jednotka odpovídající typu nemovitosti.
- Uživatel může jednotku editovat, archivovat, odstranit a **přidat další jednotky kdykoliv v budoucnu**.
- Implementovat v datové vrstvě i v UI (formulář pro novou nemovitost → backend → vytvoření nemovitosti + jednotky v jedné transakci).

📝 **Detailní úkol:** [docs/tasks/task-09-auto-create-unit.md](docs/tasks/task-09-auto-create-unit.md)

## 10. Tlačítko "Načíst z ARES" — automatické vyplnění firemních údajů
- Ve formuláři pro subjekt (030, 050, další) viditelně zobrazit **velké tlačítko "Načíst z ARES"** (viz ![image8](image8)), ne jen malou lupu.
- Po kliknutí na "Načíst z ARES" se podle IČO (nebo jiného identifikátoru) načtou všechny dostupné údaje z ARES (název, adresa, DIČ, telefon, e-mail...).
- Pole se automaticky vyplní; pokud není IČO vyplněno, zobrazit upozornění.  
- Tlačítko funguje ve všech relevantních modulech a je připraveno pro budoucí rozšíření.

📝 **Detailní úkol:** [docs/tasks/task-10-ares-integration.md](docs/tasks/task-10-ares-integration.md)

---

**Referenční obrázky:**  
- ![image2](image2) | ![image3](image3) | ![image4](image4) | ![image5](image5) | ![image6](image6) | ![image7](image7) | ![image8](image8)

---

**Poznámka:**  
Zadání platí pro všechny existující i budoucí moduly, včetně 030 (pronajímatel), 040 (nemovitost), 050 (nájemník) a dalších.

---

Pokud je třeba zadání rozšířit nebo zpřesnit, doplň další body!
