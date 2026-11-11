/** `WUMY` + 8 hex chars of the invitation id + base36 time; uppercase alphanumeric, <= 30 chars. */
export function buildInvoiceNumber(invitationId: string, now: Date): string {
  const idPart = invitationId.replace(/-/g, "").slice(0, 8).toUpperCase();
  const timePart = now.getTime().toString(36).toUpperCase();
  return `WUMY${idPart}${timePart}`.replace(/[^A-Z0-9]/g, "").slice(0, 30);
}
