import { renderForm } from '../../../ui/form.js';
import { setBreadcrumb } from '../../../ui/breadcrumb.js';
import { getProfile, updateProfile, createProfile, listPronajimatele, getPronajimatel } from '../../../db.js';
import { navigateTo } from '../../../app.js';

// Univerzální formulář pro uživatele (edit, detail, nový)
export async function render(root, params = {}) {
  // Získání id a mode z parametru NEBO z URL (pro kompatibilitu s routerem)
  const search = location.hash.split('?')[1] || '';
  const urlParams = new URLSearchParams(search);
  const id = params.id || urlParams.get('id');
  const mode = params.mode || urlParams.get('mode') || 'read';

  // Breadcrumb podle módu
  setBreadcrumb(document.getElementById('crumb'), [
    { icon: 'home', label: 'Domů', href: '#/' },
    { icon: 'users', label: 'Uživatelé', href: '#/m/010-sprava-uzivatelu' },
    { icon: mode === "read" ? 'detail' : (mode === "edit" ? 'edit' : 'add'), label: mode === "read" ? 'Detail' : (mode === "edit" ? 'Upravit' : 'Nový / Pozvat') },
  ]);

  // Načtení dat
  let values = {};
  if (id && mode !== "create") {
    const { data: user, error } = await getProfile(id);
    if (error) { root.innerHTML = `<div class="p-4 text-red-600">${error.message}</div>`; return; }
    values = user;
  }

  // Pronajímatelé (pro select) – pouze v edit/create
  let pronajOptions = [];
  if (mode !== "read") {
    const { data: pronajimatele, error: pronError } = await listPronajimatele?.() || {};
    if (pronError) { root.innerHTML = `<div class="p-4 text-red-600">${pronError.message}</div>`; return; }
    pronajOptions = (pronajimatele || []).map(p => ({ value: p.id, label: p.display_name }));
  }

  const fields = [
    { key: "pronajimatel_id", label: "Pronajímatel", type: "select", required: true, options: pronajOptions },
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

  // Handler pro změnu pronajímatele (pro edit/create)
  async function onFieldChange(values, changedKey) {
    if (changedKey === "pronajimatel_id" && values.pronajimatel_id) {
      const { data: p } = await getPronajimatel(values.pronajimatel_id);
      if (p) {
        values.display_name = p.display_name || values.display_name;
        values.email = p.email || values.email;
        values.phone = p.phone || values.phone;
        values.mesto = p.mesto || values.mesto;
      }
      renderForm(root, fields, values, onSubmit, { mode, onFieldChange });
      return;
    }
  }

  // Ukládání/upravení/vytvoření
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
    { mode, onFieldChange: mode !== "read" ? onFieldChange : undefined }
  );
}
export default { render };
