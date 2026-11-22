import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'

import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { NotFoundPage } from '@/components/error-pages'
import { OG_IMAGE } from '@/lib/site-url'

import '../styles.css'

const siteName = 'AUREON AI PROJECT | Lujo, experiencias y oportunidades'
const siteDescription = 'Coches de lujo, villas exclusivas, experiencias VIP y oportunidades seleccionadas. By José Andrés Gómez.'

export const Route = createRootRoute({
  head: () => ({
    links: [{rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg'}, {rel: 'image_src', href: OG_IMAGE}, {rel: 'manifest', href: '/manifest.webmanifest'}, {rel: 'apple-touch-icon', sizes: '180x180', href: '/icons/apple-touch-icon.png'}],
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1, viewport-fit=cover',
      },
      {
        title: siteName,
      },
      {
        name: 'description',
        content: siteDescription,
      },
      {
        property: 'og:title',
        content: siteName,
      },
      {
        property: 'og:description',
        content: siteDescription,
      },
      {
        property: 'og:type',
        content: 'website',
      },
      {
        name: 'twitter:card',
        content: 'summary_large_image',
      },
      // Share preview image (WhatsApp, Telegram, Facebook, LinkedIn, X, iMessage).
      { property: 'og:site_name', content: 'AUREON AI PROJECT' },
      { property: 'og:locale', content: 'es_ES' },
      { property: 'og:image', content: OG_IMAGE },
      { property: 'og:image:secure_url', content: OG_IMAGE },
      { property: 'og:image:type', content: 'image/jpeg' },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:image:alt', content: 'AUREON AI PROJECT by José Andrés Gómez: coches de lujo, villas, experiencias VIP e inteligencia artificial' },
      { name: 'twitter:image', content: OG_IMAGE },
      { name: 'twitter:title', content: siteName },
      { name: 'twitter:description', content: siteDescription },
      { name: 'theme-color', content: '#0b0b09' },
      // Installable app (Add to Home Screen): full screen, dark status bar.
      { name: 'mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-title', content: 'AUREON' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
    ],
  }),
  shellComponent: RootDocument,
  notFoundComponent: NotFoundPage,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <HeadContent />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8930598875852616"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster />
        <Scripts />
      </body>
    </html>
  )
}
