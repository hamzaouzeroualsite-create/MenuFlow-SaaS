'use client';

import { useEffect, useState } from 'react';
import { Key, UserX, UserCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  restaurant?: { name: string; status: string };
  lastLoginAt?: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const params = search ? `?search=${search}` : '';
    api.get<User[]>(`/api/admin/users${params}`).then(setUsers).catch(console.error);
  }, [search]);

  const resetPassword = async (id: string, email: string) => {
    const pwd = prompt(`Nouveau mot de passe pour ${email}:`);
    if (!pwd || pwd.length < 8) return;
    await api.post(`/api/admin/users/${id}/reset-password`, { newPassword: pwd });
    alert('Mot de passe réinitialisé');
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    await api.patch(`/api/admin/users/${id}/toggle-active`, { isActive: !isActive });
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, isActive: !isActive } : u));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Gestion Utilisateurs</h1>
        <p className="text-gray-400">Propriétaires, managers et employés</p>
      </div>

      <Input placeholder="Rechercher..." className="max-w-md bg-gray-900 border-gray-700 text-white" value={search} onChange={(e) => setSearch(e.target.value)} />

      <div className="space-y-3">
        {users.map((user) => (
          <Card key={user.id} className="bg-gray-900 border-gray-800">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-white">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email} &middot; {user.role} &middot; {user.restaurant?.name || '—'}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="gap-1 border-gray-700" onClick={() => resetPassword(user.id, user.email)}>
                  <Key className="w-3 h-3" /> Reset MDP
                </Button>
                <Button size="sm" variant="outline" className={`gap-1 ${user.isActive ? 'border-red-800 text-red-400' : 'border-emerald-800 text-emerald-400'}`} onClick={() => toggleActive(user.id, user.isActive)}>
                  {user.isActive ? <UserX className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                  {user.isActive ? 'Désactiver' : 'Activer'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
