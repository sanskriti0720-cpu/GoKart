import type { Metadata } from 'next';
import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import { CustomerProvider } from '@/context/CustomerContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'GoKart — Discover More. Shop Better.',
  description: 'Discover products you’ll love. Explore new trends, exclusive finds and everyday essentials at GoKart.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-paper text-ink">
        <CustomerProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </CustomerProvider>
      </body>
    </html>
  );
}
