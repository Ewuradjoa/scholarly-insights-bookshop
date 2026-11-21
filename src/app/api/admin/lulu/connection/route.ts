import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-api';
import { verifyLuluConnection } from '@/lib/lulu';

export async function POST(request: Request) {
  const { error } = await requireAdmin(request);
  if (error) return NextResponse.json({ error }, { status: 403 });

  try {
    const environment = await verifyLuluConnection();
    return NextResponse.json({ connected: true, environment });
  } catch {
    return NextResponse.json(
      { error: 'Could not authenticate with the configured Lulu account. Check its credentials and environment settings.' },
      { status: 503 },
    );
  }
}
