import { supabaseAdmin } from '@/lib/supabase-admin';

type LuluAddress = { line1?: string | null; line2?: string | null; city?: string | null; state?: string | null; postal_code?: string | null; country?: string | null };
type LuluOrder = { orderId: string; shippingAddress: LuluAddress | null; phone: string | null; customerName: string | null; shippingLevel: 'MAIL' | 'PRIORITY_MAIL' | 'EXPRESS' };
type TokenPayload = { access_token?: string; expires_in?: number };
type PrintJobPayload = { id?: string | number; status?: string };

const API_BASES = {
  sandbox: 'https://api.sandbox.lulu.com',
  production: 'https://api.lulu.com',
} as const;

type LuluMode = keyof typeof API_BASES;

let cachedToken: string | undefined;
let cachedTokenExpiresAt = 0;
let cachedTokenMode: LuluMode | undefined;

function configuredLulu() {
  const mode = process.env.LULU_MODE as LuluMode | undefined;
  if (mode !== 'sandbox' && mode !== 'production') throw new Error('Lulu environment is not configured.');
  const expectedBase = API_BASES[mode];
  const base = process.env.LULU_PRINT_API_BASE;
  const sandboxFlag = process.env.LULU_SANDBOX;
  const key = mode === 'production' ? process.env.LULU_PRODUCTION_CLIENT_KEY : process.env.LULU_CLIENT_KEY;
  const secret = mode === 'production' ? process.env.LULU_PRODUCTION_CLIENT_SECRET : process.env.LULU_CLIENT_SECRET;
  if (base !== expectedBase || sandboxFlag !== String(mode === 'sandbox') || !key || !secret) {
    throw new Error(`Lulu ${mode} settings are incomplete or inconsistent.`);
  }
  return { base, key, secret, mode };
}

async function accessToken() {
  const { base, key, secret, mode } = configuredLulu();
  if (cachedToken && cachedTokenMode === mode && cachedTokenExpiresAt > Date.now() + 60_000) return cachedToken;
  const authorization = btoa(key + ':' + secret);
  const response = await fetch(base + '/auth/realms/glasstree/protocol/openid-connect/token', {
    method: 'POST', headers: { Authorization: 'Basic ' + authorization, 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'grant_type=client_credentials',
  });
  if (!response.ok) throw new Error('Lulu authentication failed.');
  const result = await response.json() as TokenPayload;
  if (!result.access_token) throw new Error('Lulu returned no access token.');
  cachedToken = result.access_token;
  cachedTokenExpiresAt = Date.now() + (result.expires_in ?? 300) * 1000;
  cachedTokenMode = mode;
  return cachedToken;
}

export async function verifyLuluConnection(): Promise<'sandbox' | 'production'> {
  // Authentication only: this does not create a print job or submit any book.
  await accessToken();
  return configuredLulu().mode;
}

function md5(value: string | undefined, name: string) {
  if (!value || !new RegExp('^[a-fA-F0-9]{32}$').test(value)) throw new Error(name + ' must be a 32-character MD5 checksum.');
  return value.toUpperCase();
}

async function printFileUrl(pathValue: string | undefined, name: string) {
  if (!pathValue || pathValue.startsWith('/') || pathValue.includes('..')) throw new Error(`${name} is not configured.`);
  const bucket = process.env.LULU_FILES_BUCKET;
  if (!bucket) throw new Error('Lulu private file storage is not configured.');
  const { data, error } = await supabaseAdmin().storage.from(bucket).createSignedUrl(pathValue, 3600, { download: true });
  if (error || !data?.signedUrl) throw new Error(`Could not create a temporary private download link for ${name}.`);
  return data.signedUrl;
}

export async function submitLuluPrintJob(order: LuluOrder): Promise<{ id: string; status?: string }> {
  const { base, mode } = configuredLulu();
  const address = order.shippingAddress;
  if (!address?.line1 || !address.city || !address.country || !address.postal_code || !order.phone) {
    throw new Error('The paperback order needs a complete delivery address and phone number.');
  }
  const contactEmail = process.env.LULU_CONTACT_EMAIL;
  const podPackageId = process.env.LULU_POD_PACKAGE_ID;
  if (!contactEmail || !podPackageId) throw new Error('Lulu product or contact settings are incomplete.');

  const payload = {
    external_id: order.orderId,
    contact_email: contactEmail,
    shipping_level: order.shippingLevel,
    line_items: [{
      external_id: order.orderId + '-paperback',
      pod_package_id: podPackageId,
      quantity: 1,
      interior: { source_url: await printFileUrl(process.env.LULU_INTERIOR_OBJECT_PATH, 'LULU_INTERIOR_OBJECT_PATH'), source_md5sum: md5(process.env.LULU_INTERIOR_MD5, 'LULU_INTERIOR_MD5') },
      cover: { source_url: await printFileUrl(process.env.LULU_COVER_OBJECT_PATH, 'LULU_COVER_OBJECT_PATH'), source_md5sum: md5(process.env.LULU_COVER_MD5, 'LULU_COVER_MD5') },
    }],
    shipping_address: {
      name: order.customerName || 'Bookshop customer',
      street1: address.line1,
      street2: address.line2 || undefined,
      city: address.city,
      state_code: address.state || '',
      country_code: address.country,
      postcode: address.postal_code,
      phone_number: order.phone,
    },
  };

  const response = await fetch(base + '/print-jobs/', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + await accessToken(), 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`Lulu ${mode} rejected the print job (${response.status}).`);
  const result = await response.json() as PrintJobPayload;
  if (result.id === undefined || result.id === null) throw new Error('Lulu returned no print job reference.');
  return { id: String(result.id), status: result.status };
}

export async function getLuluPrintJobStatus(jobId: string): Promise<string> {
  const { base, mode } = configuredLulu();
  if (!new RegExp('^[A-Za-z0-9_-]+$').test(jobId)) throw new Error('Invalid Lulu print job reference.');
  const response = await fetch(base + '/print-jobs/' + encodeURIComponent(jobId) + '/status/', {
    headers: { Authorization: 'Bearer ' + await accessToken(), Accept: 'application/json' },
  });
  if (!response.ok) throw new Error(`Could not refresh the Lulu ${mode} job status.`);
  const result = await response.json() as { status?: string };
  if (!result.status) throw new Error('Lulu returned no job status.');
  return result.status;
}

export function normalizeLuluStatus(status: string): 'submitted' | 'printing' | 'shipped' | 'rejected' | null {
  switch (status.toUpperCase()) {
    case 'CREATED': case 'UNPAID': case 'PAYMENT_IN_PROGRESS': case 'PRODUCTION_DELAYED': case 'PRODUCTION_READY': return 'submitted';
    case 'IN_PRODUCTION': return 'printing';
    case 'SHIPPED': return 'shipped';
    case 'REJECTED': case 'CANCELED': return 'rejected';
    default: return null;
  }
}
