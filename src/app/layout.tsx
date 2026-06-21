import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/shared/Navbar';

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
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="hero-bg min-h-screen">
        <Navbar />
        <main id="main-content" className="pt-16">
          {children}
        </main>
      </body>
    </html>
  );
}
