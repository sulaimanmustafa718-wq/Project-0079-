import type { Metadata } from 'next';
import { DM_Sans, Plus_Jakarta_Sans } from 'next/font/google';
import { DicbookProvider } from '@/lib/dicbook/store';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: 'DICBOOK — People & Local Businesses',
  description:
    'A welcoming social network connecting neighbors, creators, and local businesses.',
  openGraph: {
    title: 'DICBOOK — People & Local Businesses',
    description:
      'A welcoming social network connecting neighbors, creators, and local businesses.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DICBOOK — People & Local Businesses',
    description:
      'A welcoming social network connecting neighbors, creators, and local businesses.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${dmSans.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <DicbookProvider>{children}</DicbookProvider>
      </body>
    </html>
  );
}
