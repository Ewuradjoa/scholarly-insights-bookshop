import type { Metadata } from 'next';
import Link from 'next/link';
import { ShopFooter } from '@/components/ShopFooter';

export const metadata: Metadata = {
  title: 'Terms of sale | Scholarly Insights Academia',
  description: 'Terms for buying books from Scholarly Insights Academia.',
};

export default function TermsPage() {
  return <main className="policy-page">
    <div className="announcement">SCHOLARLY INSIGHTS ACADEMIA · BOOKSHOP</div>
    <header className="nav wrap"><Link href="/" className="brand"><span className="brand-mark">S</span><span>SCHOLARLY INSIGHTS<small>ACADEMIA · BOOKSHOP</small></span></Link><Link href="/" className="nav-cta">← All books</Link></header>
    <article className="policy-content wrap">
      <p className="section-kicker">CUSTOMER INFORMATION</p>
      <h1>Terms of sale</h1>
      <p className="policy-updated">Last updated: 21 November 2026</p>
      <p>These terms apply to orders placed through the Scholarly Insights Academia bookshop. By placing an order, you agree to these terms. Your statutory consumer rights are not affected.</p>

      <h2>Who we are</h2>
      <p>The seller is <strong>Scholarly Insights Academia</strong>, 188 Carlton Road, Nottingham, NG3 2BB, United Kingdom. Contact us at <a href="mailto:scholarlyinsightsconsulting@gmail.com">scholarlyinsightsconsulting@gmail.com</a>.</p>

      <h2>Books, prices and payment</h2>
      <p>Product pages describe the available edition and the book. Prices are in pounds sterling (GBP). Scholarly Insights Academia is not VAT registered and does not charge VAT. The total due, including any delivery option you select, is shown in Stripe Checkout before you submit payment. Payments are processed by Stripe; we do not receive or store your full card number.</p>
      <p>The ebook is £9.99. The paperback is £19.99 with basic tracked UK delivery included. Priority delivery adds £1 and express delivery adds £5. You must choose an available delivery option for a paperback order.</p>
      <p>Your order is accepted when payment is confirmed and we send an order confirmation. If we cannot fulfil an order, we will contact you and refund the payment.</p>

      <h2>Digital books</h2>
      <p>The ebook is supplied in EPUB and PDF formats through your bookshop account. Before payment, you must expressly request immediate supply and acknowledge that you will lose the 14-day cancellation right once supply begins. This choice is recorded with the order and repeated in the confirmation email. It does not remove your rights if the digital content is faulty or not as described.</p>

      <h2>Paperback orders</h2>
      <p>Paperbacks are printed to order. Each paid paperback order is checked before it is sent to print. Printing and delivery are described in our <Link href="/delivery-returns">Delivery &amp; returns information</Link>. Delivery is currently available to UK addresses only.</p>

      <h2>Reviews</h2>
      <p>Only a customer with a completed paid order for the book can submit a review. Reviews are moderated before publication. We may decline or remove content that is unlawful, abusive, irrelevant or discloses another person’s private information. You can report a published review from the book page.</p>

      <h2>Contact and complaints</h2>
      <p>For questions, order issues or complaints, email <a href="mailto:scholarlyinsightsconsulting@gmail.com">scholarlyinsightsconsulting@gmail.com</a> and include your order reference where available. See our <Link href="/delivery-returns">cancellation and returns information</Link> and <Link href="/privacy">privacy notice</Link>.</p>
    </article>
    <ShopFooter />
  </main>;
}

