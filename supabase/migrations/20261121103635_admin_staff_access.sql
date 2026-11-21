create table if not exists public.admin_staff (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  active boolean not null default true,
  granted_by uuid not null references auth.users(id) on delete restrict,
  granted_at timestamptz not null default now(),
  revoked_by uuid references auth.users(id) on delete set null,
  revoked_at timestamptz,
  constraint admin_staff_email_normalized check (email = lower(btrim(email)) and email <> ''),
  constraint admin_staff_revocation_consistent check (
    (active and revoked_at is null) or (not active and revoked_at is not null)
  )
);

alter table public.admin_staff enable row level security;
revoke all on table public.admin_staff from public, anon, authenticated;
grant select, insert, update on table public.admin_staff to service_role;

-- This event-trigger helper is not part of the public API. Prevent direct RPC execution.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
