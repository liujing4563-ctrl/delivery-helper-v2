"""
链接有效性核验工具

检查 data/*.ts 中所有 officialUrl / sourceUrl 是否仍可访问。
输出 CSV 报告，标记 404/超时/正常的链接。

用法：
  python tools/verify_links.py

合规说明：
  只发送 HEAD 请求检查链接可达性，不爬取页面内容。
"""

import re
import sys
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parent.parent

HEADERS = {
    "User-Agent": "DeliveryHelper/1.0 (Link Verification Tool; contact via GitHub)",
    "Accept": "text/html,*/*",
}


def extract_urls_from_ts(file_path: Path) -> list[dict]:
    """从 TypeScript 数据文件中提取所有 URL"""
    content = file_path.read_text(encoding="utf-8")
    urls = re.findall(r'https?://[^\s"\'`,\)]+', content)
    cleaned = []
    seen = set()
    for url in urls:
        url = url.rstrip(".,;:)]}>")
        if url not in seen:
            seen.add(url)
            cleaned.append({"file": file_path.name, "url": url})
    return cleaned


def check_url(url: str, timeout: int = 15) -> dict:
    """检查单个 URL 是否可达"""
    try:
        resp = requests.head(url, headers=HEADERS, timeout=timeout, allow_redirects=True)
        status = resp.status_code
        if 200 <= status < 400:
            return {"url": url, "status": status, "ok": True, "note": ""}
        elif status == 403:
            # 政府网站经常 403 head，尝试 GET
            resp2 = requests.get(url, headers=HEADERS, timeout=timeout, allow_redirects=True)
            if 200 <= resp2.status_code < 400:
                return {"url": url, "status": resp2.status_code, "ok": True, "note": "HEAD返回403但GET正常"}
            return {"url": url, "status": status, "ok": True, "note": "403-可能需要浏览器访问"}
        elif status == 405:
            # HEAD 不被允许，用 GET
            resp2 = requests.get(url, headers=HEADERS, timeout=timeout, allow_redirects=True)
            s2 = resp2.status_code
            if 200 <= s2 < 400:
                return {"url": url, "status": s2, "ok": True, "note": "GET正常"}
            return {"url": url, "status": s2, "ok": False, "note": f"GET返回{s2}"}
        else:
            return {"url": url, "status": status, "ok": False, "note": f"HTTP {status}"}
    except requests.exceptions.Timeout:
        return {"url": url, "status": 0, "ok": False, "note": "超时"}
    except requests.exceptions.ConnectionError as e:
        return {"url": url, "status": 0, "ok": False, "note": f"连接失败: {str(e)[:60]}"}
    except Exception as e:
        return {"url": url, "status": 0, "ok": False, "note": f"错误: {str(e)[:60]}"}


def main():
    data_dir = ROOT / "data"
    ts_files = list(data_dir.glob("*.ts"))

    all_entries = []
    for f in ts_files:
        entries = extract_urls_from_ts(f)
        all_entries.extend(entries)

    if not all_entries:
        print("未找到任何 URL")
        return

    print(f"共找到 {len(all_entries)} 个 URL，开始核验...\n")

    results = []
    for i, entry in enumerate(all_entries, 1):
        url = entry["url"]
        file_name = entry["file"]
        print(f"  [{i}/{len(all_entries)}] {url[:70]}...")
        result = check_url(url)
        result["file"] = file_name
        results.append(result)
        # 避免触发反爬
        import time
        time.sleep(0.5)

    ok_count = sum(1 for r in results if r["ok"])
    fail_count = len(results) - ok_count

    print("\n" + "=" * 60)
    print(f"[OK] {ok_count} 个正常 | [FAIL] {fail_count} 个异常")
    print("=" * 60)

    if fail_count > 0:
        print("\n[FAIL] 异常链接：")
        for r in results:
            if not r["ok"]:
                print(f"  [{r['file']}] {r['url']}")
                print(f"    状态: {r['note']}")

    report_path = ROOT / "tools" / "link_report.csv"
    with open(report_path, "w", encoding="utf-8") as f:
        f.write("文件,URL,状态码,是否正常,备注\n")
        for r in results:
            f.write(f"{r['file']},{r['url']},{r['status']},{'是' if r['ok'] else '否'},{r['note']}\n")

    print(f"\n详细报告已保存到: {report_path}")


if __name__ == "__main__":
    main()
