export const menus = [
  "Target",
  "Pesan",
  "Preview",
    "SEO",
] as const;

export type Menu = (typeof menus)[number];