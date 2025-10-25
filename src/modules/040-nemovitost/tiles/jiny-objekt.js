// Redirect to prehled with type filter
// This tile now serves as a redirect wrapper to prehled.js with type filtering
import { navigateTo } from '/src/app.js';

export async function render(root) {
  // Immediately redirect to prehled with type filter
  navigateTo('#/m/040-nemovitost/t/prehled?type=jiny_objekt');
  
  // Show loading message briefly
  root.innerHTML = `<div class="p-4 text-gray-600">Načítání jiných objektů...</div>`;
}

export default { render };
