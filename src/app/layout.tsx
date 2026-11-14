import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Scholarly Insights Bookshop | How to Fall Out of Love',
  description: 'A thoughtful guide to understanding why you hold on and learning how to let go, by Ewuradjoa Quansah.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en-GB"><body>{children}</body></html>;
}
