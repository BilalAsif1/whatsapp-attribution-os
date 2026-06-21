import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@lib/api';
import { useWorkspaceStore } from '@stores/workspace-store';

function wsPath(path: string) {
  const wsId = useWorkspaceStore.getState().currentWorkspaceId;
  return `/api/v1/workspaces/${wsId}${path}`;
}

export function useDashboardOverview() {
  return useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: () => api.get(wsPath('/dashboard/overview')),
  });
}

export function useDashboardFunnel() {
  return useQuery({
    queryKey: ['dashboard', 'funnel'],
    queryFn: () => api.get(wsPath('/dashboard/funnel')),
  });
}

export function useDashboardTimeseries(granularity = 'day') {
  return useQuery({
    queryKey: ['dashboard', 'timeseries', granularity],
    queryFn: () => api.get(wsPath('/dashboard/timeseries'), { granularity }),
  });
}

export function useConversations(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['conversations', params],
    queryFn: () => api.get(wsPath('/conversations'), params),
  });
}

export function useConversation(id: string) {
  return useQuery({
    queryKey: ['conversation', id],
    queryFn: () => api.get(wsPath(`/conversations/${id}`)),
    enabled: !!id,
  });
}

export function useTrackingLinks() {
  return useQuery({
    queryKey: ['tracking-links'],
    queryFn: () => api.get(wsPath('/tracking/links')),
  });
}

export function useCreateTrackingLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; destinationUrl: string }) =>
      api.post(wsPath('/tracking/links'), data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tracking-links'] }),
  });
}

export function useCampaignStats() {
  return useQuery({
    queryKey: ['campaigns'],
    queryFn: () => api.get(wsPath('/attribution/campaigns')),
  });
}

export function useSubscription() {
  return useQuery({
    queryKey: ['subscription'],
    queryFn: () => api.get(wsPath('/billing/subscription')),
  });
}
