'use client'
import { Product, TriState } from '@/app/models/model'
import { PREGNANCY_OPTIONS } from '@/app/lib/constants'

const tri = (v: TriState | undefined) => (v === true ? 'Yes' : v === false ? 'No' : 'Unverified')

function Item({ label, value }: { label: string; value: React.ReactNode }) {
  const empty = value == null || value === '' || (Array.isArray(value) && value.length === 0)
  return (
    <div>
      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</dt>
      <dd className={`mt-1 text-sm ${empty ? 'text-gray-400' : 'text-gray-900'}`}>{empty ? '—' : value}</dd>
    </div>
  )
}

const chips = (list?: string[], cls = 'bg-gray-100 text-gray-700') =>
  list && list.length ? (
    <div className="flex flex-wrap gap-1.5">
      {list.map(v => <span key={v} className={`px-2 py-0.5 rounded text-xs font-medium ${cls}`}>{v}</span>)}
    </div>
  ) : null

/** The fields added in the catalog redesign, shown on the product detail page. */
export default function ProductDetailsExtra({ product }: { product: Product }) {
  const pregnancy = PREGNANCY_OPTIONS.find(o => o.value === product.pregnancySafe)?.label ?? 'Unverified'
  const actives = product.activeIngredients ?? []
  const inci = product.ingredients ?? []

  return (
    <>
      <div className="border-t border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Who it&apos;s for</h2>
        <dl className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Item label="Not suitable for" value={chips(product.notSuitableSkinTypes, 'bg-red-50 text-red-700')} />
          <Item label="Concerns targeted" value={chips(product.concerns, 'bg-purple-50 text-purple-700')} />
          <Item label="Primary concern" value={product.primaryConcern} />
          <Item label="Experience level" value={product.experienceLevel} />
          <Item label="Fragrance-free" value={tri(product.isFragranceFree)} />
          <Item label="Non-comedogenic" value={tri(product.isNonComedogenic)} />
          <Item label="Pregnancy-safe" value={pregnancy} />
          <Item label="Price tier" value={product.priceTier} />
        </dl>
      </div>

      <div className="border-t border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Routine placement</h2>
        <dl className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <Item label="Time of day" value={product.timeOfDay} />
          <Item label="Step order" value={product.stepOrder ?? ''} />
          <Item label="Frequency" value={product.frequency} />
          <Item label="Texture" value={product.texture} />
          <Item label="Period after opening" value={product.periodAfterOpeningMonths ? `${product.periodAfterOpeningMonths} months` : ''} />
        </dl>
      </div>

      <div className="border-t border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Active ingredients</h2>
        {actives.length ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase tracking-wide border-b">
                <th className="py-2 pr-4">Ingredient</th><th className="py-2 pr-4">Class</th><th className="py-2">Strength</th>
              </tr>
            </thead>
            <tbody>
              {actives.map((a, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="py-2 pr-4 font-medium text-gray-900">{a.name}</td>
                  <td className="py-2 pr-4 text-gray-700">{a.class || '—'}</td>
                  <td className="py-2 text-gray-700">{a.strength || 'Not stated'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p className="text-sm text-gray-400">None listed</p>}

        <h3 className="text-sm font-semibold text-gray-700 mt-6 mb-2">Full ingredient list (INCI)</h3>
        {inci.length ? (
          <p className="text-sm text-gray-700 leading-relaxed">{inci.join(', ')}</p>
        ) : (
          <p className="text-sm text-amber-700 bg-amber-50 rounded p-2 inline-block">Not added yet — copy it from the product page.</p>
        )}
      </div>

      <div className="border-t border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Source</h2>
        <dl className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Item label="Product page" value={product.productUrl ? (
            <a href={product.productUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline break-all">
              {product.productUrl.replace(/^https?:\/\//, '').slice(0, 48)}
            </a>
          ) : ''} />
          <Item label="Barcode" value={product.barcode} />
          <Item label="Data confidence" value={product.dataConfidence} />
          <Item label="Added via" value={product.source === 'import' ? 'File import' : product.source === 'user' ? 'User submission' : product.source ? 'Admin form' : ''} />
        </dl>
      </div>
    </>
  )
}
