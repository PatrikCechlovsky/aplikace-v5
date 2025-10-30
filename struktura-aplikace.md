# Struktura aplikace - Analýza modulů

> **Tento soubor je automaticky generován.** Spustit: `node analyze-structure.js`

Poslední aktualizace: 30. 10. 2025 13:47:34

## Obsah

- [Uživatelé (010-sprava-uzivatelu)](#010spravauzivatelu)
- [Můj účet (020-muj-ucet)](#020mujucet)
- [Pronajímatel (030-pronajimatel)](#030pronajimatel)
- [Nemovitosti (040-nemovitost)](#040nemovitost)
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

## Nemovitosti (040-nemovitost)

**Ikona modulu:** `building`

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
| `id` | ID | `text` |
| `cislo_smlouvy` | Číslo smlouvy | `text` |
| `stav` | Stav | `select` |
| `landlord_id` | Pronajímatel | `chooser` |
| `tenant_id` | Nájemník | `chooser` |
| `property_id` | Nemovitost | `chooser` |
| `unit_id` | Jednotka | `chooser` |
| `datum_zacatek` | Datum začátku | `date` |
| `datum_konec` | Datum konce | `date` |
| `najem_vyse` | Výše nájmu | `number` |
| `periodicita_najmu` | Periodicita | `select` |
| `kauce_potreba` | Kauce požadována | `checkbox` |
| `kauce_castka` | Výše kauce | `number` |
| `stav_kauce` | Stav kauce | `select` |
| `poznamky` | Poznámky | `textarea` |
| `archived` | Archivováno | `checkbox` |
| `created_at` | Vytvořeno | `text` |
| `created_by` | Vytvořil | `text` |
| `updated_at` | Upraveno | `text` |
| `updated_by` | Upravil | `text` |

#### Editace smlouvy (`edit`)
- **Ikona:** `edit`
- **Pole:**

| Klíč | Název | Typ |
|------|-------|-----|
| `cislo_smlouvy` | Číslo smlouvy | `text` |
| `stav` | Stav | `select` |
| `landlord_id` | Pronajímatel | `chooser` |
| `tenant_id` | Nájemník | `chooser` |
| `property_id` | Nemovitost | `chooser` |
| `unit_id` | Jednotka | `chooser` |
| `datum_zacatek` | Datum začátku | `date` |
| `datum_konec` | Datum konce | `date` |
| `najem_vyse` | Výše nájmu (Kč) | `number` |
| `periodicita_najmu` | Periodicita | `select` |
| `kauce_potreba` | Kauce požadována | `checkbox` |
| `kauce_castka` | Výše kauce (Kč) | `number` |
| `poznamky` | Poznámky | `textarea` |

#### Předávací protokol (`predavaci-protokol`)
- **Ikona:** `assignment`
- **Pole:**

| Klíč | Název | Typ |
|------|-------|-----|
| `contract_id` | ID smlouvy | `text` |
| `datum_predani` | Datum předání | `date` |
| `typ_protokolu` | Typ protokolu | `select` |
| `stav_jednotky` | Stav jednotky | `textarea` |
| `meraky_stav` | Stavy měřáků | `textarea` |
| `poznamky` | Poznámky | `textarea` |

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
| `id` | ID | `text` |
| `kod` | Kód služby | `text` |
| `nazev` | Název služby | `text` |
| `kategorie` | Kategorie | `select` |
| `popis` | Popis | `textarea` |
| `typ_uctovani` | Typ účtování | `select` |
| `jednotka` | Jednotka | `text` |
| `zakladni_cena` | Základní cena | `number` |
| `sazba_dph` | DPH sazba (0.21 = 21%) | `number` |
| `aktivni` | Aktivní | `checkbox` |
| `poznamky` | Poznámky | `textarea` |
| `created_at` | Vytvořeno | `text` |
| `created_by` | Vytvořil | `text` |
| `updated_at` | Upraveno | `text` |
| `updated_by` | Upravil | `text` |

#### Editace služby (`edit`)
- **Ikona:** `edit`
- **Pole:**

| Klíč | Název | Typ |
|------|-------|-----|
| `kod` | Kód služby | `text` |
| `nazev` | Název služby | `text` |
| `kategorie` | Kategorie | `select` |
| `popis` | Popis | `textarea` |
| `typ_uctovani` | Typ účtování | `select` |
| `jednotka` | Jednotka | `text` |
| `zakladni_cena` | Základní cena (Kč) | `number` |
| `sazba_dph` | DPH sazba (0.21 = 21%) | `number` |
| `aktivni` | Aktivní | `checkbox` |
| `poznamky` | Poznámky | `textarea` |

#### Přidat službu do smlouvy (`pridat-do-smlouvy`)
- **Ikona:** `add_circle`
- **Pole:**

| Klíč | Název | Typ |
|------|-------|-----|
| `contract_id` | ID smlouvy | `text` |
| `service_definition_id` | Služba | `chooser` |
| `mnozstvi` | Množství | `number` |
| `cena_za_jednotku` | Cena za jednotku | `number` |
| `pausal` | Paušál | `checkbox` |
| `poznamky` | Poznámky | `textarea` |

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
| `id` | ID | `text` |
| `payment_reference` | Reference platby | `text` |
| `amount` | Částka | `number` |
| `currency` | Měna | `text` |
| `payment_date` | Datum platby | `date` |
| `value_date` | Valuta | `date` |
| `payment_type` | Typ platby | `select` |
| `payment_method` | Způsob platby | `select` |
| `status` | Stav | `select` |
| `contract_id` | Smlouva | `chooser` |
| `party_id` | Strana | `chooser` |
| `bank_transaction_id` | ID bankovní transakce | `text` |
| `poznamky` | Poznámky | `textarea` |
| `created_at` | Vytvořeno | `text` |
| `created_by` | Vytvořil | `text` |
| `updated_at` | Upraveno | `text` |
| `updated_by` | Upravil | `text` |

#### Vložit platbu (`edit`)
- **Ikona:** `add`
- **Pole:**

| Klíč | Název | Typ |
|------|-------|-----|
| `payment_reference` | Reference platby | `text` |
| `amount` | Částka (Kč) | `number` |
| `payment_date` | Datum platby | `date` |
| `value_date` | Valuta | `date` |
| `payment_type` | Typ platby | `select` |
| `payment_method` | Způsob platby | `select` |
| `status` | Stav | `select` |
| `contract_id` | Smlouva | `chooser` |
| `party_id` | Plátce | `chooser` |
| `bank_transaction_id` | ID bankovní transakce | `text` |
| `poznamky` | Poznámky | `textarea` |

#### Alokace platby (`alokace`)
- **Ikona:** `account_tree`
- **Pole:**

| Klíč | Název | Typ |
|------|-------|-----|
| `payment_id` | ID platby | `text` |
| `allocation_type` | Typ alokace | `select` |
| `amount` | Částka | `number` |
| `period_from` | Období od | `date` |
| `period_to` | Období do | `date` |
| `poznamky` | Poznámky | `textarea` |

#### Import plateb (`import`)
- **Ikona:** `upload_file`
- **Pole:**

| Klíč | Název | Typ |
|------|-------|-----|
| `soubor` | Soubor | `file` |
| `format` | Formát | `select` |
| `automaticke_parovani` | Automatické párování podle VS | `checkbox` |

---

## Analýza použití polí

Seznam všech polí použitých v aplikaci a jejich výskyt v jednotlivých modulech.

### `display_name`
**Počet použití:** 19

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

### `primary_email`
**Počet použití:** 18

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

### `poznamky`
**Počet použití:** 17

**Umístění:**
- Nemovitosti - Formulář: Nová nemovitost
- Nemovitosti - Formulář: Nová jednotka
- Nemovitosti - Formulář: Správa typů nemovitostí
- Nemovitosti - Formulář: Správa typů jednotek
- Nemovitosti - Formulář: Editace nemovitosti
- Nemovitosti - Formulář: Detail nemovitosti
- Nemovitosti - Formulář: Editace jednotky
- Nemovitosti - Formulář: Detail jednotky
- Smlouvy - Formulář: Detail smlouvy
- Smlouvy - Formulář: Editace smlouvy
- Smlouvy - Formulář: Předávací protokol
- Služby - Formulář: Detail služby
- Služby - Formulář: Editace služby
- Služby - Formulář: Přidat službu do smlouvy
- Platby - Formulář: Detail platby
- Platby - Formulář: Vložit platbu
- Platby - Formulář: Alokace platby

### `primary_phone`
**Počet použití:** 16

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

### `cislo_popisne`
**Počet použití:** 12

**Umístění:**
- Uživatelé - Formulář: Formulář
- Uživatelé - Formulář: Nový / Pozvat
- Uživatelé - Formulář: Role & barvy
- Můj účet - Formulář: Upravit profil
- Nemovitosti - Formulář: Nová nemovitost
- Nemovitosti - Formulář: Nová jednotka
- Nemovitosti - Formulář: Správa typů nemovitostí
- Nemovitosti - Formulář: Správa typů jednotek
- Nemovitosti - Formulář: Editace nemovitosti
- Nemovitosti - Formulář: Detail nemovitosti
- Nemovitosti - Formulář: Editace jednotky
- Nemovitosti - Formulář: Detail jednotky

### `archivedLabel`
**Počet použití:** 11

**Umístění:**
- Uživatelé - Přehled: Přehled
- Pronajímatel - Přehled: Přehled
- Nemovitosti - Formulář: Nová nemovitost
- Nemovitosti - Formulář: Nová jednotka
- Nemovitosti - Formulář: Správa typů nemovitostí
- Nemovitosti - Formulář: Správa typů jednotek
- Nemovitosti - Formulář: Editace nemovitosti
- Nemovitosti - Formulář: Detail nemovitosti
- Nemovitosti - Formulář: Editace jednotky
- Nemovitosti - Formulář: Detail jednotky
- Nájemník - Přehled: Přehled

### `city`
**Počet použití:** 11

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

### `updated_at`
**Počet použití:** 11

**Umístění:**
- Nemovitosti - Formulář: Nová nemovitost
- Nemovitosti - Formulář: Nová jednotka
- Nemovitosti - Formulář: Správa typů nemovitostí
- Nemovitosti - Formulář: Správa typů jednotek
- Nemovitosti - Formulář: Editace nemovitosti
- Nemovitosti - Formulář: Detail nemovitosti
- Nemovitosti - Formulář: Editace jednotky
- Nemovitosti - Formulář: Detail jednotky
- Smlouvy - Formulář: Detail smlouvy
- Služby - Formulář: Detail služby
- Platby - Formulář: Detail platby

### `updated_by`
**Počet použití:** 11

**Umístění:**
- Nemovitosti - Formulář: Nová nemovitost
- Nemovitosti - Formulář: Nová jednotka
- Nemovitosti - Formulář: Správa typů nemovitostí
- Nemovitosti - Formulář: Správa typů jednotek
- Nemovitosti - Formulář: Editace nemovitosti
- Nemovitosti - Formulář: Detail nemovitosti
- Nemovitosti - Formulář: Editace jednotky
- Nemovitosti - Formulář: Detail jednotky
- Smlouvy - Formulář: Detail smlouvy
- Služby - Formulář: Detail služby
- Platby - Formulář: Detail platby

### `created_at`
**Počet použití:** 11

**Umístění:**
- Nemovitosti - Formulář: Nová nemovitost
- Nemovitosti - Formulář: Nová jednotka
- Nemovitosti - Formulář: Správa typů nemovitostí
- Nemovitosti - Formulář: Správa typů jednotek
- Nemovitosti - Formulář: Editace nemovitosti
- Nemovitosti - Formulář: Detail nemovitosti
- Nemovitosti - Formulář: Editace jednotky
- Nemovitosti - Formulář: Detail jednotky
- Smlouvy - Formulář: Detail smlouvy
- Služby - Formulář: Detail služby
- Platby - Formulář: Detail platby

### `ico`
**Počet použití:** 10

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

### `nazev`
**Počet použití:** 10

**Umístění:**
- Nemovitosti - Formulář: Nová nemovitost
- Nemovitosti - Formulář: Nová jednotka
- Nemovitosti - Formulář: Správa typů nemovitostí
- Nemovitosti - Formulář: Správa typů jednotek
- Nemovitosti - Formulář: Editace nemovitosti
- Nemovitosti - Formulář: Detail nemovitosti
- Nemovitosti - Formulář: Editace jednotky
- Nemovitosti - Formulář: Detail jednotky
- Služby - Formulář: Detail služby
- Služby - Formulář: Editace služby

### `archived`
**Počet použití:** 9

**Umístění:**
- Nemovitosti - Formulář: Nová nemovitost
- Nemovitosti - Formulář: Nová jednotka
- Nemovitosti - Formulář: Správa typů nemovitostí
- Nemovitosti - Formulář: Správa typů jednotek
- Nemovitosti - Formulář: Editace nemovitosti
- Nemovitosti - Formulář: Detail nemovitosti
- Nemovitosti - Formulář: Editace jednotky
- Nemovitosti - Formulář: Detail jednotky
- Smlouvy - Formulář: Detail smlouvy

### `typ_nemovitosti`
**Počet použití:** 8

**Umístění:**
- Nemovitosti - Formulář: Nová nemovitost
- Nemovitosti - Formulář: Nová jednotka
- Nemovitosti - Formulář: Správa typů nemovitostí
- Nemovitosti - Formulář: Správa typů jednotek
- Nemovitosti - Formulář: Editace nemovitosti
- Nemovitosti - Formulář: Detail nemovitosti
- Nemovitosti - Formulář: Editace jednotky
- Nemovitosti - Formulář: Detail jednotky

### `ulice`
**Počet použití:** 8

**Umístění:**
- Nemovitosti - Formulář: Nová nemovitost
- Nemovitosti - Formulář: Nová jednotka
- Nemovitosti - Formulář: Správa typů nemovitostí
- Nemovitosti - Formulář: Správa typů jednotek
- Nemovitosti - Formulář: Editace nemovitosti
- Nemovitosti - Formulář: Detail nemovitosti
- Nemovitosti - Formulář: Editace jednotky
- Nemovitosti - Formulář: Detail jednotky

### `cislo_orientacni`
**Počet použití:** 8

**Umístění:**
- Nemovitosti - Formulář: Nová nemovitost
- Nemovitosti - Formulář: Nová jednotka
- Nemovitosti - Formulář: Správa typů nemovitostí
- Nemovitosti - Formulář: Správa typů jednotek
- Nemovitosti - Formulář: Editace nemovitosti
- Nemovitosti - Formulář: Detail nemovitosti
- Nemovitosti - Formulář: Editace jednotky
- Nemovitosti - Formulář: Detail jednotky

### `mesto`
**Počet použití:** 8

**Umístění:**
- Nemovitosti - Formulář: Nová nemovitost
- Nemovitosti - Formulář: Nová jednotka
- Nemovitosti - Formulář: Správa typů nemovitostí
- Nemovitosti - Formulář: Správa typů jednotek
- Nemovitosti - Formulář: Editace nemovitosti
- Nemovitosti - Formulář: Detail nemovitosti
- Nemovitosti - Formulář: Editace jednotky
- Nemovitosti - Formulář: Detail jednotky

### `psc`
**Počet použití:** 8

**Umístění:**
- Nemovitosti - Formulář: Nová nemovitost
- Nemovitosti - Formulář: Nová jednotka
- Nemovitosti - Formulář: Správa typů nemovitostí
- Nemovitosti - Formulář: Správa typů jednotek
- Nemovitosti - Formulář: Editace nemovitosti
- Nemovitosti - Formulář: Detail nemovitosti
- Nemovitosti - Formulář: Editace jednotky
- Nemovitosti - Formulář: Detail jednotky

### `kraj`
**Počet použití:** 8

**Umístění:**
- Nemovitosti - Formulář: Nová nemovitost
- Nemovitosti - Formulář: Nová jednotka
- Nemovitosti - Formulář: Správa typů nemovitostí
- Nemovitosti - Formulář: Správa typů jednotek
- Nemovitosti - Formulář: Editace nemovitosti
- Nemovitosti - Formulář: Detail nemovitosti
- Nemovitosti - Formulář: Editace jednotky
- Nemovitosti - Formulář: Detail jednotky

### `stat`
**Počet použití:** 8

**Umístění:**
- Nemovitosti - Formulář: Nová nemovitost
- Nemovitosti - Formulář: Nová jednotka
- Nemovitosti - Formulář: Správa typů nemovitostí
- Nemovitosti - Formulář: Správa typů jednotek
- Nemovitosti - Formulář: Editace nemovitosti
- Nemovitosti - Formulář: Detail nemovitosti
- Nemovitosti - Formulář: Editace jednotky
- Nemovitosti - Formulář: Detail jednotky

### `pocet_podlazi`
**Počet použití:** 8

**Umístění:**
- Nemovitosti - Formulář: Nová nemovitost
- Nemovitosti - Formulář: Nová jednotka
- Nemovitosti - Formulář: Správa typů nemovitostí
- Nemovitosti - Formulář: Správa typů jednotek
- Nemovitosti - Formulář: Editace nemovitosti
- Nemovitosti - Formulář: Detail nemovitosti
- Nemovitosti - Formulář: Editace jednotky
- Nemovitosti - Formulář: Detail jednotky

### `pocet_podzemních_podlazi`
**Počet použití:** 8

**Umístění:**
- Nemovitosti - Formulář: Nová nemovitost
- Nemovitosti - Formulář: Nová jednotka
- Nemovitosti - Formulář: Správa typů nemovitostí
- Nemovitosti - Formulář: Správa typů jednotek
- Nemovitosti - Formulář: Editace nemovitosti
- Nemovitosti - Formulář: Detail nemovitosti
- Nemovitosti - Formulář: Editace jednotky
- Nemovitosti - Formulář: Detail jednotky

### `rok_vystavby`
**Počet použití:** 8

**Umístění:**
- Nemovitosti - Formulář: Nová nemovitost
- Nemovitosti - Formulář: Nová jednotka
- Nemovitosti - Formulář: Správa typů nemovitostí
- Nemovitosti - Formulář: Správa typů jednotek
- Nemovitosti - Formulář: Editace nemovitosti
- Nemovitosti - Formulář: Detail nemovitosti
- Nemovitosti - Formulář: Editace jednotky
- Nemovitosti - Formulář: Detail jednotky

### `rok_rekonstrukce`
**Počet použití:** 8

**Umístění:**
- Nemovitosti - Formulář: Nová nemovitost
- Nemovitosti - Formulář: Nová jednotka
- Nemovitosti - Formulář: Správa typů nemovitostí
- Nemovitosti - Formulář: Správa typů jednotek
- Nemovitosti - Formulář: Editace nemovitosti
- Nemovitosti - Formulář: Detail nemovitosti
- Nemovitosti - Formulář: Editace jednotky
- Nemovitosti - Formulář: Detail jednotky

### `celkova_plocha`
**Počet použití:** 8

**Umístění:**
- Nemovitosti - Formulář: Nová nemovitost
- Nemovitosti - Formulář: Nová jednotka
- Nemovitosti - Formulář: Správa typů nemovitostí
- Nemovitosti - Formulář: Správa typů jednotek
- Nemovitosti - Formulář: Editace nemovitosti
- Nemovitosti - Formulář: Detail nemovitosti
- Nemovitosti - Formulář: Editace jednotky
- Nemovitosti - Formulář: Detail jednotky

### `pocet_jednotek`
**Počet použití:** 8

**Umístění:**
- Nemovitosti - Formulář: Nová nemovitost
- Nemovitosti - Formulář: Nová jednotka
- Nemovitosti - Formulář: Správa typů nemovitostí
- Nemovitosti - Formulář: Správa typů jednotek
- Nemovitosti - Formulář: Editace nemovitosti
- Nemovitosti - Formulář: Detail nemovitosti
- Nemovitosti - Formulář: Editace jednotky
- Nemovitosti - Formulář: Detail jednotky

### `spravce`
**Počet použití:** 8

**Umístění:**
- Nemovitosti - Formulář: Nová nemovitost
- Nemovitosti - Formulář: Nová jednotka
- Nemovitosti - Formulář: Správa typů nemovitostí
- Nemovitosti - Formulář: Správa typů jednotek
- Nemovitosti - Formulář: Editace nemovitosti
- Nemovitosti - Formulář: Detail nemovitosti
- Nemovitosti - Formulář: Editace jednotky
- Nemovitosti - Formulář: Detail jednotky

### `pronajimatel_id`
**Počet použití:** 8

**Umístění:**
- Nemovitosti - Formulář: Nová nemovitost
- Nemovitosti - Formulář: Nová jednotka
- Nemovitosti - Formulář: Správa typů nemovitostí
- Nemovitosti - Formulář: Správa typů jednotek
- Nemovitosti - Formulář: Editace nemovitosti
- Nemovitosti - Formulář: Detail nemovitosti
- Nemovitosti - Formulář: Editace jednotky
- Nemovitosti - Formulář: Detail jednotky

### `vybaveni`
**Počet použití:** 8

**Umístění:**
- Nemovitosti - Formulář: Nová nemovitost
- Nemovitosti - Formulář: Nová jednotka
- Nemovitosti - Formulář: Správa typů nemovitostí
- Nemovitosti - Formulář: Správa typů jednotek
- Nemovitosti - Formulář: Editace nemovitosti
- Nemovitosti - Formulář: Detail nemovitosti
- Nemovitosti - Formulář: Editace jednotky
- Nemovitosti - Formulář: Detail jednotky

### `prilohy`
**Počet použití:** 8

**Umístění:**
- Nemovitosti - Formulář: Nová nemovitost
- Nemovitosti - Formulář: Nová jednotka
- Nemovitosti - Formulář: Správa typů nemovitostí
- Nemovitosti - Formulář: Správa typů jednotek
- Nemovitosti - Formulář: Editace nemovitosti
- Nemovitosti - Formulář: Detail nemovitosti
- Nemovitosti - Formulář: Editace jednotky
- Nemovitosti - Formulář: Detail jednotky

### `pronajimatel`
**Počet použití:** 8

**Umístění:**
- Nemovitosti - Formulář: Nová nemovitost
- Nemovitosti - Formulář: Nová jednotka
- Nemovitosti - Formulář: Správa typů nemovitostí
- Nemovitosti - Formulář: Správa typů jednotek
- Nemovitosti - Formulář: Editace nemovitosti
- Nemovitosti - Formulář: Detail nemovitosti
- Nemovitosti - Formulář: Editace jednotky
- Nemovitosti - Formulář: Detail jednotky

### `zastupuje_id`
**Počet použití:** 6

**Umístění:**
- Uživatelé - Formulář: Formulář
- Uživatelé - Formulář: Nový / Pozvat
- Uživatelé - Formulář: Role & barvy
- Můj účet - Formulář: Upravit profil
- Pronajímatel - Přehled: Zástupci
- Nájemník - Přehled: Zástupci

### `id`
**Počet použití:** 6

**Umístění:**
- Pronajímatel - Přehled: Osoba
- Pronajímatel - Přehled: Firma
- Nájemník - Přehled: Firma
- Smlouvy - Formulář: Detail smlouvy
- Služby - Formulář: Detail služby
- Platby - Formulář: Detail platby

### `titul_pred`
**Počet použití:** 4

**Umístění:**
- Uživatelé - Formulář: Formulář
- Uživatelé - Formulář: Nový / Pozvat
- Uživatelé - Formulář: Role & barvy
- Můj účet - Formulář: Upravit profil

### `jmeno`
**Počet použití:** 4

**Umístění:**
- Uživatelé - Formulář: Formulář
- Uživatelé - Formulář: Nový / Pozvat
- Uživatelé - Formulář: Role & barvy
- Můj účet - Formulář: Upravit profil

### `prijmeni`
**Počet použití:** 4

**Umístění:**
- Uživatelé - Formulář: Formulář
- Uživatelé - Formulář: Nový / Pozvat
- Uživatelé - Formulář: Role & barvy
- Můj účet - Formulář: Upravit profil

### `titul_za`
**Počet použití:** 4

**Umístění:**
- Uživatelé - Formulář: Formulář
- Uživatelé - Formulář: Nový / Pozvat
- Uživatelé - Formulář: Role & barvy
- Můj účet - Formulář: Upravit profil

### `typ_dokladu`
**Počet použití:** 4

**Umístění:**
- Uživatelé - Formulář: Formulář
- Uživatelé - Formulář: Nový / Pozvat
- Uživatelé - Formulář: Role & barvy
- Můj účet - Formulář: Upravit profil

### `dic`
**Počet použití:** 4

**Umístění:**
- Uživatelé - Formulář: Formulář
- Uživatelé - Formulář: Nový / Pozvat
- Uživatelé - Formulář: Role & barvy
- Můj účet - Formulář: Upravit profil

### `country`
**Počet použití:** 4

**Umístění:**
- Uživatelé - Formulář: Formulář
- Uživatelé - Formulář: Nový / Pozvat
- Uživatelé - Formulář: Role & barvy
- Můj účet - Formulář: Upravit profil

### `street`
**Počet použití:** 4

**Umístění:**
- Uživatelé - Formulář: Formulář
- Uživatelé - Formulář: Nový / Pozvat
- Uživatelé - Formulář: Role & barvy
- Můj účet - Formulář: Upravit profil

### `zip`
**Počet použití:** 4

**Umístění:**
- Uživatelé - Formulář: Formulář
- Uživatelé - Formulář: Nový / Pozvat
- Uživatelé - Formulář: Role & barvy
- Můj účet - Formulář: Upravit profil

### `bankovni_ucet`
**Počet použití:** 4

**Umístění:**
- Uživatelé - Formulář: Formulář
- Uživatelé - Formulář: Nový / Pozvat
- Uživatelé - Formulář: Role & barvy
- Můj účet - Formulář: Upravit profil

### `contract_id`
**Počet použití:** 4

**Umístění:**
- Smlouvy - Formulář: Předávací protokol
- Služby - Formulář: Přidat službu do smlouvy
- Platby - Formulář: Detail platby
- Platby - Formulář: Vložit platbu

### `created_by`
**Počet použití:** 3

**Umístění:**
- Smlouvy - Formulář: Detail smlouvy
- Služby - Formulář: Detail služby
- Platby - Formulář: Detail platby

### `amount`
**Počet použití:** 3

**Umístění:**
- Platby - Formulář: Detail platby
- Platby - Formulář: Vložit platbu
- Platby - Formulář: Alokace platby

### `typ_subjektu`
**Počet použití:** 2

**Umístění:**
- Pronajímatel - Přehled: Přehled
- Nájemník - Přehled: Přehled

### `cislo_smlouvy`
**Počet použití:** 2

**Umístění:**
- Smlouvy - Formulář: Detail smlouvy
- Smlouvy - Formulář: Editace smlouvy

### `stav`
**Počet použití:** 2

**Umístění:**
- Smlouvy - Formulář: Detail smlouvy
- Smlouvy - Formulář: Editace smlouvy

### `landlord_id`
**Počet použití:** 2

**Umístění:**
- Smlouvy - Formulář: Detail smlouvy
- Smlouvy - Formulář: Editace smlouvy

### `tenant_id`
**Počet použití:** 2

**Umístění:**
- Smlouvy - Formulář: Detail smlouvy
- Smlouvy - Formulář: Editace smlouvy

### `property_id`
**Počet použití:** 2

**Umístění:**
- Smlouvy - Formulář: Detail smlouvy
- Smlouvy - Formulář: Editace smlouvy

### `unit_id`
**Počet použití:** 2

**Umístění:**
- Smlouvy - Formulář: Detail smlouvy
- Smlouvy - Formulář: Editace smlouvy

### `datum_zacatek`
**Počet použití:** 2

**Umístění:**
- Smlouvy - Formulář: Detail smlouvy
- Smlouvy - Formulář: Editace smlouvy

### `datum_konec`
**Počet použití:** 2

**Umístění:**
- Smlouvy - Formulář: Detail smlouvy
- Smlouvy - Formulář: Editace smlouvy

### `najem_vyse`
**Počet použití:** 2

**Umístění:**
- Smlouvy - Formulář: Detail smlouvy
- Smlouvy - Formulář: Editace smlouvy

### `periodicita_najmu`
**Počet použití:** 2

**Umístění:**
- Smlouvy - Formulář: Detail smlouvy
- Smlouvy - Formulář: Editace smlouvy

### `kauce_potreba`
**Počet použití:** 2

**Umístění:**
- Smlouvy - Formulář: Detail smlouvy
- Smlouvy - Formulář: Editace smlouvy

### `kauce_castka`
**Počet použití:** 2

**Umístění:**
- Smlouvy - Formulář: Detail smlouvy
- Smlouvy - Formulář: Editace smlouvy

### `kod`
**Počet použití:** 2

**Umístění:**
- Služby - Formulář: Detail služby
- Služby - Formulář: Editace služby

### `kategorie`
**Počet použití:** 2

**Umístění:**
- Služby - Formulář: Detail služby
- Služby - Formulář: Editace služby

### `popis`
**Počet použití:** 2

**Umístění:**
- Služby - Formulář: Detail služby
- Služby - Formulář: Editace služby

### `typ_uctovani`
**Počet použití:** 2

**Umístění:**
- Služby - Formulář: Detail služby
- Služby - Formulář: Editace služby

### `jednotka`
**Počet použití:** 2

**Umístění:**
- Služby - Formulář: Detail služby
- Služby - Formulář: Editace služby

### `zakladni_cena`
**Počet použití:** 2

**Umístění:**
- Služby - Formulář: Detail služby
- Služby - Formulář: Editace služby

### `sazba_dph`
**Počet použití:** 2

**Umístění:**
- Služby - Formulář: Detail služby
- Služby - Formulář: Editace služby

### `aktivni`
**Počet použití:** 2

**Umístění:**
- Služby - Formulář: Detail služby
- Služby - Formulář: Editace služby

### `payment_reference`
**Počet použití:** 2

**Umístění:**
- Platby - Formulář: Detail platby
- Platby - Formulář: Vložit platbu

### `payment_date`
**Počet použití:** 2

**Umístění:**
- Platby - Formulář: Detail platby
- Platby - Formulář: Vložit platbu

### `value_date`
**Počet použití:** 2

**Umístění:**
- Platby - Formulář: Detail platby
- Platby - Formulář: Vložit platbu

### `payment_type`
**Počet použití:** 2

**Umístění:**
- Platby - Formulář: Detail platby
- Platby - Formulář: Vložit platbu

### `payment_method`
**Počet použití:** 2

**Umístění:**
- Platby - Formulář: Detail platby
- Platby - Formulář: Vložit platbu

### `status`
**Počet použití:** 2

**Umístění:**
- Platby - Formulář: Detail platby
- Platby - Formulář: Vložit platbu

### `party_id`
**Počet použití:** 2

**Umístění:**
- Platby - Formulář: Detail platby
- Platby - Formulář: Vložit platbu

### `bank_transaction_id`
**Počet použití:** 2

**Umístění:**
- Platby - Formulář: Detail platby
- Platby - Formulář: Vložit platbu

### `role`
**Počet použití:** 1

**Umístění:**
- Uživatelé - Přehled: Přehled

### `email`
**Počet použití:** 1

**Umístění:**
- Uživatelé - Přehled: Přehled

### `stav_kauce`
**Počet použití:** 1

**Umístění:**
- Smlouvy - Formulář: Detail smlouvy

### `datum_predani`
**Počet použití:** 1

**Umístění:**
- Smlouvy - Formulář: Předávací protokol

### `typ_protokolu`
**Počet použití:** 1

**Umístění:**
- Smlouvy - Formulář: Předávací protokol

### `stav_jednotky`
**Počet použití:** 1

**Umístění:**
- Smlouvy - Formulář: Předávací protokol

### `meraky_stav`
**Počet použití:** 1

**Umístění:**
- Smlouvy - Formulář: Předávací protokol

### `service_definition_id`
**Počet použití:** 1

**Umístění:**
- Služby - Formulář: Přidat službu do smlouvy

### `mnozstvi`
**Počet použití:** 1

**Umístění:**
- Služby - Formulář: Přidat službu do smlouvy

### `cena_za_jednotku`
**Počet použití:** 1

**Umístění:**
- Služby - Formulář: Přidat službu do smlouvy

### `pausal`
**Počet použití:** 1

**Umístění:**
- Služby - Formulář: Přidat službu do smlouvy

### `currency`
**Počet použití:** 1

**Umístění:**
- Platby - Formulář: Detail platby

### `payment_id`
**Počet použití:** 1

**Umístění:**
- Platby - Formulář: Alokace platby

### `allocation_type`
**Počet použití:** 1

**Umístění:**
- Platby - Formulář: Alokace platby

### `period_from`
**Počet použití:** 1

**Umístění:**
- Platby - Formulář: Alokace platby

### `period_to`
**Počet použití:** 1

**Umístění:**
- Platby - Formulář: Alokace platby

### `soubor`
**Počet použití:** 1

**Umístění:**
- Platby - Formulář: Import plateb

### `format`
**Počet použití:** 1

**Umístění:**
- Platby - Formulář: Import plateb

### `automaticke_parovani`
**Počet použití:** 1

**Umístění:**
- Platby - Formulář: Import plateb

