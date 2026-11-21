import { NextResponse } from 'next/server';
import { requireOwner } from '@/lib/admin-api';
import { submitLuluPrintJob } from '@/lib/lulu';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  const { error: accessError } = await requireOwner(request);
  if (accessError) return NextResponse.json({ error: accessError }, { status: 403 });

  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== 'object' || typeof (body as Record<string, unknown>).id !== 'string') {
    return NextResponse.json({ error: 'Choose a paid paperback order to approve.' }, { status: 400 });
  }

  const db = supabaseAdmin();
  const { data: order, error: lookupError } = await db.from('orders')
    .select('id,edition,status,shipping_address,shipping_phone,customer_name,customer_email,shipping_method,fulfilment_status,lulu_job_id')
    .eq('id', (body as { id: string }).id).maybeSingle();
  if (lookupError) return NextResponse.json({ error: 'Could not load this order.' }, { status: 503 });
  if (!order || order.edition !== 'paperback' || order.status !== 'paid') {
    return NextResponse.json({ error: 'Only paid paperback orders can be sent to print.' }, { status: 409 });
  }
  if (order.lulu_job_id || order.fulfilment_status !== 'not_started') {
    return NextResponse.json({ error: 'This order is already being processed or has already been submitted.' }, { status: 409 });
  }
  if (!order.shipping_method || !['MAIL', 'PRIORITY_MAIL', 'EXPRESS'].includes(order.shipping_method)) {
    return NextResponse.json({ error: 'The paid order has no valid delivery option for Lulu.' }, { status: 409 });
  }

  const { data: claimed, error: claimError } = await db.rpc('claim_lulu_submission', { p_order_id: order.id });
  if (claimError) return NextResponse.json({ error: 'This order could not be reserved for print.' }, { status: 503 });
  if (!claimed?.length) return NextResponse.json({ error: 'This order was already approved or is no longer eligible.' }, { status: 409 });

  try {
    const job = await submitLuluPrintJob({
      orderId: order.id,
      shippingAddress: order.shipping_address,
      phone: order.shipping_phone,
      customerName: order.customer_name,
      shippingLevel: order.shipping_method as 'MAIL' | 'PRIORITY_MAIL' | 'EXPRESS',
    });
    const { error: saveError } = await db.from('orders').update({
      lulu_job_id: job.id, fulfilment_status: 'submitted', fulfilment_error: null,
    }).eq('id', order.id);
    if (saveError) return NextResponse.json({ error: 'Lulu accepted the print job, but its reference could not be saved. Contact support before retrying.' }, { status: 500 });
    return NextResponse.json({ submitted: true });
  } catch {
    await db.from('orders').update({
      fulfilment_status: 'submission_failed',
      fulfilment_error: 'Owner-approved submission to Lulu failed. Review the order and print settings before taking further action.',
    }).eq('id', order.id);
    return NextResponse.json({ error: 'Lulu did not accept this owner-approved print job. Review the order and print settings.' }, { status: 503 });
  }
}
