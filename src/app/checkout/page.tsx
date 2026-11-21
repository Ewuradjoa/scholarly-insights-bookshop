'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabaseBrowser } from '@/lib/supabase-browser';

export default function CheckoutPage() {
  const [message, setMessage] = useState('Connecting you to secure checkout…');
  useEffect(() => {
    let active = true;
    const params = new URLSearchParams(window.location.search);
    const edition = params.get('edition');
    if (edition !== 'ebook' && edition !== 'paperback') { setMessage('Choose an edition from the bookshop.'); return; }
    async function begin() {
      try {
        const supabase = supabaseBrowser();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { const next = `/checkout?edition=${edition}`; window.location.replace(`/account?next=${encodeURIComponent(next)}`); return; }
        const response = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` }, body: JSON.stringify({ edition }) });
        const result = await response.json() as { url?: string; error?: string };
        if (!response.ok || !result.url) { if (active) setMessage(result.error ?? 'Checkout is not available yet.'); return; }
        window.location.assign(result.url);
      } catch { if (active) setMessage('Checkout is not available yet.'); }
    }
    void begin();
    return () => { active = false; };
  }, []);
  return <main className="account-page"><p className="section-kicker">SECURE CHECKOUT</p><h1>One moment.</h1><p className="account-intro" role="status">{message}</p><Link href="/books/how-to-fall-out-of-love#editions">Return to the book</Link></main>;
}
