// Univerzální komponenta pro vykreslení a správu formulářů (v češtině)
// ŽÁDNÁ tlačítka typu Archivovat/Příloha apod., pouze Uložit (save) – ostatní akce jsou v common actions!
// Použití: renderForm(root, fields, data, onSubmit, options)
// - root: DOM element, kam se formulář vykreslí
// - fields: pole s definicí polí (viz níže)
// - data: předvyplněná data (pro editaci), může být {}
// - onSubmit: async funkce, která dostane values, při success zavolat return true
// - options: { mode: "edit"|"read" }

export function renderForm(root, fields, data = {}, onSubmit, options = {}) {
  if (!root) return;

  const state = { values: { ...data }, errors: {} };
  const mode = options.mode || "edit";

  function validate() {
    state.errors = {};
    for (const f of fields) {
      if (f.required && !state.values[f.key]?.toString().trim()) {
        state.errors[f.key] = "Toto pole je povinné";
      }
      if (f.type === "email" && state.values[f.key]) {
        if (!/^[\w-.]+@[\w-.]+\.[a-z]{2,}$/i.test(state.values[f.key])) {
          state.errors[f.key] = "Zadejte platný e-mail";
        }
      }
    }
    return Object.keys(state.errors).length === 0;
  }

  function render() {
    root.innerHTML = "";
    const form = document.createElement("form");
    form.className = "space-y-6";
    form.noValidate = true;

    fields.forEach(f => {
      const val = state.values[f.key] ?? f.default ?? "";
      const err = state.errors[f.key];
      const fieldWrap = document.createElement("div");

      // v read módu jsou pole readonly/disabled
      const isReadonly = mode === "read" || f.readonly;

      fieldWrap.innerHTML = `
        <label class="block font-semibold mb-1" for="fld_${f.key}">
          ${f.label}${f.required ? ' <span class="text-red-500">*</span>' : ""}
        </label>
        ${genInput(f, val, isReadonly)}
        ${err ? `<div class="text-red-600 text-xs mt-1">${err}</div>` : ""}
      `;
      form.appendChild(fieldWrap);

      // Eventy jen pokud není readonly
      if (!isReadonly) {
        const input = fieldWrap.querySelector(`[name="${f.key}"]`);
        if (input) {
          input.addEventListener("input", function (e) {
            if (f.type === "checkbox-group") {
              // Checkbox group
              state.values[f.key] = Array.from(
                fieldWrap.querySelectorAll(`input[type="checkbox"]:checked`)
              ).map(ch => ch.value);
            } else if (f.type === "checkbox") {
              state.values[f.key] = input.checked;
            } else {
              state.values[f.key] = input.value;
            }
            render();
          });
        }
        // Special handling for checkbox-group
        if (f.type === "checkbox-group") {
          const group = fieldWrap.querySelectorAll(`input[type="checkbox"]`);
          group.forEach(ch => {
            ch.addEventListener("change", function (e) {
              state.values[f.key] = Array.from(
                fieldWrap.querySelectorAll(`input[type="checkbox"]:checked`)
              ).map(ch => ch.value);
              render();
            });
          });
        }
      }
    });

    // Tlačítko pouze Uložit (save), ostatní akce jsou v common actions!
    if (mode === "edit") {
      const btnWrap = document.createElement("div");
      btnWrap.className = "pt-4";
      btnWrap.innerHTML = `<button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold">Uložit</button>`;
      form.appendChild(btnWrap);
    }

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      if (!validate()) {
        render();
        return;
      }
      if (onSubmit && mode === "edit") {
        form.querySelector("button[type=submit]").disabled = true;
        const ok = await onSubmit({ ...state.values });
        form.querySelector("button[type=submit]").disabled = false;
        if (ok) {
          // success, optionally close form or show message
        }
      }
    });

    root.appendChild(form);
  }

  render();
}

// Pomocná funkce pro jednotlivé typy inputů
function genInput(f, val, isReadonly) {
  const id = `fld_${f.key}`;
  switch (f.type) {
    case "text":
    case "email":
    case "number":
    case "date":
      return `<input type="${f.type}" id="${id}" name="${f.key}" class="border rounded px-2 py-1 w-full" value="${escapeHtml(val)}" ${f.required ? "required" : ""} ${isReadonly ? "readonly disabled" : ""} />`;
    case "textarea":
      return `<textarea id="${id}" name="${f.key}" class="border rounded px-2 py-1 w-full" rows="3" ${f.required ? "required" : ""} ${isReadonly ? "readonly disabled" : ""}>${escapeHtml(val)}</textarea>`;
    case "select":
      return `<select id="${id}" name="${f.key}" class="border rounded px-2 py-1 w-full" ${f.required ? "required" : ""} ${isReadonly ? "disabled" : ""}>
        ${f.options.map(opt => `<option value="${opt.value}" ${val == opt.value ? "selected" : ""}>${opt.label}</option>`).join("")}
      </select>`;
    case "checkbox":
      return `<input type="checkbox" id="${id}" name="${f.key}" class="mr-2 align-middle" ${val ? "checked" : ""} ${isReadonly ? "disabled" : ""} />`;
    case "checkbox-group":
      return `<div class="flex flex-col gap-1">
        ${f.options.map(opt => `
          <label class="inline-flex items-center gap-2">
            <input type="checkbox" name="${f.key}" value="${opt.value}" ${Array.isArray(val) && val.includes(opt.value) ? "checked" : ""} ${isReadonly ? "disabled" : ""} />
            ${opt.label}
          </label>`).join("")}
      </div>`;
    default:
      return `<input type="text" id="${id}" name="${f.key}" class="border rounded px-2 py-1 w-full" value="${escapeHtml(val)}" ${isReadonly ? "readonly disabled" : ""} />`;
  }
}

function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
}
