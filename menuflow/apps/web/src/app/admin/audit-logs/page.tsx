'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { getAuditLogs } from '@/lib/services/data';
import type { AuditLog } from '@/types';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => { getAuditLogs().then(setLogs); }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-0 divide-y divide-gray-800">
          {logs.map((log) => (
            <div key={log.id} className="p-4 flex items-start gap-4">
              <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white">
                  <span className="font-medium">{log.userName}</span>
                  <span className="text-gray-400"> — {log.action} </span>
                  <span className="text-emerald-400">{log.resource}</span>
                  {log.resourceId && <span className="text-gray-500"> ({log.resourceId})</span>}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(log.createdAt).toLocaleString('fr-FR')}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
