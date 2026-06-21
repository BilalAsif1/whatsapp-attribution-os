import { Zap } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 lg:flex-col lg:justify-center lg:bg-brand-500 lg:px-12">
        <Zap className="h-12 w-12 text-white" />
        <h1 className="mt-6 text-4xl font-bold text-white">WhatsApp Attribution OS</h1>
        <p className="mt-4 text-lg text-brand-100">
          Track every WhatsApp conversation back to the exact ad click, keyword, and campaign that started it.
        </p>
      </div>
      <div className="flex w-full items-center justify-center px-4 lg:w-1/2">{children}</div>
    </div>
  );
}
