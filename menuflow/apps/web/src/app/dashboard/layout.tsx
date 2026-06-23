'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, UtensilsCrossed, ShoppingBag, Calendar, Users,
  QrCode, BarChart3, Settings, LogOut, ChefHat, CreditCard,
  UserCog, Menu, X,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['RESTAURANT_OWNER', 'MANAGER', 'EMPLOYEE'] },
  { href: '/dashboard/menu', icon: UtensilsCrossed, label: 'Menu', roles: ['RESTAURANT_OWNER', 'MANAGER'] },
  { href: '/dashboard/orders', icon: ShoppingBag, label: 'Commandes', roles: ['RESTAURANT_OWNER', 'MANAGER', 'EMPLOYEE'] },
  { href: '/dashboard/kitchen', icon: ChefHat, label: 'Cuisine', roles: ['RESTAURANT_OWNER', 'MANAGER', 'EMPLOYEE'] },
  { href: '/dashboard/reservations', icon: Calendar, label: 'Réservations', roles: ['RESTAURANT_OWNER', 'MANAGER', 'EMPLOYEE'] },
  { href: '/dashboard/customers', icon: Users, label: 'Clients', roles: ['RESTAURANT_OWNER', 'MANAGER'] },
  { href: '/dashboard/qr', icon: QrCode, label: 'QR Codes', roles: ['RESTAURANT_OWNER', 'MANAGER'] },
  { href: '/dashboard/analytics', icon: BarChart3, label: 'Analytics', roles: ['RESTAURANT_OWNER', 'MANAGER'] },
  { href: '/dashboard/employees', icon: UserCog, label: 'Équipe', roles: ['RESTAURANT_OWNER'] },
  { href: '/dashboard/subscription', icon: CreditCard, label: 'Abonnement', roles: ['RESTAURANT_OWNER'] },
  { href: '/dashboard/settings', icon: Settings, label: 'Paramètres', roles: ['RESTAURANT_OWNER', 'MANAGER'] },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    if (user?.role === 'SUPER_ADMIN') {
      router.push('/admin');
    }
  }, [isAuthenticated, user, router]);

  const visibleNav = navItems.filter((item) =>
    !user?.role || item.roles.includes(user.role)
  );

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b">
        <button onClick={() => setSidebarOpen(true)}>
          <Menu className="w-6 h-6" />
        </button>
        <span className="font-bold">Menu<span className="text-emerald-600">Flow</span></span>
        <div className="w-6" />
      </div>

      {/* Sidebar */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-emerald flex items-center justify-center">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold">Menu<span className="text-emerald-600">Flow</span></span>
          </div>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {user?.restaurant && (
          <div className="p-4 border-b">
            <p className="font-medium text-sm truncate">{user.restaurant.name}</p>
            <p className="text-xs text-gray-500">{user.restaurant.subscriptionPlan || 'FREE'}</p>
          </div>
        )}

        <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
          {visibleNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                pathname === item.href
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-sm font-medium">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-gray-600" onClick={handleLogout}>
            <LogOut className="w-4 h-4" /> Déconnexion
          </Button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <main className="lg:pl-64">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
