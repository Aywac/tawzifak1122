import { getArticles } from '@/lib/data';

export const dynamic = 'force-dynamic';

const baseUrl = 'https://www.tawzifak.com';

function generateSitemap(articles: any[]) {
  return `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${articles
        .map(({ slug, createdAt, date }) => {
          const lastmodDate = createdAt?.toDate 
            ? createdAt.toDate() 
            : (date ? new Date(date) : new Date());

          return `
            <url>
              <loc>${`${baseUrl}/articles/${slug}`}</loc>
              <lastmod>${lastmodDate.toISOString().split('T')[0]}</lastmod>
              <changefreq>monthly</changefreq>
              <priority>0.7</priority>
            </url>
          `;
        })
       .join('')}
    </urlset>
  `;
}

export async function GET() {
  try {
    const { data: articles } = await getArticles({ limit: 1000 });
    const sitemap = generateSitemap(articles);

    return new Response(sitemap, {
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  } catch (error) {
    console.error("Error generating articles sitemap:", error);
    return new Response('Error generating sitemap', { status: 500 });
  }
}
