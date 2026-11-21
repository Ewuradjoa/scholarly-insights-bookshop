import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { getAdminRole } from '@/lib/admin-api';
import { AdminDashboardShell } from './AdminDashboardShell';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return <main className="admin"><p>Admin access is not configured.</p></main>;
  const jar = await cookies();
  const supabase = createServerClient(url, anon, { cookies: { getAll: () => jar.getAll(), setAll: () => {} } });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !await getAdminRole(user.email ?? '')) redirect('/admin/sign-in');
  const { data: claimData, error: claimsError } = await supabase.auth.getClaims();
  if (claimsError || claimData?.claims?.aal !== 'aal2') redirect('/admin/mfa');
  return <AdminDashboardShell/>;
}
