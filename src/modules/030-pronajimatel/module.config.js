export async function getManifest() {
  return {
    id: "030-pronajimatel",
    title: "Pronajímatel",
    icon: "home",
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
    defaultTile: "prehled"
  }
}
