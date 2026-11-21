'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AuthForm } from '@/components/AuthForm';
import { supabaseBrowser } from '@/lib/supabase-browser';

type Order = { id: string; edition: string; status: string; created_at: string; fulfilment_status: string; tracking_url: string | null };

async function downloadEbook(format: 'epub' | 'pdf') {
  const session = await supabaseBrowser().auth.getSession();
  const response = await fetch('/api/ebook', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + (session.data.session?.access_token ?? ''), 'Content-Type': 'application/json' },
    body: JSON.stringify({ format }),
  });
  const result = await response.json();
  if (result.url) window.location.assign(result.url);
}

export default function AccountPage() {
  const [email, setEmail] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [next, setNext] = useState('/account');
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams(window.location.search);
    const requestedNext = params.get('next');
    if (requestedNext?.startsWith('/') && !requestedNext.startsWith('//')) setNext(requestedNext);
    setAuthError(params.get('auth') === 'expired');
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

  return <main className="account-page"><Link href="/" className="back-link">← Bookshop</Link><p className="section-kicker">YOUR BOOKSHOP ACCOUNT</p><h1>{email ? 'Your reading shelf' : 'Your bookshop account'}</h1>{authError && <p role="alert">We couldn’t complete the previous sign-in. Request a fresh email code below and enter it on this page.</p>}{loading ? <p>Loading your account…</p> : email ? <><p className="account-intro">Signed in as <b>{email}</b>. Your orders and download access live here.</p><div className="account-top"><h2>Your orders</h2><button onClick={signOut} className="text-button">Sign out</button></div>{orders.length ? <div className="account-orders">{orders.map((order) => <article key={order.id}><div><b>{order.edition === 'ebook' ? 'How to Fall Out of Love · Ebook' : 'How to Fall Out of Love · Paperback'}</b><small>{new Date(order.created_at).toLocaleDateString('en-GB')} · {order.status}</small></div>{order.edition === 'ebook' && order.status === 'paid' ? <div className="ebook-downloads"><button onClick={() => void downloadEbook('epub')} className="button button-dark">Download EPUB</button><button onClick={() => void downloadEbook('pdf')} className="button button-muted">Download website PDF</button></div> : <span>{order.fulfilment_status}{order.tracking_url ? <a href={order.tracking_url}> · Track parcel</a> : null}</span>}</article>)}</div> : <p>Your completed purchases will appear here.</p>}<Link href="/books/how-to-fall-out-of-love#reviews" className="account-review-link">Purchased the book? Leave a verified review →</Link></> : <><p className="account-intro">Use your email to sign in or create an account. We’ll send you a six-digit code to enter here—no password needed.</p><AuthForm next={next}/></>}</main>;
}
