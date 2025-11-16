'use client'
import { useParams, useRouter } from 'next/navigation'
import { useAppState } from '@/app/hooks/useAppState'
import { useState } from 'react'
import EditPostModal from '@/app/components/modals/EditProductModal'


// Helper function to format Firestore Timestamp
const formatFirestoreDate = (timestamp: any) => {
  if (!timestamp) return 'N/A'
  
  // Check if it's a Firestore Timestamp object
  if (timestamp.seconds !== undefined) {
    const date = new Date(timestamp.seconds * 1000)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  // If it's already a Date object or ISO string
  try {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch {
    return 'N/A'
  }
}


export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { state, deleteProduct, updateProduct } = useAppState()
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  const productId = params?.id as string
  const product = state.products.find(p => p.id === productId)

  const handleUpdateProduct = (updatedProduct: any) => {
    updateProduct(updatedProduct.id, {
      ...updatedProduct,
      updatedAt: new Date().toISOString()
    })
    setShowEditModal(false)
  }

  const handleDelete = () => {
    deleteProduct(productId)
    router.push('/admin/products')
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <svg className="w-24 h-24 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Not Found</h1>
          <p className="text-gray-600 mb-6">The product you are looking for does not exist.</p>
          <button
            onClick={() => router.push('/admin/products')}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition font-semibold"
          >
            Back to Products
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="flex gap-3">
          <button
            onClick={() => setShowEditModal(true)}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Edit Product
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      </div>

      {/* Product Content */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="grid md:grid-cols-2 gap-8 p-8">
          {/* Image Section */}
          <div className="bg-gray-50 rounded-lg p-8 flex items-center justify-center">
            {product.image ? (
              <img
                src={product.image}
                alt={product.imageAlt || product.name}
                className="max-w-full max-h-96 object-contain"
              />
            ) : (
              <div className="text-center text-gray-400">
                <svg className="w-32 h-32 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p>No image available</p>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Brand */}
            <div>
              <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                {product.brandName}
              </span>
            </div>

            {/* Name and Subtitle */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              {product.subtitle && (
                <p className="text-xl text-gray-600">{product.subtitle}</p>
              )}
            </div>

            {/* Categories */}
            {product.categoryNames && product.categoryNames.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {product.categoryNames.map((category, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-lg"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Skin Types */}
            {product.skinType && product.skinType.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Skin Type</h3>
                <div className="flex flex-wrap gap-2">
                  {product.skinType.map((type, idx) => (
                  <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-lg inline-block">
                    {type}
                  </span>
                ))}
                </div>
                
              </div>
            )}

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-purple-50 text-purple-700 text-sm rounded-lg"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="border-t border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {product.description}
          </p>
        </div>

        {/* Key Ingredients */}
        {product.keyIngredients && product.keyIngredients.length > 0 && (
          <div className="border-t border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Ingredients</h2>
            <ul className="grid md:grid-cols-2 gap-3">
              {product.keyIngredients.map((ingredient, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-green-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">{ingredient}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Steps */}
        {product.steps && (
          <div className="border-t border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Usage Instructions</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {product.steps}
            </p>
          </div>
        )}

        {/* Metadata */}
        <div className="border-t border-gray-200 bg-gray-50 p-8">
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
            {product.createdAt && (
              <div>
                <span className="font-semibold">Created:</span>{' '}
                {formatFirestoreDate(product.createdAt)}
              </div>
            )}
            {product.updatedAt && (
              <div>
                <span className="font-semibold">Last Updated:</span>{' '}
                {formatFirestoreDate(product.updatedAt)}
              </div>
            )}
            <div>
              <span className="font-semibold">Product ID:</span> {product.id}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Product Modal */}
      <EditPostModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleUpdateProduct}
        product={product}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Delete Product?</h2>
              <p className="text-gray-600">
                Are you sure you want to delete {product.name}? This action cannot be undone.
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
                onClick={handleDelete}
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