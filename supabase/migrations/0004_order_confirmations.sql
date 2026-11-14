alter table public.orders add column if not exists confirmation_email_status text not null default 'pending';
alter table public.orders add column if not exists confirmation_email_claimed_at timestamptz;
alter table public.orders add column if not exists confirmation_email_sent_at timestamptz;
alter table public.orders add column if not exists confirmation_email_error text;

alter table public.orders drop constraint if exists orders_confirmation_email_status_check;
alter table public.orders add constraint orders_confirmation_email_status_check
  check (confirmation_email_status in ('pending','sending','failed','sent'));

-- A short lease recovers abandoned sends while provider idempotency prevents duplicate delivery.
create or replace function public.claim_order_confirmation_email(p_order_id uuid)
returns boolean
language sql volatile security definer set search_path = '' as $$
  with claimed as (
    update public.orders
    set confirmation_email_status = 'sending', confirmation_email_claimed_at = now(), confirmation_email_error = null
    where id = p_order_id and status = 'paid'
      and (confirmation_email_status in ('pending','failed')
        or (confirmation_email_status = 'sending' and confirmation_email_claimed_at < now() - interval '10 minutes'))
    returning id
  )
  select exists(select 1 from claimed);
$$;
revoke all on function public.claim_order_confirmation_email(uuid) from public, anon, authenticated;
grant execute on function public.claim_order_confirmation_email(uuid) to service_role;
