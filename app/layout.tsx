import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'POUR / PLAY — The Cinematic Coffee Ritual (Grind · Pour · Sip)',
  description: 'A scroll-driven cinematic sensory exploration of single-origin coffee brewing from precision burr grind to the handcrafted cup.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
