import { NextResponse } from 'next/server';
export async function POST() {
  // Reports are intentionally not accepted anonymously until authenticated customer identity and abuse controls are configured.
  return NextResponse.json({ error: 'Please contact the shop administrator to report a review.' }, { status: 501 });
}
