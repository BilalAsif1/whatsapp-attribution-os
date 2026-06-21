'use client';

import { useSession } from '@lib/auth-client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Sidebar } from '@components/layout/sidebar';
import { Header } from '@components/layout/header';
import { PageLoading } from '@components/shared/loading';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/login');
    }
  }, [session, isPending, router]);

  if (isPending) return <PageLoading />;
  if (!session) return null;

  return (
    <div>
      <Sidebar />
      <div className="lg:pl-64">
        <Header />
        <main className="py-8 px-4 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
