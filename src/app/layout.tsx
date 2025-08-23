import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: 'IIT Foundation Ace',
  description: 'Your personal AI tutor for IIT Foundation.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-background">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700&family=Fira+Code&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased h-full" suppressHydrationWarning>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
