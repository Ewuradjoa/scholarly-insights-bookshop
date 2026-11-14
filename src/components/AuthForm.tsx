'use client';

import { FormEvent, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';

export function AuthForm({ next = '/account' }: { next?: string }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setBusy(true);
    try {
      const supabase = supabaseBrowser();
      const callback = new URL('/auth/callback', window.location.origin);
      callback.searchParams.set('next', next);
      const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: callback.toString(), shouldCreateUser: true } });
      setMessage(error ? error.message : 'Check your inbox for a secure sign-in link.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Sign-in is unavailable.');
    } finally {
      setBusy(false);
    }
  }

  return <form className="auth-form" onSubmit={submit}><label htmlFor="account-email">Email address</label><input id="account-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com"/><button className="button button-dark" disabled={busy}>{busy ? 'Sending link…' : 'Email me a sign-in link'}</button>{message && <p role="status">{message}</p>}</form>;
}
