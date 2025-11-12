# Detail Layout – Tabs a Zobrazení Entit

Tento dokument definuje jednotný systém zobrazení detailu entit napříč moduly 030–100.
Obsahuje drobečkovou navigaci, sdílený panel záložek, seznamy s detaily a konfiguraci v Excelu.

---

## 🧭 Breadcrumbs
Zobrazují cestu k aktuální entitě: `Domů › Modul › Entita › Aktivní záložka`
Každý krok je klikací a směřuje na příslušnou sekci. Formát URL: `/m/<module>/<id>?tab=<tabKey>`

---

## 🟩 Panel záložek
Sdílený komponent: **DetailTabsPanel**  
Použit pro moduly: 030, 040, 050, 060, 080, 090, 100

### Seznam záložek
Pronajímatel | Nemovitost | Jednotka | Nájemník | Smlouva | Platby | Finance | Dokumenty | Systém

---

## 📋 Obsah záložky (Seznam + Detail)
Každá záložka zobrazuje dvě části:
1. **Seznam** – max. 10 položek, výška cca 300 px, vlastní scrollbar.
2. **Detail** – formulář nebo přehled první položky ze seznamu.

Pokud je seznam prázdný → text „Žádné položky“ a tlačítko „Přidat“.  
Dvojklik na řádek otevře detail v plném zobrazení.

---

## 🔄 Vazba záložek na moduly

| Modul | Aktivní tab | Připojené záložky |
|--------|--------------|------------------|
| 030 Pronajímatel | Pronajímatel | Nemovitosti, Nájemníci, Smlouvy, Platby, Finance |
| 040 Nemovitost | Nemovitost | Jednotky, Nájemníci, Smlouvy |
| 050 Nájemník | Nájemník | Smlouvy, Platby |
| 060 Smlouva | Smlouva | Nájemníci, Platby |
| 080 Platby | Platby | Smlouvy |
| 090 Finance | Finance | Účty, Transakce |
| 100 Energie | Energie | Spotřeba, Fakturace |

---

## 📘 Konfigurace v Excelu

Tři listy: **Tabs_Config**, **List_Columns**, **Detail_Bindings**  
Umožňují generovat automaticky UI layout.

---
