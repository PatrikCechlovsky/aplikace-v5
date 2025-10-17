import { setUnsaved } from "../app.js";

/**
 * Automatické hlídání rozdělané práce ve formuláři.
 * Po změně pole nastaví stav na rozpracováno, po submitu na uloženo.
 */
export function useUnsavedHelper(form) {
  if (!form) return;
  setUnsaved(false);

  // Každá změna v poli = rozpracováno
  form.addEventListener("input", () => setUnsaved(true));

  // Po submitu "vyčisti" stav, zachová původní onsubmit
  const orig = form.onsubmit;
  form.onsubmit = function(e) {
    setUnsaved(false);
    if (typeof orig === "function") return orig.call(this, e);
  };
}
