import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  writeBatch,
  increment
} from 'firebase/firestore'

import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage'
import { signInWithEmailAndPassword } from 'firebase/auth'

import { db, storage, auth } from './config'
import {Brand, Category, Product, User} from '../../models/model'


// ==================
// /AUTH
// ====================

export const authenticateAdmin = async (email: string, password: string) => {
  try {
    
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    )

    const user = userCredential.user
    localStorage.setItem('isAuthenticated', 'true')
    localStorage.setItem('adminEmail', email)

    return "success";


  } catch (error: any) {
    console.error('Error logining in:', error)
    throw new Error('Login failed. Please try again.')
  
  }
}




// ===============================
// IMAGE
// ===============================
export const uploadImage = async (
  imageBase64: string, 
  folder: string = 'products'
): Promise<string> => {

  try {
    // Convert base64 to blob
    const base64Response = await fetch(imageBase64)
    const blob = await base64Response.blob()
    
    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(7)
    const filename = `${folder}/${timestamp}_${randomString}`
    
    // Create storage reference
    const storageRef = ref(storage, filename)
    
    // Upload file
    const snapshot = await uploadBytes(storageRef, blob)
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref)
    
    return downloadURL
  } catch (error) {
    console.error('Error uploading image:', error)
    throw new Error('Failed to upload image')
  }
}


export const deleteImage = async (imageUrl: string): Promise<void> => {
  try {
    const imageRef = ref(storage, imageUrl)
    await deleteObject(imageRef)
  } catch (error) {
    console.error('Error deleting image:', error)
  }
}


// ===============================
// PRODUCTS
// ===============================
export const addProductToDB = async (data: Omit<Product, 'id' | 'status'>): Promise<string> => {
  try {
    
    let imageUrl = ''
    
    // Upload image if exists
    if (data.image && data.image.startsWith('data:')) {
      imageUrl = await uploadImage(data.image, 'products')
    } else if (data.image) {
      imageUrl = data.image
    }

    console.log("inside services.....")
    console.log(imageUrl)
    console.log(data)
    
    // Create products document
    const docRef = await addDoc(collection(db, 'products'), {
      ...data,
      image: imageUrl,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })

    console.log("after sending...")
    console.log(docRef.id)
    
    return docRef.id
  } catch (error) {
    console.error('Error adding product:', error)
    throw new Error('Failed to add product')
  }
}



export const updateProductInDB = async (
    productId: string, 
    data: Partial<Product>
): Promise<void> => {
  try {
    const productRef = doc(db, 'products', productId)
    
    // Handle image update
    if (data.image && data.image.startsWith('data:')) {
      
        // Get old product to delete old image
      const oldProduct = await getDoc(productRef)
      if (oldProduct.exists() && oldProduct.data().image) {
        await deleteImage(oldProduct.data().image)
      }
      
      // Upload new image
      data.image = await uploadImage(data.image, 'products')
    }
    
    await updateDoc(productRef, {
      ...data,
      updatedAt: Timestamp.now(),
    })
  } catch (error) {
    console.error('Error updating post:', error)
    throw new Error('Failed to update post')
  }
}


export const deleteProductFromDB = async (productId: string): Promise<void> => {
  try {
    const productRef = doc(db, 'products', productId)
    
    // Get product to delete image
    const productDoc = await getDoc(productRef)
    if (productDoc.exists() && productDoc.data().image) {
      await deleteImage(productDoc.data().image)
    }
    
    await deleteDoc(productRef)
  } catch (error) {
    console.error('Error deleting product:', error)
    throw new Error('Failed to delete product')
  }
}

export const getAllProducts = async (): Promise<Product[]> => {
  try {
    const productsRef = collection(db, 'products')
    let q = query(productsRef, orderBy('createdAt', 'desc'))
    
    const querySnapshot = await getDocs(q)
    const products: Product[] = []
    
    querySnapshot.forEach((doc) => {
      products.push({
          id: doc.id,
          ...doc.data(),
          date: doc.data().createdAt?.toDate().toISOString().split('T')[0] || new Date().toISOString().split('T')[0]
      } as unknown as Product)
    })
    
    return products
  } catch (error) {
    console.error('Error getting posts:', error)
    throw new Error('Failed to get posts')
  }
}

export const getProduct = async (productId: string): Promise<Product | null> => {
  try {
    const productRef = doc(db, 'products', productId)
    const productDoc = await getDoc(productRef)
    
    if (productDoc.exists()) {
      return {
          id: productDoc.id,
          ...productDoc.data(),
          date: productDoc.data().createdAt?.toDate().toISOString().split('T')[0] || new Date().toISOString().split('T')[0]
      } as unknown as Product
    }
    
    return null
  } catch (error) {
    console.error('Error getting post:', error)
    throw new Error('Failed to get post')
  }
}



// USERS
export const deleteUser = async (userId: string): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId)
    await deleteDoc(userRef)
  } catch (error) {
    console.error('Error deleting user:', error)
    throw new Error('Failed to delete user')
  }
}

export const getUsers = async (status?: 'paid' | 'free'): Promise<User[]> => {
  
    try {
        const usersRef = collection(db, 'users')
        let q = query(usersRef, orderBy('createdAt', 'desc'))
        
        if (status) {
            q = query(usersRef, where('status', '==', status), orderBy('createdAt', 'desc'))
        }
        
        const querySnapshot = await getDocs(q)
        const users: User[] = []
        
        querySnapshot.forEach((doc) => {
        users.push({
          id: doc.id,
          ...doc.data()
        } as unknown as User)
        })
        
        return users
    } catch (error) {
        console.error('Error getting users:', error)
        throw new Error('Failed to get users')
    }
}


export const getUser = async (userId: string): Promise<User | null> => {
  try {
    const userRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userRef)
    
    if (userDoc.exists()) {
      return {
        id: userDoc.id,
        ...userDoc.data()
      } as unknown as User
    }
    
    return null
  } catch (error) {
    console.error('Error getting user:', error)
    throw new Error('Failed to get user')
  }
}



// ======================
// BRANDS
// =====================

export const addBrandToDB = async (data: Omit<Brand, 'id' | 'status'>): Promise<string> => {
  try {
    console.log("adding brand in services: ", data)
    
    // Create brands document
    const docRef = await addDoc(collection(db, 'brands'), {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })

    console.log("after sending...")
    console.log(docRef.id)
    
    return docRef.id
  } catch (error) {
    console.error('Error adding brand:', error)
    throw new Error('Failed to add brand')
  }
}


export const updateBrandInDB = async (
    brandId: string,
    data: Partial<Brand>
    // data: string
): Promise<void> => {
  try {
    const brandRef = doc(db, 'brands', brandId)
    
    await updateDoc(brandRef, {
      ...data,
      // name: data.name,
      // categories: data.categories?.map((cat) => cat.id === )
      updatedAt: Timestamp.now(),
    })
  } catch (error) {
    console.error('Error updating brand info:', error)
    throw new Error('Failed to update brand')
  }
}

export const deleteBrandFromDB = async (brandId: string): Promise<void> => {
  try {
    const brandRef = doc(db, 'brands', brandId)
    
    await deleteDoc(brandRef)
  } catch (error) {
    console.error('Error deleting brand:', error)
    throw new Error('Failed to delete brand')
  }
}

export const getAllBrands = async (): Promise<Brand[]> => {
  try {
    const brandsRef = collection(db, 'brands')
    let q = query(brandsRef, orderBy('createdAt', 'desc'))
    
    const querySnapshot = await getDocs(q)
    const brands: Brand[] = []
    
    querySnapshot.forEach((doc) => {
      brands.push({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date
          // date: doc.data().createdAt?.toDate().toISOString().split('T')[0] || new Date().toISOString().split('T')[0]
      } as unknown as Brand)
    })


    console.log("brands:....")
    console.log(brands)
    
    return brands
  } catch (error) {
    console.error('Error getting brands:', error)
    throw new Error('Failed to get brands')
  }
}

export const getBrand = async (brandId: string): Promise<Brand | null> => {
  try {
    const brandRef = doc(db, 'brands', brandId)
    const brandDoc = await getDoc(brandRef)
    
    if (brandDoc.exists()) {
      return {
          id: brandDoc.id,
          ...brandDoc.data(),
          date: brandDoc.data().createdAt?.toDate().toISOString().split('T')[0] || new Date().toISOString().split('T')[0]
      } as unknown as Brand
    }
    
    return null
  } catch (error) {
    console.error('Error retrieving brand:', error)
    throw new Error('Failed to get brand')
  }
}


// ================================
// CATEGORY
// ================================

export const addCategoryToBrandInDB = async (data: Omit<Category, 'id'>): Promise<string> => {
  try {
    console.log("Adding Category to db....")

    const categoriesRef = collection(db, "brands", data.brandId, "categories");
    console.log("brandid; ", data.brandId)
    console.log("categories. ref: ", categoriesRef.path)
    await addDoc(categoriesRef, {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })

    return categoriesRef.id


  } catch (error) {
    console.error('Error adding category under brand', error)
    throw new Error('Failed to add category')
  }
}

export const updateCategoryInDB = async (
    brandId: string,
    categoryId: string,
    data: string
): Promise<void> => {
  try {
    console.log("Updating Category to db....")

    const categoriesRef = doc(db, "brands", brandId, "categories", categoryId);
    
    await updateDoc(categoriesRef, {
      name: data,
      updatedAt: Timestamp.now(),
    })

    // return categoriesRef.id
  } catch (error) {
    console.error('Error updating brand info:', error)
    throw new Error('Failed to update brand')
  }
}


export const removeCategoryFromBrandInDB = async (brandId: string, categoryId: string): Promise<void> => {
  try {
    console.log("removing Category to db....")

    const categoriesRef = doc(db, "brands", brandId, "categories", categoryId);
    console.log("brandid; ", brandId)
    console.log("categories. ref: ", categoriesRef.path)
    
    await deleteDoc(categoriesRef)
  } catch (error) {
    console.error('Error deleting category under brand', error)
    throw new Error('Failed to remove category')
  }
}


export const getAllCategoriesInABrand = async (brandId: string): Promise<Category[]> => {
  try {
    const categoriesRef = collection(db, 'brands', brandId, "categories")
    let q = query(categoriesRef, orderBy('createdAt', 'desc'))
    
    const querySnapshot = await getDocs(q)
    const categories: Category[] = []
    
    querySnapshot.forEach((doc) => {
      categories.push({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date
          // date: doc.data().createdAt?.toDate().toISOString().split('T')[0] || new Date().toISOString().split('T')[0]
      } as unknown as Category)
    })
    
    return categories
  } catch (error) {
    console.error('Error getting categories:', error)
    throw new Error('Failed to get categories')
  }
}


// ANALYTICS











