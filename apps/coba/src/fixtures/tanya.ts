import type { PreviewResponse } from "../types";
// Cerita terlalu singkat ("mau bikin website"): backend hanya mengirim satu pertanyaan.
const tanya: PreviewResponse = { status: "needs_info", job_id: "tanya", question: "Usaha atau kegiatan apa yang ingin Anda online-kan, dan di kota mana?" };
export default tanya;
