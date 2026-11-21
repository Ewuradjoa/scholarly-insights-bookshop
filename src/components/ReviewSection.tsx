'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase-browser';

type Review = { id: string; rating: number; title: string | null; body: string; created_at: string };
type EligibleOrder = { order_id: string; edition: string; purchased_at: string };
type Summary = { reviews: Review[]; average: number | null; count: number };

export function ReviewSection() {
  const [summary, setSummary] = useState<Summary>({ reviews: [], average: null, count: 0 });
  const [orders, setOrders] = useState<EligibleOrder[]>([]);
  const [signedIn, setSignedIn] = useState(false);
  const [formMessage, setFormMessage] = useState('');
  const [rating, setRating] = useState('5');
  const [busy, setBusy] = useState(false);

  async function load() {
    const response = await fetch('/api/reviews', { cache: 'no-store' });
    if (response.ok) setSummary(await response.json() as Summary);
    try {
      const supabase = supabaseBrowser();
      const { data: { session } } = await supabase.auth.getSession();
      setSignedIn(Boolean(session));
      if (session) {
        const eligible = await fetch('/api/reviews/eligible', { headers: { Authorization: `Bearer ${session.access_token}` } });
        if (eligible.ok) {
          const data = await eligible.json() as { orders?: EligibleOrder[] };
          setOrders(Array.isArray(data.orders) ? data.orders : []);
        }
      }
    } catch { setSignedIn(false); }
  }

  useEffect(() => { void load(); }, []);

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setFormMessage('');
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const session = await supabaseBrowser().auth.getSession();
    const response = await fetch('/api/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.data.session?.access_token}` }, body: JSON.stringify({ orderId: form.get('orderId'), rating: Number(rating), title: form.get('title'), body: form.get('body') }) });
    const result = await response.json() as { error?: string };
    setFormMessage(response.ok ? 'Thank you. Your review is waiting for approval.' : result.error ?? 'Your review could not be submitted.');
    if (response.ok) { setOrders((current) => current.filter((order) => order.order_id !== form.get('orderId'))); formElement.reset(); setRating('5'); }
    setBusy(false);
  }

  async function reportReview(reviewId: string, reason: string) {
    const session = await supabaseBrowser().auth.getSession();
    const response = await fetch('/api/reviews/report', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.data.session?.access_token}` }, body: JSON.stringify({ reviewId, reason }) });
    const result = response.ok ? null : await response.json() as { error?: string };
    setFormMessage(response.ok ? 'Thank you. We’ve received your report.' : result?.error ?? 'We could not submit the report.');
  }

  return <section className="reviews wrap" id="reviews"><div className="review-icon"><Star size={21}/></div><div><div className="section-kicker">READER NOTES</div><h2>Make space for <em>real stories.</em></h2><p>Every public note comes from a completed purchase and is reviewed before it appears.</p>
    {summary.count > 0 && <div className="rating-summary"><b>{summary.average?.toFixed(1)}</b><span className="stars" aria-label={`${summary.average} out of 5 stars`}>{'★'.repeat(Math.round(summary.average ?? 0))}{'☆'.repeat(5 - Math.round(summary.average ?? 0))}</span><small>{summary.count} verified {summary.count === 1 ? 'review' : 'reviews'}</small></div>}
    {summary.reviews.length ? <div className="review-list">{summary.reviews.map((review) => <article key={review.id} className="review-item"><div className="review-stars" aria-label={`${review.rating} out of 5 stars`}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div>{review.title && <h3>{review.title}</h3>}<p>{review.body}</p><div className="review-meta"><span>Verified purchase</span><time>{new Date(review.created_at).toLocaleDateString('en-GB')}</time>{signedIn && <details><summary>Report</summary><div className="report-options">{[['spam','Spam'],['abuse','Abusive content'],['conflict_of_interest','Conflict of interest'],['other','Other']].map(([key,label])=><button key={key} onClick={()=>void reportReview(review.id,key)}>{label}</button>)}</div></details>}</div></article>)}</div> : <div className="review-empty"><span>✳</span><b>The first reader notes will appear here.</b><small>Verified reviews are welcome after purchase.</small></div>}
    <div className="review-action">{!signedIn ? <p><Link href="/account">Sign in to leave a verified review →</Link></p> : orders.length > 0 ? <details className="review-compose"><summary>Write a verified-purchase review</summary><form onSubmit={submitReview}><label htmlFor="review-order">Your purchase</label><select name="orderId" id="review-order" required>{orders.map((order)=><option key={order.order_id} value={order.order_id}>{order.edition === 'ebook' ? 'Ebook' : 'Paperback'} · {new Date(order.purchased_at).toLocaleDateString('en-GB')}</option>)}</select><label htmlFor="review-rating">Rating</label><select id="review-rating" value={rating} onChange={(e)=>setRating(e.target.value)}>{[5,4,3,2,1].map((value)=><option key={value} value={value}>{value} {value === 1 ? 'star' : 'stars'}</option>)}</select><label htmlFor="review-title">Title <span>(optional)</span></label><input id="review-title" name="title" maxLength={120}/><label htmlFor="review-body">Your review</label><textarea id="review-body" name="body" minLength={20} maxLength={3000} required/><button className="button button-dark" disabled={busy}>{busy ? 'Sending…' : 'Submit for review'}</button>{formMessage && <p role="status">{formMessage}</p>}</form></details> : <p>You don’t have a purchase available to review yet.</p>}{formMessage && <p role="status">{formMessage}</p>}</div>
  </div></section>;
}
