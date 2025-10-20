// src/lib/ares.js
// Jednoduchý helper pro dotazy na veřejné ARES (výpis základních údajů podle IČO).
// Vrací objekt s poli: display_name, ico, dic, street, cislo_popisne, city, zip, raw (celé XML jako string).
//
// Poznámky:
// - ARES vrací XML v různých jmenných prostorech a s různými názvy tagů.
// - Funkce dělá robustní parsing: hledá podle více možných tagů (localName insensitive).
// - V případě chyby vrací { error: '...' }.

export async function lookupIco(ico) {
  if (!ico) return { error: 'ico required' };
  const url = `https://wwwinfo.mfcr.cz/cgi-bin/ares/darv_bas.cgi?ico=${encodeURIComponent(String(ico).trim())}`;
  try {
    const res = await fetch(url, { method: 'GET' });
    if (!res.ok) return { error: `ARES request failed: ${res.status}` };
    const text = await res.text();
    // parse XML
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, 'application/xml');

    // helper: hledat prvky podle možných lokalních jmen
    function findText(names) {
      for (const name of names) {
        // getElementsByTagName works even if namespaces differ
        const nodes = xml.getElementsByTagName(name);
        if (nodes && nodes.length) {
          // najdeme první neprázdný text
          for (let i = 0; i < nodes.length; i++) {
            const v = nodes[i].textContent?.trim();
            if (v) return v;
          }
        }
        // zkus i bez prefixů v localName pro jakýkoliv element
        const all = xml.getElementsByTagName('*');
        for (let i = 0; i < all.length; i++) {
          if (all[i].localName && all[i].localName.toLowerCase() === name.toLowerCase()) {
            const v = all[i].textContent?.trim();
            if (v) return v;
          }
        }
      }
      return null;
    }

    // extrakce základních polí (zkusit několik alternativ názvů)
    const icoVal = findText(['ICO', 'ico']);
    const nazFirmy = findText(['OF', 'Obchodni_firma', 'ObchodniFirma', 'Obchodni_nazev', 'Obchodni_název', 'ObchodniJmeno', 'Obchodni_jmeno', 'ObchodniFirmaText', 'DIC']);
    const dicVal = findText(['DIC', 'dic']);
    const ulic = findText(['Nazev_ulice', 'Ulice', 'Název_ulice', 'Nazev']);
    const cisloDom = findText(['Cislo_domovni', 'CisloPopisne', 'Cislo_popisne', 'Cislo_domovni']);
    const cisloOrient = findText(['Cislo_orientacni', 'CisloOrient', 'Cislo_orientacni']);
    const mesto = findText(['Nazev_obce', 'Obec', 'Nazev', 'ObecNazev']);
    const psc = findText(['PSC', 'psč', 'PSC']);
    // někdy adresa je v jedné položce 'Adresa' nebo 'UC' - zkus najít delší adresní uzel
    let street = ulic || '';
    if (!street) {
      // pokusit se o sloučení elementů s 'ulice' v názvu
      const altStreet = findText(['Adresa', 'Sidlo', 'Sídlo', 'SídloText']);
      if (altStreet) street = altStreet;
    }

    // složit číslo popisné z obou polí pokud existují
    const cislo_popisne = cisloDom || cisloOrient || '';

    // sestavit display_name: preferuj obchodní firmu, pak elementy
    const display_name = nazFirmy || findText(['Obchodni_firma', 'OF', 'ObchodniJmeno']) || '';

    return {
      display_name: display_name,
      ico: icoVal || String(ico).trim(),
      dic: dicVal || null,
      street: street || null,
      cislo_popisne: cislo_popisne || null,
      city: mesto || null,
      zip: psc || null,
      raw: text
    };
  } catch (err) {
    return { error: (err && err.message) ? err.message : String(err) };
  }
}

export default { lookupIco };
