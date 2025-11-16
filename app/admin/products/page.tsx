'use client'
import { useState, useMemo } from 'react'
import { useAppState } from '@/app/hooks/useAppState'
import CreatePostModal from '@/app/components/modals/CreateProductModal'
import EditPostModal from '@/app/components/modals/EditProductModal'
import { useRouter } from 'next/navigation'

export default function ProductsPage() {
  const router = useRouter()
  const { state, addProduct, deleteProduct, updateProduct } = useAppState()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [productToDelete, setProductToDelete] = useState<string | null>(null)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  
  // Filter and search state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBrand, setSelectedBrand] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedSkinType, setSelectedSkinType] = useState<string>('')

  const handleCreateProduct = (data: any) => {
    addProduct({
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
    setShowCreateModal(false)
  }

  const handleEditProduct = (data: any) => {
    setEditingProduct(data)
    setShowEditModal(true)
  }

  const handleUpdateProduct = (updatedProduct: any) => {
    updateProduct(updatedProduct.id, {
      ...updatedProduct,
      updatedAt: new Date().toISOString()
    })
    setShowEditModal(false)
    setEditingProduct(null)
  }

  const handleDeleteProduct = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setProductToDelete(id)
    setShowDeleteConfirm(true)
  }

  const confirmDelete = () => {
    if (productToDelete) {
      deleteProduct(productToDelete)
      setShowDeleteConfirm(false)
      setProductToDelete(null)
    }
  }

  const handleProductClick = (productId: string) => {
    router.push(`/admin/products/${productId}`)
  }

  // Get unique values for filters
  const brands = useMemo(() => {
    const brandSet = new Set(state.products.map(p => p.brandName).filter(Boolean))
    return Array.from(brandSet).sort()
  }, [state.products])

  const categories = useMemo(() => {
    const categorySet = new Set(state.products.flatMap(p => p.categoryNames || []))
    return Array.from(categorySet).sort()
  }, [state.products])

  const skinTypes = useMemo(() => {
    const skinTypeSet = new Set(state.products.map(p => p.skinType || []).filter(Boolean))
    return Array.from(skinTypeSet).sort()
  }, [state.products])

  // Filter products
  const filteredProducts = useMemo(() => {
    return state.products.filter(product => {
      const matchesSearch = searchQuery === '' || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.subtitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesBrand = selectedBrand === '' || product.brandName === selectedBrand
      const matchesCategory = selectedCategory === '' || 
        product.categoryNames?.includes(selectedCategory)
      const matchesSkinType = selectedSkinType === '' || product.skinType?.includes(selectedSkinType)

      return matchesSearch && matchesBrand && matchesCategory && matchesSkinType
    })
  }, [state.products, searchQuery, selectedBrand, selectedCategory, selectedSkinType])

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedBrand('')
    setSelectedCategory('')
    setSelectedSkinType('')
  }

  const activeFiltersCount = [selectedBrand, selectedCategory, selectedSkinType].filter(Boolean).length

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Products Management</h1>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Product
        </button>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search products by name, description, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Filters:</span>
          
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">All Brands</option>
            {brands.map(brand => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={selectedSkinType}
            onChange={(e) => setSelectedSkinType(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">All Skin Types</option>
            {/* {skinTypes.map(skinType => (
              <option key={skinType} value={skinType}>{skinType}</option>
            ))} */}
          </select>

          {activeFiltersCount > 0 && (
            <button
              onClick={clearFilters}
              className="px-3 py-1.5 text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear Filters ({activeFiltersCount})
            </button>
          )}
        </div>

        {/* Results Count */}
        <div className="text-sm text-gray-600">
          Showing {filteredProducts.length} of {state.products.length} products
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div 
            key={product.id} 
            onClick={() => handleProductClick(product.id)}
            className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition cursor-pointer group"
          >
            {/* Image Section - Smaller */}
            {product.image && (
              <div className="h-40 w-full bg-gray-50 flex items-center justify-center p-4">
                <img 
                  src={product.image} 
                  alt={product.imageAlt || product.name}
                  className="max-h-full max-w-full object-cover"
                />
              </div>
            )}
            
            <div className="p-4">
              {/* Brand */}
              <div className="text-xs text-gray-500 mb-1 font-medium">
                {product.brandName}
              </div>

              {/* Product Name */}
              <h3 className="text-base font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-green-600 transition">
                {product.name}
              </h3>

              {/* Subtitle */}
              {product.subtitle && (
                <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                  {product.subtitle}
                </p>
              )}

              {/* Description */}
              <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                {product.description}
              </p>

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {product.tags.slice(0, 3).map((tag, idx) => (
                    <span 
                      key={idx}
                      className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                  {product.tags.length > 3 && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                      +{product.tags.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* Categories and Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex flex-wrap gap-1">
                  {product.categoryNames?.slice(0, 2).map((cat, idx) => (
                    <span 
                      key={idx}
                      className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded font-medium"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEditProduct(product)
                    }}
                    className="text-gray-400 hover:text-green-600 transition"
                    title="Edit product"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button 
                    onClick={(e) => handleDeleteProduct(e, product.id)}
                    className="text-gray-400 hover:text-red-600 transition"
                    title="Delete product"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && state.products.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
          <button 
            onClick={clearFilters}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition font-semibold"
          >
            Clear Filters
          </button>
        </div>
      )}

      {state.products.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No products yet</h3>
          <p className="text-gray-600 mb-4">Get started by creating your first product</p>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition font-semibold"
          >
            Create First Product
          </button>
        </div>
      )}

      {/* Create Product Modal */}
      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateProduct}
      />

      {/* Edit Product Modal */}
      <EditPostModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setEditingProduct(null)
        }}
        onSubmit={handleUpdateProduct}
        product={editingProduct}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Delete Product?</h2>
              <p className="text-gray-600">
                Are you sure you want to delete this product? This action cannot be undone.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition font-semibold"
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}