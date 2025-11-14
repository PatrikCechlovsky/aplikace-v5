/**
 * Example Wizard: Create Property with Units
 * Demonstrates the wizard system usage
 */

import { renderWizard } from '/src/ui/wizard.js';
import { renderForm } from '/src/ui/form.js';
import { navigateTo } from '/src/app.js';

/**
 * Render the property creation wizard
 * @param {HTMLElement} container - Container element
 */
export async function render(container) {
  const wizardConfig = {
    wizardKey: 'create-prop-with-units',
    entityCode: 'PROP',
    title: 'Průvodce vytvořením nemovitosti s jednotkami',
    mode: 'create',
    steps: [
      {
        code: 'property-basic',
        label: 'Základní údaje nemovitosti',
        description: 'Zadejte základní informace o nemovitosti',
        entityCode: 'PROP',
        formCode: 'form-prop-basic',
        renderForm: (formContainer, data) => {
          const fields = [
            { name: 'nazev', label: 'Název nemovitosti', type: 'text', required: true, value: data.nazev || '' },
            { 
              name: 'typ_nemovitosti', 
              label: 'Typ nemovitosti', 
              type: 'select', 
              required: true,
              value: data.typ_nemovitosti || '',
              options: [
                { value: 'bytovy_dum', label: 'Bytový dům' },
                { value: 'rodinny_dum', label: 'Rodinný dům' },
                { value: 'admin_budova', label: 'Administrativní budova' },
                { value: 'prumyslovy_objekt', label: 'Průmyslový objekt' },
                { value: 'pozemek', label: 'Pozemek' },
                { value: 'jiny_objekt', label: 'Jiný objekt' }
              ]
            },
            { name: 'popis', label: 'Popis', type: 'textarea', value: data.popis || '' }
          ];

          renderForm(formContainer, fields, {});
        },
        collectData: (formContainer) => {
          const inputs = formContainer.querySelectorAll('input, select, textarea');
          const data = {};
          inputs.forEach(input => {
            data[input.name] = input.value;
          });
          return data;
        },
        validate: (data) => {
          const errors = [];
          if (!data.nazev || data.nazev.trim() === '') {
            errors.push('Název nemovitosti je povinný');
          }
          if (!data.typ_nemovitosti) {
            errors.push('Typ nemovitosti je povinný');
          }
          return errors;
        }
      },
      {
        code: 'property-address',
        label: 'Adresa',
        description: 'Zadejte adresu nemovitosti',
        entityCode: 'PROP',
        formCode: 'form-prop-address',
        renderForm: (formContainer, data) => {
          const fields = [
            { name: 'ulice', label: 'Ulice', type: 'text', required: true, value: data.ulice || '' },
            { name: 'cislo_popisne', label: 'Číslo popisné', type: 'text', value: data.cislo_popisne || '' },
            { name: 'cislo_orientacni', label: 'Číslo orientační', type: 'text', value: data.cislo_orientacni || '' },
            { name: 'mesto', label: 'Město', type: 'text', required: true, value: data.mesto || '' },
            { name: 'psc', label: 'PSČ', type: 'text', value: data.psc || '' },
            { name: 'kraj', label: 'Kraj', type: 'text', value: data.kraj || '' }
          ];

          renderForm(formContainer, fields, {});
        },
        collectData: (formContainer) => {
          const inputs = formContainer.querySelectorAll('input');
          const data = {};
          inputs.forEach(input => {
            data[input.name] = input.value;
          });
          return data;
        },
        validate: (data) => {
          const errors = [];
          if (!data.mesto || data.mesto.trim() === '') {
            errors.push('Město je povinné');
          }
          return errors;
        }
      },
      {
        code: 'property-details',
        label: 'Technické údaje',
        description: 'Zadejte technické parametry nemovitosti',
        entityCode: 'PROP',
        formCode: 'form-prop-details',
        renderForm: (formContainer, data) => {
          const fields = [
            { name: 'rok_vystavby', label: 'Rok výstavby', type: 'number', value: data.rok_vystavby || '' },
            { name: 'celkova_plocha', label: 'Celková plocha (m²)', type: 'number', step: '0.01', value: data.celkova_plocha || '' },
            { name: 'pocet_podlazi', label: 'Počet podlaží', type: 'number', value: data.pocet_podlazi || '' },
            { name: 'pocet_podzemních_podlazi', label: 'Počet podzemních podlaží', type: 'number', value: data.pocet_podzemních_podlazi || '' }
          ];

          renderForm(formContainer, fields, {});
        },
        collectData: (formContainer) => {
          const inputs = formContainer.querySelectorAll('input');
          const data = {};
          inputs.forEach(input => {
            if (input.value) {
              data[input.name] = input.type === 'number' ? parseFloat(input.value) : input.value;
            }
          });
          return data;
        },
        validate: (data) => {
          const errors = [];
          if (data.rok_vystavby && (data.rok_vystavby < 1800 || data.rok_vystavby > new Date().getFullYear())) {
            errors.push('Neplatný rok výstavby');
          }
          if (data.celkova_plocha && data.celkova_plocha < 0) {
            errors.push('Plocha nemůže být záporná');
          }
          return errors;
        }
      },
      {
        code: 'units-count',
        label: 'Jednotky',
        description: 'Kolik jednotek chcete vytvořit?',
        entityCode: 'UNIT',
        renderForm: (formContainer, data) => {
          formContainer.innerHTML = `
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Počet jednotek</label>
                <input 
                  type="number" 
                  name="units_count" 
                  min="0" 
                  max="50"
                  value="${data.units_count || 0}"
                  class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <p class="text-xs text-gray-500 mt-1">Můžete vytvořit 0-50 jednotek. Jednotky můžete přidat i později.</p>
              </div>
            </div>
          `;
        },
        collectData: (formContainer) => {
          const input = formContainer.querySelector('input[name="units_count"]');
          return {
            units_count: parseInt(input.value) || 0
          };
        },
        validate: (data) => {
          const errors = [];
          if (data.units_count < 0 || data.units_count > 50) {
            errors.push('Počet jednotek musí být mezi 0 a 50');
          }
          return errors;
        }
      },
      {
        code: 'summary',
        label: 'Shrnutí',
        description: 'Zkontrolujte zadané údaje před dokončením',
        entityCode: 'PROP',
        renderForm: (formContainer, allStepsData) => {
          // Merge all previous steps data
          const propertyData = Object.assign({}, 
            allStepsData['property-basic'] || {},
            allStepsData['property-address'] || {},
            allStepsData['property-details'] || {}
          );
          const unitsData = allStepsData['units-count'] || {};

          formContainer.innerHTML = `
            <div class="bg-gray-50 rounded p-4 space-y-3">
              <h4 class="font-semibold text-gray-800">Nemovitost</h4>
              <div class="grid grid-cols-2 gap-2 text-sm">
                <div><strong>Název:</strong> ${escapeHtml(propertyData.nazev || '-')}</div>
                <div><strong>Typ:</strong> ${escapeHtml(propertyData.typ_nemovitosti || '-')}</div>
                <div><strong>Adresa:</strong> ${escapeHtml([propertyData.ulice, propertyData.cislo_popisne, propertyData.mesto].filter(Boolean).join(', ') || '-')}</div>
                <div><strong>PSČ:</strong> ${escapeHtml(propertyData.psc || '-')}</div>
                <div><strong>Rok výstavby:</strong> ${propertyData.rok_vystavby || '-'}</div>
                <div><strong>Plocha:</strong> ${propertyData.celkova_plocha ? propertyData.celkova_plocha + ' m²' : '-'}</div>
              </div>
              
              <h4 class="font-semibold text-gray-800 mt-4">Jednotky</h4>
              <div class="text-sm">
                <strong>Počet jednotek k vytvoření:</strong> ${unitsData.units_count || 0}
              </div>
              
              ${propertyData.popis ? `
                <h4 class="font-semibold text-gray-800 mt-4">Popis</h4>
                <p class="text-sm text-gray-700">${escapeHtml(propertyData.popis)}</p>
              ` : ''}
            </div>
          `;
        },
        collectData: () => ({}),
        validate: () => []
      }
    ],
    onComplete: (draft, stepsData) => {
      console.log('Wizard completed!', draft, stepsData);
      alert('Nemovitost byla úspěšně vytvořena! (Demo režim - data nejsou uložena do databáze)');
      navigateTo('#/m/040-nemovitost');
    },
    onCancel: () => {
      navigateTo('#/m/040-nemovitost');
    }
  };

  await renderWizard(container, wizardConfig);
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

export default { render };
