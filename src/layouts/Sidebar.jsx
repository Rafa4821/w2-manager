import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  Library,
  Printer,
  ArrowDownUp,
  Settings,
  ChevronLeft,
  FileStack,
} from 'lucide-react'
import { ROUTES, APP_NAME } from '../shared/constants'
import { useLayoutStore } from '../shared/store'

const mainNav = [
  { to: ROUTES.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
  { to: ROUTES.COMPANIES, label: 'Companies', icon: Building2 },
  { to: ROUTES.EMPLOYEES, label: 'Employees', icon: Users },
  { to: ROUTES.W2_DOCUMENTS, label: 'W2 Documents', icon: FileText },
]

const toolsNav = [
  { to: ROUTES.TEMPLATE_LIBRARY, label: 'Templates', icon: Library },
  { to: ROUTES.PDF_GENERATOR, label: 'PDF Generator', icon: Printer },
  { to: ROUTES.DATA_IMPORT_EXPORT, label: 'Import / Export', icon: ArrowDownUp },
]

const configNav = [
  { to: ROUTES.SETTINGS, label: 'Settings', icon: Settings },
]

function NavSection({ title, items, collapsed }) {
  const location = useLocation()

  return (
    <div className="tw:mb-2">
      {title && !collapsed && (
        <p className="tw:px-3 tw:pt-4 tw:pb-1 tw:text-[10px] tw:font-bold tw:uppercase tw:tracking-widest tw:text-gray-400">
          {title}
        </p>
      )}
      {title && collapsed && <div className="tw:mx-3 tw:my-2 tw:border-t tw:border-gray-100" />}
      {items.map(({ to, label, icon: Icon }) => {
        const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)
        return (
          <NavLink
            key={to}
            to={to}
            title={collapsed ? label : undefined}
            className={`tw:flex tw:items-center tw:gap-3 tw:mx-2 tw:px-3 tw:py-2 tw:rounded-lg tw:text-sm tw:font-medium tw:no-underline tw:mb-0.5 tw:transition-all tw:duration-150 ${
              isActive
                ? 'tw:bg-indigo-600 tw:text-white tw:shadow-sm tw:shadow-indigo-200'
                : 'tw:text-gray-600 hover:tw:bg-gray-100 hover:tw:text-gray-900'
            } ${collapsed ? 'tw:justify-center tw:px-2' : ''}`}
          >
            <Icon className={`tw:h-[18px] tw:w-[18px] tw:flex-shrink-0 ${isActive ? 'tw:text-white' : 'tw:text-gray-400'}`} />
            {!collapsed && <span className="tw:truncate">{label}</span>}
          </NavLink>
        )
      })}
    </div>
  )
}

export function Sidebar() {
  const { sidebarCollapsed, sidebarMobileOpen, toggleSidebar, closeMobileSidebar } = useLayoutStore()

  return (
    <aside
      className={`tw:fixed tw:top-0 tw:left-0 tw:z-50 tw:h-full tw:bg-white tw:border-r tw:border-gray-200 tw:flex tw:flex-col tw:transition-all tw:duration-300 tw:shadow-sm ${
        sidebarCollapsed ? 'tw:w-[4.5rem]' : 'tw:w-64'
      } ${sidebarMobileOpen ? 'tw:translate-x-0' : 'tw:-translate-x-full'} lg:tw:translate-x-0`}
      onClick={(e) => {
        if (e.target.closest('a')) closeMobileSidebar()
      }}
    >
      {/* Logo area */}
      <div className={`tw:flex tw:items-center tw:h-16 tw:border-b tw:border-gray-100 tw:flex-shrink-0 ${sidebarCollapsed ? 'tw:justify-center tw:px-2' : 'tw:px-4'}`}>
        <div className="tw:flex tw:items-center tw:gap-2.5 tw:min-w-0">
          <div className="tw:flex tw:items-center tw:justify-center tw:h-8 tw:w-8 tw:bg-indigo-600 tw:rounded-lg tw:flex-shrink-0">
            <FileStack className="tw:h-4 tw:w-4 tw:text-white" />
          </div>
          {!sidebarCollapsed && (
            <span className="tw:text-base tw:font-bold tw:text-gray-900 tw:truncate">{APP_NAME}</span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="tw:flex-1 tw:overflow-y-auto tw:py-2 tw:scrollbar-thin">
        <NavSection items={mainNav} collapsed={sidebarCollapsed} />
        <NavSection title="Tools" items={toolsNav} collapsed={sidebarCollapsed} />
        <NavSection title="System" items={configNav} collapsed={sidebarCollapsed} />
      </nav>

      {/* Collapse toggle */}
      <div className="tw:border-t tw:border-gray-100 tw:p-2 tw:hidden lg:tw:block">
        <button
          onClick={toggleSidebar}
          className="tw:flex tw:items-center tw:justify-center tw:w-full tw:py-2 tw:rounded-lg tw:text-gray-400 hover:tw:text-gray-600 hover:tw:bg-gray-100 tw:transition"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft className={`tw:h-4 tw:w-4 tw:transition-transform tw:duration-300 ${sidebarCollapsed ? 'tw:rotate-180' : ''}`} />
        </button>
      </div>
    </aside>
  )
}
