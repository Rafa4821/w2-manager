import { Menu, Bell, User } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useLayoutStore } from '../shared/store'
import { ROUTES } from '../shared/constants'

const pageTitles = {
  [ROUTES.DASHBOARD]: 'Dashboard',
  [ROUTES.COMPANIES]: 'Companies',
  [ROUTES.EMPLOYEES]: 'Employees',
  [ROUTES.W2_DOCUMENTS]: 'W2 Documents',
  [ROUTES.TEMPLATE_LIBRARY]: 'Template Library',
  [ROUTES.PDF_GENERATOR]: 'PDF Generator',
  [ROUTES.DATA_IMPORT_EXPORT]: 'Import / Export',
  [ROUTES.SETTINGS]: 'Settings',
}

export function Header() {
  const { toggleMobileSidebar } = useLayoutStore()
  const location = useLocation()
  const title = pageTitles[location.pathname] || 'W2 Manager'

  return (
    <header className="tw:flex tw:items-center tw:justify-between tw:h-16 tw:px-4 lg:tw:px-6 tw:bg-white tw:border-b tw:border-gray-200 tw:flex-shrink-0">
      <div className="tw:flex tw:items-center tw:gap-3">
        <button
          onClick={toggleMobileSidebar}
          className="tw:p-2 tw:rounded-lg tw:text-gray-400 hover:tw:text-gray-600 hover:tw:bg-gray-100 tw:transition lg:tw:hidden"
        >
          <Menu className="tw:h-5 tw:w-5" />
        </button>
        <h2 className="tw:text-lg tw:font-semibold tw:text-gray-800 tw:hidden sm:tw:block">{title}</h2>
      </div>

      <div className="tw:flex tw:items-center tw:gap-2">
        <button className="tw:relative tw:p-2 tw:rounded-lg tw:text-gray-400 hover:tw:text-gray-600 hover:tw:bg-gray-100 tw:transition">
          <Bell className="tw:h-5 tw:w-5" />
          <span className="tw:absolute tw:top-1.5 tw:right-1.5 tw:h-2 tw:w-2 tw:bg-rose-500 tw:rounded-full tw:ring-2 tw:ring-white" />
        </button>
        <div className="tw:flex tw:items-center tw:gap-2 tw:ml-2 tw:pl-3 tw:border-l tw:border-gray-200">
          <div className="tw:h-8 tw:w-8 tw:rounded-full tw:bg-indigo-100 tw:flex tw:items-center tw:justify-center">
            <User className="tw:h-4 tw:w-4 tw:text-indigo-600" />
          </div>
          <div className="tw:hidden sm:tw:block">
            <p className="tw:text-sm tw:font-medium tw:text-gray-700 tw:leading-tight">Admin User</p>
            <p className="tw:text-xs tw:text-gray-400 tw:leading-tight">admin@w2manager.com</p>
          </div>
        </div>
      </div>
    </header>
  )
}
