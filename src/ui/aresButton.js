/**
 * ============================================================================
 * Task 10: ARES Button UI Component
 * ============================================================================
 * Komponenta pro načítání dat z ARES API
 * Použití: Ve formulářích pro subjekty (030-pronajimatel, 050-najemnik)
 * ============================================================================
 */

import { fetchFromARES, validateICO } from '../services/ares.js';

/**
 * Vytvoří tlačítko "Načíst z ARES" s loading states a error handling
 * @param {Object} options - Konfigurace
 * @param {Function} options.getIcoValue - Funkce pro získání hodnoty IČO z formuláře
 * @param {Function} options.onDataLoaded - Callback s načtenými daty
 * @param {string} options.containerClass - CSS třída pro kontejner
 * @returns {HTMLElement} Kontejner s tlačítkem a stavovými zprávami
 */
export function createAresButton(options = {}) {
  const {
    getIcoValue,
    onDataLoaded,
    containerClass = 'ares-button-container'
  } = options;
  
  if (!getIcoValue || !onDataLoaded) {
    throw new Error('createAresButton: getIcoValue and onDataLoaded are required');
  }
  
  // Hlavní kontejner
  const container = document.createElement('div');
  container.className = `${containerClass} p-4 mb-4 bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg`;
  
  // Tlačítko
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'btn-ares inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all hover:shadow-lg';
  button.innerHTML = `
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
    </svg>
    <span>Načíst z ARES</span>
  `;
  
  // Loading spinner
  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'ares-loading hidden text-blue-700 font-semibold flex items-center gap-2';
  loadingDiv.innerHTML = `
    <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <span>Načítám data z ARES...</span>
  `;
  
  // Error zpráva
  const errorDiv = document.createElement('div');
  errorDiv.className = 'ares-error hidden mt-2 p-3 bg-red-100 text-red-800 rounded-lg border border-red-300';
  
  // Success zpráva
  const successDiv = document.createElement('div');
  successDiv.className = 'ares-success hidden mt-2 p-3 bg-green-100 text-green-800 rounded-lg border border-green-300';
  
  // Info text
  const infoDiv = document.createElement('div');
  infoDiv.className = 'text-sm text-gray-600 mt-2';
  infoDiv.textContent = 'Vyplňte IČO a klikněte na tlačítko pro automatické načtení firemních údajů z veřejného registru ARES.';
  
  // Event handler pro tlačítko
  button.addEventListener('click', async () => {
    // Získat IČO z formuláře
    const ico = getIcoValue();
    
    if (!ico) {
      showError('Vyplňte prosím IČO před načtením z ARES');
      return;
    }
    
    // Validace IČO
    if (!validateICO(ico)) {
      showError('IČO není validní. Zkontrolujte, zda jste zadali správné číslo.');
      return;
    }
    
    // Zobrazit loading state
    button.disabled = true;
    button.classList.add('hidden');
    loadingDiv.classList.remove('hidden');
    errorDiv.classList.add('hidden');
    successDiv.classList.add('hidden');
    
    try {
      // Načíst data z ARES
      const aresData = await fetchFromARES(ico);
      
      // Zavolat callback s daty
      if (onDataLoaded) {
        onDataLoaded(aresData);
      }
      
      // Zobrazit success zprávu
      showSuccess(`Údaje pro "${aresData.nazev}" byly úspěšně načteny z ARES`);
      
      // Po 3 sekundách skrýt zprávu a zobrazit tlačítko
      setTimeout(() => {
        successDiv.classList.add('hidden');
        button.classList.remove('hidden');
      }, 3000);
      
    } catch (error) {
      console.error('ARES error:', error);
      showError(error.message || 'Nepodařilo se načíst data z ARES. Zkuste to prosím znovu.');
      button.classList.remove('hidden');
    } finally {
      button.disabled = false;
      loadingDiv.classList.add('hidden');
    }
  });
  
  function showError(message) {
    errorDiv.innerHTML = `
      <div class="flex items-start gap-2">
        <svg class="w-5 h-5 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        <span>${message}</span>
      </div>
    `;
    errorDiv.classList.remove('hidden');
    
    // Auto-hide po 8 sekundách
    setTimeout(() => {
      errorDiv.classList.add('hidden');
    }, 8000);
  }
  
  function showSuccess(message) {
    successDiv.innerHTML = `
      <div class="flex items-start gap-2">
        <svg class="w-5 h-5 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        <span>${message}</span>
      </div>
    `;
    successDiv.classList.remove('hidden');
  }
  
  // Sestavit kontejner
  container.appendChild(button);
  container.appendChild(loadingDiv);
  container.appendChild(errorDiv);
  container.appendChild(successDiv);
  container.appendChild(infoDiv);
  
  return container;
}

/**
 * Helper funkce pro vyplnění formuláře daty z ARES
 * @param {HTMLElement} form - Form element nebo kontejner s inputy
 * @param {Object} aresData - Data z ARES
 * @param {Object} fieldMapping - Mapování polí (volitelné)
 */
export function fillFormWithAresData(form, aresData, fieldMapping = {}) {
  // Default mapování polí
  const defaultMapping = {
    'nazev': 'nazev',
    'display_name': 'display_name',
    'ico': 'ico',
    'dic': 'dic',
    'ulice': 'ulice',
    'cislo_popisne': 'cislo_popisne',
    'cislo_orientacni': 'cislo_orientacni',
    'mesto': 'mesto',
    'city': 'city',
    'psc': 'psc',
    'kraj': 'kraj',
    'stat': 'stat',
    'primary_email': 'primary_email',
    'primary_phone': 'primary_phone'
  };
  
  const mapping = { ...defaultMapping, ...fieldMapping };
  
  // Projít všechna data a vyplnit odpovídající pole
  Object.keys(mapping).forEach(aresKey => {
    const fieldId = mapping[aresKey];
    const field = form.querySelector(`#${fieldId}`) || form.querySelector(`[name="${fieldId}"]`);
    
    if (field && aresData[aresKey]) {
      const value = aresData[aresKey];
      
      // Nastavit hodnotu podle typu inputu
      if (field.tagName === 'INPUT' || field.tagName === 'TEXTAREA') {
        field.value = value;
        
        // Vizuální feedback - animace
        field.classList.add('bg-yellow-100');
        setTimeout(() => {
          field.classList.remove('bg-yellow-100');
          field.classList.add('transition-colors', 'duration-1000');
        }, 100);
        setTimeout(() => {
          field.classList.remove('bg-yellow-100');
        }, 2000);
        
        // Trigger change event
        field.dispatchEvent(new Event('change', { bubbles: true }));
      } else if (field.tagName === 'SELECT') {
        // Pro select najít odpovídající option
        const option = Array.from(field.options).find(opt => 
          opt.value === value || opt.textContent === value
        );
        if (option) {
          field.value = option.value;
          field.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
    }
  });
}

export default {
  createAresButton,
  fillFormWithAresData
};
