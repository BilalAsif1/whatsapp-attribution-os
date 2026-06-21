import { Card, CardContent } from '@components/ui/card';
import { cn } from '@lib/utils';
import { type LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: LucideIcon;
}

export function StatCard({ title, value, change, trend = 'neutral', icon: Icon }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="mt-1 text-2xl font-bold">{value}</p>
            {change && (
              <p className={cn('mt-1 text-xs font-medium', {
                'text-green-600': trend === 'up',
                'text-red-600': trend === 'down',
                'text-gray-500': trend === 'neutral',
              })}>
                {change}
              </p>
            )}
          </div>
          <div className="rounded-lg bg-brand-50 p-3">
            <Icon className="h-6 w-6 text-brand-500" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
