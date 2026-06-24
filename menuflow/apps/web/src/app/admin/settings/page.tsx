'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Paramètres Plateforme</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader><CardTitle className="text-white text-base">Configuration générale</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label className="text-gray-400">Nom de la plateforme</Label><Input defaultValue="MenuFlow" className="mt-1 bg-gray-800 border-gray-700 text-white" /></div>
            <div><Label className="text-gray-400">Email support</Label><Input defaultValue="support@menuflow.ma" className="mt-1 bg-gray-800 border-gray-700 text-white" /></div>
            <Button className="bg-emerald-600 hover:bg-emerald-700">Enregistrer</Button>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader><CardTitle className="text-white text-base">Firebase</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-400">
            <p>Projet: {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'Non configuré (mode démo)'}</p>
            <p>Hosting: Firebase Hosting</p>
            <p>Functions: Cloud Functions v2</p>
            <p>FCM: Activé</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
