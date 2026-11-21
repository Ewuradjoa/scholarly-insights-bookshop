import type { Metadata } from 'next';
import Link from 'next/link';
import { ShopFooter } from '@/components/ShopFooter';

export const metadata: Metadata = {
  title: 'Privacy notice | Scholarly Insights Academia',
  description: 'How the Scholarly Insights Academia bookshop uses and protects customer information.',
};

export default function PrivacyPage() {
  return <main className="policy-page">
    <div className="announcement">SCHOLARLY INSIGHTS ACADEMIA · BOOKSHOP</div>
    <header className="nav wrap"><Link href="/" className="brand"><span className="brand-mark">S</span><span>SCHOLARLY INSIGHTS<small>ACADEMIA · BOOKSHOP</small></span></Link><Link href="/" className="nav-cta">← All books</Link></header>
    <article className="policy-content wrap">
      <p className="section-kicker">YOUR INFORMATION</p>
      <h1>Privacy notice</h1>
      <p className="policy-updated">Last updated: 21 November 2026</p>
      <p>This notice explains how Scholarly Insights Academia uses information when you browse the bookshop, create an account, place an order, download an ebook, or submit or report a review.</p>

      <h2>Who is responsible</h2>
      <p>The data controller is Scholarly Insights Academia, 188 Carlton Road, Nottingham, NG3 2BB, United Kingdom. Contact us at <a href="mailto:scholarlyinsightsconsulting@gmail.com">scholarlyinsightsconsulting@gmail.com</a>.</p>

      <h2>Information we use</h2>
      <ul>
        <li>Account details, including your email address and authentication records.</li>
        <li>Order information, including the book and edition, amount, payment status, order reference, and ebook-consent record.</li>
        <li>For paperback orders, the name, delivery address and phone number needed to send the book.</li>
        <li>Reviews, reports about reviews, and messages you send to customer support.</li>
        <li>Basic technical and security information handled by the hosting and account services.</li>
      </ul>

      <h2>How we use it</h2>
      <p>We use this information to create and secure your account, take payment, provide the book you bought, send order and delivery messages, manage verified-purchase reviews, respond to support requests, prevent abuse, and meet legal record-keeping duties. We do not sell customer information or use it for marketing newsletters.</p>
      <p>Payment card details are processed by Stripe. The bookshop does not receive or store your full card number. Public reviews show the review text, rating and date; we do not display your account email alongside a review.</p>

      <h2>Services that help operate the shop</h2>
      <p>We share only the information needed with service providers: Supabase for account, order and private file storage; Stripe for payment processing; Cloudflare for hosting and security; Resend for transactional email; Lulu for paperback printing and delivery; and Google Fonts for website typography. For a paperback, delivery details are sent to Lulu only after your payment and an owner approval to submit that particular order.</p>
      <p>These providers may process information in other countries. Where data protection law requires it, appropriate safeguards are used for international transfers. Each provider also publishes its own privacy information.</p>

      <h2>How long we keep information</h2>
      <p>We keep account, order, payment and consent records for as long as needed to provide the service, handle disputes and comply with legal obligations. Reviews and reports are kept while needed for moderation, safety and legal purposes. When information is no longer needed, it is deleted or securely anonymised.</p>

      <h2>Your choices and rights</h2>
      <p>Depending on the circumstances, you can ask to access, correct, delete, restrict or receive a copy of your personal information, or object to some uses. Contact us at <a href="mailto:scholarlyinsightsconsulting@gmail.com">scholarlyinsightsconsulting@gmail.com</a>. You can also complain to the UK Information Commissioner’s Office at <a href="https://ico.org.uk/make-a-complaint/">ico.org.uk/make-a-complaint</a>.</p>
      <p>Essential account storage is used to keep sign-in and account security working. The site does not use advertising cookies or marketing trackers.</p>
      <p>See the <Link href="/terms">Terms of sale</Link> and <Link href="/delivery-returns">Delivery &amp; returns information</Link>.</p>
    </article>
    <ShopFooter />
  </main>;
}

