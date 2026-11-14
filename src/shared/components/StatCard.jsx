import { TrendingUp, TrendingDown } from 'lucide-react'

export function StatCard({ title, value, icon: Icon, trend, trendLabel, color = 'indigo' }) {
  const colorMap = {
    indigo: { bg: 'tw:bg-indigo-50', icon: 'tw:text-indigo-600', ring: 'tw:ring-indigo-100' },
    green: { bg: 'tw:bg-emerald-50', icon: 'tw:text-emerald-600', ring: 'tw:ring-emerald-100' },
    blue: { bg: 'tw:bg-blue-50', icon: 'tw:text-blue-600', ring: 'tw:ring-blue-100' },
    amber: { bg: 'tw:bg-amber-50', icon: 'tw:text-amber-600', ring: 'tw:ring-amber-100' },
    rose: { bg: 'tw:bg-rose-50', icon: 'tw:text-rose-600', ring: 'tw:ring-rose-100' },
  }
  const c = colorMap[color] || colorMap.indigo

  return (
    <div className="tw:bg-white tw:rounded-xl tw:border tw:border-gray-200 tw:p-5 tw:shadow-sm hover:tw:shadow-md tw:transition-shadow">
      <div className="tw:flex tw:items-start tw:justify-between">
        <div className="tw:flex-1">
          <p className="tw:text-sm tw:font-medium tw:text-gray-500 tw:mb-1">{title}</p>
          <p className="tw:text-2xl tw:font-bold tw:text-gray-900">{value}</p>
          {trend !== undefined && (
            <div className="tw:flex tw:items-center tw:gap-1 tw:mt-2">
              {trend >= 0 ? (
                <TrendingUp className="tw:h-4 tw:w-4 tw:text-emerald-500" />
              ) : (
                <TrendingDown className="tw:h-4 tw:w-4 tw:text-rose-500" />
              )}
              <span className={`tw:text-xs tw:font-medium ${trend >= 0 ? 'tw:text-emerald-600' : 'tw:text-rose-600'}`}>
                {trend >= 0 ? '+' : ''}{trend}%
              </span>
              {trendLabel && (
                <span className="tw:text-xs tw:text-gray-400 tw:ml-1">{trendLabel}</span>
              )}
            </div>
          )}
        </div>
        {Icon && (
          <div className={`tw:p-2.5 tw:rounded-lg ${c.bg} tw:ring-1 ${c.ring}`}>
            <Icon className={`tw:h-5 tw:w-5 ${c.icon}`} />
          </div>
        )}
      </div>
    </div>
  )
}
