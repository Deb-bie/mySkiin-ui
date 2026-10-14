'use client'
import { useState } from 'react'
import { AddBrandModalProps, PriceTier } from '@/app/models/model'
import { PRICE_TIERS } from '@/app/lib/constants'

const empty = { name: '', country: '', website: '', priceTier: '' as PriceTier | '' }
const inputCls = 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none'

export default function AddBrandModal({ isOpen, onClose, onSubmit }: AddBrandModalProps) {
  const [formData, setFormData] = useState(empty)
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return
    if (formData.website && !/^https?:\/\//.test(formData.website)) {
      setError('Website must start with http:// or https://')
      return
    }
    onSubmit({
      name: formData.name.trim(),
      country: formData.country.trim(),
      website: formData.website.trim(),
      priceTier: formData.priceTier,
    })
    setFormData(empty)
    setError('')
  }

  const handleClose = () => {
    setFormData(empty)
    setError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 my-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Add New Brand</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition" aria-label="Close">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Brand name <span className="text-red-500">*</span></label>
            <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
              className={inputCls} placeholder="e.g. CeraVe" required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country of origin</label>
              <input type="text" value={formData.country} onChange={e => setFormData({ ...formData, country: e.target.value })}
                className={inputCls} placeholder="e.g. US, South Korea" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price tier</label>
              <select value={formData.priceTier} onChange={e => setFormData({ ...formData, priceTier: e.target.value as PriceTier | '' })} className={inputCls}>
                <option value="">Not set</option>
                {PRICE_TIERS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Official website</label>
            <input type="url" value={formData.website} onChange={e => setFormData({ ...formData, website: e.target.value })}
              className={inputCls} placeholder="https://..." />
            {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
          </div>

          <div className="flex gap-4 pt-4">
            <button type="submit" className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-semibold">Add Brand</button>
            <button type="button" onClick={handleClose} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition font-semibold">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}
