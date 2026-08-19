import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { PortfolioProvider } from '@/components/providers/portfolio-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { LayoutShell } from '@/components/ui/LayoutShell';
import { cn } from '@/lib/utils';

const fontSans = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
});

const fontMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: {
    default: 'Portfolio App',
    template: '%s | Portfolio App',
  },
  description: 'Create and share your professional portfolio',
  openGraph: {
    title: 'Portfolio App',
    description: 'Create and share your professional portfolio',
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
      suppressHydrationWarning
      className={cn('antialiased', fontSans.variable, fontMono.variable)}
    >
      <body suppressHydrationWarning className="min-h-screen bg-background text-foreground font-sans">
        <ThemeProvider>
          <PortfolioProvider>
            <LayoutShell>{children}</LayoutShell>
          </PortfolioProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}