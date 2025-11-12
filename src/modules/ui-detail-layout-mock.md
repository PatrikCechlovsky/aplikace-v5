# Detail Layout – Kompletní popis a implementační šablona

Tento dokument shrnuje specifikaci "Detail Layout" pro moduly 030–100, pravidla chování UI, konfiguraci (Excel → JSON) a konkrétní implementační postupy a checklisty pro vývojáře/agenty. Vše je v češtině a obsahuje konkrétní příklady.

## 1. Účel
Cíl: zavést jednotné zobrazení detailu entit napříč moduly 030,040,050,060,080,090,100 pomocí sdíleného komponentu DetailTabsPanel (breadcrumbs + panel záložek + seznam + detail). Současně zajistit postupné skrytí (deprekování) původního zobrazení přes feature-flag.

## 2. Shrnutí pravidel (převzato z ui-detail-layout.md)
- URL pattern: /m/<module>/<id>?tab=<tabKey>
- Breadcrumbs: "Domů › Modul › Entita › Aktivní záložka". Každý krok je klikací.
- Sdílený komponent: DetailTabsPanel — používat pro moduly 030,040,050,060,080,090,100.
- Standardní seznam záložek: Pronajímatel | Nemovitost | Jednotka | Nájemník | Smlouva | Platby | Finance | Dokumenty | Systém
- Obsah každé záložky:
  - Seznam (List) — max. 10 položek, výška ~300px, vlastní scrollbar.
  - Detail (Detail pane) — formulář nebo přehled první položky ze seznamu.
- Prázdný seznam → zobrazit text „Žádné položky“ + tlačítko „Přidat“.
- Dvojklik (dblclick) na řádek → otevře detail v plném zobrazení (modal nebo samostatná route).
- Konfigurace UI bude řízena z Excelu s třemi listy: Tabs_Config, List_Columns, Detail_Bindings.

## 3. Vazba záložek na moduly (tabulka)
- 030 Pronajímatel: aktivní tab = Pronajímatel; připojené: Nemovitosti, Nájemníci, Smlouvy, Platby, Finance
- 040 Nemovitost: aktivní tab = Nemovitost; připojené: Jednotky, Nájemníci, Smlouvy
- 050 Nájemník: aktivní tab = Nájemník; připojené: Smlouvy, Platby
- 060 Smlouva: aktivní tab = Smlouva; připojené: Nájemníci, Platby
- 080 Platby: aktivní tab = Platby; připojené: Smlouvy
- 090 Finance: aktivní tab = Finance; připojené: Účty, Transakce
- 100 Energie: aktivní tab = Energie; připojené: Spotřeba, Fakturace

## 4. Excel konfigurace — přehled listů
1. Tabs_Config — řídí pořadí záložek a mapování per modul.
   - Sloupce (doporučeno): module, module_label_CZ, active_tab_key, tab_keys (CSV pořadí), default_tab, permissions_required (CSV)
2. List_Columns — sloupce pro každý seznam (tab).
   - Sloupce: module, tab_key, column_key, label_CZ, field_path, sortable (true/false), width_px (optional), visible (true/false), order
3. Detail_Bindings — mapování polí v detailu.
   - Sloupce: module, tab_key, field_key, label_CZ, binding_path, input_type, readonly (true/false), validation_rules (JSON/string), order

Excel bude parsován do jednotného JSON objektu se třemi poli: tabs_config[], list_columns[], detail_bindings[].

## 5. Implementační architektura (vysoká úroveň)
- Komponenty:
  - Breadcrumbs (reusable)
  - DetailTabsPanel (hlavní shell pro detail entity)
  - TabsBar (vykreslí záložky podle Tabs_Config)
  - ListView (max 10 položek, 300px, vlastní scrollbar, empty state)
  - ItemDetail (bindingy z Detail_Bindings)
  - FullscreenDetail (modal/route při dblclick)
- Konfigurace:
  - Excel → parser → JSON config (endpoint nebo build artifact)
  - Preferovat runtime endpoint GET /api/config/ui/detail-layout pro snadné opravy.

## 6. Feature flag a deprecate existence
- Zavést flag new_detail_layout_enabled (per-module nebo global).
- Když off → staré zobrazení.
- Když on → route /m/<module>/<id> renderuje nový DetailTabsPanel.
- Redirect starých pathů na nový pattern pokud je nutné.
- Neodstraňovat staré komponenty okamžitě — označit jako DEPRECATED, skrýt v UI, po stabilitě odstranit.

## 7. Behavior & UX pravidla (konkrétní)
- List:
  - load max 10 položek (server-side limit nebo client fetch + slice)
  - container height ≈ 300px; vlastní scrollbar
  - řádky: single click = vyber, double click = full detail
  - empty: „Žádné položky“ + tlačítko „Přidat“
- Detail:
  - zobrazí data první položky v seznamu (pokud existuje)
  - edit/save podle oprávnění
- URL deep-linking:
  - /m/030/123?tab=nemovitost&item=987&full=true → otevře tab Nemovitost s active item 987 v full mode
- Accessibility:
  - ARIA labels, keyboard navigace, focus management v modalech

## 8. Testy / QA checklist
- Unit: komponenty Breadcrumbs, DetailTabsPanel, ListView, ItemDetail
- Integration: route rendering, query param ?tab= behavior
- E2E: per-module scénář (open detail, switch tab, select item, dblclick → full)
- Manual: ověřit empty state, limit 10, scroll, deep-linking, oprávnění

## 9. Release plán (shrnutí)
- Branch per feature / monorepo feature branch
- Dev → QA + E2E → Canary (admins) → Full rollout
- Monitorování (Sentry) + metriky UX
- Rollback = vypnutí feature-flag + revert routes

## 10. Parser / API doporučení
- Endpoint: GET /api/config/ui/detail-layout → vrátí JSON config
- Validace: server-side při uploadu Excelu, klient-side při načtení configu
- Fallback: pokud config chybí nebo je nevalidní, použít safe default (minimální tab list a empty-state)

## 11. PR checklist pro agenta
- Přidat: config JSON (z Excelu), frontend komponenty, unit & e2e tests, instrukce zapnutí flagu
- Popis PR: odkaz na tento spec a původní ui-detail-layout.md
- Labels: feature, ui, needs-qa, module-XXX

---

KONEC SPECIFIKACE — níže jsou přiloženy tři CSV "listy" (tabs, list_columns, detail_bindings) s příklady řádků a JSON Schema pro validaci configu.
