import { Outlet, NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  Library,
  Printer,
  ArrowDownUp,
  Settings,
} from 'lucide-react'
import { ROUTES, APP_NAME } from '../shared/constants'

const navItems = [
  { to: ROUTES.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
  { to: ROUTES.COMPANIES, label: 'Companies', icon: Building2 },
  { to: ROUTES.EMPLOYEES, label: 'Employees', icon: Users },
  { to: ROUTES.W2_DOCUMENTS, label: 'W2 Documents', icon: FileText },
  { to: ROUTES.TEMPLATE_LIBRARY, label: 'Templates', icon: Library },
  { to: ROUTES.PDF_GENERATOR, label: 'PDF Generator', icon: Printer },
  { to: ROUTES.DATA_IMPORT_EXPORT, label: 'Import / Export', icon: ArrowDownUp },
  { to: ROUTES.SETTINGS, label: 'Settings', icon: Settings },
]

export function MainLayout() {
  return (
    <div className="tw:flex tw:h-screen tw:bg-gray-50">
      {/* Sidebar */}
      <aside className="tw:w-64 tw:bg-white tw:border-r tw:border-gray-200 tw:flex tw:flex-col">
        <div className="tw:p-4 tw:border-b tw:border-gray-200">
          <h1 className="tw:text-xl tw:font-bold tw:text-indigo-600">
            {APP_NAME}
          </h1>
        </div>
        <nav className="tw:flex-1 tw:overflow-y-auto tw:p-2">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `tw:flex tw:items-center tw:gap-3 tw:px-3 tw:py-2 tw:rounded-md tw:text-sm tw:font-medium tw:no-underline tw:mb-1 tw:transition-colors ${
                  isActive
                    ? 'tw:bg-indigo-50 tw:text-indigo-700'
                    : 'tw:text-gray-600 hover:tw:bg-gray-100 hover:tw:text-gray-900'
                }`
              }
            >
              <Icon className="tw:h-5 tw:w-5 tw:flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="tw:flex-1 tw:overflow-y-auto tw:p-6">
        <Outlet />
      </main>
    </div>
  )
}
