import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://libro.co.in'
  
  // Base routes
  const routes = ['', '/docs', '/login', '/about', '/explore', '/privacy', '/terms', '/security'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  // Integration programmatic pages
  const integrations = ['cursor', 'claude-desktop', 'chatgpt', 'windsurf'].map((slug) => ({
    url: `${baseUrl}/integrations/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }))

  return [...routes, ...integrations]
}
