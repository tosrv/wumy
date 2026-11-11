import type { InvitationRow } from "@/lib/invitations";

export function invitationStatusLabel(
  row: Pick<InvitationRow, "status" | "payment_status">,
): string {
  if (row.status === "archived") return "Diarsipkan";
  if (row.status === "published") return "Tayang";
  if (row.payment_status === "paid") return "Lunas — belum tayang";
  return "Menunggu pembayaran";
}
