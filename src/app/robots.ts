import { MetadataRoute } from 'next';
 
export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.itetude.com';
 
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/postadeep/', '/profil/', '/dashboard/', '/feedback/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
