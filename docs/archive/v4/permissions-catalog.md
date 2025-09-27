# Centrální katalog oprávnění napříč aplikací

Tento katalog obsahuje základní sadu oprávnění (práv) pro všechny moduly, sekce a dlaždice.  
Při přidávání/úpravě modulů rozšiř tento katalog o nové entity.

---

## Vzorová struktura oprávnění

- `modul.sekce.zobrazit` — právo zobrazit sekci/entitu
- `modul.sekce.editovat` — právo editovat údaje v sekci
- `modul.sekce.pridat` — právo přidat nový záznam
- `modul.sekce.mazat` — právo smazat záznam
- `modul.sekce.schvalovat` — právo schvalovat (pokud relevantní)
- `modul.sekce.exportovat` — právo exportovat data
- `modul.sekce.importovat` — právo importovat data
- `modul.sekce.audit` — právo zobrazit historii/audit
- `modul.sekce.notifikace` — právo nastavovat/zobrazovat notifikace
- `modul.sekce.resetovat` — právo resetovat nastavení/údaje

---

## Hierarchie oprávnění podle modulů

### 1. Správa uživatelů

- spravauzivatelu.seznam.zobrazit, pridat, editovat, mazat, exportovat, importovat, audit, schvalovat, notifikace
- spravauzivatelu.detail.zobrazit, editovat, blokovat, odblokovat, archivovat, odeslatpozvanku, resetovatheslo, spravovatopravneni, dokumenty, audit
- spravauzivatelu.role.zobrazit, pridat, editovat, mazat, audit
- spravauzivatelu.pozvanky.zobrazit, pridat, editovat, mazat, odeslat, stornovat, audit
- spravauzivatelu.licence.zobrazit, pridat, editovat, mazat, audit
- spravauzivatelu.importexport.zobrazit, exportovat, importovat, audit

### 2. Můj účet

- mujucet.udaje.zobrazit, editovat
- mujucet.bezpecnost.zobrazit, editovat, resetovat
- mujucet.notifikace.zobrazit, editovat
- mujucet.nastaveni.zobrazit, editovat, resetovat
- mujucet.aktivita.zobrazit

### 3. Pronajímatel

- pronajimatel.seznam.zobrazit, pridat, editovat, mazat, exportovat, audit
- pronajimatel.detail.zobrazit, editovat, audit

### 4. Nemovitost

- nemovitost.seznam.zobrazit, pridat, editovat, mazat, exportovat, importovat, audit
- nemovitost.jednotky.zobrazit, pridat, editovat, mazat, exportovat, audit
- nemovitost.detail.zobrazit, editovat, audit

### 5. Nájemník

- najemnik.seznam.zobrazit, pridat, editovat, mazat, exportovat, importovat, audit
- najemnik.detail.zobrazit, editovat, audit

### 6. Smlouva

- smlouva.najemni.zobrazit, pridat, editovat, mazat, exportovat, importovat, audit, schvalovat, podepsat
- smlouva.vzor.zobrazit, pridat, editovat, mazat, exportovat, audit
- smlouva.protokol.zobrazit, pridat, editovat, mazat, exportovat, audit
- smlouva.archiv.zobrazit, exportovat, audit

### 7. Služby

- sluzby.zalohy.zobrazit, pridat, editovat, mazat, exportovat, audit
- sluzby.kauce.zobrazit, pridat, editovat, mazat, exportovat, audit
- sluzby.platby.zobrazit, pridat, editovat, mazat, exportovat, importovat, audit
- sluzby.meridla.zobrazit, pridat, editovat, mazat, exportovat, audit
- sluzby.vyuctovani.zobrazit, exportovat, audit

### 8. Platby

- platby.seznam.zobrazit, pridat, editovat, mazat, exportovat, importovat, audit, schvalovat, upominka
- platby.detail.zobrazit, editovat, audit

### 9. Finance

- finance.dashboard.zobrazit
- finance.prijmy.zobrazit, pridat, editovat, mazat, exportovat, importovat, audit
- finance.naklady.zobrazit, pridat, editovat, mazat, exportovat, importovat, audit
- finance.dane.zobrazit, pridat, editovat, mazat, exportovat, importovat, audit

### 10. Energie

- energie.prehled.zobrazit, exportovat
- energie.odecet.zobrazit, pridat, editovat, mazat, exportovat, importovat, audit
- energie.grafy.zobrazit, exportovat
- energie.vyuctovani.zobrazit, exportovat

### 11. Údržba

- udrzba.hlaseni.zobrazit, pridat, editovat, mazat, exportovat, importovat, audit, schvalovat
- udrzba.plan.zobrazit, pridat, editovat, mazat, exportovat, audit
- udrzba.opravy.zobrazit, pridat, editovat, mazat, exportovat, audit
- udrzba.zarizeni.zobrazit, pridat, editovat, mazat, exportovat, audit

### 12. Komunikace

- komunikace.prehled.zobrazit, exportovat, audit
- komunikace.detail.zobrazit, editovat, audit
- komunikace.sablony.zobrazit, pridat, editovat, mazat, exportovat, audit
- komunikace.odesilani.zobrazit, pridat, audit
- komunikace.nastaveni.zobrazit, editovat
- komunikace.upominka.zobrazit, odeslat

### 13. Dokumenty

- dokumenty.seznam.zobrazit, pridat, editovat, mazat, exportovat, importovat, audit, schvalovat, podepsat
- dokumenty.sablony.zobrazit, pridat, editovat, mazat, exportovat, audit
- dokumenty.tvorba.zobrazit, pridat, editovat, mazat, exportovat, audit
- dokumenty.personalizace.zobrazit, editovat
- dokumenty.podpis.zobrazit, editovat
- dokumenty.prilohy.zobrazit, pridat, mazat, stahnout

### 14. Nastavení (globální, systémová)

- nastaveni.ciselniky.zobrazit, pridat, editovat, mazat, exportovat, importovat, audit
- nastaveni.zalohy.zobrazit, editovat, exportovat, audit, obnovit
- nastaveni.vzhled.zobrazit, editovat, resetovat
- nastaveni.oblibene.zobrazit, editovat, resetovat
- nastaveni.integrace.zobrazit, editovat, audit
- nastaveni.notifikace.zobrazit, editovat
- nastaveni.automatizace.zobrazit, editovat, audit
- nastaveni.auditlog.zobrazit, exportovat
- nastaveni.schvalovani.zobrazit, schvalovat, zamitnout

### 15. Help/Nápověda

- help.zobrazit, vyhledavat, otevritfaq

---

Tento katalog slouží jako základ pro správu práv, rolí a funkčností napříč aplikací.  
Při změnách vždy aktualizuj tuto strukturu dle stromové hierarchie modulů!
