import { certifications } from '@/data/certificationData';

const BASE_URL = 'https://easycertify.lovable.app';

function generateSitemapXML(): string {
  const today = new Date().toISOString().split('T')[0];
  
  let urls = [
    {
      loc: BASE_URL,
      lastmod: today,
      changefreq: 'weekly',
      priority: '1.0'
    }
  ];

  // Add certification pages
  certifications.forEach(cert => {
    urls.push({
      loc: `${BASE_URL}/${cert.id}`,
      lastmod: today,
      changefreq: 'weekly',
      priority: '0.9'
    });

    // Add category and topic pages
    cert.categories.forEach(category => {
      category.topics.forEach(topic => {
        urls.push({
          loc: `${BASE_URL}/${cert.id}/${category.id}/${topic.id}`,
          lastmod: today,
          changefreq: 'monthly',
          priority: '0.8'
        });
      });
    });
  });

  const urlsXML = urls.map(url => `
  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlsXML}
</urlset>`;
}

export function getSitemapContent(): string {
  return generateSitemapXML();
}

// Generate static list of all routes for prerendering
export function getAllRoutes(): string[] {
  const routes: string[] = ['/'];
  
  certifications.forEach(cert => {
    routes.push(`/${cert.id}`);
    cert.categories.forEach(category => {
      category.topics.forEach(topic => {
        routes.push(`/${cert.id}/${category.id}/${topic.id}`);
      });
    });
  });

  return routes;
}
