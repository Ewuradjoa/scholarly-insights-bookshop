import type { Metadata } from 'next';
import Link from 'next/link';
import { ShopFooter } from '@/components/ShopFooter';

export const metadata: Metadata = {
  title: 'Contact | Scholarly Insights Academia',
  description: 'Contact Scholarly Insights Academia about a bookshop order.',
};

export default function ContactPage() {
  return <main className="policy-page">
    <div className="announcement">SCHOLARLY INSIGHTS ACADEMIA · BOOKSHOP</div>
    <header className="nav wrap"><Link href="/" className="brand"><span className="brand-mark">S</span><span>SCHOLARLY INSIGHTS<small>ACADEMIA · BOOKSHOP</small></span></Link><Link href="/" className="nav-cta">← All books</Link></header>
    <article className="policy-content wrap">
      <p className="section-kicker">WE’RE HERE TO HELP</p>
      <h1>Contact the bookshop</h1>
      <p>For order, ebook access, delivery, cancellation or review questions, email us at <a href="mailto:scholarlyinsightsconsulting@gmail.com">scholarlyinsightsconsulting@gmail.com</a>. Include your order reference if you have one.</p>
      <p><strong>Scholarly Insights Academia</strong><br/>188 Carlton Road<br/>Nottingham<br/>NG3 2BB<br/>United Kingdom</p>
      <p>Read our <Link href="/terms">Terms of sale</Link>, <Link href="/delivery-returns">Delivery &amp; returns information</Link> and <Link href="/privacy">Privacy notice</Link>.</p>
    </article>
    <ShopFooter />
  </main>;
}

