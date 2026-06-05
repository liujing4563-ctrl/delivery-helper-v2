'use client';

import { useState, useMemo } from 'react';
import { legalAidCenters } from '@/data/legalAidCenters';
import type { LegalAidCenter } from '@/data/types';
import LegalAidCard from '@/components/LegalAidCard';

export default function LegalAidPage() {
  const [selectedCity, setSelectedCity] = useState<string>('all');

  // 提取城市列表
  const cities = useMemo(() => {
    const citySet = new Set(legalAidCenters.map((c) => c.city));
    return Array.from(citySet).sort();
  }, []);

  // 按城市筛选
  const filtered = useMemo(() => {
    if (selectedCity === 'all') return legalAidCenters;
    return legalAidCenters.filter((c) => c.city === selectedCity);
  }, [selectedCity]);

  // 按区分组
  const grouped = useMemo(() => {
    const map = new Map<string, LegalAidCenter[]>();
    filtered.forEach((c) => {
      const key = c.district || c.city;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(c);
    });
    return map;
  }, [filtered]);

  const verifiedCount = useMemo(
    () => legalAidCenters.filter((center) => center.lastVerified !== '待核实').length,
    []
  );
  const verifiedAddressHoursCount = useMemo(
    () => legalAidCenters.filter((center) => center.address && center.hours).length,
    []
  );

  return (
    <div className="px-4 pt-6 pb-4">
      <h1 className="text-xl font-bold text-gray-900">法律援助目录</h1>
      <p className="mt-1 text-sm text-gray-500">
        上海法律援助中心和正规律所查询入口
      </p>

      {/* 上海 12348 热线 */}
      <div className="mt-4 rounded-xl border-2 border-blue-200 bg-blue-50 p-4">
        <p className="text-sm font-semibold text-blue-800">上海公共法律服务热线</p>
        <a
          href="tel:02112348"
          className="mt-1 inline-flex items-baseline gap-1 text-2xl font-bold text-blue-900 hover:underline"
        >
          📞 021-12348
        </a>
        <p className="mt-1 text-xs text-blue-600">
          上海 12348 官方提示：法律援助机构查询按 2。
        </p>
        <p className="mt-2 text-xs text-blue-700">
          已核验 {verifiedCount} 个上海法律援助中心电话、{verifiedAddressHoursCount} 个地址/接待时间；未在当前官方页面确认时不展示。
        </p>
      </div>

      {/* 城市筛选 */}
      <div className="mt-4 flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide" role="tablist" aria-label="城市筛选">
        <button
          role="tab"
          aria-selected={selectedCity === 'all'}
          onClick={() => setSelectedCity('all')}
          className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            selectedCity === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          全部
        </button>
        {cities.map((city) => (
          <button
            key={city}
            role="tab"
            aria-selected={selectedCity === city}
            onClick={() => setSelectedCity(city)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              selectedCity === city
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {city}
          </button>
        ))}
      </div>

      {/* 法援列表（按区分组） */}
      <div className="mt-4 space-y-4">
        {Array.from(grouped.entries()).map(([district, centers]) => (
          <div key={district}>
            <h2 className="mb-2 text-sm font-semibold text-gray-500">
              {district}
            </h2>
            <div className="space-y-3">
              {centers.map((center) => (
                <LegalAidCard key={center.id} center={center} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 正规律所查询入口（始终显示） */}
      <div className="mt-6">
        <h2 className="mb-2 text-sm font-semibold text-gray-500">
          正规律所查询入口
        </h2>
        <p className="mb-2 text-xs text-gray-400">
          本站不推荐具体律所，请通过以下官方渠道查询正规律师和律师事务所
        </p>
        <div className="space-y-3">
          <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
            <h3 className="text-sm font-semibold text-purple-900">
              全国律师执业诚信信息公示平台
            </h3>
            <p className="mt-1 text-xs text-purple-600">
              查询全国注册律师和律师事务所的基本信息和诚信记录
            </p>
            <a
              href="https://credit.acla.org.cn/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-sm font-medium text-purple-800 hover:underline"
            >
              访问平台 →
            </a>
          </div>
          <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
            <h3 className="text-sm font-semibold text-purple-900">
              中国法律服务网（12348法网）
            </h3>
            <p className="mt-1 text-xs text-purple-600">
              司法部主办，提供法律咨询、法律援助、人民调解等服务
            </p>
            <a
              href="https://www.12348.gov.cn/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-sm font-medium text-purple-800 hover:underline"
            >
              访问网站 →
            </a>
          </div>
        </div>
      </div>

      {/* 数据来源说明 */}
      <p className="mt-4 text-xs text-gray-400 text-center">
        法援中心信息来源于各地司法局和 12348 法网，请以官方最新信息为准。
      </p>
    </div>
  );
}
