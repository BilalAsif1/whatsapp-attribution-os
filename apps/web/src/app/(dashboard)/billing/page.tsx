'use client';

import { useSubscription } from '@hooks/use-api';
import { api } from '@lib/api';
import { useWorkspaceStore } from '@stores/workspace-store';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { Loading } from '@components/shared/loading';
import { Check } from 'lucide-react';
import { PLANS } from '@wao/shared';

export default function BillingPage() {
  const { data: subscription, isLoading } = useSubscription();
  const wsId = useWorkspaceStore((s) => s.currentWorkspaceId);

  if (isLoading) return <Loading />;

  const sub = subscription as any;

  async function handleUpgrade(planId: string) {
    const result = await api.post<{ url: string }>(`/api/v1/workspaces/${wsId}/billing/checkout`, { planId });
    if (result.url) window.location.href = result.url;
  }

  async function handleManage() {
    const result = await api.post<{ url: string }>(`/api/v1/workspaces/${wsId}/billing/portal`);
    if (result.url) window.location.href = result.url;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Billing</h1>
        <p className="text-muted-foreground">Manage your subscription and billing.</p>
      </div>

      {sub?.status === 'active' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Current Plan</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <span className="text-xl font-bold capitalize">{sub.plan}</span>
              <Badge variant="success" className="ml-3">Active</Badge>
            </div>
            <Button variant="outline" onClick={handleManage}>Manage Billing</Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {PLANS.map((plan) => (
          <Card key={plan.id} className={sub?.plan === plan.id ? 'ring-2 ring-brand-500' : ''}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>
                <span className="text-3xl font-bold">${plan.price}</span>/month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-brand-500" />
                    {f}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {sub?.plan === plan.id ? (
                <Button className="w-full" disabled>Current Plan</Button>
              ) : (
                <Button className="w-full" variant={plan.id === 'growth' ? 'default' : 'outline'} onClick={() => handleUpgrade(plan.id)}>
                  Upgrade to {plan.name}
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
