'use client';

import { useEffect, useState } from 'react';
import { RestaurantHeader } from '@/components/layout/restaurant-sidebar';
import { useAuth } from '@/contexts/auth-context';
import { getCategories, getProducts } from '@/lib/services/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import type { Category, Product } from '@/types';

export default function MenusPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!user?.restaurantId) return;
    Promise.all([getCategories(user.restaurantId), getProducts(user.restaurantId)]).then(([c, p]) => {
      setCategories(c);
      setProducts(p);
    });
  }, [user?.restaurantId]);

  return (
    <div className="space-y-6">
      <RestaurantHeader title="Menus" />
      <p className="text-gray-500 text-sm">Aperçu de votre menu digital par catégorie</p>

      {categories.map((cat) => {
        const catProducts = products.filter((p) => p.categoryId === cat.id);
        return (
          <Card key={cat.id} className="border border-gray-100 shadow-sm rounded-xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{cat.name}</CardTitle>
                <Badge>{catProducts.length} produits</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {catProducts.map((p) => (
                <div key={p.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                    {p.image && <img src={p.image} alt={p.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{p.name}</p>
                    <p className="text-xs text-gray-500 truncate">{p.description}</p>
                  </div>
                  <p className="font-semibold text-emerald-600 text-sm shrink-0">{formatCurrency(p.price)}</p>
                  <Badge variant={p.isAvailable ? 'default' : 'secondary'} className="shrink-0">
                    {p.isAvailable ? 'Dispo' : 'Off'}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
