import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/shared/Navbar';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'EcoTrack — Carbon Footprint Awareness Platform',
  description:
    'Calculate, track, and reduce your personal carbon footprint with real-time telemetry, gamified actions, and predictive insights. Join thousands on the path to Paris Agreement targets.',
  keywords: ['carbon footprint', 'CO2', 'climate', 'sustainability', 'emissions tracker'],
  openGraph: {
    title: 'EcoTrack — Your Personal Carbon Footprint Tracker',
    description: 'Real-time carbon tracking, gamified actions, and Paris-aligned forecasting.',
    type: 'website',
  },
  robots: 'index, follow',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="hero-bg min-h-screen font-sans">
        {/* Skip-to-content link for keyboard/screen reader accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-emerald-600 focus:text-white focus:text-sm focus:font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400"
        >
          Skip to main content
        </a>
        <Navbar />
        <main id="main-content" className="pt-16" role="main">
          {children}
        </main>
      </body>
    </html>
  );
}
