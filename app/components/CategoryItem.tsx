'use client'
import { useState, useEffect } from 'react'
import { useAppState } from '@/app/hooks/useAppState'


export const CategoryItem = ({ category, brand, onDelete, onProductClick, onEdit}: any) => {
    const {state} = useAppState()
    const [isExpanded, setIsExpanded] = useState(false)

    console.log("products... ", state.products)
    console.log("cate... ", category)

    const getProductsByCategory = (brandId: string, category: string) => {
        return state.products.filter(product => product.brandId === brandId && product.categoryNames.some((c) => c === category))
    }

    const categoryProducts = getProductsByCategory(brand.id, category.name)

    const maxPreview = 3
    const hasMore = categoryProducts.length > maxPreview
    const displayProducts = isExpanded ? categoryProducts : categoryProducts.slice(0, maxPreview)
  
  return (
    <div className="group p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-indigo-300 transition">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">{category.name}</span>
          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
            {categoryProducts.length}
          </span>
        </div>
        
        <div className='flex items-center gap-4'>
            <button
          onClick={() => onEdit(brand, category.id)}
          className="text-gray-400 hover:text-blue-500 transition opacity-0 group-hover:opacity-100"
          title="Remove category"
        >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
        </button>

        <button
          onClick={() => onDelete(brand.id, category.id, category.name)}
          className="text-gray-400 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
          title="Remove category"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        </div>
      </div>
      
      {categoryProducts.length > 0 && (
        <div>
          <div className="space-y-1">
            {displayProducts.map(product => (
              <button
                key={product.id}
                onClick={() => onProductClick(product)}
                className="block w-full text-left text-xs text-indigo-600 hover:text-indigo-800 hover:underline py-1"
              >
                → {product.name}
              </button>
            ))}
          </div>
          
          {hasMore && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-2 text-xs text-gray-500 hover:text-indigo-600 font-medium flex items-center gap-1"
            >
              {isExpanded ? (
                <>
                  <span>Show less</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </>
              ) : (
                <>
                  <span>Show {categoryProducts.length - maxPreview} more</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  )
}