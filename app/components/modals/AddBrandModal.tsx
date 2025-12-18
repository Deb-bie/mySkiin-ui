'use client'
import { AddBrandModalProps } from '@/app/models/model'
import { useAppState } from '@/app/hooks/useAppState'
import { useState } from 'react'


export default function AddBrandModal({ isOpen, onClose, onSubmit }: AddBrandModalProps) {
  const {state} = useAppState()
  
  const [formData, setFormData] = useState({
    name: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name) {
      onSubmit(formData)
      setFormData({ 
        name: '',
      })
    }
  }

  const handleClose = () => {
    setFormData({ 
      name: '',
    })
    onClose()
  }



  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-white bg-opacity-100 flex items-center justify-center p-4 z-50 overflow-y-auto">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl p-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
                
                <h2 className="text-2xl font-bold text-gray-900">Add New Brand</h2>
                
                <button 
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-600 transition"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Brand Name *
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                        placeholder="eg. CeraVe"
                        required
                    />
                </div>

        
                <div className="flex gap-6 pt-4 my-12">
                    <button
                        type="submit"
                        className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-semibold text-lg"
                    >
                        Add Brand
                    </button>
                    
                    <button
                        type="button"
                        onClick={handleClose}
                        className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition font-semibold text-lg"
                    >
                        Cancel
                    </button>
                    
                  </div>
                </form>
              </div>
            </div>
  )
}

