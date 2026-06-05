# 项目审阅报告 — 2026-06-05（第二轮）

> 注：这是第二轮审阅报告快照；当前工作区状态以实时 `git status` 和 `docs/current-handoff.md` 为准。

## 本轮完成的改进

### 1. 成都最低工资数据核实
- **之前**: `lastVerified: '待核实'`，数据来源为四川省政府 PDF 转载链接，scopeNote 提到"成都市政府原文直链仍待核准"
- **现在**: 
  - `sourceUrl` 更新为成都市人民政府官网直链（成府规〔2025〕4号）
  - `sourceName` 从"四川省人民政府"改为"成都市人民政府"
  - `lastVerified` 更新为 `2026-06-05`
  - scopeNote 精简为明确的两档说明
- **影响**: 15个城市数据现已全部完成核实，无"待核实"条目

### 2. SEO 优化
- 新增 `app/sitemap.ts`：自动生成 sitemap.xml，包含 8 个公开页面（首页、计算器、法规、法援、AI问答、新闻、免责声明、隐私政策）
- 新增 `app/robots.ts`：自动生成 robots.txt，屏蔽 `/api/`、`/account/`、`/verify-request`、`/offline` 等非公开页面
- 构建验证：sitemap.xml 和 robots.txt 均生成为静态页面（○标记）

### 3. 元数据增强
- `layout.tsx` 添加 `metadataBase`，确保 OpenGraph 和 sitemap 使用正确的 base URL
- 标题优化为"骑手权益助手 — 外卖骑手劳动权益保障平台"（更有描述性）
- 添加 `keywords`：外卖骑手、劳动权益、工资计算、法律援助、最低工资、骑手保障
- 描述文本补充"帮助骑手了解自己的劳动权益"

### 4. Service Worker 优化
- `ServiceWorkerRegistrar.tsx` 简化注册逻辑
- 注册失败时静默处理（渐进增强策略），不再输出 console.warn
- 添加文件末尾换行符

## 构建状态

```
Next.js 16.2.7 (Turbopack)
✓ Compiled successfully in 3.2s
✓ TypeScript 检查通过
✓ 19 routes（较上轮 +2：sitemap.xml、robots.txt）
✓ 所有静态页面预渲染成功
✓ Exit code 0
```

### 路由清单（19条）
| 路由 | 类型 | 说明 |
|------|------|------|
| `/` | Static | 首页（问题导向入口） |
| `/calculator` | Static | 薪资计算器 |
| `/regulations` | Static | 法规查询 |
| `/legal-aid` | Static | 法援导航 |
| `/chat` | Static | AI 权益问答 |
| `/news` | Static | 行业资讯 |
| `/disclaimer` | Static | 免责声明 |
| `/privacy` | Static | 隐私政策 |
| `/offline` | Static | PWA 离线页 |
| `/login` | Static | 登录说明页 |
| `/account` | Static | 账号管理页 |
| `/account/delete` | Static | 删除账号页 |
| `/verify-request` | Static | 验证说明页 |
| `/sitemap.xml` | Static | 站点地图（新增） |
| `/robots.txt` | Static | 爬虫规则（新增） |
| `/api/chat` | Dynamic | AI 聊天 API |
| `/api/auth/[...nextauth]` | Dynamic | 认证 API（MVP 未启用） |

## Git 提交历史

```
df189da feat: SEO 优化 + 成都最低工资数据核实 + 元数据增强
620963e docs: 添加 2026-06-05 项目审阅报告
515c158 chore: 添加 Vercel 部署配置和更新环境变量说明
35be53c feat: 外卖骑手劳动权益助手 MVP 初始版本
```

工作树状态：**clean**（无未提交更改）

## 数据完整性检查

| 数据类型 | 条目数 | 核实状态 |
|----------|--------|----------|
| 最低工资 (minWage) | 15 城市 | ✅ 全部已核实 |
| 法规 (regulations) | 10 条 | ✅ 全部已核实 |
| 法援中心 (legalAidCenters) | 17 个（上海） | ✅ 全部已核实 |

## 项目完成度评估

| 里程碑 | 内容 | 完成度 |
|--------|------|--------|
| M0 | 项目骨架 | 100% |
| M1 | 薪资计算器 | 100% |
| M2 | 法规查询 + 法援导航 | 100% |
| M3 | AI 权益问答助手 | 100% |
| M4 | 账号体系（MVP 简化） | 100%（已用说明页替代） |
| M5 | PWA + 新闻 | 95%（图标已就位，可进一步测试离线体验） |
| SEO | sitemap + robots + 元数据 | 100%（本轮新增） |

## 下一步建议

1. **部署上线**: 项目已具备 Vercel 部署条件（vercel.json 已配置），可直接 `git push` 到 GitHub 并关联 Vercel
2. **域名绑定**: 如有自定义域名，更新 sitemap.ts 和 robots.ts 中的 BASE_URL
3. **真实 AI API 测试**: 配置 `.env.local` 中的 `AI_API_KEY` 后测试真实 DeepSeek 对话流
4. **扩展城市法援**: 目前仅上海 17 个法援中心，可按需添加北京、广州等城市
5. **PWA 离线体验**: 完善 sw.js 的缓存策略，确保核心页面可离线访问
6. **Lighthouse 审计**: 部署后进行性能、无障碍、SEO 的 Lighthouse 评分测试

---

## 第三轮改进（同日追加）

### 5. SSR 水合不匹配修复
- `CalculatorForm.tsx`: 将 `getInitialInput()` 初始化改为始终使用 `DEFAULT_INPUT`，然后在 `useEffect` 中从 `localStorage` 恢复
- 消除了 SSR/CSR 首次渲染值不同导致的 React hydration mismatch 警告

### 6. 表单输入防御性增强
- 所有数字输入添加 `Math.max(0, ...)` 防止负数
- 添加 `max` 属性限制输入上限（订单 9999、小时 24 等）
- 添加 `inputMode="numeric"/"decimal"` 优化移动端键盘弹出
- 所有 `<label>` 和 `<input>`/`<select>` 通过 `htmlFor`/`id` 正确关联

### 7. 无障碍性 (A11y) 整体提升
- `BottomNav`: 添加 `aria-label="主导航"`、`aria-current="page"`、emoji `aria-hidden="true"`
- `ProblemCard` / `FeatureCard`: 装饰性汉字图标添加 `aria-hidden="true"`
- `LegalAidCard`: emoji（📍📞🕐）添加 `aria-hidden="true"`
- `DisclaimerBox`: ⚠️ emoji 添加 `aria-hidden="true"`
- 法规页: 搜索框添加 `aria-label`，筛选按钮添加 `role="tablist"/"tab"/aria-selected`
- 法援页: 城市筛选添加 `role="tablist"/"tab"/aria-selected`
- 计算器: 周期选择改用 `<fieldset>` + `role="radiogroup"` + `aria-checked`

### 8. 导航和体验补全
- 首页"常用工具"新增"权益动态"卡片，链接到 `/news`（此前该页面无任何入站导航）
- 新增自定义 404 页面 (`app/not-found.tsx`)，提供返回首页和薪资测算入口
- 清理 5 个未使用的 Next.js 模板 SVG（file.svg、globe.svg、next.svg、vercel.svg、window.svg）

### 更新后 Git 提交历史

```
7927c08 fix: 无障碍性增强 + SSR 水合修复 + 输入校验 + 404 页面
df189da feat: SEO 优化 + 成都最低工资数据核实 + 元数据增强
620963e docs: 添加 2026-06-05 项目审阅报告
515c158 chore: 添加 Vercel 部署配置和更新环境变量说明
35be53c feat: 外卖骑手劳动权益助手 MVP 初始版本
```

### 项目完成度（更新后）

| 里程碑 | 内容 | 完成度 |
|--------|------|--------|
| M0 | 项目骨架 | 100% |
| M1 | 薪资计算器 | 100%（含输入校验和无障碍） |
| M2 | 法规查询 + 法援导航 | 100% |
| M3 | AI 权益问答助手 | 100% |
| M4 | 账号体系（MVP 简化） | 100% |
| M5 | PWA + 新闻 + 打磨 | 98%（PWA 离线缓存可进一步优化） |
| SEO | sitemap + robots + 元数据 | 100% |
| A11y | 无障碍性基础 | 90%（外部链接提示可进一步完善） |
