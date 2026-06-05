"""
法援中心数据补充工具

从 12348 中国法网或各地司法局官网抓取公开的法援中心信息。
输出 JSON 文件供人工核验后合并到 data/legalAidCenters.ts。

用法：
  python tools/fetch_legal_aid.py --city 上海
  python tools/fetch_legal_aid.py --city 北京
  python tools/fetch_legal_aid.py --all

合规说明：
  - 只抓取政府官网公开发布的法援中心名称/地址/电话
  - 抓取结果需要人工核验后才入库
  - 不爬取个人隐私数据
  - 结果标记 lastVerified="待核实"
"""

import json
import argparse
from pathlib import Path

from scrapling import Fetcher

ROOT = Path(__file__).resolve().parent.parent


# 城市对应的 12348 网站域名
CITY_SITES = {
    "上海": "https://www.12348.sh.gov.cn",
    "北京": "https://www.12348.gov.cn",
    "广州": "https://www.12348.gov.cn",
    "深圳": "https://www.12348.gov.cn",
    # 其他城市可扩展
}


def fetch_shanghai_legal_aid(fetcher: Fetcher) -> list[dict]:
    """从 12348 上海法网抓取法援中心数据"""
    url = "https://www.12348.sh.gov.cn/site/label/labelList?labelName=%E6%B3%95%E5%BE%8B%E6%8F%B4%E5%8A%A9%E4%B8%AD%E5%BF%83"

    try:
        response = fetcher.get(url, timeout=20)
        # 尝试提取 JSON API 数据
        if hasattr(response, 'json'):
            data = response.json()
            if isinstance(data, list):
                return data
    except Exception as e:
        print(f"  抓取失败: {e}")

    # 回退：从页面 HTML 中提取
    try:
        response = fetcher.get("https://www.12348.sh.gov.cn", timeout=20)
        # 查找法援中心列表
        centers = []
        items = response.find_all("a", class_=re.compile(r"legal|aid|center|法援"))
        for item in items:
            text = item.text.strip()
            href = item.get("href", "")
            if text and "法援" in text or "法律援助" in text:
                centers.append({
                    "name": text,
                    "sourceUrl": href,
                    "lastVerified": "待核实",
                })
        return centers
    except Exception as e:
        print(f"  HTML提取失败: {e}")
        return []


import re


def fetch_generic_legal_aid(fetcher: Fetcher, city: str) -> list[dict]:
    """从通用 12348 网站抓取法援中心数据"""
    base_url = CITY_SITES.get(city, "https://www.12348.gov.cn")

    try:
        response = fetcher.get(base_url, timeout=20)
        centers = []

        # 搜索页面中包含"法律援助"的链接和文本
        links = response.find_all("a")
        for link in links:
            text = link.text.strip()
            href = link.get("href", "")
            if "法律援助" in text or "法援" in text or "援助中心" in text:
                centers.append({
                    "name": text,
                    "sourceUrl": href if href.startswith("http") else f"{base_url}{href}",
                    "lastVerified": "待核实",
                })

        return centers
    except Exception as e:
        print(f"  抓取 {city} 失败: {e}")
        return []


def main():
    parser = argparse.ArgumentParser(description="从 12348 抓取法援中心数据")
    parser.add_argument("--city", help="指定城市（如 上海、北京）")
    parser.add_argument("--all", action="store_true", help="抓取所有城市")
    args = parser.parse_args()

    fetcher = Fetcher(auto_match=False)

    cities = []
    if args.all:
        cities = list(CITY_SITES.keys())
    elif args.city:
        cities = [args.city]
    else:
        print("请指定 --city 或 --all")
        return

    results = {}
    for city in cities:
        print(f"\n抓取 {city} 法援中心数据...")
        if city == "上海":
            centers = fetch_shanghai_legal_aid(fetcher)
        else:
            centers = fetch_generic_legal_aid(fetcher, city)

        results[city] = centers
        print(f"  找到 {len(centers)} 个法援中心")

    # 保存 JSON 文件供人工核验
    output_path = ROOT / "tools" / "legal_aid_raw.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    print(f"\n原始数据已保存到: {output_path}")
    print("⚠️ 重要：这些数据需要人工核验后才可合并到 data/legalAidCenters.ts")


if __name__ == "__main__":
    main()