import type { MetadataRoute } from 'next'

const baseUrl = 'https://prestigeshuttlegroup.com'
const locales = ['en', 'fr', 'es'] as const

const publicRoutes: Array<{
  path: string
  priority: number
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']
}> = [
  { path: '', priority: 1.0, changeFrequency: 'daily' },
  { path: '/services', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/cdg-airport-transfer', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/orly-airport-transfer', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/private-chauffeur-paris', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/disneyland-paris', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/about', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/contact', priority: 0.7, changeFrequency: 'monthly' },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = []

  for (const locale of locales) {
    for (const route of publicRoutes) {
      entries.push({
        url: `${baseUrl}/${locale}${route.path}`,
        lastModified: new Date(),
        changeFrequency: route.changeFrequency,
        priority: route.priority,
      })
    }
  }

  return entries
}
