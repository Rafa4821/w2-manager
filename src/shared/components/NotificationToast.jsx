import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { useNotificationStore } from '../store'

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

const colors = {
  success: 'tw:border-emerald-200 tw:bg-emerald-50',
  error: 'tw:border-rose-200 tw:bg-rose-50',
  warning: 'tw:border-amber-200 tw:bg-amber-50',
  info: 'tw:border-blue-200 tw:bg-blue-50',
}

const iconColors = {
  success: 'tw:text-emerald-500',
  error: 'tw:text-rose-500',
  warning: 'tw:text-amber-500',
  info: 'tw:text-blue-500',
}

export function NotificationToast() {
  const { notifications, removeNotification } = useNotificationStore()

  if (notifications.length === 0) return null

  return (
    <div className="tw:fixed tw:top-4 tw:right-4 tw:z-[100] tw:flex tw:flex-col tw:gap-2 tw:max-w-sm tw:w-full">
      {notifications.map((notification) => {
        const Icon = icons[notification.type] || icons.info
        return (
          <div
            key={notification.id}
            className={`tw:flex tw:items-start tw:gap-3 tw:p-4 tw:rounded-lg tw:border tw:shadow-lg tw:bg-white ${colors[notification.type] || colors.info}`}
          >
            <Icon className={`tw:h-5 tw:w-5 tw:flex-shrink-0 tw:mt-0.5 ${iconColors[notification.type] || iconColors.info}`} />
            <div className="tw:flex-1 tw:min-w-0">
              {notification.title && (
                <p className="tw:text-sm tw:font-semibold tw:text-gray-900">{notification.title}</p>
              )}
              {notification.message && (
                <p className="tw:text-sm tw:text-gray-600 tw:mt-0.5">{notification.message}</p>
              )}
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="tw:p-1 tw:rounded tw:text-gray-400 hover:tw:text-gray-600 tw:transition tw:flex-shrink-0"
            >
              <X className="tw:h-4 tw:w-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
