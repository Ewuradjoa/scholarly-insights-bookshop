import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  const authorization = request.headers.get('authorization');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const bucket = process.env.EBOOK_PRIVATE_BUCKET;
  const objectPath = process.env.EBOOK_OBJECT_PATH;
  if (!authorization?.startsWith('Bearer ') || !url || !anon || !bucket || !objectPath) return NextResponse.json({ error: 'Download is not configured.' }, { status: 503 });
  const authClient = createClient(url, anon, { global: { headers: { Authorization: authorization } } });
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Sign in to access your purchase.' }, { status: 401 });
  const { data: order, error } = await supabaseAdmin().from('orders').select('id').eq('user_id', user.id).eq('edition', 'ebook').eq('status', 'paid').eq('book_slug', 'how-to-fall-out-of-love').limit(1).maybeSingle();
  if (error || !order) return NextResponse.json({ error: 'No completed ebook purchase was found.' }, { status: 403 });
  const { data, error: storageError } = await supabaseAdmin().storage.from(bucket).createSignedUrl(objectPath, 60);
  if (storageError || !data?.signedUrl) return NextResponse.json({ error: 'Download is temporarily unavailable.' }, { status: 503 });
  await supabaseAdmin().from('orders').update({ ebook_delivered_at: new Date().toISOString() }).eq('id', order.id);
  return NextResponse.json({ url: data.signedUrl, expiresIn: 60 });
}
