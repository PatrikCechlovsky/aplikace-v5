import { renderForm } from '../../../ui/form.js';
import { setBreadcrumb } from '../../../ui/breadcrumb.js';
import { getProfile, updateProfile, listPronajimatele, getPronajimatel } from '../../../db.js';
import { navigateTo } from '../../../app.js'; // Přidej import pro navigaci

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
  const { data: pronajimatele, error: pronError } = await listPronajimatele();
  if (pronError) { root.innerHTML = `<div class="p-4 text-red-600">${pronError.message}</div>`; return; }
  const pronajOptions = (pronajimatele || []).map(p => ({ value: p.id, label: p.display_name }));

  // Definice polí (přidej další podle potřeby)
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
    // Přidej další pole podle potřeby
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
        renderFormWrapper(values); // zachovej stav a znovu vykresli
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

  // Wrapper pro renderování formuláře + případná další tlačítka
  function renderFormWrapper(values = user) {
    root.innerHTML = ""; // smaž předchozí obsah

    // Formulář
    const formDiv = document.createElement("div");
    renderForm(formDiv, fields, values, onSubmit, { onFieldChange });

    root.appendChild(formDiv);

    // Další akce/přílohy (příklad: tlačítko pro přílohy)
    const actionsDiv = document.createElement("div");
    actionsDiv.className = "pt-4 flex gap-2";
    // Příloha (zatím jen alert, pak můžeš napojit dialog nebo navigaci)
    const btnAttach = document.createElement("button");
    btnAttach.type = "button";
    btnAttach.innerText = "Přidat přílohu";
    btnAttach.className = "px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 font-semibold";
    btnAttach.onclick = () => {
      alert(`Zde můžeš napojit dialog nebo další formulář pro přílohy k uživateli: ${values.display_name || ''}`);
      // Například: navigateTo(`#/m/010-uzivatele/f/attachments?id=${id}`);
    };
    actionsDiv.appendChild(btnAttach);

    // Další akce lze přidat obdobně

    root.appendChild(actionsDiv);
  }

  // Render initial
  renderFormWrapper(user);
}

export default { render };
