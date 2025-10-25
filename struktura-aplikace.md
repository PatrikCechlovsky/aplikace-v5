# Struktura aplikace - Analýza modulů

Datum vytvoření: 25. 10. 2025 4:50:06

## Obsah

- [Uživatelé (010-sprava-uzivatelu)](#010spravauzivatelu)
- [Můj účet (020-muj-ucet)](#020mujucet)
- [Pronajímatel (030-pronajimatel)](#030pronajimatel)
- [Přehled (040-nemovitost)](#040nemovitost)
- [Nájemník (050-najemnik)](#050najemnik)

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

#### Formulář (`form`)
- **Ikona:** `form`
- **Akce:** archive, attach, history, save

---

## Přehled (040-nemovitost)

**Ikona modulu:** `list`

### Formuláře (Forms)

#### Nová nemovitost (`edit`)
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

#### Nová jednotka (`unit-edit`)
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

#### Výběr typu nemovitosti (`chooser`)
- **Ikona:** `grid`
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

#### Výběr typu jednotky (`unit-chooser`)
- **Ikona:** `grid`
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

#### Formulář (`form`)
- **Ikona:** `form`
- **Akce:** archive, attach, history, save

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
- Přehled - Formulář: Nová nemovitost
- Přehled - Formulář: Detail nemovitosti
- Přehled - Formulář: Nová jednotka
- Přehled - Formulář: Detail jednotky
- Přehled - Formulář: Výběr typu nemovitosti
- Přehled - Formulář: Výběr typu jednotky
- Přehled - Formulář: Správa typů nemovitostí
- Přehled - Formulář: Správa typů jednotek

### `archivedLabel`
**Počet použití:** 11

**Umístění:**
- Uživatelé - Přehled: Přehled
- Pronajímatel - Přehled: Přehled
- Přehled - Formulář: Nová nemovitost
- Přehled - Formulář: Detail nemovitosti
- Přehled - Formulář: Nová jednotka
- Přehled - Formulář: Detail jednotky
- Přehled - Formulář: Výběr typu nemovitosti
- Přehled - Formulář: Výběr typu jednotky
- Přehled - Formulář: Správa typů nemovitostí
- Přehled - Formulář: Správa typů jednotek
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
**Počet použití:** 8

**Umístění:**
- Přehled - Formulář: Nová nemovitost
- Přehled - Formulář: Detail nemovitosti
- Přehled - Formulář: Nová jednotka
- Přehled - Formulář: Detail jednotky
- Přehled - Formulář: Výběr typu nemovitosti
- Přehled - Formulář: Výběr typu jednotky
- Přehled - Formulář: Správa typů nemovitostí
- Přehled - Formulář: Správa typů jednotek

### `typ_nemovitosti`
**Počet použití:** 8

**Umístění:**
- Přehled - Formulář: Nová nemovitost
- Přehled - Formulář: Detail nemovitosti
- Přehled - Formulář: Nová jednotka
- Přehled - Formulář: Detail jednotky
- Přehled - Formulář: Výběr typu nemovitosti
- Přehled - Formulář: Výběr typu jednotky
- Přehled - Formulář: Správa typů nemovitostí
- Přehled - Formulář: Správa typů jednotek

### `ulice`
**Počet použití:** 8

**Umístění:**
- Přehled - Formulář: Nová nemovitost
- Přehled - Formulář: Detail nemovitosti
- Přehled - Formulář: Nová jednotka
- Přehled - Formulář: Detail jednotky
- Přehled - Formulář: Výběr typu nemovitosti
- Přehled - Formulář: Výběr typu jednotky
- Přehled - Formulář: Správa typů nemovitostí
- Přehled - Formulář: Správa typů jednotek

### `cislo_orientacni`
**Počet použití:** 8

**Umístění:**
- Přehled - Formulář: Nová nemovitost
- Přehled - Formulář: Detail nemovitosti
- Přehled - Formulář: Nová jednotka
- Přehled - Formulář: Detail jednotky
- Přehled - Formulář: Výběr typu nemovitosti
- Přehled - Formulář: Výběr typu jednotky
- Přehled - Formulář: Správa typů nemovitostí
- Přehled - Formulář: Správa typů jednotek

### `mesto`
**Počet použití:** 8

**Umístění:**
- Přehled - Formulář: Nová nemovitost
- Přehled - Formulář: Detail nemovitosti
- Přehled - Formulář: Nová jednotka
- Přehled - Formulář: Detail jednotky
- Přehled - Formulář: Výběr typu nemovitosti
- Přehled - Formulář: Výběr typu jednotky
- Přehled - Formulář: Správa typů nemovitostí
- Přehled - Formulář: Správa typů jednotek

### `psc`
**Počet použití:** 8

**Umístění:**
- Přehled - Formulář: Nová nemovitost
- Přehled - Formulář: Detail nemovitosti
- Přehled - Formulář: Nová jednotka
- Přehled - Formulář: Detail jednotky
- Přehled - Formulář: Výběr typu nemovitosti
- Přehled - Formulář: Výběr typu jednotky
- Přehled - Formulář: Správa typů nemovitostí
- Přehled - Formulář: Správa typů jednotek

### `kraj`
**Počet použití:** 8

**Umístění:**
- Přehled - Formulář: Nová nemovitost
- Přehled - Formulář: Detail nemovitosti
- Přehled - Formulář: Nová jednotka
- Přehled - Formulář: Detail jednotky
- Přehled - Formulář: Výběr typu nemovitosti
- Přehled - Formulář: Výběr typu jednotky
- Přehled - Formulář: Správa typů nemovitostí
- Přehled - Formulář: Správa typů jednotek

### `stat`
**Počet použití:** 8

**Umístění:**
- Přehled - Formulář: Nová nemovitost
- Přehled - Formulář: Detail nemovitosti
- Přehled - Formulář: Nová jednotka
- Přehled - Formulář: Detail jednotky
- Přehled - Formulář: Výběr typu nemovitosti
- Přehled - Formulář: Výběr typu jednotky
- Přehled - Formulář: Správa typů nemovitostí
- Přehled - Formulář: Správa typů jednotek

### `pocet_podlazi`
**Počet použití:** 8

**Umístění:**
- Přehled - Formulář: Nová nemovitost
- Přehled - Formulář: Detail nemovitosti
- Přehled - Formulář: Nová jednotka
- Přehled - Formulář: Detail jednotky
- Přehled - Formulář: Výběr typu nemovitosti
- Přehled - Formulář: Výběr typu jednotky
- Přehled - Formulář: Správa typů nemovitostí
- Přehled - Formulář: Správa typů jednotek

### `pocet_podzemních_podlazi`
**Počet použití:** 8

**Umístění:**
- Přehled - Formulář: Nová nemovitost
- Přehled - Formulář: Detail nemovitosti
- Přehled - Formulář: Nová jednotka
- Přehled - Formulář: Detail jednotky
- Přehled - Formulář: Výběr typu nemovitosti
- Přehled - Formulář: Výběr typu jednotky
- Přehled - Formulář: Správa typů nemovitostí
- Přehled - Formulář: Správa typů jednotek

### `rok_vystavby`
**Počet použití:** 8

**Umístění:**
- Přehled - Formulář: Nová nemovitost
- Přehled - Formulář: Detail nemovitosti
- Přehled - Formulář: Nová jednotka
- Přehled - Formulář: Detail jednotky
- Přehled - Formulář: Výběr typu nemovitosti
- Přehled - Formulář: Výběr typu jednotky
- Přehled - Formulář: Správa typů nemovitostí
- Přehled - Formulář: Správa typů jednotek

### `rok_rekonstrukce`
**Počet použití:** 8

**Umístění:**
- Přehled - Formulář: Nová nemovitost
- Přehled - Formulář: Detail nemovitosti
- Přehled - Formulář: Nová jednotka
- Přehled - Formulář: Detail jednotky
- Přehled - Formulář: Výběr typu nemovitosti
- Přehled - Formulář: Výběr typu jednotky
- Přehled - Formulář: Správa typů nemovitostí
- Přehled - Formulář: Správa typů jednotek

### `celkova_plocha`
**Počet použití:** 8

**Umístění:**
- Přehled - Formulář: Nová nemovitost
- Přehled - Formulář: Detail nemovitosti
- Přehled - Formulář: Nová jednotka
- Přehled - Formulář: Detail jednotky
- Přehled - Formulář: Výběr typu nemovitosti
- Přehled - Formulář: Výběr typu jednotky
- Přehled - Formulář: Správa typů nemovitostí
- Přehled - Formulář: Správa typů jednotek

### `pocet_jednotek`
**Počet použití:** 8

**Umístění:**
- Přehled - Formulář: Nová nemovitost
- Přehled - Formulář: Detail nemovitosti
- Přehled - Formulář: Nová jednotka
- Přehled - Formulář: Detail jednotky
- Přehled - Formulář: Výběr typu nemovitosti
- Přehled - Formulář: Výběr typu jednotky
- Přehled - Formulář: Správa typů nemovitostí
- Přehled - Formulář: Správa typů jednotek

### `spravce`
**Počet použití:** 8

**Umístění:**
- Přehled - Formulář: Nová nemovitost
- Přehled - Formulář: Detail nemovitosti
- Přehled - Formulář: Nová jednotka
- Přehled - Formulář: Detail jednotky
- Přehled - Formulář: Výběr typu nemovitosti
- Přehled - Formulář: Výběr typu jednotky
- Přehled - Formulář: Správa typů nemovitostí
- Přehled - Formulář: Správa typů jednotek

### `pronajimatel_id`
**Počet použití:** 8

**Umístění:**
- Přehled - Formulář: Nová nemovitost
- Přehled - Formulář: Detail nemovitosti
- Přehled - Formulář: Nová jednotka
- Přehled - Formulář: Detail jednotky
- Přehled - Formulář: Výběr typu nemovitosti
- Přehled - Formulář: Výběr typu jednotky
- Přehled - Formulář: Správa typů nemovitostí
- Přehled - Formulář: Správa typů jednotek

### `poznamky`
**Počet použití:** 8

**Umístění:**
- Přehled - Formulář: Nová nemovitost
- Přehled - Formulář: Detail nemovitosti
- Přehled - Formulář: Nová jednotka
- Přehled - Formulář: Detail jednotky
- Přehled - Formulář: Výběr typu nemovitosti
- Přehled - Formulář: Výběr typu jednotky
- Přehled - Formulář: Správa typů nemovitostí
- Přehled - Formulář: Správa typů jednotek

### `vybaveni`
**Počet použití:** 8

**Umístění:**
- Přehled - Formulář: Nová nemovitost
- Přehled - Formulář: Detail nemovitosti
- Přehled - Formulář: Nová jednotka
- Přehled - Formulář: Detail jednotky
- Přehled - Formulář: Výběr typu nemovitosti
- Přehled - Formulář: Výběr typu jednotky
- Přehled - Formulář: Správa typů nemovitostí
- Přehled - Formulář: Správa typů jednotek

### `prilohy`
**Počet použití:** 8

**Umístění:**
- Přehled - Formulář: Nová nemovitost
- Přehled - Formulář: Detail nemovitosti
- Přehled - Formulář: Nová jednotka
- Přehled - Formulář: Detail jednotky
- Přehled - Formulář: Výběr typu nemovitosti
- Přehled - Formulář: Výběr typu jednotky
- Přehled - Formulář: Správa typů nemovitostí
- Přehled - Formulář: Správa typů jednotek

### `pronajimatel`
**Počet použití:** 8

**Umístění:**
- Přehled - Formulář: Nová nemovitost
- Přehled - Formulář: Detail nemovitosti
- Přehled - Formulář: Nová jednotka
- Přehled - Formulář: Detail jednotky
- Přehled - Formulář: Výběr typu nemovitosti
- Přehled - Formulář: Výběr typu jednotky
- Přehled - Formulář: Správa typů nemovitostí
- Přehled - Formulář: Správa typů jednotek

### `archived`
**Počet použití:** 8

**Umístění:**
- Přehled - Formulář: Nová nemovitost
- Přehled - Formulář: Detail nemovitosti
- Přehled - Formulář: Nová jednotka
- Přehled - Formulář: Detail jednotky
- Přehled - Formulář: Výběr typu nemovitosti
- Přehled - Formulář: Výběr typu jednotky
- Přehled - Formulář: Správa typů nemovitostí
- Přehled - Formulář: Správa typů jednotek

### `updated_at`
**Počet použití:** 8

**Umístění:**
- Přehled - Formulář: Nová nemovitost
- Přehled - Formulář: Detail nemovitosti
- Přehled - Formulář: Nová jednotka
- Přehled - Formulář: Detail jednotky
- Přehled - Formulář: Výběr typu nemovitosti
- Přehled - Formulář: Výběr typu jednotky
- Přehled - Formulář: Správa typů nemovitostí
- Přehled - Formulář: Správa typů jednotek

### `updated_by`
**Počet použití:** 8

**Umístění:**
- Přehled - Formulář: Nová nemovitost
- Přehled - Formulář: Detail nemovitosti
- Přehled - Formulář: Nová jednotka
- Přehled - Formulář: Detail jednotky
- Přehled - Formulář: Výběr typu nemovitosti
- Přehled - Formulář: Výběr typu jednotky
- Přehled - Formulář: Správa typů nemovitostí
- Přehled - Formulář: Správa typů jednotek

### `created_at`
**Počet použití:** 8

**Umístění:**
- Přehled - Formulář: Nová nemovitost
- Přehled - Formulář: Detail nemovitosti
- Přehled - Formulář: Nová jednotka
- Přehled - Formulář: Detail jednotky
- Přehled - Formulář: Výběr typu nemovitosti
- Přehled - Formulář: Výběr typu jednotky
- Přehled - Formulář: Správa typů nemovitostí
- Přehled - Formulář: Správa typů jednotek

### `zastupuje_id`
**Počet použití:** 6

**Umístění:**
- Uživatelé - Formulář: Formulář
- Uživatelé - Formulář: Nový / Pozvat
- Uživatelé - Formulář: Role & barvy
- Můj účet - Formulář: Upravit profil
- Pronajímatel - Přehled: Zástupci
- Nájemník - Přehled: Zástupci

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

