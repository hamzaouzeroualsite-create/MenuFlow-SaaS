'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getUsers } from '@/lib/services/data';
import type { User } from '@/types';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => { getUsers().then(setUsers); }, []);

  const roleColor = (role: string) => {
    if (role === 'SUPER_ADMIN') return 'default';
    if (role === 'RESTAURANT_OWNER') return 'preparing';
    return 'secondary';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Utilisateurs</h1>
          <p className="text-gray-400 mt-1">Gérer les comptes propriétaires et employés</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700"><Plus className="w-4 h-4 mr-2" /> Créer un compte</Button>
      </div>

      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800 hover:bg-transparent">
                <TableHead className="text-gray-400">Nom</TableHead>
                <TableHead className="text-gray-400">Email</TableHead>
                <TableHead className="text-gray-400">Rôle</TableHead>
                <TableHead className="text-gray-400">Restaurant</TableHead>
                <TableHead className="text-gray-400">Statut</TableHead>
                <TableHead className="text-gray-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id} className="border-gray-800 hover:bg-gray-800/50">
                  <TableCell className="font-medium text-white">{u.name}</TableCell>
                  <TableCell className="text-gray-300">{u.email}</TableCell>
                  <TableCell><Badge variant={roleColor(u.role) as 'default'}>{u.role}</Badge></TableCell>
                  <TableCell className="text-gray-400">{u.restaurantId || '—'}</TableCell>
                  <TableCell><Badge variant={u.isActive ? 'default' : 'cancelled'}>{u.isActive ? 'Actif' : 'Inactif'}</Badge></TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" className="border-gray-700 text-gray-400 text-xs">Réinitialiser MDP</Button>
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
