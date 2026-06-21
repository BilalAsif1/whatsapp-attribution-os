'use client';

import { useState } from 'react';
import { useWorkspaceStore } from '@stores/workspace-store';
import { api } from '@lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Badge } from '@components/ui/badge';

export default function SettingsPage() {
  const wsId = useWorkspaceStore((s) => s.currentWorkspaceId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your workspace, integrations, and tracking script.</p>
      </div>

      <TrackingScriptCard workspaceId={wsId} />
      <WhatsAppConnectionCard workspaceId={wsId} />
      <GoogleAdsConnectionCard workspaceId={wsId} />
    </div>
  );
}

function TrackingScriptCard({ workspaceId }: { workspaceId: string | null }) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const snippet = `<script src="${apiUrl}/api/v1/script/${workspaceId}" async></script>`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Tracking Script</CardTitle>
        <CardDescription>Add this script to your landing pages to capture click data and inject tracking UIDs into WhatsApp links.</CardDescription>
      </CardHeader>
      <CardContent>
        <pre className="rounded-lg bg-gray-900 p-4 text-sm text-green-400 overflow-x-auto">{snippet}</pre>
        <Button className="mt-4" variant="outline" onClick={() => navigator.clipboard.writeText(snippet)}>
          Copy Snippet
        </Button>
      </CardContent>
    </Card>
  );
}

function WhatsAppConnectionCard({ workspaceId }: { workspaceId: string | null }) {
  const [phoneNumberId, setPhoneNumberId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleConnect(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await api.post(`/api/v1/workspaces/${workspaceId}/whatsapp/accounts`, {
      phoneNumberId,
      phoneNumber: '',
      wabaId: '',
      accessToken,
    });
    setPhoneNumberId('');
    setAccessToken('');
    setLoading(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">WhatsApp Business API</CardTitle>
        <CardDescription>Connect your WhatsApp Cloud API phone number to receive webhook events.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleConnect} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number ID</label>
              <Input value={phoneNumberId} onChange={(e) => setPhoneNumberId(e.target.value)} placeholder="From Meta Business Settings" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Access Token</label>
              <Input type="password" value={accessToken} onChange={(e) => setAccessToken(e.target.value)} placeholder="Permanent access token" required />
            </div>
          </div>
          <Button type="submit" disabled={loading}>{loading ? 'Connecting...' : 'Connect WhatsApp'}</Button>
        </form>
      </CardContent>
    </Card>
  );
}

function GoogleAdsConnectionCard({ workspaceId }: { workspaceId: string | null }) {
  const [connecting, setConnecting] = useState(false);

  async function handleConnect() {
    setConnecting(true);
    const result = await api.get<{ url: string }>(`/api/v1/workspaces/${workspaceId}/integrations/google-ads/auth-url`);
    if (result.url) window.location.href = result.url;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Google Ads</CardTitle>
        <CardDescription>Connect Google Ads to upload offline conversions automatically.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleConnect} disabled={connecting}>
          {connecting ? 'Redirecting...' : 'Connect Google Ads'}
        </Button>
      </CardContent>
    </Card>
  );
}
