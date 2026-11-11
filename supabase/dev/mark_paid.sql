-- DEVELOPMENT ONLY — record a fake paid payment for an invitation and publish it directly, skipping the normal flow (pay on /order, then press Terbitkan in the editor).
-- Development-only shortcut; production uses the DOKU flow; the app can no longer do this from the browser
-- (see the payment / publish lockdown section of supabase/schema.sql).
--
-- Run in the Supabase SQL Editor of your *development* project. Replace the slug.

with target as (
  select id from public.invitations where slug = 'ganti-dengan-slug'
)
, paid as (
  insert into public.payments (invitation_id, amount_cents, currency, provider, provider_ref, status)
  select id, 19900000, 'IDR', 'manual-dev', 'dev-' || extract(epoch from now())::bigint, 'paid'
  from target
  returning invitation_id
)
update public.invitations i
set payment_status = 'paid',
    status = 'published',
    published_at = coalesce(i.published_at, now())
from paid
where i.id = paid.invitation_id
returning i.slug, i.status, i.payment_status, i.published_at;
