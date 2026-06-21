'use client';

import { useState } from 'react';
import { useConversations } from '@hooks/use-api';
import { Card } from '@components/ui/card';
import { Badge } from '@components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@components/ui/table';
import { Loading } from '@components/shared/loading';
import { formatCurrency } from '@lib/utils';
import { CONVERSATION_STATUSES } from '@wao/shared';

const statusColors: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'destructive'> = {
  new: 'secondary',
  engaged: 'default',
  qualified: 'warning',
  converted: 'success',
  lost: 'destructive',
};

export default function ConversationsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const params: Record<string, string> = {};
  if (statusFilter) params.status = statusFilter;

  const { data, isLoading } = useConversations(params);

  if (isLoading) return <Loading />;

  const conversations = (data as any[]) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Conversations</h1>
        <p className="text-muted-foreground">WhatsApp conversations matched to ad clicks.</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setStatusFilter('')}
          className={`rounded-full px-3 py-1 text-sm font-medium ${!statusFilter ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          All
        </button>
        {CONVERSATION_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-full px-3 py-1 text-sm font-medium capitalize ${statusFilter === s ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {s}
          </button>
        ))}
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>UID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Messages</TableHead>
              <TableHead>Revenue</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {conversations.map((c: any) => (
              <TableRow key={c.id}>
                <TableCell className="font-mono text-sm">{c.uid}</TableCell>
                <TableCell>
                  <Badge variant={statusColors[c.status] ?? 'secondary'} className="capitalize">
                    {c.status}
                  </Badge>
                </TableCell>
                <TableCell>{c.messageCount}</TableCell>
                <TableCell>{c.revenue ? formatCurrency(Number(c.revenue)) : '—'}</TableCell>
                <TableCell className="capitalize">{c.attribution?.adPlatform?.replace('_', ' ') ?? '—'}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(c.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
            {conversations.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                  No conversations yet. Once your WhatsApp webhook receives messages with tracking UIDs, they will appear here.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
