# Oprávnění (__MODULE_ID__)
- Role **admin**: čtení + zápis všude
- Role **user**: čtení vlastních dat; zápis podle RLS

## Prefixy (příklad)
- __MODULE_ID__.prehled.read
- __MODULE_ID__.seznam.read
- __MODULE_ID__.detail.read
- __MODULE_ID__.edit.write

> Skutečné názvy slaď s `permissions-catalog.md`.
# Oprávnění (__MODULE_ID__)
- Role **admin**: čtení + zápis všech částí.
- Role **user**: čtení vlastních dat; zápis jen kde je povoleno RLS.

## Mapování (příklad)
- __MODULE_ID__.seznam.read
- __MODULE_ID__.prehled.read
- __MODULE_ID__.detail.read
- __MODULE_ID__.edit.write

> Skutečné názvy práv slaď s `permissions-catalog.md`.

