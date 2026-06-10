import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard/', '/api/'],
      },
      {
        userAgent: ['ChatGPT-User', 'Google-Extended', 'Claude-Web', 'PerplexityBot', 'OAI-SearchBot'],
        allow: ['/', '/docs', '/explore'],
        disallow: ['/dashboard/', '/api/'],
      }
    ],
    sitemap: 'https://libro.co.in/sitemap.xml',
  }
}
