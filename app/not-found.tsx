import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-6xl font-bold text-[#E5E1DB]">404</p>
      <h1 className="mt-4 text-xl font-bold text-[#1A1A1A]">页面不存在</h1>
      <p className="mt-2 text-sm text-[#6B6560]">
        你访问的页面可能已被移除或地址有误。
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          href="/"
          className="rounded-xl bg-[#D97706] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#B45309]"
        >
          返回首页
        </Link>
        <Link
          href="/calculator"
          className="rounded-xl border border-[#EDE9E3] px-5 py-2.5 text-sm font-medium text-[#6B6560] transition-colors hover:bg-[#F5F3F0]"
        >
          薪资测算
        </Link>
      </div>
    </div>
  );
}
