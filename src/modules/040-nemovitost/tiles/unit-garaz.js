// Redirect to unit-prehled with type filter for "garaz"
import { navigateTo } from '/src/app.js';

export async function render(root) {
  // Immediately redirect to unit-prehled with type filter
  navigateTo('#/m/040-nemovitost/t/unit-prehled?type=garaz');
  
  // Show loading message briefly
  root.innerHTML = `<div class="p-4 text-gray-600">Načítání garáží...</div>`;
}

export default { render };
