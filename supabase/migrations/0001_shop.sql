create extension if not exists pgcrypto;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  stripe_session_id text not null unique,
  stripe_payment_intent_id text unique,
  book_slug text not null,
  edition text not null check (edition in ('ebook','paperback')),
  status text not null check (status in ('paid','refunded','cancelled')),
  amount_total integer,
  currency text,
  customer_email text,
  customer_name text,
  shipping_address jsonb,
  ebook_delivered_at timestamptz,
  lulu_job_id text,
  fulfilment_status text not null default 'not_started' check (fulfilment_status in ('not_started','submitted','printing','shipped','rejected','delivered')),
  tracking_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete restrict,
  book_slug text not null,
  rating smallint not null check (rating between 1 and 5),
  title text check (char_length(title) <= 120),
  body text not null check (char_length(body) between 20 and 3000),
  status text not null default 'pending' check (status in ('pending','approved','rejected','reported')),
  report_count integer not null default 0 check (report_count >= 0),
  moderated_at timestamptz,
  moderated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  unique(order_id)
);

create index if not exists reviews_public_book_idx on public.reviews(book_slug, created_at desc) where status = 'approved';
alter table public.orders enable row level security;
alter table public.reviews enable row level security;

-- Customers can inspect only their own purchases. Service role is reserved for trusted webhook processing.
create policy "customers read own orders" on public.orders for select to authenticated using (user_id = auth.uid());
create policy "customers read approved reviews" on public.reviews for select to anon, authenticated using (status = 'approved');
create policy "customers read own review status" on public.reviews for select to authenticated using (user_id = auth.uid());
create policy "customers submit verified review once" on public.reviews for insert to authenticated with check (
  user_id = auth.uid() and status = 'pending' and report_count = 0
  and exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid() and o.book_slug = book_slug and o.status = 'paid')
);
-- No client update/delete policies: only a server-side administrator workflow may moderate or handle reports.

create or replace function public.approved_review_summary(p_book_slug text)
returns table(average_rating numeric, review_count bigint)
language sql stable security invoker set search_path = '' as $$
  select round(avg(r.rating)::numeric, 1), count(*)
  from public.reviews r where r.book_slug = p_book_slug and r.status = 'approved';
$$;
