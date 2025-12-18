'use client'
import { AddBrandModalProps } from '@/app/models/model'
import { useAppState } from '@/app/hooks/useAppState'
import { useState } from 'react'


export default function AddBrandModal({ isOpen, onClose, onSubmit }: AddBrandModalProps) {
  const {state} = useAppState()
  
  const [formData, setFormData] = useState({
    name: '',
  })
  const [newCategory, setNewCategory] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name) {
      onSubmit(formData)
      setFormData({ 
        name: '',
        // categories: []
      })
      setNewCategory('')
    }
  }

  const handleClose = () => {
    setFormData({ 
      name: '',
      // categories: []
    })
    setNewCategory('')
    onClose()
  }

  // const handleAddCategory = () => {
  //   if (newCategory.trim() && !formData.categories.includes(newCategory.trim())) {
  //     setFormData({
  //       ...formData,
  //       categories: [...formData.categories, newCategory.trim()]
  //     })
  //     setNewCategory('')
  //   }
  // }

  // const handleRemoveCategory = (categoryToRemove: string) => {
  //   setFormData({
  //     ...formData,
  //     categories: formData.categories.filter(cat => cat !== categoryToRemove)
  //   })
  // }

  // const handleKeyPress = (e: React.KeyboardEvent) => {
  //   if (e.key === 'Enter') {
  //     e.preventDefault()
  //     handleAddCategory()
  //   }
  // }

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

                {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Categories
                    </label>
                    <div className="flex gap-2 mb-3">
                        <input
                            type="text"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                            placeholder="eg. Cleanser, Serums, Moisturizer..."
                        />
                        <button
                            type="button"
                            onClick={handleAddCategory}
                            className="px-6 py-3 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition font-medium"
                        >
                            Add
                        </button>
                    </div>
                    
                    {formData.categories.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {formData.categories.map((category, index) => (
                                <div 
                                    key={index}
                                    className="inline-flex items-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-200"
                                >
                                    <span className="text-sm font-medium">{category}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveCategory(category)}
                                        className="text-indigo-400 hover:text-indigo-600 transition"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {formData.categories.length === 0 && (
                        <p className="text-sm text-gray-500 italic">No categories added yet</p>
                    )}
                </div> */}
        
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

























// 'use client'
// import { AddBrandModalProps } from '@/app/models/model'
// import { useState } from 'react'


// export default function AddBrandModal({ isOpen, onClose, onSubmit }: AddBrandModalProps) {
//   const [formData, setFormData] = useState({
//     name: ''
//   })

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault()
//     if (formData.name) {
//       onSubmit(formData)
//       setFormData({ 
//         name: ''
//       })
//     }
//   }

//   const handleClose = () => {
//     setFormData({ 
//       name: ''
//     })
//     onClose()
//   }

//   if (!isOpen) return null

//   return (
//     <div className="fixed inset-0 bg-white bg-opacity-100 flex items-center justify-center p-4 z-50 overflow-y-auto">
//         <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl p-6 my-8 max-h-[90vh] overflow-y-auto">
//             <div className="flex items-center justify-between mb-6">
                
//                 <h2 className="text-2xl font-bold text-gray-900">Add New Brand</h2>
                
//                 <button 
//                     onClick={handleClose}
//                     className="text-gray-400 hover:text-gray-600 transition"
//                 >
//                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                     </svg>
//                 </button>
//             </div>
        
//             <form onSubmit={handleSubmit} className="space-y-6">
//                 <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Brand Name *
//                     </label>
//                     <input
//                         type="text"
//                         value={formData.name}
//                         onChange={(e) => setFormData({...formData, name: e.target.value})}
//                         className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
//                         placeholder="eg. Nike"
//                         required
//                     />
//                 </div>
        
//                 <div className="flex gap-6 pt-4 my-12">
//                     <button
//                         type="submit"
//                         className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-semibold text-lg"
//                     >
//                         Add Brand
//                     </button>
                    
//                     <button
//                         type="button"
//                         onClick={handleClose}
//                         className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition font-semibold text-lg"
//                     >
//                         Cancel
//                     </button>
                    
//                   </div>
//                 </form>
//               </div>
//             </div>
//   )
// }