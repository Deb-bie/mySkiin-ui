import { Timestamp } from "next/dist/server/lib/cache-handlers/types"

export interface Product {
    id: string
    name: string
    subtitle: string
    brand: Brand
    description: string
    tags?: string[]
    skinTypes?: string[]
    keyIngredients?: string[]
    category: string[]
    steps?: string[]
    status?: Status
    image?: string
    imageAlt?: string 
    createdAt?: any
    updatedAt?: any
}


export interface Brand {
    id: string
    name: string
    createdAt: Timestamp
}

enum Status {
    published,
    draft,
    deleted,
    edited
    
}

