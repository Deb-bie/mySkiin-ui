'use client'
import { useEffect, useMemo, useState } from 'react'
import Select, { MultiValue, SingleValue } from 'react-select'
import CreatableSelect from 'react-select/creatable'
import ImageUpload from './ImageUpload'
import { useAppState } from '@/app/hooks/useAppState'
import { addCategoryToBrandInDB } from '@/app/lib/firebase/services'
import { appStore } from '@/app/lib/store'
import {
  ACTIVE_CLASSES, CONCERNS, DATA_CONFIDENCE, EXPERIENCE_LEVELS, FREQUENCIES, PREGNANCY_OPTIONS,
  PRICE_TIERS, SKIN_TYPES, STEP_ORDER_BY_CATEGORY, TEXTURES, TIMES_OF_DAY, toOptions,
} from '@/app/lib/constants'
import {
  ActiveIngredient, DataConfidence, ExperienceLevel, Option, PregnancySafe, PriceTier, Product,
  ProductInput, TimeOfDay, TriState,
} from '@/app/models/model'

interface ProductFormProps {
  initial?: Product | null
  submitLabel: string
  onSubmit: (data: ProductInput) => Promise<void> | void
  onCancel: () => void
}

interface FormState {
  name: string
  subtitle: string
  description: string
  steps: string
  image: string
  imageAlt: string
  productUrl: string
  barcode: string
  priceTier: PriceTier | ''
  skinType: string[]
  notSuitableSkinTypes: string[]
  concerns: string[]
  primaryConcern: string
  experienceLevel: ExperienceLevel | ''
  isFragranceFree: TriState
  isNonComedogenic: TriState
  pregnancySafe: PregnancySafe
  keyIngredients: string[]
  tags: string[]
  ingredientsText: string
  activeIngredients: ActiveIngredient[]
  timeOfDay: TimeOfDay | ''
  stepOrder: string
  frequency: string
  texture: string
  periodAfterOpeningMonths: string
  dataConfidence: DataConfidence | ''
}

const fromProduct = (p?: Product | null): FormState => ({
  name: p?.name ?? '',
  subtitle: p?.subtitle ?? '',
  description: p?.description ?? '',
  steps: p?.howToUse || p?.steps || '',
  image: p?.image ?? '',
  imageAlt: p?.imageAlt ?? '',
  productUrl: p?.productUrl ?? '',
  barcode: p?.barcode ?? '',
  priceTier: p?.priceTier ?? '',
  skinType: p?.skinType ?? [],
  notSuitableSkinTypes: p?.notSuitableSkinTypes ?? [],
  concerns: p?.concerns ?? [],
  primaryConcern: p?.primaryConcern ?? '',
  experienceLevel: p?.experienceLevel ?? '',
  isFragranceFree: p?.isFragranceFree ?? null,
  isNonComedogenic: p?.isNonComedogenic ?? null,
  pregnancySafe: p?.pregnancySafe ?? 'unverified',
  keyIngredients: p?.keyIngredients ?? [],
  tags: p?.tags ?? [],
  ingredientsText: (p?.ingredients ?? []).join(', '),
  activeIngredients: p?.activeIngredients ?? [],
  timeOfDay: p?.timeOfDay ?? '',
  stepOrder: p?.stepOrder != null ? String(p.stepOrder) : '',
  frequency: p?.frequency ?? '',
  texture: p?.texture ?? '',
  periodAfterOpeningMonths: p?.periodAfterOpeningMonths != null ? String(p.periodAfterOpeningMonths) : '',
  dataConfidence: p?.dataConfidence ?? '',
})

const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm'
const NEW_PREFIX = 'new:'

export default function ProductForm({ initial, submitLabel, onSubmit, onCancel }: ProductFormProps) {
  const { state } = useAppState()
  const [form, setForm] = useState<FormState>(() => fromProduct(initial))
  const [brand, setBrand] = useState<SingleValue<Option>>(
    initial?.brandId ? { value: initial.brandId, label: initial.brandName } : null,
  )
  const [categories, setCategories] = useState<MultiValue<Option>>(() => {
    const ids = initial?.categoryIds ?? initial?.categoryId ?? []
    return (initial?.categoryNames ?? []).map((label, i) => ({ value: ids[i] ?? `${NEW_PREFIX}${label}`, label }))
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm(f => ({ ...f, [key]: value }))

  // Load the selected brand's categories if they aren't cached yet
  useEffect(() => {
    if (brand?.value && !state.dict[brand.value]) appStore.loadCategoriesInABrand(brand.value)
  }, [brand?.value, state.dict])

  const brandOptions = useMemo(
    () => state.brands.map(b => ({ value: b.id, label: b.name })).sort((a, b) => a.label.localeCompare(b.label)),
    [state.brands],
  )
  const categoryOptions = brand ? (state.dict[brand.value] ?? []).map(c => ({ value: c.id, label: c.name })) : []

  const suggestedStep = categories[0] ? STEP_ORDER_BY_CATEGORY[categories[0].label] : undefined

  const onCategoriesChange = (value: MultiValue<Option>) => {
    setCategories(value)
    // Fill step order automatically the first time a category is chosen
    if (!form.stepOrder && value[0] && STEP_ORDER_BY_CATEGORY[value[0].label]) {
      set('stepOrder', String(STEP_ORDER_BY_CATEGORY[value[0].label]))
    }
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Product name is required'
    if (!brand) e.brand = 'Choose a brand'
    if (!categories.length) e.categories = 'Choose at least one category'
    if (!form.description.trim()) e.description = 'Description is required'
    if (form.stepOrder && isNaN(Number(form.stepOrder))) e.stepOrder = 'Must be a number'
    if (form.periodAfterOpeningMonths && isNaN(Number(form.periodAfterOpeningMonths))) e.pao = 'Must be a number'
    if (form.productUrl && !/^https?:\/\//.test(form.productUrl)) e.productUrl = 'Must start with http:// or https://'
    form.activeIngredients.forEach((a, i) => { if (!a.name.trim()) e[`active${i}`] = 'Name is required' })
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    setSubmitError('')
    if (!validate() || isSubmitting || !brand) return
    setIsSubmitting(true)
    try {
      // Create any categories typed in that don't exist under this brand yet
      const categoryIds: string[] = []
      const categoryNames: string[] = []
      let created = false
      const brandCats = state.dict[brand.value] ?? (await appStore.loadCategoriesInABrand(brand.value))?.[brand.value] ?? []
      for (const c of categories) {
        let id = c.value
        if (id.startsWith(NEW_PREFIX)) {
          const existing = brandCats.find(x => x.name.toLowerCase() === c.label.trim().toLowerCase())
          id = existing?.id ?? await addCategoryToBrandInDB({ name: c.label.trim(), brandId: brand.value })
          created ||= !existing
        }
        categoryIds.push(id)
        categoryNames.push(c.label.trim())
      }
      if (created) await appStore.loadCategoriesInABrand(brand.value)

      const payload: ProductInput = {
        name: form.name.trim(),
        subtitle: form.subtitle.trim(),
        brandId: brand.value,
        brandName: brand.label,
        categoryIds,
        categoryNames,
        description: form.description.trim(),
        steps: form.steps.trim(),
        howToUse: form.steps.trim(),
        tags: form.tags,
        image: form.image,
        imageAlt: form.imageAlt,
        skinType: form.skinType,
        notSuitableSkinTypes: form.notSuitableSkinTypes,
        concerns: form.concerns,
        primaryConcern: form.primaryConcern,
        experienceLevel: form.experienceLevel,
        isFragranceFree: form.isFragranceFree,
        isNonComedogenic: form.isNonComedogenic,
        pregnancySafe: form.pregnancySafe,
        keyIngredients: form.keyIngredients,
        ingredients: form.ingredientsText.split(/,(?![^(]*\))(?!\d)/).map(s => s.trim()).filter(Boolean),
        activeIngredients: form.activeIngredients
          .map(a => ({ name: a.name.trim(), class: a.class.trim(), strength: a.strength.trim() }))
          .filter(a => a.name),
        timeOfDay: form.timeOfDay,
        stepOrder: form.stepOrder ? Number(form.stepOrder) : null,
        frequency: form.frequency,
        texture: form.texture,
        periodAfterOpeningMonths: form.periodAfterOpeningMonths ? Number(form.periodAfterOpeningMonths) : null,
        priceTier: form.priceTier,
        barcode: form.barcode.trim(),
        productUrl: form.productUrl.trim(),
        dataConfidence: form.dataConfidence,
        source: initial?.source ?? 'admin',
      }
      await onSubmit(payload)
    } catch (err: any) {
      console.error(err)
      setSubmitError(err?.message ?? 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* BASICS */}
      <Section title="Basics">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Product name" required error={errors.name} className="md:col-span-2">
            <input className={inputCls} value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Hydrating Facial Cleanser" />
          </Field>
          <Field label="Short description" hint={`${form.subtitle.length}/50`}>
            <input className={inputCls} maxLength={50} value={form.subtitle} onChange={e => set('subtitle', e.target.value)} placeholder="One line shown under the name" />
          </Field>
          <Field label="Brand" required error={errors.brand}>
            <Select options={brandOptions} value={brand} classNamePrefix="select" placeholder="Select brand..."
              onChange={b => { setBrand(b); setCategories([]) }} />
          </Field>
          <Field label="Categories" required error={errors.categories} hint={brand ? 'Pick or type a new one' : 'Choose a brand first'}>
            <CreatableSelect isMulti isDisabled={!brand} options={categoryOptions} value={categories} classNamePrefix="select"
              placeholder="Select categories..." onChange={onCategoriesChange}
              onCreateOption={label => onCategoriesChange([...categories, { value: `${NEW_PREFIX}${label}`, label }])}
              formatCreateLabel={v => `Create category "${v}"`} />
          </Field>
          <Field label="Price tier">
            <Select options={toOptions(PRICE_TIERS)} isClearable classNamePrefix="select" placeholder="Select..."
              value={form.priceTier ? ({ value: form.priceTier, label: form.priceTier } as Option) : null}
              onChange={o => set('priceTier', (o?.value ?? '') as PriceTier | '')} />
          </Field>
          <Field label="Product page URL" error={errors.productUrl}>
            <input className={inputCls} value={form.productUrl} onChange={e => set('productUrl', e.target.value)} placeholder="https://..." />
          </Field>
          <Field label="Barcode / UPC">
            <input className={inputCls} value={form.barcode} onChange={e => set('barcode', e.target.value)} placeholder="Optional" />
          </Field>
          <Field label="Data confidence" hint="How sure you are of these details">
            <Select options={toOptions(DATA_CONFIDENCE)} isClearable classNamePrefix="select" placeholder="Select..."
              value={form.dataConfidence ? ({ value: form.dataConfidence, label: form.dataConfidence } as Option) : null}
              onChange={o => set('dataConfidence', (o?.value ?? '') as DataConfidence | '')} />
          </Field>
        </div>
        <Field label="Product image">
          <ImageUpload onImageSelect={image => set('image', image)} currentImage={form.image}
            altText={form.imageAlt} onAltTextChange={alt => set('imageAlt', alt)} />
          <input className={`${inputCls} mt-2`} value={form.image.startsWith('data:') ? '' : form.image}
            onChange={e => set('image', e.target.value)} placeholder="…or paste an image URL" />
        </Field>
      </Section>

      {/* ABOUT */}
      <Section title="Description & use">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Description" required error={errors.description} hint={`${form.description.length} characters`}>
            <textarea rows={5} className={inputCls} value={form.description} onChange={e => set('description', e.target.value)} placeholder="What the product is and what it does" />
          </Field>
          <Field label="How to use">
            <textarea rows={5} className={inputCls} value={form.steps} onChange={e => set('steps', e.target.value)} placeholder="Application steps" />
          </Field>
        </div>
        <Field label="Tags" hint="Type and press Enter">
          <ChipInput values={form.tags} onChange={v => set('tags', v)} placeholder="e.g. fragrance-free, K-beauty" />
        </Field>
      </Section>

      {/* SUITABILITY */}
      <Section title="Who it's for">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Suitable skin types">
            <Select isMulti options={toOptions(SKIN_TYPES)} classNamePrefix="select" placeholder="Select..."
              value={toOptions(form.skinType)} onChange={v => set('skinType', v.map(o => o.value))} />
          </Field>
          <Field label="Not suitable for">
            <Select isMulti options={toOptions(SKIN_TYPES.filter(s => s !== 'All'))} classNamePrefix="select" placeholder="Select..."
              value={toOptions(form.notSuitableSkinTypes)} onChange={v => set('notSuitableSkinTypes', v.map(o => o.value))} />
          </Field>
          <Field label="Concerns targeted">
            <CreatableSelect isMulti options={toOptions(CONCERNS)} classNamePrefix="select" placeholder="Select or type..."
              value={toOptions(form.concerns)} onChange={v => {
                const list = v.map(o => o.value)
                set('concerns', list)
                if (!form.primaryConcern || !list.includes(form.primaryConcern)) set('primaryConcern', list[0] ?? '')
              }} />
          </Field>
          <Field label="Primary concern">
            <Select options={toOptions(form.concerns.length ? form.concerns : CONCERNS)} isClearable classNamePrefix="select" placeholder="Select..."
              value={form.primaryConcern ? { value: form.primaryConcern, label: form.primaryConcern } : null}
              onChange={o => set('primaryConcern', o?.value ?? '')} />
          </Field>
          <Field label="Experience level">
            <Segmented options={EXPERIENCE_LEVELS.map(v => ({ value: v, label: v }))} value={form.experienceLevel}
              onChange={v => set('experienceLevel', v as ExperienceLevel)} allowClear />
          </Field>
          <Field label="Pregnancy-safe" hint="Retinoids = No. Leave-on BHA/benzoyl peroxide = Consult doctor.">
            <Segmented options={PREGNANCY_OPTIONS} value={form.pregnancySafe} onChange={v => set('pregnancySafe', v as PregnancySafe)} />
          </Field>
          <Field label="Fragrance-free">
            <TriToggle value={form.isFragranceFree} onChange={v => set('isFragranceFree', v)} />
          </Field>
          <Field label="Non-comedogenic">
            <TriToggle value={form.isNonComedogenic} onChange={v => set('isNonComedogenic', v)} />
          </Field>
        </div>
      </Section>

      {/* INGREDIENTS */}
      <Section title="Ingredients">
        <Field label="Key ingredients" hint="Shown to users. Type and press Enter">
          <ChipInput values={form.keyIngredients} onChange={v => set('keyIngredients', v)} placeholder="e.g. Ceramides" />
        </Field>
        <Field label="Active ingredients" hint="Used by the routine conflict checker. Class matters most (e.g. Retinoid, AHA).">
          <div className="space-y-2">
            {form.activeIngredients.map((a, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-start">
                <div className="col-span-4">
                  <input className={inputCls} value={a.name} placeholder="Name (e.g. Glycolic Acid)"
                    onChange={e => set('activeIngredients', form.activeIngredients.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} />
                  {errors[`active${i}`] && <p className="text-xs text-red-600 mt-1">{errors[`active${i}`]}</p>}
                </div>
                <div className="col-span-4">
                  <CreatableSelect options={toOptions(ACTIVE_CLASSES)} classNamePrefix="select" placeholder="Class..."
                    value={a.class ? { value: a.class, label: a.class } : null}
                    onChange={o => set('activeIngredients', form.activeIngredients.map((x, j) => j === i ? { ...x, class: o?.value ?? '' } : x))} />
                </div>
                <input className={`${inputCls} col-span-3`} value={a.strength} placeholder="Strength (e.g. 5%)"
                  onChange={e => set('activeIngredients', form.activeIngredients.map((x, j) => j === i ? { ...x, strength: e.target.value } : x))} />
                <button type="button" title="Remove" className="col-span-1 h-9 text-gray-400 hover:text-red-600"
                  onClick={() => set('activeIngredients', form.activeIngredients.filter((_, j) => j !== i))}>✕</button>
              </div>
            ))}
            <button type="button" className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
              onClick={() => set('activeIngredients', [...form.activeIngredients, { name: '', class: '', strength: '' }])}>
              + Add active ingredient
            </button>
          </div>
        </Field>
        <Field label="Full ingredient list (INCI)" hint="Paste from the product page, comma-separated">
          <textarea rows={4} className={inputCls} value={form.ingredientsText} onChange={e => set('ingredientsText', e.target.value)}
            placeholder="Aqua/Water, Glycerin, Ceramide NP, ..." />
        </Field>
      </Section>

      {/* ROUTINE */}
      <Section title="Routine placement">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Time of day">
            <Segmented options={TIMES_OF_DAY.map(v => ({ value: v, label: v }))} value={form.timeOfDay}
              onChange={v => set('timeOfDay', v as TimeOfDay)} allowClear />
          </Field>
          <Field label="Step order" error={errors.stepOrder}
            hint={suggestedStep ? `Suggested for ${categories[0]?.label}: ${suggestedStep}` : '1 = first step (cleanser)'}>
            <input type="number" min={1} max={20} className={inputCls} value={form.stepOrder} onChange={e => set('stepOrder', e.target.value)} />
          </Field>
          <Field label="Recommended frequency">
            <CreatableSelect options={toOptions(FREQUENCIES)} isClearable classNamePrefix="select" placeholder="Select..."
              value={form.frequency ? { value: form.frequency, label: form.frequency } : null}
              onChange={o => set('frequency', o?.value ?? '')} />
          </Field>
          <Field label="Texture">
            <CreatableSelect options={toOptions(TEXTURES)} isClearable classNamePrefix="select" placeholder="Select..."
              value={form.texture ? { value: form.texture, label: form.texture } : null}
              onChange={o => set('texture', o?.value ?? '')} />
          </Field>
          <Field label="Period after opening (months)" error={errors.pao} hint="The open-jar symbol, e.g. 12M">
            <input type="number" min={1} max={60} className={inputCls} value={form.periodAfterOpeningMonths}
              onChange={e => set('periodAfterOpeningMonths', e.target.value)} />
          </Field>
        </div>
      </Section>

      {submitError && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{submitError}</div>}

      <div className="flex gap-3 pt-4 border-t sticky bottom-0 bg-white pb-1">
        <button type="submit" disabled={isSubmitting}
          className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-60">
          {isSubmitting ? 'Saving…' : submitLabel}
        </button>
        <button type="button" onClick={onCancel}
          className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition font-semibold">
          Cancel
        </button>
      </div>
    </form>
  )
}

// ---------- small building blocks ----------
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide border-b pb-2">{title}</h3>
      {children}
    </section>
  )
}

function Field({ label, required, error, hint, className, children }: {
  label: string; required?: boolean; error?: string; hint?: string; className?: string; children: React.ReactNode
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}{required && <span className="text-red-500"> *</span>}
      </label>
      {children}
      {error ? <p className="text-xs text-red-600 mt-1">{error}</p> : hint ? <p className="text-xs text-gray-500 mt-1">{hint}</p> : null}
    </div>
  )
}

function ChipInput({ values, onChange, placeholder }: { values: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [input, setInput] = useState('')
  const add = () => {
    const parts = input.split(',').map(s => s.trim()).filter(Boolean)
    const next = [...values]
    for (const p of parts) if (!next.some(v => v.toLowerCase() === p.toLowerCase())) next.push(p)
    onChange(next)
    setInput('')
  }
  return (
    <div className="flex flex-wrap gap-2 border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-500">
      {values.map((v, i) => (
        <span key={`${v}-${i}`} className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded flex items-center gap-1 text-sm">
          {v}
          <button type="button" className="font-bold hover:text-indigo-900" onClick={() => onChange(values.filter((_, j) => j !== i))}>×</button>
        </span>
      ))}
      <input value={input} onChange={e => setInput(e.target.value)} placeholder={placeholder}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add() }
          else if (e.key === 'Backspace' && !input && values.length) onChange(values.slice(0, -1))
        }}
        onBlur={() => input.trim() && add()}
        className="grow min-w-[120px] outline-none text-sm py-1" />
    </div>
  )
}

function Segmented({ options, value, onChange, allowClear }: {
  options: { value: string; label: string }[]; value: string; onChange: (v: string) => void; allowClear?: boolean
}) {
  return (
    <div className="inline-flex flex-wrap rounded-lg border border-gray-300 overflow-hidden">
      {options.map(o => (
        <button key={o.value} type="button"
          onClick={() => onChange(allowClear && value === o.value ? '' : o.value)}
          className={`px-3 py-2 text-sm border-r last:border-r-0 border-gray-300 transition ${value === o.value ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

function TriToggle({ value, onChange }: { value: TriState; onChange: (v: TriState) => void }) {
  const key = value === true ? 'yes' : value === false ? 'no' : 'unverified'
  return (
    <Segmented
      options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }, { value: 'unverified', label: 'Unverified' }]}
      value={key}
      onChange={v => onChange(v === 'yes' ? true : v === 'no' ? false : null)}
    />
  )
}
