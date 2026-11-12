export type CategoryId =
  "minimal" | "editorial" | "romantic" | "playful" | "modern" | "traditional";

export interface TemplateCategory {
  id: CategoryId;
  label: string;
  description: string;
}

/** Template slug — free string so inventory can grow without type changes. */
export type TemplateId = string;

export interface InvitationTemplate {
  id: TemplateId;
  categoryId: CategoryId;
  /** Display name for this template variant. */
  name: string;
  couple: string;
  date: string;
  place: string;
  vibe: string;
  /** Show in landing showcase (keep ~4 max). */
  featuredOnLanding: boolean;
  /** Slightly larger tile when browsing “All” on Product. */
  featuredInGallery: boolean;
}

export const templateCategories: TemplateCategory[] = [
  {
    id: "minimal",
    label: "Minimal",
    description: "Bersih, tenang, elegan tanpa ramai.",
  },
  {
    id: "editorial",
    label: "Editorial",
    description: "Huruf serif anggun ala halaman majalah.",
  },
  {
    id: "romantic",
    label: "Romantic",
    description: "Warna pastel lembut dan hangat.",
  },
  {
    id: "playful",
    label: "Playful",
    description: "Warna cerah dan bentuk ceria.",
  },
  {
    id: "modern",
    label: "Modern",
    description: "Geometris, kontras tinggi, modern.",
  },
  {
    id: "traditional",
    label: "Traditional",
    description: "Klasik dan khidmat, cocok untuk acara adat.",
  },
];

/**
 * Local template inventory (pre-Supabase).
 * - `id` → file `src/templates/<id>.tsx` (and RENDERERS key)
 * - `categoryId` → Product filter / vibe group (many ids can share one category)
 */
export const invitationTemplates: InvitationTemplate[] = [
  {
    id: "minimal",
    categoryId: "minimal",
    name: "Minimal",
    couple: "SINTA / ANDI",
    date: "24 AUGUST 2027",
    place: "The Modern Club · Jakarta",
    vibe: "Bersih, tenang, elegan tanpa ramai.",
    featuredOnLanding: true,
    featuredInGallery: true,
  },
  {
    id: "editorial",
    categoryId: "editorial",
    name: "Editorial",
    couple: "Olivia & James",
    date: "24.08.27",
    place: "The Modern Club · Jakarta",
    vibe: "Huruf serif anggun ala halaman majalah.",
    featuredOnLanding: true,
    featuredInGallery: false,
  },
  {
    id: "romantic",
    categoryId: "romantic",
    name: "Romantic",
    couple: "Amelia\n& Noah",
    date: "SEPTEMBER 12, 2027",
    place: "The Modern Club · Jakarta",
    vibe: "Warna pastel lembut dan hangat.",
    featuredOnLanding: true,
    featuredInGallery: false,
  },
  {
    id: "playful",
    categoryId: "playful",
    name: "Playful",
    couple: "JORDAN\n+ MAYA",
    date: "06 / 09 / 27",
    place: "The Modern Club · Jakarta",
    vibe: "Warna cerah dan bentuk ceria.",
    featuredOnLanding: true,
    featuredInGallery: false,
  },
  {
    id: "modern",
    categoryId: "modern",
    name: "Modern",
    couple: "REZA\n× MAYA",
    date: "15 · 11 · 2027",
    place: "The Modern Club · Jakarta",
    vibe: "Geometris, kontras tinggi, modern.",
    featuredOnLanding: false,
    featuredInGallery: false,
  },
  {
    id: "traditional",
    categoryId: "traditional",
    name: "Traditional",
    couple: "Deni &\nBella",
    date: "20 Desember 2026",
    place: "Masjid Agung Al-Azhar · Jakarta",
    vibe: "Klasik dan khidmat, cocok untuk acara adat.",
    featuredOnLanding: false,
    featuredInGallery: false,
  },
];

export const landingTemplates = invitationTemplates.filter(
  (template) => template.featuredOnLanding,
);

export function getCategoryById(id: CategoryId | string | undefined): TemplateCategory | undefined {
  if (!id) return undefined;
  return templateCategories.find((category) => category.id === id);
}

export function getTemplateStyleClass(categoryId: CategoryId): string {
  return `template-${categoryId}`;
}

export function getTemplateById(id: string | undefined): InvitationTemplate | undefined {
  if (!id) return undefined;
  return invitationTemplates.find((template) => template.id === id);
}

export function templateExists(id: string): boolean {
  return invitationTemplates.some((template) => template.id === id);
}

export function getTemplatesByCategory(categoryId: CategoryId | "all"): InvitationTemplate[] {
  if (categoryId === "all") return invitationTemplates;
  return invitationTemplates.filter((template) => template.categoryId === categoryId);
}
