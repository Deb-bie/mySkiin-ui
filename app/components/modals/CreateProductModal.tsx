'use client'
import { useState } from 'react'
import ImageUpload from '../ImageUpload'
import { CreateProductModalProps } from '@/app/models/model'
import Select, { MultiValue, SingleValue } from "react-select";


type Option = {
  label: string;
  value: string;
};

export default function CreatePostModal({ isOpen, onClose, onSubmit }: CreateProductModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    subtitle: '',
    brand: '',
    description: '',
    tags: [] as string[],
    skinTypes: '',
    keyIngredients: [] as string[],
    category: [] as string[],
    steps: '',
    image: '',
    imageAlt: ''
  })

  const [keyIngredients, setKeyIngredients] = useState<any>([]);
  const [keyIngredientsInput, setKeyIngredientsInput] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<MultiValue<Option>>([]);
  const [selectedBrand, setSelectedBrand] = useState<SingleValue<Option>>();
  const [selectedSkinType, setSelectedSkinType] = useState<SingleValue<Option>>();
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [tags, setTags] = useState<any>([]);
  const [input, setInput] = useState("");

  
  const brands: Option[] =[
    { value: "CeraVe", label: "CeraVe" },
    { value: "The Ordinary", label: "The Ordinary" },
    { value: "Cetaphil", label: "Cetaphil" },
    { value: "Good Molecules", label: "Good Molecules" },
    { value: "La Roche-Posay", label: "La Roche-Posay" },
    { value: "Neutrogena", label: "Neutrogena" },
  ];

  const categories: Option[] =[
    { value: "Cleanser", label: "Cleanser" },
    { value: "Toner", label: "Toner" },
    { value: "Exfoliant", label: "Exfoliant" },
    { value: "Serum", label: "Serum" },
    { value: "Moisturizer", label: "Moisturizer" },
  ];

  const skinTypes: Option[] =[
    { value: "Normal", label: "Normal" },
    { value: "Dry", label: "Dry" },
    { value: "Oily", label: "Oily" },
    { value: "Sensitive", label: "Sensitive" },
    { value: "Combination", label: "Combination" },
  ];


  const addTag = (e: any) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const value = input.trim();
      
      if (value && !tags.includes(value)) {
        setTags([...tags, value]);
      }
      setInput("");
    }
  };

  const removeTag = (index: any) => {
    setTags(tags.filter((_: any, i: any) => i !== index));
  };

  const addKeyIngredient = (e: any) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const value = keyIngredientsInput.trim();
      
      if (value && !keyIngredients.includes(value)) {
        setKeyIngredients([...keyIngredients, value]);
      }
      setKeyIngredientsInput("");
    }
  };

  const removeKeyIngredient = (index: any) => {
    setKeyIngredients(keyIngredients.filter((_: any, i: any) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormData(
      {
        ...formData,
        brand: selectedBrand?.value || formData.brand,
        skinTypes: selectedSkinType?.value || formData.skinTypes,
        category: (selectedCategories || []).map((c) => c.value),
        keyIngredients: keyIngredients,
        tags: tags,
      }
    )

    if (formData.name && formData.brand && !isSubmitting) {
      setIsSubmitting(true)
      try {
        await onSubmit(formData)
        setFormData({ 
          name: '',
          subtitle: '',
          brand: '',
          description: '',
          tags: [] as string[],
          skinTypes: '',
          keyIngredients: [] as string[],
          category: [] as string[],
          steps: '',
          image: '',
          imageAlt: '' 
        })
      } catch (error) {
        console.error('Error creating post:', error)
        alert('Failed to create post. Please try again.')
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handleClose = () => {
    setFormData({ 
      name: '',
      subtitle: '',
      brand: '',
      description: '',
      tags: [],
      skinTypes: '',
      keyIngredients: [],
      category: [],
      steps: '',
      image: '',
      imageAlt: '' 
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-white bg-opacity-100 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl p-6 my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Add New Product</h2>
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
          <div className='flex flex-row justify-between'>
            <div className='w-[65%]'>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                placeholder="Enter an engaging title..."
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
                onChange={(brand) => setSelectedBrand(brand)}
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
                options={skinTypes}
                value={selectedSkinType}
                onChange={(skinType) => setSelectedSkinType(skinType)}
                className="basic-multi-select"
                classNamePrefix="select"
                placeholder="Select categories..."
              />
            </div>

          </div>

          <div className='flex flex-row justify-between'>
            <div className='w-[30%]'>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Category *
              </label>
              
              <Select
                isMulti
                options={categories}
                value={selectedCategories}
                onChange={(category) => setSelectedCategories(category)}
                className="basic-multi-select"
                classNamePrefix="select"
                placeholder="Select categories..."
              />
            </div>

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
              Featured Image (Optional)
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
              className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-800 transition font-semibold text-lg"
            >
              Publish Post
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