import Link from 'next/link';
import DeleteAccountButton from './DeleteAccountButton';

export default function DeleteAccountPage() {
  return (
    <div className="px-4 pb-4 pt-6">
      <h1 className="text-xl font-bold text-gray-900">清除本地数据</h1>
      <p className="mt-1 text-sm text-gray-500">
        MVP 阶段暂不启用真实账号系统
      </p>

      <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
        <h2 className="text-sm font-semibold text-amber-900">将清除哪些内容？</h2>
        <ul className="mt-2 list-inside list-disc space-y-0.5 text-sm leading-6 text-amber-800">
          <li>当前浏览器保存的薪资计算器输入</li>
          <li>当前浏览器保存的其他本地偏好</li>
        </ul>
        <p className="mt-2 text-sm leading-6 text-amber-800">
          当前没有服务端账户或业务数据库，因此无需删除服务端账户记录。
        </p>
      </div>

      <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-800">
        <p className="font-medium">数据保留说明</p>
        <p className="mt-1">
          薪资计算器输入只保存在当前浏览器的本地存储中，不会上传到服务器。
          清除后如需重新测算，请再次填写表单。
        </p>
      </div>

      <div className="mt-4 space-y-3">
        <DeleteAccountButton />
        <Link
          href="/account"
          className="block w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-center text-sm font-medium text-gray-700"
        >
          返回账户页
        </Link>
      </div>
    </div>
  );
}
