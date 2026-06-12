'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: '首页', href: '/' },
  { label: '权益账本', href: '/calculator' },
  { label: '法援目录', href: '/legal-aid' },
  { label: '法规库', href: '/regulations' },
  { label: '证据清单', href: '/evidence' },
  { label: 'AI 辅助', href: '/chat' },
  { label: '权益动态', href: '/news' },
] as const;

function ShieldLogo() {
  return (
    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0b7a3b] text-white shadow-sm">
      <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M12 3 5 6v5c0 4.6 2.9 8.6 7 10 4.1-1.4 7-5.4 7-10V6z" strokeLinejoin="round" />
        <path d="m8.5 12 2.2 2.2 4.8-5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function SearchIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

export default function DesktopNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 hidden border-b border-[#eadfce] bg-white/95 backdrop-blur md:block">
      <div className="mx-auto flex h-20 w-[min(1440px,calc(100vw-48px))] items-center justify-between gap-8">
        <Link href="/" aria-label="返回首页" className="flex shrink-0 items-center gap-3">
          <ShieldLogo />
          <span>
            <span className="block text-xl font-bold leading-tight text-[#111827]">骑手权益助手</span>
            <span className="mt-1 block text-xs text-[#667085]">核验数据 · 维权材料 · 默认不保存</span>
          </span>
        </Link>

        <nav className="flex min-w-0 flex-1 items-center justify-center gap-6" aria-label="桌面主导航">
          {navItems.map((item) => {
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={`relative py-7 text-base font-bold transition-colors ${
                  isActive ? 'text-[#0b7a3b]' : 'text-[#111827] hover:text-[#0b7a3b]'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 h-1 w-9 -translate-x-1/2 rounded-full bg-[#0b7a3b]" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-4">
          <form action="/regulations" className="relative">
            <input
              name="q"
              type="search"
              placeholder="搜索问题、法规或关键词"
              className="h-11 w-64 rounded-xl border border-[#d8dee8] bg-white pl-4 pr-11 text-sm outline-none transition focus:border-[#0b7a3b] focus:ring-2 focus:ring-[#dff4e8]"
            />
            <button
              type="submit"
              aria-label="搜索"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#667085]"
            >
              <SearchIcon />
            </button>
          </form>
          <a
            href="tel:12348"
            className="inline-flex h-11 items-center rounded-xl bg-[#0b7a3b] px-5 text-sm font-bold text-white shadow-lg shadow-[#0b7a3b]/20"
          >
            拨打 12348
          </a>
        </div>
      </div>
    </header>
  );
}
