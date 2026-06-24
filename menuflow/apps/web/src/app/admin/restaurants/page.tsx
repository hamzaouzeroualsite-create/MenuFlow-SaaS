'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, MoreHorizontal, Building2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getRestaurants } from '@/lib/services/data';
import type { Restaurant } from '@/types';

export default function AdminRestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => { getRestaurants().then(setRestaurants); }, []);

  const filtered = restaurants.filter((r) => {
    if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter !== 'all' && r.status !== filter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Restaurants</h1>
          <p className="text-gray-400 mt-1">{restaurants.length} restaurants enregistrés</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700"><Plus className="w-4 h-4 mr-2" /> Créer un restaurant</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-gray-900 border-gray-700 text-white" />
        </div>
        <div className="flex gap-2">
          {['all', 'ACTIVE', 'SUSPENDED', 'INACTIVE'].map((f) => (
            <Button key={f} size="sm" variant={filter === f ? 'default' : 'outline'} onClick={() => setFilter(f)} className={filter === f ? 'bg-emerald-600' : 'border-gray-700 text-gray-400'}>
              {f === 'all' ? 'Tous' : f}
            </Button>
          ))}
        </div>
      </div>

      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800 hover:bg-transparent">
                <TableHead className="text-gray-400">Restaurant</TableHead>
                <TableHead className="text-gray-400">Ville</TableHead>
                <TableHead className="text-gray-400">Plan</TableHead>
                <TableHead className="text-gray-400">Statut</TableHead>
                <TableHead className="text-gray-400">Expiration</TableHead>
                <TableHead className="text-gray-400"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id} className="border-gray-800 hover:bg-gray-800/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-600/20 flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{r.name}</p>
                        <p className="text-xs text-gray-500">{r.slug}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-300">{r.city || '—'}</TableCell>
                  <TableCell><Badge>{r.subscriptionPlan}</Badge></TableCell>
                  <TableCell>
                    <Badge variant={r.status === 'ACTIVE' ? 'default' : 'cancelled'}>{r.status}</Badge>
                  </TableCell>
                  <TableCell className="text-gray-400 text-sm">
                    {r.subscriptionExpiresAt ? new Date(r.subscriptionExpiresAt).toLocaleDateString('fr-FR') : '—'}
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost" className="text-gray-400"><MoreHorizontal className="w-4 h-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
