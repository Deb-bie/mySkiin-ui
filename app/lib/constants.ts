import { Option } from '../models/model'

export const toOptions = (values: readonly string[]): Option[] => values.map(v => ({ value: v, label: v }))

export const SKIN_TYPES = ['Normal', 'Dry', 'Oily', 'Combination', 'Sensitive', 'All'] as const

export const CONCERNS = [
  'Acne', 'Blackheads', 'Large Pores', 'Oiliness', 'Dryness', 'Dehydration',
  'Sensitivity', 'Redness', 'Barrier Damage', 'Dullness', 'Uneven Tone', 'Uneven Texture',
  'Hyperpigmentation', 'Fine Lines', 'Wrinkles', 'Loss of Firmness', 'Dark Circles',
  'Puffiness', 'Sun Protection', 'Makeup Removal',
] as const

export const CATEGORIES = [
  'Cleanser', 'Exfoliant', 'Toner', 'Serum', 'Spot Treatment', 'Eye Cream', 'Moisturizer',
  'Face Oil', 'Face Mask', 'Sunscreen', 'Tinted Moisturizer', 'Primer', 'Neck Cream',
  'Pore Strips', 'Body Care',
] as const

/** Suggested position of a product in a routine, by category (1 = first). */
export const STEP_ORDER_BY_CATEGORY: Record<string, number> = {
  'Cleanser': 1, 'Exfoliant': 2, 'Face Mask': 2, 'Pore Strips': 2, 'Body Care': 2,
  'Toner': 3, 'Serum': 4, 'Spot Treatment': 5, 'Eye Cream': 6, 'Moisturizer': 7,
  'Neck Cream': 7, 'Face Oil': 8, 'Tinted Moisturizer': 9, 'Sunscreen': 9, 'Primer': 10,
}

export const TEXTURES = [
  'Balm', 'Bar', 'Clay', 'Cream', 'Essence', 'Fluid', 'Foam', 'Gel', 'Jelly', 'Liquid',
  'Lotion', 'Milk', 'Mist', 'Oil', 'Pad', 'Patch', 'Powder', 'Scrub', 'Serum', 'Sheet',
  'Spray', 'Stick', 'Strip',
] as const

export const FREQUENCIES = ['Twice daily', 'Daily', '2–3x/week', '1–2x/week', 'As needed'] as const

export const EXPERIENCE_LEVELS = ['Beginner', 'Intermediate', 'Advanced'] as const
export const TIMES_OF_DAY = ['AM', 'PM', 'Both'] as const
export const PRICE_TIERS = ['Inexpensive', 'Mid-range', 'High-end'] as const
export const DATA_CONFIDENCE = ['High', 'Medium', 'Low'] as const

export const PREGNANCY_OPTIONS: { value: 'yes' | 'no' | 'consult' | 'unverified'; label: string }[] = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'consult', label: 'Consult doctor' },
  { value: 'unverified', label: 'Unverified' },
]

/** Classes used by the routine conflict checker in the app. */
export const ACTIVE_CLASSES = [
  'Retinoid', 'Retinoid (vitamin A ester)', 'AHA', 'BHA', 'PHA', 'AHA + BHA', 'Acid blend',
  'Vitamin C', 'Antioxidant', 'Vitamin B3', 'Benzoyl peroxide', 'Antibacterial', 'Azelaic acid',
  'Brightening agent', 'Peptide', 'Growth factor', 'Humectant', 'Barrier lipid', 'Enzyme',
  'Mineral UV filter', 'Chemical UV filter', 'UV filters', 'Retinol alternative', 'Other',
] as const

/**
 * Sub-collections the mobile app may keep under users/{uid}. The client SDK cannot list
 * sub-collections, so the user detail page checks these names. Add or rename to match the app.
 */
export const USER_SUBCOLLECTIONS = ['assessments', 'routines', 'products', 'shelf', 'diary', 'completions', 'reminders'] as const
