import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ClientProviders } from '@/components/common/ClientProviders';

export const metadata: Metadata = {
  title: 'BORROWED. – Fashion Rental Club | Wear it. Love it. Return it.',
  description:
    'Rent designer dresses for weddings, galas, and milestones at a fraction of retail. List your luxury dresses for free.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen flex flex-col bg-ivory text-onyx font-sans antialiased selection:bg-mauve/30 selection:text-onyx">
        <ClientProviders>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </ClientProviders>
      </body>
    </html>
  );
}

