'use client';

import { useEffect, useState } from 'react';
import { Download, QrCode, Printer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

interface Table {
  id: string;
  number: string;
  qrCode?: string;
  status: string;
}

export default function QRPage() {
  const user = useAuthStore((s) => s.user);
  const [restaurantQr, setRestaurantQr] = useState<{ url: string; qrCode: string } | null>(null);
  const [tables, setTables] = useState<Table[]>([]);

  useEffect(() => {
    if (!user?.restaurantId) return;

    api.get<Table[]>(`/api/restaurants/${user.restaurantId}/tables`).then(setTables).catch(console.error);

    api.post<{ url: string; qrCode: string }>(`/api/restaurants/my/qr`)
      .then(setRestaurantQr)
      .catch(() => {
        if (user.restaurant?.slug) {
          setRestaurantQr({
            url: `${window.location.origin}/menu/${user.restaurant.slug}`,
            qrCode: '',
          });
        }
      });
  }, [user?.restaurantId, user?.restaurant?.slug]);

  const generateTableQr = async (tableId: string) => {
    if (!user?.restaurantId) return;
    try {
      const result = await api.post<{ qrCode: string }>(`/api/restaurants/${user.restaurantId}/tables/${tableId}/qr`);
      setTables((prev) => prev.map((t) => t.id === tableId ? { ...t, qrCode: result.qrCode } : t));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Centre QR Code</h1>
        <p className="text-gray-500">Générez et téléchargez vos QR codes</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-emerald-600" /> QR Code Restaurant
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            {restaurantQr?.qrCode ? (
              <div className="space-y-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={restaurantQr.qrCode} alt="QR Code" className="w-48 h-48 mx-auto" />
                <p className="text-sm text-gray-500 break-all">{restaurantQr.url}</p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" size="sm" className="gap-1">
                    <Download className="w-4 h-4" /> PNG
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Printer className="w-4 h-4" /> Imprimer
                  </Button>
                </div>
              </div>
            ) : (
              <Button onClick={() => api.post(`/api/restaurants/my/qr`).then(setRestaurantQr)}>
                Générer le QR Code
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>QR Codes par Table</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {tables.map((table) => (
                <div key={table.id} className="text-center p-3 border rounded-lg">
                  <p className="font-medium mb-2">Table {table.number}</p>
                  {table.qrCode ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={table.qrCode} alt={`Table ${table.number}`} className="w-24 h-24 mx-auto" />
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => generateTableQr(table.id)}>
                      Générer
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
