// Redirect to unit-prehled with type filter for "sklad"
import { navigateTo } from '/src/app.js';

export async function render(root) {
  // Immediately redirect to unit-prehled with type filter
  navigateTo('#/m/040-nemovitost/t/unit-prehled?type=sklad');
  
  // Show loading message briefly
  root.innerHTML = `<div class="p-4 text-gray-600">Načítání skladů...</div>`;
}

export default { render };
