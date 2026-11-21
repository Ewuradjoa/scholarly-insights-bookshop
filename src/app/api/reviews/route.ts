import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.json({ reviews: [], average: null, count: 0 });
  const db = createClient(url, key);
  const [{ data, error }, { data: summary, error: summaryError }] = await Promise.all([
    db.from('reviews').select('id,rating,title,body,created_at')
      .eq('book_slug', 'how-to-fall-out-of-love').eq('status', 'approved').order('created_at', { ascending: false }).limit(100),
    db.rpc('approved_review_summary', { p_book_slug: 'how-to-fall-out-of-love' }),
  ]);
  if (error || summaryError) return NextResponse.json({ error: 'Reviews are temporarily unavailable.' }, { status: 503 });
  const rows = data ?? [];
  const stats = summary?.[0];
  return NextResponse.json({ reviews: rows, average: stats?.average_rating == null ? null : Number(stats.average_rating), count: Number(stats?.review_count ?? 0) }, { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } });
}

// Authenticated customer token is passed to Supabase; review eligibility and uniqueness are enforced again by SQL/RLS.
export async function POST(request: Request) {
  const auth = request.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return NextResponse.json({ error: 'Sign in to leave a verified-purchase review.' }, { status: 401 });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return NextResponse.json({ error: 'Reviews are not configured.' }, { status: 503 });
  const db = createClient(url, anon, { global: { headers: { Authorization: auth } } });
  const { data: { user }, error: authError } = await db.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: 'Your sign-in has expired.' }, { status: 401 });
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Review details are required.' }, { status: 400 });
  const { orderId, rating, title, body: reviewBody } = body as Record<string, unknown>;
  if (typeof orderId !== 'string' || !Number.isInteger(rating) || Number(rating) < 1 || Number(rating) > 5 || typeof reviewBody !== 'string' || reviewBody.trim().length < 20 || reviewBody.length > 3000 || (title !== undefined && (typeof title !== 'string' || title.length > 120))) {
    return NextResponse.json({ error: 'Check the rating and review text, then try again.' }, { status: 400 });
  }
  const { data, error } = await db.from('reviews').insert({ order_id: orderId, book_slug: 'how-to-fall-out-of-love', user_id: user.id, rating, title: title || null, body: reviewBody.trim(), status: 'pending' }).select('id').single();
  if (error) return NextResponse.json({ error: 'A review can only be submitted for your completed purchase, once per order.' }, { status: 409 });
  return NextResponse.json({ id: data.id, status: 'pending' }, { status: 201 });
}
