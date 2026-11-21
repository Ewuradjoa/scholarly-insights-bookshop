'use client';

type Edition = 'ebook' | 'paperback';

export function EditionOptions({ checkoutOpen, edition }: { checkoutOpen: boolean; edition: Edition }) {
  function choose() {
    if (!checkoutOpen) return;
    window.location.assign(`/checkout?edition=${edition}`);
  }

  return (
    <button
      className={`button ${edition === 'paperback' ? 'button-dark' : 'button-muted'}`}
      disabled={!checkoutOpen}
      onClick={choose}
    >
      {checkoutOpen ? `Buy ${edition}` : 'Coming soon'}
    </button>
  );
}
