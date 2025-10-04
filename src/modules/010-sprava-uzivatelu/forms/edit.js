import { renderForm } from '../../../ui/form.js';
import { setBreadcrumb } from '../../../ui/breadcrumb.js';
import { getProfile, updateProfile, listPronajimatele, getPronajimatel } from '../../../db.js';

export async function render(root) {
  setBreadcrumb(document.getElementById('crumb'), [
    { icon: 'home', label: 'Domů', href: '#/' },
    { icon: 'users', label: 'Uživatelé', href: '#/m/010-sprava-uzivatelu' },
    { icon: 'edit', label: 'Upravit' },
  ]);

  const id = new URLSearchParams(location.hash.split('?')[1] || '').get('id');
  if (!id) { root.innerHTML = '<div class="p-4 text-red-600">Chybí id.</div>'; return; }

  // Získání uživatele k editaci
  const { data: user, error } = await getProfile(id);
  if (error) { root.innerHTML = `<div class="p-4 text-red-600">${error.message}</div>`; return; }

  // Získání seznamu pronajímatelů
  const { data: pronajimatele } = await listPronajimatele();
  const pronajOptions = (pronajimatele || []).map(p => ({ value: p.id, label: p.display_name }));

  // Definice polí
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
    ]}
  ];

  // Handler pro změnu pronajímatele (přepíše pole formuláře jeho údaji)
  async function onFieldChange(values, changedKey) {
    if (changedKey === "pronajimatel_id") {
      if (values.pronajimatel_id) {
        const { data: p } = await getPronajimatel(values.pronajimatel_id);
        if (p) {
          // automatické předvyplnění některých polí pronajímatelem
          values.display_name = p.display_name || values.display_name;
          values.email = p.email || values.email;
          values.phone = p.phone || values.phone;
          values.mesto = p.mesto || values.mesto;
        }
        renderForm(root, fields, values, onSubmit, { onFieldChange });
        return;
      }
    }
  }

  // Ukládání
  async function onSubmit(values) {
    const { error } = await updateProfile(id, values);
    if (error) {
      alert("Chyba: " + error.message);
      return false;
    }
    alert("Uživatel upraven.");
    navigateTo(`#/m/010-uzivatele/f/read?id=${id}`);
    return true;
  }

  // Render initial
  renderForm(root, fields, user, onSubmit, { onFieldChange });
}
export default { render };
