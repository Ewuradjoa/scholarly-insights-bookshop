'use client';

import { FormEvent, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';

export function AuthForm({ next = '/account' }: { next?: string }) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  async function submitEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setBusy(true);
    try {
      const { error } = await supabaseBrowser().auth.signInWithOtp({
        email: email.trim(),
        options: { shouldCreateUser: true },
      });
      if (error) throw error;
      setCodeSent(true);
      setMessage('A sign-in code has been sent. Enter the code from the email below.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Sign-in is unavailable.');
    } finally {
      setBusy(false);
    }
  }

  async function submitCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setBusy(true);
    try {
      const { error } = await supabaseBrowser().auth.verifyOtp({
        email: email.trim(),
        token: code.trim(),
        type: 'email',
      });
      if (error) throw error;
      const destination = next.startsWith('/') && !next.startsWith('//') ? next : '/account';
      window.location.replace(destination);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'That code could not be confirmed. Request a new one and try again.');
    } finally {
      setBusy(false);
    }
  }

  if (codeSent) {
    return (
      <form className="auth-form" onSubmit={submitCode}>
        <p>A sign-in code was sent to <strong>{email}</strong>.</p>
        <label htmlFor="account-code">Email sign-in code</label>
        <input id="account-code" type="text" inputMode="numeric" autoComplete="one-time-code" required value={code} onChange={(event) => setCode(event.target.value)} placeholder="Enter your code" />
        <button className="button button-dark" disabled={busy}>{busy ? 'Confirming…' : 'Confirm and sign in'}</button>
        <button className="text-button" type="button" disabled={busy} onClick={() => { setCodeSent(false); setCode(''); setMessage(''); }}>Use a different email</button>
        {message && <p role="status">{message}</p>}
      </form>
    );
  }

  return (
    <form className="auth-form" onSubmit={submitEmail}>
      <label htmlFor="account-email">Email address</label>
      <input id="account-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
      <button className="button button-dark" disabled={busy}>{busy ? 'Sending code…' : 'Email me a sign-in code'}</button>
      {message && <p role="status">{message}</p>}
    </form>
  );
}
