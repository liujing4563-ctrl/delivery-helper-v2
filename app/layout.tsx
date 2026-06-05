import type { Metadata, Viewport } from 'next';
import BottomNav from '@/components/BottomNav';
import Providers from '@/components/Providers';
import ServiceWorkerRegistrar from '@/components/ServiceWorkerRegistrar';
import './globals.css';

export const metadata: Metadata = {
  title: '骑手权益助手',
  description: '面向外卖骑手的工时薪资测算、法规查询、法援导航和 AI 权益信息问答平台',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '骑手权益',
  },
  openGraph: {
    title: '骑手权益助手',
    description: '面向外卖骑手的工时薪资测算、法规查询、法援导航和 AI 权益信息问答平台',
    type: 'website',
    locale: 'zh_CN',
  },
};

export const viewport: Viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="icon" href="/icons/icon-96x96.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.svg" />
      </head>
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <Providers>
          <main className="mx-auto max-w-lg pb-20">
            {children}
          </main>
          <BottomNav />
        </Providers>
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}