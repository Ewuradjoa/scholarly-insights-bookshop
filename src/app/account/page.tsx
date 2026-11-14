'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AuthForm } from '@/components/AuthForm';
import { supabaseBrowser } from '@/lib/supabase-browser';

type Order = { id: string; edition: string; status: string; created_at: string; fulfilment_status: string; tracking_url: string | null };

export default function AccountPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [next, setNext] = useState('/account');
  useEffect(() => {
    let active = true;
    const requestedNext = new URLSearchParams(window.location.search).get('next');
    if (requestedNext?.startsWith('/') && !requestedNext.startsWith('//')) setNext(requestedNext);
    try {
      const supabase = supabaseBrowser();
      supabase.auth.getUser().then(async ({ data }) => {
        if (!active) return;
        setEmail(data.user?.email ?? null);
        if (data.user) {
          const { data: rows } = await supabase.from('orders').select('id,edition,status,created_at,fulfilment_status,tracking_url').order('created_at', { ascending: false });
          if (active) setOrders(rows ?? []);
        }
        if (active) setLoading(false);
      }).catch(() => { if (active) setLoading(false); });
    } catch { setLoading(false); }
    return () => { active = false; };
  }, []);

  async function signOut() { await supabaseBrowser().auth.signOut(); setEmail(null); setOrders([]); }

  return <main className="account-page"><Link href="/" className="back-link">← Bookshop</Link><p className="section-kicker">YOUR BOOKSHOP ACCOUNT</p><h1>{email ? 'Your reading shelf' : 'A link to your shelf.'}</h1>{loading ? <p>Loading your account…</p> : email ? <><p className="account-intro">Signed in as <b>{email}</b>. Your orders and download access live here.</p><div className="account-top"><h2>Your orders</h2><button onClick={signOut} className="text-button">Sign out</button></div>{orders.length ? <div className="account-orders">{orders.map((order) => <article key={order.id}><div><b>{order.edition === 'ebook' ? 'How to Fall Out of Love · Ebook' : 'How to Fall Out of Love · Paperback'}</b><small>{new Date(order.created_at).toLocaleDateString('en-GB')} · {order.status}</small></div>{order.edition === 'ebook' && order.status === 'paid' ? <button onClick={async () => { const session = await supabaseBrowser().auth.getSession(); const response = await fetch('/api/ebook', { method: 'POST', headers: { Authorization: `Bearer ${session.data.session?.access_token}` } }); const result = await response.json(); if (result.url) window.location.assign(result.url); }} className="button button-dark">Download ebook</button> : <span>{order.fulfilment_status}{order.tracking_url ? <a href={order.tracking_url}> · Track parcel</a> : null}</span>}</article>)}</div> : <p>Your completed purchases will appear here.</p>}<Link href="/#reviews" className="account-review-link">Purchased the book? Leave a verified review →</Link></> : <><p className="account-intro">Use your email to sign in or create an account. We’ll send you a secure link—no password needed.</p><AuthForm next={next}/></>}</main>;
}
