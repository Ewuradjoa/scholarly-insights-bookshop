import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  const authorization = request.headers.get('authorization');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!authorization?.startsWith('Bearer ') || !url || !key) return NextResponse.json({ error: 'Sign in to report a review.' }, { status: 401 });
  const db = createClient(url, key, { global: { headers: { Authorization: authorization } } });
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Sign in to report a review.' }, { status: 401 });
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Report details are required.' }, { status: 400 });
  const { reviewId, reason, details } = body as Record<string, unknown>;
  if (typeof reviewId !== 'string' || !['spam','abuse','conflict_of_interest','other'].includes(String(reason)) || (details !== undefined && (typeof details !== 'string' || details.length > 1000))) return NextResponse.json({ error: 'Check your report details.' }, { status: 400 });
  const { error } = await db.from('review_reports').insert({ review_id: reviewId, reporter_user_id: user.id, reason, details: details || null });
  if (error) return NextResponse.json({ error: 'This report was already received, or the review is no longer available.' }, { status: 409 });
  return NextResponse.json({ reported: true }, { status: 201 });
}
