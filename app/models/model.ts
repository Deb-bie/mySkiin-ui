import { Timestamp } from "next/dist/server/lib/cache-handlers/types"

export interface Product {
    id: number
    name: string
    subtitle: string
    brand: Brand
    description: string
    tags?: string[]
    skinTypes?: string
    keyIngredients?: string[]
    category: string[]
    steps?: string
    image?: string
    imageAlt?: string 
    createdAt?: any
    updatedAt?: any
}


export interface Brand {
    id: string
    name: string

    categories: Category[]
    createdAt: Timestamp
}

export interface Category {
    id: string
    name: String
}



// USER
export interface User {
    id: number
    username: string
    email: string
    staus: 'paid' | 'free'
}


// ANALYTICS
export interface DashboardStats {
  totalUsers: number
  paidUsers: number
  freeUsers: number
  activeToday: number
  totalPosts: number
  publishedPosts: number
  draftPosts: number
  totalViews: number
  revenue: number
}


// PROPS
export interface ImageUploadProps {
  onImageSelect: (imageData: string) => void
  currentImage?: string
  altText?: string
  onAltTextChange?: (alt: string) => void
}

export interface CreateProductModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (post: {
    name: string
    subtitle: string
    brand?: string
    description?: string
    tags: string[]
    skinTypes?: string
    keyIngredients?: string[]
    category?: string[]
    steps?: string
    image?: string
    imageAlt?: string
  }) => void
}

export interface EditProductModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (post: any) => void
  product: any
}

export interface ViewUserModalProps {
  isOpen: boolean
  onClose: () => void
  user: any
  onDelete?: () => void
}


interface AddBrandModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (brand: {
    name: string,
    categories: Category[]
  }) => void
}



enum Status {
    published,
    draft,
    deleted,
    edited
    
}

