/** Public support contact for WUMY. */
export const WHATSAPP_NUMBER = "6285138592489";
export const CONTACT_EMAIL = "me@rahmattomy.com";

const DEFAULT_WA_TEXT = "Halo WUMY, saya mau tanya soal undangan digital.";

/** wa.me link with a prefilled message. */
export function whatsappUrl(text: string = DEFAULT_WA_TEXT): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

/** Number formatted for display, e.g. "+62 851-3859-2489". */
export const WHATSAPP_DISPLAY = "+62 851-3859-2489";
