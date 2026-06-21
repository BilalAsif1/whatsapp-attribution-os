'use client';

import { useCampaignStats } from '@hooks/use-api';
import { Card, CardHeader, CardTitle, CardContent } from '@components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@components/ui/table';
import { Loading } from '@components/shared/loading';
import { formatCurrency, formatNumber, formatPercent } from '@lib/utils';

export default function CampaignsPage() {
  const { data, isLoading } = useCampaignStats();

  if (isLoading) return <Loading />;

  const campaigns = (data as any[]) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Campaign Performance</h1>
        <p className="text-muted-foreground">See which campaigns, ad groups, and keywords drive real WhatsApp conversions.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">By Campaign</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead className="text-right">Conversations</TableHead>
                <TableHead className="text-right">Converted</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Conv. Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((c: any, i: number) => {
                const rate = c.totalConversations > 0 ? c.convertedCount / c.totalConversations : 0;
                return (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{c.campaign || 'Unknown'}</TableCell>
                    <TableCell className="capitalize">{c.adPlatform?.replace('_', ' ') ?? '—'}</TableCell>
                    <TableCell className="text-right">{formatNumber(c.totalConversations)}</TableCell>
                    <TableCell className="text-right">{formatNumber(c.convertedCount)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(Number(c.totalRevenue ?? 0))}</TableCell>
                    <TableCell className="text-right">{formatPercent(rate)}</TableCell>
                  </TableRow>
                );
              })}
              {campaigns.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                    No campaign data yet. Attribution records are created when WhatsApp messages match tracked clicks.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
