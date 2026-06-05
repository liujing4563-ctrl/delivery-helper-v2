import Link from 'next/link';
import type { FeatureEntry } from '@/data/types';

export default function FeatureCard({ feature }: { feature: FeatureEntry }) {
  return (
    <Link
      href={feature.href}
      className="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 active:scale-[0.98]"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-base font-bold text-blue-700">
          {feature.icon}
        </span>
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-gray-900">
            {feature.title}
          </h3>
          <p className="mt-0.5 text-sm leading-5 text-gray-500">
            {feature.description}
          </p>
        </div>
      </div>
    </Link>
  );
}
