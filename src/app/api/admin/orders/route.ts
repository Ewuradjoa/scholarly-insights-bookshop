import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-api';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: Request) {
  const { error } = await requireAdmin(request);
  if (error) return NextResponse.json({ error }, { status: 403 });
  const { data, error: dbError } = await supabaseAdmin().from('orders')
    .select('id,edition,status,amount_total,currency,customer_email,customer_name,shipping_address,created_at,ebook_delivered_at,confirmation_email_status,fulfilment_status,fulfilment_error,lulu_job_id,tracking_url')
    .order('created_at', { ascending: false }).limit(250);
  if (dbError) return NextResponse.json({ error: 'Could not load orders.' }, { status: 503 });
  return NextResponse.json({ orders: data ?? [] }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function PATCH(request: Request) {
  const { error } = await requireAdmin(request);
  if (error) return NextResponse.json({ error }, { status: 403 });
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Order changes are required.' }, { status: 400 });
  const { id, fulfilmentStatus, trackingUrl } = body as Record<string, unknown>;
  const validStatuses = ['not_started','submitting','submission_failed','submitted','printing','shipped','rejected','delivered'];
  if (typeof id !== 'string' || !validStatuses.includes(String(fulfilmentStatus)) || (trackingUrl !== undefined && trackingUrl !== null && (typeof trackingUrl !== 'string' || !/^https:\/\//i.test(trackingUrl)))) return NextResponse.json({ error: 'Check the fulfilment status and tracking link.' }, { status: 400 });
  const { error: dbError } = await supabaseAdmin().from('orders').update({ fulfilment_status: fulfilmentStatus, tracking_url: trackingUrl || null }).eq('id', id);
  if (dbError) return NextResponse.json({ error: 'Could not update this order.' }, { status: 503 });
  return NextResponse.json({ updated: true });
}
