import type { Metadata } from 'next';
import './globals.css';
import './catalog.css';
import './admin.css';

export const metadata: Metadata = {
  title: 'Scholarly Insights Academia Bookshop',
  description: 'Thoughtful books by Dr Ewuradjoa Mansa Quansah. Explore the Scholarly Insights Academia bookshop.',
  icons: {
    icon: '/scholarly-insights-logo.png',
    apple: '/scholarly-insights-logo.png',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en-GB"><body>{children}</body></html>;
}
