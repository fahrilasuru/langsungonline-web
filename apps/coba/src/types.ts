export type Img = { url: string; alt: string };
export type Hours = { days: string; open: string };
export type Product = { id: string; name: string; price?: number; category?: string; description?: string; image?: Img; suggested?: boolean };
export type Business = {
  name: string; category: string; city?: string; address?: string; phone?: string; whatsapp: string; bio?: string;
  hours: Hours[]; logo?: Img; logo_icon?: string; products: Product[];
};
type OfferingBody =
  | { kind: "catalog"; title: string; product_ids: string[] }
  | { kind: "packages"; title: string; tiers: { name: string; price?: number; features: string[]; featured?: boolean }[] }
  | { kind: "services"; title: string; items: { name: string; description: string; icon?: string }[] }
  | { kind: "events"; title: string; items: { name: string; date?: string; time?: string; place?: string; description?: string }[] };
export type Offering = OfferingBody & { suggested?: boolean; nav_label?: string; intro?: string };
export type Site = {
  slug: string;
  theme: { primary: string; background: string; ink: string; accent?: string; font?: "sans" | "serif" };
  hero: { headline: string; subheadline: string; cta_label: string; secondary_label?: string; badges?: string[]; image?: Img };
  positioning: { title: string; body: string; points: string[]; image?: Img; suggested?: boolean };
  highlights?: { title: string; items: { icon?: string; title: string; text: string }[]; suggested?: boolean };
  stats?: { items: { value: string; label: string }[] };
  offering?: Offering;
  process?: { title: string; steps: { title: string; text: string }[]; suggested?: boolean };
  proof?: { title: string; facts: string[]; photos: Img[]; suggested?: boolean };
  testimonials?: { title: string; items: { quote: string; name: string; role?: string }[] };
  faq?: { title: string; items: { q: string; a: string }[]; suggested?: boolean };
  cta: { headline: string; body: string; label: string };
};
export type Highlight = { label: string; icon: string; kind: "menu" | "location" | "contact" | "text"; title?: string; body?: string; image?: Img };
export type Platform = "shopee" | "tokopedia";
type Base = { priority: "primary" | "high" | "supporting"; reason: string; copy?: { title: string; body: string } };
export type Presence =
  | (Base & { type: "website" })
  | (Base & { type: "google_business"; data: { photos: Img[]; rating?: { value: number; count?: number; sample?: boolean } } })
  | (Base & { type: "instagram"; data: { handle: string; suggested?: boolean; highlights: Highlight[]; grid_image?: Img; posts: { caption: string; image?: Img }[] } })
  | (Base & { type: "marketplace"; data: { platform: Platform; store_name: string; product_ids: string[] } });
export type PresenceType = Presence["type"];
export type Ready = { status: "ready"; job_id: string; consult_whatsapp: string; extras?: { type: "whatsapp_business" | "tiktok" | "facebook" | "youtube"; note?: string }[]; business: Business; site: Site; recommended_presence: Presence[]; recommendations: string[]; completeness?: "rich" | "basic" | "minimal" };
export type PreviewResponse =
  | Ready
  | { status: "processing" | "failed" | "declined"; job_id: string }
  | { status: "needs_info"; job_id: string; question: string };
