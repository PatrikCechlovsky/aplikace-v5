// Konfigurace rolí a jejich barev (lze později editovat přes formulář)
export const ROLE_CONFIG = [
  { value: "admin",        label: "Administrátor", bg: "#FEF3C7", fg: "#92400E", border: "#F59E42" },
  { value: "pronajimatel", label: "Pronajímatel",  bg: "#ECFEF5", fg: "#065F46", border: "#2DD4BF" },
  { value: "najemnik",     label: "Nájemník",      bg: "#F0FDFA", fg: "#134E4A", border: "#22D3EE" },
  { value: "servisak",     label: "Servisák",      bg: "#EEF2FF", fg: "#3730A3", border: "#818CF8" },
  // Další role můžeš přidat zde...
];
// Vrací config role podle value
export function getRoleConfig(value) {
  return ROLE_CONFIG.find(r => r.value === value) || { label: value, bg: "#F3F4F6", fg: "#6B7280", border: "#D1D5DB" };
}
