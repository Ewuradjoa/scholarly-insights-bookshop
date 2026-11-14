import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-api';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function PATCH(request: Request) {
  const { error } = await requireAdmin(request);
  if (error) return NextResponse.json({ error }, { status: 403 });
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'A report action is required.' }, { status: 400 });
  const { id, status } = body as Record<string, unknown>;
  if (typeof id !== 'string' || !['reviewed','dismissed'].includes(String(status))) return NextResponse.json({ error: 'Choose reviewed or dismissed.' }, { status: 400 });
  const { error: dbError } = await supabaseAdmin().from('review_reports').update({ status }).eq('id', id);
  if (dbError) return NextResponse.json({ error: 'Could not update this report.' }, { status: 503 });
  return NextResponse.json({ updated: true });
}
