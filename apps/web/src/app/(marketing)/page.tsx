import Link from 'next/link';
import { Zap, Check, ArrowRight, BarChart3, Link2, MessageSquare } from 'lucide-react';
import { PLANS } from '@wao/shared';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Nav */}
      <header className="flex h-16 items-center justify-between border-b px-6 lg:px-12">
        <div className="flex items-center gap-2">
          <Zap className="h-7 w-7 text-brand-500" />
          <span className="text-xl font-bold">WhatsApp Attribution OS</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-gray-900">Sign In</Link>
          <Link href="/register" className="inline-flex items-center rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600">
            Get Started Free
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center px-6 pt-20 pb-16 text-center lg:px-12">
        <div className="inline-flex items-center rounded-full border bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700 mb-6">
          Finally — real WhatsApp conversion tracking
        </div>
        <h1 className="max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl">
          Track every WhatsApp conversation back to the <span className="text-brand-500">ad click</span> that started it
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-gray-600">
          WhatsApp Attribution OS captures GCLIDs and UTM parameters, injects a unique tracking ID into WhatsApp messages,
          and uploads offline conversions to Google Ads — automatically.
        </p>
        <div className="mt-10 flex gap-4">
          <Link href="/register" className="inline-flex items-center gap-2 rounded-md bg-brand-500 px-6 py-3 text-lg font-medium text-white hover:bg-brand-600">
            Start Free Trial <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t bg-gray-50 px-6 py-20 lg:px-12">
        <h2 className="text-center text-3xl font-bold">How It Works</h2>
        <div className="mx-auto mt-12 grid max-w-5xl gap-8 md:grid-cols-3">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-brand-600">
              <Link2 className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">1. Capture the Click</h3>
            <p className="mt-2 text-gray-600">Our tracking script captures GCLID, UTM params, and generates a unique UID like WAO-7X3K9.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-brand-600">
              <MessageSquare className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">2. Match the Message</h3>
            <p className="mt-2 text-gray-600">The UID is injected into WhatsApp&apos;s pre-filled message. When the user sends it, our webhook matches the conversation to the click.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-brand-600">
              <BarChart3 className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">3. Upload the Conversion</h3>
            <p className="mt-2 text-gray-600">Offline conversions are uploaded to Google Ads with the GCLID, so your campaigns optimize for real revenue.</p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 py-20 lg:px-12">
        <h2 className="text-center text-3xl font-bold">Simple Pricing</h2>
        <p className="mt-4 text-center text-gray-600">Start free. Scale when you&apos;re ready.</p>
        <div className="mx-auto mt-12 grid max-w-5xl gap-8 md:grid-cols-3">
          {PLANS.map((plan) => (
            <div key={plan.id} className={`rounded-xl border p-8 ${plan.id === 'growth' ? 'border-brand-500 ring-2 ring-brand-500' : ''}`}>
              <h3 className="text-xl font-bold">{plan.name}</h3>
              <p className="mt-2"><span className="text-4xl font-bold">${plan.price}</span><span className="text-gray-500">/mo</span></p>
              <ul className="mt-6 space-y-3">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <Check className="h-4 w-4 text-brand-500" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/register" className={`mt-8 block w-full rounded-md py-3 text-center text-sm font-medium ${plan.id === 'growth' ? 'bg-brand-500 text-white hover:bg-brand-600' : 'border text-gray-700 hover:bg-gray-50'}`}>
                Get Started
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-6 py-8 text-center text-sm text-gray-500 lg:px-12">
        <p>&copy; {new Date().getFullYear()} WhatsApp Attribution OS. All rights reserved.</p>
      </footer>
    </div>
  );
}
