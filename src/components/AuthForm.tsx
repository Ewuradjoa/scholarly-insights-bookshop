'use client';

import { FormEvent, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';

type AuthView = 'sign-in' | 'sign-up' | 'verify-sign-up' | 'forgot-password' | 'verify-recovery' | 'new-password';

export function AuthForm({ next = '/account', admin = false }: { next?: string; admin?: boolean }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [view, setView] = useState<AuthView>('sign-in');
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/account';

  async function submitSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setBusy(true);
    try {
      const { error } = await supabaseBrowser().auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
      window.location.replace(admin ? '/admin/mfa' : safeNext);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'We could not sign you in. Check your email and password.');
    } finally {
      setBusy(false);
    }
  }

  async function submitSignUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setBusy(true);
    try {
      const { data, error } = await supabaseBrowser().auth.signUp({ email: email.trim(), password });
      if (error) throw error;
      if (data.session) {
        window.location.replace(safeNext);
        return;
      }
      setView('verify-sign-up');
      setMessage('Enter the confirmation code sent to your email to finish creating your account.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'We could not create your account. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function requestPasswordReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setBusy(true);
    try {
      const { error } = await supabaseBrowser().auth.resetPasswordForEmail(email.trim());
      if (error) throw error;
      setView('verify-recovery');
      setMessage('If an account uses this email, a password recovery code has been sent.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'We could not start password recovery. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function verifyEmailCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setBusy(true);
    try {
      const type = view === 'verify-sign-up' ? 'signup' : 'recovery';
      const { error } = await supabaseBrowser().auth.verifyOtp({ email: email.trim(), token: code.trim(), type });
      if (error) throw error;
      setCode('');
      if (type === 'signup') {
        window.location.replace(safeNext);
        return;
      }
      setView('new-password');
      setMessage('Choose a new password for your account.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'That code could not be confirmed. Request a new one and try again.');
    } finally {
      setBusy(false);
    }
  }

  async function updatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setBusy(true);
    try {
      const { error } = await supabaseBrowser().auth.updateUser({ password });
      if (error) throw error;
      window.location.replace(admin ? '/admin/mfa' : safeNext);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'We could not update your password. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  function switchView(nextView: AuthView) {
    setView(nextView);
    setCode('');
    setPassword('');
    setMessage('');
  }

  if (view === 'verify-sign-up' || view === 'verify-recovery') {
    return (
      <form className="auth-form" onSubmit={verifyEmailCode}>
        <p>A confirmation code was sent to <strong>{email}</strong>.</p>
        <label htmlFor="account-code">Email confirmation code</label>
        <input id="account-code" type="text" inputMode="numeric" autoComplete="one-time-code" required value={code} onChange={(event) => setCode(event.target.value)} placeholder="Enter your code" />
        <button className="button button-dark" disabled={busy}>{busy ? 'Confirming…' : 'Confirm code'}</button>
        {message && <p role="status">{message}</p>}
        <button className="text-button" type="button" disabled={busy} onClick={() => switchView('sign-in')}>Back to sign in</button>
      </form>
    );
  }

  if (view === 'new-password') {
    return (
      <form className="auth-form" onSubmit={updatePassword}>
        <label htmlFor="new-password">New password</label>
        <input id="new-password" type="password" autoComplete="new-password" minLength={12} required value={password} onChange={(event) => setPassword(event.target.value)} />
        <button className="button button-dark" disabled={busy}>{busy ? 'Updating…' : 'Save new password'}</button>
        {message && <p role="status">{message}</p>}
      </form>
    );
  }

  if (view === 'forgot-password') {
    return (
      <form className="auth-form" onSubmit={requestPasswordReset}>
        <label htmlFor="account-email">Email address</label>
        <input id="account-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
        <button className="button button-dark" disabled={busy}>{busy ? 'Sending code…' : 'Email me a recovery code'}</button>
        {message && <p role="status">{message}</p>}
        <button className="text-button" type="button" disabled={busy} onClick={() => switchView('sign-in')}>Back to sign in</button>
      </form>
    );
  }

  const isSignUp = view === 'sign-up';
  return (
    <form className="auth-form" onSubmit={isSignUp ? submitSignUp : submitSignIn}>
      <label htmlFor="account-email">Email address</label>
      <input id="account-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
      <label htmlFor="account-password">Password</label>
      <input id="account-password" type="password" autoComplete={isSignUp ? 'new-password' : 'current-password'} minLength={isSignUp ? 12 : undefined} required value={password} onChange={(event) => setPassword(event.target.value)} />
      <button className="button button-dark" disabled={busy}>{busy ? (isSignUp ? 'Creating account…' : 'Signing in…') : (isSignUp ? 'Create account' : 'Sign in')}</button>
      {message && <p role="status">{message}</p>}
      {!isSignUp && <button className="text-button" type="button" disabled={busy} onClick={() => switchView('forgot-password')}>Set or reset password</button>}
      {!admin && <button className="text-button" type="button" disabled={busy} onClick={() => switchView(isSignUp ? 'sign-in' : 'sign-up')}>{isSignUp ? 'Already have an account? Sign in' : 'New to the bookshop? Create an account'}</button>}
    </form>
  );
}
