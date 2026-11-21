type OrderConfirmation = {
  orderId: string;
  email: string | null;
  edition: 'ebook' | 'paperback';
  amountTotal: number | null;
  currency: string | null;
  sessionId: string;
  digitalContentConsentAt?: string | null;
  shippingMethod?: string | null;
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
  const termsUrl = new URL('/terms', siteUrl).toString();
  const deliveryUrl = new URL('/delivery-returns', siteUrl).toString();
  const contactUrl = new URL('/contact', siteUrl).toString();
  const deliveryName = order.shippingMethod === 'MAIL' ? 'Basic tracked UK delivery'
    : order.shippingMethod === 'PRIORITY_MAIL' ? 'Priority delivery'
      : order.shippingMethod === 'EXPRESS' ? 'Express delivery' : null;
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
        `Book: How to Fall Out of Love by Dr Ewuradjoa Mansa Quansah`,
        `Edition: ${editionName}`,
        total ? `Total paid: ${total}` : null,
        deliveryName ? `Delivery selected: ${deliveryName}` : null,
        `Order reference: ${reference}`,
        '',
        order.edition === 'ebook'
          ? `Sign in to your bookshop account to access your ebook: ${accountUrl}`
          : `You can follow your paperback order from your bookshop account: ${accountUrl}`,
        order.edition === 'ebook' && order.digitalContentConsentAt
          ? `Digital content consent: You agreed to immediate ebook supply and acknowledged that your 14-day right to cancel would be lost once supply began. Consent recorded at: ${order.digitalContentConsentAt}.`
          : null,
        order.edition === 'paperback'
          ? 'You can cancel a paperback order within 14 days after the day you receive it. Contact us for return instructions. This does not affect your rights if an item is faulty or incorrect.'
          : null,
        '',
        'Seller: Scholarly Insights Academia, 188 Carlton Road, Nottingham, NG3 2BB, United Kingdom.',
        'Scholarly Insights Academia is not VAT registered; no VAT is charged.',
        `Contact: scholarlyinsightsconsulting@gmail.com (${contactUrl})`,
        `Terms of sale: ${termsUrl}`,
        `Delivery, cancellation and returns: ${deliveryUrl}`,
        '',
        'Keep this email for your records. Your ebook download is protected and is not attached to this message.',
      ].filter(Boolean).join('\n'),
    }),
  });
  if (!response.ok) throw new Error(`Order email provider returned ${response.status}.`);
}

