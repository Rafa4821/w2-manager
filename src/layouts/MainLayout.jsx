import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { NotificationToast } from '../shared/components'
import { useLayoutStore } from '../shared/store'

export function MainLayout() {
  const { sidebarCollapsed, sidebarMobileOpen, closeMobileSidebar } = useLayoutStore()

  return (
    <div className="tw:flex tw:h-screen tw:bg-gray-50">
      {/* Mobile overlay */}
      {sidebarMobileOpen && (
        <div
          className="tw:fixed tw:inset-0 tw:bg-black/40 tw:z-40 lg:tw:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Sidebar */}
      <Sidebar />

      {/* Main area */}
      <div className={`tw:flex tw:flex-col tw:flex-1 tw:min-w-0 tw:transition-all tw:duration-300 ${sidebarCollapsed ? 'lg:tw:ml-[4.5rem]' : 'lg:tw:ml-64'}`}>
        <Header />
        <main className="tw:flex-1 tw:overflow-y-auto tw:p-4 lg:tw:p-6">
          <Outlet />
        </main>
      </div>

      <NotificationToast />
    </div>
  )
}
