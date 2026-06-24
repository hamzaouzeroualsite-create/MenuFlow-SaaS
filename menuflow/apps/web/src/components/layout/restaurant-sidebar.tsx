'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, UtensilsCrossed, FolderOpen, Package, ShoppingBag,
  Calendar, Users, BarChart3, QrCode, Settings, CreditCard, LogOut,
  Menu, X, Bell, ExternalLink, ChevronDown,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
  { href: '/dashboard/menus', icon: UtensilsCrossed, label: 'Menus' },
  { href: '/dashboard/categories', icon: FolderOpen, label: 'Catégories' },
  { href: '/dashboard/products', icon: Package, label: 'Produits' },
  { href: '/dashboard/orders', icon: ShoppingBag, label: 'Commandes', badge: true },
  { href: '/dashboard/reservations', icon: Calendar, label: 'Réservations' },
  { href: '/dashboard/customers', icon: Users, label: 'Clients' },
  { href: '/dashboard/statistics', icon: BarChart3, label: 'Statistiques' },
  { href: '/dashboard/qr', icon: QrCode, label: 'QR Code' },
  { href: '/dashboard/settings', icon: Settings, label: 'Paramètres' },
  { href: '/dashboard/subscription', icon: CreditCard, label: 'Abonnement' },
];

export function RestaurantSidebar() {
  const pathname = usePathname();
  const { user, restaurant, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <>
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-gray-100 flex flex-col transform transition-transform lg:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="p-5 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center">
                <QrCode className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg">Menu<span className="text-emerald-400">Flow</span></span>
            </div>
            <button className="lg:hidden text-gray-400" onClick={() => setOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>
          {restaurant && (
            <button className="mt-4 w-full flex items-center justify-between px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-750 text-sm">
              <span className="font-medium truncate">{restaurant.name}</span>
              <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
            </button>
          )}
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  active
                    ? 'bg-emerald-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                )}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">8</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-gray-800">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-gray-400 hover:text-white hover:bg-gray-800"
            onClick={() => logout()}
          >
            <LogOut className="w-4 h-4" /> Déconnexion
          </Button>
        </div>
      </aside>

      {open && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setOpen(false)} />}

      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between p-4 bg-white border-b">
        <button onClick={() => setOpen(true)}><Menu className="w-6 h-6" /></button>
        <span className="font-bold">Menu<span className="text-emerald-600">Flow</span></span>
        <Bell className="w-5 h-5 text-gray-500" />
      </div>
    </>
  );
}

export function RestaurantHeader({ title }: { title: string }) {
  const { restaurant, user } = useAuth();

  return (
    <header className="hidden lg:flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        {restaurant && (
          <Link
            href={`/r/${restaurant.slug}`}
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <ExternalLink className="w-4 h-4" /> Voir le menu
          </Link>
        )}
        <button className="relative p-2 rounded-lg hover:bg-gray-100">
          <Bell className="w-5 h-5 text-gray-500" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <div className="flex items-center gap-2 pl-3 border-l">
          <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-medium text-sm">
            {user?.name?.charAt(0) || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
}
