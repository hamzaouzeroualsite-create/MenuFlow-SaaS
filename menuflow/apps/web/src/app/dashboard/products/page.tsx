'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { RestaurantHeader } from '@/components/layout/restaurant-sidebar';
import { useAuth } from '@/contexts/auth-context';
import { getProducts, getCategories, updateProduct, deleteProduct } from '@/lib/services/data';
import { formatCurrency } from '@/lib/utils';
import type { Product, Category } from '@/types';

export default function ProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.restaurantId) return;
    Promise.all([getProducts(user.restaurantId), getCategories(user.restaurantId)]).then(([p, c]) => {
      setProducts(p);
      setCategories(c);
      setLoading(false);
    });
  }, [user?.restaurantId]);

  const getCategoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? '';

  const toggleAvailability = async (product: Product) => {
    await updateProduct(product.id, { isAvailable: !product.isAvailable });
    setProducts((prev) => prev.map((p) => p.id === product.id ? { ...p, isAvailable: !p.isAvailable } : p));
  };

  return (
    <div className="space-y-6">
      <RestaurantHeader title="Produits" />
      <div className="flex justify-between items-center">
        <p className="text-gray-500 text-sm">{products.length} produits</p>
        <Button className="bg-emerald-600 hover:bg-emerald-700"><Plus className="w-4 h-4 mr-2" /> Nouveau produit</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {products.map((product, i) => (
            <motion.div key={product.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="border border-gray-100 shadow-sm rounded-xl overflow-hidden">
                <div className="h-40 bg-gray-100 relative">
                  {product.image && <img src={product.image} alt={product.name} className="w-full h-full object-cover" />}
                  {product.isFeatured && (
                    <div className="absolute top-2 left-2 bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3" /> Vedette
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{product.name}</h3>
                      <p className="text-xs text-gray-500">{getCategoryName(product.categoryId)}</p>
                    </div>
                    <p className="font-bold text-emerald-600">{formatCurrency(product.price)}</p>
                  </div>
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t">
                    <div className="flex items-center gap-2">
                      <Switch checked={product.isAvailable} onCheckedChange={() => toggleAvailability(product)} />
                      <span className="text-xs text-gray-500">{product.isAvailable ? 'Disponible' : 'Indisponible'}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline"><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button size="sm" variant="outline" className="text-red-600" onClick={() => deleteProduct(product.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
