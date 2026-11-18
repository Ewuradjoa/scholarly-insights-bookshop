import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-api';
import { verifySandboxConnection } from '@/lib/lulu';

export async function POST(request: Request) {
  const { error } = await requireAdmin(request);
  if (error) return NextResponse.json({ error }, { status: 403 });

  try {
    await verifySandboxConnection();
    return NextResponse.json({ connected: true, environment: 'sandbox' });
  } catch {
    return NextResponse.json(
      { error: 'Could not authenticate with Lulu sandbox. Check the sandbox credentials and API settings.' },
      { status: 503 },
    );
  }
}
