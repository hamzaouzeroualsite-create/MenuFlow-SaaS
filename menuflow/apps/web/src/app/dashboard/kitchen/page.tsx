'use client';

import { useEffect, useState } from 'react';
import { ChefHat } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { useOrderSocket } from '@/hooks/useSocket';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  items: { quantity: number; product: { name: string }; notes?: string }[];
  table?: { number: string };
}

export default function KitchenPage() {
  const user = useAuthStore((s) => s.user);
  const [orders, setOrders] = useState<Order[]>([]);

  const fetchKitchen = async () => {
    if (!user?.restaurantId) return;
    try {
      const data = await api.get<Order[]>(`/api/restaurants/${user.restaurantId}/orders/kitchen`);
      setOrders(data.filter((o) => ['ACCEPTED', 'PREPARING'].includes(o.status)));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchKitchen(); }, [user?.restaurantId]);
  useOrderSocket(user?.restaurantId, fetchKitchen, fetchKitchen);

  const updateStatus = async (orderId: string, status: string) => {
    if (!user?.restaurantId) return;
    await api.patch(`/api/restaurants/${user.restaurantId}/orders/${orderId}/status`, { status });
    fetchKitchen();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ChefHat className="w-8 h-8 text-emerald-600" />
        <div>
          <h1 className="text-2xl font-bold">Vue Cuisine</h1>
          <p className="text-gray-500">{orders.length} commandes en préparation</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {orders.map((order) => (
          <Card key={order.id} className="border-2 border-orange-200">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-3">
                <span className="font-mono font-bold text-xl">{order.orderNumber}</span>
                {order.table && <span className="text-lg font-medium">T{order.table.number}</span>}
              </div>
              <div className="space-y-2 mb-4">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-lg">
                    <span className="font-bold">{item.quantity}x</span>
                    <span className="flex-1 ml-2">{item.product.name}</span>
                  </div>
                ))}
              </div>
              <Button
                className="w-full"
                onClick={() => updateStatus(order.id, order.status === 'ACCEPTED' ? 'PREPARING' : 'READY')}
              >
                {order.status === 'ACCEPTED' ? 'Commencer' : 'Prêt !'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
