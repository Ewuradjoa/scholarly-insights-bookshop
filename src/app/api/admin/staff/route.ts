import { NextResponse } from 'next/server';
import { adminAllowlist } from '@/lib/config';
import { adminOwnerEmail, requireOwner } from '@/lib/admin-api';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: Request) {
  const { error } = await requireOwner(request);
  if (error) return NextResponse.json({ error }, { status: 403 });
  const { data, error: dbError } = await supabaseAdmin().from('admin_staff')
    .select('id,email,active,granted_at,revoked_at').order('email', { ascending: true }).limit(250);
  if (dbError) return NextResponse.json({ error: 'Staff access could not be loaded.' }, { status: 503 });
  return NextResponse.json({ staff: data ?? [] }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: Request) {
  const { user, error } = await requireOwner(request);
  if (error || !user) return NextResponse.json({ error: error ?? 'Only the shop owner can manage staff access.' }, { status: 403 });
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Enter the staff member’s confirmed bookshop email.' }, { status: 400 });
  const emailValue = (body as Record<string, unknown>).email;
  if (typeof emailValue !== 'string' || emailValue.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue.trim())) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
  }
  const email = emailValue.trim().toLowerCase();
  if (email === adminOwnerEmail()) return NextResponse.json({ error: 'The owner already has administrator access.' }, { status: 400 });
  if (adminAllowlist().includes(email)) return NextResponse.json({ error: 'This email already has configured administrator access.' }, { status: 409 });

  const { data, error: dbError } = await supabaseAdmin().from('admin_staff').upsert({
    email, active: true, granted_by: user.id, granted_at: new Date().toISOString(), revoked_by: null, revoked_at: null,
  }, { onConflict: 'email' }).select('id,email,active,granted_at,revoked_at').single();
  if (dbError || !data) return NextResponse.json({ error: 'Staff access could not be saved.' }, { status: 503 });
  return NextResponse.json({ staff: data }, { status: 201 });
}

export async function PATCH(request: Request) {
  const { user, error } = await requireOwner(request);
  if (error || !user) return NextResponse.json({ error: error ?? 'Only the shop owner can manage staff access.' }, { status: 403 });
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Choose a staff access entry to revoke.' }, { status: 400 });
  const { id, active } = body as Record<string, unknown>;
  if (typeof id !== 'string' || active !== false) return NextResponse.json({ error: 'Choose a valid revocation action.' }, { status: 400 });
  const { data, error: dbError } = await supabaseAdmin().from('admin_staff').update({
    active: false, revoked_by: user.id, revoked_at: new Date().toISOString(),
  }).eq('id', id).eq('active', true).select('id').maybeSingle();
  if (dbError) return NextResponse.json({ error: 'Staff access could not be revoked.' }, { status: 503 });
  if (!data) return NextResponse.json({ error: 'That active staff entry was not found.' }, { status: 404 });
  return NextResponse.json({ revoked: true });
}
