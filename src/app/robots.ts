import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/cgi-bin/', '/tmp/', '/private/', '/admin/'],
      },
    ],
    sitemap: 'https://prestigeshuttlegroup.com/sitemap.xml',
  }
}
