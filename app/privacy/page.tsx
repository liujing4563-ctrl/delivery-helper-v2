export default function PrivacyPage() {
  return (
    <div className="px-4 pb-4 pt-6">
      <h1 className="text-xl font-bold text-gray-900">隐私说明</h1>

      <div className="mt-4 space-y-4 text-sm leading-relaxed text-gray-700">
        <section>
          <h2 className="font-semibold text-gray-900">1. 我们收集什么</h2>
          <p className="mt-1">
            当前 MVP 阶段不启用真实账号系统，不收集邮箱、手机号、密码或身份材料。
          </p>
          <p className="mt-1">
            薪资计算器、法规库、法援目录和 AI 助手无需登录即可使用。我们不保存聊天记录和计算结果到服务器。
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-900">2. 本地存储</h2>
          <p className="mt-1">
            薪资计算器可能使用浏览器 localStorage 保存上次输入，方便你下次继续填写。这些数据只存在于当前浏览器，不会上传到服务器。
          </p>
          <p className="mt-1">
            你可以在「我的」页面清除本地计算器输入，也可以通过浏览器设置清除站点数据。
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-900">3. AI 助手</h2>
          <p className="mt-1">
            配置 AI API 密钥时，AI 权益信息助手会调用外部 AI 模型服务处理你的问题；未配置时使用本地占位回复，不调用外部服务。
          </p>
          <p className="mt-1">
            无论何种模式，本站不把对话记录保存到服务器。请避免输入身份证、银行卡、平台账号密码、医疗记录等敏感信息。
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-900">4. 敏感数据</h2>
          <p className="mt-1">本站不会要求你上传或填写以下敏感信息：</p>
          <ul className="mt-1 list-inside list-disc space-y-0.5 text-gray-600">
            <li>身份证号码</li>
            <li>合同或协议文件</li>
            <li>医疗记录或病历</li>
            <li>银行账户信息</li>
            <li>平台账号密码</li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold text-gray-900">5. 数据删除</h2>
          <p className="mt-1">
            当前没有服务端账户或业务数据库，因此无需删除服务端账户记录。你可以随时清除当前浏览器保存的本地数据。
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-900">6. 联系方式</h2>
          <p className="mt-1">
            如对本隐私说明有疑问，请通过项目 GitHub 仓库的 Issues 联系我们。
          </p>
        </section>
      </div>
    </div>
  );
}
