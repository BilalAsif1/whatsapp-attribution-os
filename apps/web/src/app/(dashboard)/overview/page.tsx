'use client';

import { useDashboardOverview, useDashboardFunnel, useDashboardTimeseries } from '@hooks/use-api';
import { StatCard } from '@components/shared/stat-card';
import { Loading } from '@components/shared/loading';
import { Card, CardHeader, CardTitle, CardContent } from '@components/ui/card';
import { formatCurrency, formatNumber, formatPercent } from '@lib/utils';
import { MousePointer, MessageSquare, TrendingUp, DollarSign } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function OverviewPage() {
  const { data: overview, isLoading: loadingOverview } = useDashboardOverview();
  const { data: funnel, isLoading: loadingFunnel } = useDashboardFunnel();
  const { data: timeseries, isLoading: loadingTimeseries } = useDashboardTimeseries();

  if (loadingOverview) return <Loading />;

  const stats = overview as any;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Your WhatsApp attribution performance at a glance.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Clicks" value={formatNumber(stats?.totalClicks ?? 0)} icon={MousePointer} />
        <StatCard title="Conversations" value={formatNumber(stats?.totalConversations ?? 0)} icon={MessageSquare} />
        <StatCard title="Conversion Rate" value={formatPercent(stats?.conversionRate ?? 0)} icon={TrendingUp} trend="up" />
        <StatCard title="Revenue" value={formatCurrency(stats?.totalRevenue ?? 0)} icon={DollarSign} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Clicks Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingTimeseries ? (
              <Loading />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={(timeseries as any[]) ?? []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="clicks" stroke="#25d366" fill="#25d36620" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Conversion Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingFunnel ? (
              <Loading />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={(funnel as any[]) ?? []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis dataKey="status" type="category" tick={{ fontSize: 12 }} width={100} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#25d366" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
