import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-api';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: Request) {
  const { error } = await requireAdmin(request);
  if (error) return NextResponse.json({ error }, { status: 403 });
  const db = supabaseAdmin();
  const [{ data: reviews, error: reviewError }, { data: reports, error: reportError }] = await Promise.all([
    db.from('reviews').select('id,order_id,user_id,rating,title,body,status,created_at,report_count').order('created_at', { ascending: false }).limit(250),
    db.from('review_reports').select('id,review_id,reason,details,status,created_at').eq('status','open').order('created_at',{ascending:false}).limit(250),
  ]);
  if (reviewError || reportError) return NextResponse.json({ error: 'Could not load reader notes.' }, { status: 503 });
  return NextResponse.json({ reviews: reviews ?? [], reports: reports ?? [] }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function PATCH(request: Request) {
  const { user, error } = await requireAdmin(request);
  if (error || !user) return NextResponse.json({ error: error ?? 'Administrator access is required.' }, { status: 403 });
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'A moderation action is required.' }, { status: 400 });
  const { id, status } = body as Record<string, unknown>;
  if (typeof id !== 'string' || !['approved','rejected'].includes(String(status))) return NextResponse.json({ error: 'Choose approve or reject.' }, { status: 400 });
  const { error: dbError } = await supabaseAdmin().from('reviews').update({ status, moderated_at: new Date().toISOString(), moderated_by: user.id }).eq('id', id);
  if (dbError) return NextResponse.json({ error: 'Could not save this moderation decision.' }, { status: 503 });
  return NextResponse.json({ updated: true });
}
