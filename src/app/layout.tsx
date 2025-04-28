import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Header } from '@/components/layout/header';
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: 'Molecula - AI Drug Discovery',
  description: 'AI-Powered SaaS Platform for Drug Discovery',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("h-full", GeistSans.variable, GeistMono.variable)} suppressHydrationWarning={true}>
      <body
        className={cn(
          'h-full font-sans antialiased',
          // The variables are already applied to the html tag,
          // no need to apply them again here directly.
          // Tailwind's font-sans and font-mono utilities will pick them up
          // based on the CSS variables defined in globals.css
        )}
        suppressHydrationWarning={true}
      >
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8">
            {children}
          </main>
           <Toaster />
        </div>
      </body>
    </html>
  );
}
