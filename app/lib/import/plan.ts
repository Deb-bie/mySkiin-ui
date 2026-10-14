// Compares parsed rows with what is already in Firestore and decides what to create or update.
// Pure functions only, so the preview and the import use exactly the same decisions.

import { Brand, Category, PriceTier, Product } from '../../models/model'
import { ParsedBrand, ParsedCatalog, ParsedProduct, ParsedProductFields } from './catalog'

export type ExistingProductMode = 'skip' | 'update'

export interface PlannedBrand {
  key: string            // lower-case brand name
  name: string
  existingId?: string    // set when the brand is already in Firestore
  country: string
  website: string
  priceTier: PriceTier | ''
  /** Only empty fields on an existing brand are filled in. */
  fill: Partial<Pick<Brand, 'country' | 'website' | 'priceTier'>>
}

export interface PlannedCategory {
  brandKey: string
  name: string
}

export interface PlannedProduct {
  source: ParsedProduct
  brandKey: string
  existingId?: string
  /** Fields to write. For updates this only contains non-empty imported values. */
  data: Partial<ParsedProductFields> & { categoryNames: string[]; brandName: string }
}

export interface ImportPlan {
  brands: PlannedBrand[]
  newBrands: number
  brandsToFill: number
  categoriesToCreate: PlannedCategory[]
  productsToCreate: PlannedProduct[]
  productsToUpdate: PlannedProduct[]
  productsSkipped: PlannedProduct[]
  existingCategories: Record<string, Category[]>  // by brand key
}

const key = (s: string) => s.trim().toLowerCase()

const isEmpty = (v: unknown) =>
  v == null || v === '' || (Array.isArray(v) && v.length === 0)

export function buildPlan(
  parsed: ParsedCatalog,
  existingBrands: Brand[],
  existingProducts: Product[],
  categoriesByBrandId: Record<string, Category[]>,
  mode: ExistingProductMode,
): ImportPlan {
  const brandByKey = new Map(existingBrands.map(b => [key(b.name), b]))
  const productByKey = new Map(existingProducts.map(p => [`${key(p.brandName ?? '')}|${key(p.name ?? '')}`, p]))

  // --- brands: from the Brands sheet first, then any brand mentioned on a product row
  const planned = new Map<string, PlannedBrand>()
  const tiersByBrand = new Map<string, Map<string, number>>()
  const upsertBrand = (name: string, country: string, website: string, tier: PriceTier | '') => {
    const k = key(name)
    const prev = planned.get(k)
    if (prev) {
      prev.country ||= country
      prev.website ||= website
      prev.priceTier ||= tier
      return
    }
    const existing = brandByKey.get(k)
    planned.set(k, { key: k, name: existing?.name ?? name.trim(), existingId: existing?.id, country, website, priceTier: tier, fill: {} })
  }
  parsed.brands.forEach((b: ParsedBrand) => upsertBrand(b.name, b.country, b.website, b.priceTier))
  for (const p of parsed.products) {
    upsertBrand(p.brandName, p.brandCountry, p.brandWebsite, '')
    if (p.fields.priceTier) {
      const m = tiersByBrand.get(key(p.brandName)) ?? new Map<string, number>()
      m.set(p.fields.priceTier, (m.get(p.fields.priceTier) ?? 0) + 1)
      tiersByBrand.set(key(p.brandName), m)
    }
  }
  // Brand tier falls back to the most common tier of its products
  for (const b of planned.values()) {
    if (!b.priceTier) {
      const m = tiersByBrand.get(b.key)
      if (m) b.priceTier = [...m.entries()].sort((a, z) => z[1] - a[1])[0][0] as PriceTier
    }
    if (b.existingId) {
      const ex = brandByKey.get(b.key)!
      if (!ex.country && b.country) b.fill.country = b.country
      if (!ex.website && b.website) b.fill.website = b.website
      if (!ex.priceTier && b.priceTier) b.fill.priceTier = b.priceTier
    }
  }

  // --- categories that don't exist yet under each brand
  const existingCategories: Record<string, Category[]> = {}
  for (const b of planned.values()) existingCategories[b.key] = b.existingId ? (categoriesByBrandId[b.existingId] ?? []) : []
  const catSeen = new Set<string>()
  const categoriesToCreate: PlannedCategory[] = []
  for (const p of parsed.products) {
    const bk = key(p.brandName)
    const have = new Set(existingCategories[bk].map(c => key(c.name)))
    for (const c of p.categoryNames) {
      const id = `${bk}|${key(c)}`
      if (have.has(key(c)) || catSeen.has(id)) continue
      catSeen.add(id)
      categoriesToCreate.push({ brandKey: bk, name: c })
    }
  }

  // --- products
  const productsToCreate: PlannedProduct[] = []
  const productsToUpdate: PlannedProduct[] = []
  const productsSkipped: PlannedProduct[] = []
  for (const p of parsed.products) {
    const bk = key(p.brandName)
    const brandName = planned.get(bk)!.name
    const existing = productByKey.get(`${bk}|${key(p.fields.name)}`)
    if (!existing) {
      productsToCreate.push({ source: p, brandKey: bk, data: { ...p.fields, categoryNames: p.categoryNames, brandName } })
      continue
    }
    if (mode === 'skip') {
      productsSkipped.push({ source: p, brandKey: bk, existingId: existing.id, data: { categoryNames: p.categoryNames, brandName } })
      continue
    }
    // Update: only write values the file actually has, so blanks never wipe existing data
    const data: PlannedProduct['data'] = { categoryNames: p.categoryNames.length ? p.categoryNames : (existing.categoryNames ?? []), brandName }
    for (const [k, v] of Object.entries(p.fields) as [keyof ParsedProductFields, unknown][]) {
      if (k === 'pregnancySafe' && v === 'unverified') continue
      if (!isEmpty(v)) (data as Record<string, unknown>)[k] = v
    }
    productsToUpdate.push({ source: p, brandKey: bk, existingId: existing.id, data })
  }

  const brands = [...planned.values()]
  return {
    brands,
    newBrands: brands.filter(b => !b.existingId).length,
    brandsToFill: brands.filter(b => b.existingId && Object.keys(b.fill).length).length,
    categoriesToCreate,
    productsToCreate,
    productsToUpdate,
    productsSkipped,
    existingCategories,
  }
}
