'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';

interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId?: string;
  ipAddress?: string;
  createdAt: string;
  user?: { name: string; email: string; role: string };
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    api.get<AuditLog[]>('/api/admin/audit-logs').then(setLogs).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
        <p className="text-gray-400">Historique de toutes les actions sur la plateforme</p>
      </div>

      <div className="space-y-2">
        {logs.map((log) => (
          <Card key={log.id} className="bg-gray-900 border-gray-800">
            <CardContent className="p-4 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-xs font-mono bg-emerald-900/50 text-emerald-400">{log.action}</span>
                  <span className="text-sm text-gray-400">{log.entity}{log.entityId ? ` #${log.entityId.slice(0, 8)}` : ''}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {log.user ? `${log.user.name} (${log.user.role})` : 'Système'} &middot; {log.ipAddress || '—'}
                </p>
              </div>
              <span className="text-xs text-gray-600">{formatDate(log.createdAt)}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
