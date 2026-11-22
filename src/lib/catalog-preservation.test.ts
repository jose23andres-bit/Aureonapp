import { describe, expect, it } from 'vitest'
import { mergeCatalogEntries } from './catalog-preservation'
import { legacyCatalogItems } from './legacy-content'
import { contentItemToEntry } from './supabase'

describe('catalog preservation', () => {
  it('keeps the legacy published catalogue when Supabase has no rows', () => {
    const entries = mergeCatalogEntries([])
    expect(entries.length).toBeGreaterThanOrEqual(35)
    expect(entries.some((entry) => entry.slug === 'villa-la-moraleja')).toBe(true)
    expect(entries.some((entry) => entry.slug === 'villa-estremera-madrid')).toBe(true)
    expect(entries.some((entry) => entry.slug === 'dolores-inversion-alicante')).toBe(true)
  })

  it('uses an edited database record without duplicating its legacy slug', () => {
    const legacy = legacyCatalogItems.find((item) => item.slug === 'villa-la-moraleja')!
    const edited = { ...legacy, title: 'Villa La Moraleja actualizada' }
    const entries = mergeCatalogEntries([edited])
    expect(entries.filter((entry) => entry.slug === legacy.slug)).toHaveLength(1)
    expect(entries.find((entry) => entry.slug === legacy.slug)?.title).toBe('Villa La Moraleja actualizada')
  })

  it('respects an explicit unpublish but does not delete the saved record', () => {
    const legacy = legacyCatalogItems.find((item) => item.slug === 'villa-la-moraleja')!
    const archived = { ...legacy, published: false, availability: 'unavailable' }
    const entries = mergeCatalogEntries([archived])
    expect(entries.some((entry) => entry.slug === legacy.slug)).toBe(false)
    expect(archived.id).toBe(legacy.id)
    expect(contentItemToEntry(archived).status).toBe('draft')
  })
})
