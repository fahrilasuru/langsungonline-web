export const menus = [
  "Target",
  "Pesan",
  "Preview",
] as const;

export type Menu = (typeof menus)[number];