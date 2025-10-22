/**
 * ============================================================================
 * Task 10: ARES API Service
 * ============================================================================
 * Služba pro komunikaci s veřejným registrem ARES (Administrativní registr
 * ekonomických subjektů)
 * 
 * Použití:
 * - Automatické načítání firemních údajů podle IČO
 * - Validace IČO
 * - Vyplnění formuláře subjektu
 * ============================================================================
 */

const ARES_API_BASE = 'https://ares.gov.cz/ekonomicke-subjekty-v-be/rest';

/**
 * Načte údaje o subjektu z ARES podle IČO
 * @param {string} ico - IČO (bez mezer, 8 číslic)
 * @returns {Promise<Object>} Data subjektu z ARES
 * @throws {Error} Pokud IČO není nalezeno nebo nastane chyba API
 */
export async function fetchFromARES(ico) {
  // Validace IČO
  const cleanIco = ico.replace(/\s/g, '');
  
  if (!/^\d{8}$/.test(cleanIco)) {
    throw new Error('IČO musí obsahovat 8 číslic');
  }
  
  if (!validateICO(cleanIco)) {
    throw new Error('IČO není validní (kontrolní součet nesouhlasí)');
  }
  
  try {
    const url = `${ARES_API_BASE}/ekonomicke-subjekty/${cleanIco}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Subjekt s tímto IČO nebyl nalezen v ARES');
      }
      throw new Error(`ARES API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Transformovat data z ARES do našeho formátu
    return transformAresData(data);
    
  } catch (error) {
    console.error('Error fetching from ARES:', error);
    throw error;
  }
}

/**
 * Transformuje data z ARES do formátu aplikace
 * @param {Object} aresData - Data z ARES API
 * @returns {Object} Data ve formátu aplikace
 */
function transformAresData(aresData) {
  const obchodniJmeno = aresData.obchodniJmeno || aresData.nazevSubjektu;
  const sidlo = aresData.sidlo || {};
  const pravniForma = aresData.pravniForma || {};
  
  // Sestavit adresu
  const adresaParts = [];
  if (sidlo.nazevUlice) adresaParts.push(sidlo.nazevUlice);
  if (sidlo.cisloDomovni) {
    adresaParts.push(sidlo.cisloDomovni);
    if (sidlo.cisloOrientacni) {
      adresaParts.push(`/${sidlo.cisloOrientacni}`);
    }
  }
  
  const result = {
    // Základní údaje
    nazev: obchodniJmeno || '',
    display_name: obchodniJmeno || '',
    ico: aresData.ico || '',
    dic: aresData.dic || '',
    
    // Adresa
    ulice: adresaParts.join(' '),
    cislo_popisne: sidlo.cisloDomovni || '',
    cislo_orientacni: sidlo.cisloOrientacni || '',
    mesto: sidlo.nazevObce || '',
    city: sidlo.nazevObce || '', // Alias pro město
    psc: sidlo.psc ? sidlo.psc.replace(/\s/g, '') : '',
    kraj: sidlo.nazevKraje || '',
    stat: 'Česká republika',
    
    // Právní forma
    pravni_forma_kod: pravniForma.kod || '',
    pravni_forma_nazev: pravniForma.nazev || '',
    
    // Kontaktní údaje (pokud jsou dostupné)
    primary_email: aresData.email || '',
    primary_phone: aresData.telefon || '',
    
    // Další údaje
    datum_vzniku: aresData.datumVzniku || null,
    datum_zaniku: aresData.datumZaniku || null,
    
    // Metadata
    ares_data_source: 'ARES',
    ares_data_fetched_at: new Date().toISOString(),
    ares_data_valid: !aresData.datumZaniku // Subjekt je aktivní pokud nemá datum zániku
  };
  
  return result;
}

/**
 * Validuje IČO pomocí kontrolního součtu
 * @param {string} ico - IČO k validaci (8 číslic)
 * @returns {boolean} True pokud je IČO validní
 */
export function validateICO(ico) {
  const cleanIco = ico.replace(/\s/g, '');
  
  if (!/^\d{8}$/.test(cleanIco)) {
    return false;
  }
  
  // Kontrolní součet podle modulo 11
  let sum = 0;
  for (let i = 0; i < 7; i++) {
    sum += parseInt(cleanIco[i]) * (8 - i);
  }
  
  const remainder = sum % 11;
  const checkDigit = parseInt(cleanIco[7]);
  
  if (remainder === 0) {
    return checkDigit === 1;
  } else if (remainder === 1) {
    return checkDigit === 0;
  } else {
    return checkDigit === (11 - remainder);
  }
}

/**
 * Formátuje IČO do standardního formátu (8 číslic)
 * @param {string} ico - IČO k formátování
 * @returns {string} Formátované IČO
 */
export function formatICO(ico) {
  const cleanIco = ico.replace(/\D/g, '');
  return cleanIco.padStart(8, '0');
}

/**
 * Získá návrh typu subjektu podle právní formy z ARES
 * @param {Object} aresData - Data z ARES
 * @returns {string} Navržený typ subjektu
 */
export function suggestSubjectType(aresData) {
  const pravniFormaKod = aresData.pravni_forma_kod || '';
  const pravniFormaNazev = aresData.pravni_forma_nazev || '';
  
  // Mapování právních forem na typy subjektů
  const formMap = {
    '101': 'osoba',    // Fyzická osoba
    '102': 'osoba',    // Fyzická osoba podnikající
    '105': 'osvc',     // OSVČ
    '112': 'firma',    // Akciová společnost
    '113': 'firma',    // Společnost s ručením omezeným
    '121': 'firma',    // Veřejná obchodní společnost
    '141': 'spolek',   // Spolek
    '142': 'spolek',   // Nadace
    '325': 'stat',     // Státní organizace
    '801': 'stat',     // Státní příspěvková organizace
  };
  
  return formMap[pravniFormaKod] || 'firma'; // Default: firma
}

/**
 * Testovací funkce - načte demo data pro testování UI
 * @returns {Object} Demo data ve formátu aplikace
 */
export function getTestAresData() {
  return {
    nazev: 'ACME s.r.o.',
    display_name: 'ACME s.r.o.',
    ico: '12345678',
    dic: 'CZ12345678',
    ulice: 'Testovací 123/45',
    cislo_popisne: '123',
    cislo_orientacni: '45',
    mesto: 'Praha',
    city: 'Praha',
    psc: '11000',
    kraj: 'Hlavní město Praha',
    stat: 'Česká republika',
    pravni_forma_kod: '113',
    pravni_forma_nazev: 'Společnost s ručením omezeným',
    primary_email: 'info@acme.cz',
    primary_phone: '+420 123 456 789',
    datum_vzniku: '2020-01-15',
    datum_zaniku: null,
    ares_data_source: 'ARES',
    ares_data_fetched_at: new Date().toISOString(),
    ares_data_valid: true
  };
}

export default {
  fetchFromARES,
  validateICO,
  formatICO,
  suggestSubjectType,
  getTestAresData
};
