import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { adminAllowlist } from '@/lib/config';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return <main className="admin"><p>Admin access is not configured.</p></main>;
  const jar = await cookies();
  const supabase = createServerClient(url, anon, { cookies: { getAll: () => jar.getAll(), setAll: () => {} } });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !adminAllowlist().includes((user.email ?? '').toLowerCase())) redirect('/admin/sign-in');
  const [{ count: orders }, { count: pendingReviews }] = await Promise.all([
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
  ]);
  return <main className="admin"><div className="admin-top"><a href="/">← Bookshop</a><span>PRIVATE ADMINISTRATION</span></div><p className="section-kicker">SCHOLARLY INSIGHTS · BOOKSHOP</p><h1>Order desk</h1><p className="admin-lede">A clear view of purchases, delivery and reader notes.</p><div className="admin-cards"><article><small>ALL ORDERS</small><b>{orders ?? 0}</b><span>Paid and fulfilment activity</span></article><article><small>REVIEWS TO CHECK</small><b>{pendingReviews ?? 0}</b><span>Waiting for your approval</span></article><article><small>FULFILMENT</small><b>—</b><span>Sandbox connection not configured</span></article></div><section><h2>Next steps</h2><p>Connect the Stripe webhook, Supabase policies and Lulu sandbox credentials to start showing live order details. Orders and reviews remain private to authenticated customers and allowlisted administrators.</p></section></main>;
}
