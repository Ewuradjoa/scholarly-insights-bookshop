import { createClient, type User } from '@supabase/supabase-js';
import { adminAllowlist } from '@/lib/config';

export async function requireAdmin(request: Request): Promise<{ user: User | null; error: string | null }> {
  const authorization = request.headers.get('authorization');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!authorization?.startsWith('Bearer ') || !url || !key) return { user: null, error: 'Sign in as an administrator.' };
  const db = createClient(url, key, { global: { headers: { Authorization: authorization } } });
  const { data: { user }, error } = await db.auth.getUser();
  if (error || !user || !adminAllowlist().includes((user.email ?? '').toLowerCase())) return { user: null, error: 'Administrator access is required.' };
  const accessToken = authorization.slice('Bearer '.length);
  const { data: claimData, error: claimsError } = await db.auth.getClaims(accessToken);
  if (claimsError || claimData?.claims?.aal !== 'aal2') return { user: null, error: 'Complete the administrator authenticator check.' };
  return { user, error: null };
}
