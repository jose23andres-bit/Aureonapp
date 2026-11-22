// Public site address for absolute links in share cards (WhatsApp, Telegram, Facebook, X...).
// On Netlify, the build-time URL variable is the site's main address (custom domain if one is set).
declare const __SITE_URL__: string | undefined
export const SITE_URL = (typeof __SITE_URL__ === 'string' && __SITE_URL__ ? __SITE_URL__ : 'https://aureonaiproject.netlify.app').replace(/\/+$/, '')
export const OG_IMAGE = `${SITE_URL}/og-aureon.jpg`
