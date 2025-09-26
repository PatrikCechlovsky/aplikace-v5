export default async function renderCreateForm(root){
  root.innerHTML = `
    <div class="p-4 bg-white rounded-2xl border">
      <h3 class="font-medium mb-2">Nový uživatel</h3>
      <p class="text-sm">Formulář (později – CRUD přes Supabase).</p>
    </div>
  `;
}
