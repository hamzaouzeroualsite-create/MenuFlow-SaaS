'use client';

import { useEffect, useState } from 'react';
import {
  Plus, Search, PauseCircle, CheckCircle, Trash2, Eye, LogIn, MoreHorizontal,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  city?: string;
  status: string;
  subscriptionPlan: string;
  createdAt: string;
  _count?: { orders: number; products: number; users: number };
  users?: { id: string; name: string; email: string }[];
}

export default function AdminRestaurantsPage() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: '', city: '', ownerName: '', ownerEmail: '', ownerPassword: '', subscriptionPlan: 'FREE',
  });

  const fetchRestaurants = () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (cityFilter) params.set('city', cityFilter);
    if (statusFilter) params.set('status', statusFilter);
    api.get<Restaurant[]>(`/api/admin/restaurants?${params}`)
      .then(setRestaurants)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRestaurants(); }, [search, cityFilter, statusFilter]);

  const handleCreate = async () => {
    try {
      await api.post('/api/admin/restaurants', form);
      setShowCreate(false);
      setForm({ name: '', city: '', ownerName: '', ownerEmail: '', ownerPassword: '', subscriptionPlan: 'FREE' });
      fetchRestaurants();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleSuspend = async (id: string) => {
    const reason = prompt('Raison de la suspension (optionnel):');
    await api.post(`/api/admin/restaurants/${id}/suspend`, { reason });
    fetchRestaurants();
  };

  const handleActivate = async (id: string) => {
    await api.post(`/api/admin/restaurants/${id}/activate`);
    fetchRestaurants();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Supprimer définitivement "${name}" ?`)) return;
    await api.delete(`/api/admin/restaurants/${id}`);
    fetchRestaurants();
  };

  const handleImpersonate = async (id: string) => {
    try {
      const result = await api.post<{
        accessToken: string; refreshToken: string;
        user: Parameters<typeof setAuth>[0];
      }>(`/api/admin/restaurants/${id}/impersonate`);
      setAuth(result.user, result.accessToken, result.refreshToken);
      window.open('/dashboard', '_blank');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestion Restaurants</h1>
          <p className="text-gray-400">{restaurants.length} restaurants</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Créer restaurant
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            placeholder="Rechercher..."
            className="pl-10 bg-gray-900 border-gray-700 text-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Input placeholder="Ville" className="w-40 bg-gray-900 border-gray-700 text-white" value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} />
        <select className="px-3 rounded-lg bg-gray-900 border border-gray-700 text-white text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">Tous statuts</option>
          <option value="ACTIVE">Actif</option>
          <option value="SUSPENDED">Suspendu</option>
        </select>
      </div>

      {showCreate && (
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white">Nouveau restaurant</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Input placeholder="Nom du restaurant *" className="bg-gray-800 border-gray-700 text-white" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input placeholder="Ville" className="bg-gray-800 border-gray-700 text-white" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              <Input placeholder="Nom propriétaire *" className="bg-gray-800 border-gray-700 text-white" value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} />
              <Input placeholder="Email propriétaire *" className="bg-gray-800 border-gray-700 text-white" value={form.ownerEmail} onChange={(e) => setForm({ ...form, ownerEmail: e.target.value })} />
              <Input placeholder="Mot de passe *" type="password" className="bg-gray-800 border-gray-700 text-white" value={form.ownerPassword} onChange={(e) => setForm({ ...form, ownerPassword: e.target.value })} />
              <select className="px-3 rounded-lg bg-gray-800 border border-gray-700 text-white" value={form.subscriptionPlan} onChange={(e) => setForm({ ...form, subscriptionPlan: e.target.value })}>
                <option value="FREE">Gratuit</option>
                <option value="STARTER">Starter</option>
                <option value="PREMIUM">Premium</option>
                <option value="ENTERPRISE">Enterprise</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate}>Créer</Button>
              <Button variant="outline" onClick={() => setShowCreate(false)}>Annuler</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" /></div>
      ) : (
        <div className="space-y-3">
          {restaurants.map((r) => (
            <Card key={r.id} className="bg-gray-900 border-gray-800">
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white">{r.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.status === 'ACTIVE' ? 'bg-emerald-900/50 text-emerald-400' : 'bg-red-900/50 text-red-400'}`}>
                      {r.status === 'ACTIVE' ? 'Actif' : 'Suspendu'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs bg-gray-800 text-gray-400">{r.subscriptionPlan}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {r.city || '—'} &middot; {r.users?.[0]?.email || '—'} &middot; {r._count?.orders || 0} commandes
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" className="gap-1 border-gray-700 text-gray-300" onClick={() => handleImpersonate(r.id)}>
                    <LogIn className="w-3 h-3" /> Connexion
                  </Button>
                  {r.status === 'ACTIVE' ? (
                    <Button size="sm" variant="outline" className="gap-1 border-orange-800 text-orange-400" onClick={() => handleSuspend(r.id)}>
                      <PauseCircle className="w-3 h-3" /> Suspendre
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" className="gap-1 border-emerald-800 text-emerald-400" onClick={() => handleActivate(r.id)}>
                      <CheckCircle className="w-3 h-3" /> Activer
                    </Button>
                  )}
                  <Button size="sm" variant="destructive" className="gap-1" onClick={() => handleDelete(r.id, r.name)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
