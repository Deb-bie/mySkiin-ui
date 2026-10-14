// Turns spreadsheet rows into clean brand and product records.
// Accepts the mySkiin catalog workbook (Products + Brands sheets) or any CSV/XLSX
// whose headers match one of the aliases below.

import {
  ActiveIngredient, DataConfidence, ExperienceLevel, PregnancySafe, PriceTier, TimeOfDay, TriState,
} from '../../models/model'
import { CATEGORIES, CONCERNS, SKIN_TYPES, STEP_ORDER_BY_CATEGORY } from '../constants'
import { Sheet } from './readers'

export type ProductField =
  | 'brandName' | 'name' | 'category' | 'subtitle' | 'description' | 'steps' | 'tags'
  | 'skinType' | 'notSuitableSkinTypes' | 'concerns' | 'primaryConcern' | 'experienceLevel'
  | 'isFragranceFree' | 'isNonComedogenic' | 'pregnancySafe' | 'ingredients' | 'keyIngredients'
  | 'activeIngredients' | 'timeOfDay' | 'stepOrder' | 'frequency' | 'texture' | 'priceTier'
  | 'periodAfterOpeningMonths' | 'barcode' | 'productUrl' | 'image' | 'imageAlt'
  | 'dataConfidence' | 'country' | 'brandWebsite'

const PRODUCT_ALIASES: Record<ProductField, string[]> = {
  brandName: ['brand', 'brandname'],
  name: ['productname', 'product', 'name', 'title'],
  category: ['category', 'categories', 'categorynames', 'producttype', 'type'],
  subtitle: ['subtitle', 'shortdescription', 'smalldescription', 'tagline'],
  description: ['description', 'about', 'productdescription'],
  steps: ['howtouse', 'usage', 'steps', 'applicationsteps', 'directions', 'instructions'],
  tags: ['tags', 'tag'],
  skinType: ['suitableskintypes', 'skintypes', 'skintype', 'suitablefor', 'suitableskintype'],
  notSuitableSkinTypes: ['notsuitablefor', 'notsuitableskintypes', 'notsuitable', 'avoidfor'],
  concerns: ['concernstargeted', 'concerns', 'targetsconcerns', 'skinconcerns'],
  primaryConcern: ['primaryconcern', 'mainconcern'],
  experienceLevel: ['experiencelevel', 'experience', 'level'],
  isFragranceFree: ['fragrancefree', 'isfragrancefree'],
  isNonComedogenic: ['noncomedogenic', 'isnoncomedogenic'],
  pregnancySafe: ['pregnancysafe', 'ispregnancysafe', 'pregnancy'],
  ingredients: ['fullingredientlistinci', 'fullingredientlist', 'ingredients', 'inci', 'ingredientlist', 'fullingredients'],
  keyIngredients: ['keyingredients'],
  activeIngredients: ['activeingredientsnameclassstrength', 'activeingredients', 'actives'],
  timeOfDay: ['timeofday', 'ampm', 'time'],
  stepOrder: ['steporder', 'step', 'order', 'routinestep'],
  frequency: ['recommendedfrequency', 'frequency', 'howoften'],
  texture: ['texture'],
  priceTier: ['pricetier', 'pricerange', 'price', 'tier'],
  periodAfterOpeningMonths: ['periodafteropeningmonths', 'periodafteropening', 'pao', 'paomonths'],
  barcode: ['barcode', 'barcodeupc', 'upc', 'ean', 'gtin'],
  productUrl: ['productpage', 'producturl', 'url', 'link', 'productlink'],
  image: ['imageurl', 'image', 'imagelink', 'photo', 'photourl'],
  imageAlt: ['imagealt', 'alttext', 'imagealttext'],
  dataConfidence: ['dataconfidence', 'confidence'],
  country: ['country', 'countryoforigin', 'brandcountry'],
  brandWebsite: ['brandwebsite', 'website', 'officialwebsite', 'brandurl', 'brandsite'],
}

type BrandField = 'name' | 'country' | 'website' | 'priceTier'
const BRAND_ALIASES: Record<BrandField, string[]> = {
  name: ['brand', 'brandname', 'name'],
  country: ['country', 'countryoforigin'],
  website: ['officialwebsite', 'website', 'brandwebsite', 'url', 'link'],
  priceTier: ['pricetier', 'pricerange', 'price', 'tier'],
}

export interface ParsedBrand {
  row: number
  sheet: string
  name: string
  country: string
  website: string
  priceTier: PriceTier | ''
}

export interface ParsedProductFields {
  name: string
  subtitle: string
  description: string
  steps: string
  howToUse: string
  tags: string[]
  image: string
  imageAlt: string
  skinType: string[]
  notSuitableSkinTypes: string[]
  concerns: string[]
  primaryConcern: string
  experienceLevel: ExperienceLevel | ''
  isFragranceFree: TriState
  isNonComedogenic: TriState
  pregnancySafe: PregnancySafe
  keyIngredients: string[]
  ingredients: string[]
  activeIngredients: ActiveIngredient[]
  timeOfDay: TimeOfDay | ''
  stepOrder: number | null
  frequency: string
  texture: string
  priceTier: PriceTier | ''
  periodAfterOpeningMonths: number | null
  barcode: string
  productUrl: string
  dataConfidence: DataConfidence | ''
}

export interface ParsedProduct {
  row: number
  sheet: string
  brandName: string
  brandCountry: string
  brandWebsite: string
  categoryNames: string[]
  fields: ParsedProductFields
  warnings: string[]
}

export interface RowIssue {
  sheet: string
  row: number
  message: string
  level: 'error' | 'warning'
}

export interface ParsedCatalog {
  products: ParsedProduct[]
  brands: ParsedBrand[]
  issues: RowIssue[]
  skippedPlaceholders: number
  sheetsUsed: { name: string; kind: 'products' | 'brands'; rows: number; unmatchedHeaders: string[] }[]
  sheetsIgnored: string[]
}

// ---------- normalizers ----------
const norm = (s: string) => (s ?? '').toLowerCase().replace(/[^a-z0-9]/g, '')
const PLACEHOLDERS = new Set([
  'pending', 'verifyonproductpage', 'notstated', 'nonenoted', 'na', 'none', 'notyetcollected',
  'unverified', 'unknown', 'tbd', 'null', '', 'notcollected',
])
export const isPlaceholder = (v: string) => PLACEHOLDERS.has(norm(v)) || /^[-–—]+$/.test((v ?? '').trim())
const clean = (v: string | undefined) => {
  const t = (v ?? '').trim()
  return isPlaceholder(t) ? '' : t
}
const titleCase = (s: string) => s.trim().toLowerCase().replace(/(^|[\s/-])\w/g, c => c.toUpperCase())

export function splitList(v: string): string[] {
  const t = clean(v)
  if (!t) return []
  return Array.from(new Set(t.split(/\s*[,;|]\s*/).map(s => s.trim()).filter(s => s && !isPlaceholder(s))))
}

export function splitIngredients(v: string): string[] {
  const t = clean(v)
  if (!t) return []
  // split on commas that are not inside parentheses and not followed by a digit (e.g. 1,2-Hexanediol)
  return t.split(/,(?![^(]*\))(?!\d)/).map(s => s.trim().replace(/\.$/, '')).filter(Boolean)
}

const canon = (value: string, list: readonly string[]) => list.find(x => norm(x) === norm(value))

const CATEGORY_SYNONYMS: Record<string, string> = {
  moisturiser: 'Moisturizer', moisturizers: 'Moisturizer', moisturisers: 'Moisturizer',
  cleansers: 'Cleanser', facewash: 'Cleanser', wash: 'Cleanser',
  serums: 'Serum', ampoule: 'Serum', essence: 'Toner', toners: 'Toner', mist: 'Toner',
  spf: 'Sunscreen', sunscreens: 'Sunscreen', suncare: 'Sunscreen',
  mask: 'Face Mask', masks: 'Face Mask', facemasks: 'Face Mask',
  exfoliator: 'Exfoliant', exfoliants: 'Exfoliant', peel: 'Exfoliant',
  eyecream: 'Eye Cream', eyecare: 'Eye Cream', oil: 'Face Oil', faceoils: 'Face Oil',
}
export function normalizeCategory(v: string): string {
  return canon(v, CATEGORIES) ?? CATEGORY_SYNONYMS[norm(v)] ?? titleCase(v)
}

const SKIN_SYNONYMS: Record<string, string> = {
  allskintypes: 'All', all: 'All', combo: 'Combination', combinationskin: 'Combination',
  normalskin: 'Normal', dryskin: 'Dry', oilyskin: 'Oily', sensitiveskin: 'Sensitive',
}
function normalizeSkinTypes(v: string, warnings: string[], label: string): string[] {
  const out: string[] = []
  for (const item of splitList(v)) {
    const m = canon(item, SKIN_TYPES) ?? SKIN_SYNONYMS[norm(item)]
    if (m) out.push(m)
    else warnings.push(`${label}: "${item}" is not a known skin type and was left out`)
  }
  return Array.from(new Set(out))
}

const normalizeConcern = (v: string) => canon(v, CONCERNS) ?? titleCase(v)

export function parseTriState(v: string): TriState {
  const n = norm(v)
  if (['yes', 'y', 'true', '1'].includes(n)) return true
  if (['no', 'n', 'false', '0'].includes(n)) return false
  return null
}

export function parsePregnancy(v: string): PregnancySafe {
  const n = norm(v)
  if (['yes', 'y', 'true', 'safe'].includes(n)) return 'yes'
  if (['no', 'n', 'false', 'avoid', 'notsafe'].includes(n)) return 'no'
  if (n.includes('consult') || n.includes('doctor') || n === 'caution') return 'consult'
  return 'unverified'
}

export function parseTimeOfDay(v: string): TimeOfDay | '' {
  const n = norm(v)
  if (!n || isPlaceholder(v)) return ''
  if (['both', 'ampm', 'amandpm', 'anytime', 'morningandnight', 'dayandnight'].includes(n)) return 'Both'
  if (['am', 'morning', 'day', 'daytime'].includes(n)) return 'AM'
  if (['pm', 'night', 'evening', 'nighttime'].includes(n)) return 'PM'
  return ''
}

export function parsePriceTier(v: string): PriceTier | '' {
  const raw = (v ?? '').trim()
  const n = norm(raw)
  if (raw === '$') return 'Inexpensive'
  if (raw === '$$') return 'Mid-range'
  if (raw === '$$$') return 'High-end'
  if (!n || isPlaceholder(raw)) return ''
  if (['inexpensive', 'budget', 'drugstore', 'low', 'cheap', 'affordable'].includes(n)) return 'Inexpensive'
  if (['midrange', 'mid', 'medium', 'moderate', 'midprice', 'mediumprice'].includes(n)) return 'Mid-range'
  if (['highend', 'high', 'luxury', 'premium', 'prestige', 'expensive'].includes(n)) return 'High-end'
  return ''
}

export function parseExperience(v: string): ExperienceLevel | '' {
  const n = norm(v)
  if (n.startsWith('begin')) return 'Beginner'
  if (n.startsWith('inter')) return 'Intermediate'
  if (n.startsWith('adv')) return 'Advanced'
  return ''
}

export function parseConfidence(v: string): DataConfidence | '' {
  const n = norm(v)
  if (n === 'high') return 'High'
  if (n === 'medium' || n === 'med') return 'Medium'
  if (n === 'low') return 'Low'
  return ''
}

/** "Glycolic Acid (AHA, 5%); Vitamin C (Antioxidant, Not stated)" or "Name:Class:Strength; ..." */
export function parseActives(v: string): ActiveIngredient[] {
  const t = clean(v)
  if (!t) return []
  const out: ActiveIngredient[] = []
  for (const part of t.split(/\s*;\s*/).filter(Boolean)) {
    let name = part, cls = '', strength = ''
    const paren = /^(.*?)\s*\((.*)\)\s*$/.exec(part)
    if (paren) {
      name = paren[1]
      const inner = paren[2]
      const comma = inner.lastIndexOf(',')
      if (comma >= 0) { cls = inner.slice(0, comma); strength = inner.slice(comma + 1) } else cls = inner
    } else if (part.includes(':')) {
      const bits = part.split(':')
      name = bits[0] ?? ''; cls = bits[1] ?? ''; strength = bits.slice(2).join(':')
    }
    name = name.trim(); cls = cls.trim(); strength = strength.trim()
    if (isPlaceholder(strength)) strength = ''
    if (name && !isPlaceholder(name)) out.push({ name, class: cls, strength })
  }
  return out
}

const parseNumber = (v: string): number | null => {
  const m = /-?\d+(\.\d+)?/.exec(clean(v))
  return m ? Number(m[0]) : null
}
const url = (v: string) => (/^https?:\/\//i.test((v ?? '').trim()) ? v.trim() : '')

// ---------- header mapping ----------
function mapHeaders<F extends string>(header: string[], aliases: Record<F, string[]>) {
  const lookup = new Map<string, F>()
  for (const [field, list] of Object.entries(aliases) as [F, string[]][]) {
    for (const a of list) if (!lookup.has(a)) lookup.set(a, field)
  }
  const map = new Map<F, number>()
  const unmatched: string[] = []
  header.forEach((h, i) => {
    const f = lookup.get(norm(h))
    if (f && !map.has(f)) map.set(f, i)
    else if ((h ?? '').trim()) unmatched.push(h.trim())
  })
  return { map, unmatched }
}

function classifySheet(sheet: Sheet): 'products' | 'brands' | null {
  if (/active|note|readme|instruction|legend|summary/i.test(sheet.name)) return null
  if (/product/i.test(sheet.name)) return 'products'
  if (/brand/i.test(sheet.name)) return 'brands'
  const header = sheet.rows[0] ?? []
  const { map } = mapHeaders(header, PRODUCT_ALIASES)
  if (map.has('brandName') && map.has('name')) return 'products'
  if (map.has('brandName') || map.has('name')) return 'brands'
  return null
}

// ---------- main ----------
export function parseCatalog(sheets: Sheet[]): ParsedCatalog {
  const result: ParsedCatalog = {
    products: [], brands: [], issues: [], skippedPlaceholders: 0, sheetsUsed: [], sheetsIgnored: [],
  }
  const seenProducts = new Set<string>()
  const seenBrands = new Set<string>()

  for (const sheet of sheets) {
    const kind = classifySheet(sheet)
    if (!kind || sheet.rows.length < 2) { result.sheetsIgnored.push(sheet.name); continue }
    const header = sheet.rows[0]

    if (kind === 'brands') {
      const { map, unmatched } = mapHeaders(header, BRAND_ALIASES)
      if (!map.has('name')) { result.sheetsIgnored.push(sheet.name); continue }
      const cell = (r: string[], f: BrandField) => (map.has(f) ? (r[map.get(f)!] ?? '') : '')
      let count = 0
      sheet.rows.slice(1).forEach((r, i) => {
        const row = i + 2
        const name = clean(cell(r, 'name'))
        if (!name) { result.issues.push({ sheet: sheet.name, row, level: 'error', message: 'Missing brand name — row skipped' }); return }
        const key = name.toLowerCase()
        if (seenBrands.has(key)) {
          result.issues.push({ sheet: sheet.name, row, level: 'warning', message: `Brand "${name}" appears more than once — kept the first row` })
          return
        }
        seenBrands.add(key)
        result.brands.push({
          row, sheet: sheet.name, name,
          country: clean(cell(r, 'country')),
          website: url(cell(r, 'website')),
          priceTier: parsePriceTier(cell(r, 'priceTier')),
        })
        count++
      })
      result.sheetsUsed.push({ name: sheet.name, kind, rows: count, unmatchedHeaders: unmatched })
      continue
    }

    const { map, unmatched } = mapHeaders(header, PRODUCT_ALIASES)
    if (!map.has('name') || !map.has('brandName')) {
      result.issues.push({ sheet: sheet.name, row: 1, level: 'error', message: 'Sheet needs at least a "Brand" and a "Product Name" column' })
      result.sheetsIgnored.push(sheet.name)
      continue
    }
    const cell = (r: string[], f: ProductField) => (map.has(f) ? (r[map.get(f)!] ?? '') : '')
    let count = 0
    sheet.rows.slice(1).forEach((r, i) => {
      const row = i + 2
      const rawName = (cell(r, 'name') ?? '').trim()
      const brandName = clean(cell(r, 'brandName'))
      if (/^not yet collected$/i.test(rawName)) { result.skippedPlaceholders++; return }
      const name = clean(rawName)
      if (!name || !brandName) {
        result.issues.push({ sheet: sheet.name, row, level: 'error', message: `${!brandName ? 'Missing brand' : 'Missing product name'} — row skipped` })
        return
      }
      const key = `${brandName.toLowerCase()}|${name.toLowerCase()}`
      if (seenProducts.has(key)) {
        result.issues.push({ sheet: sheet.name, row, level: 'warning', message: `"${brandName} – ${name}" appears more than once — kept the first row` })
        return
      }
      seenProducts.add(key)

      const warnings: string[] = []
      const categoryNames = Array.from(new Set(splitList(cell(r, 'category')).map(normalizeCategory)))
      const concerns = Array.from(new Set(splitList(cell(r, 'concerns')).map(normalizeConcern)))
      const primaryRaw = clean(cell(r, 'primaryConcern'))
      const timeRaw = clean(cell(r, 'timeOfDay'))
      const timeOfDay = parseTimeOfDay(timeRaw)
      if (timeRaw && !timeOfDay) warnings.push(`Time of day "${timeRaw}" not recognised (use AM, PM or Both)`)
      const tierRaw = clean(cell(r, 'priceTier'))
      const priceTier = parsePriceTier(tierRaw)
      if (tierRaw && !priceTier) warnings.push(`Price tier "${tierRaw}" not recognised (use Inexpensive, Mid-range or High-end)`)
      let stepOrder = parseNumber(cell(r, 'stepOrder'))
      if (stepOrder == null && categoryNames[0] && STEP_ORDER_BY_CATEGORY[categoryNames[0]]) {
        stepOrder = STEP_ORDER_BY_CATEGORY[categoryNames[0]]
      }
      if (!categoryNames.length) warnings.push('No category')
      const textureRaw = clean(cell(r, 'texture'))

      result.products.push({
        row, sheet: sheet.name, brandName,
        brandCountry: clean(cell(r, 'country')),
        brandWebsite: url(cell(r, 'brandWebsite')),
        categoryNames,
        fields: {
          name,
          subtitle: clean(cell(r, 'subtitle')),
          description: clean(cell(r, 'description')),
          steps: clean(cell(r, 'steps')),
          howToUse: clean(cell(r, 'steps')),
          tags: splitList(cell(r, 'tags')),
          image: url(cell(r, 'image')),
          imageAlt: clean(cell(r, 'imageAlt')),
          skinType: normalizeSkinTypes(cell(r, 'skinType'), warnings, 'Suitable skin types'),
          notSuitableSkinTypes: normalizeSkinTypes(cell(r, 'notSuitableSkinTypes'), warnings, 'Not suitable for').filter(s => s !== 'All'),
          concerns,
          primaryConcern: primaryRaw ? normalizeConcern(primaryRaw) : (concerns[0] ?? ''),
          experienceLevel: parseExperience(cell(r, 'experienceLevel')),
          isFragranceFree: parseTriState(cell(r, 'isFragranceFree')),
          isNonComedogenic: parseTriState(cell(r, 'isNonComedogenic')),
          pregnancySafe: parsePregnancy(cell(r, 'pregnancySafe')),
          keyIngredients: splitList(cell(r, 'keyIngredients')),
          ingredients: splitIngredients(cell(r, 'ingredients')),
          activeIngredients: parseActives(cell(r, 'activeIngredients')),
          timeOfDay,
          stepOrder,
          frequency: clean(cell(r, 'frequency')),
          texture: textureRaw ? titleCase(textureRaw) : '',
          priceTier,
          periodAfterOpeningMonths: parseNumber(cell(r, 'periodAfterOpeningMonths')),
          barcode: clean(cell(r, 'barcode')),
          productUrl: url(cell(r, 'productUrl')),
          dataConfidence: parseConfidence(cell(r, 'dataConfidence')),
        },
        warnings,
      })
      for (const w of warnings) result.issues.push({ sheet: sheet.name, row, level: 'warning', message: `${brandName} – ${name}: ${w}` })
      count++
    })
    result.sheetsUsed.push({ name: sheet.name, kind, rows: count, unmatchedHeaders: unmatched })
  }
  return result
}

// ---------- template ----------
export const TEMPLATE_HEADERS = [
  'Brand', 'Country', 'Brand Website', 'Category', 'Product Name', 'Short Description', 'Product Page', 'Image URL',
  'Description', 'How to Use', 'Tags', 'Suitable Skin Types', 'Not Suitable For', 'Concerns Targeted',
  'Primary Concern', 'Experience Level', 'Fragrance-Free', 'Non-Comedogenic', 'Pregnancy-Safe',
  'Full Ingredient List (INCI)', 'Key Ingredients', 'Active Ingredients', 'Time of Day', 'Step Order',
  'Recommended Frequency', 'Texture', 'Price Tier', 'Period After Opening (months)', 'Barcode', 'Data Confidence',
]

export const TEMPLATE_EXAMPLE = [
  'CeraVe', 'US', 'https://www.cerave.com', 'Cleanser', 'Hydrating Facial Cleanser', 'Non-foaming lotion cleanser',
  'https://www.cerave.com/skincare/cleansers/hydrating-facial-cleanser', '',
  'Non-foaming lotion cleanser that cleanses gently while restoring the barrier.', 'Massage onto damp skin and rinse.',
  'non-foaming cleanser, ceramides, dry skin', 'Normal, Dry, Sensitive', 'None noted', 'Dryness, Barrier Damage, Sensitivity',
  'Dryness', 'Beginner', 'Yes', 'Yes', 'Yes', '', 'Ceramides, Hyaluronic acid',
  'Ceramides (Barrier lipid, Not stated); Hyaluronic Acid (Humectant, Not stated)', 'Both', '1', 'Twice daily', 'Lotion',
  'Inexpensive', '12', '', 'High',
]

const csvCell = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v)
export const templateCsv = () => [TEMPLATE_HEADERS, TEMPLATE_EXAMPLE].map(r => r.map(csvCell).join(',')).join('\n') + '\n'
