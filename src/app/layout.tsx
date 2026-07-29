import type { Metadata } from 'next';
import { Fraunces, Geist } from 'next/font/google';
import './globals.css';
import { PortfolioProvider } from '@/components/providers/portfolio-provider';
import { LayoutShell } from '@/components/ui/LayoutShell';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-display' });

export const metadata: Metadata = {
  title: 'PortfolioHub',
  description: 'Create and share your professional portfolio',
  openGraph: {
    title: 'PortfolioHub',
    description: 'Create and share your professional portfolio',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var savedTheme = localStorage.getItem('theme');
                  if (savedTheme) {
                    document.documentElement.setAttribute('data-theme', savedTheme);
                  } else {
                    var preferDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    document.documentElement.setAttribute('data-theme', preferDark ? 'dark' : 'light');
                  }
                } catch (e) {}
              })();
            `
          }}
        />
      </head>
      <body className={`${geist.variable} ${fraunces.variable} antialiased`}>
        <PortfolioProvider>
          <LayoutShell>
            {children}
          </LayoutShell>
        </PortfolioProvider>
      </body>
    </html>
  );
}