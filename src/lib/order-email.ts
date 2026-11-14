type OrderConfirmation = {
  orderId: string;
  email: string | null;
  edition: 'ebook' | 'paperback';
  amountTotal: number | null;
  currency: string | null;
  sessionId: string;
};

export async function sendOrderConfirmation(order: OrderConfirmation) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.ORDER_EMAIL_FROM;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!apiKey || !from || !siteUrl) throw new Error('Order email is not configured.');
  if (!order.email) throw new Error('The paid order has no customer email address.');

  const editionName = order.edition === 'ebook' ? 'Ebook' : 'Paperback';
  const reference = order.orderId.slice(0, 8).toUpperCase();
  const total = order.amountTotal !== null && order.currency
    ? new Intl.NumberFormat('en-GB', { style: 'currency', currency: order.currency.toUpperCase() }).format(order.amountTotal / 100)
    : null;
  const accountUrl = new URL('/account', siteUrl).toString();
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': `order-confirmation-${order.sessionId}`,
    },
    body: JSON.stringify({
      from,
      to: [order.email],
      subject: `Your bookshop order ${reference} is confirmed`,
      text: [
        'Thank you for your order.',
        '',
        `Book: How to Fall Out of Love by Ewuradjoa Quansah`,
        `Edition: ${editionName}`,
        total ? `Total paid: ${total}` : null,
        `Order reference: ${reference}`,
        '',
        order.edition === 'ebook'
          ? `Sign in to your bookshop account to access your ebook: ${accountUrl}`
          : `You can follow your paperback order from your bookshop account: ${accountUrl}`,
        '',
        'Keep this email for your records. Your ebook download is protected and is not attached to this message.',
      ].filter(Boolean).join('\n'),
    }),
  });
  if (!response.ok) throw new Error(`Order email provider returned ${response.status}.`);
}
