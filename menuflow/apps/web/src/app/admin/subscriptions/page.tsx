'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getAllSubscriptions } from '@/lib/services/data';
import { formatCurrency } from '@/lib/utils';
import type { Subscription } from '@/types';

export default function AdminSubscriptionsPage() {
  const [subs, setSubs] = useState<Subscription[]>([]);

  useEffect(() => { getAllSubscriptions().then(setSubs); }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Abonnements</h1>
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800 hover:bg-transparent">
                <TableHead className="text-gray-400">Restaurant</TableHead>
                <TableHead className="text-gray-400">Plan</TableHead>
                <TableHead className="text-gray-400">Statut</TableHead>
                <TableHead className="text-gray-400">Montant</TableHead>
                <TableHead className="text-gray-400">Début</TableHead>
                <TableHead className="text-gray-400">Fin</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subs.map((s) => (
                <TableRow key={s.id} className="border-gray-800 hover:bg-gray-800/50">
                  <TableCell className="text-white">{s.restaurantId}</TableCell>
                  <TableCell><Badge>{s.plan}</Badge></TableCell>
                  <TableCell><Badge variant={s.status === 'ACTIVE' ? 'default' : 'cancelled'}>{s.status}</Badge></TableCell>
                  <TableCell className="text-emerald-400">{formatCurrency(s.amount)}/mois</TableCell>
                  <TableCell className="text-gray-400">{new Date(s.startDate).toLocaleDateString('fr-FR')}</TableCell>
                  <TableCell className="text-gray-400">{new Date(s.endDate).toLocaleDateString('fr-FR')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
