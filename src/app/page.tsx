import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowDown, ArrowRight, BookOpen } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Bookshop | Scholarly Insights Academia',
  description: 'Thoughtful books by Dr Ewuradjoa Mansa Quansah. Explore the Scholarly Insights Academia bookshop.',
};

const featuredBook = {
  href: '/books/how-to-fall-out-of-love',
  title: 'How to Fall Out of Love',
  subtitle: 'Understanding Why You Hold On and Learning How to Let Go',
  author: 'Dr Ewuradjoa Mansa Quansah',
  cover: '/books/how-to-fall-out-of-love.png',
};

const forthcomingBook = {
  title: 'The Scholarship Blueprint',
  author: 'Dr Ewuradjoa Mansa Quansah',
  cover: '/books/scholarship-blueprint.png',
};

export default function Home() {
  return <main className="catalog-page">
    <div className="announcement">A BOOKSHOP FOR THE CHAPTERS THAT CHANGE US <span>·</span> SCHOLARLY INSIGHTS ACADEMIA</div>
    <header className="nav wrap"><Link href="/" className="brand"><span className="brand-mark">S</span><span>SCHOLARLY INSIGHTS<small>ACADEMIA · BOOKSHOP</small></span></Link><nav><a href="#books">Books</a><a href="#about">About the bookshop</a></nav><a href="#books" className="nav-cta">Explore books <ArrowRight size={15}/></a></header>

    <section className="catalog-hero wrap"><div className="catalog-hero-copy"><p className="eyebrow"><span className="eyebrow-line"/> WORDS FOR THE WAY FORWARD</p><h1>Thoughtful books<br/>for the chapters<br/><em>that change us.</em></h1><p className="dek">Explore honest, hopeful writing by Dr Ewuradjoa Mansa Quansah—books to return to as life asks something new of you.</p><a href="#books" className="button button-dark">Browse the bookshop <ArrowDown size={16}/></a></div><Link className="catalog-hero-book" href={featuredBook.href} aria-label={`Discover ${featuredBook.title}`}><img src={featuredBook.cover} alt={`Cover of ${featuredBook.title} by ${featuredBook.author}`}/><span>NOW IN THE BOOKSHOP <ArrowRight size={14}/></span></Link></section>

    <section className="catalog-list wrap" id="books"><div className="catalog-heading"><div><div className="section-kicker">A GROWING COLLECTION</div><h2>Browse the <em>bookshop.</em></h2></div><p>Each title has its own page with the story, available editions and reader notes.</p></div>
      <article className="catalog-book"><Link className="catalog-book-cover" href={featuredBook.href}><img src={featuredBook.cover} alt={`Cover of ${featuredBook.title}`}/></Link><div className="catalog-book-copy"><div className="section-kicker">PERSONAL GROWTH · REFLECTIONS</div><h3>{featuredBook.title}</h3><p className="catalog-subtitle">{featuredBook.subtitle}</p><p>A gentle, honest companion for understanding why we hold on—and finding the courage to choose ourselves again.</p><div className="catalog-author"><BookOpen size={16}/> By {featuredBook.author}</div><div className="catalog-formats"><span>Ebook</span><span>Paperback</span></div><Link href={featuredBook.href} className="button button-dark">Discover this book <ArrowRight size={15}/></Link></div><div className="catalog-book-index">01</div></article>
      <article className="catalog-book catalog-book-forthcoming"><div className="catalog-book-cover"><img src={forthcomingBook.cover} alt={`Cover of ${forthcomingBook.title} by ${forthcomingBook.author}`}/></div><div className="catalog-book-copy"><div className="section-kicker">COMING SOON · SCHOLARSHIP &amp; EDUCATION</div><h3>{forthcomingBook.title}</h3><p>A forthcoming guide to the scholarship journey. Full description, editions and availability will be added when the final book files are ready.</p><div className="catalog-author"><BookOpen size={16}/> By {forthcomingBook.author}</div><div className="catalog-formats"><span>Details to come</span></div></div><div className="catalog-book-index">02</div></article>
      <p className="catalog-coming">More books will find their place here as the collection grows.</p>
    </section>

    <section className="catalog-about" id="about"><div className="wrap catalog-about-inner"><span>✳</span><div><div className="section-kicker">SCHOLARLY INSIGHTS ACADEMIA</div><h2>Books that meet you<br/><em>where you are.</em></h2><p>A home for thoughtful writing about the questions, transitions and possibilities that shape our lives.</p></div><Link href={featuredBook.href}>Start with our first title <ArrowRight size={15}/></Link></div></section>
    <footer className="footer wrap"><Link href="/" className="brand"><span className="brand-mark">S</span><span>SCHOLARLY INSIGHTS<small>ACADEMIA · BOOKSHOP</small></span></Link><Link href="#books">Browse books</Link><Link href="/account">My account</Link><span>© 2026 Scholarly Insights Academia</span></footer>
  </main>;
}
