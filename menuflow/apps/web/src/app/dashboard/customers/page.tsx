'use client';

import { useEffect, useState } from 'react';
import { Users, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';

interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  totalOrders: number;
  totalSpent: number;
  loyaltyPoints: number;
  segment?: string;
}

export default function CustomersPage() {
  const user = useAuthStore((s) => s.user);
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    if (!user?.restaurantId) return;
    api.get<Customer[]>(`/api/restaurants/${user.restaurantId}/customers`)
      .then(setCustomers)
      .catch(console.error);
  }, [user?.restaurantId]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Clients CRM</h1>
        <p className="text-gray-500">{customers.length} clients enregistrés</p>
      </div>

      <div className="grid gap-3">
        {customers.map((customer) => (
          <Card key={customer.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Users className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium">{customer.name}</p>
                  <p className="text-sm text-gray-500">{customer.phone || customer.email}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">{formatCurrency(Number(customer.totalSpent))}</p>
                <p className="text-sm text-gray-500">{customer.totalOrders} commandes</p>
              </div>
              <div className="flex items-center gap-1 text-yellow-600">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-sm font-medium">{customer.loyaltyPoints} pts</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
