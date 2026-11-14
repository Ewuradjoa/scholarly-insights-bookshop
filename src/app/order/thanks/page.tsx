import Link from 'next/link';

export default function OrderThanks() {
  return <main className="account-page"><p className="section-kicker">THANK YOU</p><h1>Your next chapter is on its way.</h1><p className="account-intro">Stripe will confirm your payment securely. Your order will appear in your account after the shop records that confirmation. Ebook access is available from your account once processing is complete.</p><Link className="button button-dark" href="/account">View your account</Link></main>;
}
