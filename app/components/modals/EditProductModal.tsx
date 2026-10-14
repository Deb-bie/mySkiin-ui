'use client'
import ProductForm from '../ProductForm'
import { EditProductModalProps } from '@/app/models/model'

export default function EditProductModal({ isOpen, onClose, onSubmit, product }: EditProductModalProps) {
  if (!isOpen || !product) return null
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl p-6 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Edit Product</h2>
            <p className="text-sm text-gray-500">{product.brandName} · {product.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition" aria-label="Close">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* key resets the form when a different product is opened */}
        <ProductForm key={product.id} initial={product} submitLabel="Save Changes" onCancel={onClose}
          onSubmit={data => onSubmit({ ...product, ...data, id: product.id })} />
      </div>
    </div>
  )
}
