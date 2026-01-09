export const siteConfig = {
  name: 'Widget SaaS',
  description: 'Create and manage website widgets',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  links: {
    github: 'https://github.com/yourusername/widget-saas',
    docs: '/docs',
  },
}

export const widgetConfig = {
  maxWidgetsPerCompany: 100,
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  widgetScriptUrl: process.env.NEXT_PUBLIC_APP_URL + '/widget',
}