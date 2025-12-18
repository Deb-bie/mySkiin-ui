'use client'
import { useState, useEffect } from 'react'
import { appStore, AppState } from '../lib/store'
import { Brand, Category, Product } from '../models/model'

export function useAppState() {
  const [state, setState] = useState<AppState>(appStore.getState())

  useEffect(() => {
    const unsubscribe = appStore.subscribe(setState)
    appStore.initialize()
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe()
      }
    }
  }, [])

  return {
    state,
    loading: state.loading,
    error: state.error,
    
    // Products actions
    addProduct: (product: Omit<Product, 'id' |'status'>) => appStore.addProduct(product),
    updateProduct: (productId: string, updates: Partial<Product>) => appStore.updateProduct(productId, updates),
    deleteProduct: (productId: string) => appStore.deleteProduct(productId),


    // Brands
    addBrand: (brand: Omit<Brand, 'id' |'status'>) => appStore.addBrand(brand),
    updateBrand: (id: string, updates: Partial<Brand>) => appStore.updateBrand(id, updates),
    deleteBrand: (brandId: string) => appStore.deleteBrand(brandId),

    // Categories
    addCategoryToBrand: (category: Omit<Category, 'id'>) => appStore.addCategoryToBrand(category),
    categoriesInBrand: (brandId: string) => appStore.loadCategoriesInABrand(brandId),
    deleteCategory: (brandId: string, categoryId: string) => appStore.deleteCategory(brandId, categoryId),
    updateCategory: (brandId: string, categoryId: string, data: string) => appStore.updateCategory(brandId, categoryId, data),
    
    // Auth actions
    login: (email: string, password: string) => appStore.authAdmin(email, password),
    logout: appStore.logout.bind(appStore),
    

  }
}