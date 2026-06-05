import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="px-4 pb-4 pt-6">
      <h1 className="text-xl font-bold text-gray-900">账号功能说明</h1>
      <p className="mt-1 text-sm text-gray-500">
        MVP 阶段暂不启用真实登录或注册
      </p>

      <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-800">
        薪资测算、法规库、法援目录和 AI 权益信息助手都可以直接使用。当前不收集邮箱、手机号、密码或身份材料。
      </div>

      <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="text-base font-semibold text-gray-900">为什么暂不做账号？</h2>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm leading-6 text-gray-600">
          <li>减少不必要的个人信息收集</li>
          <li>避免保存聊天记录、计算结果等敏感内容</li>
          <li>先保证核心工具和官方来源数据可信</li>
        </ul>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3">
        <Link
          href="/calculator"
          className="rounded-lg bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white"
        >
          直接使用薪资测算
        </Link>
        <Link
          href="/chat"
          className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-center text-sm font-medium text-gray-700"
        >
          咨询 AI 权益信息助手
        </Link>
        <Link
          href="/privacy"
          className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-center text-sm font-medium text-gray-700"
        >
          查看隐私说明
        </Link>
      </div>
    </div>
  );
}
