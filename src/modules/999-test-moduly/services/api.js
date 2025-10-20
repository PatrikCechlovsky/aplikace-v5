// src/modules/999-test-moduly/services/api.js
// Testovací API služby

/**
 * Získá seznam testovacích položek
 */
export async function getTestItems() {
  // Simulace API volání
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return {
    data: [
      { id: 1, name: 'Testovací položka 1', status: 'active' },
      { id: 2, name: 'Testovací položka 2', status: 'inactive' },
      { id: 3, name: 'Testovací položka 3', status: 'active' },
    ],
    error: null
  };
}

/**
 * Získá detail testovací položky
 */
export async function getTestItem(id) {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return {
    data: {
      id,
      name: `Testovací položka ${id}`,
      status: 'active',
      description: 'Popis testovací položky',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    error: null
  };
}

/**
 * Uloží testovací položku
 */
export async function saveTestItem(data) {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  console.log('Ukládám testovací data:', data);
  
  return {
    data: { ...data, id: data.id || Date.now() },
    error: null
  };
}

/**
 * Smaže testovací položku
 */
export async function deleteTestItem(id) {
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return {
    data: { id },
    error: null
  };
}
