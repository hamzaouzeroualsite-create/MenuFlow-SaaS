'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, unknown>>({});

  useEffect(() => {
    api.get<{ settings: Record<string, unknown> }>('/api/admin/settings')
      .then((s) => setSettings(s.settings || s))
      .catch(console.error);
  }, []);

  const handleSave = async () => {
    await api.put('/api/admin/settings', settings);
    alert('Paramètres enregistrés');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Paramètres Plateforme</h1>
        <p className="text-gray-400">Configuration globale MenuFlow</p>
      </div>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader><CardTitle className="text-white">Général</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Nom plateforme</Label>
              <Input className="bg-gray-800 border-gray-700 text-white" value={String(settings.platformName || '')} onChange={(e) => setSettings({ ...settings, platformName: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Email support</Label>
              <Input className="bg-gray-800 border-gray-700 text-white" value={String(settings.supportEmail || '')} onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Devise par défaut</Label>
              <Input className="bg-gray-800 border-gray-700 text-white" value={String(settings.defaultCurrency || 'MAD')} onChange={(e) => setSettings({ ...settings, defaultCurrency: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Heure backup auto</Label>
              <Input type="number" min={0} max={23} className="bg-gray-800 border-gray-700 text-white" value={Number(settings.autoBackupHour || 2)} onChange={(e) => setSettings({ ...settings, autoBackupHour: Number(e.target.value) })} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-gray-300">
            <input type="checkbox" checked={Boolean(settings.autoBackupEnabled)} onChange={(e) => setSettings({ ...settings, autoBackupEnabled: e.target.checked })} />
            Backup automatique quotidien
          </label>
          <label className="flex items-center gap-2 text-gray-300">
            <input type="checkbox" checked={Boolean(settings.maintenanceMode)} onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })} />
            Mode maintenance
          </label>
          <Button onClick={handleSave}>Enregistrer</Button>
        </CardContent>
      </Card>
    </div>
  );
}
