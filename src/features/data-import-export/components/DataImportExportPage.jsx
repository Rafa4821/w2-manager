import { useState } from 'react'
import { Upload, Download, FileJson, FileSpreadsheet, ArrowDownUp } from 'lucide-react'
import { PageHeader, Badge } from '../../../shared/components'
import { useNotificationStore } from '../../../shared/store'

const exportHistory = [
  { id: 1, type: 'export', format: 'CSV', records: 45, entity: 'Companies', date: '2025-01-20', status: 'completed' },
  { id: 2, type: 'export', format: 'JSON', records: 128, entity: 'Employees', date: '2025-01-18', status: 'completed' },
  { id: 3, type: 'import', format: 'CSV', records: 23, entity: 'Employees', date: '2025-01-15', status: 'completed' },
  { id: 4, type: 'import', format: 'JSON', records: 8, entity: 'Companies', date: '2025-01-10', status: 'error' },
  { id: 5, type: 'export', format: 'CSV', records: 312, entity: 'W2 Documents', date: '2025-01-08', status: 'completed' },
]

export function DataImportExportPage() {
  const [dragOver, setDragOver] = useState(false)
  const addNotification = useNotificationStore((s) => s.addNotification)

  const handleExport = (entity, format) => {
    addNotification({ type: 'success', title: 'Export Started', message: `${entity} data will be exported as ${format}.` })
  }

  const handleFileDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    addNotification({ type: 'info', title: 'File Received', message: 'File import would be processed here.' })
  }

  return (
    <div>
      <PageHeader title="Import / Export" description="Import and export data in various formats" />

      <div className="tw:grid tw:grid-cols-1 lg:tw:grid-cols-2 tw:gap-6 tw:mb-6">
        {/* Import section */}
        <div className="tw:bg-white tw:rounded-xl tw:border tw:border-gray-200 tw:shadow-sm">
          <div className="tw:flex tw:items-center tw:gap-3 tw:px-5 tw:py-4 tw:border-b tw:border-gray-100">
            <Upload className="tw:h-5 tw:w-5 tw:text-blue-500" />
            <h3 className="tw:text-sm tw:font-semibold tw:text-gray-900">Import Data</h3>
          </div>
          <div className="tw:p-5">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleFileDrop}
              className={`tw:border-2 tw:border-dashed tw:rounded-xl tw:p-8 tw:text-center tw:transition tw:cursor-pointer ${
                dragOver ? 'tw:border-indigo-400 tw:bg-indigo-50' : 'tw:border-gray-200 hover:tw:border-gray-300 hover:tw:bg-gray-50'
              }`}
              onClick={() => addNotification({ type: 'info', title: 'File Browser', message: 'File picker would open here.' })}
            >
              <Upload className="tw:h-8 tw:w-8 tw:text-gray-400 tw:mx-auto tw:mb-3" />
              <p className="tw:text-sm tw:font-medium tw:text-gray-700">Drop files here or click to browse</p>
              <p className="tw:text-xs tw:text-gray-500 tw:mt-1">Supports CSV and JSON files up to 10MB</p>
            </div>
            <div className="tw:flex tw:gap-2 tw:mt-4">
              <div className="tw:flex tw:items-center tw:gap-2 tw:px-3 tw:py-1.5 tw:bg-gray-50 tw:rounded-lg tw:text-xs tw:text-gray-500">
                <FileSpreadsheet className="tw:h-3.5 tw:w-3.5" /> CSV
              </div>
              <div className="tw:flex tw:items-center tw:gap-2 tw:px-3 tw:py-1.5 tw:bg-gray-50 tw:rounded-lg tw:text-xs tw:text-gray-500">
                <FileJson className="tw:h-3.5 tw:w-3.5" /> JSON
              </div>
            </div>
          </div>
        </div>

        {/* Export section */}
        <div className="tw:bg-white tw:rounded-xl tw:border tw:border-gray-200 tw:shadow-sm">
          <div className="tw:flex tw:items-center tw:gap-3 tw:px-5 tw:py-4 tw:border-b tw:border-gray-100">
            <Download className="tw:h-5 tw:w-5 tw:text-emerald-500" />
            <h3 className="tw:text-sm tw:font-semibold tw:text-gray-900">Export Data</h3>
          </div>
          <div className="tw:p-5 tw:space-y-3">
            {[
              { entity: 'Companies', count: 6, icon: '🏢' },
              { entity: 'Employees', count: 8, icon: '👤' },
              { entity: 'W2 Documents', count: 8, icon: '📄' },
            ].map(({ entity, count, icon }) => (
              <div key={entity} className="tw:flex tw:items-center tw:justify-between tw:p-3 tw:rounded-lg tw:border tw:border-gray-100">
                <div className="tw:flex tw:items-center tw:gap-3">
                  <span className="tw:text-lg">{icon}</span>
                  <div>
                    <p className="tw:text-sm tw:font-medium tw:text-gray-900">{entity}</p>
                    <p className="tw:text-xs tw:text-gray-500">{count} records</p>
                  </div>
                </div>
                <div className="tw:flex tw:gap-2">
                  <button
                    onClick={() => handleExport(entity, 'CSV')}
                    className="tw:px-3 tw:py-1.5 tw:text-xs tw:font-medium tw:text-gray-600 tw:bg-gray-50 tw:rounded-lg hover:tw:bg-gray-100 tw:transition tw:border tw:border-gray-200"
                  >
                    CSV
                  </button>
                  <button
                    onClick={() => handleExport(entity, 'JSON')}
                    className="tw:px-3 tw:py-1.5 tw:text-xs tw:font-medium tw:text-gray-600 tw:bg-gray-50 tw:rounded-lg hover:tw:bg-gray-100 tw:transition tw:border tw:border-gray-200"
                  >
                    JSON
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* History */}
      <div className="tw:bg-white tw:rounded-xl tw:border tw:border-gray-200 tw:shadow-sm">
        <div className="tw:flex tw:items-center tw:gap-3 tw:px-5 tw:py-4 tw:border-b tw:border-gray-100">
          <ArrowDownUp className="tw:h-5 tw:w-5 tw:text-gray-400" />
          <h3 className="tw:text-sm tw:font-semibold tw:text-gray-900">Recent Activity</h3>
        </div>
        <div className="tw:overflow-x-auto">
          <table className="tw:w-full tw:text-sm">
            <thead>
              <tr className="tw:border-b tw:border-gray-100">
                <th className="tw:px-4 tw:py-3 tw:text-left tw:text-xs tw:font-semibold tw:text-gray-500 tw:uppercase tw:bg-gray-50/50">Type</th>
                <th className="tw:px-4 tw:py-3 tw:text-left tw:text-xs tw:font-semibold tw:text-gray-500 tw:uppercase tw:bg-gray-50/50">Entity</th>
                <th className="tw:px-4 tw:py-3 tw:text-left tw:text-xs tw:font-semibold tw:text-gray-500 tw:uppercase tw:bg-gray-50/50">Format</th>
                <th className="tw:px-4 tw:py-3 tw:text-left tw:text-xs tw:font-semibold tw:text-gray-500 tw:uppercase tw:bg-gray-50/50">Records</th>
                <th className="tw:px-4 tw:py-3 tw:text-left tw:text-xs tw:font-semibold tw:text-gray-500 tw:uppercase tw:bg-gray-50/50">Date</th>
                <th className="tw:px-4 tw:py-3 tw:text-left tw:text-xs tw:font-semibold tw:text-gray-500 tw:uppercase tw:bg-gray-50/50">Status</th>
              </tr>
            </thead>
            <tbody className="tw:divide-y tw:divide-gray-50">
              {exportHistory.map((item) => (
                <tr key={item.id} className="hover:tw:bg-gray-50/50 tw:transition">
                  <td className="tw:px-4 tw:py-3">
                    <Badge variant={item.type === 'import' ? 'info' : 'draft'}>
                      {item.type === 'import' ? 'Import' : 'Export'}
                    </Badge>
                  </td>
                  <td className="tw:px-4 tw:py-3 tw:text-gray-900 tw:font-medium">{item.entity}</td>
                  <td className="tw:px-4 tw:py-3 tw:text-gray-600">{item.format}</td>
                  <td className="tw:px-4 tw:py-3 tw:text-gray-600">{item.records}</td>
                  <td className="tw:px-4 tw:py-3 tw:text-gray-500 tw:text-xs">{item.date}</td>
                  <td className="tw:px-4 tw:py-3">
                    <Badge variant={item.status}>{item.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
