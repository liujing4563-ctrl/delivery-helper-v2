import Link from 'next/link';

export default function OfflinePage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div aria-hidden="true" className="text-6xl">
        📡
      </div>
      <h1 className="mt-4 text-xl font-bold text-[#1A1A1A]">当前无网络连接</h1>
      <p className="mt-2 max-w-md text-sm leading-6 text-[#6B6560]">
        请检查网络设置后重试。部分已缓存的页面仍可使用，但数据可能已过期。
        联网后请以页面来源链接为准。
      </p>
      <div className="mt-6 space-y-3">
        <Link
          href="/"
          className="block rounded-lg bg-[#D97706] px-6 py-3 text-sm font-semibold text-white"
        >
          返回首页
        </Link>
        <Link
          href="/calculator"
          className="block rounded-lg border border-[#EDE9E3] bg-white px-6 py-3 text-sm font-medium text-[#6B6560]"
        >
          薪资计算器（离线可用）
        </Link>
        <Link
          href="/regulations"
          className="block rounded-lg border border-[#EDE9E3] bg-white px-6 py-3 text-sm font-medium text-[#6B6560]"
        >
          法规库（缓存后可读）
        </Link>
        <Link
          href="/legal-aid"
          className="block rounded-lg border border-[#EDE9E3] bg-white px-6 py-3 text-sm font-medium text-[#6B6560]"
        >
          法援目录（缓存后可读）
        </Link>
      </div>
      <p className="mt-6 text-xs text-[#B0AAA3]">
        骑手权益助手 · 公益项目
      </p>
    </div>
  );
}
