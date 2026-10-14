import { Brand, Category, Product, ProductInput, User } from '../models/model'
import {
  addBrandToDB,
  addProductToDB, deleteBrandFromDB, deleteProductFromDB,
  getAllBrands, getAllCategoriesInABrand, getAllProducts,
  updateBrandInDB, addCategoryToBrandInDB,
  removeCategoryFromBrandInDB,
  updateCategoryInDB,
  updateProductInDB,
  authenticateAdmin,
  getUsers,
} from './firebase/services'

interface AppState {
  users: User[]
  usersLoaded: boolean
  usersError: string | null
  products: Product[]
  brands: Brand[]
  categoriesInABrand: Category[]
  dict: Record<string, Category[]>
  isAuthenticated: boolean
  adminEmail: string | null
  loading: boolean
  error: string | null
}

const initialState: AppState = {
  users: [],
  usersLoaded: false,
  usersError: null,
  products: [],
  brands: [],
  categoriesInABrand: [],
  dict: {},
  isAuthenticated: false,
  adminEmail: null,
  loading: false,
  error: null,
}

// User records are personal data, so they are never written to localStorage.
const PERSISTED_KEYS: (keyof AppState)[] = ['products', 'brands', 'dict', 'isAuthenticated', 'adminEmail']

class AppStore {
  private state: AppState
  private listeners: Set<(state: AppState) => void>
  private initPromise: Promise<void> | null = null

  constructor() {
    this.state = initialState
    this.listeners = new Set()
    if (typeof window !== 'undefined') this.loadFromStorage()
  }

  getState(): AppState {
    return this.state
  }

  setState(newState: Partial<AppState>) {
    this.state = { ...this.state, ...newState }
    this.saveToStorage()
    this.notify()
  }

  subscribe(listener: (state: AppState) => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notify() {
    this.listeners.forEach(listener => listener(this.state))
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return
    try {
      const subset = Object.fromEntries(PERSISTED_KEYS.map(k => [k, this.state[k]]))
      localStorage.setItem('appState', JSON.stringify(subset))
    } catch (error) {
      console.error('Failed to save state to localStorage:', error)
    }
  }

  private loadFromStorage() {
    try {
      const saved = localStorage.getItem('appState')
      if (saved) {
        const parsed = JSON.parse(saved)
        const subset = Object.fromEntries(PERSISTED_KEYS.filter(k => k in parsed).map(k => [k, parsed[k]]))
        this.state = { ...initialState, ...subset }
      }
    } catch (error) {
      console.error('Failed to load state from localStorage:', error)
    }
  }

  /** Loads everything once per page load, however many components call it. */
  initialize() {
    if (!this.initPromise) {
      this.initPromise = Promise.all([this.loadProducts(), this.loadBrands(), this.loadUsers()]).then(() => undefined)
    }
    return this.initPromise
  }

  async refreshAll() {
    this.initPromise = null
    return this.initialize()
  }

  // ===================
  // Admin Auth
  // ==================
  async authAdmin(email: string, password: string) {
    try {
      this.setState({ loading: true, error: null })
      const res = await authenticateAdmin(email, password)
      this.setState({ loading: false, isAuthenticated: true, adminEmail: email })
      this.refreshAll()
      return res
    } catch (error: any) {
      this.setState({ error: error.message, loading: false })
    }
  }

  login(email: string) {
    this.setState({ isAuthenticated: true, adminEmail: email })
  }

  logout() {
    this.setState({ isAuthenticated: false, adminEmail: null, users: [], usersLoaded: false })
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isAuthenticated')
      localStorage.removeItem('adminEmail')
    }
  }

  // ===================
  // Products
  // ===================
  async loadProducts() {
    try {
      this.setState({ loading: true, error: null })
      const products = await getAllProducts()
      this.setState({ products, loading: false })
    } catch (error: any) {
      this.setState({ error: error.message, loading: false })
    }
  }

  async addProduct(data: ProductInput) {
    try {
      this.setState({ loading: true, error: null })
      await addProductToDB(data)
      await this.loadProducts()
    } catch (error: any) {
      this.setState({ error: error.message, loading: false })
      throw error
    }
  }

  async updateProduct(id: string, updates: Partial<Product>) {
    try {
      this.setState({ loading: true, error: null })
      await updateProductInDB(id, updates)
      await this.loadProducts()
    } catch (error: any) {
      this.setState({ error: error.message, loading: false })
      throw error
    }
  }

  async deleteProduct(id: string) {
    try {
      this.setState({ loading: true, error: null })
      await deleteProductFromDB(id)
      await this.loadProducts()
    } catch (error: any) {
      this.setState({ error: error.message, loading: false })
    }
  }

  // ===================
  // Users (read-only)
  // ===================
  async loadUsers() {
    try {
      const users = await getUsers()
      this.setState({ users, usersLoaded: true, usersError: null })
    } catch (error: any) {
      this.setState({ users: [], usersLoaded: true, usersError: error.message })
    }
  }

  // ======================
  // BRANDS
  // ======================
  async addBrand(data: Omit<Brand, 'id'>) {
    try {
      this.setState({ loading: true, error: null })
      await addBrandToDB(data)
      await this.loadBrands()
    } catch (error: any) {
      this.setState({ error: error.message, loading: false })
    }
  }

  async updateBrand(id: string, updates: Partial<Brand>) {
    try {
      this.setState({ loading: true, error: null })
      await updateBrandInDB(id, updates)
      await this.loadBrands()
    } catch (error: any) {
      this.setState({ error: error.message, loading: false })
    }
  }

  async deleteBrand(id: string) {
    try {
      this.setState({ loading: true, error: null })
      await deleteBrandFromDB(id)
      await this.loadBrands()
    } catch (error: any) {
      this.setState({ error: error.message, loading: false })
    }
  }

  async loadBrands() {
    try {
      this.setState({ loading: true, error: null })
      const brands = await getAllBrands()
      this.setState({ brands, loading: false })
    } catch (error: any) {
      this.setState({ error: error.message, loading: false })
    }
  }

  // ============================
  // CATEGORY
  // ============================
  async loadCategoriesInABrand(brandId: string) {
    try {
      this.setState({ loading: true, error: null })
      const categoriesInABrand = await getAllCategoriesInABrand(brandId)
      const updatedDict = { ...this.state.dict, [brandId]: categoriesInABrand }
      this.setState({ dict: updatedDict, loading: false })
      return updatedDict
    } catch (error: any) {
      this.setState({ error: error.message, loading: false })
    }
  }

  async deleteCategory(brandId: string, categoryId: string) {
    try {
      this.setState({ loading: true, error: null })
      await removeCategoryFromBrandInDB(brandId, categoryId)
      await this.loadCategoriesInABrand(brandId) // was reloading with the category id
    } catch (error: any) {
      this.setState({ error: error.message, loading: false })
    }
  }

  async updateCategory(brandId: string, categoryId: string, data: string) {
    try {
      this.setState({ loading: true, error: null })
      await updateCategoryInDB(brandId, categoryId, data)
      await this.loadCategoriesInABrand(brandId)
    } catch (error: any) {
      this.setState({ error: error.message, loading: false })
    }
  }

  async addCategoryToBrand(data: Omit<Category, 'id'>) {
    try {
      this.setState({ loading: true, error: null })
      const id = await addCategoryToBrandInDB(data)
      await this.loadCategoriesInABrand(data.brandId)
      return id
    } catch (error: any) {
      this.setState({ error: error.message, loading: false })
    }
  }
}

export const appStore = new AppStore()

export type { AppState }
