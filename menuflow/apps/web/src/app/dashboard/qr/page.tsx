'use client';

import { useEffect, useState } from 'react';
import { Download, Printer, Share2, QrCode } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RestaurantHeader } from '@/components/layout/restaurant-sidebar';
import { useAuth } from '@/contexts/auth-context';
import { getQRCodes } from '@/lib/services/data';
import { generateQRCodeDataUrl, getMenuUrl, downloadQRPNG, downloadQRSVG, printQRCode, shareQRCode } from '@/lib/qr';
import type { QRCode } from '@/types';

export default function QRPage() {
  const { restaurant } = useAuth();
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [qrImages, setQrImages] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!restaurant) return;
    getQRCodes(restaurant.id).then(async (codes) => {
      setQrCodes(codes);
      const images: Record<string, string> = {};
      for (const qr of codes) {
        images[qr.id] = await generateQRCodeDataUrl(qr.url, 200);
      }
      setQrImages(images);
    });
  }, [restaurant]);

  const mainQR = qrCodes.find((q) => q.type === 'MAIN');
  const tableQRs = qrCodes.filter((q) => q.type === 'TABLE');

  return (
    <div className="space-y-6">
      <RestaurantHeader title="QR Codes" />

      <Tabs defaultValue="main">
        <TabsList>
          <TabsTrigger value="main">QR Principal</TabsTrigger>
          <TabsTrigger value="tables">QR Tables ({tableQRs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="main">
          <Card className="border border-gray-100 shadow-sm rounded-xl max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <QrCode className="w-5 h-5 text-emerald-600" /> QR Code Principal
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              {mainQR && qrImages[mainQR.id] && (
                <img src={qrImages[mainQR.id]} alt="QR Principal" className="w-48 h-48 rounded-xl border" />
              )}
              <p className="text-sm text-gray-500 mt-4 text-center">{mainQR?.url}</p>
              <div className="flex gap-2 mt-6 w-full">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => restaurant && downloadQRPNG(getMenuUrl(restaurant.slug), 'qrcode-main.png')}>
                  <Download className="w-4 h-4 mr-1" /> PNG
                </Button>
                <Button size="sm" variant="outline" className="flex-1" onClick={() => restaurant && downloadQRSVG(getMenuUrl(restaurant.slug), 'qrcode-main.svg')}>
                  <Download className="w-4 h-4 mr-1" /> SVG
                </Button>
                <Button size="sm" variant="outline" className="flex-1" onClick={() => mainQR && qrImages[mainQR.id] && printQRCode(qrImages[mainQR.id], restaurant?.name || '')}>
                  <Printer className="w-4 h-4 mr-1" /> Imprimer
                </Button>
                <Button size="sm" variant="outline" className="flex-1" onClick={() => restaurant && shareQRCode(getMenuUrl(restaurant.slug), restaurant.name)}>
                  <Share2 className="w-4 h-4 mr-1" /> Partager
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tables">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {tableQRs.map((qr) => (
              <Card key={qr.id} className="border border-gray-100 shadow-sm rounded-xl">
                <CardContent className="p-4 flex flex-col items-center">
                  <p className="font-medium text-sm mb-2">Table {qr.tableNumber}</p>
                  {qrImages[qr.id] && <img src={qrImages[qr.id]} alt={`Table ${qr.tableNumber}`} className="w-28 h-28" />}
                  <Button size="sm" variant="outline" className="mt-3 w-full text-xs" onClick={() => downloadQRPNG(qr.url, `table-${qr.tableNumber}.png`)}>
                    <Download className="w-3 h-3 mr-1" /> Télécharger
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
