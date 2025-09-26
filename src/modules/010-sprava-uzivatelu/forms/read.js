// src/modules/010-sprava-uzivatelu/forms/read.js
export default async function renderReadForm(root, row){
  root.innerHTML = `
    <div class="p-4 bg-white rounded-2xl border space-y-2">
      <h3 class="font-medium">Uživatel – detail</h3>
      <div class="text-sm"><b>Jméno:</b> ${row.name}</div>
      <div class="text-sm"><b>Email:</b> ${row.email}</div>
      <div class="text-sm"><b>Role:</b> ${row.role}</div>
      <div class="text-sm"><b>Město:</b> ${row.city}</div>
      <div class="pt-2">
        <a href="#/m/010-uzivatele/t/seznam" class="px-3 py-1 border rounded bg-white text-sm">← Zpět na seznam</a>
      </div>
    </div>
  `;
}
