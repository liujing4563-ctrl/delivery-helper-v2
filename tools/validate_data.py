"""
静态数据完整性校验工具。

只检查 data/*.ts 的结构、日期、URL 和红线措辞，不联网、不自动修改数据。

用法：
  python tools/validate_data.py
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
PUBLIC_DIR = ROOT / "public"
SOURCE_DIRS = ["app", "components", "lib"]
CHAT_ROUTE = ROOT / "app" / "api" / "chat" / "route.ts"
CHAT_PAGE = ROOT / "app" / "chat" / "page.tsx"

DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
URL_RE = re.compile(r"^https://")
FIELD_RE = re.compile(r"(\w+):\s*([^,\n]+)")
STRING_RE = re.compile(r"^'([^']*)'$")

BANNED_PHRASES = [
    "平台违法",
    "一定可以仲裁成功",
    "一定能仲裁成功",
    "应当获得赔偿",
]

DISALLOWED_AUTH_TOKENS = [
    "next-auth",
    "@auth/core",
    "SessionProvider",
    "getServerSession",
    "signIn(",
    "signOut(",
    "NextAuth(",
    "Resend(",
    "EmailProvider",
]

MIN_WAGE_SCOPE_REQUIRED_CITIES = {"成都", "武汉", "重庆", "郑州", "西安", "合肥"}


class Report:
    def __init__(self) -> None:
        self.errors: list[str] = []
        self.warnings: list[str] = []

    def error(self, message: str) -> None:
        self.errors.append(message)

    def warn(self, message: str) -> None:
        self.warnings.append(message)


def read_data_file(name: str) -> str:
    return (DATA_DIR / name).read_text(encoding="utf-8")


def extract_constants(content: str) -> dict[str, str]:
    constants: dict[str, str] = {}
    for match in re.finditer(r"const\s+(\w+)\s*=\s*'([^']*)';", content):
        constants[match.group(1)] = match.group(2)
    return constants


def extract_array_objects(content: str, const_name: str) -> list[str]:
    marker = f"export const {const_name}"
    start = content.find(marker)
    if start == -1:
        return []

    array_start = content.find("[", start)
    array_end = content.rfind("]")
    if array_start == -1 or array_end == -1 or array_end <= array_start:
        return []

    objects: list[str] = []
    depth = 0
    object_start: int | None = None
    for index, char in enumerate(content[array_start:array_end], array_start):
        if char == "{":
            if depth == 0:
                object_start = index
            depth += 1
        elif char == "}":
            depth -= 1
            if depth == 0 and object_start is not None:
                objects.append(content[object_start : index + 1])
                object_start = None

    return objects


def parse_object(object_text: str, constants: dict[str, str]) -> dict[str, object]:
    result: dict[str, object] = {}
    for key, raw_value in FIELD_RE.findall(object_text):
        value = raw_value.strip()
        string_match = STRING_RE.match(value)
        if string_match:
            result[key] = string_match.group(1)
        elif value in constants:
            result[key] = constants[value]
        elif value == "null":
            result[key] = None
        else:
            number_match = re.match(r"^-?\d+(?:\.\d+)?$", value)
            if number_match:
                result[key] = float(value) if "." in value else int(value)
            else:
                result[key] = value
    return result


def require_string(
    report: Report,
    item: dict[str, object],
    field: str,
    label: str,
) -> str:
    value = item.get(field)
    if not isinstance(value, str) or not value.strip():
        report.error(f"{label}: 缺少必填字段 {field}")
        return ""
    return value


def validate_date(report: Report, value: str, label: str, field: str) -> None:
    if value != "待核实" and not DATE_RE.match(value):
        report.error(f"{label}: {field} 应为 YYYY-MM-DD 或 待核实")


def validate_url(report: Report, value: str, label: str, field: str) -> None:
    if value and not URL_RE.match(value):
        report.error(f"{label}: {field} 必须使用 https:// 官方链接")


def validate_unique(report: Report, values: list[str], label: str) -> None:
    seen: set[str] = set()
    duplicates: set[str] = set()
    for value in values:
        if value in seen:
            duplicates.add(value)
        seen.add(value)
    for value in sorted(duplicates):
        report.error(f"{label}: 存在重复项 {value}")


def validate_banned_phrases(report: Report) -> None:
    for path in DATA_DIR.glob("*.ts"):
        content = path.read_text(encoding="utf-8")
        for phrase in BANNED_PHRASES:
            if phrase in content:
                report.error(f"{path.name}: 出现红线措辞 `{phrase}`")


def validate_regulations(report: Report) -> None:
    content = read_data_file("regulations.ts")
    items = [
        parse_object(obj, extract_constants(content))
        for obj in extract_array_objects(content, "regulations")
    ]
    validate_unique(report, [str(item.get("id", "")) for item in items], "regulations")

    for item in items:
        label = f"regulations[{item.get('id', 'unknown')}]"
        title = require_string(report, item, "title", label)
        require_string(report, item, "issuer", label)
        require_string(report, item, "category", label)
        require_string(report, item, "summary", label)
        official_url = require_string(report, item, "officialUrl", label)
        last_verified = require_string(report, item, "lastVerified", label)
        validate_date(report, last_verified, label, "lastVerified")
        validate_url(report, official_url, label, "officialUrl")
        if len(str(item.get("summary", ""))) > 260:
            report.warn(f"{label}: 摘要较长，确认没有转载大段原文：{title}")


def validate_min_wage(report: Report) -> None:
    content = read_data_file("minWage.ts")
    items = [
        parse_object(obj, extract_constants(content))
        for obj in extract_array_objects(content, "minWageData")
    ]
    validate_unique(report, [str(item.get("city", "")) for item in items], "minWageData")

    for item in items:
        label = f"minWageData[{item.get('city', 'unknown')}]"
        city = require_string(report, item, "city", label)
        source_url = require_string(report, item, "sourceUrl", label)
        last_verified = require_string(report, item, "lastVerified", label)
        effective_date = require_string(report, item, "effectiveDate", label)
        hourly = item.get("hourly")
        monthly = item.get("monthly")
        scope_note = item.get("scopeNote")

        validate_date(report, last_verified, label, "lastVerified")
        validate_date(report, effective_date, label, "effectiveDate")
        if last_verified == "待核实":
            report.warn(f"{label}: 仍为待核实，前端应保持灰色风险判断")
        else:
            validate_url(report, source_url, label, "sourceUrl")
        if not isinstance(hourly, (int, float)) or hourly <= 0:
            report.error(f"{label}: hourly 必须为正数")
        if monthly is not None and (not isinstance(monthly, (int, float)) or monthly <= 0):
            report.error(f"{label}: monthly 必须为正数或 null")
        if city and last_verified != "待核实" and "gov.cn" not in source_url:
            report.warn(f"{label}: 已核验数据建议优先使用政府域名来源")
        if city in MIN_WAGE_SCOPE_REQUIRED_CITIES and not (
            isinstance(scope_note, str) and scope_note.strip()
        ):
            report.error(f"{label}: 分档城市必须提供 scopeNote 适用范围说明")


def validate_legal_aid(report: Report) -> None:
    content = read_data_file("legalAidCenters.ts")
    constants = extract_constants(content)
    items = [
        parse_object(obj, constants)
        for obj in extract_array_objects(content, "legalAidCenters")
    ]
    validate_unique(report, [str(item.get("id", "")) for item in items], "legalAidCenters")
    shanghai_centers = [
        item
        for item in items
        if item.get("city") == "上海" and item.get("type") == "法律援助中心"
    ]

    for item in items:
        label = f"legalAidCenters[{item.get('id', 'unknown')}]"
        require_string(report, item, "name", label)
        require_string(report, item, "type", label)
        require_string(report, item, "city", label)
        source_url = require_string(report, item, "sourceUrl", label)
        last_verified = require_string(report, item, "lastVerified", label)
        phone = item.get("phone")

        validate_date(report, last_verified, label, "lastVerified")
        if last_verified != "待核实":
            validate_url(report, source_url, label, "sourceUrl")
        if isinstance(phone, str) and phone and not re.match(r"^[\d-]{5,20}$", phone):
            report.error(f"{label}: phone 只能包含数字和短横线")

    if len(shanghai_centers) != 17:
        report.error("legalAidCenters: 上海法律援助中心应保持 17 条")

    shanghai_phone_count = sum(
        1 for item in shanghai_centers if str(item.get("phone", "")).strip()
    )
    shanghai_address_time_count = sum(
        1
        for item in shanghai_centers
        if str(item.get("address", "")).strip() and str(item.get("hours", "")).strip()
    )
    shanghai_verified_count = sum(
        1 for item in shanghai_centers if item.get("lastVerified") != "待核实"
    )

    if shanghai_phone_count != 17:
        report.error("legalAidCenters: 上海法律援助中心电话应全部核验")
    if shanghai_address_time_count != 17:
        report.error("legalAidCenters: 上海法律援助中心地址/接待时间应全部核验")
    if shanghai_verified_count != 17:
        report.error("legalAidCenters: 上海法律援助中心不应回退为待核实")


def validate_news(report: Report) -> None:
    content = read_data_file("news.ts")
    items = [
        parse_object(obj, extract_constants(content))
        for obj in extract_array_objects(content, "newsItems")
    ]
    validate_unique(report, [str(item.get("id", "")) for item in items], "newsItems")

    for item in items:
        label = f"newsItems[{item.get('id', 'unknown')}]"
        require_string(report, item, "title", label)
        source_url = require_string(report, item, "sourceUrl", label)
        summary = require_string(report, item, "summary", label)
        last_verified = require_string(report, item, "lastVerified", label)
        date = require_string(report, item, "date", label)

        validate_date(report, date, label, "date")
        validate_date(report, last_verified, label, "lastVerified")
        validate_url(report, source_url, label, "sourceUrl")
        if len(summary) > 220:
            report.warn(f"{label}: 新闻摘要较长，确认没有转载原文")


def validate_prompts(report: Report) -> None:
    content = read_data_file("prompts.ts")
    required_phrases = ["免责声明", "下一步建议", "不是律师", "不编造法条"]
    for phrase in required_phrases:
        if phrase not in content:
            report.error(f"prompts.ts: 系统提示词缺少 `{phrase}`")


def iter_source_files() -> list[Path]:
    files: list[Path] = []
    for directory in SOURCE_DIRS:
        root = ROOT / directory
        if not root.exists():
            continue
        for path in root.rglob("*"):
            if path.suffix in {".ts", ".tsx", ".js", ".jsx", ".mts"}:
                files.append(path)
    return files


def validate_account_boundary(report: Report) -> None:
    for path in iter_source_files():
        content = path.read_text(encoding="utf-8")
        label = path.relative_to(ROOT).as_posix()
        for token in DISALLOWED_AUTH_TOKENS:
            if token in content:
                report.error(f"{label}: MVP 不启用真实账号系统，发现认证残留 `{token}`")


def validate_pwa_boundary(report: Report) -> None:
    manifest_path = PUBLIC_DIR / "manifest.json"
    sw_path = PUBLIC_DIR / "sw.js"

    if not manifest_path.exists():
        report.error("public/manifest.json: 缺少 PWA manifest")
        return
    if not sw_path.exists():
        report.error("public/sw.js: 缺少 Service Worker")
        return

    try:
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        report.error(f"public/manifest.json: JSON 格式错误 {exc}")
        return

    for field in ["name", "short_name", "start_url", "display", "icons"]:
        if field not in manifest:
            report.error(f"public/manifest.json: 缺少字段 {field}")

    if manifest.get("start_url") != "/":
        report.warn("public/manifest.json: start_url 建议保持为 `/`")
    if manifest.get("display") not in {"standalone", "fullscreen", "minimal-ui"}:
        report.warn("public/manifest.json: display 建议使用 standalone/fullscreen/minimal-ui")

    icons = manifest.get("icons")
    if isinstance(icons, list):
        icon_sizes: set[str] = set()
        has_maskable_icon = False
        for index, icon in enumerate(icons):
            if not isinstance(icon, dict):
                report.error(f"public/manifest.json: icons[{index}] 必须是对象")
                continue
            src = str(icon.get("src", ""))
            sizes = str(icon.get("sizes", ""))
            purpose = str(icon.get("purpose", ""))
            icon_sizes.add(sizes)
            has_maskable_icon = has_maskable_icon or "maskable" in purpose
            if not src.startswith("/") or src.startswith("//"):
                report.error(f"public/manifest.json: icons[{index}].src 必须是站内绝对路径")
                continue
            if not (PUBLIC_DIR / src.lstrip("/")).exists():
                report.error(f"public/manifest.json: 图标文件不存在 {src}")
        for required_size in ["192x192", "512x512"]:
            if required_size not in icon_sizes:
                report.warn(f"public/manifest.json: 建议提供 {required_size} 图标")
        if not has_maskable_icon:
            report.warn("public/manifest.json: 建议至少提供一个 maskable 图标")
    else:
        report.error("public/manifest.json: icons 必须是数组")

    sw_content = sw_path.read_text(encoding="utf-8")
    if "/offline" not in sw_content:
        report.error("public/sw.js: 离线页 `/offline` 必须进入离线回退策略")
    for required_asset in ["/manifest.json", "/icons/icon-192x192.svg", "/icons/icon-512x512.svg"]:
        if required_asset not in sw_content:
            report.error(f"public/sw.js: PWA 关键资源必须预缓存 {required_asset}")
    if "requestUrl.origin !== self.location.origin" not in sw_content:
        report.error("public/sw.js: Service Worker 必须跳过非同源请求")
    if "/api/" not in sw_content or "return" not in sw_content:
        report.error("public/sw.js: API 请求必须显式跳过缓存")
    if re.search(r"https?://", sw_content):
        report.error("public/sw.js: MVP Service Worker 不应缓存外部 URL")


def validate_chat_boundary(report: Report) -> None:
    if not CHAT_ROUTE.exists():
        report.error("app/api/chat/route.ts: 缺少 AI 问答 API")
        return

    route_content = CHAT_ROUTE.read_text(encoding="utf-8")
    required_route_tokens = [
        ("MAX_REQUEST_BYTES", "请求体大小上限"),
        ("MAX_MESSAGE_LENGTH", "单条消息长度上限"),
        ("MAX_TOTAL_CONTENT_LENGTH", "总上下文长度上限"),
        ("MAX_MESSAGES", "历史消息数量上限"),
        ("request.text()", "按实际请求体文本二次校验大小"),
        ("new TextEncoder().encode(bodyText).length", "按真实字节数校验请求体"),
        ("sanitizeMessages", "消息清洗函数"),
        ("latestMessage.role !== 'user'", "最后一条消息必须是用户问题"),
        ("process.env.AI_API_KEY", "AI Key 只能服务端读取"),
        ("maxOutputTokens", "模型输出长度上限"),
        ("temperature: 0.3", "低温度降低随意发挥"),
    ]
    for token, description in required_route_tokens:
        if token not in route_content:
            report.error(f"app/api/chat/route.ts: 缺少 `{token}`，无法保证{description}")

    if "message.role === 'user' || message.role === 'assistant'" not in route_content:
        report.error("app/api/chat/route.ts: 消息角色必须只允许 user / assistant")
    if "NEXT_PUBLIC" in route_content:
        report.error("app/api/chat/route.ts: AI API Key 不得使用 NEXT_PUBLIC 前缀")
    for forbidden_token in ["localStorage", "sessionStorage", "prisma.", "db."]:
        if forbidden_token in route_content:
            report.error(f"app/api/chat/route.ts: MVP 不保存聊天记录，发现 `{forbidden_token}`")

    if CHAT_PAGE.exists():
        page_content = CHAT_PAGE.read_text(encoding="utf-8")
        required_page_tokens = [
            ("maxLength={1000}", "前端输入长度上限"),
            ("请不要输入个人敏感信息", "敏感信息提醒"),
            ("readErrorMessage", "读取服务端边界错误"),
        ]
        for token, description in required_page_tokens:
            if token not in page_content:
                report.error(f"app/chat/page.tsx: 缺少 `{token}`，无法保证{description}")


def main() -> int:
    report = Report()

    validate_banned_phrases(report)
    validate_regulations(report)
    validate_min_wage(report)
    validate_legal_aid(report)
    validate_news(report)
    validate_prompts(report)
    validate_account_boundary(report)
    validate_pwa_boundary(report)
    validate_chat_boundary(report)

    print("=" * 60)
    print("静态数据与项目边界校验")
    print("=" * 60)

    if report.warnings:
        print("\n[WARN]")
        for warning in report.warnings:
            print(f"- {warning}")

    if report.errors:
        print("\n[FAIL]")
        for error in report.errors:
            print(f"- {error}")
        return 1

    print("\n[OK] 数据结构和硬性边界检查通过")
    return 0


if __name__ == "__main__":
    sys.exit(main())
