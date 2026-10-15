import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NexusDev Virtual Studio — 2D Multi-Agent AI Software House',
  description: 'Interactive 2D spatial workspace orchestrating autonomous AI engineering teams (Web, Android, iOS).',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="h-screen w-screen overflow-hidden bg-studio-bg text-gray-100 antialiased">
        {children}
      </body>
    </html>
  );
}
