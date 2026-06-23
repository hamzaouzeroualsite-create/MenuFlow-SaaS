import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MenuFlow - Menus Digitaux pour Restaurants au Maroc',
  description: 'Plateforme SaaS de menus digitaux, commandes en temps réel et gestion restaurant pour le Maroc.',
  keywords: ['menu digital', 'restaurant', 'QR code', 'Maroc', 'commande', 'SaaS'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
