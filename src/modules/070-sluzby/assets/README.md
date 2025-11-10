# Modul 070 - Služby

Modul pro správu katalogu služeb a jejich přiřazení ke smlouvám.

## Účel modulu

Tento modul umožňuje:
- **Správu katalogu služeb** - centrální evidence všech nabízených služeb (voda, elektřina, plyn, internet, správní poplatky atd.)
- **Přiřazování služeb ke smlouvám** - definice, které služby jsou součástí konkrétní nájemní smlouvy
- **Výpočet nákladů** - automatický výpočet měsíčních nákladů podle typu účtování
- **Kategorizaci služeb** - rozdělení do logických kategorií (energie, voda, internet, správní poplatky)

## Tiles (Přehledy)

### prehled
- **Ikona:** list
- **Popis:** Hlavní přehled všech aktivních služeb z katalogu
- **Akce:** add, edit, archive, refresh
- **Sloupce:** kod, nazev, kategorie, typ_uctovani, zakladni_cena, jednotka, aktivni

### katalog
- **Ikona:** list_alt
- **Popis:** Kompletní katalog všech služeb včetně neaktivních
- **Akce:** add, edit, refresh

### energie
- **Ikona:** bolt
- **Popis:** Filtrovaný pohled pouze na energetické služby (elektřina, plyn, teplo)
- **Akce:** add, edit, refresh

### voda
- **Ikona:** water_drop
- **Popis:** Filtrovaný pohled pouze na vodní služby (studená a teplá voda)
- **Akce:** add, edit, refresh

### internet
- **Ikona:** wifi
- **Popis:** Filtrovaný pohled pouze na internetové služby
- **Akce:** add, edit, refresh

### spravne-poplatky
- **Ikona:** account_balance
- **Popis:** Filtrovaný pohled na správní poplatky (fond oprav, úklid, správa)
- **Akce:** add, edit, refresh

### seznam
- **Ikona:** list
- **Popis:** Přehled služeb přiřazených ke smlouvám
- **Sloupce:** contract_cislo, nazev, plati, cena_za_jednotku, odhadovane_mesicni_naklady, od_data, do_data

### nastaveni
- **Ikona:** settings
- **Popis:** Nastavení modulu

## Forms (Formuláře)

### detail
- **Ikona:** visibility
- **Popis:** Read-only detail služby z katalogu
- **Akce:** edit, archive, history, refresh
- **Sekce:** Základní údaje, Účtování, Stav, Systémové údaje

### edit
- **Ikona:** edit
- **Popis:** Formulář pro vytvoření nové nebo editaci existující služby
- **Akce:** save, archive (při editaci), history (při editaci)
- **Pole:** kod, nazev, popis, kategorie, typ_uctovani, jednotka, zakladni_cena, sazba_dph, aktivni, poznamky

### pridat-do-smlouvy
- **Ikona:** add_circle
- **Popis:** Formulář pro přidání služby ke smlouvě
- **Pole:** service_definition_id, nazev, plati, cena_za_jednotku, zaklad_pro_vypocet, perioda_fakturace, od_data, do_data

## Rychlý test

1. **Otevření modulu:** 
   - Klikni na "Služby" v sidebaru → otevře se defaultní tile "prehled"

2. **Prohlížení katalogu:**
   - Prohlédni si seznam základních služeb (VODA, ELEKTRINA, PLYN, INTERNET atd.)
   - Zkus filtry podle kategorií (Energie, Voda, Internet)

3. **Vytvoření nové služby:**
   - Klikni na "Přidat" → otevře se formulář pro novou službu
   - Vyplň: kod="TEST", nazev="Testovací služba", kategorie="jina", typ_uctovani="pevna_sazba"
   - Ulož → přesměrování na detail

4. **Editace služby:**
   - V přehledu vyber službu a klikni na "Upravit"
   - Změň některé pole a ulož
   - Ověř, že změna byla uložena

5. **Detail služby:**
   - Dvojklik na řádek v tabulce → otevře se detail služby
   - Ověř, že všechny údaje jsou správně zobrazeny

6. **Integrace se smlouvami:**
   - Otevři modul 060 (Smlouvy)
   - Otevři detail smlouvy
   - Přidej službu ze modulu 070
   - Ověř výpočet měsíčních nákladů

## Databázové tabulky

### service_definitions
- Katalog všech dostupných služeb
- Obsahuje základní definice (kód, název, typ účtování, základní cenu)
- RLS: Všichni mohou číst, pouze admin/manager může upravovat

### contract_service_lines
- Služby přiřazené ke konkrétním smlouvám
- Obsahuje konkrétní ceny a podmínky pro danou smlouvu
- Automatický výpočet měsíčních nákladů

## Integrace s ostatními moduly

- **Modul 060 (Smlouvy):** Služby se přiřazují ke smlouvám
- **Modul 080 (Platby):** Služby ovlivňují výpočet plateb
- **Modul 040 (Nemovitosti):** Některé služby mohou být vázány na jednotky (m²)

## Další dokumentace

- **SPECIFIKACE-PRO-AGENTA.md** - Kompletní specifikace pro AI implementaci
- **datovy-model.md** - Detailní popis databázového modelu
- **permissions.md** - Přehled oprávnění a rolí
- **checklist.md** - Kontrolní seznam pro implementaci
