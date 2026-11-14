import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-api';
import { sendOrderConfirmation } from '@/lib/order-email';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  const { error } = await requireAdmin(request);
  if (error) return NextResponse.json({ error }, { status: 403 });
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== 'object' || typeof (body as Record<string, unknown>).id !== 'string') return NextResponse.json({ error: 'Choose an order to retry.' }, { status: 400 });

  const db = supabaseAdmin();
  const { data: order, error: lookupError } = await db.from('orders')
    .select('id,stripe_session_id,edition,status,amount_total,currency,customer_email,confirmation_email_status')
    .eq('id', (body as { id: string }).id).single();
  if (lookupError || !order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
  if (order.status !== 'paid') return NextResponse.json({ error: 'Only paid orders can receive a confirmation email.' }, { status: 409 });
  if (order.confirmation_email_status === 'sent') return NextResponse.json({ sent: true, alreadySent: true });

  const { data: claimed, error: claimError } = await db.rpc('claim_order_confirmation_email', { p_order_id: order.id });
  if (claimError) return NextResponse.json({ error: 'Could not queue the confirmation email.' }, { status: 503 });
  if (!claimed) return NextResponse.json({ error: 'A confirmation email is already being sent. Refresh the order in a few minutes.' }, { status: 409 });

  try {
    await sendOrderConfirmation({
      orderId: order.id,
      sessionId: order.stripe_session_id,
      email: order.customer_email,
      edition: order.edition,
      amountTotal: order.amount_total,
      currency: order.currency,
    });
    const { error: updateError } = await db.from('orders').update({ confirmation_email_status: 'sent', confirmation_email_sent_at: new Date().toISOString(), confirmation_email_error: null }).eq('id', order.id);
    if (updateError) return NextResponse.json({ error: 'Email was sent, but the order record could not be updated.' }, { status: 503 });
    return NextResponse.json({ sent: true });
  } catch {
    await db.from('orders').update({ confirmation_email_status: 'failed', confirmation_email_error: 'The order confirmation could not be delivered. Retry it from the order desk.' }).eq('id', order.id);
    return NextResponse.json({ error: 'The email provider could not send this order confirmation.' }, { status: 503 });
  }
}
