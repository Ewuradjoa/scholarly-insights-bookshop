import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const authorization = request.headers.get('authorization');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!authorization?.startsWith('Bearer ') || !url || !key) return NextResponse.json({ orders: [] }, { status: 401 });
  const db = createClient(url, key, { global: { headers: { Authorization: authorization } } });
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ orders: [] }, { status: 401 });
  const { data, error } = await db.rpc('eligible_review_orders');
  if (error) return NextResponse.json({ error: 'Could not load review eligibility.' }, { status: 503 });
  return NextResponse.json({ orders: data ?? [] });
}
