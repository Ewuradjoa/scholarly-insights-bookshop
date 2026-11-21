'use client';

import { FormEvent, useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';

type Mode = 'loading' | 'enroll' | 'challenge';

export function AdminMfaGate() {
  const [mode, setMode] = useState<Mode>('loading');
  const [factorId, setFactorId] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    async function prepare() {
      try {
        const supabase = supabaseBrowser();
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData.user) {
          window.location.replace('/admin/sign-in');
          return;
        }
        const { data: assurance, error: assuranceError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        if (assuranceError) throw assuranceError;
        if (assurance.currentLevel === 'aal2') {
          window.location.replace('/admin');
          return;
        }
        const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
        if (factorsError) throw factorsError;
        const verified = factors.totp.find((factor) => factor.status === 'verified');
        if (verified) {
          if (!active) return;
          setFactorId(verified.id);
          setMode('challenge');
          return;
        }

        // Remove an interrupted, unverified enrollment before creating a fresh
        // setup key. Supabase does not return the old secret from listFactors.
        for (const pending of factors.totp.filter((factor) => factor.status !== 'verified')) {
          const { error } = await supabase.auth.mfa.unenroll({ factorId: pending.id });
          if (error) throw error;
        }

        const { data, error } = await supabase.auth.mfa.enroll({
          factorType: 'totp',
          friendlyName: 'Bookshop administrator',
        });
        if (error) throw error;
        if (!active) return;
        setFactorId(data.id);
        setQrCode(data.totp.qr_code);
        setSecret(data.totp.secret);
        setMode('enroll');
      } catch (error) {
        if (active) setMessage(error instanceof Error ? error.message : 'Authenticator setup is unavailable. Please try again.');
      }
    }
    void prepare();
    return () => { active = false; };
  }, []);

  async function verifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!factorId) return;
    setMessage('');
    setBusy(true);
    try {
      const { error } = await supabaseBrowser().auth.mfa.challengeAndVerify({ factorId, code: code.trim() });
      if (error) throw error;
      window.location.replace('/admin');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'That authenticator code could not be verified. Check the code and try again.');
    } finally {
      setBusy(false);
    }
  }

  return <main className="account-page admin-mfa-page">
    <a href="/">← Bookshop</a>
    <p className="section-kicker">PRIVATE ADMINISTRATION</p>
    <h1>{mode === 'challenge' ? 'Verify your sign in' : 'Secure your administrator account'}</h1>
    {mode === 'loading' && !message && <p className="account-intro">Preparing your authenticator security step…</p>}
    {mode === 'enroll' && <>
      <p className="account-intro">Scan this QR code with an authenticator app, then enter the six-digit code it generates. You’ll do this once when setting up admin access.</p>
      {qrCode && <img className="admin-mfa-qr" src={qrCode} alt="Authenticator setup QR code" />}
      <p className="admin-mfa-secret-label">If you can’t scan the code, enter this setup key in your authenticator app:</p>
      <code className="admin-mfa-secret">{secret}</code>
    </>}
    {mode === 'challenge' && <p className="account-intro">Enter the six-digit code from your authenticator app to open the order desk.</p>}
    {(mode === 'enroll' || mode === 'challenge') && <form className="auth-form" onSubmit={verifyCode}>
      <label htmlFor="admin-totp-code">Authenticator code</label>
      <input id="admin-totp-code" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={code} onChange={(event) => setCode(event.target.value)} placeholder="123456" />
      <button className="button button-dark" disabled={busy || !factorId}>{busy ? 'Verifying…' : mode === 'enroll' ? 'Enable authenticator and continue' : 'Verify and continue'}</button>
    </form>}
    {message && <p className="admin-message" role="alert">{message}</p>}
  </main>;
}
