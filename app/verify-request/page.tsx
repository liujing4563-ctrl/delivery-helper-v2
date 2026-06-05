import Link from 'next/link';

export default function VerifyRequestPage() {
  return (
    <div className="px-4 pb-4 pt-6">
      <h1 className="text-xl font-bold text-gray-900">账号功能暂未启用</h1>
      <p className="mt-4 text-sm leading-6 text-gray-600">
        当前 MVP 阶段不发送登录邮件，也不启用真实账号系统。核心功能无需登录即可使用。
      </p>
      <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-800">
        如后续确需账号能力，会先补齐认证方案、隐私说明和账户删除能力，再开放入口。
      </div>
      <div className="mt-4 grid grid-cols-1 gap-3">
        <Link
          href="/calculator"
          className="rounded-lg bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white"
        >
          使用薪资测算
        </Link>
        <Link
          href="/"
          className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-center text-sm font-medium text-gray-700"
        >
          返回首页
        </Link>
      </div>
    </div>
  );
}
