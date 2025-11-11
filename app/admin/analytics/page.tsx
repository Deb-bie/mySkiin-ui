'use client'

export default function AnalyticsPage() {
  const metrics = [
    { label: 'Average Session Duration', value: '12m 34s', trend: '+8%' },
    { label: 'Bounce Rate', value: '32.5%', trend: '-5%' },
    { label: 'Page Views', value: '45.2K', trend: '+15%' },
    { label: 'Conversion Rate', value: '4.8%', trend: '+2%' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Analytics & Insights</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600 mb-1">{metric.label}</p>
            <div className="flex items-end justify-between">
              <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
              <span className="text-sm font-semibold text-green-600">{metric.trend}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">User Engagement Trends</h2>
        <div className="h-64 flex items-end justify-around gap-2">
          {[65, 78, 82, 90, 75, 88, 95].map((height, idx) => (
            <div key={idx} className="flex-1 bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t-lg transition-all hover:opacity-80" 
                 style={{ height: `${height}%` }} />
          ))}
        </div>
      </div>
    </div>
  )
}