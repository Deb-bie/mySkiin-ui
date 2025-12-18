'use client'
import { useAppState } from '../hooks/useAppState'

export default function DashboardPage() {
  const { state} = useAppState()
  // const { state, getUserActivityByDay, getTopUsers } = useAppState()

  // const signInData = getUserActivityByDay()
  // const topUsers = getTopUsers()

  const userActivity = [
    { time: '00:00', active: 45 },
    { time: '04:00', active: 28 },
    { time: '08:00', active: 156 },
    { time: '12:00', active: 289 },
    { time: '16:00', active: 342 },
    { time: '20:00', active: 234 },
  ]

  const recentActivities = state.users.slice(0, 4).map((user, idx) => ({
    user: user.username,
    action: idx % 3 === 0 ? 'Created a new post' : idx % 3 === 1 ? 'Upgraded to premium' : 'Signed up',
    time: `${idx * 15 + 2} minutes ago`
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-600">
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          title="Total Users"
          // value={state.stats.totalUsers.toLocaleString()}
          change="+12%"
          positive
          icon="👥"
        />
        
        <StatCard
          title="Paid Users"
          // value={state.stats.paidUsers.toLocaleString()}
          change="+8%"
          positive
          icon="💳"
        />
        
        <StatCard
          title="Active Today"
          // value={state.stats.activeToday.toLocaleString()}
          change="+5%"
          positive
          icon="🟢"
        />
        
        <StatCard
          title="Total Products"
          // value={state.stats.totalPosts.toLocaleString()}
          change="+3"
          positive
          icon="📝"
        />
        
        <StatCard
          title="Revenue"
          // value={`${state.stats.revenue.toLocaleString()}`}
          change="+15%"
          positive
          icon="💰"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Weekly Sign-ins</h2>
          <div className="space-y-3">
            {/* {signInData.map((day) => (
              <div key={day.day} className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-600 w-20">{day.day}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
                  <div 
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${(day.logins / 250) * 100}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-gray-700">
                    {day.logins}
                  </span>
                </div>
              </div>
            ))} */}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">User Activity (24h)</h2>
          <div className="space-y-3">
            {userActivity.map((item) => (
              <div key={item.time} className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-600 w-12">{item.time}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
                  <div 
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${(item.active / 350) * 100}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-gray-700">
                    {item.active}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity & Top Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivities.map((activity, idx) => (
              <div key={idx} className="flex items-center justify-between py-3 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold">
                    {/* {activity.user.split(' ').map(n => n[0]).join('')} */}
                    {/* {activity.username} */}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{activity.user}</p>
                    <p className="text-sm text-gray-600">{activity.action}</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Users</h2>
          <div className="space-y-4">
            {/* {topUsers.map((user, idx) => (
              <div key={user.id} className="flex items-center justify-between py-3 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                    #{idx + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{user.signups}</p>
                  <p className="text-xs text-gray-500">sign-ins</p>
                </div>
              </div>
            ))} */}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, change, positive, icon }: any) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        <span className={`text-sm font-semibold ${positive ? 'text-green-600' : 'text-red-600'}`}>
          {change}
        </span>
      </div>
      <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  )
}