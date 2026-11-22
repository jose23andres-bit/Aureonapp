import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import netlify from '@netlify/vite-plugin-tanstack-start'

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  // Absolute site URL for social share cards; Netlify sets URL during builds.
  define: { __SITE_URL__: JSON.stringify(process.env.URL || 'https://aureonaiproject.netlify.app') },
  plugins: [tailwindcss(), netlify(), tanstackStart(), viteReact()],
})

export default config
