import Link from 'next/link';

export function ShopFooter({ bookshop = false }: { bookshop?: boolean }) {
  return <footer className="footer wrap">
    <Link href="/" className="brand"><span className="brand-mark">S</span><span>SCHOLARLY INSIGHTS<small>ACADEMIA · BOOKSHOP</small></span></Link>
    <nav className="footer-links" aria-label="Customer information">
      {bookshop ? <Link href="/#books">Browse books</Link> : <Link href="/">All books</Link>}
      <Link href="/terms">Terms of sale</Link>
      <Link href="/delivery-returns">Delivery &amp; returns</Link>
      <Link href="/privacy">Privacy</Link>
      <Link href="/contact">Contact</Link>
      <Link href="/account">My account</Link>
    </nav>
    <span>© 2026 Scholarly Insights Academia</span>
  </footer>;
}

