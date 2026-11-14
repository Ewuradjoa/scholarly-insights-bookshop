alter table public.orders add column if not exists shipping_phone text;
alter table public.orders add column if not exists fulfilment_error text;

alter table public.orders drop constraint if exists orders_fulfilment_status_check;
alter table public.orders add constraint orders_fulfilment_status_check
  check (fulfilment_status in ('not_started','submitting','submission_failed','submitted','printing','shipped','rejected','delivered'));

-- A transactional claim prevents duplicate Stripe webhook deliveries from placing duplicate sandbox print jobs.
create or replace function public.claim_lulu_submission(p_order_id uuid)
returns setof uuid
language sql volatile security definer set search_path = '' as $$
  update public.orders
  set fulfilment_status = 'submitting', fulfilment_error = null
  where id = p_order_id and edition = 'paperback' and status = 'paid' and fulfilment_status = 'not_started'
  returning id;
$$;
revoke all on function public.claim_lulu_submission(uuid) from public, anon, authenticated;
grant execute on function public.claim_lulu_submission(uuid) to service_role;
