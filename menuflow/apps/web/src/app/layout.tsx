import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/auth-context';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MenuFlow - Plateforme SaaS pour Restaurants',
  description: 'Menus digitaux, commandes en temps réel et gestion restaurant premium pour le Maroc.',
  keywords: ['menu digital', 'restaurant', 'QR code', 'Maroc', 'SaaS', 'MenuFlow'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
