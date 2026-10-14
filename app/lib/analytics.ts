// Pure calculations for the Dashboard and Analytics pages.
import { Brand, Product, User } from '../models/model'
import { Datum } from '../components/charts'
import { userConcerns, userExperience, userJoined, userLastActive, userPlan, userSkinTone, userSkinTypes } from './userFields'

const DAY = 86_400_000

export function countBy(values: string[][], limit?: number): Datum[] {
  const m = new Map<string, number>()
  for (const list of values) for (const v of new Set(list)) if (v) m.set(v, (m.get(v) ?? 0) + 1)
  const out = [...m.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value)
  return limit ? out.slice(0, limit) : out
}

/** Sign-ups per week for the last `weeks` weeks (weeks start on Monday). */
export function weeklySignups(users: User[], weeks = 12): Datum[] {
  const now = new Date()
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7))
  const starts = Array.from({ length: weeks }, (_, i) => new Date(monday.getTime() - (weeks - 1 - i) * 7 * DAY))
  const counts = new Array(weeks).fill(0)
  for (const u of users) {
    const d = userJoined(u)
    if (!d) continue
    const i = Math.floor((d.getTime() - starts[0].getTime()) / (7 * DAY))
    if (i >= 0 && i < weeks) counts[i]++
  }
  return starts.map((s, i) => ({
    label: s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    hint: `Week of ${s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
    value: counts[i],
  }))
}

export function userSummary(users: User[]) {
  const now = Date.now()
  const joined = users.map(userJoined)
  const active = users.map(userLastActive)
  const plans = users.map(userPlan)
  const hasActivity = active.some(Boolean)
  const hasPlan = plans.some(p => p !== 'Unknown')
  return {
    total: users.length,
    new7: joined.filter(d => d && now - d.getTime() <= 7 * DAY).length,
    new30: joined.filter(d => d && now - d.getTime() <= 30 * DAY).length,
    active1: hasActivity ? active.filter(d => d && now - d.getTime() <= DAY).length : null,
    active7: hasActivity ? active.filter(d => d && now - d.getTime() <= 7 * DAY).length : null,
    active30: hasActivity ? active.filter(d => d && now - d.getTime() <= 30 * DAY).length : null,
    premium: hasPlan ? plans.filter(p => p === 'Premium').length : null,
    plans: countBy(plans.map(p => [p])),
    skinTypes: countBy(users.map(userSkinTypes)),
    concerns: countBy(users.map(userConcerns), 10),
    skinTones: countBy(users.map(u => [userSkinTone(u)].filter(Boolean))),
    experience: countBy(users.map(u => [userExperience(u)].filter(Boolean))),
    withSkinProfile: users.filter(u => userSkinTypes(u).length > 0).length,
  }
}

export function catalogSummary(products: Product[], brands: Brand[]) {
  const n = products.length
  const has = (f: (p: Product) => unknown) => products.filter(p => {
    const v = f(p)
    return Array.isArray(v) ? v.length > 0 : v != null && v !== ''
  }).length
  const brandCounts = countBy(products.map(p => [p.brandName ?? 'Unknown']))
  return {
    products: n,
    brands: brands.length,
    brandsWithoutProducts: brands.filter(b => !products.some(p => p.brandId === b.id)).length,
    byCategory: countBy(products.map(p => p.categoryNames ?? [])),
    byTier: ['Inexpensive', 'Mid-range', 'High-end', ''].map(t => ({
      label: t || 'Not set', value: products.filter(p => (p.priceTier ?? '') === t).length,
    })).filter(d => d.value > 0),
    topBrands: brandCounts.slice(0, 10),
    pregnancy: [
      { label: 'Yes', value: products.filter(p => p.pregnancySafe === 'yes').length },
      { label: 'Consult doctor', value: products.filter(p => p.pregnancySafe === 'consult').length },
      { label: 'No', value: products.filter(p => p.pregnancySafe === 'no').length },
      { label: 'Unverified / not set', value: products.filter(p => !p.pregnancySafe || p.pregnancySafe === 'unverified').length },
    ],
    completeness: [
      { label: 'Image', value: has(p => p.image) },
      { label: 'Description', value: has(p => p.description) },
      { label: 'How to use', value: has(p => p.steps) },
      { label: 'Skin types', value: has(p => p.skinType) },
      { label: 'Concerns', value: has(p => p.concerns) },
      { label: 'Key ingredients', value: has(p => p.keyIngredients) },
      { label: 'Full ingredient list (INCI)', value: has(p => p.ingredients) },
      { label: 'Time of day & step order', value: products.filter(p => p.timeOfDay && p.stepOrder != null).length },
      { label: 'Price tier', value: has(p => p.priceTier) },
    ],
  }
}
