import type { Presence } from "./types";
export const LABEL = { website: "Website", google_business: "Google", instagram: "Instagram", marketplace: "Marketplace" };
export const PLATFORM = { shopee: { name: "Shopee", color: "#EE4D2D" }, tokopedia: { name: "Tokopedia", color: "#03AC0E" } };
export const labelOf = (p: Presence) => (p.type === "marketplace" ? PLATFORM[p.data.platform].name : LABEL[p.type]);
const RANK = { primary: 0, high: 1, supporting: 2 };
export const sortPresence = (l: Presence[]) => [...l].sort((a, b) => RANK[a.priority] - RANK[b.priority]);
