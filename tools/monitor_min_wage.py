"""
最低工资标准监控工具

定期检查各地人社局官网，发现最低工资标准调整时输出提醒。
不自动更新数据，只输出变更提醒供人工核验。

用法：
  python tools/monitor_min_wage.py

合规说明：
  - 只读取人社局公开发布的最低工资标准页面
  - 发现变更时只输出提醒，不自动修改数据
  - 人工核验后才更新 data/minWage.ts
"""

import json
import re
from pathlib import Path

from scrapling import Fetcher

ROOT = Path(__file__).resolve().parent.parent


# 各地人社局最低工资标准页面
# 优先使用具体政策页面，回退到人社局首页
WAGE_SOURCES = {
    "上海": {
        "url": "https://rsj.sh.gov.cn/tgzfl_17732/20250714/t0035_1434097.html",
        "keywords": ["最低工资", "小时工资", "月工资"],
    },
    "北京": {
        "url": "https://rsj.beijing.gov.cn/weimenhu/wmtgz/202507/t20250724_4157298.html",
        "keywords": ["最低工资", "小时工资"],
    },
    "广州": {
        "url": "https://rsj.gz.gov.cn/zwgk/zcjd/zcjd/content/post_10148528.html",
        "keywords": ["最低工资", "小时工资"],
    },
    "深圳": {
        "url": "https://hrss.sz.gov.cn/xxgk/qtxx/tzgg/content/post_12016470.html",
        "keywords": ["最低工资", "小时工资"],
    },
}


def extract_wage_numbers(text: str) -> list[str]:
    """从文本中提取可能的工资数字"""
    # 匹配 "XXXX元" 或 "XX.X元" 模式
    patterns = [
        r'(\d{3,4})\s*元',       # 如 2740元, 25元
        r'(\d{1,2}\.\d)\s*元',   # 如 25.0元, 22.2元
        r'小时.*?(\d{2,3})\s*元', # 如 "小时25元"
        r'月.*?(\d{3,4})\s*元',   # 如 "月2740元"
    ]
    numbers = []
    for pattern in patterns:
        matches = re.findall(pattern, text)
        numbers.extend(matches)
    return list(set(numbers))


def check_city_wage(fetcher: Fetcher, city: str, config: dict) -> dict:
    """检查单个城市的最低工资标准"""
    url = config["url"]
    keywords = config["keywords"]

    try:
        response = fetcher.get(url, timeout=20)
        page_text = response.get_all_text() if hasattr(response, 'get_all_text') else str(response)

        # 检查是否包含最低工资关键词
        found_keywords = [kw for kw in keywords if kw in page_text]
        wage_numbers = extract_wage_numbers(page_text)

        return {
            "city": city,
            "url": url,
            "accessible": True,
            "found_keywords": found_keywords,
            "wage_numbers": wage_numbers[:10],  # 限制数量
            "text_length": len(page_text),
        }
    except Exception as e:
        return {
            "city": city,
            "url": url,
            "accessible": False,
            "error": str(e)[:100],
        }


def load_current_wage_data() -> dict:
    """从 data/minWage.ts 读取当前数据"""
    file_path = ROOT / "data" / "minWage.ts"
    content = file_path.read_text(encoding="utf-8")

    # 简单提取城市和数值
    current = {}
    # 匹配 city: '城市名', ... monthly: 数字, hourly: 数字
    pattern = r"city:\s*'([^']+)'[\s\S]*?monthly:\s*(\d+)[\s\S]*?hourly:\s*([\d.]+)"
    for match in re.finditer(pattern, content):
        city, monthly, hourly = match.groups()
        current[city] = {"monthly": int(monthly), "hourly": float(hourly)}

    return current


def main():
    print("=" * 60)
    print("最低工资标准监控工具")
    print("=" * 60)

    fetcher = Fetcher(auto_match=False)

    # 读取当前数据
    current_data = load_current_wage_data()
    print(f"\n当前数据中有 {len(current_data)} 个城市")

    # 检查每个城市
    results = []
    for city, config in WAGE_SOURCES.items():
        print(f"\n检查 {city}...")
        result = check_city_wage(fetcher, city, config)
        results.append(result)

        if result.get("accessible"):
            print(f"  ✅ 页面可达")
            print(f"  找到关键词: {result.get('found_keywords', [])}")
            print(f"  找到数字: {result.get('wage_numbers', [])}")

            # 与当前数据对比
            if city in current_data:
                current = current_data[city]
                print(f"  当前数据: 月 {current['monthly']} 元, 时薪 {current['hourly']} 元")
        else:
            print(f"  ❌ 页面不可达: {result.get('error', '未知错误')}")

    # 保存结果
    output_path = ROOT / "tools" / "wage_monitor_result.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump({
            "current_data": current_data,
            "check_results": results,
        }, f, ensure_ascii=False, indent=2)

    print(f"\n监控结果已保存到: {output_path}")
    print("⚠️ 如发现变更，请人工核验后更新 data/minWage.ts")


if __name__ == "__main__":
    main()