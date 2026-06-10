import { MetadataRoute } from 'next'
import { docsNavigation } from '@/lib/data/docs'
import { exploreData } from '@/lib/data/explore'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.libro.co.in'
  
  // Base routes
  const routes = ['', '/docs', '/login', '/about', '/explore', '/privacy', '/terms', '/security', '/llms.txt'].map((route) => ({
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

  // Dynamic Docs Pages
  const docsPages: MetadataRoute.Sitemap = []
  docsNavigation.forEach((section) => {
    section.links.forEach((link) => {
      docsPages.push({
        url: `${baseUrl}/docs/${link.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.9,
      })
    })
  })

  // Dynamic Explore Pages
  const explorePages: MetadataRoute.Sitemap = Object.keys(exploreData).map((slug) => ({
    url: `${baseUrl}/explore/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [...routes, ...integrations, ...docsPages, ...explorePages]
}
