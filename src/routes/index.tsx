import { createFileRoute } from '@tanstack/react-router'
import { Aureon } from '../components/aureon'
import { SITE_URL } from '../lib/site-url'

export const Route = createFileRoute('/')({
  component: Aureon,
  head: () => ({
    meta: [
      { title: 'AUREON AI PROJECT | Coches de lujo, villas y oportunidades' },
      {
        name: 'description',
        content:
          'Descubre coches de lujo, alquiler de superdeportivos, villas exclusivas y oportunidades seleccionadas en Aureon AI Project.',
      },
      { property: 'og:title', content: 'AUREON AI PROJECT' },
      {
        property: 'og:description',
        content:
          'Coches de lujo, villas exclusivas, oportunidades y herramientas de inteligencia artificial.',
      },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: `${SITE_URL}/` },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
    links: [
      { rel: 'canonical', href: `${SITE_URL}/` },
    ],
  }),
})
