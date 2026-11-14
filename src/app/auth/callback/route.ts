import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const destination = searchParams.get('next');
  const next = destination?.startsWith('/') && !destination.startsWith('//') ? destination : '/account';
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || (!code && (!tokenHash || type !== 'email'))) return NextResponse.redirect(`${origin}/account?auth=invalid`);
  const jar = await cookies();
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (items) => items.forEach(({ name, value, options }) => jar.set(name, value, options)),
    },
  });
  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : await supabase.auth.verifyOtp({ token_hash: tokenHash!, type: 'email' });
  if (error) return NextResponse.redirect(`${origin}/account?auth=expired`);
  return NextResponse.redirect(`${origin}${next}`);
}
