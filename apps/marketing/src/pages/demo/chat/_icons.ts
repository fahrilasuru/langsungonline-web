/* Ikon gaya garis (24x24). Hanya berisi data path statis, tidak pernah dibuat dari input pengguna. */
export const ICONS = {
    search: ["M3 11a8 8 0 1 0 16 0a8 8 0 1 0-16 0", "m21 21-4.3-4.3"],
    "chevron-left": ["m15 18-6-6 6-6"],
    send: ["m22 2-7 20-4-9-9-4Z", "M22 2 11 13"],
    paperclip: [
        "m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48",
    ],
    info: ["M2 12a10 10 0 1 0 20 0a10 10 0 1 0-20 0", "M12 16v-4", "M12 8h.01"],
    x: ["M18 6 6 18", "m6 6 12 12"],
    check: ["M20 6 9 17l-5-5"],
    "check-check": ["M18 6 7 17l-5-5", "m22 10-7.5 7.5L13 16"],
    "file-text": [
        "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",
        "M14 2v4a2 2 0 0 0 2 2h4",
        "M10 9H8",
        "M16 13H8",
        "M16 17H8",
    ],
    image: [
        "M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z",
        "M7.5 9a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0",
        "m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21",
    ],
    "map-pin": [
        "M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z",
        "M9 10a3 3 0 1 0 6 0a3 3 0 1 0-6 0",
    ],
    "arrow-down": ["M12 5v14", "m19 12-7 7-7-7"],
    "message-circle": ["M7.9 20A9 9 0 1 0 4 16.1L2 22Z"],
} as const;

export type IconName = keyof typeof ICONS;
