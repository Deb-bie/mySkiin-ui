'use client'
// Lightweight single-series charts (no chart library). One hue for magnitude,
// values in text colour, hover tooltips on every mark.

export interface Datum { label: string; value: number; hint?: string }

/** Horizontal bars with labels; good for rankings and category counts. */
export function BarList({ data, max, format = (v: number) => v.toLocaleString(), empty = 'No data yet' }: {
  data: Datum[]; max?: number; format?: (v: number) => string; empty?: string
}) {
  if (!data.length) return <p className="text-sm text-gray-400 py-6 text-center">{empty}</p>
  const top = max ?? Math.max(...data.map(d => d.value), 1)
  return (
    <ul className="space-y-2">
      {data.map(d => (
        <li key={d.label} className="group grid grid-cols-[minmax(90px,30%)_1fr_auto] items-center gap-3 text-sm"
          title={`${d.label}: ${format(d.value)}${d.hint ? ` · ${d.hint}` : ''}`}>
          <span className="truncate text-gray-700">{d.label}</span>
          <span className="h-3 bg-gray-100 rounded-r">
            <span className="block h-3 rounded-r bg-indigo-500 group-hover:bg-indigo-600 transition-colors"
              style={{ width: `${Math.max((d.value / top) * 100, d.value > 0 ? 1.5 : 0)}%` }} />
          </span>
          <span className="tabular-nums text-gray-900 font-medium text-right min-w-[3ch]">{format(d.value)}</span>
        </li>
      ))}
    </ul>
  )
}

/** Vertical columns over time (e.g. sign-ups per week). */
export function ColumnChart({ data, height = 180, empty = 'No data yet' }: { data: Datum[]; height?: number; empty?: string }) {
  if (!data.length || data.every(d => d.value === 0)) return <p className="text-sm text-gray-400 py-6 text-center">{empty}</p>
  const top = Math.max(...data.map(d => d.value), 1)
  const labelEvery = Math.ceil(data.length / 6)
  return (
    <div>
      <div className="relative flex items-end gap-1.5 border-b border-gray-200" style={{ height }}>
        <span className="absolute -top-1 left-0 text-[11px] text-gray-400 tabular-nums">{top.toLocaleString()}</span>
        {data.map(d => (
          <div key={d.label} className="group relative flex-1 h-full flex items-end">
            <div className="w-full rounded-t bg-indigo-500 group-hover:bg-indigo-600 transition-colors"
              style={{ height: `${(d.value / top) * 100}%`, minHeight: d.value > 0 ? 2 : 0 }} />
            <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white shadow">
              {d.hint ?? d.label}: <b className="tabular-nums">{d.value.toLocaleString()}</b>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-1.5 mt-1">
        {data.map((d, i) => (
          <span key={d.label} className="flex-1 text-center text-[11px] text-gray-500 truncate">{i % labelEvery === 0 ? d.label : ''}</span>
        ))}
      </div>
    </div>
  )
}

/** Share-of-total bar, e.g. how complete a field is across the catalog. */
export function Meter({ label, value, total }: { label: string; value: number; total: number }) {
  const pct = total ? Math.round((value / total) * 100) : 0
  return (
    <div title={`${label}: ${value.toLocaleString()} of ${total.toLocaleString()}`}>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-700">{label}</span>
        <span className="tabular-nums text-gray-900 font-medium">{pct}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full">
        <div className="h-2 rounded-full bg-indigo-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export function StatTile({ title, value, sub, icon }: { title: string; value: string | number; sub?: string; icon?: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
        {icon && <span className="text-xl" aria-hidden>{icon}</span>}
      </div>
      <p className="text-3xl font-bold text-gray-900 mt-1 tabular-nums">{typeof value === 'number' ? value.toLocaleString() : value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  )
}

export function Card({ title, subtitle, children, className = '' }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`bg-white rounded-xl shadow-sm p-6 ${className}`}>
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      {subtitle && <p className="text-xs text-gray-500 mb-4">{subtitle}</p>}
      <div className={subtitle ? '' : 'mt-4'}>{children}</div>
    </section>
  )
}
