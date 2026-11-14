-- Tighten review ownership checks and add authenticated customer reports.
drop policy if exists "customers submit verified review once" on public.reviews;
create policy "customers submit verified review once" on public.reviews for insert to authenticated with check (
  user_id = auth.uid() and status = 'pending' and report_count = 0
  and exists (
    select 1 from public.orders o
    where o.id = order_id and o.user_id = auth.uid()
      and o.book_slug = public.reviews.book_slug and o.status = 'paid'
  )
);

create table if not exists public.review_reports (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.reviews(id) on delete cascade,
  reporter_user_id uuid not null references auth.users(id) on delete restrict,
  reason text not null check (reason in ('spam','abuse','conflict_of_interest','other')),
  details text check (char_length(details) <= 1000),
  status text not null default 'open' check (status in ('open','reviewed','dismissed')),
  created_at timestamptz not null default now(),
  unique(review_id, reporter_user_id)
);
alter table public.review_reports enable row level security;
create policy "customers report reviews once" on public.review_reports for insert to authenticated with check (
  reporter_user_id = auth.uid() and status = 'open'
  and exists (select 1 from public.reviews r where r.id = review_id and r.status = 'approved')
);
create policy "customers read their reports" on public.review_reports for select to authenticated using (reporter_user_id = auth.uid());

create or replace function public.eligible_review_orders()
returns table(order_id uuid, edition text, purchased_at timestamptz)
language sql stable security invoker set search_path = '' as $$
  select o.id, o.edition, o.created_at
  from public.orders o
  where o.user_id = auth.uid() and o.book_slug = 'how-to-fall-out-of-love' and o.status = 'paid'
    and not exists (select 1 from public.reviews r where r.order_id = o.id)
  order by o.created_at desc;
$$;
revoke all on function public.eligible_review_orders() from public, anon;
grant execute on function public.eligible_review_orders() to authenticated;
