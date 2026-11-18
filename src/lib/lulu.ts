type LuluAddress = { line1?: string | null; line2?: string | null; city?: string | null; state?: string | null; postal_code?: string | null; country?: string | null };
type LuluOrder = { orderId: string; shippingAddress: LuluAddress | null; phone: string | null; customerName: string | null; shippingLevel: 'MAIL' | 'PRIORITY_MAIL' | 'EXPRESS' };
type TokenPayload = { access_token?: string; expires_in?: number };
type PrintJobPayload = { id?: string | number; status?: string };

let cachedToken: string | undefined;
let cachedTokenExpiresAt = 0;

function configuredLulu() {
  const base = process.env.LULU_PRINT_API_BASE;
  const key = process.env.LULU_CLIENT_KEY;
  const secret = process.env.LULU_CLIENT_SECRET;
  if (process.env.LULU_SANDBOX !== 'true' || base !== 'https://api.sandbox.lulu.com' || !key || !secret) {
    throw new Error('Lulu sandbox is not configured. Production endpoints are disabled in this integration.');
  }
  return { base, key, secret };
}

async function accessToken() {
  if (cachedToken && cachedTokenExpiresAt > Date.now() + 60_000) return cachedToken;
  const { base, key, secret } = configuredLulu();
  const authorization = btoa(`${key}:${secret}`);
  const response = await fetch(`${base}/auth/realms/glasstree/protocol/openid-connect/token`, {
    method: 'POST', headers: { Authorization: `Basic ${authorization}`, 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'grant_type=client_credentials',
  });
  if (!response.ok) throw new Error('Lulu sandbox authentication failed.');
  const result = await response.json() as TokenPayload;
  if (!result.access_token) throw new Error('Lulu sandbox returned no access token.');
  cachedToken = result.access_token;
  cachedTokenExpiresAt = Date.now() + (result.expires_in ?? 300) * 1000;
  return cachedToken;
}

function publicHttpsUrl(value: string | undefined, name: string) {
  if (!value) throw new Error(`${name} is missing.`);
  let parsed: URL;
  try { parsed = new URL(value); } catch { throw new Error(`${name} is not a valid URL.`); }
  if (parsed.protocol !== 'https:') throw new Error(`${name} must be an HTTPS download URL.`);
  return parsed.toString();
}

function md5(value: string | undefined, name: string) {
  if (!value || !/^[a-f\d]{32}$/i.test(value)) throw new Error(`${name} must be a 32-character MD5 checksum.`);
  return value.toUpperCase();
}

export async function submitSandboxPrintJob(order: LuluOrder): Promise<{ id: string; status?: string }> {
  const { base } = configuredLulu();
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
      external_id: `${order.orderId}-paperback`,
      pod_package_id: podPackageId,
      quantity: 1,
      interior: { source_url: publicHttpsUrl(process.env.LULU_INTERIOR_URL, 'LULU_INTERIOR_URL'), source_md5sum: md5(process.env.LULU_INTERIOR_MD5, 'LULU_INTERIOR_MD5') },
      cover: { source_url: publicHttpsUrl(process.env.LULU_COVER_URL, 'LULU_COVER_URL'), source_md5sum: md5(process.env.LULU_COVER_MD5, 'LULU_COVER_MD5') },
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

  const response = await fetch(`${base}/print-jobs/`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${await accessToken()}`, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`Lulu sandbox rejected the print job (${response.status}).`);
  const result = await response.json() as PrintJobPayload;
  if (result.id === undefined || result.id === null) throw new Error('Lulu sandbox returned no print job reference.');
  return { id: String(result.id), status: result.status };
}

export async function getSandboxPrintJobStatus(jobId: string): Promise<string> {
  const { base } = configuredLulu();
  if (!/^[\w-]+$/.test(jobId)) throw new Error('Invalid Lulu print job reference.');
  const response = await fetch(`${base}/print-jobs/${encodeURIComponent(jobId)}/status/`, {
    headers: { Authorization: `Bearer ${await accessToken()}`, Accept: 'application/json' },
  });
  if (!response.ok) throw new Error('Could not refresh the Lulu sandbox job status.');
  const result = await response.json() as { status?: string };
  if (!result.status) throw new Error('Lulu sandbox returned no job status.');
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
