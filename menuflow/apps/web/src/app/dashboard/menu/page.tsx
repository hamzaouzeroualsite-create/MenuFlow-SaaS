'use client';

import { useEffect, useState } from 'react';
import { Plus, GripVertical, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
  nameAr?: string;
  sortOrder: number;
  _count?: { products: number };
  products?: Product[];
}

interface Product {
  id: string;
  name: string;
  price: number;
  promotionPrice?: number;
  available: boolean;
  featured: boolean;
  categoryId: string;
}

export default function MenuPage() {
  const user = useAuthStore((s) => s.user);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.restaurantId) return;
    api.get<Category[]>(`/api/restaurants/${user.restaurantId}/categories`)
      .then(setCategories)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.restaurantId]);

  const toggleAvailability = async (productId: string) => {
    if (!user?.restaurantId) return;
    try {
      await api.patch(`/api/restaurants/${user.restaurantId}/products/${productId}/toggle`);
      setCategories((prev) =>
        prev.map((cat) => ({
          ...cat,
          products: cat.products?.map((p) =>
            p.id === productId ? { ...p, available: !p.available } : p
          ),
        }))
      );
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestion du Menu</h1>
          <p className="text-gray-500">{categories.length} catégories</p>
        </div>
        <Button className="gap-2"><Plus className="w-4 h-4" /> Nouvelle catégorie</Button>
      </div>

      {categories.map((category) => (
        <Card key={category.id}>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <GripVertical className="w-5 h-5 text-gray-400 cursor-grab" />
              <div>
                <CardTitle className="text-lg">{category.name}</CardTitle>
                {category.nameAr && <p className="text-sm text-gray-500 font-arabic">{category.nameAr}</p>}
              </div>
            </div>
            <Button variant="outline" size="sm" className="gap-1">
              <Plus className="w-4 h-4" /> Produit
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(category.products || []).map((product) => (
                <div
                  key={product.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${!product.available ? 'opacity-50 bg-gray-50' : 'bg-white'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-sm">
                      {product.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <div className="flex items-center gap-2">
                        {product.promotionPrice ? (
                          <>
                            <span className="text-emerald-600 font-medium">{formatCurrency(Number(product.promotionPrice))}</span>
                            <span className="text-gray-400 line-through text-sm">{formatCurrency(Number(product.price))}</span>
                          </>
                        ) : (
                          <span className="text-gray-600">{formatCurrency(Number(product.price))}</span>
                        )}
                        {product.featured && (
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">Vedette</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => toggleAvailability(product.id)} className="p-2 hover:bg-gray-100 rounded-lg">
                    {product.available ? <Eye className="w-5 h-5 text-emerald-600" /> : <EyeOff className="w-5 h-5 text-gray-400" />}
                  </button>
                </div>
              ))}
              {(!category.products || category.products.length === 0) && (
                <p className="text-sm text-gray-400 text-center py-4">Aucun produit dans cette catégorie</p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
