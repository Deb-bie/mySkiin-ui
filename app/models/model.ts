// ===============================
// PRODUCTS
// ===============================
// Field names that already existed (name, subtitle, brandId, brandName, categoryIds,
// categoryNames, description, tags, skinType, keyIngredients, steps, image, imageAlt)
// are kept as-is so the mobile app keeps reading them. Everything else is additive.

export type TriState = boolean | null
export type PregnancySafe = 'yes' | 'no' | 'consult' | 'unverified'
export type TimeOfDay = 'AM' | 'PM' | 'Both'
export type ExperienceLevel = 'Beginner' | 'Intermediate' | 'Advanced'
export type PriceTier = 'Inexpensive' | 'Mid-range' | 'High-end'
export type DataConfidence = 'High' | 'Medium' | 'Low'
export type ProductSource = 'admin' | 'import' | 'user'

export interface ActiveIngredient {
  name: string
  class: string
  strength: string
}

export interface Product {
  id: string
  name: string
  subtitle?: string
  brandId: string
  brandName: string
  categoryIds?: string[]
  /** @deprecated older documents used this name; read it as a fallback */
  categoryId?: string[]
  categoryNames: string[]
  description: string
  /** How to use. Saved under both names: `howToUse` (clear name) and `steps` (what the mobile app already reads). */
  howToUse?: string
  steps?: string
  tags?: string[]
  image?: string
  imageAlt?: string

  // Suitability
  skinType?: string[]
  notSuitableSkinTypes?: string[]
  concerns?: string[]
  primaryConcern?: string
  experienceLevel?: ExperienceLevel | ''
  isFragranceFree?: TriState
  isNonComedogenic?: TriState
  pregnancySafe?: PregnancySafe

  // Ingredients
  keyIngredients?: string[]
  ingredients?: string[]
  activeIngredients?: ActiveIngredient[]

  // Routine placement
  timeOfDay?: TimeOfDay | ''
  stepOrder?: number | null
  frequency?: string
  texture?: string

  // Shelf life & meta
  periodAfterOpeningMonths?: number | null
  priceTier?: PriceTier | ''
  barcode?: string
  productUrl?: string
  dataConfidence?: DataConfidence | ''
  source?: ProductSource

  createdAt?: any
  updatedAt?: any
}

export type ProductInput = Omit<Product, 'id'>

export interface Brand {
  id: string
  name: string
  country?: string
  website?: string
  priceTier?: PriceTier | ''
  createdAt?: any
  updatedAt?: any
}

export interface Category {
  id: string
  name: string
  brandId: string
  createdAt?: any
  updatedAt?: any
}

// ===============================
// USERS
// ===============================
// User documents are written by the mobile app, so their shape is read defensively
// (see app/lib/userFields.ts). Any extra fields are kept and shown on the detail page.
export interface User {
  id: string
  username?: string
  email?: string
  [key: string]: any
}

export interface SubcollectionSummary {
  name: string
  count: number
  recent: Record<string, any>[]
  error?: string
}

// ===============================
// PROPS
// ===============================
export interface ImageUploadProps {
  onImageSelect: (imageData: string) => void
  currentImage?: string
  altText?: string
  onAltTextChange?: (alt: string) => void
}

export interface CreateProductModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (product: ProductInput) => void | Promise<void>
}

export interface EditProductModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (updates: Product) => void | Promise<void>
  product: Product | null
}

export interface ViewUserModalProps {
  isOpen: boolean
  onClose: () => void
  user: any
  onDelete?: () => void
}

export interface AddBrandModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (brand: { name: string; country?: string; website?: string; priceTier?: PriceTier | '' }) => void
}

export type Option = {
  label: string
  value: string
}
