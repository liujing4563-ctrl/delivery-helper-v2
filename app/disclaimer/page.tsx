export default function DisclaimerPage() {
  return (
    <div className="px-4 pt-6 pb-4">
      <h1 className="text-xl font-bold text-gray-900">免责声明</h1>

      <div className="mt-4 space-y-4 text-sm text-gray-700 leading-relaxed">
        <section>
          <h2 className="font-semibold text-gray-900">1. 性质说明</h2>
          <p className="mt-1">
            本站（骑手权益助手）是一个公益性质的法律信息平台，<strong>不是律师事务所</strong>，
            也不与任何律师事务所或律师建立代理关系。本站提供的所有内容，包括但不限于法规解读、
            薪资计算工具、AI 权益信息助手回答等，<strong>仅为一般性法律信息和参考指引，
            不构成律师法律意见、法律建议或法律咨询</strong>。
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-900">2. 不替代专业咨询</h2>
          <p className="mt-1">
            本站内容不能替代专业律师的法律意见。对于具体的法律问题，请咨询{' '}
            <strong>
              12348 法律援助热线或当地法律援助中心
            </strong>
            ，或委托正规律师事务所处理。
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-900">3. 数据准确性</h2>
          <p className="mt-1">
            本站数据来源于公开的官方渠道，我们尽力确保准确性，但不保证完全无误。法规和政策会更新，
            请以官方最新版本为准。每条数据都标注了最后核实时间，如发现信息有误请联系我们更正。
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-900">4. 计算工具</h2>
          <p className="mt-1">
            薪资计算器提供的结果仅为粗略估算，仅供参考。计算结果中的“最低工资参考线”是按照当地小时
            最低工资标准进行对比，<strong>不代表法律判决或对平台是否违法的认定</strong>。
            外卖骑手是否适用最低工资标准，取决于劳动关系或新就业形态用工关系的具体认定。
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-900">5. AI 助手</h2>
          <p className="mt-1">
            AI 骑手权益信息助手基于内置法规要点回答问题，但<strong>可能存在错误或遗漏</strong>。
            AI 回答不构成法律意见，不应作为维权决策的唯一依据。AI 回答中引用的法规请务必与官方原文核对。
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-gray-900">6. 责任限制</h2>
          <p className="mt-1">
            在法律允许的范围内，本站不对因使用本站内容而产生的任何损失或损害承担责任。
            用户应自行判断信息的适用性，并在必要时寻求专业法律帮助。
          </p>
        </section>
      </div>
    </div>
  );
}
