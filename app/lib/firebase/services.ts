import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  orderBy,
  limit,
  Timestamp,
  writeBatch,
  getCountFromServer,
  DocumentReference,
} from 'firebase/firestore'

import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { signInWithEmailAndPassword } from 'firebase/auth'

import { db, storage, auth } from './config'
import { Brand, Category, Product, ProductInput, SubcollectionSummary, User } from '../../models/model'
import { USER_SUBCOLLECTIONS } from '../constants'
import { userJoined } from '../userFields'
import { ImportPlan } from '../import/plan'

/** Firestore rejects `undefined`; drop those keys (null is kept on purpose). */
const stripUndefined = <T extends Record<string, any>>(obj: T): T =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as T

// ==================
// AUTH
// ==================

/**
 * Firebase restores the signed-in admin asynchronously after a page load.
 * Anything that needs admin rights (reading users, importing) waits for that first.
 */
export const ensureSignedIn = async () => {
  await auth.authStateReady()
  if (!auth.currentUser) throw new Error('You are signed out. Please sign in again.')
}

export const authenticateAdmin = async (email: string, password: string) => {
  try {
    await signInWithEmailAndPassword(auth, email, password)
    localStorage.setItem('isAuthenticated', 'true')
    localStorage.setItem('adminEmail', email)
    return 'success'
  } catch (error: any) {
    console.error('Error logging in:', error)
    throw new Error('Login failed. Please try again.')
  }
}

// ===============================
// IMAGE
// ===============================
export const uploadImage = async (imageBase64: string, folder: string = 'products'): Promise<string> => {
  try {
    const base64Response = await fetch(imageBase64)
    const blob = await base64Response.blob()
    const filename = `${folder}/${Date.now()}_${Math.random().toString(36).substring(7)}`
    const snapshot = await uploadBytes(ref(storage, filename), blob)
    return await getDownloadURL(snapshot.ref)
  } catch (error) {
    console.error('Error uploading image:', error)
    throw new Error('Failed to upload image')
  }
}

export const deleteImage = async (imageUrl: string): Promise<void> => {
  // Only delete files that live in this project's Storage bucket (imported products may use external URLs)
  if (!imageUrl || !imageUrl.includes('firebasestorage')) return
  try {
    await deleteObject(ref(storage, imageUrl))
  } catch (error) {
    console.error('Error deleting image:', error)
  }
}

// ===============================
// PRODUCTS
// ===============================
export const addProductToDB = async (data: ProductInput): Promise<string> => {
  try {
    let imageUrl = ''
    if (data.image && data.image.startsWith('data:')) imageUrl = await uploadImage(data.image, 'products')
    else if (data.image) imageUrl = data.image

    const { createdAt: _c, updatedAt: _u, ...rest } = data as any
    const docRef = await addDoc(collection(db, 'products'), stripUndefined({
      ...rest,
      source: rest.source ?? 'admin',
      image: imageUrl,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }))
    return docRef.id
  } catch (error) {
    console.error('Error adding product:', error)
    throw new Error('Failed to add product')
  }
}

export const updateProductInDB = async (productId: string, data: Partial<Product>): Promise<void> => {
  try {
    const productRef = doc(db, 'products', productId)
    const { id: _id, createdAt: _c, updatedAt: _u, date: _d, ...updates } = data as any

    if (updates.image && updates.image.startsWith('data:')) {
      const oldProduct = await getDoc(productRef)
      if (oldProduct.exists() && oldProduct.data().image) await deleteImage(oldProduct.data().image)
      updates.image = await uploadImage(updates.image, 'products')
    }

    await updateDoc(productRef, stripUndefined({ ...updates, updatedAt: Timestamp.now() }))
  } catch (error) {
    console.error('Error updating product:', error)
    throw new Error('Failed to update product')
  }
}

export const deleteProductFromDB = async (productId: string): Promise<void> => {
  try {
    const productRef = doc(db, 'products', productId)
    const productDoc = await getDoc(productRef)
    if (productDoc.exists() && productDoc.data().image) await deleteImage(productDoc.data().image)
    await deleteDoc(productRef)
  } catch (error) {
    console.error('Error deleting product:', error)
    throw new Error('Failed to delete product')
  }
}

const toProduct = (id: string, data: any): Product => ({
  id,
  ...data,
  // older documents stored category ids as `categoryId`
  categoryIds: data.categoryIds ?? data.categoryId ?? [],
  categoryNames: data.categoryNames ?? [],
  date: data.createdAt?.toDate?.().toISOString().split('T')[0] ?? new Date().toISOString().split('T')[0],
})

export const getAllProducts = async (): Promise<Product[]> => {
  try {
    // No orderBy: Firestore drops documents that are missing the ordered field
    const snap = await getDocs(collection(db, 'products'))
    const products = snap.docs.map(d => toProduct(d.id, d.data()))
    const t = (p: Product) => p.createdAt?.seconds ?? 0
    return products.sort((a, b) => t(b) - t(a))
  } catch (error) {
    console.error('Error getting products:', error)
    throw new Error('Failed to get products')
  }
}

export const getProduct = async (productId: string): Promise<Product | null> => {
  try {
    const productDoc = await getDoc(doc(db, 'products', productId))
    return productDoc.exists() ? toProduct(productDoc.id, productDoc.data()) : null
  } catch (error) {
    console.error('Error getting product:', error)
    throw new Error('Failed to get product')
  }
}

// ===============================
// USERS (read-only from the dashboard)
// ===============================
export const getUsers = async (): Promise<User[]> => {
  await ensureSignedIn()
  try {
    // No orderBy here either, so users without a createdAt field are still listed
    const snap = await getDocs(collection(db, 'users'))
    const users = snap.docs.map(d => ({ id: d.id, ...d.data() }) as User)
    return users.sort((a, b) => (userJoined(b)?.getTime() ?? 0) - (userJoined(a)?.getTime() ?? 0))
  } catch (error: any) {
    console.error('Error getting users:', error)
    if (error?.code === 'permission-denied') {
      throw new Error('Permission denied reading users. Deploy the updated firestore.rules (admin read access) and sign in again.')
    }
    throw new Error('Failed to get users')
  }
}

export const getUser = async (userId: string): Promise<User | null> => {
  await ensureSignedIn()
  const userDoc = await getDoc(doc(db, 'users', userId))
  return userDoc.exists() ? ({ id: userDoc.id, ...userDoc.data() } as User) : null
}

/** Counts and samples the user's sub-collections listed in USER_SUBCOLLECTIONS. */
export const getUserSubcollections = async (userId: string): Promise<SubcollectionSummary[]> => {
  await ensureSignedIn()
  const results = await Promise.all(USER_SUBCOLLECTIONS.map(async (name): Promise<SubcollectionSummary> => {
    try {
      const col = collection(db, 'users', userId, name)
      const count = (await getCountFromServer(col)).data().count
      if (!count) return { name, count: 0, recent: [] }
      const sample = await getDocs(query(col, limit(5)))
      return { name, count, recent: sample.docs.map(d => ({ id: d.id, ...d.data() })) }
    } catch (error: any) {
      return { name, count: 0, recent: [], error: error?.code ?? 'error' }
    }
  }))
  return results
}

// ======================
// BRANDS
// =====================
export const addBrandToDB = async (data: Omit<Brand, 'id'>): Promise<string> => {
  try {
    const { createdAt: _c, updatedAt: _u, ...rest } = data as any
    const docRef = await addDoc(collection(db, 'brands'), stripUndefined({
      ...rest,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }))
    return docRef.id
  } catch (error) {
    console.error('Error adding brand:', error)
    throw new Error('Failed to add brand')
  }
}

export const updateBrandInDB = async (brandId: string, data: Partial<Brand>): Promise<void> => {
  try {
    const { id: _id, createdAt: _c, updatedAt: _u, ...updates } = data as any
    await updateDoc(doc(db, 'brands', brandId), stripUndefined({ ...updates, updatedAt: Timestamp.now() }))
  } catch (error) {
    console.error('Error updating brand info:', error)
    throw new Error('Failed to update brand')
  }
}

export const deleteBrandFromDB = async (brandId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'brands', brandId))
  } catch (error) {
    console.error('Error deleting brand:', error)
    throw new Error('Failed to delete brand')
  }
}

export const getAllBrands = async (): Promise<Brand[]> => {
  try {
    const snap = await getDocs(collection(db, 'brands'))
    return snap.docs
      .map(d => ({ id: d.id, ...d.data() }) as Brand)
      .sort((a, b) => a.name.localeCompare(b.name))
  } catch (error) {
    console.error('Error getting brands:', error)
    throw new Error('Failed to get brands')
  }
}

export const getBrand = async (brandId: string): Promise<Brand | null> => {
  try {
    const brandDoc = await getDoc(doc(db, 'brands', brandId))
    return brandDoc.exists() ? ({ id: brandDoc.id, ...brandDoc.data() } as Brand) : null
  } catch (error) {
    console.error('Error retrieving brand:', error)
    throw new Error('Failed to get brand')
  }
}

// ================================
// CATEGORY (stored under brands/{brandId}/categories)
// ================================
export const addCategoryToBrandInDB = async (data: Omit<Category, 'id'>): Promise<string> => {
  try {
    const categoriesRef = collection(db, 'brands', data.brandId, 'categories')
    const { createdAt: _c, updatedAt: _u, ...rest } = data as any
    const docRef = await addDoc(categoriesRef, { ...rest, createdAt: Timestamp.now(), updatedAt: Timestamp.now() })
    return docRef.id // previously returned the collection id by mistake
  } catch (error) {
    console.error('Error adding category under brand', error)
    throw new Error('Failed to add category')
  }
}

export const updateCategoryInDB = async (brandId: string, categoryId: string, data: string): Promise<void> => {
  try {
    await updateDoc(doc(db, 'brands', brandId, 'categories', categoryId), { name: data, updatedAt: Timestamp.now() })
  } catch (error) {
    console.error('Error updating category:', error)
    throw new Error('Failed to update category')
  }
}

export const removeCategoryFromBrandInDB = async (brandId: string, categoryId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'brands', brandId, 'categories', categoryId))
  } catch (error) {
    console.error('Error deleting category under brand', error)
    throw new Error('Failed to remove category')
  }
}

export const getAllCategoriesInABrand = async (brandId: string): Promise<Category[]> => {
  try {
    const snap = await getDocs(query(collection(db, 'brands', brandId, 'categories'), orderBy('createdAt', 'desc')))
    return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Category)
  } catch (error) {
    console.error('Error getting categories:', error)
    throw new Error('Failed to get categories')
  }
}

// ================================
// BULK IMPORT
// ================================
export interface ImportProgress {
  done: number
  total: number
  stage: string
}

export interface ImportResult {
  brandsCreated: number
  brandsUpdated: number
  categoriesCreated: number
  productsCreated: number
  productsUpdated: number
}

type Op =
  | { kind: 'set'; ref: DocumentReference; data: Record<string, any> }
  | { kind: 'update'; ref: DocumentReference; data: Record<string, any> }

const BATCH_SIZE = 400 // Firestore allows 500 writes per batch

/**
 * Writes an import plan to Firestore in batches.
 * Order: brands -> categories -> products, so every product gets real brand and category ids.
 */
export const executeImport = async (
  plan: ImportPlan,
  onProgress?: (p: ImportProgress) => void,
): Promise<ImportResult> => {
  await ensureSignedIn()
  const now = Timestamp.now()
  const ops: Op[] = []
  const brandIdByKey = new Map<string, string>()
  const result: ImportResult = { brandsCreated: 0, brandsUpdated: 0, categoriesCreated: 0, productsCreated: 0, productsUpdated: 0 }

  // Brands
  for (const b of plan.brands) {
    if (b.existingId) {
      brandIdByKey.set(b.key, b.existingId)
      if (Object.keys(b.fill).length) {
        ops.push({ kind: 'update', ref: doc(db, 'brands', b.existingId), data: { ...b.fill, updatedAt: now } })
        result.brandsUpdated++
      }
    } else {
      const ref = doc(collection(db, 'brands'))
      brandIdByKey.set(b.key, ref.id)
      ops.push({
        kind: 'set', ref,
        data: stripUndefined({ name: b.name, country: b.country || undefined, website: b.website || undefined, priceTier: b.priceTier || undefined, createdAt: now, updatedAt: now }),
      })
      result.brandsCreated++
    }
  }

  // Categories (existing + new), keyed by brand
  const catIds = new Map<string, Map<string, string>>()
  for (const [bk, cats] of Object.entries(plan.existingCategories)) {
    catIds.set(bk, new Map(cats.map(c => [c.name.trim().toLowerCase(), c.id])))
  }
  for (const c of plan.categoriesToCreate) {
    const brandId = brandIdByKey.get(c.brandKey)!
    const ref = doc(collection(db, 'brands', brandId, 'categories'))
    if (!catIds.has(c.brandKey)) catIds.set(c.brandKey, new Map())
    catIds.get(c.brandKey)!.set(c.name.trim().toLowerCase(), ref.id)
    ops.push({ kind: 'set', ref, data: { name: c.name, brandId, createdAt: now, updatedAt: now } })
    result.categoriesCreated++
  }

  const withIds = (bk: string, names: string[]) => ({
    brandId: brandIdByKey.get(bk)!,
    categoryIds: names.map(n => catIds.get(bk)?.get(n.trim().toLowerCase())).filter(Boolean) as string[],
    categoryNames: names,
  })

  // Products
  for (const p of plan.productsToCreate) {
    const ref = doc(collection(db, 'products'))
    ops.push({
      kind: 'set', ref,
      data: stripUndefined({ ...p.data, ...withIds(p.brandKey, p.data.categoryNames), source: 'import', createdAt: now, updatedAt: now }),
    })
    result.productsCreated++
  }
  for (const p of plan.productsToUpdate) {
    ops.push({
      kind: 'update', ref: doc(db, 'products', p.existingId!),
      data: stripUndefined({ ...p.data, ...withIds(p.brandKey, p.data.categoryNames), updatedAt: now }),
    })
    result.productsUpdated++
  }

  const total = ops.length
  onProgress?.({ done: 0, total, stage: 'Starting' })
  for (let i = 0; i < ops.length; i += BATCH_SIZE) {
    const batch = writeBatch(db)
    for (const op of ops.slice(i, i + BATCH_SIZE)) {
      if (op.kind === 'set') batch.set(op.ref, op.data)
      else batch.update(op.ref, op.data)
    }
    try {
      await batch.commit()
    } catch (error: any) {
      console.error('Import batch failed:', error)
      const msg = error?.code === 'permission-denied'
        ? 'Permission denied. Make sure you are signed in as the admin account and the updated firestore.rules are deployed.'
        : (error?.message ?? 'Import failed')
      throw new Error(`${msg} (${i} of ${total} writes were saved before this error.)`)
    }
    onProgress?.({ done: Math.min(i + BATCH_SIZE, total), total, stage: 'Saving' })
  }
  return result
}
