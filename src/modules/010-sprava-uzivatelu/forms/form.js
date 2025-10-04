import { renderForm } from '../../../ui/form.js';
import { setBreadcrumb } from '../../../ui/breadcrumb.js';
import { getProfile, updateProfile, createProfile } from '../../../db.js';
import { navigateTo } from '../../../app.js';

// Univerzální formulář pro uživatele (edit, detail, nový)
export async function render(root, params = {}) {
  const search = location.hash.split('?')[1] || '';
  const urlParams = new URLSearchParams(search);
  const id = params.id || urlParams.get('id');
  // Pokud není mode zadané, defaultně "edit", protože chceš hlavně editovat
  const mode = params.mode || urlParams.get('mode') || (id ? 'edit' : 'create');

  setBreadcrumb(document.getElementById('crumb'), [
    { icon: 'home', label: 'Domů', href: '#/' },
    { icon: 'users', label: 'Uživatelé', href: '#/m/010-sprava-uzivatelu' },
    { icon: mode === "create" ? 'add' : 'edit', label: mode === "create" ? 'Nový / Pozvat' : 'Editace' },
  ]);

  let values = {};
  if (id && mode !== "create") {
    const { data: user, error } = await getProfile(id);
    if (error) { root.innerHTML = `<div class="p-4 text-red-600">${error.message}</div>`; return; }
    values = user;
  }

  const fields = [
    { key: "display_name", label: "Jméno", type: "text", required: true },
    { key: "email", label: "E‑mail", type: "email", required: true },
    { key: "phone", label: "Telefon", type: "text" },
    { key: "mesto", label: "Město", type: "text" },
    { key: "role", label: "Role", type: "select", required: true, options: [
      { value: "admin", label: "Administrátor" },
      { value: "pronajimatel", label: "Pronajímatel" },
      { value: "najemnik", label: "Nájemník" },
      { value: "servisak", label: "Servisák" },
      { value: "user", label: "Uživatel" }
    ]},
    { key: "note", label: "Poznámka", type: "textarea" },
  ];

  async function onSubmit(values) {
    let error;
    if (mode === "edit" && id) {
      ({ error } = await updateProfile(id, values));
    } else if (mode === "create") {
      ({ error } = await createProfile(values));
    }
    if (error) {
      alert("Chyba: " + error.message);
      return false;
    }
    alert(mode === "create" ? "Uživatel vytvořen." : "Uživatel upraven.");
    navigateTo('#/m/010-sprava-uzivatelu/t/prehled');
    return true;
  }

  renderForm(
    root,
    fields,
    values,
    mode === "read" ? undefined : onSubmit,
    { mode }
  );
}
export default { render };
