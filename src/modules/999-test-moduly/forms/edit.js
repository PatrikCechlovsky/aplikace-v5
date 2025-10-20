// src/modules/999-test-moduly/forms/edit.js
export default async function renderEdit(root) {
  const qs = new URLSearchParams((location.hash.split('?')[1] || ''));
  const id = qs.get('id');

  root.innerHTML = `
    <div class="space-y-2">
      <h2 class="text-lg font-semibold">Test moduly - Editace ${id ? `(ID: ${id})` : '(Nový)'}</h2>
      <form class="space-y-2 p-3 rounded border bg-white" id="f-edit">
        <label class="block text-sm">
          Název
          <input 
            class="mt-1 w-full border rounded px-2 py-1" 
            name="name" 
            placeholder="Zadejte název testovací položky..." 
            value="${id ? `Testovací položka ${id}` : ''}"
          />
        </label>
        <label class="block text-sm">
          Status
          <select class="mt-1 w-full border rounded px-2 py-1" name="status">
            <option value="active">Aktivní</option>
            <option value="inactive">Neaktivní</option>
          </select>
        </label>
        <label class="block text-sm">
          Popis
          <textarea 
            class="mt-1 w-full border rounded px-2 py-1" 
            name="description" 
            rows="3"
            placeholder="Popis testovací položky..."
          ></textarea>
        </label>
        <div class="flex gap-2">
          <button type="submit" class="px-3 py-1.5 border rounded hover:bg-slate-50 bg-blue-50">
            Uložit
          </button>
          <button type="button" id="cancel" class="px-3 py-1.5 border rounded hover:bg-slate-50">
            Zrušit
          </button>
        </div>
      </form>
    </div>
  `;

  const form = root.querySelector('#f-edit');
  const cancel = root.querySelector('#cancel');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    console.log('Testovací data k uložení:', data);
    alert('Testovací data uložena (demo).');
    history.back();
  });

  cancel.addEventListener('click', () => history.back());
  form.addEventListener('input', () => window.AppState?.setDirty?.(true));
}
