# Návod: Jak používat Přehled vazeb (Detail Tabs)

## Co je Přehled vazeb?

Přehled vazeb je nová funkce přidaná v PR#51 a PR#52, která umožňuje zobrazit všechny vztahy a související entity v jednom přehledném pohledu. Každý modul má svůj vlastní pohled s relevantními záložkami.

## Kde najdu Přehled vazeb?

### Metoda 1: Tlačítko v detailu entity

Ve všech hlavních modulech (030, 040, 050, 060, 080) nyní najdete tlačítko **"Přehled vazeb"** (ikona mřížky) v horní části stránky s detailem entity:

1. Otevřete detail libovolné entity (pronajímatel, nemovitost, nájemník, smlouva, platba)
2. V horní části stránky najdete ikonové tlačítko s mřížkou
3. Klikněte na tlačítko pro otevření přehledu vazeb

### Metoda 2: Přímý URL přístup

Můžete také použít přímé URL adresy:

**Modul 020 - Můj účet:**
```
#/m/020-muj-ucet/f/detail
```
- Zobrazuje 3 záložky: Pronajímatelé, Nemovitosti, Jednotky

**Modul 030 - Pronajímatel:**
```
#/m/030-pronajimatel/f/detail-tabs?id={ID_PRONAJIMATELE}
```
- Zobrazuje 5 záložek: Nemovitosti, Jednotky, Nájemníci, Smlouvy, Platby

**Modul 040 - Nemovitost:**
```
#/m/040-nemovitost/f/detail-tabs?id={ID_NEMOVITOSTI}
```
- Zobrazuje 5 záložek: Pronajímatelé, Jednotky, Nájemníci, Smlouvy, Platby

**Modul 050 - Nájemník:**
```
#/m/050-najemnik/f/detail-tabs?id={ID_NAJEMNIKA}
```
- Zobrazuje 5 záložek: Pronajímatelé, Nemovitosti, Jednotky, Smlouvy, Platby

**Modul 060 - Smlouva:**
```
#/m/060-smlouva/f/detail-tabs?id={ID_SMLOUVY}
```
- Zobrazuje 5 záložek: Pronajímatel, Nemovitost, Jednotka, Nájemník, Platby

**Modul 080 - Platby:**
```
#/m/080-platby/f/detail-tabs?id={ID_PLATBY}
```
- Zobrazuje 5 záložek: Smlouva, Pronajímatel, Nájemník, Nemovitost, Jednotka

## Jak používat Přehled vazeb?

### 1. Navigace mezi záložkami
- Klikněte na libovolnou záložku pro zobrazení souvisejících entit
- URL se automaticky aktualizuje s parametrem `?tab={nazev_zalozky}`

### 2. Prohlížení seznamu
- Každá záložka zobrazuje maximálně 10 položek
- Seznam je scrollovatelný
- Kliknutím na řádek zobrazíte detail v dolní části

### 3. Zobrazení detailu
- Po kliknutí na řádek se zobrazí detail entity v dolní části stránky
- Detail obsahuje hlavní informace a systémová metadata (vytvořeno, upraveno, atd.)

### 4. Otevření plného detailu
- Dvojklikem na řádek otevřete plný detail entity v jejím modulu
- Nebo klikněte pravým tlačítkem a otevřete odkaz v nové záložce

## Příklady použití

### Příklad 1: Přehled pronajímatele
1. Otevřete detail pronajímatele
2. Klikněte na tlačítko "Přehled vazeb"
3. Uvidíte všechny nemovitosti, jednotky, nájemníky, smlouvy a platby tohoto pronajímatele
4. Přepínejte mezi záložkami pro různé pohledy

### Příklad 2: Přehled smlouvy
1. Otevřete detail smlouvy
2. Klikněte na tlačítko "Přehled vazeb"
3. Uvidíte pronajímatele, nemovitost, jednotku, nájemníka a všechny platby spojené s touto smlouvou
4. Dvojklikem na jakoukoliv entitu otevřete její plný detail

### Příklad 3: Můj účet - celkový přehled
1. V modulu "Můj účet" klikněte na tlačítko "Přehled entit" nebo otevřete formulář "Přehled" z postranní lišty
2. Uvidíte kompletní přehled všech vašich pronajímatelů, nemovitostí a jednotek
3. Ideální pro rychlý přehled celého portfolia

## Výhody použití Přehledu vazeb

✅ **Rychlý přehled** - všechny související entity na jednom místě  
✅ **Jednoduchá navigace** - dvojklik pro otevření plného detailu  
✅ **Přehledné záložky** - logické rozdělení podle typů entit  
✅ **Kompaktní zobrazení** - maximálně 10 položek na záložku  
✅ **Systémové informace** - vidíte kdy byla entita vytvořena a upravena  

## Tipy a triky

💡 **Tip 1:** Použijte URL parametr `?tab=` pro přímé otevření konkrétní záložky  
Např: `#/m/030-pronajimatel/f/detail-tabs?id=123&tab=smlouva`

💡 **Tip 2:** Seznam je omezen na 10 položek - pro zobrazení všech položek použijte původní přehled modulu

💡 **Tip 3:** Můžete používat klávesové zkratky Tab a Enter pro navigaci v seznamu

## Podpora a feedback

Pokud narazíte na problém nebo máte návrh na vylepšení, vytvořte prosím issue v GitHub repozitáři.

---

**Verze dokumentu:** 1.0  
**Datum:** 12. listopadu 2025  
**Související PR:** #51, #52
