// Shared TYPE_SCHEMAS for subjects (osoba, osvc, firma, spolek, stat, zastupce)
// - key: field key used in form inputs and payload (matches DB top-level columns where applicable)
// - label: visible label
// - type: text | email | number | select | date | checkbox | password | label
// - required: whether to validate required for the given field in that type
// - ares: boolean — helper: indicates the field is eligible for ARES lookup (typically 'ico')
// - note: optional helper text
//
// This is a first-pass mapping based on the provided spreadsheet screenshot.
// Adjust required flags or hidden/visible mapping after review.

export const TYPE_SCHEMAS = {
  osoba: [
    { key: 'display_name', label: 'Tituly / Jméno', type: 'text', required: true },
    { key: 'titul_pred', label: 'Titul před jménem', type: 'text' },
    { key: 'jmeno', label: 'Křestní jméno', type: 'text', required: true },
    { key: 'prijmeni', label: 'Příjmení', type: 'text', required: true },
    { key: 'titul_za', label: 'Titul za jménem', type: 'text' },
    { key: 'typ_dokladu', label: 'Typ dokladu', type: 'select', options: [
        { value: 'op', label: 'Občanský průkaz' },
        { value: 'pas', label: 'Pas' },
        { value: 'rid', label: 'Řidičský průkaz' }
      ], required: true },
    { key: 'cislo_dokladu', label: 'Číslo dokladu', type: 'text', required: true },
    { key: 'datum_narozeni', label: 'Datum narození', type: 'date' },

    // address
    { key: 'stat', label: 'Stát', type: 'select', options: [], required: true, note: 'výběr ze státu' },
    { key: 'zip', label: 'PSČ', type: 'text', required: true },
    { key: 'city', label: 'Město', type: 'text', required: true },
    { key: 'street', label: 'Ulice', type: 'text', required: true },
    { key: 'cislo_popisne', label: 'Číslo popisné', type: 'text', required: true },

    { key: 'telefon', label: 'Telefon', type: 'text', required: true, note: 'předvolba podle státu' },
    { key: 'primary_email', label: 'E-mail', type: 'email', required: true },

    // banking / login
    { key: 'bankovni_ucet', label: 'Bankovní účet / číslo', type: 'text' },
    { key: 'prihlasovaci_jmeno', label: 'Přihlašovací jméno', type: 'text' },
    { key: 'prihlasovaci_heslo', label: 'Přihlašovací heslo', type: 'password' },

    // representation
    { key: 'zastupce', label: 'Je zástupce', type: 'checkbox' },
    { key: 'zastupuje_id', label: 'Zastupuje (ID subjektu)', type: 'text' }
  ],

  osvc: [
    { key: 'display_name', label: 'Jméno / Firma', type: 'text', required: true },
    { key: 'ico', label: 'IČO', type: 'text', required: true, ares: true, note: 'Načíst údaje z ARES podle IČO' },
    { key: 'dic', label: 'DIČ', type: 'text' },

    // address & contact
    { key: 'telefon', label: 'Telefon', type: 'text', required: true },
    { key: 'primary_email', label: 'E-mail', type: 'email', required: true },
    { key: 'street', label: 'Ulice', type: 'text', required: true },
    { key: 'city', label: 'Město', type: 'text', required: true },
    { key: 'zip', label: 'PSČ', type: 'text', required: true },

    // banking / login
    { key: 'bankovni_ucet', label: 'Bankovní účet / číslo', type: 'text' }
  ],

  firma: [
    { key: 'display_name', label: 'Název firmy', type: 'text', required: true },
    { key: 'ico', label: 'IČO', type: 'text', required: true, ares: true, note: 'Načíst z ARES' },
    { key: 'dic', label: 'DIČ', type: 'text' },

    { key: 'primary_phone', label: 'Telefon', type: 'text' },
    { key: 'primary_email', label: 'E-mail', type: 'email', required: true },

    // address
    { key: 'street', label: 'Ulice', type: 'text', required: true },
    { key: 'cislo_popisne', label: 'Číslo popisné', type: 'text', required: true },
    { key: 'city', label: 'Město', type: 'text', required: true },
    { key: 'zip', label: 'PSČ', type: 'text', required: true },

    { key: 'bankovni_ucet', label: 'Bankovní účet / číslo', type: 'text' }
  ],

  spolek: [
    { key: 'display_name', label: 'Název spolku / skupiny', type: 'text', required: true },
    { key: 'primary_email', label: 'Kontakt (e-mail)', type: 'email', required: true },
    { key: 'telefon', label: 'Telefon', type: 'text' },
    { key: 'street', label: 'Ulice', type: 'text' },
    { key: 'city', label: 'Město', type: 'text' },
    { key: 'zip', label: 'PSČ', type: 'text' }
  ],

  stat: [
    { key: 'display_name', label: 'Název organizace', type: 'text', required: true },
    { key: 'primary_email', label: 'Kontakt (e-mail)', type: 'email', required: true },
    { key: 'street', label: 'Ulice', type: 'text' },
    { key: 'city', label: 'Město', type: 'text' },
    { key: 'zip', label: 'PSČ', type: 'text' }
  ],

  zastupce: [
    { key: 'display_name', label: 'Jméno zástupce', type: 'text', required: true },
    { key: 'jmeno', label: 'Křestní jméno', type: 'text', required: true },
    { key: 'prijmeni', label: 'Příjmení', type: 'text', required: true },
    { key: 'zastupuje_id', label: 'Zastupuje (ID subjektu)', type: 'text', required: true },
    { key: 'telefon', label: 'Telefon', type: 'text' },
    { key: 'primary_email', label: 'E-mail', type: 'email' }
  ]
};

export default TYPE_SCHEMAS;
