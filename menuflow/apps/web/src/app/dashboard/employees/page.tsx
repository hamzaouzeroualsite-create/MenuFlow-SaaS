'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

export default function EmployeesPage() {
  const user = useAuthStore((s) => s.user);
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    if (!user?.restaurantId) return;
    api.get<Employee[]>(`/api/restaurants/${user.restaurantId}/employees`)
      .then(setEmployees)
      .catch(console.error);
  }, [user?.restaurantId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Équipe</h1>
          <p className="text-gray-500">{employees.length} membres</p>
        </div>
        <Button className="gap-2"><Plus className="w-4 h-4" /> Ajouter</Button>
      </div>

      <div className="grid gap-3">
        {employees.map((emp) => (
          <Card key={emp.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-medium">
                  {emp.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium">{emp.name}</p>
                  <p className="text-sm text-gray-500">{emp.email}</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100">{emp.role}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
