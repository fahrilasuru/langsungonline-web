export const menus = [
  "Dashboard",
  "Pesan",
  "Preview",
  "Pengaturan",
] as const;

export type Menu = (typeof menus)[number];