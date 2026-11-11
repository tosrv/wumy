-- WUMY — complete database schema for a NEW, empty Supabase project.
-- Run once in the Supabase SQL Editor.

-- ===========================================================================
-- Core tables, triggers, RLS, seed (profiles, templates, invitations, photos, guests, RSVPs, payments)
-- ===========================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Template taxonomy (6 fixed categories) + template inventory
-- ---------------------------------------------------------------------------
create table if not exists public.template_categories (
  id text primary key,
  label text not null,
  description text not null default ''
);

create table if not exists public.templates (
  id text primary key,
  category_id text not null references public.template_categories (id),
  name text not null,
  vibe text not null default '',
  preview_couple text not null default '',
  preview_date text not null default '',
  preview_place text not null default '',
  featured_on_landing boolean not null default false,
  featured_in_gallery boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists templates_category_id_idx
  on public.templates (category_id);

-- ---------------------------------------------------------------------------
-- Invitations
-- ---------------------------------------------------------------------------
create type public.invitation_status as enum (
  'draft',
  'pending_payment',
  'published',
  'archived'
);

create type public.payment_status as enum (
  'unpaid',
  'pending',
  'paid',
  'failed',
  'refunded'
);

create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  template_id text not null references public.templates (id),
  slug text not null,
  partner_a_name text not null default '',
  partner_b_name text not null default '',
  wedding_date date,
  venue_name text not null default '',
  venue_address text not null default '',
  story text not null default '',
  status public.invitation_status not null default 'draft',
  payment_status public.payment_status not null default 'unpaid',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint invitations_slug_format check (
    slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    and char_length(slug) between 3 and 64
  )
);

create unique index if not exists invitations_slug_unique
  on public.invitations (slug);

create index if not exists invitations_owner_id_idx
  on public.invitations (owner_id);

drop trigger if exists invitations_set_updated_at on public.invitations;
create trigger invitations_set_updated_at
  before update on public.invitations
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Photos (files live in the invitation-photos storage bucket)
-- ---------------------------------------------------------------------------
create table if not exists public.invitation_photos (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations (id) on delete cascade,
  storage_path text not null,
  caption text not null default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists invitation_photos_invitation_id_idx
  on public.invitation_photos (invitation_id);

-- ---------------------------------------------------------------------------
-- Guests + RSVPs
-- ---------------------------------------------------------------------------
create table if not exists public.guests (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations (id) on delete cascade,
  name text not null,
  email text,
  personalization_key text,
  created_at timestamptz not null default now()
);

create index if not exists guests_invitation_id_idx
  on public.guests (invitation_id);

create type public.rsvp_status as enum ('coming', 'not_coming', 'pending');

create table if not exists public.rsvps (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations (id) on delete cascade,
  guest_id uuid references public.guests (id) on delete set null,
  guest_name text not null,
  status public.rsvp_status not null default 'pending',
  party_size int not null default 1 check (party_size >= 1 and party_size <= 20),
  message text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists rsvps_invitation_id_idx
  on public.rsvps (invitation_id);

-- ---------------------------------------------------------------------------
-- Payments
-- ---------------------------------------------------------------------------
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations (id) on delete cascade,
  amount_cents int not null check (amount_cents >= 0),
  currency text not null default 'IDR',
  provider text not null default 'manual',
  provider_ref text,
  status public.payment_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists payments_invitation_id_idx
  on public.payments (invitation_id);

drop trigger if exists payments_set_updated_at on public.payments;
create trigger payments_set_updated_at
  before update on public.payments
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Seed: 6 categories + current local templates
-- ---------------------------------------------------------------------------
insert into public.template_categories (id, label, description) values
  ('minimal', 'Minimal', 'Clean sans, quiet luxury, zero clutter.'),
  ('editorial', 'Editorial', 'Serif elegance with magazine-page energy.'),
  ('romantic', 'Romantic', 'Soft pastels and tender, intimate type.'),
  ('playful', 'Playful', 'Bold lime, organic shapes — WUMY energy.'),
  ('modern', 'Modern', 'Geometric, high-contrast, city-cool.'),
  ('traditional', 'Traditional', 'Classic formality with warm ceremonial tone.')
on conflict (id) do update set
  label = excluded.label,
  description = excluded.description;

insert into public.templates (
  id, category_id, name, vibe, preview_couple, preview_date, preview_place,
  featured_on_landing, featured_in_gallery, is_active
) values
  ('minimal', 'minimal', 'Minimal', 'Clean sans, quiet luxury, zero clutter.', 'ALEX / JORDAN', '24 AUGUST 2027', 'The Modern Club · Jakarta', true, true, true),
  ('editorial', 'editorial', 'Editorial', 'Serif elegance with magazine-page energy.', 'Olivia & James', '24.08.27', 'The Modern Club · Jakarta', true, false, true),
  ('romantic', 'romantic', 'Romantic', 'Soft pastels and tender, intimate type.', E'Amelia\n& Noah', 'SEPTEMBER 12, 2027', 'The Modern Club · Jakarta', true, false, true),
  ('playful', 'playful', 'Playful', 'Bold lime, organic shapes — WUMY energy.', E'JORDAN\n+ TAYLOR', '06 / 09 / 27', 'The Modern Club · Jakarta', true, false, true),
  ('modern', 'modern', 'Modern', 'Geometric, high-contrast, city-cool.', E'REZA\n× MAYA', '15 · 11 · 2027', 'The Modern Club · Jakarta', false, false, true),
  ('traditional', 'traditional', 'Traditional', 'Classic formality with warm ceremonial tone.', E'Dimas &\nPutri', 'Minggu, 20 Juli 2027', 'The Modern Club · Jakarta', false, false, true)
on conflict (id) do update set
  category_id = excluded.category_id,
  name = excluded.name,
  vibe = excluded.vibe,
  preview_couple = excluded.preview_couple,
  preview_date = excluded.preview_date,
  preview_place = excluded.preview_place,
  featured_on_landing = excluded.featured_on_landing,
  featured_in_gallery = excluded.featured_in_gallery,
  is_active = excluded.is_active;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.template_categories enable row level security;
alter table public.templates enable row level security;
alter table public.invitations enable row level security;
alter table public.invitation_photos enable row level security;
alter table public.guests enable row level security;
alter table public.rsvps enable row level security;
alter table public.payments enable row level security;

-- Profiles
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Templates: public read
drop policy if exists "template_categories_public_read" on public.template_categories;
create policy "template_categories_public_read"
  on public.template_categories for select
  using (true);

drop policy if exists "templates_public_read" on public.templates;
create policy "templates_public_read"
  on public.templates for select
  using (is_active = true);

-- Invitations
drop policy if exists "invitations_owner_all" on public.invitations;
create policy "invitations_owner_all"
  on public.invitations for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

drop policy if exists "invitations_public_read_published" on public.invitations;
create policy "invitations_public_read_published"
  on public.invitations for select
  using (status = 'published' and payment_status = 'paid');

-- Photos
drop policy if exists "photos_owner_all" on public.invitation_photos;
create policy "photos_owner_all"
  on public.invitation_photos for all
  using (
    exists (
      select 1 from public.invitations i
      where i.id = invitation_id and i.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.invitations i
      where i.id = invitation_id and i.owner_id = auth.uid()
    )
  );

drop policy if exists "photos_public_read_published" on public.invitation_photos;
create policy "photos_public_read_published"
  on public.invitation_photos for select
  using (
    exists (
      select 1 from public.invitations i
      where i.id = invitation_id
        and i.status = 'published'
        and i.payment_status = 'paid'
    )
  );

-- Guests (owner only for now)
drop policy if exists "guests_owner_all" on public.guests;
create policy "guests_owner_all"
  on public.guests for all
  using (
    exists (
      select 1 from public.invitations i
      where i.id = invitation_id and i.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.invitations i
      where i.id = invitation_id and i.owner_id = auth.uid()
    )
  );

-- RSVPs: owner read/manage; public insert on published
drop policy if exists "rsvps_owner_all" on public.rsvps;
create policy "rsvps_owner_all"
  on public.rsvps for all
  using (
    exists (
      select 1 from public.invitations i
      where i.id = invitation_id and i.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.invitations i
      where i.id = invitation_id and i.owner_id = auth.uid()
    )
  );

drop policy if exists "rsvps_public_insert_published" on public.rsvps;
create policy "rsvps_public_insert_published"
  on public.rsvps for insert
  with check (
    exists (
      select 1 from public.invitations i
      where i.id = invitation_id
        and i.status = 'published'
        and i.payment_status = 'paid'
    )
  );

-- Payments: owner read only (writes via service role)
drop policy if exists "payments_owner_select" on public.payments;
create policy "payments_owner_select"
  on public.payments for select
  using (
    exists (
      select 1 from public.invitations i
      where i.id = invitation_id and i.owner_id = auth.uid()
    )
  );

-- ===========================================================================
-- Storage: invitation photos bucket (read policy; write policies below)
-- ===========================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'invitation-photos',
  'invitation-photos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Path convention: {user_id}/{invitation_id}/{filename}

drop policy if exists "invitation_photos_storage_select" on storage.objects;
create policy "invitation_photos_storage_select"
  on storage.objects for select
  using (bucket_id = 'invitation-photos');

-- ===========================================================================
-- Guests: personalised links (?to=)
-- ===========================================================================

alter table public.guests
  add column if not exists guest_group text not null default 'General',
  add column if not exists note text not null default '';

-- Narrow public resolve: name + id only (no email/note leak via table SELECT).
create or replace function public.resolve_guest_by_key(
  p_invitation_id uuid,
  p_key text
)
returns table (id uuid, name text)
language sql
stable
security definer
set search_path = public
as $$
  select g.id, g.name
  from public.guests g
  join public.invitations i on i.id = g.invitation_id
  where g.invitation_id = p_invitation_id
    and g.personalization_key = lower(trim(p_key))
    and i.status = 'published'
    and i.payment_status = 'paid'
  limit 1;
$$;

revoke all on function public.resolve_guest_by_key(uuid, text) from public;
grant execute on function public.resolve_guest_by_key(uuid, text) to anon, authenticated;

-- ===========================================================================
-- Invitations: structured content and photo roles
-- ===========================================================================

alter table public.invitations
  add column if not exists content jsonb not null default '{}'::jsonb;

alter table public.invitation_photos
  add column if not exists role text not null default 'gallery'
  check (role in ('gallery', 'partner_a', 'partner_b', 'cover'));

create unique index if not exists invitation_photos_single_role_idx
  on public.invitation_photos (invitation_id, role)
  where role <> 'gallery';

-- ===========================================================================
-- Storage: invitation music bucket and policies
-- ===========================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'invitation-music',
  'invitation-music',
  true,
  10485760,
  array['audio/mpeg']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Path convention: {user_id}/{invitation_id}/{filename}
-- Writes also require the invitation in the second segment to be owned by the user.

drop policy if exists "invitation_music_storage_select" on storage.objects;
create policy "invitation_music_storage_select"
  on storage.objects for select
  using (bucket_id = 'invitation-music');

drop policy if exists "invitation_music_storage_insert" on storage.objects;
create policy "invitation_music_storage_insert"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'invitation-music'
    and (storage.foldername(name))[1] = auth.uid()::text
    and exists (
      select 1 from public.invitations i
      where i.id::text = (storage.foldername(name))[2] and i.owner_id = auth.uid()
    )
  );

drop policy if exists "invitation_music_storage_update" on storage.objects;
create policy "invitation_music_storage_update"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'invitation-music'
    and (storage.foldername(name))[1] = auth.uid()::text
    and exists (
      select 1 from public.invitations i
      where i.id::text = (storage.foldername(name))[2] and i.owner_id = auth.uid()
    )
  )
  with check (
    bucket_id = 'invitation-music'
    and (storage.foldername(name))[1] = auth.uid()::text
    and exists (
      select 1 from public.invitations i
      where i.id::text = (storage.foldername(name))[2] and i.owner_id = auth.uid()
    )
  );

drop policy if exists "invitation_music_storage_delete" on storage.objects;
create policy "invitation_music_storage_delete"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'invitation-music'
    and (storage.foldername(name))[1] = auth.uid()::text
    and exists (
      select 1 from public.invitations i
      where i.id::text = (storage.foldername(name))[2] and i.owner_id = auth.uid()
    )
  );

-- ===========================================================================
-- Storage: photo write policies (owner's invitation folder only)
-- ===========================================================================

drop policy if exists "invitation_photos_storage_insert" on storage.objects;
create policy "invitation_photos_storage_insert"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'invitation-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
    and exists (
      select 1 from public.invitations i
      where i.id::text = (storage.foldername(name))[2] and i.owner_id = auth.uid()
    )
  );

drop policy if exists "invitation_photos_storage_update" on storage.objects;
create policy "invitation_photos_storage_update"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'invitation-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
    and exists (
      select 1 from public.invitations i
      where i.id::text = (storage.foldername(name))[2] and i.owner_id = auth.uid()
    )
  )
  with check (
    bucket_id = 'invitation-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
    and exists (
      select 1 from public.invitations i
      where i.id::text = (storage.foldername(name))[2] and i.owner_id = auth.uid()
    )
  );

drop policy if exists "invitation_photos_storage_delete" on storage.objects;
create policy "invitation_photos_storage_delete"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'invitation-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
    and exists (
      select 1 from public.invitations i
      where i.id::text = (storage.foldername(name))[2] and i.owner_id = auth.uid()
    )
  );

-- ===========================================================================
-- Payment / publish lockdown and gallery photo cap
-- ===========================================================================

create or replace function public.invitations_guard_paid_state()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(auth.role(), '') not in ('authenticated', 'anon') then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.payment_status := 'unpaid';
    new.status := 'draft';
    new.published_at := null;
    return new;
  end if;

  -- UPDATE
  if new.payment_status is distinct from old.payment_status then
    raise exception 'payment_status can only be changed by the payment system'
      using errcode = '42501';
  end if;

  if new.status = 'published' and old.status is distinct from 'published' then
    if new.payment_status <> 'paid' then
      raise exception 'Payment required before publishing'
        using errcode = '42501';
    end if;
    new.published_at := now();
  else
    new.published_at := old.published_at;
  end if;

  return new;
end;
$$;

drop trigger if exists invitations_guard_paid_state on public.invitations;
create trigger invitations_guard_paid_state
  before insert or update on public.invitations
  for each row execute function public.invitations_guard_paid_state();

-- ---------------------------------------------------------------------------
-- Invitation photos: at most 6 gallery photos and 9 photos in total (gallery +
-- partner_a + partner_b + cover) per invitation. Only inserts are checked:
-- changing a photo's role (e.g. swapping the cover with a gallery photo) does
-- not add files, and the total cap bounds storage use.
-- ---------------------------------------------------------------------------
create or replace function public.invitation_photos_cap()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  gallery_count integer;
  total_count integer;
begin
  if coalesce(auth.role(), '') not in ('authenticated', 'anon') then
    return new;
  end if;

  select count(*) filter (where role = 'gallery'), count(*)
    into gallery_count, total_count
  from public.invitation_photos
  where invitation_id = new.invitation_id;

  if new.role = 'gallery' and gallery_count >= 6 then
    raise exception 'An invitation can have at most 6 gallery photos'
      using errcode = '23514';
  end if;
  if total_count >= 9 then
    raise exception 'An invitation can have at most 9 photos'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

drop trigger if exists invitation_photos_cap on public.invitation_photos;
create trigger invitation_photos_cap
  before insert on public.invitation_photos
  for each row execute function public.invitation_photos_cap();

-- ===========================================================================
-- Payments: DOKU checkout columns
-- ===========================================================================

alter table public.payments
  add column if not exists invoice_number text unique,
  add column if not exists checkout_url text,
  add column if not exists expires_at timestamptz,
  add column if not exists paid_at timestamptz;

-- ===========================================================================
-- mark_invitation_paid: server-only, marks paid without publishing
-- ===========================================================================

create or replace function public.mark_invitation_paid(p_payment_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invitation_id uuid;
  v_status public.payment_status;
begin
  select invitation_id, status
    into v_invitation_id, v_status
  from public.payments
  where id = p_payment_id
  for update;

  if not found or v_status = 'paid' then
    return;
  end if;

  update public.payments
     set status = 'paid',
         paid_at = now()
   where id = p_payment_id;

  update public.invitations
     set payment_status = 'paid'
   where id = v_invitation_id;
end;
$$;

revoke all on function public.mark_invitation_paid(uuid)
  from public, anon, authenticated;
grant execute on function public.mark_invitation_paid(uuid) to service_role;

-- ===========================================================================
-- Reserved slugs (keep in sync with RESERVED_SLUGS in src/lib/slug.ts)
-- ===========================================================================

create or replace function public.reserved_slugs()
returns text[]
language sql
immutable
as $$
  select array[
    'about','admin','api','app','billing','contact','create','dashboard','demo',
    'editor','faq','forgot-password','help','i','invite','login','p','payment',
    'privacy','product','refund','reset-password','settings','terms','www'
  ]::text[];
$$;

create or replace function public.invitations_guard_reserved_slug()
returns trigger
language plpgsql
as $$
begin
  if (tg_op = 'INSERT' or new.slug is distinct from old.slug)
     and lower(new.slug) = any (public.reserved_slugs()) then
    raise exception 'Slug "%" is reserved', new.slug
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

drop trigger if exists invitations_guard_reserved_slug on public.invitations;
create trigger invitations_guard_reserved_slug
  before insert or update of slug on public.invitations
  for each row execute function public.invitations_guard_reserved_slug();

-- ===========================================================================
-- Published invitations keep their address
-- ===========================================================================

create or replace function public.invitations_guard_published_slug()
returns trigger
language plpgsql
as $$
begin
  if auth.role() in ('authenticated', 'anon')
     and old.published_at is not null
     and new.slug is distinct from old.slug then
    raise exception 'The address of a published invitation cannot be changed'
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

drop trigger if exists invitations_guard_published_slug on public.invitations;
create trigger invitations_guard_published_slug
  before update of slug on public.invitations
  for each row execute function public.invitations_guard_published_slug();

-- ===========================================================================
-- One invitation per account
-- ===========================================================================

create unique index if not exists invitations_owner_unique
  on public.invitations (owner_id);
