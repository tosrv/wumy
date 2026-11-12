import { createFileRoute, notFound } from "@tanstack/react-router";
import { PublicInvitePage } from "@/components/invitations/PublicInvitePage";
import { guestDisplayNameFromToParam, isValidSlug } from "@/lib/invitations";
import { buildShareMeta } from "@/lib/share-meta";
import { getInvitationShareMeta } from "@/server/invitations/share-meta";
import { isReservedSlug } from "@/lib/slug";
import { buildPageHead } from "@/lib/seo";

type InviteSearch = {
  to?: string;
};

export const Route = createFileRoute("/$slug")({
  validateSearch: (search: Record<string, unknown>): InviteSearch => {
    const raw = search["to"];
    if (typeof raw === "string" && raw.trim()) {
      return { to: raw.trim().slice(0, 80) };
    }
    return {};
  },
  beforeLoad: ({ params }) => {
    const slug = params.slug?.toLowerCase() ?? "";
    if (isReservedSlug(slug) || !isValidSlug(slug)) {
      throw notFound();
    }
  },
  component: PublicSlugPage,
  loader: ({ params }) => getInvitationShareMeta({ data: { slug: params.slug } }).catch(() => null),
  head: ({ params, match, loaderData }) => {
    const to = (match.search as InviteSearch).to;
    const path = to ? `/${params.slug}?to=${encodeURIComponent(to)}` : `/${params.slug}`;
    if (!loaderData) {
      return buildPageHead({
        title: "Undangan Pernikahan",
        description: "Anda diundang. Buka undangan pernikahan ini di WUMY.",
        path,
      });
    }
    const meta = buildShareMeta({ ...loaderData, guestName: guestDisplayNameFromToParam(to) });
    return buildPageHead({
      title: meta.title,
      description: meta.description,
      path,
      ...(meta.image ? { image: meta.image } : {}),
    });
  },
});

function PublicSlugPage() {
  const { slug } = Route.useParams();
  const { to } = Route.useSearch();
  return <PublicInvitePage slug={slug} {...(to ? { toParam: to } : {})} />;
}
