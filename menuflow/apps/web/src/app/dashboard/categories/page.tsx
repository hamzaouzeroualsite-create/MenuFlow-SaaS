'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, GripVertical } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RestaurantHeader } from '@/components/layout/restaurant-sidebar';
import { useAuth } from '@/contexts/auth-context';
import { getCategories, deleteCategory } from '@/lib/services/data';
import type { Category } from '@/types';

export default function CategoriesPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.restaurantId) return;
    getCategories(user.restaurantId).then((c) => {
      setCategories(c);
      setLoading(false);
    });
  }, [user?.restaurantId]);

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette catégorie ?')) return;
    await deleteCategory(id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-6">
      <RestaurantHeader title="Catégories" />
      <div className="flex justify-between items-center">
        <p className="text-gray-500 text-sm">{categories.length} catégories</p>
        <Button className="bg-emerald-600 hover:bg-emerald-700"><Plus className="w-4 h-4 mr-2" /> Nouvelle catégorie</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full" /></div>
      ) : (
        <div className="grid gap-3">
          {categories.map((cat, i) => (
            <motion.div key={cat.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="border border-gray-100 shadow-sm rounded-xl">
                <CardContent className="p-4 flex items-center gap-4">
                  <GripVertical className="w-5 h-5 text-gray-300 cursor-grab" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{cat.name}</h3>
                      <Badge variant={cat.isActive ? 'default' : 'secondary'}>{cat.isActive ? 'Active' : 'Inactive'}</Badge>
                    </div>
                    {cat.description && <p className="text-sm text-gray-500 mt-0.5">{cat.description}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline"><Pencil className="w-4 h-4" /></Button>
                    <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleDelete(cat.id)}><Trash2 className="w-4 h-4" /></Button>
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
