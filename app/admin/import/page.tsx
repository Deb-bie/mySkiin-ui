'use client'
import { Fragment, useCallback, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useAppState } from '@/app/hooks/useAppState'
import { appStore } from '@/app/lib/store'
import { readSpreadsheetFile } from '@/app/lib/import/readers'
import { parseCatalog, ParsedCatalog, templateCsv, TEMPLATE_HEADERS } from '@/app/lib/import/catalog'
import { buildPlan, ExistingProductMode, ImportPlan, PlannedProduct } from '@/app/lib/import/plan'
import { executeImport, getAllCategoriesInABrand, ImportProgress, ImportResult } from '@/app/lib/firebase/services'
import { Category } from '@/app/models/model'

type Stage = 'pick' | 'reading' | 'preview' | 'importing' | 'done'
type Tab = 'create' | 'update' | 'skip'

export default function ImportPage() {
  useAppState() // keeps the store loaded and signed-in state checked
  const [stage, setStage] = useState<Stage>('pick')
  const [fileName, setFileName] = useState('')
  const [parsed, setParsed] = useState<ParsedCatalog | null>(null)
  const [categoriesByBrandId, setCategoriesByBrandId] = useState<Record<string, Category[]>>({})
  const [mode, setMode] = useState<ExistingProductMode>('skip')
  const [error, setError] = useState('')
  const [progress, setProgress] = useState<ImportProgress | null>(null)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [tab, setTab] = useState<Tab>('create')
  const [showAllIssues, setShowAllIssues] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const plan: ImportPlan | null = useMemo(() => {
    if (!parsed) return null
    const s = appStore.getState()
    return buildPlan(parsed, s.brands, s.products, categoriesByBrandId, mode)
  }, [parsed, categoriesByBrandId, mode])

  const handleFile = useCallback(async (file: File) => {
    setError('')
    setFileName(file.name)
    setStage('reading')
    try {
      const sheets = await readSpreadsheetFile(file)
      const result = parseCatalog(sheets)
      if (!result.products.length && !result.brands.length) {
        throw new Error('No brands or products were found. Check that the first row has column headers like "Brand" and "Product Name".')
      }
      // Compare against fresh data, not the cached copy
      await Promise.all([appStore.loadBrands(), appStore.loadProducts()])
      const brands = appStore.getState().brands
      const names = new Set([...result.brands.map(b => b.name), ...result.products.map(p => p.brandName)].map(n => n.toLowerCase()))
      const involved = brands.filter(b => names.has(b.name.toLowerCase()))
      const cats: Record<string, Category[]> = {}
      for (let i = 0; i < involved.length; i += 8) {
        await Promise.all(involved.slice(i, i + 8).map(async b => {
          cats[b.id] = await getAllCategoriesInABrand(b.id).catch(() => [])
        }))
      }
      setCategoriesByBrandId(cats)
      setParsed(result)
      setTab('create')
      setStage('preview')
    } catch (e: any) {
      setError(e?.message ?? 'Could not read this file.')
      setStage('pick')
    }
  }, [])

  const runImport = async () => {
    if (!plan) return
    setError('')
    setStage('importing')
    try {
      const res = await executeImport(plan, setProgress)
      setResult(res)
      appStore.setState({ dict: {} }) // category lists changed; let pages reload them
      await appStore.refreshAll()
      setStage('done')
    } catch (e: any) {
      setError(e?.message ?? 'Import failed.')
      setStage('preview')
    }
  }

  const reset = () => {
    setStage('pick'); setParsed(null); setResult(null); setProgress(null); setError(''); setFileName('')
    if (inputRef.current) inputRef.current.value = ''
  }

  const downloadTemplate = () => {
    const blob = new Blob([templateCsv()], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'myskiin-product-import-template.csv'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const errors = parsed?.issues.filter(i => i.level === 'error') ?? []
  const warnings = parsed?.issues.filter(i => i.level === 'warning') ?? []
  const toWrite = plan ? plan.productsToCreate.length + plan.productsToUpdate.length + plan.newBrands + plan.brandsToFill + plan.categoriesToCreate.length : 0

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Import Brands & Products</h1>
          <p className="text-gray-600 mt-1">Upload an Excel (.xlsx) or CSV file to add many brands and products at once.</p>
        </div>
        <button onClick={downloadTemplate} className="shrink-0 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
          Download CSV template
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 text-sm flex justify-between gap-4">
          <span>{error}</span>
          <button onClick={() => setError('')} className="font-semibold">Dismiss</button>
        </div>
      )}

      {/* STEP 1: pick a file */}
      {(stage === 'pick' || stage === 'reading') && (
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-5">
          <label
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f) }}
            className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-12 cursor-pointer transition
              ${dragOver ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'}`}
          >
            <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            {stage === 'reading' ? (
              <p className="text-gray-700 font-medium">Reading {fileName}…</p>
            ) : (
              <>
                <p className="text-gray-900 font-semibold">Drop a file here, or click to choose</p>
                <p className="text-sm text-gray-500 mt-1">.xlsx or .csv · nothing is saved until you confirm</p>
              </>
            )}
            <input ref={inputRef} type="file" accept=".xlsx,.csv,text/csv" className="hidden" disabled={stage === 'reading'}
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
          </label>

          <details className="text-sm text-gray-600">
            <summary className="cursor-pointer font-medium text-gray-800">What should the file look like?</summary>
            <div className="mt-3 space-y-2">
              <p>The first row must be column headers. Only <b>Brand</b> and <b>Product Name</b> are required; every other column is optional and matched by name (for example &quot;Skin Types&quot; or &quot;Suitable Skin Types&quot; both work).</p>
              <p>A workbook can have a <b>Products</b> sheet and a <b>Brands</b> sheet (Brand, Country, Website, Price Tier). Other sheets are ignored. The mySkiin catalog spreadsheet works as-is.</p>
              <p>Lists (skin types, concerns, tags, key ingredients) are comma-separated. Active ingredients use <code className="bg-gray-100 px-1 rounded">Name (Class, Strength); Name (Class, Strength)</code>. Placeholders like &quot;Pending&quot; or &quot;Not stated&quot; are treated as empty.</p>
              <p className="text-gray-500">Recognised columns: {TEMPLATE_HEADERS.join(' · ')}</p>
            </div>
          </details>
        </div>
      )}

      {/* STEP 2: preview */}
      {stage === 'preview' && parsed && plan && (
        <>
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-gray-500">File</p>
                <p className="font-semibold text-gray-900">{fileName}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {parsed.sheetsUsed.map(s => `${s.name} (${s.rows} ${s.kind})`).join(' · ')}
                  {parsed.sheetsIgnored.length > 0 && ` · ignored: ${parsed.sheetsIgnored.join(', ')}`}
                </p>
              </div>
              <button onClick={reset} className="text-sm text-gray-600 hover:text-gray-900 font-medium">Choose another file</button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <Tile label="New brands" value={plan.newBrands} />
              <Tile label="Existing brands" value={plan.brands.length - plan.newBrands} sub={plan.brandsToFill ? `${plan.brandsToFill} get missing details` : undefined} />
              <Tile label="New categories" value={plan.categoriesToCreate.length} />
              <Tile label="New products" value={plan.productsToCreate.length} accent />
              <Tile label={mode === 'update' ? 'Products to update' : 'Already exist (skipped)'} value={mode === 'update' ? plan.productsToUpdate.length : plan.productsSkipped.length} />
              <Tile label="Rows with errors" value={errors.length} warn={errors.length > 0} sub={parsed.skippedPlaceholders ? `${parsed.skippedPlaceholders} placeholder rows ignored` : undefined} />
            </div>

            <fieldset className="border border-gray-200 rounded-lg p-4">
              <legend className="text-sm font-medium text-gray-800 px-1">When a product already exists (same brand and name)</legend>
              <div className="flex flex-col md:flex-row gap-3 md:gap-8 text-sm">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="radio" name="mode" checked={mode === 'skip'} onChange={() => setMode('skip')} className="mt-1" />
                  <span><b>Skip it</b> — leave the existing product untouched</span>
                </label>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="radio" name="mode" checked={mode === 'update'} onChange={() => setMode('update')} className="mt-1" />
                  <span><b>Update it</b> with values from the file — empty cells never erase existing data</span>
                </label>
              </div>
            </fieldset>

            {parsed.sheetsUsed.some(s => s.unmatchedHeaders.length) && (
              <p className="text-xs text-gray-500">
                Columns not imported: {Array.from(new Set(parsed.sheetsUsed.flatMap(s => s.unmatchedHeaders))).join(', ')}
              </p>
            )}
          </div>

          {(errors.length > 0 || warnings.length > 0) && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900">
                  Check these rows <span className="text-sm font-normal text-gray-500">({errors.length} skipped · {warnings.length} warnings)</span>
                </h2>
                {parsed.issues.length > 12 && (
                  <button onClick={() => setShowAllIssues(v => !v)} className="text-sm text-indigo-600 font-medium">
                    {showAllIssues ? 'Show fewer' : `Show all ${parsed.issues.length}`}
                  </button>
                )}
              </div>
              <ul className="space-y-1.5 text-sm max-h-80 overflow-y-auto">
                {[...errors, ...warnings].slice(0, showAllIssues ? 1000 : 12).map((i, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className={`shrink-0 px-1.5 rounded text-xs font-semibold ${i.level === 'error' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'}`}>
                      {i.level === 'error' ? 'Skipped' : 'Warning'}
                    </span>
                    <span className="text-gray-500 shrink-0">{i.sheet} row {i.row}</span>
                    <span className="text-gray-800">{i.message}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <FieldCoverage rows={[...plan.productsToCreate, ...plan.productsToUpdate]} />

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="flex border-b">
              {([['create', `New (${plan.productsToCreate.length})`], ['update', `Updates (${plan.productsToUpdate.length})`], ['skip', `Skipped (${plan.productsSkipped.length})`]] as [Tab, string][]).map(([t, label]) => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-5 py-3 text-sm font-medium border-b-2 -mb-px ${tab === t ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-gray-600 hover:text-gray-900'}`}>
                  {label}
                </button>
              ))}
            </div>
            <PreviewTable rows={tab === 'create' ? plan.productsToCreate : tab === 'update' ? plan.productsToUpdate : plan.productsSkipped} />
          </div>

          <div className="sticky bottom-0 bg-gray-50/95 backdrop-blur py-4 flex items-center justify-end gap-3 border-t">
            <button onClick={reset} className="px-5 py-2.5 rounded-lg bg-white border border-gray-300 font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
            <button onClick={runImport} disabled={toWrite === 0}
              className="px-5 py-2.5 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-50">
              {toWrite === 0 ? 'Nothing to import' : `Import ${plan.productsToCreate.length + plan.productsToUpdate.length} products · ${plan.newBrands} new brands`}
            </button>
          </div>
        </>
      )}

      {/* STEP 3: importing */}
      {stage === 'importing' && (
        <div className="bg-white rounded-xl shadow-sm p-8">
          <p className="font-semibold text-gray-900 mb-3">Importing… keep this tab open.</p>
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
            <div className="h-full bg-green-500 transition-all" style={{ width: `${progress && progress.total ? (progress.done / progress.total) * 100 : 3}%` }} />
          </div>
          <p className="text-sm text-gray-500 mt-2">{progress ? `${progress.done} of ${progress.total} records saved` : 'Preparing…'}</p>
        </div>
      )}

      {/* STEP 4: done */}
      {stage === 'done' && result && (
        <div className="bg-white rounded-xl shadow-sm p-8 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xl">✓</div>
            <h2 className="text-2xl font-bold text-gray-900">Import complete</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Tile label="Products added" value={result.productsCreated} accent />
            <Tile label="Products updated" value={result.productsUpdated} />
            <Tile label="Brands added" value={result.brandsCreated} />
            <Tile label="Brands updated" value={result.brandsUpdated} />
            <Tile label="Categories added" value={result.categoriesCreated} />
          </div>
          <div className="flex gap-3">
            <Link href="/admin/products" className="px-5 py-2.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700">View products</Link>
            <Link href="/admin/brands" className="px-5 py-2.5 rounded-lg bg-white border border-gray-300 font-semibold text-gray-700 hover:bg-gray-50">View brands</Link>
            <button onClick={reset} className="px-5 py-2.5 rounded-lg text-gray-700 font-semibold hover:bg-gray-100">Import another file</button>
          </div>
        </div>
      )}
    </div>
  )
}

function Tile({ label, value, sub, accent, warn }: { label: string; value: number; sub?: string; accent?: boolean; warn?: boolean }) {
  return (
    <div className={`rounded-lg p-4 border ${accent ? 'border-green-200 bg-green-50' : warn ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'}`}>
      <p className="text-xs text-gray-600">{label}</p>
      <p className="text-2xl font-bold text-gray-900 tabular-nums">{value.toLocaleString()}</p>
      {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
    </div>
  )
}

const tri = (v: boolean | null) => (v === true ? 'Yes' : v === false ? 'No' : 'Unverified')
const PREG: Record<string, string> = { yes: 'Yes', no: 'No', consult: 'Consult doctor', unverified: 'Unverified' }

/** Every field a product will save, with plain-English labels. */
function savedFields(r: PlannedProduct): [string, string][] {
  const f = r.source.fields
  const list = (v: string[]) => v.join(', ')
  return [
    ['Brand', r.data.brandName],
    ['Categories', list(r.source.categoryNames)],
    ['Short description', f.subtitle],
    ['Description', f.description],
    ['How to use', f.howToUse],
    ['Tags', list(f.tags)],
    ['Suitable skin types', list(f.skinType)],
    ['Not suitable for', list(f.notSuitableSkinTypes)],
    ['Concerns targeted', list(f.concerns)],
    ['Primary concern', f.primaryConcern],
    ['Experience level', f.experienceLevel],
    ['Fragrance-free', tri(f.isFragranceFree)],
    ['Non-comedogenic', tri(f.isNonComedogenic)],
    ['Pregnancy-safe', PREG[f.pregnancySafe]],
    ['Key ingredients', list(f.keyIngredients)],
    ['Active ingredients', f.activeIngredients.map(a => `${a.name} (${a.class || 'no class'}${a.strength ? `, ${a.strength}` : ''})`).join('; ')],
    ['Full ingredient list (INCI)', f.ingredients.length ? `${f.ingredients.length} ingredients` : ''],
    ['Time of day', f.timeOfDay],
    ['Step order', f.stepOrder != null ? String(f.stepOrder) : ''],
    ['Frequency', f.frequency],
    ['Texture', f.texture],
    ['Price tier', f.priceTier],
    ['Period after opening', f.periodAfterOpeningMonths != null ? `${f.periodAfterOpeningMonths} months` : ''],
    ['Product page', f.productUrl],
    ['Image', f.image],
    ['Barcode', f.barcode],
    ['Data confidence', f.dataConfidence],
  ]
}

/** How many of the products being imported have each field filled in. */
function FieldCoverage({ rows }: { rows: PlannedProduct[] }) {
  if (!rows.length) return null
  const labels = savedFields(rows[0]).map(([label]) => label).filter(l => l !== 'Brand')
  const counts = labels.map(label => ({
    label,
    n: rows.filter(r => {
      const v = savedFields(r).find(([l]) => l === label)?.[1] ?? ''
      return v !== '' && v !== 'Unverified'
    }).length,
  }))
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900">What will be saved</h2>
      <p className="text-xs text-gray-500 mb-4">Number of the {rows.length} products being imported that have each field filled in. Click any row in the table below to see its values.</p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-2 text-sm">
        {counts.map(c => (
          <div key={c.label} className="flex justify-between gap-3 border-b border-gray-100 py-1">
            <span className="text-gray-700">{c.label}</span>
            <span className={`tabular-nums font-medium ${c.n === 0 ? 'text-amber-600' : 'text-gray-900'}`}>{c.n}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function PreviewTable({ rows }: { rows: PlannedProduct[] }) {
  const [open, setOpen] = useState<string | null>(null)
  if (!rows.length) return <p className="p-8 text-center text-sm text-gray-500">Nothing here.</p>
  const shown = rows.slice(0, 100)
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
          <tr>
            {['', 'Row', 'Brand', 'Product', 'Category', 'Price tier', 'AM/PM', 'Step', 'Actives', 'How to use', 'Notes'].map(h => (
              <th key={h} className="px-4 py-2 text-left font-medium whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {shown.map(r => {
            const f = r.source.fields
            const key = `${r.source.sheet}-${r.source.row}`
            const isOpen = open === key
            return (
              <Fragment key={key}>
                <tr onClick={() => setOpen(isOpen ? null : key)} className={`cursor-pointer ${isOpen ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}>
                  <td className="pl-4 py-2 text-gray-400">{isOpen ? '▾' : '▸'}</td>
                  <td className="px-4 py-2 text-gray-400 tabular-nums">{r.source.row}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{r.data.brandName}</td>
                  <td className="px-4 py-2 font-medium text-gray-900">{f.name}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{r.source.categoryNames.join(', ') || <span className="text-amber-600">none</span>}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{f.priceTier || '—'}</td>
                  <td className="px-4 py-2">{f.timeOfDay || '—'}</td>
                  <td className="px-4 py-2 tabular-nums">{f.stepOrder ?? '—'}</td>
                  <td className="px-4 py-2 tabular-nums">{f.activeIngredients.length || '—'}</td>
                  <td className="px-4 py-2">{f.howToUse ? '✓' : '—'}</td>
                  <td className="px-4 py-2 text-xs text-amber-700">{r.source.warnings.length ? `${r.source.warnings.length} warning${r.source.warnings.length > 1 ? 's' : ''}` : ''}</td>
                </tr>
                {isOpen && (
                  <tr className="bg-indigo-50/40">
                    <td colSpan={11} className="px-6 py-4">
                      <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                        {savedFields(r).map(([label, value]) => (
                          <div key={label} className="grid grid-cols-[170px_1fr] gap-3">
                            <dt className="text-gray-500">{label}</dt>
                            <dd className={value ? 'text-gray-900 break-words' : 'text-gray-400'}>{value || '—'}</dd>
                          </div>
                        ))}
                      </dl>
                      {r.source.warnings.length > 0 && (
                        <ul className="mt-3 text-xs text-amber-800 list-disc pl-5">{r.source.warnings.map(w => <li key={w}>{w}</li>)}</ul>
                      )}
                    </td>
                  </tr>
                )}
              </Fragment>
            )
          })}
        </tbody>
      </table>
      {rows.length > shown.length && <p className="px-4 py-3 text-xs text-gray-500 border-t">Showing first 100 of {rows.length} rows.</p>}
    </div>
  )
}
