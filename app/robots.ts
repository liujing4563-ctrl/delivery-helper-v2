import type { MetadataRoute } from 'next';

const BASE_URL = 'https://delivery-helper.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/account/', '/verify-request', '/offline'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
