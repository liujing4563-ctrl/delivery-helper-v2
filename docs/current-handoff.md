# 当前项目交接记录

更新日期：2026-06-05

## 项目位置

- 工作区：`C:\Users\Admin\Desktop\Project`
- 主项目：`C:\Users\Admin\Desktop\Project\delivery-helper`
- 技术栈：Next.js 16 App Router + TypeScript + Tailwind CSS 4 + Vercel AI SDK
- 当前产品定位：公益型外卖骑手劳动权益信息助手，核心功能无需登录。

## 当前已完成状态

- 薪资计算器：可计算毛收入、净收入、时薪和最低工资参考风险；`lastVerified="待核实"` 的城市不参与红黄绿风险判断；分档最低工资城市会展示适用范围说明。
- 法规库：10 条核心法规均有官方来源和核验时间。
- 法援目录：上海 17 个法律援助中心电话、地址、接待时间已补齐并核验。
- AI 权益助手：服务端流式问答已接入，定位为“AI 骑手权益信息助手”，不是律师；已限制请求体、角色、历史长度、输出长度和敏感信息边界。
- 账号系统：MVP 阶段不启用真实账号；登录、账户和删除账户页面均为占位/本地数据管理说明。
- PWA：已有 manifest、图标和手写 Service Worker；当前只做基础离线页，不引入 Serwist / Workbox。
- SEO：已有 `app/sitemap.ts`、`app/robots.ts`、`metadataBase`、站点标题/描述/关键词和 OpenGraph 基础元数据。
- 本地校验：`tools/validate_data.py` 已覆盖静态数据、账号边界、PWA 边界、AI 问答边界和上海法援完整性。

## 最近完成的七轮

### 第二十轮

- 补齐上海剩余 9 个区级法律援助中心地址和接待时间：
  - 黄浦、静安、长宁、虹口、杨浦、闵行、青浦、奉贤、金山。
- 来源为上海一网通办“对公民提供法律援助”事项页：
  - `https://zwdt.sh.gov.cn/govPortals/bsfw/item/ee293aeb-c5ca-4392-adc6-333dc7685e74`
- `README.md` 数据状态已更新为：
  - 法援中心电话：17 条已核验、0 条待核实。
  - 法援中心地址/时间：17 条已核验、0 条待核实。
- `docs/source-and-tooling-notes.md` 已记录 16 个区级法援办理地点/时间核验结论。

### 第二十一轮

- `tools/validate_data.py` 新增上海法援完整性校验：
  - 上海法律援助中心必须保持 17 条。
  - 上海法律援助中心电话必须保持 17 个。
  - 上海法律援助中心地址/接待时间必须保持 17 个。
  - 上海法律援助中心不得回退为 `待核实`。
- `.gitignore` 新增：
  - `/.playwright-cli/`
  - `.tmp-dev-*.log`
- `prompts-log.md` 已记录第二十、第二十一轮修复和验证结果。

### 第二十二轮

- `data/minWage.ts` 更新武汉最低工资为 2025-12-01 起一档参考标准：月最低工资 2400 元、小时最低工资 24 元，来源为武汉市人民政府门户网站转载的湖北省政府办公厅通知。
- `data/types.ts` 为最低工资数据增加 `scopeNote` 可选字段。
- `components/CalculatorForm.tsx` 在城市说明和复制结果中展示最低工资适用范围/说明。
- 对成都、武汉、重庆、郑州、西安、合肥等存在分档或仍需区县核准的数据补充说明，避免把主城区参考档误呈现为全市统一标准。

### 第二十三轮

- 继续联网评估外部 agent、skill、MCP、来源项目和资料；结论仍是不下载第三方 agent / MCP 代码，当前收益不如官方资料核验。
- 重新检索成都最低工资来源，查到成府规〔2025〕4号转载原文和成都住房公积金管理中心对该文件的官方引用。
- 当时因成都市政府原通知页面仍未能直接读取，成都保持 `lastVerified="待核实"`，但 `scopeNote` 补充了第一档/第二档区县范围线索；当前状态见第二十六轮。

### 第二十四轮

- `public/sw.js` 升级缓存版本为 `delivery-helper-v2`，预缓存 `manifest.json` 和 192/512 图标。
- Service Worker 新增同源请求限制，避免误处理外部资源。
- `/offline` 离线页增加法规库、法援目录入口，和当前预缓存页面保持一致。
- `tools/validate_data.py` 增加 PWA 关键资源预缓存和同源边界校验。

### 第二十五轮

- `docs/current-handoff.md` 修正最近完成轮次数量，并更新 PWA/成都来源/模板 SVG 清理边界。
- `components/ServiceWorkerRegistrar.tsx` 移除生产环境注册成功日志，注册失败按渐进增强静默处理。
- 生产服务抽查 `/offline` 和 `/calculator`：页面可加载，manifest 存在，控制台无 `log/warn/error`。

### 第二十六轮

- `data/minWage.ts` 已将成都切换为成都市人民政府官方直链，`lastVerified` 更新为 `2026-06-05`，15 个最低工资城市均通过结构校验。
- 新增 `app/sitemap.ts`、`app/robots.ts`，并增强 `app/layout.tsx` 元数据。
- 注意：本环境直接请求成都政府 URL 返回 `412 Precondition Failed`，建议后续用人工浏览器复核留痕；当前自动校验只做结构和域名边界检查，不做联网内容判断。

## 已通过验证

最近一次完整验证结果：

- `pnpm --dir "delivery-helper" validate:data` 通过。
- `python -m py_compile "tools/validate_data.py"` 通过。
- `pnpm --dir "delivery-helper" typecheck` 通过。
- `pnpm --dir "delivery-helper" lint` 通过。
- `pnpm --dir "delivery-helper" build` 通过。
- 生产服务抽查 `http://localhost:3002/offline`：页面可加载，manifest 存在，首页/薪资计算器/法规库/法援目录入口可见，控制台无 `log/warn/error`。
- 生产服务抽查 `http://localhost:3002/calculator`：页面可加载，manifest 存在，城市选择可见，控制台无 `log/warn/error`。
- Browser 只读页面作用域未暴露 `navigator`，本轮未直接读取 Service Worker registration/caches；后续如要验证缓存命中，可用完整 Playwright CLI 或浏览器 DevTools 做专项检查。
- 浏览器抽查 `/calculator`：页面可加载，城市选择可见，控制台无错误。当前 Browser 自动化对原生下拉框选项切换不可靠，未把该交互作为失败依据。
- 浏览器抽查 `/legal-aid`：显示 17 个上海法律援助中心电话、17 个地址/接待时间；黄浦、静安、奉贤地址可见；控制台无错误。

## 重要边界和不要做的事

- 不要在用户未明确要求时执行 `git commit`、`git push`、`git reset` 或创建分支。
- 不要把“继续”理解为包管理清理确认。
- 旧认证依赖仍存在于 `package.json` / `pnpm-lock.yaml`：
  - `@auth/core`
  - `next-auth`
  - `resend`
- 清理旧认证依赖属于包管理变更，只有用户明确说 `确认清理旧认证依赖` 后才执行。
- 不要引入额外 agent、skill、MCP 或来源项目；当前判断是 MVP 不需要，且会增加权限和维护成本。
- 法规、最低工资、法援数据只允许使用可核验官方来源；不得用未核验资料驱动风险判断。
- 成都最低工资当前使用成都市人民政府官方直链并已通过结构校验；但本环境直接抓取该链接返回 `412 Precondition Failed`，如要做更严格证据链，需人工浏览器复核原文并留痕。

## 当前工作区注意事项

- `git status --short` 显示大量 `A/AM` 文件，这是当前项目已有工作状态。
- `.playwright-cli/` 和 `.tmp-dev-3000.*.log` 已加入忽略规则，但当前状态里已有 `A` 记录；不要擅自删除、取消暂存或重置，除非用户明确确认。
- 最近变更集中在：
  - `data/legalAidCenters.ts`
  - `tools/validate_data.py`
  - `README.md`
  - `docs/source-and-tooling-notes.md`
  - `docs/current-handoff.md`
  - `prompts-log.md`
  - `.gitignore`
  - `data/types.ts`
  - `data/minWage.ts`
  - `app/layout.tsx`
  - `app/sitemap.ts`
  - `app/robots.ts`
  - `components/CalculatorForm.tsx`
  - `docs/external-resource-review.md`
  - `public/sw.js`
  - `app/offline/page.tsx`

## 下一步建议

1. 优先做非包管理、低风险改进：同步文档和真实代码状态后，继续跑 `validate:data`、`typecheck`、`lint`、`build`。
2. PWA 如需继续深化，下一步应专项验证 Service Worker registration/caches 和正式图标显示；不要在未确认前引入 Serwist / Workbox。
3. 成都最低工资如要形成更强证据链，建议人工浏览器打开成都市政府原文并保存核验留痕。
4. 默认 Next.js 模板 SVG 资源疑似未使用，但删除属于文件系统变更；只有用户明确确认后再清理。
5. 如要清理旧认证依赖，先让用户明确输入 `确认清理旧认证依赖`，再改 `package.json` 和锁文件。
6. 如要提交代码，先让用户明确要求提交；提交前重新运行 `validate:data`、`typecheck`、`lint`、`build`。
