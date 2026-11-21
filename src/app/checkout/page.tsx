'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';

type Edition = 'ebook' | 'paperback';

export default function CheckoutPage() {
  const [edition, setEdition] = useState<Edition | null>(null);
  const [consent, setConsent] = useState(false);
  const [message, setMessage] = useState('Checking your account…');
  const [ready, setReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get('edition');
    if (requested !== 'ebook' && requested !== 'paperback') {
      setMessage('Choose an edition from the bookshop.');
      return;
    }
    setEdition(requested);
    async function checkAccount() {
      try {
        const { data: { session } } = await supabaseBrowser().auth.getSession();
        if (!session) {
          const next = `/checkout?edition=${requested}`;
          window.location.replace(`/account?next=${encodeURIComponent(next)}`);
          return;
        }
        setReady(true);
        setMessage('');
      } catch {
        setMessage('Sign in to continue to checkout.');
      }
    }
    void checkAccount();
  }, []);

  async function beginCheckout() {
    if (!edition || (edition === 'ebook' && !consent) || submitting) return;
    setSubmitting(true);
    setMessage('Connecting you to secure checkout…');
    try {
      const { data: { session } } = await supabaseBrowser().auth.getSession();
      if (!session) {
        const next = `/checkout?edition=${edition}`;
        window.location.replace(`/account?next=${encodeURIComponent(next)}`);
        return;
      }
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ edition, digitalContentConsent: edition === 'ebook' && consent }),
      });
      const result = await response.json() as { url?: string; error?: string };
      if (!response.ok || !result.url) {
        setMessage(result.error ?? 'Checkout is not available yet.');
        setSubmitting(false);
        return;
      }
      window.location.assign(result.url);
    } catch {
      setMessage('Checkout is not available yet.');
      setSubmitting(false);
    }
  }

  return <main className="account-page">
    <Link href="/books/how-to-fall-out-of-love#editions" className="back-link">← Bookshop</Link>
    <p className="section-kicker">SECURE CHECKOUT</p>
    <h1>{edition === 'ebook' ? 'Your ebook.' : edition === 'paperback' ? 'Your paperback.' : 'One moment.'}</h1>
    {message && <p className="account-intro" role="status">{message}</p>}
    {edition && <section className="checkout-order-details" aria-label="Order and seller information">
      <h2>Before you pay</h2>
      {edition === 'ebook' ? <>
        <p><strong>How to Fall Out of Love — ebook: £9.99</strong> (one-time payment). EPUB and PDF access is provided in your account after payment.</p>
        <p>After you consent to immediate supply and acknowledge the cancellation-right change below, digital supply begins after payment.</p>
      </> : <>
        <p><strong>How to Fall Out of Love — paperback: £19.99</strong>, including basic tracked UK delivery. Priority adds £1; express adds £5. Choose your delivery option in Stripe Checkout; it will show the final total before you pay.</p>
        <p>Paperback orders are manually reviewed before being sent to print. Printing normally takes 3–5 working days after approval and submission; carrier transit time varies and is not guaranteed. UK addresses only.</p>
      </>}
      <p>Seller: Scholarly Insights Academia, 188 Carlton Road, Nottingham, NG3 2BB, United Kingdom. Not VAT registered; no VAT is charged.</p>
      <p className="checkout-policy-links"><Link href="/terms">Terms of sale</Link> · <Link href="/delivery-returns">Delivery, cancellation &amp; returns</Link> · <Link href="/privacy">Privacy</Link> · <Link href="/contact">Contact</Link></p>
    </section>}
    {ready && edition === 'ebook' && <div className="checkout-consent">
      <label>
        <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
        <span>I expressly consent to immediate supply of the ebook and acknowledge that I will lose my 14-day right to cancel once digital supply begins.</span>
      </label>
      <p>Your ebook will be available in your account after payment.</p>
    </div>}
    {ready && <button className="button button-dark checkout-continue" onClick={() => void beginCheckout()} disabled={submitting || (edition === 'ebook' && !consent)}>
      {submitting ? 'Opening secure checkout…' : 'Continue to secure checkout'}
    </button>}
  </main>;
}

