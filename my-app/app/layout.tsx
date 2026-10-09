import type { Metadata } from 'next';
import { Geist, Inter } from 'next/font/google';
import { VercelToolbar } from '@vercel/toolbar/next';
import './globals.css';
import { variantScript } from './lib/variants';

/* body-text options under review (the Font group, lib/variants.ts): from Google Fonts, self-hosted
 * by next/font; only body and lead text switch — headings stay in Tomato Grotesk */
const geist = Geist({ subsets: ['latin'], variable: '--font-geist', display: 'swap' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const metadata: Metadata = {
  title: 'Leapfrog AI | Deep AI expertise. Boutique attention. Real results.',
  description:
    'Put AI to work in your operations and customer experience. Lessons from 100+ AI initiatives get your first use case live in weeks, with a partner that stays.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        {/* Tomato Grotesk is Leapfrog's brand face, self-hosted from /public/fonts. */}
        <link rel="preload" href="/fonts/TomatoGrotesk-Regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/TomatoGrotesk-Medium.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/TomatoGrotesk-SemiBold.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        {/* section versions under review (lib/variants.ts): applied before paint, no flash */}
        <script dangerouslySetInnerHTML={{ __html: variantScript() }} />
      </head>
      <body>
        {children}
        {/* the Vercel Toolbar, so the team can leave comments on the design (it shows only to
            signed-in members of the Vercel team; visitors see nothing) */}
        <VercelToolbar />
      </body>
    </html>
  );
}
