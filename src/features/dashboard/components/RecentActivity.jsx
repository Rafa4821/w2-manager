import { FileText, Building2, Users, CheckCircle2, Edit, Trash2 } from 'lucide-react'

const activities = [
  { id: 1, action: 'W2 document completed', target: 'John Smith — Acme Corporation', icon: CheckCircle2, iconColor: 'tw:text-emerald-500', bgColor: 'tw:bg-emerald-50', time: '2 hours ago' },
  { id: 2, action: 'Employee added', target: 'Lisa Martinez — Pacific Retail Group', icon: Users, iconColor: 'tw:text-blue-500', bgColor: 'tw:bg-blue-50', time: '4 hours ago' },
  { id: 3, action: 'Company updated', target: 'Global Tech Solutions', icon: Building2, iconColor: 'tw:text-indigo-500', bgColor: 'tw:bg-indigo-50', time: '6 hours ago' },
  { id: 4, action: 'Document drafted', target: 'Sarah Johnson — Acme Corporation', icon: Edit, iconColor: 'tw:text-amber-500', bgColor: 'tw:bg-amber-50', time: '1 day ago' },
  { id: 5, action: 'W2 document generated', target: 'Robert Chen — Global Tech Solutions', icon: FileText, iconColor: 'tw:text-green-500', bgColor: 'tw:bg-green-50', time: '1 day ago' },
  { id: 6, action: 'Employee removed', target: 'Former Employee — Metro Construction', icon: Trash2, iconColor: 'tw:text-rose-500', bgColor: 'tw:bg-rose-50', time: '2 days ago' },
]

export function RecentActivity() {
  return (
    <div className="tw:bg-white tw:rounded-xl tw:border tw:border-gray-200 tw:shadow-sm">
      <div className="tw:px-5 tw:py-4 tw:border-b tw:border-gray-100">
        <h3 className="tw:text-sm tw:font-semibold tw:text-gray-900">Recent Activity</h3>
      </div>
      <div className="tw:divide-y tw:divide-gray-50">
        {activities.map((activity) => {
          const Icon = activity.icon
          return (
            <div key={activity.id} className="tw:flex tw:items-start tw:gap-3 tw:px-5 tw:py-3 hover:tw:bg-gray-50/50 tw:transition">
              <div className={`tw:p-1.5 tw:rounded-lg ${activity.bgColor} tw:mt-0.5 tw:flex-shrink-0`}>
                <Icon className={`tw:h-3.5 tw:w-3.5 ${activity.iconColor}`} />
              </div>
              <div className="tw:min-w-0 tw:flex-1">
                <p className="tw:text-sm tw:text-gray-900">{activity.action}</p>
                <p className="tw:text-xs tw:text-gray-500 tw:truncate">{activity.target}</p>
              </div>
              <span className="tw:text-xs tw:text-gray-400 tw:flex-shrink-0 tw:whitespace-nowrap">{activity.time}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
