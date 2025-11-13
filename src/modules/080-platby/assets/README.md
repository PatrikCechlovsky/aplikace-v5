# __MODULE_TITLE__ (šablona)
Krátký popis, k čemu modul slouží.

## Sekce
- Tiles: prehled, seznam
- Forms: detail, edit

## Rychlý test
1) Otevři modul v sidebaru → otevře se defaultní „seznam“.
2) Dvojklik na řádek → přepne na form „detail“.
3) Edit → Uložit → zpět

##Plná alokace (full)
  Platba pokryje celou fakturu. Faktura = paid.
  Příklad: platba 10 000 Kč → faktura 10 000 Kč = alokováno 10 000 Kč.

## Částečná alokace (partial)
  Platba kryje jen část faktury. Faktura zůstane částečně otevřená.
  Příklad: platba 6 000 Kč → faktura 10 000 Kč = alokováno 6 000 Kč, open 4 000 Kč.

## Rozdělená alokace / split (split)
  Jedna platba rozdělena na více faktur/účtů.
  Příklad: platba 10 000 Kč → faktura A 4 000 Kč + faktura B 6 000 Kč.
  
## Nealokovaná / nevyužitá část (unallocated / credit)
  Z platby zbyde přeplatek, nebo není přiřazena žádná faktura.
  Příklad: platba 12 000 Kč, žádné otevřené faktury → credit 12 000 Kč.
  
## Přepočítaná / měnová alokace (FX allocation)
  Alokace přes různé měny s uloženým kurzem a rozdílem z přepočtu.
  Příklad: platba USD přepočtena do CZK; v DB uchovat kurs a rozdíl.

## Refund / reversal
  Alokace, která vrací dřívější alokaci (storno, refund).
  Příklad: platba vrácena, alokace se zruší nebo vytvoří záporný záznam.

## Write-off / odpustění (write-off)
  Zbytková část faktury odpustíme místo dalšího vymáhání; často jako speciální typ alokace nebo adjustment.
  Příklad: faktura 100 Kč, zaplatí se 95 Kč, 5 Kč se odpustí.

## Automatická vs. Manuální alokace
  Automatická: pravidla (VS/ID match, amount tolerance) navrhnou nebo provedou alokaci.
  Manuální: uživatel ručně přiřadí platby k fakturám.

## Provisional / pending alokace
  Dočasná alokace před potvrzením bankou (např. bankovní import s návrhy, ale neaplikované).
  Příklad: bankovní import navrhne alokace, administrátor potvrdí.

## Alokace na položky faktury (line-item allocation)
  Alokace se váže ke konkrétním položkám faktury (např. záloha na konkrétní službu).
  Alokace s rozúčtováním mezi subjekty / více nájemníků

Platba přiřazena částečně různým entitám.
Praktické obchodní pravidla (důležité implementovat)

Nesmíš alokovat více než zůstatek platby bez vytvoření credit záznamu.
Nesmíš alokovat více než open balance faktury (pokud neumožňuješ přeplatek).
Zaokrouhlování: povolit malou toleranci (např. 0.01) pro měnové rozdíly.
Audit trail: kdo, kdy, proč změnil alokaci (povinné).
Stav alokace: pending → confirmed → reversed.
Oprávnění: kdo může přidávat/mazat/odsouhlasit alokace.
