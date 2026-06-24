'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { RestaurantHeader } from '@/components/layout/restaurant-sidebar';
import { useAuth } from '@/contexts/auth-context';

export default function SettingsPage() {
  const { restaurant } = useAuth();

  return (
    <div className="space-y-6">
      <RestaurantHeader title="Paramètres" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-gray-100 shadow-sm rounded-xl">
          <CardHeader><CardTitle className="text-base">Informations du restaurant</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Nom</Label><Input defaultValue={restaurant?.name} className="mt-1" /></div>
            <div><Label>Adresse</Label><Input defaultValue={restaurant?.address} className="mt-1" /></div>
            <div><Label>Téléphone</Label><Input defaultValue={restaurant?.phone} className="mt-1" /></div>
            <div><Label>Email</Label><Input defaultValue={restaurant?.email} className="mt-1" /></div>
            <Button className="bg-emerald-600 hover:bg-emerald-700">Enregistrer</Button>
          </CardContent>
        </Card>

        <Card className="border border-gray-100 shadow-sm rounded-xl">
          <CardHeader><CardTitle className="text-base">Notifications</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {['Nouvelles commandes', 'Réservations', 'Expiration abonnement', 'Sons de notification'].map((label) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-sm">{label}</span>
                <Switch defaultChecked />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
