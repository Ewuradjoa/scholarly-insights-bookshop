import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const incoming = new URL(request.url);
  const code = incoming.searchParams.get('code');
  const destination = incoming.searchParams.get('next');
  const next = destination?.startsWith('/') && !destination.startsWith('//') ? destination : '/account';

  // Complete PKCE sign-in in the browser, where Supabase's verifier cookie is available.
  if (!code) {
    const retry = new URL('/account', incoming.origin);
    retry.searchParams.set('auth', 'expired');
    retry.searchParams.set('next', next);
    return NextResponse.redirect(retry);
  }

  const complete = new URL('/auth/complete', incoming.origin);
  complete.searchParams.set('code', code);
  complete.searchParams.set('next', next);
  return NextResponse.redirect(complete);
}
