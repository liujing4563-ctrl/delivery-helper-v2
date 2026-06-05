import type { MetadataRoute } from 'next';

const BASE_URL = 'https://delivery-helper.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  return [
    { url: `${BASE_URL}/`, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE_URL}/calculator`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE_URL}/regulations`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE_URL}/legal-aid`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/chat`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/news`, lastModified: now, changeFrequency: 'daily', priority: 0.7 },
    { url: `${BASE_URL}/disclaimer`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];
}
