export default function robots() {
  const baseUrl = 'https://formbuilder.summitdigital.in';

  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/pricing', '/about', '/forms/'],
      disallow: [
        '/dashboard/',
        '/auth/',
        '/login',
        '/register',
        '/forgot-password',
        '/api/',
        '/trpc/',
        '/api/billing/webhook',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
