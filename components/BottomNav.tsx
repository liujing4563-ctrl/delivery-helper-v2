'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: '首页', href: '/', icon: 'home' },
  { label: '算薪', href: '/calculator', icon: 'calc' },
  { label: '法援', href: '/legal-aid', icon: 'phone' },
  { label: '法规', href: '/regulations', icon: 'book' },
  { label: '证据', href: '/evidence', icon: 'folder' },
] as const;

function NavIcon({ icon }: { icon: (typeof navItems)[number]['icon'] }) {
  if (icon === 'home') {
    return (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2z" strokeLinejoin="round" />
      </svg>
    );
  }
  if (icon === 'calc') {
    return (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M8 7h8M8 11h2M14 11h2M8 15h2M14 15h2" strokeLinecap="round" />
      </svg>
    );
  }
  if (icon === 'folder') {
    return (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M3 7h6l2 2h10v9a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3z" />
        <path d="M7 13h10" strokeLinecap="round" />
      </svg>
    );
  }
  if (icon === 'book') {
    return (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M5 4a3 3 0 0 1 3-2h11v18H8a3 3 0 0 0-3 2z" />
        <path d="M5 4v18" />
      </svg>
    );
  }
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7A2 2 0 0 1 22 16.9z" />
    </svg>
  );
}

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="移动端主导航"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#eadfce] bg-white safe-area-bottom md:hidden"
    >
      <div className="mx-auto flex max-w-lg items-center justify-around">
        {navItems.map((item) => {
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 text-xs transition-colors focus-visible:rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b7a3b] ${
                isActive ? 'font-semibold text-[#0b7a3b]' : 'text-[#667085] hover:text-[#0b7a3b]'
              }`}
            >
              <NavIcon icon={item.icon} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
