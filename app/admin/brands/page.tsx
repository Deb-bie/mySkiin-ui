'use client'

import { CategoryItem } from '@/app/components/CategoryItem'
import AddBrandModal from '@/app/components/modals/AddBrandModal'
import { useAppState } from '@/app/hooks/useAppState'
import { Brand, Product } from '@/app/models/model'
import { useState, useEffect } from 'react'


export default function BrandsPage() {
  const {state, addBrand, updateBrand, deleteBrand, categoriesInBrand, addCategoryToBrand, deleteCategory, updateCategory} = useAppState()

  const [searchTerm, setSearchTerm] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<{ 
    type: 'brand' | 'category', 
    brandId: string, 
    category?: string,
    categoryId?: string 
  } | null>(null)
  
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)
  const [addingCategoryTo, setAddingCategoryTo] = useState<Brand | null>(null)
  const [newCategory, setNewCategory] = useState('')
  const [editingCategoryTo, setEditingCategoryTo] = useState<any | null>(null)
  const [renameCategory, setRenameCategory] = useState('')
  const [editBrandName, setEditBrandName] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [alertBanner, setAlertBanner] = useState<{ message: string, type: 'error' | 'warning' | 'success' } | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAddBrandModal, setShowAddBrandModal] = useState(false)

  const categories = async (id: string) => {
    const fetched = await categoriesInBrand(id)
    state.dict = fetched ?? {}
    console.log("cats: ", state.dict[id].length)
    console.log("cat data: ", state.dict)
  }

  useEffect(() => {
    state.brands.forEach(brand => categories(brand.id));
  }, []);


  const filteredBrands = state.brands.filter(brand =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const brandExists = (name: string) => {
    return state.brands.some(brand => brand.name.toLowerCase() === name.trim().toLowerCase()) 
  }
  
  const handleAddBrand = (data: any) => {

    if (brandExists(data.name)) {
      setAlertBanner({
        message: `The brand "${data.name.trim()}" already exists!`,
        type: 'warning'
      })
      setTimeout(() => setAlertBanner(null), 5000)
      return
    }

    addBrand({
      ...data,
      name: data.name,
      views: 0,
      date: new Date().toISOString().split('T')[0],
      author: 'Admin',
      status: 'published'
    })

    setShowAddBrandModal(false)
  }

  const handleEditBrand = (brand: Brand) => {
    setEditingBrand(brand)
    setEditBrandName(brand.name)
  }

  const saveEditBrand = async (e: React.FormEvent) => {
    e.preventDefault()
    const newName = editBrandName.trim()

    if (brandExists(newName)) {
      setAlertBanner({
        message: `The brand "${newName.trim()}" already exists!`,
        type: 'warning'
      })
      setTimeout(() => setAlertBanner(null), 5000)
      return
    }

    if (editingBrand && newName) {
      setIsSubmitting(true)

      try {
        const updatedBrand: Brand = {
          ...editingBrand,
          name: newName
        }

        setEditingBrand(updatedBrand)
        await updateBrand(updatedBrand.id, updatedBrand)
        
      } catch (error) {
        console.error('Error updating brand details:', error)
        alert('Failed to update brand details. Please try again.')
      } finally {
        setIsSubmitting(false)
        setEditingBrand(null)
        setEditBrandName('')
      }
    }
  }

  const handleDeleteBrand = (id: string) => {
    const brandProducts = getProductsByBrand(id)
     console.log("1we have set items...")
    if (brandProducts.length > 0) {
      setAlertBanner({
        message: `Cannot delete this brand because it has ${brandProducts.length} product(s) associated with it. Please remove or reassign the products first.`,
        type: 'error'
      })
      setTimeout(() => setAlertBanner(null), 5000)
      return
    }
    setDeleteConfirm({ 
      type: 'brand', 
      brandId: id 
    })

    console.log("we have set items...")
  }

  const confirmDeleteBrand = async () => {
    if (deleteConfirm && deleteConfirm.type === 'brand') {
      setIsSubmitting(true)

      try {
        console.log("we are deleting brand")
        await deleteBrand(deleteConfirm.brandId)
      } catch (error) {
        console.error('Error deleting brand:', error)
        alert('Failed to delete brand. Please try again.')
      } finally {
        setIsSubmitting(false)
        setDeleteConfirm(null)
      }
    }
  }

  const getProductsByBrand = (brandId: string) => {
    return state.products.filter(product => product.brandId === brandId)
  }

  const getProductsByCategory = (brandId: string, category: string) => {
    return state.products.filter(product => product.brandId === brandId && product.categoryNames.map((c) => c === category))
  }

  const handleDeleteCategory = (brandId: string, categoryId: string, categoryName: string) => {
    const categoryProducts = getProductsByCategory(brandId, categoryName)
    if (categoryProducts.length > 0) {
      setAlertBanner({
        message: `Cannot delete the "${categoryName}" category because it has ${categoryProducts.length} product(s) associated with it. Please remove or reassign the products first.`,
        type: 'error'
      })
      setTimeout(() => setAlertBanner(null), 5000)
      return
    }
    
    setDeleteConfirm(
      { 
        type: 'category', 
        brandId: brandId, 
        category: categoryName,
        categoryId: categoryId 
      }
    )
  }

  const handleAddCategory = (brand: Brand) => {
    setAddingCategoryTo(brand)
    setNewCategory('')
  }

  const confirmDeleteCategory = async (brandId: string, categoryId: string) => {
    if (deleteConfirm && deleteConfirm.type === 'category' && deleteConfirm.category) {
      setIsSubmitting(true)
      try {
        await deleteCategory(brandId, categoryId)
        
        await categories(brandId)
      } catch (error) {
        console.error('Error deleting category:', error)
        alert('Failed to delete category. Please try again.')
      } finally {
        setIsSubmitting(false)
        setDeleteConfirm(null)
      }
      setDeleteConfirm(null)
    }
  }

  const saveNewCategory = async () => {
    if (!addingCategoryTo || !newCategory.trim()) {
      return
    }

    const categoryExists = state.dict[addingCategoryTo.id]?.some(
      category => 
        category.brandId === addingCategoryTo.id && 
        category.name.toLowerCase() === newCategory.trim().toLowerCase()
    );

    if (categoryExists) {
      setAlertBanner({
        message: `The category "${newCategory.trim()}" already exists for ${addingCategoryTo.name}!`,
        type: 'warning'
      })
      setTimeout(() => setAlertBanner(null), 5000)
      return
    }
    
    const newCat: any = { 
      name: newCategory.trim(),
      brandId: addingCategoryTo.id
    }

    await addCategoryToBrand({
      ...newCat,
      date: new Date().toISOString().split('T')[0],
      author: 'Admin',
      status: 'published'
    })

    await categories(addingCategoryTo.id)
    
    setAlertBanner({
      message: `Category "${newCategory.trim()}" successfully added to ${addingCategoryTo.name}!`,
      type: 'success'
    })
    setTimeout(() => setAlertBanner(null), 3000)
    setAddingCategoryTo(null)
    setNewCategory('')
  }


  const handleUpdatingCategory = (brand: Brand, categoryId: string) => {
    setEditingCategoryTo({brand, categoryId})
    setRenameCategory('')
  }


  const saveEditCategory = async () => {
    if (!editingCategoryTo || !renameCategory.trim()) {
      return
    }

    console.log("ediding category: ", editingCategoryTo)

    const brandId = editingCategoryTo.brand?.id ?? editingCategoryTo.id ?? ''
    const brandName = editingCategoryTo.brand?.name ?? editingCategoryTo.name ?? ''
    const categoryId = editingCategoryTo.categoryId

    const categoryExists = state.dict[editingCategoryTo.brand.id].some(
      category => 
        category.brandId === brandId && 
        category.name.toLowerCase() === renameCategory.trim().toLowerCase()
    );

    if (categoryExists) {
      setAlertBanner({
        message: `The category "${renameCategory.trim()}" already exists for ${brandName}!`,
        type: 'warning'
      })
      setTimeout(() => setAlertBanner(null), 5000)
      return
    }

    const newCat: string = renameCategory.trim()

    try {
      setIsSubmitting(true)
      await updateCategory(
        brandId, 
        categoryId, 
        newCat
      )

      await categories(brandId)
      
      setAlertBanner({
        message: `Category "${renameCategory.trim()}" successfully updated for ${brandName}!`,
        type: 'success'
      })
      setTimeout(() => setAlertBanner(null), 3000)
      setEditingCategoryTo(null)
      setRenameCategory('')
    } catch (error) {
      console.error('Error updating category:', error)
      alert('Failed to update category. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }


  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Alert Banner */}
      {alertBanner && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 animate-fade-in-down z-5000">
          <div className={`
            flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg border-l-4 max-w-2xl
            ${alertBanner.type === 'error' ? 'bg-red-50 border-red-500' : ''}
            ${alertBanner.type === 'warning' ? 'bg-yellow-50 border-yellow-500' : ''}
            ${alertBanner.type === 'success' ? 'bg-green-50 border-green-500' : ''}
          `}>
            
            {/* Icon */}
            <div className="shrink-0">
              {alertBanner.type === 'error' && (
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {alertBanner.type === 'warning' && (
                <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
              {alertBanner.type === 'success' && (
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            
            {/* Message */}
            <p className={`
              flex-1 text-sm font-medium
              ${alertBanner.type === 'error' ? 'text-red-800' : ''}
              ${alertBanner.type === 'warning' ? 'text-yellow-800' : ''}
              ${alertBanner.type === 'success' ? 'text-green-800' : ''}
            `}>
              {alertBanner.message}
            </p>
            
            {/* Close Button */}
            <button
              onClick={() => setAlertBanner(null)}
              className={`
                shrink-0 hover:opacity-70 transition
                ${alertBanner.type === 'error' ? 'text-red-500' : ''}
                ${alertBanner.type === 'warning' ? 'text-yellow-500' : ''}
                ${alertBanner.type === 'success' ? 'text-green-500' : ''}
              `}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="max-w-8xl mx-auto px-4 py-8">
        
        {/* Header */}
        
        <div className='flex items-center justify-between'>

          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Brands & Categories</h1>
            
            <p className="text-gray-600">Manage your skincare brands and their product categories</p>
          </div>

          <button 
            onClick={() => setShowAddBrandModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2 mr-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Brand
          </button>

        </div>
        
        

        {/* Search and Stats */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search brands..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>
          
          <div className="flex gap-4 text-sm">
            <div className="bg-white px-4 py-2 rounded-lg border border-gray-200">
              <span className="text-gray-600">Total Brands: </span>
              <span className="font-bold text-indigo-600">{state.brands.length}</span>
            </div>
          </div>
        </div>

        {/* Brands Grid */}
        {filteredBrands.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No brands found</h3>
            <p className="text-gray-600">Try adjusting your search or add a new brand</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBrands.map((brand) => (
              <div
                key={brand.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 overflow-hidden"
              >
                
                {/* Brand Header */}
                <div className="bg-linear-to-r from-indigo-500 to-purple-500 p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white mb-1">{brand.name}</h3>
                      <p className="text-indigo-100 text-sm">
                        {state.dict[brand.id]?.filter((b) => b.brandId === brand.id).length}
                        {state.dict[brand.id]?.filter((b) => b.brandId === brand.id).length === 1 ? ' category' : ' categories'}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditBrand(brand)}
                        className="text-white hover:text-yellow-200 transition p-1"
                        title="Edit brand"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      
                      <button
                        onClick={() => handleDeleteBrand(brand.id)}
                        className="text-white hover:text-red-200 transition p-1"
                        title="Delete brand"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-indigo-50 text-indigo-600 bg-opacity-20 rounded-lg px-3 py-2 text-sm">
                    {getProductsByBrand(brand.id).length} products
                  </div>
                </div>

                {/* Categories */}
                <div className="p-6">
                  {(state.dict[brand.id]?.filter(category => category.brandId === brand.id).length > 0) ? (
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Categories</h4>
                      
                      <div className="space-y-2">
                        {
                          state.dict[brand.id].filter(category => category.brandId === brand.id).map((cat, index) => (
                            <CategoryItem
                            key={cat.id} 
                            category={cat}
                            brand={brand}
                            onDelete={handleDeleteCategory}
                            onProductClick={setSelectedProduct}
                            onEdit={handleUpdatingCategory}
                          />
                          ))
                        }

                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm italic">No categories added</p>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="px-6 pb-6">
                  <button
                    onClick={() => handleAddCategory(brand)}
                    className="w-full py-2 px-4 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition font-medium text-sm"
                  >
                    Add Category
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Stats */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">{state.brands.length}</div>
              <div className="text-sm text-gray-600 mt-1">Total Brands</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {/* {state.brands.reduce((sum, brand) => sum + brand.categories.length, 0)} */}

                {state.brands.reduce((sum, brand) => sum + state.dict[brand.id]?.filter(cat => cat.brandId === brand.id).length, 0)}

              </div>
              <div className="text-sm text-gray-600 mt-1">Total Categories</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-600">
                {state.products.length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Total Products</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {(state.brands.reduce((sum, brand) => sum + state.dict[brand.id]?.filter(cat => cat.brandId === brand.id).length, 0) / state.brands.length || 0).toFixed(1)}
              </div>
              <div className="text-sm text-gray-600 mt-1">Avg per Brand</div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 rounded-full p-3">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Confirm Deletion</h3>
            </div>
            <p className="text-gray-600 mb-6">
              {deleteConfirm.type === 'brand'
                ? `Are you sure you want to delete this brand? This action cannot be undone.`
                : `Are you sure you want to delete the "${deleteConfirm.category}" category? This action cannot be undone.`}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteConfirm.type === 'brand' ? confirmDeleteBrand() : confirmDeleteCategory(deleteConfirm.brandId, deleteConfirm.categoryId!)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <AddBrandModal
        isOpen={showAddBrandModal}
        onClose={() => setShowAddBrandModal(false)}
        onSubmit={handleAddBrand}
      />

      {/* Edit Brand Modal */}
      {editingBrand && (
        <div className="fixed inset-0 bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Edit Brand</h3>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Brand Name</label>
              <input
                type="text"
                value={editBrandName}
                onChange={(e) => setEditBrandName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                placeholder="Enter brand name"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setEditingBrand(null)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={saveEditBrand}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {addingCategoryTo && (
        <div className="fixed inset-0 bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Add Category</h3>
            
            <p className="text-gray-600 text-sm mb-4">Adding to: <span className="font-semibold">{addingCategoryTo.name}</span></p>


            {state.dict[addingCategoryTo.id]?.filter((b) => b.brandId === addingCategoryTo.id).length > 0 && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Existing Categories</h4>
                <div className="flex flex-wrap gap-2">
                  {state.dict[addingCategoryTo.id].filter((b) => b.brandId === addingCategoryTo.id).map((cat, idx) => (
                    <span key={idx} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                      {cat.name}
                    </span>
                  ))}
                </div>
              </div>
            )}


            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">New Category Name</label>
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                placeholder="e.g. Toners, Exfoliants..."
                onKeyDown={(e) => e.key === 'Enter' && saveNewCategory()}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setAddingCategoryTo(null)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={saveNewCategory}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
              >
                Add Category
              </button>
            </div>
          </div>
        </div>
      )}


      {/* editing category modal */}
      {editingCategoryTo && (
        <div className="fixed inset-0 bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Rename Category</h3>
            
            <p className="text-gray-600 text-sm mb-4">Editing to: <span className="font-semibold">{editingCategoryTo.brand?.name ?? editingCategoryTo.name ?? ''}</span></p>


            {state.dict[editingCategoryTo.brand.id]?.filter((b) => b.brandId === editingCategoryTo.brand?.id).length > 0 && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Existing Categories</h4>
                <div className="flex flex-wrap gap-2">
                  {state.dict[editingCategoryTo.brand.id]?.filter((b) => b.brandId === editingCategoryTo.brand?.id).map((cat, idx) => (
                    <span key={idx} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                      {cat.name}
                    </span>
                  ))}
                </div>
              </div>
            )}


            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">New Category Name</label>
              <input
                type="text"
                value={renameCategory}
                onChange={(e) => setRenameCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                placeholder="e.g. Toners, Exfoliants..."
                onKeyDown={(e) => e.key === 'Enter' && saveEditCategory}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setEditingCategoryTo(null)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={saveEditCategory}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
              >
                Rename Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedProduct.name}</h3>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                    {state.brands.find(b => b.id === selectedProduct.brandId)?.name}
                  </span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                    {selectedProduct.categoryNames}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Product ID</p>
                <p className="text-lg font-semibold text-gray-900">#{selectedProduct.id}</p>
              </div>
              
              <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                <p className="text-sm text-indigo-600 mb-1">💡 Product Details</p>
                <p className="text-xs text-gray-600">
                  {selectedProduct.description}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => setSelectedProduct(null)}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

