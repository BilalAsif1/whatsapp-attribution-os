'use client';

import { useState } from 'react';
import { useTrackingLinks, useCreateTrackingLink } from '@hooks/use-api';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@components/ui/table';
import { Badge } from '@components/ui/badge';
import { Loading } from '@components/shared/loading';
import { Plus, Copy, ExternalLink } from 'lucide-react';

export default function TrackingLinksPage() {
  const { data: links, isLoading } = useTrackingLinks();
  const createLink = useCreateTrackingLink();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [destinationUrl, setDestinationUrl] = useState('');

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    await createLink.mutateAsync({ name, destinationUrl });
    setName('');
    setDestinationUrl('');
    setShowForm(false);
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }

  if (isLoading) return <Loading />;

  const items = (links as any[]) ?? [];
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tracking Links</h1>
          <p className="text-muted-foreground">Create links that capture click data and redirect to WhatsApp.</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Link
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Create Tracking Link</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Summer Campaign CTA" required />
              </div>
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium">WhatsApp URL</label>
                <Input value={destinationUrl} onChange={(e) => setDestinationUrl(e.target.value)} placeholder="https://wa.me/1234567890" required />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={createLink.isPending}>
                  {createLink.isPending ? 'Creating...' : 'Create'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Short URL</TableHead>
              <TableHead>Clicks</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((link: any) => (
              <TableRow key={link.id}>
                <TableCell className="font-medium">{link.name}</TableCell>
                <TableCell>
                  <code className="rounded bg-gray-100 px-2 py-1 text-xs">{apiUrl}/t/{link.shortCode}</code>
                </TableCell>
                <TableCell>{link.clickCount}</TableCell>
                <TableCell>
                  <Badge variant={link.isActive ? 'success' : 'secondary'}>
                    {link.isActive ? 'Active' : 'Paused'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard(`${apiUrl}/t/${link.shortCode}`)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" asChild>
                      <a href={link.destinationUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-12">
                  No tracking links yet. Create your first one to start tracking.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
