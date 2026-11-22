import type { Entry } from './content'
import { legacyCatalogItems } from './legacy-content'
import { contentItemToEntry, type ContentItem } from './supabase'

/**
 * Keeps the previously published catalogue as a local fallback. Database records
 * override the backup by slug, including unpublished records (which intentionally
 * hide a listing), but a database outage never turns into an empty catalogue.
 */
export function mergeCatalogEntries(databaseRows: ContentItem[]): Entry[] {
  const bySlug = new Map<string, Entry>()
  for (const item of legacyCatalogItems) {
    const entry = contentItemToEntry(item)
    if (entry.status === 'published') bySlug.set(entry.slug, entry)
  }
  for (const item of databaseRows) {
    const entry = contentItemToEntry(item)
    bySlug.set(entry.slug, entry)
  }
  return [...bySlug.values()]
    .filter((entry) => entry.status === 'published')
    .sort((a, b) => Number(a.data.sort_order ?? 0) - Number(b.data.sort_order ?? 0))
}
