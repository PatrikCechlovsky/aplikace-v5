// Univerzální komponenta pro vykreslení a správu formulářů s výchozími tlačítky
// Použití: renderForm(root, fields, data, onSubmit, options)
// - root: DOM element, kam se formulář vykreslí
// - fields: pole s definicí polí (viz níže)
// - data: předvyplněná data (pro editaci), může být {}
// - onSubmit: async funkce, která dostane values, při success zavolat return true
// - options: { mode: "edit"|"read", onArchive, onAttach, hideArchive, hideAttach, extraButtons }

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

    // Výchozí tlačítka
    const btnWrap = document.createElement("div");
    btnWrap.className = "pt-4 flex gap-2";

    if (mode === "edit") {
      btnWrap.innerHTML += `<button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold">Uložit</button>`;
    }
    if (!options.hideArchive) {
      btnWrap.innerHTML += `<button type="button" id="btn-archive" class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 font-semibold">Archivovat</button>`;
    }
    if (!options.hideAttach) {
      btnWrap.innerHTML += `<button type="button" id="btn-attach" class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 font-semibold">Příloha</button>`;
    }
    // Extra tlačítka
    if (Array.isArray(options.extraButtons)) {
      for (const btn of options.extraButtons) {
        btnWrap.innerHTML += `<button type="button" id="btn-${btn.key}" class="${btn.className||'px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 font-semibold'}">${btn.label}</button>`;
      }
    }
    form.appendChild(btnWrap);

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

    // Handler pro Archivovat
    if (!options.hideArchive) {
      form.querySelector("#btn-archive").onclick = e => {
        e.preventDefault();
        if (options.onArchive) return options.onArchive(state.values);
        alert("Archivace není implementována.");
      };
    }
    // Handler pro Přílohu
    if (!options.hideAttach) {
      form.querySelector("#btn-attach").onclick = e => {
        e.preventDefault();
        if (options.onAttach) return options.onAttach(state.values);
        alert("Přidání přílohy není implementováno.");
      };
    }
    // Handlery pro extra tlačítka
    if (Array.isArray(options.extraButtons)) {
      for (const btn of options.extraButtons) {
        const el = form.querySelector(`#btn-${btn.key}`);
        if (el && typeof btn.onClick === "function") {
          el.onclick = e => {
            e.preventDefault();
            btn.onClick(state.values);
          };
        }
      }
    }

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
