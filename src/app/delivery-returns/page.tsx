import type { Metadata } from 'next';
import Link from 'next/link';
import { ShopFooter } from '@/components/ShopFooter';

export const metadata: Metadata = {
  title: 'Delivery, cancellation & returns | Scholarly Insights Academia',
  description: 'Delivery estimates and cancellation information for bookshop orders.',
};

export default function DeliveryReturnsPage() {
  return <main className="policy-page">
    <div className="announcement">SCHOLARLY INSIGHTS ACADEMIA · BOOKSHOP</div>
    <header className="nav wrap"><Link href="/" className="brand"><span className="brand-mark">S</span><span>SCHOLARLY INSIGHTS<small>ACADEMIA · BOOKSHOP</small></span></Link><Link href="/" className="nav-cta">← All books</Link></header>
    <article className="policy-content wrap">
      <p className="section-kicker">ORDERING WITH CARE</p>
      <h1>Delivery, cancellation &amp; returns</h1>
      <p className="policy-updated">Last updated: 21 November 2026</p>

      <h2>Ebook delivery</h2>
      <p>After Stripe confirms payment, we send an order confirmation to your account email. Sign in to your account to access the EPUB or PDF download. The download is not attached to the email. If it does not appear, contact us at <a href="mailto:scholarlyinsightsconsulting@gmail.com">scholarlyinsightsconsulting@gmail.com</a>.</p>
      <p>Before paying, you will be asked to consent to immediate ebook supply and acknowledge that the 14-day cancellation right ends once digital supply begins. If the content is faulty or not as described, your statutory rights still apply.</p>

      <h2>Paperback delivery</h2>
      <p>Paperback delivery is available to UK addresses only. The paperback price is £19.99 and includes basic tracked delivery. Priority delivery is an additional £1; express delivery is an additional £5. The full total is shown in Stripe Checkout before you pay.</p>
      <p>We review each paid paperback order before sending it to print. Lulu’s normal book production time is 3–5 working days after an order is submitted for printing. Carrier transit time depends on the delivery option and destination; delivery dates are estimates and are not guaranteed. We will share tracking information when it is available. Busy periods, incorrect addresses and events outside our control can cause delays.</p>
      <p>Unless we agree a later date with you, goods will be delivered within 30 days. If we cannot meet that period, we will contact you so you can agree a new date or cancel for a refund.</p>

      <h2>Changing or cancelling a paperback order</h2>
      <p>You can cancel a paperback order within 14 days after the day you receive it. To cancel, email <a href="mailto:scholarlyinsightsconsulting@gmail.com?subject=Paperback%20cancellation">scholarlyinsightsconsulting@gmail.com</a> or use the form below. Tell us your order reference and the book you are cancelling. We will explain how to return the book. For a change-of-mind cancellation, you pay the direct cost of returning it; please keep proof of postage. We refund the amount due under the cancellation rules once we receive the book or you provide evidence that it was sent back.
      </p>
      <p>If a book arrives damaged, defective or incorrect, contact us promptly with your order reference and photographs if possible. We will arrange an appropriate remedy. This does not limit your statutory rights.</p>

      <h2>Cancellation form</h2>
      <p>You may copy and send this form by email. You do not have to use it if you clearly tell us you wish to cancel.</p>
      <div className="cancellation-form">
        <p>To: Scholarly Insights Academia, 188 Carlton Road, Nottingham, NG3 2BB, United Kingdom</p>
        <p>Email: scholarlyinsightsconsulting@gmail.com</p>
        <p>I give notice that I cancel my contract for the sale of this paperback:</p>
        <p>Book title: How to Fall Out of Love</p>
        <p>Order reference: ______________________________</p>
        <p>Ordered on / received on: ______________________________</p>
        <p>Name: ______________________________</p>
        <p>Address: ______________________________</p>
        <p>Date: ______________________________</p>
      </div>
      <p>For full purchase terms, see <Link href="/terms">Terms of sale</Link>. For how order information is handled, see our <Link href="/privacy">Privacy notice</Link>.</p>
    </article>
    <ShopFooter />
  </main>;
}

