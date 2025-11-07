# Implementace modulu Smlouvy a Služby - Souhrn

## Co bylo implementováno

Podle vašeho zadání byly implementovány následující funkce pro moduly **060-smlouva** a **070-sluzby**:

## ✅ 1. Číslování smluv

### Nastavení číslování
- **Kde:** Menu Smlouvy → Nastavení
- **Funkce:**
  - Konfigurovatelný prefix (můžete použít číslo nemovitosti/jednotky, např. "NEM01-JEDN05")
  - Výběr formátu číslování:
    - `PREFIX-ROK-ČÍSLO` → např. SML-2025-0001
    - `PREFIX-ČÍSLO` → např. SML-0001
    - `ROK-PREFIX-ČÍSLO` → např. 2025-SML-0001
    - A další...
  - Nastavení číselné řady (start, krok, počet cifer)
  - **Live náhled** vygenerovaného čísla
  - Každý uživatel si může nastavit vlastní formát

### Automatické generování
- Při vytvoření nové smlouvy se číslo **automaticky vygeneruje**
- Pokud generování selže, můžete zadat číslo ručně
- Číslo je **unikátní** díky databázové funkci

## ✅ 2. Časové omezení smlouvy

### Nové pole "Typ ukončení"
- **Na dobu určitou**
  - Vyžaduje datum začátku **a** datum konce
  - Pole "Datum konce" se zobrazí automaticky
  
- **Na dobu neurčitou**
  - Vyžaduje pouze datum začátku
  - Pole "Datum konce" se skryje
  - Konec se automaticky nastaví na `NULL` (neurčito)

## ✅ 3. Formulář smlouvy - výběr stran

### Automatické doplňování
1. **Vyberte jednotku** (povinné)
2. Systém automaticky doplní:
   - ✅ **Nemovitost** (read-only, nelze měnit)
   - ✅ **Pronajímatel** (read-only, nelze měnit)
3. **Vyberte nájemníka** (povinné)

### Logika propojení
- Jednotka → určuje nemovitost
- Nemovitost → určuje pronajímatele
- Proto nemůžete vybrat jiného pronajímatele ani jinou nemovitost

### Multi-select nájemníků
⏳ **Připraveno pro budoucí implementaci**
- Aktuálně můžete vybrat jednoho nájemníka
- V budoucnu bude možné vybrat více nájemníků (pokud mají stejnou jednotku)

## ✅ 4. Pole výše nájmu

### Aktuální stav
- Pole je **editovatelné**
- Můžete zadat částku ručně

### Budoucí vylepšení
⏳ **Připraveno pro implementaci:**
- Pole bude **automaticky vypočteno** ze služeb přiřazených ke smlouvě
- Pole bude **read-only** (nelze měnit ručně)
- Výpočet: součet všech služeb, které platí nájemník

## ✅ 5. Modul služeb - katalog

### Číslování služeb
- **Kde:** Menu Služby → Nastavení
- **Funkce:**
  - Konfigurovatelný kód služby
  - Prefix musí být **jedinečný** (některé služby budou propojené na měřidla)
  - Automatické generování kódu

### Pole služby

#### Základní údaje
- ✅ **Číslo služby** - automaticky generováno nebo vlastní
- ✅ **Název služby** - např. "Voda", "Elektřina"
- ✅ **Kategorie** - energie, voda, internet, správné poplatky, jiná

#### Výpočet služby
- ✅ **Na m²** - podle plochy jednotky
- ✅ **Podle měřidla** - měřená spotřeba
- ✅ **Na počet osob** - v nájmu
- ✅ **Na byt** - pevná sazba
- ✅ **Procento z nájmu**

#### Propojení na měřidlo
- ✅ **Ano/Ne** - přepínač
- ⏳ **Číslo měřidla** - připraveno pro modul 100 (v přípravě)

#### Cena
- ✅ **Cena za jednotku** - základní cena (Kč/m², Kč/kWh, atd.)
- ⏳ **Cena celkem** - bude vypočtena: výpočet × cena za jednotku

### Katalog vs. instance služby
- **Katalog služeb** (service_definitions) - globální definice služeb
- **Instance služby** (contract_service_lines) - služba přiřazená ke smlouvě
- ⏳ **UI pro přidání služby** ze katalogu ke smlouvě - připraveno

## ✅ 6. Záložky v detailu smlouvy

### Struktura záložek
Stejně jako v modulu Nemovitosti:

```
Smlouva | Služby | Platby | Systém
```

### Funkce každé záložky
- **Tabulka** s max 8 řádky (scroll)
- Klik na řádek → **detail pod tabulkou**
- **Read-only** (žádná editace v tabulce)
- Archivované šedé (opacity-50)
- Checkbox "Zobrazit archivované"

### Záložka "Služby"
- ✅ Seznam služeb přiřazených ke smlouvě
- ✅ Sloupce: Služba, Typ účtování, Cena, Platí
- ✅ Detail služby pod tabulkou
- ⏳ Tlačítko "Přidat službu" - připraveno

## 📊 Co funguje teď

### Smlouvy
1. ✅ Přehled všech smluv v tabulce
2. ✅ Vytvoření nové smlouvy
3. ✅ Auto-generování čísla smlouvy
4. ✅ Výběr jednotky → auto-fill nemovitosti a pronajímatele
5. ✅ Časové omezení (určitá/neurčitá doba)
6. ✅ Detail se záložkami
7. ✅ Nastavení číslování

### Služby
1. ✅ Katalog služeb v tabulce
2. ✅ Vytvoření nové služby
3. ✅ Auto-generování kódu služby
4. ✅ Kalkulace (typy účtování)
5. ✅ Propojení na měřidla (připraveno)
6. ✅ Detail se záložkami
7. ✅ Nastavení číslování

## 🔄 Co zbývá doimplementovat

### Multi-select nájemníků
- Výběr více nájemníků (musí mít stejnou jednotku)
- Validace při ukládání
- Aktualizace DB schématu (pokud potřeba)

### Automatický výpočet výše nájmu
- Pole "Výše nájmu" nastavit jako read-only
- Výpočet ze všech služeb přiřazených ke smlouvě
- Aktualizace při změně služeb

### UI pro přidání služby ke smlouvě
- Dialog/formulář pro výběr služby z katalogu
- Nastavení ceny a parametrů instance
- Tlačítko "Přidat službu" v záložce Služby

### Propojení na měřidla
- Čeká na implementaci modulu 100 (Měřidla)
- Výběr měřidla ze seznamu
- Zadání stavu měřidla

## 📚 Dokumentace

Kompletní dokumentace je v souboru:
**`docs/IMPLEMENTACE-SMLOUVY-SLUZBY.md`**

## 🚀 Jak to vyzkoušet

### 1. Nastavení číslování smluv
```
1. Menu: Smlouvy → Nastavení
2. Nastavte prefix, např. "NEM01"
3. Vyberte formát, např. "PREFIX-ROK-ČÍSLO"
4. Uložte
```

### 2. Vytvoření smlouvy
```
1. Menu: Smlouvy → Přehled → Přidat
2. Vyberte jednotku (automaticky se doplní nemovitost a pronajímatel)
3. Vyberte nájemníka
4. Vyberte typ ukončení (určitá/neurčitá doba)
5. Zadejte datum začátku (a konce pro dobu určitou)
6. Zadejte výše nájmu
7. Uložte → číslo smlouvy se vygeneruje automaticky
```

### 3. Vytvoření služby
```
1. Menu: Služby → Nastavení
2. Nastavte prefix, např. "SLU"
3. Uložte
4. Menu: Služby → Přehled → Přidat
5. Vyplňte název, kategorii, typ účtování
6. Zadejte cenu za jednotku
7. Uložte → kód služby se vygeneruje automaticky
```

## ❓ Otázky a problémy

Pokud něco nefunguje nebo máte dotazy:

1. Zkontrolujte databázi - tabulky `numbering_config`, `contracts`, `service_definitions` musí existovat
2. Zkontrolujte nastavení číslování - musí být aktivní
3. Podívejte se do konzole prohlížeče (F12) na chybové hlášky

## 📝 Poznámky

- Všechny změny byly implementovány v rámci existující struktury
- Dodrženy standardy aplikace (breadcrumbs, commonActions, atd.)
- Použity existující komponenty (renderTable, renderForm, renderTabs)
- Databázové funkce fungují přes Supabase RPC

---

**Verze:** 1.0  
**Datum:** 2025-11-07  
**Status:** ✅ Připraveno k testování
