import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Snap Bucket",
  base: "/snap-bucket",
  description: "Secure, lightweight S3 upload SDK ecosystem with zero server-side overhead and built-in progress bars.",
  themeConfig: {
    logo: '/assets/snap-bucket-home-image.png',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/introduction' },
      { text: 'API Reference', link: '/reference/api-frontend' }
    ],

    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Introduction', link: '/guide/introduction' },
          { text: 'Installation', link: '/guide/installation' },
          { text: 'Backend Setup', link: '/guide/backend-setup' },
          { text: 'Frontend Setup', link: '/guide/frontend-setup' }
        ]
      },
      {
        text: 'S3 Configuration',
        items: [
          { text: 'S3 CORS Policy', link: '/guide/s3-cors-policy' }
        ]
      },
      {
        text: 'API Reference',
        items: [
          { text: 'Frontend SDK API', link: '/reference/api-frontend' },
          { text: 'Backend SDK API', link: '/reference/api-backend' }
        ]
      },
      {
        text: 'Help',
        items: [
          { text: 'Troubleshooting', link: '/guide/troubleshooting' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/sbn-raju/snap-bucket' }
    ]
  }
})
