// Riwayat preview yang tersimpan di perangkat ini saja (localStorage). Tidak ada data yang dikirim ke server.
export type Entry = { id: string; name?: string; category?: string; status: string; savedAt: number; updatedAt: number };
const KEY = "langsung:previews";
const MAX = 20;
const VALID_ID = /^[A-Za-z0-9_-]{6,64}$/;

export const read = (): Entry[] => {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "[]");
    return (Array.isArray(v) ? v : []).filter((e) => e && VALID_ID.test(e.id)).sort((a, b) => b.savedAt - a.savedAt);
  } catch { return []; }
};
const write = (l: Entry[]) => { try { localStorage.setItem(KEY, JSON.stringify(l.slice(0, MAX))); } catch { /* mode privat: abaikan */ } };
const defined = (o: object) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined));

export function upsert(e: Partial<Entry> & { id: string }) {
  if (!VALID_ID.test(e.id)) return;
  const list = read(), i = list.findIndex((x) => x.id === e.id), now = Date.now();
  if (i >= 0) list[i] = { ...list[i], ...defined(e), updatedAt: now } as Entry;
  else list.unshift({ status: "processing", savedAt: now, updatedAt: now, ...defined(e) } as Entry);
  write(list);
}
export const remove = (id: string) => write(read().filter((e) => e.id !== id));
export const clear = () => { try { localStorage.removeItem(KEY); } catch { /* abaikan */ } };
