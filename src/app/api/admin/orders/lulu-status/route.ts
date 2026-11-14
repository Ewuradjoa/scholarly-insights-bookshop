import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-api';
import { getSandboxPrintJobStatus, normalizeLuluStatus } from '@/lib/lulu';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  const { error } = await requireAdmin(request);
  if (error) return NextResponse.json({ error }, { status: 403 });
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== 'object' || typeof (body as Record<string, unknown>).id !== 'string') return NextResponse.json({ error: 'Choose an order to refresh.' }, { status: 400 });
  const id = (body as { id: string }).id;
  const db = supabaseAdmin();
  const { data: order, error: lookupError } = await db.from('orders').select('id,lulu_job_id').eq('id', id).single();
  if (lookupError || !order?.lulu_job_id) return NextResponse.json({ error: 'This order has no Lulu print job yet.' }, { status: 404 });
  try {
    const luluStatus = await getSandboxPrintJobStatus(order.lulu_job_id);
    const fulfilmentStatus = normalizeLuluStatus(luluStatus);
    if (fulfilmentStatus) {
      const { error: saveError } = await db.from('orders').update({ fulfilment_status: fulfilmentStatus }).eq('id', id);
      if (saveError) return NextResponse.json({ error: 'Status was received but could not be saved.' }, { status: 503 });
    }
    return NextResponse.json({ luluStatus, fulfilmentStatus });
  } catch {
    return NextResponse.json({ error: 'Could not read the Lulu sandbox status. Check its sandbox credentials.' }, { status: 503 });
  }
}
