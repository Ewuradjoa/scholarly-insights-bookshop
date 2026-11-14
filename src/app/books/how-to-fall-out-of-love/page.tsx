import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowDown, ArrowRight, BookOpen, Check, Feather, Heart, Star } from 'lucide-react';
import { ReviewSection } from '@/components/ReviewSection';
import { EditionOptions } from '@/components/EditionOptions';
import { checkoutReady } from '@/lib/config';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'How to Fall Out of Love | Scholarly Insights Academia',
  description: 'A gentle, honest companion for understanding why we hold on and learning how to let go, by Ewuradjoa Quansah.',
};

export default function Home() {
  const checkoutOpen = checkoutReady();
  return <main>
    <div className="announcement">A new perspective on love, loss and letting go <span>·</span> By Ewuradjoa Quansah</div>
    <header className="nav wrap"><Link href="/" className="brand"><span className="brand-mark">S</span><span>SCHOLARLY INSIGHTS<small>ACADEMIA · BOOKSHOP</small></span></Link><nav><Link href="/">All books</Link><a href="#inside">Inside the book</a><a href="#reviews">Reader notes</a></nav><a href="#editions" className="nav-cta">Choose your edition <ArrowRight size={15}/></a></header>

    <section className="hero wrap" id="the-book"><div className="hero-copy"><p className="eyebrow"><span className="eyebrow-line"/> A GUIDE TO LETTING GO</p><h1>Some endings<br/>are <em>beginnings</em><br/>in disguise.</h1><p className="dek">A gentle, honest companion for understanding why we hold on—and finding the courage to choose ourselves again.</p><div className="byline"><span className="avatar">EQ</span><span><b>Ewuradjoa Quansah</b><small>Author · Scholarly Insights Academia</small></span></div><a href="#editions" className="button button-dark">Find your edition <ArrowDown size={16}/></a><div className="hero-proof"><span><Star size={14} fill="currentColor"/> A thoughtful read for your next chapter</span></div></div>
      <div className="book-stage"><div className="sun-disc"/><div className="book-shadow"/><img className="real-book-cover" src="/books/how-to-fall-out-of-love.png" alt="Cover of How to Fall Out of Love by Ewuradjoa Quansah"/><div className="stage-caption">A little space to find yourself again <span>✳</span></div></div>
    </section>

    <section className="quote-band"><div className="wrap quote-inner"><span className="quote-mark">“</span><p>Letting go is not forgetting what mattered.<br/><em>It is remembering that you matter, too.</em></p><span className="quote-note">A note for the heart in transition</span></div></section>

    <section className="inside wrap" id="inside"><div className="section-kicker">A BOOK FOR THE IN-BETWEEN</div><div className="inside-grid"><h2>When your heart<br/>needs <em>room to breathe.</em></h2><div className="inside-copy"><p>There is no simple timeline for moving on. This book meets you where you are—with compassion, clear questions and small practices that help you reconnect with the person you are becoming.</p><div className="pillars"><div><span>01</span><b>Understand</b><small>See the patterns beneath your attachment.</small></div><div><span>02</span><b>Unlearn</b><small>Make room for truth, tenderness and change.</small></div><div><span>03</span><b>Begin again</b><small>Build a life that feels like it belongs to you.</small></div></div></div></div></section>

    <section className="editions" id="editions"><div className="wrap editions-wrap"><div className="edition-heading"><div><div className="section-kicker">YOUR NEXT CHAPTER STARTS HERE</div><h2>Choose your <em>edition.</em></h2></div><p>Take the format that feels right for you.<br/>Checkout will open once the shop is ready.</p></div><div className="edition-cards"><article className="edition-card ebook"><div className="edition-icon"><BookOpen size={19}/></div><div className="edition-tag">READ ANYWHERE</div><h3>The ebook</h3><p>A quiet companion on your phone, tablet or e-reader. Yours to keep and return to whenever you need it.</p><ul><li><Check size={14}/> Instant download after purchase</li><li><Check size={14}/> PDF / EPUB formats</li><li><Check size={14}/> Secure personal access</li></ul><EditionOptions checkoutOpen={checkoutOpen}/></article><article className="edition-card paperback"><div className="edition-icon"><Feather size={19}/></div><div className="edition-tag">A BOOK TO HOLD</div><h3>The paperback</h3><p>Printed to order and delivered to your door—a tactile space for notes, pauses and turning pages.</p><ul><li><Check size={14}/> Softcover print edition</li><li><Check size={14}/> Printed on demand</li><li><Check size={14}/> Delivery to your address</li></ul><EditionOptions checkoutOpen={checkoutOpen}/></article></div>{!checkoutOpen&&<div className="checkout-note"><span className="lock">✳</span><span><b>The shop is being prepared with care.</b> Payments will become available after secure checkout and book delivery are fully configured.</span></div>}</div></section>

    <ReviewSection />

    <section className="closing"><div className="wrap closing-inner"><span>✳</span><p>Your story is still unfolding.<br/><em>Let this be one gentle place to begin.</em></p><a href="#the-book">Back to the beginning ↑</a></div></section>
    <footer className="footer wrap"><Link href="/" className="brand"><span className="brand-mark">S</span><span>SCHOLARLY INSIGHTS<small>ACADEMIA · BOOKSHOP</small></span></Link><Link href="/account">My account</Link><Link href="/admin/sign-in">Admin</Link><span>© 2026 Scholarly Insights Academia</span><span>Thoughtfully made for the way forward.</span></footer>
  </main>;
}
