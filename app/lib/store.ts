import { Brand, Category, Product, User } from "../models/model"
import { 
  addBrandToDB, 
  addProductToDB, deleteBrandFromDB, deleteProductFromDB, 
  getAllBrands, getAllCategoriesInABrand, getAllProducts, 
  updateBrandInDB, addCategoryToBrandInDB,
  removeCategoryFromBrandInDB,
  updateCategoryInDB,
  updateProductInDB,
  authenticateAdmin
} from "./firebase/services"

interface AppState {
  users: User[]
  products: Product[]
  brands: Brand[]
  categoriesInABrand: Category[]
  dict: Record<string, Category[]>
  isAuthenticated: boolean
  adminEmail: string | null
  loading: boolean
  error: string | null
}

// Initial State
const initialState: AppState = {
  users: [],
  products: [],
  brands: [],
  categoriesInABrand: [],
  dict: {},
  isAuthenticated: false,
  adminEmail: null,
  loading: false,
  error: null
}



class AppStore {
  private state: AppState
  private listeners: Set<(state: AppState) => void>

  constructor() {
    this.state = initialState
    this.listeners = new Set()
    
    // Load from localStorage if available
    if (typeof window !== 'undefined') {
      this.loadFromStorage()
    }
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
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('appState', JSON.stringify(this.state))
      } catch (error) {
        console.error('Failed to save state to localStorage:', error)
      }
    }
  }

  private loadFromStorage() {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('appState')
        if (saved) {
          this.state = { ...initialState, ...JSON.parse(saved) }
        }
      } catch (error) {
        console.error('Failed to load state from localStorage:', error)
      }
    }
  }

  // Products Actions

  async loadProducts() {
    try {
      this.setState({ loading: true, error: null })
      const products = await getAllProducts()
      this.setState({ products, loading: false })
    } catch (error: any) {
      this.setState({ error: error.message, loading: false })
    }
  }


  async addProduct(postData: Omit<Product, 'id'>) {
    try {
      this.setState({ loading: true, error: null })
      await addProductToDB(postData)
      await this.loadProducts()
    } catch (error: any) {
      this.setState({ error: error.message, loading: false })
    }
  }

// ===================
  // Admin Auth
  // ==================
  async authAdmin(email: string, password: string) {
    try {
      this.setState({ loading: true, error: null })
      return await authenticateAdmin(email, password)
    } catch (error: any) {
      this.setState({ error: error.message, loading: false })
    }
  }


  async updateProduct(id: string, updates: Partial<Product>) {
    try {
      this.setState({ loading: true, error: null })
      await updateProductInDB(id, updates)
    } catch (error: any) {
      this.setState({ error: error.message, loading: false })
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

  // Auth Actions
  login(email: string) {
    this.setState({ isAuthenticated: true, adminEmail: email })
  }

  logout() {
    this.setState({ isAuthenticated: false, adminEmail: null })
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isAuthenticated')
      localStorage.removeItem('adminEmail')
    }
  }

  async initialize() {
    // await this.loadUsers()
    await this.loadProducts()
    // await this.loadStats()
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
      const updatedDict = {
        ...this.state.dict,
        [brandId]: categoriesInABrand
      }

      this.setState({ 
        dict: updatedDict,
        loading: false 
      })

      return updatedDict

      // return categoriesInABrand
    } catch (error: any) {
      this.setState({ error: error.message, loading: false })
    }
  }


  async deleteCategory(brandId: string, categoryId: string) {
    try {
      this.setState({ loading: true, error: null })
      await removeCategoryFromBrandInDB(brandId, categoryId)
      await this.loadBrands()
      await this.loadCategoriesInABrand(categoryId)
    } catch (error: any) {
      this.setState({ error: error.message, loading: false })
    }
  }


  async updateCategory(brandId: string, categoryId: string, data: string) {
    try {
      this.setState({ loading: true, error: null })
      await updateCategoryInDB(brandId, categoryId, data)
      await this.loadBrands()
      await this.loadCategoriesInABrand(categoryId)
    } catch (error: any) {
      this.setState({ error: error.message, loading: false })
    }
  }


  async addCategoryToBrand(data: Omit<Category, 'id'>) {
    try {
      this.setState({ loading: true, error: null })
      await addCategoryToBrandInDB(data)
      await this.loadBrands()
      await this.loadCategoriesInABrand(data.brandId)
    } catch (error: any) {
      this.setState({ error: error.message, loading: false })
    }
  }
}

export const appStore = new AppStore()

export type { AppState }
