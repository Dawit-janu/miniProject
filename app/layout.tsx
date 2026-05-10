import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'QA Reporting',
  description: 'A QA Reporting app with dynamic test case management.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
