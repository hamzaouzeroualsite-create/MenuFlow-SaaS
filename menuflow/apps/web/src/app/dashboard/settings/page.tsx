'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const [restaurant, setRestaurant] = useState<Record<string, string>>({});

  useEffect(() => {
    api.get<Record<string, string>>('/api/restaurants/my')
      .then((data) => setRestaurant(data))
      .catch(console.error);
  }, []);

  const handleSave = async () => {
    try {
      await api.put('/api/restaurants/my', restaurant);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Paramètres</h1>
        <p className="text-gray-500">Configurez votre restaurant</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profil du restaurant</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nom</Label>
              <Input value={restaurant.name || ''} onChange={(e) => setRestaurant({ ...restaurant, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Ville</Label>
              <Input value={restaurant.city || ''} onChange={(e) => setRestaurant({ ...restaurant, city: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Téléphone</Label>
              <Input value={restaurant.phone || ''} onChange={(e) => setRestaurant({ ...restaurant, phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={restaurant.email || ''} onChange={(e) => setRestaurant({ ...restaurant, email: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Input value={restaurant.description || ''} onChange={(e) => setRestaurant({ ...restaurant, description: e.target.value })} />
          </div>
          <Button onClick={handleSave}>Enregistrer</Button>
        </CardContent>
      </Card>
    </div>
  );
}
