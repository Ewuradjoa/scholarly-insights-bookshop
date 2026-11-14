'use client';

export function EditionOptions({ checkoutOpen }: { checkoutOpen: boolean }) {
  function choose(edition:'ebook'|'paperback') {
    if (!checkoutOpen) return;
    window.location.assign(`/checkout?edition=${edition}`);
  }
  return <>
    <button className="button button-muted" disabled={!checkoutOpen} onClick={()=>choose('ebook')}>{checkoutOpen?'Buy ebook':'Coming soon'}</button>
    <button className="button button-dark" disabled={!checkoutOpen} onClick={()=>choose('paperback')}>{checkoutOpen?'Buy paperback':'Coming soon'}</button>
  </>;
}
