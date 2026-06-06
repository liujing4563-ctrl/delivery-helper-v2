import type { Metadata, Viewport } from 'next';
import BottomNav from '@/components/BottomNav';
import DesktopNav from '@/components/DesktopNav';
import AxeDevTools from '@/components/AxeDevTools';
import NativeBridge from '@/components/NativeBridge';
import OfflineDataNotice from '@/components/OfflineDataNotice';
import ServiceWorkerRegistrar from '@/components/ServiceWorkerRegistrar';
import { SITE_URL } from '@/lib/site';
import './globals.css';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: '骑手权益助手',
  url: SITE_URL,
  description: '面向外卖骑手的工时薪资测算、法规查询、法援导航和AI权益信息问答平台',
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+86-12348',
    contactType: 'legal aid hotline',
    availableLanguage: 'Chinese',
  },
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: '骑手权益助手',
    template: '%s - 骑手权益助手',
  },
  description: '面向外卖骑手的工时薪资测算、法规查询、法援导航和 AI 权益信息问答平台，帮助骑手了解自己的劳动权益。',
  keywords: ['外卖骑手', '劳动权益', '工资计算', '法律援助', '最低工资', '骑手保障'],
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
        <link rel="icon" href="/icons/icon-32x32.png" type="image/png" />
        <link rel="icon" href="/icons/icon-96x96.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/icon-180x180.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg"
        >
          跳转至主内容
        </a>
        <AxeDevTools />
        <NativeBridge />
        <DesktopNav />
        <OfflineDataNotice />
        <main id="main-content" className="mx-auto max-w-lg pb-20 md:max-w-6xl md:px-6 md:pb-10">
          {children}
        </main>
        <BottomNav />
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
