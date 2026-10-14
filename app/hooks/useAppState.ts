'use client'
import { useState, useEffect } from 'react'
import { appStore, AppState } from '../lib/store'
import { Brand, Category, Product, ProductInput } from '../models/model'

export function useAppState() {
  const [state, setState] = useState<AppState>(appStore.getState())

  useEffect(() => {
    const unsubscribe = appStore.subscribe(setState)
    appStore.initialize() // runs once per page load
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe()
    }
  }, [])

  return {
    state,
    loading: state.loading,
    error: state.error,

    // Products
    addProduct: (product: ProductInput) => appStore.addProduct(product),
    updateProduct: (productId: string, updates: Partial<Product>) => appStore.updateProduct(productId, updates),
    deleteProduct: (productId: string) => appStore.deleteProduct(productId),

    // Brands
    addBrand: (brand: Omit<Brand, 'id'>) => appStore.addBrand(brand),
    updateBrand: (id: string, updates: Partial<Brand>) => appStore.updateBrand(id, updates),
    deleteBrand: (brandId: string) => appStore.deleteBrand(brandId),

    // Categories
    addCategoryToBrand: (category: Omit<Category, 'id'>) => appStore.addCategoryToBrand(category),
    categoriesInBrand: (brandId: string) => appStore.loadCategoriesInABrand(brandId),
    deleteCategory: (brandId: string, categoryId: string) => appStore.deleteCategory(brandId, categoryId),
    updateCategory: (brandId: string, categoryId: string, data: string) => appStore.updateCategory(brandId, categoryId, data),

    // Users & data refresh
    loadUsers: () => appStore.loadUsers(),
    refreshAll: () => appStore.refreshAll(),

    // Auth
    login: (email: string, password: string) => appStore.authAdmin(email, password),
    logout: appStore.logout.bind(appStore),
  }
}
