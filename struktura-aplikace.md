# Struktura aplikace - Analýza modulů

> **Tento soubor je automaticky generován.** Spustit: `node analyze-structure.js`

Poslední aktualizace: 30. 10. 2025 13:30:38

## Obsah

- [Uživatelé (010-sprava-uzivatelu)](#010spravauzivatelu)
- [Můj účet (020-muj-ucet)](#020mujucet)
- [Pronajímatel (030-pronajimatel)](#030pronajimatel)
- [Přehled (040-nemovitost)](#040nemovitost)
- [Nájemník (050-najemnik)](#050najemnik)
- [Smlouvy (060-smlouva)](#060smlouva)
- [Služby (070-sluzby)](#070sluzby)
- [Platby (080-platby)](#080platby)

---

## Uživatelé (010-sprava-uzivatelu)

**Ikona modulu:** `users`

### Přehledy (Tiles)

#### Přehled (`prehled`)
- **Ikona:** `list`
- **Akce:** add, edit, archive, attach, refresh
- **Sloupce:**

| Klíč | Název | Šířka | Řazení |
|------|-------|-------|--------|
| `role` | Role | 15% | Ano |
| `display_name` | Jméno | 25% | Ano |
| `email` | E-mail | 25% | Ano |
| `archivedLabel` | Archivován | 10% | Ano |

### Formuláře (Forms)

#### Formulář (`form`)
- **Ikona:** `form`
- **Pole:**

| Klíč | Název | Typ |
|------|-------|-----|
| `display_name` | Jméno a příjmení | `text` |
| `titul_pred` | Titul před jménem | `text` |
| `jmeno` | Křestní jméno | `text` |
| `prijmeni` | Příjmení | `text` |
| `titul_za` | Titul za jménem | `text` |
| `typ_dokladu` | Typ dokladu | `select` |
| `ico` | IČO | `text` |
| `dic` | DIČ | `text` |
| `primary_phone` | Telefon | `text` |
| `primary_email` | E-mail | `email` |
| `country` | Stát | `text` |
| `street` | Ulice | `text` |
| `cislo_popisne` | Číslo popisné | `text` |
| `city` | Město | `text` |
| `zip` | PSČ | `text` |
| `bankovni_ucet` | Bankovní účet / číslo | `text` |
| `zastupuje_id` | Zastupuje (ID subjektu) | `text` |

#### Nový / Pozvat (`create`)
- **Ikona:** `add`
- **Akce:** invite
- **Pole:**

| Klíč | Název | Typ |
|------|-------|-----|
| `display_name` | Jméno a příjmení | `text` |
| `titul_pred` | Titul před jménem | `text` |
| `jmeno` | Křestní jméno | `text` |
| `prijmeni` | Příjmení | `text` |
| `titul_za` | Titul za jménem | `text` |
| `typ_dokladu` | Typ dokladu | `select` |
| `ico` | IČO | `text` |
| `dic` | DIČ | `text` |
| `primary_phone` | Telefon | `text` |
| `primary_email` | E-mail | `email` |
| `country` | Stát | `text` |
| `street` | Ulice | `text` |
| `cislo_popisne` | Číslo popisné | `text` |
| `city` | Město | `text` |
| `zip` | PSČ | `text` |
| `bankovni_ucet` | Bankovní účet / číslo | `text` |
| `zastupuje_id` | Zastupuje (ID subjektu) | `text` |

#### Role & barvy (`role`)
- **Ikona:** `settings`
- **Akce:** save, delete, reject
- **Pole:**

| Klíč | Název | Typ |
|------|-------|-----|
| `display_name` | Jméno a příjmení | `text` |
| `titul_pred` | Titul před jménem | `text` |
| `jmeno` | Křestní jméno | `text` |
| `prijmeni` | Příjmení | `text` |
| `titul_za` | Titul za jménem | `text` |
| `typ_dokladu` | Typ dokladu | `select` |
| `ico` | IČO | `text` |
| `dic` | DIČ | `text` |
| `primary_phone` | Telefon | `text` |
| `primary_email` | E-mail | `email` |
| `country` | Stát | `text` |
| `street` | Ulice | `text` |
| `cislo_popisne` | Číslo popisné | `text` |
| `city` | Město | `text` |
| `zip` | PSČ | `text` |
| `bankovni_ucet` | Bankovní účet / číslo | `text` |
| `zastupuje_id` | Zastupuje (ID subjektu) | `text` |

---

## Můj účet (020-muj-ucet)

**Ikona modulu:** `account`

### Formuláře (Forms)

#### Upravit profil (`form`)
- **Ikona:** `account`
- **Akce:** save, reject
- **Pole:**

| Klíč | Název | Typ |
|------|-------|-----|
| `display_name` | Jméno a příjmení | `text` |
| `titul_pred` | Titul před jménem | `text` |
| `jmeno` | Křestní jméno | `text` |
| `prijmeni` | Příjmení | `text` |
| `titul_za` | Titul za jménem | `text` |
| `typ_dokladu` | Typ dokladu | `select` |
| `ico` | IČO | `text` |
| `dic` | DIČ | `text` |
| `primary_phone` | Telefon | `text` |
| `primary_email` | E-mail | `email` |
| `country` | Stát | `text` |
| `street` | Ulice | `text` |
| `cislo_popisne` | Číslo popisné | `text` |
| `city` | Město | `text` |
| `zip` | PSČ | `text` |
| `bankovni_ucet` | Bankovní účet / číslo | `text` |
| `zastupuje_id` | Zastupuje (ID subjektu) | `text` |

---

## Pronajímatel (030-pronajimatel)

**Ikona modulu:** `home`

### Přehledy (Tiles)

#### Přehled (`prehled`)
- **Ikona:** `list`
- **Akce:** add, edit, archive, attach, refresh, history
- **Sloupce:**

| Klíč | Název | Šířka | Řazení |
|------|-------|-------|--------|
| `typ_subjektu` | Typ | 10% | Ano |
| `display_name` | Název / Jméno | 20% | Ne |
| `ico` | IČO | 10% | Ne |
| `primary_phone` | Telefon | 15% | Ne |
| `primary_email` | Email | 18% | Ne |
| `city` | Město | 15% | Ne |
| `archivedLabel` | Archivován | 10% | Ne |

#### Osoba (`osoba`)
- **Ikona:** `person`
- **Akce:** add, edit, archive, attach, refresh, history
- **Sloupce:**

| Klíč | Název | Šířka | Řazení |
|------|-------|-------|--------|
| `id` | ID | - | Ne |
| `display_name` | Jméno | - | Ne |
| `primary_email` | E-mail | - | Ne |
| `primary_phone` | Telefon | - | Ne |
| `city` | Město | - | Ne |

#### OSVČ (`osvc`)
- **Ikona:** `briefcase`
- **Akce:** add, edit, archive, attach, refresh, history
- **Sloupce:**

| Klíč | Název | Šířka | Řazení |
|------|-------|-------|--------|
| `display_name` | Jméno / Firma | - | Ne |
| `ico` | IČO | - | Ne |
| `primary_email` | E-mail | - | Ne |
| `primary_phone` | Telefon | - | Ne |

#### Firma (`firma`)
- **Ikona:** `building`
- **Akce:** add, edit, archive, attach, refresh, history
- **Sloupce:**

| Klíč | Název | Šířka | Řazení |
|------|-------|-------|--------|
| `id` | ID | - | Ne |
| `display_name` | Firma | - | Ne |
| `ico` | IČO | - | Ne |
| `primary_email` | E-mail | - | Ne |
| `primary_phone` | Telefon | - | Ne |
| `city` | Město | - | Ne |

#### Spolek / Skupina (`spolek`)
- **Ikona:** `people`
- **Akce:** add, edit, archive, attach, refresh, history
- **Sloupce:**

| Klíč | Název | Šířka | Řazení |
|------|-------|-------|--------|
| `display_name` | Název | - | Ne |
| `primary_email` | E-mail | - | Ne |
| `primary_phone` | Telefon | - | Ne |

#### Státní instituce (`stat`)
- **Ikona:** `bank`
- **Akce:** add, edit, archive, attach, refresh, history
- **Sloupce:**

| Klíč | Název | Šířka | Řazení |
|------|-------|-------|--------|
| `display_name` | Název | - | Ne |
| `primary_email` | E-mail | - | Ne |
| `city` | Město | - | Ne |

#### Zástupci (`zastupce`)
- **Ikona:** `handshake`
- **Akce:** add, edit, archive, attach, refresh, history
- **Sloupce:**

| Klíč | Název | Šířka | Řazení |
|------|-------|-------|--------|
| `display_name` | Jméno zástupce | - | Ne |
| `zastupuje_id` | Zastupuje (ID) | - | Ne |
| `primary_email` | E-mail | - | Ne |
| `primary_phone` | Telefon | - | Ne |

#### Nový subjekt (`novy`)
- **Ikona:** `add`

### Formuláře (Forms)

#### Nový subjekt (`chooser`)
- **Ikona:** `add`

#### Detail pronajímatele (`detail`)
- **Ikona:** `view`
- **Akce:** edit, attach, archive, history

#### Formulář (`form`)
- **Ikona:** `form`
- **Akce:** archive, attach, history, save

---

## Přehled (040-nemovitost)

**Ikona modulu:** `list`

### Formuláře (Forms)

#### Nová nemovitost (`chooser`)
- **Ikona:** `add`
- **Pole:**

| Klíč | Název | Typ |
|------|-------|-----|
| `nazev` | Název nemovitosti | `text` |
| `typ_nemovitosti` | Typ nemovitosti | `select` |
| `ulice` | Ulice | `text` |
| `cislo_popisne` | Číslo popisné | `text` |
| `cislo_orientacni` | Číslo orientační | `text` |
| `mesto` | Město | `text` |
| `psc` | PSČ | `text` |
| `kraj` | Kraj | `text` |
| `stat` | Stát | `text` |
| `pocet_podlazi` | Počet podlaží | `number` |
| `pocet_podzemních_podlazi` | Počet podzemních podlaží | `number` |
| `rok_vystavby` | Rok výstavby | `number` |
| `rok_rekonstrukce` | Rok rekonstrukce | `number` |
| `celkova_plocha` | Celková plocha (m²) | `number` |
| `pocet_jednotek` | Počet jednotek | `number` |
| `spravce` | Správce | `text` |
| `pronajimatel_id` | Pronajímatel | `chooser` |
| `poznamky` | Poznámka | `textarea` |
| `vybaveni` | Vybavení | `text` |
| `prilohy` | Přílohy | `text` |
| `pronajimatel` | Pronajímatel (legacy) | `text` |
| `archived` | Archivní | `checkbox` |
| `archivedLabel` | Archivní (text) | `text` |
| `updated_at` | Poslední úprava | `label` |
| `updated_by` | Upravil | `label` |
| `created_at` | Vytvořen | `label` |

#### Nová jednotka (`unit-chooser`)
- **Ikona:** `add`
- **Pole:**

| Klíč | Název | Typ |
|------|-------|-----|
| `nazev` | Název nemovitosti | `text` |
| `typ_nemovitosti` | Typ nemovitosti | `select` |
| `ulice` | Ulice | `text` |
| `cislo_popisne` | Číslo popisné | `text` |
| `cislo_orientacni` | Číslo orientační | `text` |
| `mesto` | Město | `text` |
| `psc` | PSČ | `text` |
| `kraj` | Kraj | `text` |
| `stat` | Stát | `text` |
| `pocet_podlazi` | Počet podlaží | `number` |
| `pocet_podzemních_podlazi` | Počet podzemních podlaží | `number` |
| `rok_vystavby` | Rok výstavby | `number` |
| `rok_rekonstrukce` | Rok rekonstrukce | `number` |
| `celkova_plocha` | Celková plocha (m²) | `number` |
| `pocet_jednotek` | Počet jednotek | `number` |
| `spravce` | Správce | `text` |
| `pronajimatel_id` | Pronajímatel | `chooser` |
| `poznamky` | Poznámka | `textarea` |
| `vybaveni` | Vybavení | `text` |
| `prilohy` | Přílohy | `text` |
| `pronajimatel` | Pronajímatel (legacy) | `text` |
| `archived` | Archivní | `checkbox` |
| `archivedLabel` | Archivní (text) | `text` |
| `updated_at` | Poslední úprava | `label` |
| `updated_by` | Upravil | `label` |
| `created_at` | Vytvořen | `label` |

#### Správa typů nemovitostí (`property-type`)
- **Ikona:** `settings`
- **Akce:** add, save, refresh
- **Pole:**

| Klíč | Název | Typ |
|------|-------|-----|
| `nazev` | Název nemovitosti | `text` |
| `typ_nemovitosti` | Typ nemovitosti | `select` |
| `ulice` | Ulice | `text` |
| `cislo_popisne` | Číslo popisné | `text` |
| `cislo_orientacni` | Číslo orientační | `text` |
| `mesto` | Město | `text` |
| `psc` | PSČ | `text` |
| `kraj` | Kraj | `text` |
| `stat` | Stát | `text` |
| `pocet_podlazi` | Počet podlaží | `number` |
| `pocet_podzemních_podlazi` | Počet podzemních podlaží | `number` |
| `rok_vystavby` | Rok výstavby | `number` |
| `rok_rekonstrukce` | Rok rekonstrukce | `number` |
| `celkova_plocha` | Celková plocha (m²) | `number` |
| `pocet_jednotek` | Počet jednotek | `number` |
| `spravce` | Správce | `text` |
| `pronajimatel_id` | Pronajímatel | `chooser` |
| `poznamky` | Poznámka | `textarea` |
| `vybaveni` | Vybavení | `text` |
| `prilohy` | Přílohy | `text` |
| `pronajimatel` | Pronajímatel (legacy) | `text` |
| `archived` | Archivní | `checkbox` |
| `archivedLabel` | Archivní (text) | `text` |
| `updated_at` | Poslední úprava | `label` |
| `updated_by` | Upravil | `label` |
| `created_at` | Vytvořen | `label` |

#### Správa typů jednotek (`unit-type`)
- **Ikona:** `settings`
- **Akce:** add, save, refresh
- **Pole:**

| Klíč | Název | Typ |
|------|-------|-----|
| `nazev` | Název nemovitosti | `text` |
| `typ_nemovitosti` | Typ nemovitosti | `select` |
| `ulice` | Ulice | `text` |
| `cislo_popisne` | Číslo popisné | `text` |
| `cislo_orientacni` | Číslo orientační | `text` |
| `mesto` | Město | `text` |
| `psc` | PSČ | `text` |
| `kraj` | Kraj | `text` |
| `stat` | Stát | `text` |
| `pocet_podlazi` | Počet podlaží | `number` |
| `pocet_podzemních_podlazi` | Počet podzemních podlaží | `number` |
| `rok_vystavby` | Rok výstavby | `number` |
| `rok_rekonstrukce` | Rok rekonstrukce | `number` |
| `celkova_plocha` | Celková plocha (m²) | `number` |
| `pocet_jednotek` | Počet jednotek | `number` |
| `spravce` | Správce | `text` |
| `pronajimatel_id` | Pronajímatel | `chooser` |
| `poznamky` | Poznámka | `textarea` |
| `vybaveni` | Vybavení | `text` |
| `prilohy` | Přílohy | `text` |
| `pronajimatel` | Pronajímatel (legacy) | `text` |
| `archived` | Archivní | `checkbox` |
| `archivedLabel` | Archivní (text) | `text` |
| `updated_at` | Poslední úprava | `label` |
| `updated_by` | Upravil | `label` |
| `created_at` | Vytvořen | `label` |

#### Editace nemovitosti (`edit`)
- **Ikona:** `edit`
- **Pole:**

| Klíč | Název | Typ |
|------|-------|-----|
| `nazev` | Název nemovitosti | `text` |
| `typ_nemovitosti` | Typ nemovitosti | `select` |
| `ulice` | Ulice | `text` |
| `cislo_popisne` | Číslo popisné | `text` |
| `cislo_orientacni` | Číslo orientační | `text` |
| `mesto` | Město | `text` |
| `psc` | PSČ | `text` |
| `kraj` | Kraj | `text` |
| `stat` | Stát | `text` |
| `pocet_podlazi` | Počet podlaží | `number` |
| `pocet_podzemních_podlazi` | Počet podzemních podlaží | `number` |
| `rok_vystavby` | Rok výstavby | `number` |
| `rok_rekonstrukce` | Rok rekonstrukce | `number` |
| `celkova_plocha` | Celková plocha (m²) | `number` |
| `pocet_jednotek` | Počet jednotek | `number` |
| `spravce` | Správce | `text` |
| `pronajimatel_id` | Pronajímatel | `chooser` |
| `poznamky` | Poznámka | `textarea` |
| `vybaveni` | Vybavení | `text` |
| `prilohy` | Přílohy | `text` |
| `pronajimatel` | Pronajímatel (legacy) | `text` |
| `archived` | Archivní | `checkbox` |
| `archivedLabel` | Archivní (text) | `text` |
| `updated_at` | Poslední úprava | `label` |
| `updated_by` | Upravil | `label` |
| `created_at` | Vytvořen | `label` |

#### Detail nemovitosti (`detail`)
- **Ikona:** `eye`
- **Pole:**

| Klíč | Název | Typ |
|------|-------|-----|
| `nazev` | Název nemovitosti | `text` |
| `typ_nemovitosti` | Typ nemovitosti | `select` |
| `ulice` | Ulice | `text` |
| `cislo_popisne` | Číslo popisné | `text` |
| `cislo_orientacni` | Číslo orientační | `text` |
| `mesto` | Město | `text` |
| `psc` | PSČ | `text` |
| `kraj` | Kraj | `text` |
| `stat` | Stát | `text` |
| `pocet_podlazi` | Počet podlaží | `number` |
| `pocet_podzemních_podlazi` | Počet podzemních podlaží | `number` |
| `rok_vystavby` | Rok výstavby | `number` |
| `rok_rekonstrukce` | Rok rekonstrukce | `number` |
| `celkova_plocha` | Celková plocha (m²) | `number` |
| `pocet_jednotek` | Počet jednotek | `number` |
| `spravce` | Správce | `text` |
| `pronajimatel_id` | Pronajímatel | `chooser` |
| `poznamky` | Poznámka | `textarea` |
| `vybaveni` | Vybavení | `text` |
| `prilohy` | Přílohy | `text` |
| `pronajimatel` | Pronajímatel (legacy) | `text` |
| `archived` | Archivní | `checkbox` |
| `archivedLabel` | Archivní (text) | `text` |
| `updated_at` | Poslední úprava | `label` |
| `updated_by` | Upravil | `label` |
| `created_at` | Vytvořen | `label` |

#### Editace jednotky (`unit-edit`)
- **Ikona:** `edit`
- **Pole:**

| Klíč | Název | Typ |
|------|-------|-----|
| `nazev` | Název nemovitosti | `text` |
| `typ_nemovitosti` | Typ nemovitosti | `select` |
| `ulice` | Ulice | `text` |
| `cislo_popisne` | Číslo popisné | `text` |
| `cislo_orientacni` | Číslo orientační | `text` |
| `mesto` | Město | `text` |
| `psc` | PSČ | `text` |
| `kraj` | Kraj | `text` |
| `stat` | Stát | `text` |
| `pocet_podlazi` | Počet podlaží | `number` |
| `pocet_podzemních_podlazi` | Počet podzemních podlaží | `number` |
| `rok_vystavby` | Rok výstavby | `number` |
| `rok_rekonstrukce` | Rok rekonstrukce | `number` |
| `celkova_plocha` | Celková plocha (m²) | `number` |
| `pocet_jednotek` | Počet jednotek | `number` |
| `spravce` | Správce | `text` |
| `pronajimatel_id` | Pronajímatel | `chooser` |
| `poznamky` | Poznámka | `textarea` |
| `vybaveni` | Vybavení | `text` |
| `prilohy` | Přílohy | `text` |
| `pronajimatel` | Pronajímatel (legacy) | `text` |
| `archived` | Archivní | `checkbox` |
| `archivedLabel` | Archivní (text) | `text` |
| `updated_at` | Poslední úprava | `label` |
| `updated_by` | Upravil | `label` |
| `created_at` | Vytvořen | `label` |

#### Detail jednotky (`unit-detail`)
- **Ikona:** `eye`
- **Pole:**

| Klíč | Název | Typ |
|------|-------|-----|
| `nazev` | Název nemovitosti | `text` |
| `typ_nemovitosti` | Typ nemovitosti | `select` |
| `ulice` | Ulice | `text` |
| `cislo_popisne` | Číslo popisné | `text` |
| `cislo_orientacni` | Číslo orientační | `text` |
| `mesto` | Město | `text` |
| `psc` | PSČ | `text` |
| `kraj` | Kraj | `text` |
| `stat` | Stát | `text` |
| `pocet_podlazi` | Počet podlaží | `number` |
| `pocet_podzemních_podlazi` | Počet podzemních podlaží | `number` |
| `rok_vystavby` | Rok výstavby | `number` |
| `rok_rekonstrukce` | Rok rekonstrukce | `number` |
| `celkova_plocha` | Celková plocha (m²) | `number` |
| `pocet_jednotek` | Počet jednotek | `number` |
| `spravce` | Správce | `text` |
| `pronajimatel_id` | Pronajímatel | `chooser` |
| `poznamky` | Poznámka | `textarea` |
| `vybaveni` | Vybavení | `text` |
| `prilohy` | Přílohy | `text` |
| `pronajimatel` | Pronajímatel (legacy) | `text` |
| `archived` | Archivní | `checkbox` |
| `archivedLabel` | Archivní (text) | `text` |
| `updated_at` | Poslední úprava | `label` |
| `updated_by` | Upravil | `label` |
| `created_at` | Vytvořen | `label` |

---

## Nájemník (050-najemnik)

**Ikona modulu:** `users`

### Přehledy (Tiles)

#### Přehled (`prehled`)
- **Ikona:** `list`
- **Akce:** add, edit, archive, attach, refresh, history
- **Sloupce:**

| Klíč | Název | Šířka | Řazení |
|------|-------|-------|--------|
| `typ_subjektu` | Typ | 10% | Ano |
| `display_name` | Název / Jméno | 20% | Ne |
| `ico` | IČO | 10% | Ne |
| `primary_email` | E-mail | 18% | Ne |
| `primary_phone` | Telefon | 15% | Ne |
| `city` | Město | 15% | Ne |
| `archivedLabel` | Archivován | 10% | Ne |

#### Osoba (`osoba`)
- **Ikona:** `person`
- **Akce:** add, edit, archive, attach, refresh, history
- **Sloupce:**

| Klíč | Název | Šířka | Řazení |
|------|-------|-------|--------|
| `display_name` | Jméno | - | Ne |
| `primary_email` | E-mail | - | Ne |
| `primary_phone` | Telefon | - | Ne |

#### OSVČ (`osvc`)
- **Ikona:** `briefcase`
- **Akce:** add, edit, archive, attach, refresh, history
- **Sloupce:**

| Klíč | Název | Šířka | Řazení |
|------|-------|-------|--------|
| `display_name` | Jméno / Firma | - | Ne |
| `ico` | IČO | - | Ne |
| `primary_email` | E-mail | - | Ne |
| `primary_phone` | Telefon | - | Ne |

#### Firma (`firma`)
- **Ikona:** `building`
- **Akce:** add, edit, archive, attach, refresh, history
- **Sloupce:**

| Klíč | Název | Šířka | Řazení |
|------|-------|-------|--------|
| `id` | ID | - | Ne |
| `display_name` | Firma | - | Ne |
| `ico` | IČO | - | Ne |
| `primary_email` | Email | - | Ne |
| `primary_phone` | Telefon | - | Ne |
| `city` | Město | - | Ne |

#### Spolek / Skupina (`spolek`)
- **Ikona:** `people`
- **Akce:** add, edit, archive, attach, refresh, history
- **Sloupce:**

| Klíč | Název | Šířka | Řazení |
|------|-------|-------|--------|
| `display_name` | Název | - | Ne |
| `primary_email` | E-mail | - | Ne |
| `primary_phone` | Telefon | - | Ne |

#### Státní instituce (`stat`)
- **Ikona:** `bank`
- **Akce:** add, edit, archive, attach, refresh, history
- **Sloupce:**

| Klíč | Název | Šířka | Řazení |
|------|-------|-------|--------|
| `display_name` | Název | - | Ne |
| `primary_email` | E-mail | - | Ne |
| `city` | Město | - | Ne |

#### Zástupci (`zastupce`)
- **Ikona:** `handshake`
- **Akce:** add, edit, archive, attach, refresh, history
- **Sloupce:**

| Klíč | Název | Šířka | Řazení |
|------|-------|-------|--------|
| `display_name` | Jméno zástupce | - | Ne |
| `zastupuje_id` | Zastupuje (ID) | - | Ne |
| `primary_email` | E-mail | - | Ne |
| `primary_phone` | Telefon | - | Ne |

### Formuláře (Forms)

#### Nový nájemník (`chooser`)
- **Ikona:** `grid`

#### Detail nájemníka (`detail`)
- **Ikona:** `view`
- **Akce:** edit, attach, archive, history

#### Formulář (`form`)
- **Ikona:** `form`
- **Akce:** archive, attach, history, save

---

## Smlouvy (060-smlouva)

**Ikona modulu:** `description`

### Přehledy (Tiles)

#### Přehled (`prehled`)
- **Ikona:** `list`

#### Aktivní (`aktivni`)
- **Ikona:** `check_circle`

#### Koncepty (`koncepty`)
- **Ikona:** `draft`

#### Expirující (`expirujici`)
- **Ikona:** `warning`

#### Ukončené (`ukoncene`)
- **Ikona:** `archive`

### Formuláře (Forms)

#### Detail smlouvy (`detail`)
- **Ikona:** `visibility`
- **Akce:** edit, attach, archive
- **Pole:**

| Klíč | Název | Typ |
|------|-------|-----|
| `display_name` | Jméno a příjmení | `text` |
| `titul_pred` | Titul před jménem | `text` |
| `jmeno` | Křestní jméno | `text` |
| `prijmeni` | Příjmení | `text` |
| `titul_za` | Titul za jménem | `text` |
| `typ_dokladu` | Typ dokladu | `select` |
| `ico` | IČO | `text` |
| `dic` | DIČ | `text` |
| `primary_phone` | Telefon | `text` |
| `primary_email` | E-mail | `email` |
| `country` | Stát | `text` |
| `street` | Ulice | `text` |
| `cislo_popisne` | Číslo popisné | `text` |
| `city` | Město | `text` |
| `zip` | PSČ | `text` |
| `bankovni_ucet` | Bankovní účet / číslo | `text` |
| `zastupuje_id` | Zastupuje (ID subjektu) | `text` |

#### Editace smlouvy (`edit`)
- **Ikona:** `edit`
- **Pole:**

| Klíč | Název | Typ |
|------|-------|-----|
| `display_name` | Jméno a příjmení | `text` |
| `titul_pred` | Titul před jménem | `text` |
| `jmeno` | Křestní jméno | `text` |
| `prijmeni` | Příjmení | `text` |
| `titul_za` | Titul za jménem | `text` |
| `typ_dokladu` | Typ dokladu | `select` |
| `ico` | IČO | `text` |
| `dic` | DIČ | `text` |
| `primary_phone` | Telefon | `text` |
| `primary_email` | E-mail | `email` |
| `country` | Stát | `text` |
| `street` | Ulice | `text` |
| `cislo_popisne` | Číslo popisné | `text` |
| `city` | Město | `text` |
| `zip` | PSČ | `text` |
| `bankovni_ucet` | Bankovní účet / číslo | `text` |
| `zastupuje_id` | Zastupuje (ID subjektu) | `text` |

#### Předávací protokol (`predavaci-protokol`)
- **Ikona:** `assignment`
- **Pole:**

| Klíč | Název | Typ |
|------|-------|-----|
| `display_name` | Jméno a příjmení | `text` |
| `titul_pred` | Titul před jménem | `text` |
| `jmeno` | Křestní jméno | `text` |
| `prijmeni` | Příjmení | `text` |
| `titul_za` | Titul za jménem | `text` |
| `typ_dokladu` | Typ dokladu | `select` |
| `ico` | IČO | `text` |
| `dic` | DIČ | `text` |
| `primary_phone` | Telefon | `text` |
| `primary_email` | E-mail | `email` |
| `country` | Stát | `text` |
| `street` | Ulice | `text` |
| `cislo_popisne` | Číslo popisné | `text` |
| `city` | Město | `text` |
| `zip` | PSČ | `text` |
| `bankovni_ucet` | Bankovní účet / číslo | `text` |
| `zastupuje_id` | Zastupuje (ID subjektu) | `text` |

---

## Služby (070-sluzby)

**Ikona modulu:** `settings`

### Přehledy (Tiles)

#### Přehled (`prehled`)
- **Ikona:** `list`

#### Katalog služeb (`katalog`)
- **Ikona:** `list_alt`

#### Energie (`energie`)
- **Ikona:** `bolt`

#### Voda (`voda`)
- **Ikona:** `water_drop`

#### Internet (`internet`)
- **Ikona:** `wifi`

#### Správné poplatky (`spravne-poplatky`)
- **Ikona:** `account_balance`

### Formuláře (Forms)

#### Detail služby (`detail`)
- **Ikona:** `visibility`
- **Pole:**

| Klíč | Název | Typ |
|------|-------|-----|
| `display_name` | Jméno a příjmení | `text` |
| `titul_pred` | Titul před jménem | `text` |
| `jmeno` | Křestní jméno | `text` |
| `prijmeni` | Příjmení | `text` |
| `titul_za` | Titul za jménem | `text` |
| `typ_dokladu` | Typ dokladu | `select` |
| `ico` | IČO | `text` |
| `dic` | DIČ | `text` |
| `primary_phone` | Telefon | `text` |
| `primary_email` | E-mail | `email` |
| `country` | Stát | `text` |
| `street` | Ulice | `text` |
| `cislo_popisne` | Číslo popisné | `text` |
| `city` | Město | `text` |
| `zip` | PSČ | `text` |
| `bankovni_ucet` | Bankovní účet / číslo | `text` |
| `zastupuje_id` | Zastupuje (ID subjektu) | `text` |

#### Editace služby (`edit`)
- **Ikona:** `edit`
- **Pole:**

| Klíč | Název | Typ |
|------|-------|-----|
| `display_name` | Jméno a příjmení | `text` |
| `titul_pred` | Titul před jménem | `text` |
| `jmeno` | Křestní jméno | `text` |
| `prijmeni` | Příjmení | `text` |
| `titul_za` | Titul za jménem | `text` |
| `typ_dokladu` | Typ dokladu | `select` |
| `ico` | IČO | `text` |
| `dic` | DIČ | `text` |
| `primary_phone` | Telefon | `text` |
| `primary_email` | E-mail | `email` |
| `country` | Stát | `text` |
| `street` | Ulice | `text` |
| `cislo_popisne` | Číslo popisné | `text` |
| `city` | Město | `text` |
| `zip` | PSČ | `text` |
| `bankovni_ucet` | Bankovní účet / číslo | `text` |
| `zastupuje_id` | Zastupuje (ID subjektu) | `text` |

#### Přidat službu do smlouvy (`pridat-do-smlouvy`)
- **Ikona:** `add_circle`
- **Pole:**

| Klíč | Název | Typ |
|------|-------|-----|
| `display_name` | Jméno a příjmení | `text` |
| `titul_pred` | Titul před jménem | `text` |
| `jmeno` | Křestní jméno | `text` |
| `prijmeni` | Příjmení | `text` |
| `titul_za` | Titul za jménem | `text` |
| `typ_dokladu` | Typ dokladu | `select` |
| `ico` | IČO | `text` |
| `dic` | DIČ | `text` |
| `primary_phone` | Telefon | `text` |
| `primary_email` | E-mail | `email` |
| `country` | Stát | `text` |
| `street` | Ulice | `text` |
| `cislo_popisne` | Číslo popisné | `text` |
| `city` | Město | `text` |
| `zip` | PSČ | `text` |
| `bankovni_ucet` | Bankovní účet / číslo | `text` |
| `zastupuje_id` | Zastupuje (ID subjektu) | `text` |

---

## Platby (080-platby)

**Ikona modulu:** `payments`

### Přehledy (Tiles)

#### Přehled (`prehled`)
- **Ikona:** `list`

#### Přijaté platby (`prijate`)
- **Ikona:** `south`

#### Čekající na zpracování (`cekajici`)
- **Ikona:** `schedule`

#### Použité (`pouzite`)
- **Ikona:** `check_circle`

#### Vrácené platby (`vratky`)
- **Ikona:** `undo`

### Formuláře (Forms)

#### Detail platby (`detail`)
- **Ikona:** `visibility`
- **Pole:**

| Klíč | Název | Typ |
|------|-------|-----|
| `display_name` | Jméno a příjmení | `text` |
| `titul_pred` | Titul před jménem | `text` |
| `jmeno` | Křestní jméno | `text` |
| `prijmeni` | Příjmení | `text` |
| `titul_za` | Titul za jménem | `text` |
| `typ_dokladu` | Typ dokladu | `select` |
| `ico` | IČO | `text` |
| `dic` | DIČ | `text` |
| `primary_phone` | Telefon | `text` |
| `primary_email` | E-mail | `email` |
| `country` | Stát | `text` |
| `street` | Ulice | `text` |
| `cislo_popisne` | Číslo popisné | `text` |
| `city` | Město | `text` |
| `zip` | PSČ | `text` |
| `bankovni_ucet` | Bankovní účet / číslo | `text` |
| `zastupuje_id` | Zastupuje (ID subjektu) | `text` |

#### Vložit platbu (`edit`)
- **Ikona:** `add`
- **Pole:**

| Klíč | Název | Typ |
|------|-------|-----|
| `display_name` | Jméno a příjmení | `text` |
| `titul_pred` | Titul před jménem | `text` |
| `jmeno` | Křestní jméno | `text` |
| `prijmeni` | Příjmení | `text` |
| `titul_za` | Titul za jménem | `text` |
| `typ_dokladu` | Typ dokladu | `select` |
| `ico` | IČO | `text` |
| `dic` | DIČ | `text` |
| `primary_phone` | Telefon | `text` |
| `primary_email` | E-mail | `email` |
| `country` | Stát | `text` |
| `street` | Ulice | `text` |
| `cislo_popisne` | Číslo popisné | `text` |
| `city` | Město | `text` |
| `zip` | PSČ | `text` |
| `bankovni_ucet` | Bankovní účet / číslo | `text` |
| `zastupuje_id` | Zastupuje (ID subjektu) | `text` |

#### Alokace platby (`alokace`)
- **Ikona:** `account_tree`
- **Pole:**

| Klíč | Název | Typ |
|------|-------|-----|
| `display_name` | Jméno a příjmení | `text` |
| `titul_pred` | Titul před jménem | `text` |
| `jmeno` | Křestní jméno | `text` |
| `prijmeni` | Příjmení | `text` |
| `titul_za` | Titul za jménem | `text` |
| `typ_dokladu` | Typ dokladu | `select` |
| `ico` | IČO | `text` |
| `dic` | DIČ | `text` |
| `primary_phone` | Telefon | `text` |
| `primary_email` | E-mail | `email` |
| `country` | Stát | `text` |
| `street` | Ulice | `text` |
| `cislo_popisne` | Číslo popisné | `text` |
| `city` | Město | `text` |
| `zip` | PSČ | `text` |
| `bankovni_ucet` | Bankovní účet / číslo | `text` |
| `zastupuje_id` | Zastupuje (ID subjektu) | `text` |

#### Import plateb (`import`)
- **Ikona:** `upload_file`
- **Pole:**

| Klíč | Název | Typ |
|------|-------|-----|
| `display_name` | Jméno a příjmení | `text` |
| `titul_pred` | Titul před jménem | `text` |
| `jmeno` | Křestní jméno | `text` |
| `prijmeni` | Příjmení | `text` |
| `titul_za` | Titul za jménem | `text` |
| `typ_dokladu` | Typ dokladu | `select` |
| `ico` | IČO | `text` |
| `dic` | DIČ | `text` |
| `primary_phone` | Telefon | `text` |
| `primary_email` | E-mail | `email` |
| `country` | Stát | `text` |
| `street` | Ulice | `text` |
| `cislo_popisne` | Číslo popisné | `text` |
| `city` | Město | `text` |
| `zip` | PSČ | `text` |
| `bankovni_ucet` | Bankovní účet / číslo | `text` |
| `zastupuje_id` | Zastupuje (ID subjektu) | `text` |

---

## Analýza použití polí

Seznam všech polí použitých v aplikaci a jejich výskyt v jednotlivých modulech.

### `display_name`
**Počet použití:** 29

**Umístění:**
- Uživatelé - Přehled: Přehled
- Uživatelé - Formulář: Formulář
- Uživatelé - Formulář: Nový / Pozvat
- Uživatelé - Formulář: Role & barvy
- Můj účet - Formulář: Upravit profil
- Pronajímatel - Přehled: Přehled
- Pronajímatel - Přehled: Osoba
- Pronajímatel - Přehled: OSVČ
- Pronajímatel - Přehled: Firma
- Pronajímatel - Přehled: Spolek / Skupina
- Pronajímatel - Přehled: Státní instituce
- Pronajímatel - Přehled: Zástupci
- Nájemník - Přehled: Přehled
- Nájemník - Přehled: Osoba
- Nájemník - Přehled: OSVČ
- Nájemník - Přehled: Firma
- Nájemník - Přehled: Spolek / Skupina
- Nájemník - Přehled: Státní instituce
- Nájemník - Přehled: Zástupci
- Smlouvy - Formulář: Detail smlouvy
- Smlouvy - Formulář: Editace smlouvy
- Smlouvy - Formulář: Předávací protokol
- Služby - Formulář: Detail služby
- Služby - Formulář: Editace služby
- Služby - Formulář: Přidat službu do smlouvy
- Platby - Formulář: Detail platby
- Platby - Formulář: Vložit platbu
- Platby - Formulář: Alokace platby
- Platby - Formulář: Import plateb

### `primary_email`
**Počet použití:** 28

**Umístění:**
- Uživatelé - Formulář: Formulář
- Uživatelé - Formulář: Nový / Pozvat
- Uživatelé - Formulář: Role & barvy
- Můj účet - Formulář: Upravit profil
- Pronajímatel - Přehled: Přehled
- Pronajímatel - Přehled: Osoba
- Pronajímatel - Přehled: OSVČ
- Pronajímatel - Přehled: Firma
- Pronajímatel - Přehled: Spolek / Skupina
- Pronajímatel - Přehled: Státní instituce
- Pronajímatel - Přehled: Zástupci
- Nájemník - Přehled: Přehled
- Nájemník - Přehled: Osoba
- Nájemník - Přehled: OSVČ
- Nájemník - Přehled: Firma
- Nájemník - Přehled: Spolek / Skupina
- Nájemník - Přehled: Státní instituce
- Nájemník - Přehled: Zástupci
- Smlouvy - Formulář: Detail smlouvy
- Smlouvy - Formulář: Editace smlouvy
- Smlouvy - Formulář: Předávací protokol
- Služby - Formulář: Detail služby
- Služby - Formulář: Editace služby
- Služby - Formulář: Přidat službu do smlouvy
- Platby - Formulář: Detail platby
- Platby - Formulář: Vložit platbu
- Platby - Formulář: Alokace platby
- Platby - Formulář: Import plateb

### `primary_phone`
**Počet použití:** 26

**Umístění:**
- Uživatelé - Formulář: Formulář
- Uživatelé - Formulář: Nový / Pozvat
- Uživatelé - Formulář: Role & barvy
- Můj účet - Formulář: Upravit profil
- Pronajímatel - Přehled: Přehled
- Pronajímatel - Přehled: Osoba
- Pronajímatel - Přehled: OSVČ
- Pronajímatel - Přehled: Firma
- Pronajímatel - Přehled: Spolek / Skupina
- Pronajímatel - Přehled: Zástupci
- Nájemník - Přehled: Přehled
- Nájemník - Přehled: Osoba
- Nájemník - Přehled: OSVČ
- Nájemník - Přehled: Firma
- Nájemník - Přehled: Spolek / Skupina
- Nájemník - Přehled: Zástupci
- Smlouvy - Formulář: Detail smlouvy
- Smlouvy - Formulář: Editace smlouvy
- Smlouvy - Formulář: Předávací protokol
- Služby - Formulář: Detail služby
- Služby - Formulář: Editace služby
- Služby - Formulář: Přidat službu do smlouvy
- Platby - Formulář: Detail platby
- Platby - Formulář: Vložit platbu
- Platby - Formulář: Alokace platby
- Platby - Formulář: Import plateb

### `cislo_popisne`
**Počet použití:** 22

**Umístění:**
- Uživatelé - Formulář: Formulář
- Uživatelé - Formulář: Nový / Pozvat
- Uživatelé - Formulář: Role & barvy
- Můj účet - Formulář: Upravit profil
- Přehled - Formulář: Nová nemovitost
- Přehled - Formulář: Nová jednotka
- Přehled - Formulář: Správa typů nemovitostí
- Přehled - Formulář: Správa typů jednotek
- Přehled - Formulář: Editace nemovitosti
- Přehled - Formulář: Detail nemovitosti
- Přehled - Formulář: Editace jednotky
- Přehled - Formulář: Detail jednotky
- Smlouvy - Formulář: Detail smlouvy
- Smlouvy - Formulář: Editace smlouvy
- Smlouvy - Formulář: Předávací protokol
- Služby - Formulář: Detail služby
- Služby - Formulář: Editace služby
- Služby - Formulář: Přidat službu do smlouvy
- Platby - Formulář: Detail platby
- Platby - Formulář: Vložit platbu
- Platby - Formulář: Alokace platby
- Platby - Formulář: Import plateb

### `city`
**Počet použití:** 21

**Umístění:**
- Uživatelé - Formulář: Formulář
- Uživatelé - Formulář: Nový / Pozvat
- Uživatelé - Formulář: Role & barvy
- Můj účet - Formulář: Upravit profil
- Pronajímatel - Přehled: Přehled
- Pronajímatel - Přehled: Osoba
- Pronajímatel - Přehled: Firma
- Pronajímatel - Přehled: Státní instituce
- Nájemník - Přehled: Přehled
- Nájemník - Přehled: Firma
- Nájemník - Přehled: Státní instituce
- Smlouvy - Formulář: Detail smlouvy
- Smlouvy - Formulář: Editace smlouvy
- Smlouvy - Formulář: Předávací protokol
- Služby - Formulář: Detail služby
- Služby - Formulář: Editace služby
- Služby - Formulář: Přidat službu do smlouvy
- Platby - Formulář: Detail platby
- Platby - Formulář: Vložit platbu
- Platby - Formulář: Alokace platby
- Platby - Formulář: Import plateb

### `ico`
**Počet použití:** 20

**Umístění:**
- Uživatelé - Formulář: Formulář
- Uživatelé - Formulář: Nový / Pozvat
- Uživatelé - Formulář: Role & barvy
- Můj účet - Formulář: Upravit profil
- Pronajímatel - Přehled: Přehled
- Pronajímatel - Přehled: OSVČ
- Pronajímatel - Přehled: Firma
- Nájemník - Přehled: Přehled
- Nájemník - Přehled: OSVČ
- Nájemník - Přehled: Firma
- Smlouvy - Formulář: Detail smlouvy
- Smlouvy - Formulář: Editace smlouvy
- Smlouvy - Formulář: Předávací protokol
- Služby - Formulář: Detail služby
- Služby - Formulář: Editace služby
- Služby - Formulář: Přidat službu do smlouvy
- Platby - Formulář: Detail platby
- Platby - Formulář: Vložit platbu
- Platby - Formulář: Alokace platby
- Platby - Formulář: Import plateb

### `zastupuje_id`
**Počet použití:** 16

**Umístění:**
- Uživatelé - Formulář: Formulář
- Uživatelé - Formulář: Nový / Pozvat
- Uživatelé - Formulář: Role & barvy
- Můj účet - Formulář: Upravit profil
- Pronajímatel - Přehled: Zástupci
- Nájemník - Přehled: Zástupci
- Smlouvy - Formulář: Detail smlouvy
- Smlouvy - Formulář: Editace smlouvy
- Smlouvy - Formulář: Předávací protokol
- Služby - Formulář: Detail služby
- Služby - Formulář: Editace služby
- Služby - Formulář: Přidat službu do smlouvy
- Platby - Formulář: Detail platby
- Platby - Formulář: Vložit platbu
- Platby - Formulář: Alokace platby
- Platby - Formulář: Import plateb

### `titul_pred`
**Počet použití:** 14

**Umístění:**
- Uživatelé - Formulář: Formulář
- Uživatelé - Formulář: Nový / Pozvat
- Uživatelé - Formulář: Role & barvy
- Můj účet - Formulář: Upravit profil
- Smlouvy - Formulář: Detail smlouvy
- Smlouvy - Formulář: Editace smlouvy
- Smlouvy - Formulář: Předávací protokol
- Služby - Formulář: Detail služby
- Služby - Formulář: Editace služby
- Služby - Formulář: Přidat službu do smlouvy
- Platby - Formulář: Detail platby
- Platby - Formulář: Vložit platbu
- Platby - Formulář: Alokace platby
- Platby - Formulář: Import plateb

### `jmeno`
**Počet použití:** 14

**Umístění:**
- Uživatelé - Formulář: Formulář
- Uživatelé - Formulář: Nový / Pozvat
- Uživatelé - Formulář: Role & barvy
- Můj účet - Formulář: Upravit profil
- Smlouvy - Formulář: Detail smlouvy
- Smlouvy - Formulář: Editace smlouvy
- Smlouvy - Formulář: Předávací protokol
- Služby - Formulář: Detail služby
- Služby - Formulář: Editace služby
- Služby - Formulář: Přidat službu do smlouvy
- Platby - Formulář: Detail platby
- Platby - Formulář: Vložit platbu
- Platby - Formulář: Alokace platby
- Platby - Formulář: Import plateb

### `prijmeni`
**Počet použití:** 14

**Umístění:**
- Uživatelé - Formulář: Formulář
- Uživatelé - Formulář: Nový / Pozvat
- Uživatelé - Formulář: Role & barvy
- Můj účet - Formulář: Upravit profil
- Smlouvy - Formulář: Detail smlouvy
- Smlouvy - Formulář: Editace smlouvy
- Smlouvy - Formulář: Předávací protokol
- Služby - Formulář: Detail služby
- Služby - Formulář: Editace služby
- Služby - Formulář: Přidat službu do smlouvy
- Platby - Formulář: Detail platby
- Platby - Formulář: Vložit platbu
- Platby - Formulář: Alokace platby
- Platby - Formulář: Import plateb

### `titul_za`
**Počet použití:** 14

**Umístění:**
- Uživatelé - Formulář: Formulář
- Uživatelé - Formulář: Nový / Pozvat
- Uživatelé - Formulář: Role & barvy
- Můj účet - Formulář: Upravit profil
- Smlouvy - Formulář: Detail smlouvy
- Smlouvy - Formulář: Editace smlouvy
- Smlouvy - Formulář: Předávací protokol
- Služby - Formulář: Detail služby
- Služby - Formulář: Editace služby
- Služby - Formulář: Přidat službu do smlouvy
- Platby - Formulář: Detail platby
- Platby - Formulář: Vložit platbu
- Platby - Formulář: Alokace platby
- Platby - Formulář: Import plateb

### `typ_dokladu`
**Počet použití:** 14

**Umístění:**
- Uživatelé - Formulář: Formulář
- Uživatelé - Formulář: Nový / Pozvat
- Uživatelé - Formulář: Role & barvy
- Můj účet - Formulář: Upravit profil
- Smlouvy - Formulář: Detail smlouvy
- Smlouvy - Formulář: Editace smlouvy
- Smlouvy - Formulář: Předávací protokol
- Služby - Formulář: Detail služby
- Služby - Formulář: Editace služby
- Služby - Formulář: Přidat službu do smlouvy
- Platby - Formulář: Detail platby
- Platby - Formulář: Vložit platbu
- Platby - Formulář: Alokace platby
- Platby - Formulář: Import plateb

### `dic`
**Počet použití:** 14

**Umístění:**
- Uživatelé - Formulář: Formulář
- Uživatelé - Formulář: Nový / Pozvat
- Uživatelé - Formulář: Role & barvy
- Můj účet - Formulář: Upravit profil
- Smlouvy - Formulář: Detail smlouvy
- Smlouvy - Formulář: Editace smlouvy
- Smlouvy - Formulář: Předávací protokol
- Služby - Formulář: Detail služby
- Služby - Formulář: Editace služby
- Služby - Formulář: Přidat službu do smlouvy
- Platby - Formulář: Detail platby
- Platby - Formulář: Vložit platbu
- Platby - Formulář: Alokace platby
- Platby - Formulář: Import plateb

### `country`
**Počet použití:** 14

**Umístění:**
- Uživatelé - Formulář: Formulář
- Uživatelé - Formulář: Nový / Pozvat
- Uživatelé - Formulář: Role & barvy
- Můj účet - Formulář: Upravit profil
- Smlouvy - Formulář: Detail smlouvy
- Smlouvy - Formulář: Editace smlouvy
- Smlouvy - Formulář: Předávací protokol
- Služby - Formulář: Detail služby
- Služby - Formulář: Editace služby
- Služby - Formulář: Přidat službu do smlouvy
- Platby - Formulář: Detail platby
- Platby - Formulář: Vložit platbu
- Platby - Formulář: Alokace platby
- Platby - Formulář: Import plateb

### `street`
**Počet použití:** 14

**Umístění:**
- Uživatelé - Formulář: Formulář
- Uživatelé - Formulář: Nový / Pozvat
- Uživatelé - Formulář: Role & barvy
- Můj účet - Formulář: Upravit profil
- Smlouvy - Formulář: Detail smlouvy
- Smlouvy - Formulář: Editace smlouvy
- Smlouvy - Formulář: Předávací protokol
- Služby - Formulář: Detail služby
- Služby - Formulář: Editace služby
- Služby - Formulář: Přidat službu do smlouvy
- Platby - Formulář: Detail platby
- Platby - Formulář: Vložit platbu
- Platby - Formulář: Alokace platby
- Platby - Formulář: Import plateb

### `zip`
**Počet použití:** 14

**Umístění:**
- Uživatelé - Formulář: Formulář
- Uživatelé - Formulář: Nový / Pozvat
- Uživatelé - Formulář: Role & barvy
- Můj účet - Formulář: Upravit profil
- Smlouvy - Formulář: Detail smlouvy
- Smlouvy - Formulář: Editace smlouvy
- Smlouvy - Formulář: Předávací protokol
- Služby - Formulář: Detail služby
- Služby - Formulář: Editace služby
- Služby - Formulář: Přidat službu do smlouvy
- Platby - Formulář: Detail platby
- Platby - Formulář: Vložit platbu
- Platby - Formulář: Alokace platby
- Platby - Formulář: Import plateb

### `bankovni_ucet`
**Počet použití:** 14

**Umístění:**
- Uživatelé - Formulář: Formulář
- Uživatelé - Formulář: Nový / Pozvat
- Uživatelé - Formulář: Role & barvy
- Můj účet - Formulář: Upravit profil
- Smlouvy - Formulář: Detail smlouvy
- Smlouvy - Formulář: Editace smlouvy
- Smlouvy - Formulář: Předávací protokol
- Služby - Formulář: Detail služby
- Služby - Formulář: Editace služby
- Služby - Formulář: Přidat službu do smlouvy
- Platby - Formulář: Detail platby
- Platby - Formulář: Vložit platbu
- Platby - Formulář: Alokace platby
- Platby - Formulář: Import plateb

### `archivedLabel`
**Počet použití:** 11

**Umístění:**
- Uživatelé - Přehled: Přehled
- Pronajímatel - Přehled: Přehled
- Přehled - Formulář: Nová nemovitost
- Přehled - Formulář: Nová jednotka
- Přehled - Formulář: Správa typů nemovitostí
- Přehled - Formulář: Správa typů jednotek
- Přehled - Formulář: Editace nemovitosti
- Přehled - Formulář: Detail nemovitosti
- Přehled - Formulář: Editace jednotky
- Přehled - Formulář: Detail jednotky
- Nájemník - Přehled: Přehled

### `nazev`
**Počet použití:** 8

**Umístění:**
- Přehled - Formulář: Nová nemovitost
- Přehled - Formulář: Nová jednotka
- Přehled - Formulář: Správa typů nemovitostí
- Přehled - Formulář: Správa typů jednotek
- Přehled - Formulář: Editace nemovitosti
- Přehled - Formulář: Detail nemovitosti
- Přehled - Formulář: Editace jednotky
- Přehled - Formulář: Detail jednotky

### `typ_nemovitosti`
**Počet použití:** 8

**Umístění:**
- Přehled - Formulář: Nová nemovitost
- Přehled - Formulář: Nová jednotka
- Přehled - Formulář: Správa typů nemovitostí
- Přehled - Formulář: Správa typů jednotek
- Přehled - Formulář: Editace nemovitosti
- Přehled - Formulář: Detail nemovitosti
- Přehled - Formulář: Editace jednotky
- Přehled - Formulář: Detail jednotky

### `ulice`
**Počet použití:** 8

**Umístění:**
- Přehled - Formulář: Nová nemovitost
- Přehled - Formulář: Nová jednotka
- Přehled - Formulář: Správa typů nemovitostí
- Přehled - Formulář: Správa typů jednotek
- Přehled - Formulář: Editace nemovitosti
- Přehled - Formulář: Detail nemovitosti
- Přehled - Formulář: Editace jednotky
- Přehled - Formulář: Detail jednotky

### `cislo_orientacni`
**Počet použití:** 8

**Umístění:**
- Přehled - Formulář: Nová nemovitost
- Přehled - Formulář: Nová jednotka
- Přehled - Formulář: Správa typů nemovitostí
- Přehled - Formulář: Správa typů jednotek
- Přehled - Formulář: Editace nemovitosti
- Přehled - Formulář: Detail nemovitosti
- Přehled - Formulář: Editace jednotky
- Přehled - Formulář: Detail jednotky

### `mesto`
**Počet použití:** 8

**Umístění:**
- Přehled - Formulář: Nová nemovitost
- Přehled - Formulář: Nová jednotka
- Přehled - Formulář: Správa typů nemovitostí
- Přehled - Formulář: Správa typů jednotek
- Přehled - Formulář: Editace nemovitosti
- Přehled - Formulář: Detail nemovitosti
- Přehled - Formulář: Editace jednotky
- Přehled - Formulář: Detail jednotky

### `psc`
**Počet použití:** 8

**Umístění:**
- Přehled - Formulář: Nová nemovitost
- Přehled - Formulář: Nová jednotka
- Přehled - Formulář: Správa typů nemovitostí
- Přehled - Formulář: Správa typů jednotek
- Přehled - Formulář: Editace nemovitosti
- Přehled - Formulář: Detail nemovitosti
- Přehled - Formulář: Editace jednotky
- Přehled - Formulář: Detail jednotky

### `kraj`
**Počet použití:** 8

**Umístění:**
- Přehled - Formulář: Nová nemovitost
- Přehled - Formulář: Nová jednotka
- Přehled - Formulář: Správa typů nemovitostí
- Přehled - Formulář: Správa typů jednotek
- Přehled - Formulář: Editace nemovitosti
- Přehled - Formulář: Detail nemovitosti
- Přehled - Formulář: Editace jednotky
- Přehled - Formulář: Detail jednotky

### `stat`
**Počet použití:** 8

**Umístění:**
- Přehled - Formulář: Nová nemovitost
- Přehled - Formulář: Nová jednotka
- Přehled - Formulář: Správa typů nemovitostí
- Přehled - Formulář: Správa typů jednotek
- Přehled - Formulář: Editace nemovitosti
- Přehled - Formulář: Detail nemovitosti
- Přehled - Formulář: Editace jednotky
- Přehled - Formulář: Detail jednotky

### `pocet_podlazi`
**Počet použití:** 8

**Umístění:**
- Přehled - Formulář: Nová nemovitost
- Přehled - Formulář: Nová jednotka
- Přehled - Formulář: Správa typů nemovitostí
- Přehled - Formulář: Správa typů jednotek
- Přehled - Formulář: Editace nemovitosti
- Přehled - Formulář: Detail nemovitosti
- Přehled - Formulář: Editace jednotky
- Přehled - Formulář: Detail jednotky

### `pocet_podzemních_podlazi`
**Počet použití:** 8

**Umístění:**
- Přehled - Formulář: Nová nemovitost
- Přehled - Formulář: Nová jednotka
- Přehled - Formulář: Správa typů nemovitostí
- Přehled - Formulář: Správa typů jednotek
- Přehled - Formulář: Editace nemovitosti
- Přehled - Formulář: Detail nemovitosti
- Přehled - Formulář: Editace jednotky
- Přehled - Formulář: Detail jednotky

### `rok_vystavby`
**Počet použití:** 8

**Umístění:**
- Přehled - Formulář: Nová nemovitost
- Přehled - Formulář: Nová jednotka
- Přehled - Formulář: Správa typů nemovitostí
- Přehled - Formulář: Správa typů jednotek
- Přehled - Formulář: Editace nemovitosti
- Přehled - Formulář: Detail nemovitosti
- Přehled - Formulář: Editace jednotky
- Přehled - Formulář: Detail jednotky

### `rok_rekonstrukce`
**Počet použití:** 8

**Umístění:**
- Přehled - Formulář: Nová nemovitost
- Přehled - Formulář: Nová jednotka
- Přehled - Formulář: Správa typů nemovitostí
- Přehled - Formulář: Správa typů jednotek
- Přehled - Formulář: Editace nemovitosti
- Přehled - Formulář: Detail nemovitosti
- Přehled - Formulář: Editace jednotky
- Přehled - Formulář: Detail jednotky

### `celkova_plocha`
**Počet použití:** 8

**Umístění:**
- Přehled - Formulář: Nová nemovitost
- Přehled - Formulář: Nová jednotka
- Přehled - Formulář: Správa typů nemovitostí
- Přehled - Formulář: Správa typů jednotek
- Přehled - Formulář: Editace nemovitosti
- Přehled - Formulář: Detail nemovitosti
- Přehled - Formulář: Editace jednotky
- Přehled - Formulář: Detail jednotky

### `pocet_jednotek`
**Počet použití:** 8

**Umístění:**
- Přehled - Formulář: Nová nemovitost
- Přehled - Formulář: Nová jednotka
- Přehled - Formulář: Správa typů nemovitostí
- Přehled - Formulář: Správa typů jednotek
- Přehled - Formulář: Editace nemovitosti
- Přehled - Formulář: Detail nemovitosti
- Přehled - Formulář: Editace jednotky
- Přehled - Formulář: Detail jednotky

### `spravce`
**Počet použití:** 8

**Umístění:**
- Přehled - Formulář: Nová nemovitost
- Přehled - Formulář: Nová jednotka
- Přehled - Formulář: Správa typů nemovitostí
- Přehled - Formulář: Správa typů jednotek
- Přehled - Formulář: Editace nemovitosti
- Přehled - Formulář: Detail nemovitosti
- Přehled - Formulář: Editace jednotky
- Přehled - Formulář: Detail jednotky

### `pronajimatel_id`
**Počet použití:** 8

**Umístění:**
- Přehled - Formulář: Nová nemovitost
- Přehled - Formulář: Nová jednotka
- Přehled - Formulář: Správa typů nemovitostí
- Přehled - Formulář: Správa typů jednotek
- Přehled - Formulář: Editace nemovitosti
- Přehled - Formulář: Detail nemovitosti
- Přehled - Formulář: Editace jednotky
- Přehled - Formulář: Detail jednotky

### `poznamky`
**Počet použití:** 8

**Umístění:**
- Přehled - Formulář: Nová nemovitost
- Přehled - Formulář: Nová jednotka
- Přehled - Formulář: Správa typů nemovitostí
- Přehled - Formulář: Správa typů jednotek
- Přehled - Formulář: Editace nemovitosti
- Přehled - Formulář: Detail nemovitosti
- Přehled - Formulář: Editace jednotky
- Přehled - Formulář: Detail jednotky

### `vybaveni`
**Počet použití:** 8

**Umístění:**
- Přehled - Formulář: Nová nemovitost
- Přehled - Formulář: Nová jednotka
- Přehled - Formulář: Správa typů nemovitostí
- Přehled - Formulář: Správa typů jednotek
- Přehled - Formulář: Editace nemovitosti
- Přehled - Formulář: Detail nemovitosti
- Přehled - Formulář: Editace jednotky
- Přehled - Formulář: Detail jednotky

### `prilohy`
**Počet použití:** 8

**Umístění:**
- Přehled - Formulář: Nová nemovitost
- Přehled - Formulář: Nová jednotka
- Přehled - Formulář: Správa typů nemovitostí
- Přehled - Formulář: Správa typů jednotek
- Přehled - Formulář: Editace nemovitosti
- Přehled - Formulář: Detail nemovitosti
- Přehled - Formulář: Editace jednotky
- Přehled - Formulář: Detail jednotky

### `pronajimatel`
**Počet použití:** 8

**Umístění:**
- Přehled - Formulář: Nová nemovitost
- Přehled - Formulář: Nová jednotka
- Přehled - Formulář: Správa typů nemovitostí
- Přehled - Formulář: Správa typů jednotek
- Přehled - Formulář: Editace nemovitosti
- Přehled - Formulář: Detail nemovitosti
- Přehled - Formulář: Editace jednotky
- Přehled - Formulář: Detail jednotky

### `archived`
**Počet použití:** 8

**Umístění:**
- Přehled - Formulář: Nová nemovitost
- Přehled - Formulář: Nová jednotka
- Přehled - Formulář: Správa typů nemovitostí
- Přehled - Formulář: Správa typů jednotek
- Přehled - Formulář: Editace nemovitosti
- Přehled - Formulář: Detail nemovitosti
- Přehled - Formulář: Editace jednotky
- Přehled - Formulář: Detail jednotky

### `updated_at`
**Počet použití:** 8

**Umístění:**
- Přehled - Formulář: Nová nemovitost
- Přehled - Formulář: Nová jednotka
- Přehled - Formulář: Správa typů nemovitostí
- Přehled - Formulář: Správa typů jednotek
- Přehled - Formulář: Editace nemovitosti
- Přehled - Formulář: Detail nemovitosti
- Přehled - Formulář: Editace jednotky
- Přehled - Formulář: Detail jednotky

### `updated_by`
**Počet použití:** 8

**Umístění:**
- Přehled - Formulář: Nová nemovitost
- Přehled - Formulář: Nová jednotka
- Přehled - Formulář: Správa typů nemovitostí
- Přehled - Formulář: Správa typů jednotek
- Přehled - Formulář: Editace nemovitosti
- Přehled - Formulář: Detail nemovitosti
- Přehled - Formulář: Editace jednotky
- Přehled - Formulář: Detail jednotky

### `created_at`
**Počet použití:** 8

**Umístění:**
- Přehled - Formulář: Nová nemovitost
- Přehled - Formulář: Nová jednotka
- Přehled - Formulář: Správa typů nemovitostí
- Přehled - Formulář: Správa typů jednotek
- Přehled - Formulář: Editace nemovitosti
- Přehled - Formulář: Detail nemovitosti
- Přehled - Formulář: Editace jednotky
- Přehled - Formulář: Detail jednotky

### `id`
**Počet použití:** 3

**Umístění:**
- Pronajímatel - Přehled: Osoba
- Pronajímatel - Přehled: Firma
- Nájemník - Přehled: Firma

### `typ_subjektu`
**Počet použití:** 2

**Umístění:**
- Pronajímatel - Přehled: Přehled
- Nájemník - Přehled: Přehled

### `role`
**Počet použití:** 1

**Umístění:**
- Uživatelé - Přehled: Přehled

### `email`
**Počet použití:** 1

**Umístění:**
- Uživatelé - Přehled: Přehled

