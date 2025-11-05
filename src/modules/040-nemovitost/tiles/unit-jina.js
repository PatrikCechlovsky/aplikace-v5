// Redirect to unit-prehled with type filter for "jina"
import { navigateTo } from '/src/app.js';

export async function render(root) {
  // Immediately redirect to unit-prehled with type filter
  navigateTo('#/m/040-nemovitost/t/unit-prehled?type=jina');
  
  // Show loading message briefly
  root.innerHTML = `<div class="p-4 text-gray-600">Načítání jiných jednotek...</div>`;
}

export default { render };
