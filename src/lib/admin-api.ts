import { createClient, type User } from '@supabase/supabase-js';
import { adminAllowlist } from '@/lib/config';
import { supabaseAdmin } from '@/lib/supabase-admin';

export type AdminRole = 'owner' | 'staff';

export function adminOwnerEmail() {
  return (process.env.ADMIN_OWNER_EMAIL ?? adminAllowlist()[0] ?? '').trim().toLowerCase();
}

export async function getAdminRole(email: string): Promise<AdminRole | null> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return null;
  if (normalized === adminOwnerEmail()) return 'owner';
  if (adminAllowlist().includes(normalized)) return 'staff';
  try {
    const { data, error } = await supabaseAdmin().from('admin_staff').select('id').eq('email', normalized).eq('active', true).maybeSingle();
    if (error) return null;
    return data ? 'staff' : null;
  } catch {
    return null;
  }
}

export async function requireAdmin(request: Request): Promise<{ user: User | null; role: AdminRole | null; error: string | null }> {
  const authorization = request.headers.get('authorization');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!authorization?.startsWith('Bearer ') || !url || !key) return { user: null, role: null, error: 'Sign in as an administrator.' };
  const db = createClient(url, key, { global: { headers: { Authorization: authorization } } });
  const { data: { user }, error } = await db.auth.getUser();
  if (error || !user) return { user: null, role: null, error: 'Administrator access is required.' };
  const accessToken = authorization.slice('Bearer '.length);
  const { data: claimData, error: claimsError } = await db.auth.getClaims(accessToken);
  if (claimsError || claimData?.claims?.aal !== 'aal2') return { user: null, role: null, error: 'Complete the administrator authenticator check.' };
  const role = await getAdminRole(user.email ?? '');
  if (!role) return { user: null, role: null, error: 'Administrator access is required.' };
  return { user, role, error: null };
}

export async function requireOwner(request: Request): Promise<{ user: User | null; error: string | null }> {
  const access = await requireAdmin(request);
  if (access.error || !access.user) return { user: null, error: access.error ?? 'Administrator access is required.' };
  if (access.role !== 'owner') return { user: null, error: 'Only the shop owner can manage staff access.' };
  return { user: access.user, error: null };
}
