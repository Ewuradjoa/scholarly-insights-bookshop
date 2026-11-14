export default function AdminSignIn() {
  return <main className="admin"><a href="/">← Bookshop</a><p className="section-kicker">PRIVATE ADMINISTRATION</p><h1>Administrator sign in</h1><p>Use the Supabase Auth account whose email is listed in the private <code>ADMIN_EMAILS</code> setting.</p><p>The project is not connected to an Auth tenant yet. Configure Supabase Auth, enable email verification and set the allowlist before using the order desk.</p></main>;
}
