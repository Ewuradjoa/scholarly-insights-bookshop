'use client';

import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';

export default function AuthCompletePage() {
  const [message, setMessage] = useState('Confirming your secure sign-in link…');

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const requestedNext = params.get('next');
    const next = requestedNext?.startsWith('/') && !requestedNext.startsWith('//') ? requestedNext : '/account';

    async function completeSignIn() {
      try {
        if (!code) throw new Error('Missing sign-in code');
        const { error } = await supabaseBrowser().auth.exchangeCodeForSession(code);
        if (error) throw error;
        window.location.replace(next);
      } catch {
        if (active) setMessage('This link could not be confirmed. Returning you to request a fresh one…');
        const retry = new URL('/account', window.location.origin);
        retry.searchParams.set('auth', 'expired');
        retry.searchParams.set('next', next);
        window.setTimeout(() => window.location.replace(retry), 1200);
      }
    }

    void completeSignIn();
    return () => { active = false; };
  }, []);

  return <main className="account-page"><p className="section-kicker">SECURE SIGN IN</p><h1>One moment</h1><p className="account-intro" role="status">{message}</p></main>;
}
