# Manuální úkoly (pro tebe)

Krátké kroky, které MUSÍŠ udělat přes GitHub UI (agent nemůže):

1) Uzavřít PRs
- PR #7 (copilot/validate-module-structure) — pokud nechceš integrovat, Close PR. Pokud chceš reimplementovat, ignoruj.
- PR #8 (copilot/add-test-module) — Close PR (target branch test-moduly není potřeba).

2) Smazat nepotřebné větve
- Po uzavření PR smaž branches: copilot/add-test-module, copilot/validate-module-structure, test-moduly (přes GitHub UI nebo git push origin --delete ...).

3) Merge / nové PR
- Pokud chceš reimplementovat PR #7: vytvoř novou branch z main (např. feature/reimplement-pr7) a pověř agenta otevřít PR s hotovými změnami.

4) Spustit SQL migraci (Supabase)
- Otevři Supabase → SQL Editor → vlož obsah docs/tasks/supabase-migrations/001_create_properties_and_units.sql → Run.
- Ověř: tabulky properties, units existují; view properties_with_stats existuje; funkce create_property_with_unit existuje.

5) Nasazení
- Po úspěšné migraci a testech: vytvoř release / tag a proveď deploy (Vercel/hosting) podle běžného procesu.

6) Povinné kontroly po změnách
- Projdi quick test (docs/tasks checklist) a odškrtni body.
- Pokud vše OK, merge PR do main a zavřít tento kontrolní PR (#13) nebo jej použít jako integrační PR.
