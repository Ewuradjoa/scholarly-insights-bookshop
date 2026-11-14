import { AuthForm } from '@/components/AuthForm';
export default function AdminSignIn() { return <main className="account-page"><a href="/">← Bookshop</a><p className="section-kicker">PRIVATE ADMINISTRATION</p><h1>Administrator sign in</h1><p className="account-intro">Use the verified email address configured in the private administrator allowlist.</p><AuthForm next="/admin"/></main>; }
