import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-6xl font-bold text-gray-300">404</p>
      <h1 className="mt-4 text-xl font-bold text-gray-900">页面不存在</h1>
      <p className="mt-2 text-sm text-gray-500">
        你访问的页面可能已被移除或地址有误。
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          href="/"
          className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
        >
          返回首页
        </Link>
        <Link
          href="/calculator"
          className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
        >
          薪资测算
        </Link>
      </div>
    </div>
  );
}
