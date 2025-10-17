// Převod prázdných stringů na null (pro všechny hodnoty v objektu)
export function emptyStringsToNull(obj) {
  for (const k in obj) {
    if (obj[k] === "") obj[k] = null;
  }
  return obj;
}
