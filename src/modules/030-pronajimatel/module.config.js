export async function getManifest() {
  return {
    id: "030-pronajimatel",      // unikátní ID
    title: "Pronajímatel",       // název v menu
    icon: "home",                // volitelně ikonka (podle tvého systému ikon)
    tiles: [
      {
        id: "detail",
        title: "Detail",
        icon: "tile",
        desc: "Formulář"
      },
      {
        id: "prehled",
        title: "Přehled",
        icon: "list",
        desc: "Seznam"
      }
    ],
    forms: [
      {
        id: "novy",
        title: "Nový / Pozvat",
        icon: "form",
        desc: "Formulář"
      }
    ],
    defaultTile: "prehled" // volitelné, jaký je výchozí tile
  }
}
