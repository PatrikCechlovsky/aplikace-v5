# Úkol 10: Tlačítko "Načíst z ARES" — automatické vyplnění firemních údajů

## 📋 Popis
Ve formuláři pro subjekt (030, 050, další) musí být viditelně zobrazeno velké tlačítko "Načíst z ARES". Po kliknutí se podle IČO načtou všechny dostupné údaje z ARES (název, adresa, DIČ, telefon, e-mail...).

## 🎯 Cíl
Zrychlit a zjednodušit zadávání firemních údajů automatickým načtením z veřejného registru ARES.

## 🎨 Referenční obrázky
Viz v agent-task.md: image8

## ✅ Akceptační kritéria
- [ ] Velké, viditelné tlačítko "Načíst z ARES" ve formuláři subjektu
- [ ] Tlačítko funguje pouze když je vyplněno IČO
- [ ] Po kliknutí se načtou data z ARES API
- [ ] Pole se automaticky vyplní načtenými daty
- [ ] Uživatel může načtená data upravit před uložením
- [ ] Zobrazení chybových stavů (IČO nebylo nalezeno, chyba API)
- [ ] Tlačítko je připraveno pro budoucí rozšíření do dalších modulů

## 📁 Dotčené moduly
- [ ] 030-pronajimatel
- [ ] 050-najemnik
- [ ] Všechny budoucí moduly se subjekty

## 🔧 Implementační kroky

### 1. ARES API služba

#### 1.1 Vytvořit service pro ARES
V `/src/services/ares.js`:

```javascript
/**
 * ARES API Service
 * Komunikace s veřejným registrem ARES
 */

const ARES_API_BASE = 'https://ares.gov.cz/ekonomicke-subjekty-v-be/rest';

/**
 * Načte údaje o subjektu z ARES podle IČO
 * @param {string} ico - IČO (bez mezer)
 * @returns {Promise<Object>} Data subjektu z ARES
 */
export async function fetchFromARES(ico) {
  // Validace IČO
  const cleanIco = ico.replace(/\s/g, '');
  if (!/^\d{8}$/.test(cleanIco)) {
    throw new Error('IČO musí obsahovat 8 číslic');
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
      throw new Error(`ARES API error: ${response.status}`);
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
  const obchodniJmeno = aresData.obchodniJmeno;
  const sidlo = aresData.sidlo;
  const pravniForma = aresData.pravniForma;
  
  // Sestavit adresu
  const adresa = [];
  if (sidlo?.nazevUlice) adresa.push(sidlo.nazevUlice);
  if (sidlo?.cisloDomovni) adresa.push(sidlo.cisloDomovni);
  if (sidlo?.cisloOrientacni) adresa.push(`/${sidlo.cisloOrientacni}`);
  
  const result = {
    // Základní údaje
    nazev: obchodniJmeno,
    ico: aresData.ico,
    dic: aresData.dic || '',
    
    // Adresa
    ulice: adresa.join(' '),
    mesto: sidlo?.nazevObce || '',
    psc: sidlo?.psc ? sidlo.psc.replace(/\s/g, '') : '',
    stat: 'Česká republika',
    
    // Právní forma
    pravni_forma: pravniForma?.kod || '',
    pravni_forma_text: pravniForma?.nazev || '',
    
    // Další údaje (pokud jsou dostupné)
    datumVzniku: aresData.datumVzniku || null,
    datumZaniku: aresData.datumZaniku || null,
    
    // Metadata
    dataSource: 'ARES',
    dataFetchedAt: new Date().toISOString()
  };
  
  return result;
}

/**
 * Validuje IČO (kontrolní součet)
 * @param {string} ico - IČO k validaci
 * @returns {boolean} True pokud je IČO validní
 */
export function validateICO(ico) {
  const cleanIco = ico.replace(/\s/g, '');
  
  if (!/^\d{8}$/.test(cleanIco)) {
    return false;
  }
  
  // Kontrolní součet
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
```

### 2. UI komponenta pro ARES tlačítko

#### 2.1 Vytvořit komponentu
V `/src/ui/aresButton.js`:

```javascript
import { fetchFromARES, validateICO } from '../services/ares.js';

/**
 * Vytvoří tlačítko "Načíst z ARES"
 * @param {Object} options - Konfigurace
 * @param {Function} options.onDataLoaded - Callback s načtenými daty
 * @param {Function} options.getIcoValue - Funkce pro získání hodnoty IČO z formuláře
 * @returns {HTMLElement} Tlačítko
 */
export function createAresButton(options) {
  const { onDataLoaded, getIcoValue } = options;
  
  // Kontejner
  const container = document.createElement('div');
  container.className = 'ares-button-container';
  
  // Tlačítko
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'btn btn-ares btn-lg';
  button.innerHTML = `
    <i class="icon-download"></i>
    <span>Načíst z ARES</span>
  `;
  
  // Loading stav
  const loadingSpinner = document.createElement('div');
  loadingSpinner.className = 'ares-loading';
  loadingSpinner.innerHTML = '<i class="icon-spinner spinning"></i> Načítám...';
  loadingSpinner.style.display = 'none';
  
  // Error zpráva
  const errorMessage = document.createElement('div');
  errorMessage.className = 'ares-error';
  errorMessage.style.display = 'none';
  
  // Success zpráva
  const successMessage = document.createElement('div');
  successMessage.className = 'ares-success';
  successMessage.style.display = 'none';
  
  // Event handler
  button.addEventListener('click', async () => {
    // Získat IČO z formuláře
    const ico = getIcoValue();
    
    if (!ico) {
      showError('Vyplňte prosím IČO');
      return;
    }
    
    if (!validateICO(ico)) {
      showError('IČO není validní (kontrolní součet nesouhlasí)');
      return;
    }
    
    // Zobrazit loading
    button.disabled = true;
    button.style.display = 'none';
    loadingSpinner.style.display = 'block';
    errorMessage.style.display = 'none';
    successMessage.style.display = 'none';
    
    try {
      // Načíst data z ARES
      const aresData = await fetchFromARES(ico);
      
      // Zavolat callback s daty
      if (onDataLoaded) {
        onDataLoaded(aresData);
      }
      
      // Zobrazit success
      showSuccess('Údaje byly úspěšně načteny z ARES');
      
      // Po 3 sekundách skrýt zprávu a zobrazit tlačítko
      setTimeout(() => {
        successMessage.style.display = 'none';
        button.style.display = 'inline-flex';
      }, 3000);
      
    } catch (error) {
      console.error('ARES error:', error);
      showError(error.message);
      button.style.display = 'inline-flex';
    } finally {
      button.disabled = false;
      loadingSpinner.style.display = 'none';
    }
  });
  
  function showError(message) {
    errorMessage.textContent = '❌ ' + message;
    errorMessage.style.display = 'block';
    setTimeout(() => {
      errorMessage.style.display = 'none';
    }, 5000);
  }
  
  function showSuccess(message) {
    successMessage.textContent = '✅ ' + message;
    successMessage.style.display = 'block';
  }
  
  // Sestavit kontejner
  container.appendChild(button);
  container.appendChild(loadingSpinner);
  container.appendChild(errorMessage);
  container.appendChild(successMessage);
  
  return container;
}
```

### 3. Integrace do formuláře subjektu

#### 3.1 Aktualizovat forms/edit.js
V `/src/modules/030-pronajimatel/forms/edit.js` (a podobně pro 050):

```javascript
import { createAresButton } from '../../../ui/aresButton.js';

export async function render(container, params) {
  // ... setup ...
  
  // Vytvořit formulář
  const form = document.createElement('form');
  form.className = 'subject-form';
  
  // Sekce IČO
  const icoSection = document.createElement('div');
  icoSection.className = 'form-section';
  icoSection.innerHTML = `
    <div class="form-group">
      <label for="ico">IČO *</label>
      <input 
        type="text" 
        id="ico" 
        name="ico" 
        maxlength="8" 
        placeholder="12345678"
        required
      />
    </div>
  `;
  form.appendChild(icoSection);
  
  // Přidat ARES tlačítko
  const aresButton = createAresButton({
    getIcoValue: () => {
      return document.getElementById('ico').value;
    },
    onDataLoaded: (aresData) => {
      // Vyplnit formulář načtenými daty
      fillFormWithAresData(form, aresData);
    }
  });
  form.appendChild(aresButton);
  
  // Další pole formuláře
  form.innerHTML += `
    <div class="form-group">
      <label for="nazev">Název *</label>
      <input type="text" id="nazev" name="nazev" required />
    </div>
    
    <div class="form-group">
      <label for="dic">DIČ</label>
      <input type="text" id="dic" name="dic" />
    </div>
    
    <div class="form-section">
      <h3>Adresa</h3>
      <div class="form-group">
        <label for="ulice">Ulice</label>
        <input type="text" id="ulice" name="ulice" />
      </div>
      <div class="form-group">
        <label for="mesto">Město *</label>
        <input type="text" id="mesto" name="mesto" required />
      </div>
      <div class="form-group">
        <label for="psc">PSČ</label>
        <input type="text" id="psc" name="psc" />
      </div>
    </div>
    
    <!-- další pole... -->
  `;
  
  container.appendChild(form);
}

/**
 * Vyplní formulář daty z ARES
 */
function fillFormWithAresData(form, aresData) {
  // Projít všechna data a vyplnit odpovídající pole
  Object.keys(aresData).forEach(key => {
    const field = form.querySelector(`#${key}`);
    if (field && aresData[key]) {
      field.value = aresData[key];
      
      // Vizuální feedback - pole bylo vyplněno z ARES
      field.classList.add('filled-from-ares');
      setTimeout(() => {
        field.classList.remove('filled-from-ares');
      }, 2000);
    }
  });
  
  // Zobrazit notifikaci
  showNotification('success', 
    `Údaje pro "${aresData.nazev}" byly načteny z ARES`
  );
}
```

### 4. CSS styly

```css
/* ARES tlačítko */
.ares-button-container {
  margin: 20px 0;
  padding: 20px;
  background: #f0f9ff;
  border: 2px dashed #3b82f6;
  border-radius: 8px;
  text-align: center;
}

.btn-ares {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-ares:hover {
  background: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.btn-ares:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ares-loading {
  color: #3b82f6;
  font-weight: 600;
}

.ares-error {
  color: #ef4444;
  padding: 8px;
  margin-top: 8px;
  background: #fee2e2;
  border-radius: 4px;
}

.ares-success {
  color: #10b981;
  padding: 8px;
  margin-top: 8px;
  background: #d1fae5;
  border-radius: 4px;
}

/* Pole vyplněné z ARES - vizuální feedback */
.filled-from-ares {
  animation: highlight 2s ease;
}

@keyframes highlight {
  0% { background-color: #fef3c7; }
  100% { background-color: white; }
}

/* Spinning ikona pro loading */
.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

## 📝 Checklist implementace

### Services
- [ ] Vytvořit `/src/services/ares.js`
- [ ] Implementovat `fetchFromARES()`
- [ ] Implementovat `transformAresData()`
- [ ] Implementovat `validateICO()`
- [ ] Přidat error handling

### UI komponenta
- [ ] Vytvořit `/src/ui/aresButton.js`
- [ ] Implementovat `createAresButton()`
- [ ] Přidat loading stav
- [ ] Přidat error/success zprávy

### Integrace do modulů
- [ ] Modul 030-pronajimatel
- [ ] Modul 050-najemnik
- [ ] Funkce `fillFormWithAresData()`
- [ ] Vizuální feedback

### Styling
- [ ] CSS pro tlačítko
- [ ] CSS pro loading/error/success stavy
- [ ] CSS pro highlight animation

### Testování
- [ ] Test: Načtení platného IČO
- [ ] Test: Neplatné IČO (chybový stav)
- [ ] Test: IČO nebylo nalezeno
- [ ] Test: Chyba API
- [ ] Test: Vyplnění formuláře načtenými daty

## 📝 Reference
- **ARES API dokumentace:** https://ares.gov.cz/
- **UI komponenty:** `/src/ui/`

## 🔗 Související úkoly
- Task 06: Unified creation flow

## ⏱️ Odhadovaný čas
- **ARES service:** 2-3 hodiny
- **UI komponenta:** 1-2 hodiny
- **Integrace do modulů:** 1-2 hodiny per modul
- **Testování:** 1-2 hodiny
- **Celkem:** 5-9 hodin

## 📊 Priority
**STŘEDNÍ-VYSOKÁ** - Velmi užitečná funkce, ale ne kritická pro základní fungování.

## ✅ Ověření
Po dokončení ověřit:
1. Tlačítko "Načíst z ARES" je viditelné ve formuláři
2. Tlačítko je velké a prominentní
3. Kliknutí načte data z ARES
4. Formulář se automaticky vyplní
5. Zobrazují se správné notifikace
6. Error stavy jsou správně zpracovány
7. Uživatel může načtená data upravit
8. Tlačítko funguje v modulech 030 i 050
