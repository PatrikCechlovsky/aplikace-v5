import { setUnsaved } from "../../app.js";

/**
 * Navěsí na formulář automatické hlídání rozdělané práce.
 * Nastaví čistý stav při načtení a při změně pole označí jako rozpracované.
 * Po úspěšném submitu nastav false.
 */
export function useUnsavedHelper(form) {
  if (!form) return;
  setUnsaved(false);

  // Jakákoliv změna = rozpracováno
  form.addEventListener("input", () => setUnsaved(true));

  // Po submitu "vyčisti" stav
  const orig = form.onsubmit;
  form.onsubmit = function(e) {
    setUnsaved(false);
    if (typeof orig === "function") return orig.call(this, e);
  };
}
