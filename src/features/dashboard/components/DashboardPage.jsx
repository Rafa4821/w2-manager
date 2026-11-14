import {
  Building2,
  Users,
  FileText,
  DollarSign,
  ArrowRight,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { StatCard, Badge } from '../../../shared/components'
import { mockCompanies, mockEmployees, mockDocuments } from '../../../shared/data'
import { ROUTES } from '../../../shared/constants'
import { RecentActivity } from './RecentActivity'
import { DocumentStatusChart } from './DocumentStatusChart'

export function DashboardPage() {
  const activeCompanies = mockCompanies.filter((c) => c.status === 'active').length
  const totalEmployees = mockEmployees.length
  const totalDocuments = mockDocuments.length
  const completedDocs = mockDocuments.filter((d) => d.status === 'completed').length
  const pendingDocs = mockDocuments.filter((d) => d.status === 'pending').length
  const draftDocs = mockDocuments.filter((d) => d.status === 'draft').length
  const errorDocs = mockDocuments.filter((d) => d.status === 'error').length
  const totalWages = mockDocuments.reduce((sum, d) => sum + d.wagesTips, 0)

  return (
    <div>
      {/* Stats row */}
      <div className="tw:grid tw:grid-cols-1 sm:tw:grid-cols-2 xl:tw:grid-cols-4 tw:gap-4 tw:mb-6">
        <StatCard
          title="Active Companies"
          value={activeCompanies}
          icon={Building2}
          color="indigo"
          trend={12}
          trendLabel="vs last month"
        />
        <StatCard
          title="Total Employees"
          value={totalEmployees}
          icon={Users}
          color="blue"
          trend={8}
          trendLabel="vs last month"
        />
        <StatCard
          title="W2 Documents"
          value={totalDocuments}
          icon={FileText}
          color="green"
          trend={24}
          trendLabel="vs last month"
        />
        <StatCard
          title="Total Wages Reported"
          value={`$${(totalWages / 1000).toFixed(0)}K`}
          icon={DollarSign}
          color="amber"
          trend={15}
          trendLabel="vs last year"
        />
      </div>

      {/* Second row: Document status + Quick actions */}
      <div className="tw:grid tw:grid-cols-1 lg:tw:grid-cols-3 tw:gap-4 tw:mb-6">
        <div className="lg:tw:col-span-2">
          <DocumentStatusChart
            completed={completedDocs}
            pending={pendingDocs}
            draft={draftDocs}
            error={errorDocs}
          />
        </div>
        <div className="tw:bg-white tw:rounded-xl tw:border tw:border-gray-200 tw:shadow-sm tw:p-5">
          <h3 className="tw:text-sm tw:font-semibold tw:text-gray-900 tw:mb-4">Quick Actions</h3>
          <div className="tw:space-y-2">
            <Link
              to={ROUTES.COMPANIES}
              className="tw:flex tw:items-center tw:justify-between tw:p-3 tw:rounded-lg tw:border tw:border-gray-100 hover:tw:border-indigo-200 hover:tw:bg-indigo-50/50 tw:transition tw:no-underline tw:text-gray-700"
            >
              <div className="tw:flex tw:items-center tw:gap-3">
                <Building2 className="tw:h-4 tw:w-4 tw:text-indigo-500" />
                <span className="tw:text-sm tw:font-medium">Add Company</span>
              </div>
              <ArrowRight className="tw:h-4 tw:w-4 tw:text-gray-400" />
            </Link>
            <Link
              to={ROUTES.EMPLOYEES}
              className="tw:flex tw:items-center tw:justify-between tw:p-3 tw:rounded-lg tw:border tw:border-gray-100 hover:tw:border-blue-200 hover:tw:bg-blue-50/50 tw:transition tw:no-underline tw:text-gray-700"
            >
              <div className="tw:flex tw:items-center tw:gap-3">
                <Users className="tw:h-4 tw:w-4 tw:text-blue-500" />
                <span className="tw:text-sm tw:font-medium">Add Employee</span>
              </div>
              <ArrowRight className="tw:h-4 tw:w-4 tw:text-gray-400" />
            </Link>
            <Link
              to={ROUTES.W2_DOCUMENTS}
              className="tw:flex tw:items-center tw:justify-between tw:p-3 tw:rounded-lg tw:border tw:border-gray-100 hover:tw:border-green-200 hover:tw:bg-green-50/50 tw:transition tw:no-underline tw:text-gray-700"
            >
              <div className="tw:flex tw:items-center tw:gap-3">
                <FileText className="tw:h-4 tw:w-4 tw:text-emerald-500" />
                <span className="tw:text-sm tw:font-medium">Create W2 Document</span>
              </div>
              <ArrowRight className="tw:h-4 tw:w-4 tw:text-gray-400" />
            </Link>
          </div>
        </div>
      </div>

      {/* Third row: Recent documents + Activity */}
      <div className="tw:grid tw:grid-cols-1 lg:tw:grid-cols-2 tw:gap-4">
        {/* Recent documents */}
        <div className="tw:bg-white tw:rounded-xl tw:border tw:border-gray-200 tw:shadow-sm">
          <div className="tw:flex tw:items-center tw:justify-between tw:px-5 tw:py-4 tw:border-b tw:border-gray-100">
            <h3 className="tw:text-sm tw:font-semibold tw:text-gray-900">Recent Documents</h3>
            <Link to={ROUTES.W2_DOCUMENTS} className="tw:text-xs tw:font-medium tw:text-indigo-600 hover:tw:text-indigo-700 tw:no-underline">
              View all
            </Link>
          </div>
          <div className="tw:divide-y tw:divide-gray-50">
            {mockDocuments.slice(0, 5).map((doc) => (
              <div key={doc.id} className="tw:flex tw:items-center tw:justify-between tw:px-5 tw:py-3 hover:tw:bg-gray-50/50 tw:transition">
                <div className="tw:flex tw:items-center tw:gap-3 tw:min-w-0">
                  <div className="tw:flex tw:items-center tw:justify-center tw:h-8 tw:w-8 tw:rounded-lg tw:bg-gray-100 tw:flex-shrink-0">
                    <FileText className="tw:h-4 tw:w-4 tw:text-gray-500" />
                  </div>
                  <div className="tw:min-w-0">
                    <p className="tw:text-sm tw:font-medium tw:text-gray-900 tw:truncate">{doc.employeeName}</p>
                    <p className="tw:text-xs tw:text-gray-500">{doc.companyName} &middot; {doc.taxYear}</p>
                  </div>
                </div>
                <Badge variant={doc.status}>{doc.status}</Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <RecentActivity />
      </div>
    </div>
  )
}
