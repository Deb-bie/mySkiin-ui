'use client'
import { useState, useEffect } from 'react'
import ImageUpload from '../ImageUpload'
import { EditProductModalProps } from '@/app/models/model'
import Select, { MultiValue, SingleValue } from "react-select";
import { useAppState } from '@/app/hooks/useAppState';


type Option = {
  label: string;
  value: string;
};


export default function EditPostModal({ isOpen, onClose, onSubmit, product }: EditProductModalProps) {
  const { state } = useAppState()
  const [formData, setFormData] = useState(product || {
    name: '',
    subtitle: '',
    brandId: '',
    brandName: '',
    categoryIds: [] as string[],
    categoryNames: [] as string[],
    description: '',
    tags: [] as string[],
    skinType: [] as string[],
    keyIngredients: [] as string[],
    steps: '',
    image: '',
    imageAlt: ''
  })

  const [keyIngredients, setKeyIngredients] = useState<any>([]);
  const [keyIngredientsInput, setKeyIngredientsInput] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<MultiValue<Option>>([]);
  const [selectedBrand, setSelectedBrand] = useState<SingleValue<Option>>();
  const [selectedSkinTypes, setSelectedSkinTypes] = useState<MultiValue<Option>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tags, setTags] = useState<any>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (product && isOpen) {
      setFormData({
        id: product.id || '',
        name: product.name || '',
        subtitle: product.subtitle || '',
        brandId: product.brandId || '',
        brandName: product.brandName || '',
        categoryId: product.categoryId || [],
        categoryNames: product.categoryNames || [],
        description: product.description || '',
        tags: product.tags || [],
        skinType:  product.skinTypes || [],
        keyIngredients: product.keyIngredients || [],
        steps: product.steps || '',
        image: product.image || '',
        imageAlt: product.imageAlt || ''
      })

      // Set tags
      setTags(product.tags || [])

      // Set key ingredients
      setKeyIngredients(product.keyIngredients || [])

      // Set selected brand
      if (product.brandId) {
        const brand = state.brands.find(b => b.id === product.brandId)
        if (brand) {
          setSelectedBrand({ value: brand.id, label: brand.name })
        }
      }

      // Set selected skin type

      if (product.skinTypes && Array.isArray(product.skinTypes)) {
        const skinOpts = product.skinTypes.map((s: string) => ({ value: s, label: s }))
        setSelectedSkinTypes(skinOpts)
      } else if (product.skinType && typeof product.skinType === 'string') {
        // fallback if product has singular skinType string
        setSelectedSkinTypes([{ value: product.skinType, label: product.skinType }])
      }



      // if (product.skinType) {
      //   // setSelectedSkinType({ value: product.skinTypes, label: product.skinTypes })
      // }
    }
  }, [product, isOpen, state.brands])


  // Set selected categories after brand is loaded
  useEffect(() => {
    if (product && selectedBrand && product.categoryId && product.categoryNames) {
      const cats = product.categoryId.map((id: any, index: any) => ({
        value: id,
        label: product.categoryNames[index] || ''
      }))
      setSelectedCategories(cats)
    }
  }, [product, selectedBrand])


  const brands = state.brands.map(brand => ({
    value: brand.id,
    label: brand.name
  }))

  const categories = selectedBrand 
  ? (state.dict[selectedBrand.value] || []).map(category => ({
      value: category.id,
      label: category.name
    }))
  : []

  const skinTypes: Option[] =[
    { value: "Normal", label: "Normal" },
    { value: "Dry", label: "Dry" },
    { value: "Oily", label: "Oily" },
    { value: "Sensitive", label: "Sensitive" },
    { value: "Combination", label: "Combination" },
    { value: "Other", label: "Other" },
  ];


  const addTag = (e: any) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const value = input.trim();
      
      if (value && !tags.includes(value)) {
        const newTags = [...tags, value]
        setTags(newTags);
        setFormData({...formData, tags: newTags})
      }
      setInput("");
    }
  };

  const removeTag = (index: any) => {
    const newTags = tags.filter((_: any, i: any) => i !== index)
    setTags(newTags);
    setFormData({...formData, tags: newTags})
  };

  const addKeyIngredient = (e: any) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const value = keyIngredientsInput.trim();
      
      if (value && !keyIngredients.includes(value)) {
        const newIngredients = [...keyIngredients, value]
        setKeyIngredients(newIngredients);
        setFormData({...formData, keyIngredients: newIngredients})
      }
      setKeyIngredientsInput("");
    }
  };

  const removeKeyIngredient = (index: any) => {
    const newIngredients = keyIngredients.filter((_: any, i: any) => i !== index)
    setKeyIngredients(newIngredients);
    setFormData({...formData, keyIngredients: newIngredients})
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // if (formData.name && formData.brand) {
    const updatedProduct = {
      ...formData,
      brandId: selectedBrand?.value || '',
      brandName: selectedBrand?.label || '',
      categoryId: selectedCategories.map(cat => cat.value),
      categoryNames: selectedCategories.map(cat => cat.label),
      skinType: (selectedSkinTypes || []).map((s) => s.label),
      tags: tags,
      keyIngredients: keyIngredients
    }

    onSubmit(updatedProduct)
  }

  if (!isOpen || !product) return null

  return (
    <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl p-6 my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Edit Product</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className='flex flex-row justify-between'>
            <div className='w-[65%]'>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Title *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                required
              />
            </div>

            <div className='w-[33%]'>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Small description (less than 50) *
              </label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                placeholder="Give some deetss..."
                required
              />
            </div>

          </div>

          <div className='flex flex-row justify-between'>
            
            <div className='w-[47%]'>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Brand *
              </label>

              <Select
                options={brands}
                value={selectedBrand}
                onChange={(brand) => {
                  setSelectedBrand(brand)
                  setSelectedCategories([])
                  setFormData({
                    ...formData, 
                    brandId: brand?.value || '',
                    brandName: brand?.label || '',
                    categoryId: [],
                    categoryNames: []
                  })
                }}
                className="basic-multi-select"
                classNamePrefix="select"
                placeholder="Select categories..."
              />
            </div>

            <div className='w-[47%]'>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skin Type
              </label>

              <Select
                isMulti
                options={skinTypes}
                value={selectedSkinTypes}
                onChange={(skinType) => {
                  setSelectedSkinTypes(skinType)
                  setFormData({...formData, skinType: skinType.map(s => s.label)})
                }}
                className="basic-multi-select"
                classNamePrefix="select"
                placeholder="Select categories..."
              />
            </div>

          </div>

          <div className='flex flex-row justify-between'>

            {selectedBrand?.value && (
              <div className='w-[30%]'>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Category *
                </label>
                <Select
                  isMulti
                  options={categories}
                  value={selectedCategories}
                  onChange={(category) => {
                    setSelectedCategories(category)
                    setFormData({
                      ...formData,
                      categoryId: category.map(cat => cat.value),
                      categoryNames: category.map(cat => cat.label)
                    })
                  }}
                  className="basic-multi-select"
                  classNamePrefix="select"
                  placeholder="Select categories..."
                />
              </div>
            )}

            <div className='w-[30%]'>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags *
              </label>
              
              <div
                className="flex flex-wrap gap-2 border border-gray-300 rounded px-3 py-2"
                onClick={() => document.getElementById("tagInput")!.focus()}
              >
                {tags.map((tag: any, index: any) => (
                  <div
                    key={index}
                    className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded flex items-center space-x-1"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="text-indigo-500 hover:text-indigo-700 font-bold"
                    >
                      &times;
                    </button>
                  </div>
                ))}
                <input
                  id="tagInput"
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={addTag}
                  className="flex-grow outline-none py-1"
                  placeholder="Type and press Enter"
                />
              </div>
            </div>

            <div className='w-[30%]'>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Key Ingredients *
              </label>
              
              <div
                className="flex flex-wrap gap-2 border border-gray-300 rounded px-3 py-2"
                onClick={() => document.getElementById("keyIngredientInputs")!.focus()}
              >
                {keyIngredients.map((keyIngredient: any, index: any) => (
                  <div
                    key={index}
                    className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded flex items-center space-x-1"
                  >
                    <span>{keyIngredient}</span>
                    <button
                      type="button"
                      onClick={() => removeKeyIngredient(index)}
                      className="text-indigo-500 hover:text-indigo-700 font-bold"
                    >
                      &times;
                    </button>
                  </div>
                ))}
                <input
                  id="keyIngredientInputs"
                  type="text"
                  value={keyIngredientsInput}
                  onChange={(e) => setKeyIngredientsInput(e.target.value)}
                  onKeyDown={addKeyIngredient}
                  className="flex-grow outline-none py-1"
                  placeholder="Type and press Enter"
                />
              </div>
            </div>
          </div>

          <div className='flex flex-row justify-between'>

            <div className='w-[55%]'>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                placeholder="Write your post content here..."
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.description.length} characters
              </p>
          </div>

            <div className='w-[40%]'>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Application Steps *
              </label>
              <textarea
                value={formData.steps}
                onChange={(e) => setFormData({...formData, steps: e.target.value})}
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                placeholder="Provide the steps for the applying this product......"
                required
              />
            </div>

          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Featured Image
            </label>
            <ImageUpload
              onImageSelect={(image) => setFormData({...formData, image})}
              currentImage={formData.image}
              altText={formData.imageAlt}
              onAltTextChange={(alt) => setFormData({...formData, imageAlt: alt})}
            />
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              type="submit"
              className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-semibold text-lg"
            >
              Update Post
            </button>
            <button
              type="button"
              onClick={onClose}
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