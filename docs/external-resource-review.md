# 外部资源评估记录

更新日期：2026-06-05

## 本轮结论

当前不下载第三方 agent、skill、MCP 服务或来源项目代码。

原因：

- 当前 MVP 的核心价值是可信数据、薪资测算、法援目录和受控问答，不需要 AI 调用外部工具。
- 法律和劳动权益内容必须人工核验官方来源，不能把未审计抓取器或 agent 输出直接入库。
- 引入 MCP 或 agent 框架会增加密钥、工具权限、提示注入和维护成本，当前收益不足。
- 项目已有 Vercel AI SDK 的服务端代理，满足当前 DeepSeek/OpenAI 兼容模型调用需求。

## 已评估资料

### Model Context Protocol

- 来源：https://modelcontextprotocol.io/docs/concepts/architecture
- 判断：MCP 适合把 tools、resources、prompts 暴露给 AI 客户端或 agent。
- 当前决策：暂不接入。等项目需要“让 AI 主动调用官方数据核验工具或内部后台”时再评估。

### Agent Skills

- 来源：https://modelcontextprotocol.io/docs/develop/build-with-agent-skills
- 判断：Skill 适合把可复用操作流程、脚本和上下文封装给 agent 使用。
- 当前决策：暂不下载外部 skill。后续可考虑在本地创建项目专用 skill，但要先稳定数据核验流程。

### OpenAI Agents / Tools

- 来源：https://platform.openai.com/docs/guides/agents
- 判断：Agents 适合复杂多步工具调用和任务编排。
- 当前决策：不引入。本站 AI 问答必须受控、可解释、低权限，当前只需要服务端文本生成。

### Vercel AI SDK

- 来源：https://sdk.vercel.ai/docs/ai-sdk-core/generating-text
- 判断：已符合当前服务端流式输出、模型供应商切换和 TypeScript 集成需求。
- 当前决策：保留，不新增替代 SDK。

### Next.js 环境变量

- 来源：https://nextjs.org/docs/app/guides/environment-variables
- 判断：服务端密钥不使用 `NEXT_PUBLIC_` 前缀，避免暴露给浏览器。
- 当前决策：继续保持 `AI_API_KEY`、`AI_API_BASE_URL`、`AI_MODEL` 只在服务端读取。

### OWASP LLM 应用安全资料

- 来源：https://owasp.org/www-project-top-10-for-large-language-model-applications/
- 判断：提示注入、敏感信息泄露、过度代理权限和不安全输出处理是 AI 应用常见风险。
- 当前决策：不下载外部安全扫描器；把低权限、输入边界、服务端密钥、敏感信息提醒和不保存聊天记录固化到 `pnpm validate:data`。

### OpenAI Agents Guardrails

- 来源：https://openai.github.io/openai-agents-python/guardrails/
- 判断：Guardrails 适合多 agent / 多工具流程中的输入输出检查。
- 当前决策：当前 AI 助手没有工具调用、handoff 或外部动作，不引入 Agents SDK；继续使用服务端文本生成和确定性本地校验。

## 后续触发条件

只有满足以下任一条件，才重新考虑下载或引入外部工具：

- 需要自动核验官方链接可达性，并且工具只读、可审计、可限速。
- 需要把内部数据校验脚本暴露给 AI，但不允许访问密钥或生产环境。
- 需要多人协作复用固定工作流，可通过本地 skill 固化流程。
- 现有 Vercel AI SDK 无法满足模型调用或流式输出需求。
- AI 助手开始调用外部工具、发送数据、查询后台或执行多步骤任务时，再评估 Agents SDK、guardrails 或 MCP。

## 2026-06-05 追加审阅

用户再次要求评估可用的 agent、skill、MCP、来源项目和资料。本轮重新检索后仍不下载第三方 agent / skill / MCP 代码。

当前更有价值的是官方资料核验，而不是引入工具框架：

- 成都最低工资存在成府规〔2025〕4号转载原文和成都住房公积金管理中心对该文件的官方引用，但成都市政府原通知页面仍未能直接读取。
- 在未取得可直接读取的成都市政府原文前，数据只补充分档说明，继续保持 `lastVerified="待核实"`，不参与薪资风险判断。
- 外部 agent / MCP 若直接写入法律数据，会降低数据可信度；后续如需自动化，只考虑只读、可审计、限速的官方链接核验工具。

## 安全红线

- 不下载不明来源代码到项目核心路径。
- 不运行未审计安装脚本。
- 不把用户问题、API key 或本地 `.env.local` 发给外部 agent。
- 不让 AI 直接写入法规、最低工资、法援等数据文件；数据变更必须人工核验。
