// Extended type schemas with new fields for modules 030 and 050
// This document shows what needs to be added to type-schemas/subjects.js

/*
 * NOVÁ POLE PRO VŠECHNY TYPY SUBJEKTŮ
 */

// 1. Preferovaný způsob komunikace (pro pronajímatele)
{ 
  key: 'preferovany_zpusob_komunikace', 
  label: 'Preferovaný způsob komunikace', 
  type: 'select',
  options: [
    { value: 'email', label: 'E-mail' },
    { value: 'telefon', label: 'Telefon' },
    { value: 'posta', label: 'Poštou' }
  ],
  required: false
}

// 2. Kontaktní osoba (pro firmy) - rozbaleno do samostatných polí
{ key: 'kontaktni_osoba_jmeno', label: 'Kontaktní osoba - Jméno', type: 'text', required: false },
{ key: 'kontaktni_osoba_email', label: 'Kontaktní osoba - E-mail', type: 'email', required: false },
{ key: 'kontaktni_osoba_telefon', label: 'Kontaktní osoba - Telefon', type: 'text', required: false }

/*
 * POZNÁMKA: V databázi se tyto 3 pole sloučí do jednoho JSON objektu:
 * kontaktni_osoba: {
 *   jmeno: "Jan Novák",
 *   email: "jan@example.cz", 
 *   telefon: "+420601000000"
 * }
 */

// 3. Bankovní účty - pro jednoduchost zatím jeden hlavní účet, později rozšířit na array
{ key: 'banka_nazev', label: 'Banka', type: 'text', required: false },
{ key: 'banka_iban', label: 'IBAN', type: 'text', required: false },
{ key: 'banka_bic', label: 'BIC / SWIFT', type: 'text', required: false },
{ key: 'banka_poznamka', label: 'Poznámka k účtu', type: 'text', required: false }

/*
 * POZNÁMKA: V databázi se tyto 4 pole sloučí do jednoho JSON array:
 * bankovni_ucty: [
 *   {
 *     banka: "ČSOB",
 *     iban: "CZ6508000000192000145399",
 *     bic: "GIBACZPX",
 *     poznamka: "Hlavní účet"
 *   }
 * ]
 */

/*
 * NOVÁ POLE PRO NÁJEMNÍKY (modul 050)
 */

// 4. Doručovací adresa (pokud se liší od trvalé)
{ key: 'dorucovaci_ulice', label: 'Doručovací adresa - Ulice', type: 'text', required: false },
{ key: 'dorucovaci_cislo_popisne', label: 'Doručovací adresa - Číslo popisné', type: 'text', required: false },
{ key: 'dorucovaci_mesto', label: 'Doručovací adresa - Město', type: 'text', required: false },
{ key: 'dorucovaci_psc', label: 'Doručovací adresa - PSČ', type: 'text', required: false },
{ key: 'dorucovaci_stat', label: 'Doručovací adresa - Stát', type: 'text', required: false }

/*
 * POZNÁMKA: V databázi se tyto pole sloučí do jednoho JSON objektu:
 * dorucovaci_adresa: {
 *   ulice: "Jiná ulice",
 *   cislo_popisne: "456",
 *   mesto: "Brno",
 *   psc: "60200",
 *   stat: "ČR"
 * }
 */

// 5. Platební informace
{ 
  key: 'platebni_preferovany_zpusob', 
  label: 'Preferovaný způsob platby', 
  type: 'select',
  options: [
    { value: 'bankovni_prevod', label: 'Bankovní převod' },
    { value: 'direct_debit', label: 'SIPO (Direct debit)' },
    { value: 'kartou', label: 'Platební kartou' },
    { value: 'hotove', label: 'Hotově' }
  ],
  required: false
}
{ key: 'platebni_defaultni_iban', label: 'Výchozí IBAN pro platby', type: 'text', required: false }

/*
 * POZNÁMKA: V databázi se tyto 2 pole sloučí do jednoho JSON objektu:
 * platebni_info: {
 *   preferovany_zpusob: "bankovni_prevod",
 *   defaultni_iban: "CZ6508000000192000145399"
 * }
 */

/*
 * NOVÁ POLE PRO PRONAJÍMATELE (modul 030)
 */

// 6. Podpisová práva - zatím jako jednoduché pole, později rozšířit na array s uživateli
{ key: 'podpisove_prava_poznamka', label: 'Podpisová práva - poznámka', type: 'text', required: false }

/*
 * POZNÁMKA: V budoucnu bude podpisove_prava jako array objektů:
 * podpisove_prava: [
 *   {
 *     user_id: "uuid-1",
 *     jmeno: "Petr Svoboda",
 *     role: "jednatel",
 *     od: "2024-01-01"
 *   }
 * ]
 * 
 * Pro jednoduchost zatím ukládáme jako poznámku, později implementovat
 * samostatný UI komponent pro správu podpisových práv.
 */


/*
 * IMPLEMENTAČNÍ POZNÁMKY
 * =======================
 * 
 * 1. V UI formulářích se pole zobrazují jako samostatné inputy (flattened)
 * 2. Před uložením do DB je třeba je složit do JSON objektů/arrays
 * 3. Při načítání z DB je třeba je rozbalit zpět do jednotlivých polí
 * 
 * Příklad transformační funkce:
 * 
 * function flattenForForm(dbRecord) {
 *   return {
 *     ...dbRecord,
 *     kontaktni_osoba_jmeno: dbRecord.kontaktni_osoba?.jmeno,
 *     kontaktni_osoba_email: dbRecord.kontaktni_osoba?.email,
 *     kontaktni_osoba_telefon: dbRecord.kontaktni_osoba?.telefon,
 *     // ... další pole
 *   };
 * }
 * 
 * function prepareForDb(formData) {
 *   const { 
 *     kontaktni_osoba_jmeno, 
 *     kontaktni_osoba_email, 
 *     kontaktni_osoba_telefon,
 *     ...rest 
 *   } = formData;
 *   
 *   return {
 *     ...rest,
 *     kontaktni_osoba: {
 *       jmeno: kontaktni_osoba_jmeno,
 *       email: kontaktni_osoba_email,
 *       telefon: kontaktni_osoba_telefon
 *     }
 *   };
 * }
 */

export default {
  // Tento soubor je pouze dokumentační
  // Skutečná implementace bude v /src/lib/type-schemas/subjects.js
};
