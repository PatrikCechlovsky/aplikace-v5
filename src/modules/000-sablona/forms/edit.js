// src/modules/000-sablona/forms/edit.js
export default async function renderEdit(root) {
  root.innerHTML = `
    <div class="space-y-2">
      <h2 class="text-lg font-semibold">Editace</h2>
      <form class="space-y-2 p-3 rounded border bg-white" id="f-edit">
        <label class="block text-sm">
          Název
          <input class="mt-1 w-full border rounded px-2 py-1" name="name" placeholder="Zadejte název..." />
        </label>
        <div class="flex gap-2">
          <button type="submit" class="px-3 py-1.5 border rounded hover:bg-slate-50">Uložit</button>
          <button type="button" id="cancel" class="px-3 py-1.5 border rounded hover:bg-slate-50">Zrušit</button>
        </div>
      </form>
    </div>
  `;

  const form = root.querySelector('#f-edit');
  const cancel = root.querySelector('#cancel');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    // TODO: uložení… (zde jen simulace)
    alert('Uloženo.');
    history.back();
  });

  cancel.addEventListener('click', () => history.back());

  // signalizace „dirty“ při úpravě
  form.addEventListener('input', () => window.AppState?.setDirty?.(true));
}

