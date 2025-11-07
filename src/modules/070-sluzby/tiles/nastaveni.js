// src/modules/070-sluzby/tiles/nastaveni.js
// Nastavení číslování služeb

import { setBreadcrumb } from '/src/ui/breadcrumb.js';
import { renderForm } from '/src/ui/form.js';
import { supabase } from '/src/supabase.js';

export default async function render(root) {
  try {
    setBreadcrumb(document.getElementById('crumb'), [
      { icon: 'home', label: 'Domů', href: '#/' },
      { icon: 'settings', label: 'Služby', href: '#/m/070-sluzby' },
      { icon: 'settings', label: 'Nastavení' }
    ]);
  } catch (e) { /* ignore */ }

  root.innerHTML = '<div class="p-4"><div class="text-center">Načítání nastavení...</div></div>';

  // Load current numbering config
  const { data: configs, error } = await supabase
    .from('numbering_config')
    .select('*')
    .eq('scope', 'module:070')
    .eq('entity_type', 'service')
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    root.innerHTML = `<div class="p-4 text-red-600">Chyba při načítání nastavení: ${error.message}</div>`;
    return;
  }

  const initialData = configs || {
    scope: 'module:070',
    entity_type: 'service',
    prefix: 'SLU',
    start_number: 1,
    current_number: 0,
    increment: 1,
    zero_padding: 4,
    separator: '-',
    format_template: '{PREFIX}-{NUMBER}',
    active: true
  };

  const container = document.createElement('div');
  container.className = 'p-4 max-w-4xl mx-auto';

  const headerDiv = document.createElement('div');
  headerDiv.className = 'bg-white rounded-lg shadow p-6 mb-6';
  headerDiv.innerHTML = `
    <h2 class="text-2xl font-bold mb-2">Nastavení číslování služeb</h2>
    <p class="text-gray-600">
      Zde můžete nastavit formát a číselnou řadu pro automatické generování kódů služeb.
      Kód služby musí být jedinečný, protože některé služby jsou propojeny na měřidla.
    </p>
  `;
  container.appendChild(headerDiv);

  const formContainer = document.createElement('div');
  formContainer.className = 'bg-white rounded-lg shadow p-6';
  container.appendChild(formContainer);

  const fields = [
    {
      key: 'prefix',
      label: 'Prefix',
      type: 'text',
      required: true,
      help: 'Prefix pro kód služby (např. "SLU", "ENERG", "VODA"). Prefix nebo text musí být jedinečný.',
      section: 'Formát číslování'
    },
    {
      key: 'separator',
      label: 'Oddělovač',
      type: 'text',
      maxLength: 10,
      help: 'Znak pro oddělení částí kódu (např. "-", "/", "_")',
      section: 'Formát číslování'
    },
    {
      key: 'format_template',
      label: 'Šablona formátu',
      type: 'select',
      required: true,
      options: [
        { value: '{PREFIX}-{NUMBER}', label: 'PREFIX-ČÍSLO (např. SLU-0001)' },
        { value: '{PREFIX}{NUMBER}', label: 'PREFIXČÍSLO (např. SLU0001)' },
        { value: '{PREFIX}-{YEAR}-{NUMBER}', label: 'PREFIX-ROK-ČÍSLO (např. SLU-2025-0001)' },
        { value: '{PREFIX}{SEPARATOR}{NUMBER}', label: 'PREFIX/ČÍSLO (s vlastním oddělovačem)' }
      ],
      help: 'Vyberte formát kódu služby',
      section: 'Formát číslování'
    },
    {
      key: 'start_number',
      label: 'Počáteční číslo',
      type: 'number',
      required: true,
      min: 1,
      help: 'Od jakého čísla začíná číselná řada (obvykle 1)',
      section: 'Číselná řada'
    },
    {
      key: 'current_number',
      label: 'Aktuální číslo',
      type: 'number',
      readOnly: true,
      help: 'Poslední použité číslo v řadě (pouze pro zobrazení, nelze měnit)',
      section: 'Číselná řada'
    },
    {
      key: 'increment',
      label: 'Krok',
      type: 'number',
      required: true,
      min: 1,
      help: 'O kolik se zvyšuje číslo při každém použití (obvykle 1)',
      section: 'Číselná řada'
    },
    {
      key: 'zero_padding',
      label: 'Délka čísla (počet cifer)',
      type: 'number',
      required: true,
      min: 1,
      max: 10,
      help: 'Kolik míst má mít číslo (např. 4 = "0001", "0002", ...)',
      section: 'Číselná řada'
    },
    {
      key: 'active',
      label: 'Aktivní',
      type: 'checkbox',
      help: 'Pokud je aktivní, bude tato konfigurace použita pro generování kódů',
      section: 'Stav'
    }
  ];

  // Preview section
  const previewDiv = document.createElement('div');
  previewDiv.className = 'mt-6 p-4 bg-green-50 border border-green-200 rounded-lg';
  previewDiv.innerHTML = `
    <h3 class="font-semibold mb-2">Náhled kódu služby:</h3>
    <div id="code-preview" class="text-xl font-mono font-bold text-green-700">-</div>
    <p class="text-sm text-gray-600 mt-2">
      <strong>Poznámka:</strong> Kód služby musí být jedinečný. 
      Některé služby budou propojené na měřidla, proto je důležité mít konzistentní číslování.
    </p>
  `;
  container.appendChild(previewDiv);

  function updatePreview(formData) {
    const preview = document.getElementById('code-preview');
    if (!preview) return;

    const year = new Date().getFullYear().toString();
    const nextNum = (formData.current_number || 0) + (formData.increment || 1);
    const paddedNum = String(nextNum).padStart(formData.zero_padding || 4, '0');
    
    let result = formData.format_template || '{PREFIX}-{NUMBER}';
    result = result.replace('{PREFIX}', formData.prefix || 'SLU');
    result = result.replace('{SEPARATOR}', formData.separator || '-');
    result = result.replace('{YEAR}', year);
    result = result.replace('{NUMBER}', paddedNum);
    
    preview.textContent = result;
  }

  async function handleSubmit(formData) {
    try {
      const dataToSave = {
        scope: 'module:070',
        entity_type: 'service',
        ...formData
      };

      let result;
      if (configs && configs.id) {
        // Update existing
        result = await supabase
          .from('numbering_config')
          .update(dataToSave)
          .eq('id', configs.id)
          .select()
          .single();
      } else {
        // Insert new
        result = await supabase
          .from('numbering_config')
          .insert(dataToSave)
          .select()
          .single();
      }

      if (result.error) {
        alert(`Chyba při ukládání: ${result.error.message}`);
        return false;
      }

      alert('Nastavení bylo úspěšně uloženo.');
      render(root); // Reload to show updated data
      return true;
    } catch (err) {
      alert(`Chyba: ${err.message}`);
      return false;
    }
  }

  renderForm(formContainer, fields, initialData, handleSubmit, {
    submitLabel: 'Uložit nastavení',
    showSubmit: true,
    layout: { columns: { base: 1, md: 2 } },
    sections: ['Formát číslování', 'Číselná řada', 'Stav'],
    onChange: updatePreview
  });

  // Initial preview
  updatePreview(initialData);

  root.innerHTML = '';
  root.appendChild(container);
}
