import { MetadataRoute } from 'next';
import { categories } from '@/lib/data';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.itetude.com';

  const staticRoutes = [
    { url: `${baseUrl}/`, changeFrequency: 'daily' as const, priority: 1.0 },
    { url: `${baseUrl}/about`, changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: `${baseUrl}/parcours`, changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: `${baseUrl}/certifications`, changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: `${baseUrl}/login`, changeFrequency: 'yearly' as const, priority: 0.5 },
    { url: `${baseUrl}/signup`, changeFrequency: 'yearly' as const, priority: 0.5 },
    { url: `${baseUrl}/privacy`, changeFrequency: 'yearly' as const, priority: 0.3 },
    { url: `${baseUrl}/terms`, changeFrequency: 'yearly' as const, priority: 0.3 },
  ].map(route => ({...route, lastModified: new Date().toISOString()}));

  const resourceCategoryRoutes = categories.map((category) => ({
    url: `${baseUrl}/ressources/${category.slug}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...resourceCategoryRoutes];
}
