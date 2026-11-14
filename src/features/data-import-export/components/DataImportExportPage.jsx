import { useState, useRef } from 'react'
import { Upload, Download, FileJson, ArrowDownUp, AlertTriangle, Shield } from 'lucide-react'
import { PageHeader, ConfirmDialog } from '../../../shared/components'
import { useNotificationStore } from '../../../shared/store'
import { exportBackup, importBackup, getStorageInfo, clearAllData } from '../../../shared/persistence'
import { companyRepository } from '../../../shared/repositories/companyRepository'
import { employeeRepository } from '../../../shared/repositories/employeeRepository'
import { w2DocumentRepository } from '../../../shared/repositories/w2DocumentRepository'

export function DataImportExportPage() {
  const [dragOver, setDragOver] = useState(false)
  const [confirmRestore, setConfirmRestore] = useState(null) // holds { json, fileName }
  const [confirmClear, setConfirmClear] = useState(false)
  const [storageInfo, setStorageInfo] = useState(() => getStorageInfo())
  const fileInputRef = useRef(null)
  const addNotification = useNotificationStore((s) => s.addNotification)

  const refreshInfo = () => setStorageInfo(getStorageInfo())

  const counts = {
    companies: companyRepository.count(),
    employees: employeeRepository.count(),
    w2Documents: w2DocumentRepository.count(),
  }

  // ── Export ──
  const handleExportBackup = () => {
    try {
      const json = exportBackup()
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `w2manager-backup-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      addNotification({ type: 'success', title: 'Backup Exported', message: 'Full backup downloaded as JSON.' })
    } catch (err) {
      addNotification({ type: 'error', title: 'Export Error', message: err.message })
    }
  }

  // ── Import ──
  const processFile = (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      setConfirmRestore({ json: e.target.result, fileName: file.name })
    }
    reader.onerror = () => {
      addNotification({ type: 'error', title: 'Read Error', message: 'Could not read the file.' })
    }
    reader.readAsText(file)
  }

  const handleFileDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer?.files?.[0]
    processFile(file)
  }

  const handleFileSelect = (e) => {
    const file = e.target?.files?.[0]
    processFile(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleConfirmRestore = () => {
    if (!confirmRestore) return
    try {
      const result = importBackup(confirmRestore.json)
      addNotification({
        type: 'success',
        title: 'Backup Restored',
        message: `Imported ${result.companies} companies, ${result.employees} employees, ${result.w2Documents} documents.`,
      })
      refreshInfo()
    } catch (err) {
      addNotification({ type: 'error', title: 'Restore Error', message: err.message })
    }
    setConfirmRestore(null)
  }

  const handleClearData = () => {
    clearAllData()
    addNotification({ type: 'success', title: 'Data Cleared', message: 'All local data has been removed.' })
    refreshInfo()
    setConfirmClear(false)
  }

  return (
    <div>
      <PageHeader title="Import / Export" description="Backup, restore, and manage your local data" />

      {/* Security notice */}
      <div className="tw:flex tw:items-start tw:gap-3 tw:p-4 tw:mb-6 tw:bg-amber-50 tw:border tw:border-amber-200 tw:rounded-lg">
        <Shield className="tw:h-5 tw:w-5 tw:text-amber-600 tw:flex-shrink-0 tw:mt-0.5" />
        <div>
          <p className="tw:text-sm tw:font-medium tw:text-amber-900">LocalStorage is for development only</p>
          <p className="tw:text-xs tw:text-amber-700 tw:mt-0.5">
            Data stored in the browser is accessible to any script on this origin and offers no access-control guarantees.
            Do not store authentic SSN, EIN, or salary data here. A production deployment must use server-side encrypted storage.
          </p>
        </div>
      </div>

      <div className="tw:grid tw:grid-cols-1 lg:tw:grid-cols-2 tw:gap-6 tw:mb-6">
        {/* Import / Restore */}
        <div className="tw:bg-white tw:rounded-xl tw:border tw:border-gray-200 tw:shadow-sm">
          <div className="tw:flex tw:items-center tw:gap-3 tw:px-5 tw:py-4 tw:border-b tw:border-gray-100">
            <Upload className="tw:h-5 tw:w-5 tw:text-blue-500" />
            <h3 className="tw:text-sm tw:font-semibold tw:text-gray-900">Restore from Backup</h3>
          </div>
          <div className="tw:p-5">
            <input type="file" ref={fileInputRef} accept=".json" onChange={handleFileSelect} className="tw:hidden" />
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`tw:border-2 tw:border-dashed tw:rounded-xl tw:p-8 tw:text-center tw:transition tw:cursor-pointer ${
                dragOver ? 'tw:border-indigo-400 tw:bg-indigo-50' : 'tw:border-gray-200 hover:tw:border-gray-300 hover:tw:bg-gray-50'
              }`}
            >
              <Upload className="tw:h-8 tw:w-8 tw:text-gray-400 tw:mx-auto tw:mb-3" />
              <p className="tw:text-sm tw:font-medium tw:text-gray-700">Drop a backup file here or click to browse</p>
              <p className="tw:text-xs tw:text-gray-500 tw:mt-1">Accepts W2 Manager JSON backup files</p>
            </div>
            <div className="tw:flex tw:gap-2 tw:mt-4">
              <div className="tw:flex tw:items-center tw:gap-2 tw:px-3 tw:py-1.5 tw:bg-gray-50 tw:rounded-lg tw:text-xs tw:text-gray-500">
                <FileJson className="tw:h-3.5 tw:w-3.5" /> JSON backup
              </div>
            </div>
          </div>
        </div>

        {/* Export / Backup */}
        <div className="tw:bg-white tw:rounded-xl tw:border tw:border-gray-200 tw:shadow-sm">
          <div className="tw:flex tw:items-center tw:gap-3 tw:px-5 tw:py-4 tw:border-b tw:border-gray-100">
            <Download className="tw:h-5 tw:w-5 tw:text-emerald-500" />
            <h3 className="tw:text-sm tw:font-semibold tw:text-gray-900">Export Backup</h3>
          </div>
          <div className="tw:p-5 tw:space-y-3">
            <p className="tw:text-sm tw:text-gray-600 tw:mb-4">Download a full JSON backup of all your data.</p>
            {[
              { entity: 'Companies', count: counts.companies },
              { entity: 'Employees', count: counts.employees },
              { entity: 'W2 Documents', count: counts.w2Documents },
            ].map(({ entity, count }) => (
              <div key={entity} className="tw:flex tw:items-center tw:justify-between tw:p-3 tw:rounded-lg tw:border tw:border-gray-100">
                <div>
                  <p className="tw:text-sm tw:font-medium tw:text-gray-900">{entity}</p>
                  <p className="tw:text-xs tw:text-gray-500">{count} records</p>
                </div>
              </div>
            ))}
            <button
              onClick={handleExportBackup}
              className="tw:w-full tw:flex tw:items-center tw:justify-center tw:gap-2 tw:px-4 tw:py-2.5 tw:text-sm tw:font-medium tw:text-white tw:bg-indigo-600 tw:rounded-lg hover:tw:bg-indigo-700 tw:transition tw:mt-4"
            >
              <Download className="tw:h-4 tw:w-4" />
              Download Full Backup (JSON)
            </button>
          </div>
        </div>
      </div>

      {/* Storage info */}
      <div className="tw:bg-white tw:rounded-xl tw:border tw:border-gray-200 tw:shadow-sm tw:mb-6">
        <div className="tw:flex tw:items-center tw:gap-3 tw:px-5 tw:py-4 tw:border-b tw:border-gray-100">
          <ArrowDownUp className="tw:h-5 tw:w-5 tw:text-gray-400" />
          <h3 className="tw:text-sm tw:font-semibold tw:text-gray-900">Storage Information</h3>
        </div>
        <div className="tw:p-5">
          <div className="tw:grid tw:grid-cols-2 md:tw:grid-cols-4 tw:gap-4">
            <div className="tw:p-3 tw:bg-gray-50 tw:rounded-lg">
              <p className="tw:text-xs tw:text-gray-500">Schema Version</p>
              <p className="tw:text-lg tw:font-semibold tw:text-gray-900">{storageInfo?.schemaVersion ?? '—'}</p>
            </div>
            <div className="tw:p-3 tw:bg-gray-50 tw:rounded-lg">
              <p className="tw:text-xs tw:text-gray-500">Storage Used</p>
              <p className="tw:text-lg tw:font-semibold tw:text-gray-900">{storageInfo?.sizeKB ?? '—'} KB</p>
            </div>
            <div className="tw:p-3 tw:bg-gray-50 tw:rounded-lg">
              <p className="tw:text-xs tw:text-gray-500">Last Saved</p>
              <p className="tw:text-sm tw:font-medium tw:text-gray-900">{storageInfo?.lastSaved?.split('T')[0] ?? '—'}</p>
            </div>
            <div className="tw:p-3 tw:bg-gray-50 tw:rounded-lg">
              <p className="tw:text-xs tw:text-gray-500">Total Records</p>
              <p className="tw:text-lg tw:font-semibold tw:text-gray-900">{counts.companies + counts.employees + counts.w2Documents}</p>
            </div>
          </div>
          <div className="tw:mt-4 tw:flex tw:justify-end">
            <button
              onClick={() => setConfirmClear(true)}
              className="tw:flex tw:items-center tw:gap-2 tw:px-4 tw:py-2 tw:text-sm tw:font-medium tw:text-rose-600 tw:bg-white tw:border tw:border-rose-200 tw:rounded-lg hover:tw:bg-rose-50 tw:transition"
            >
              <AlertTriangle className="tw:h-4 tw:w-4" />
              Clear All Data
            </button>
          </div>
        </div>
      </div>

      {/* Confirm restore dialog */}
      <ConfirmDialog
        isOpen={!!confirmRestore}
        onClose={() => setConfirmRestore(null)}
        onConfirm={handleConfirmRestore}
        title="Restore Backup"
        message={`Are you sure you want to restore from "${confirmRestore?.fileName}"? This will REPLACE all existing data. This action cannot be undone.`}
        confirmLabel="Restore Backup"
      />

      {/* Confirm clear dialog */}
      <ConfirmDialog
        isOpen={confirmClear}
        onClose={() => setConfirmClear(false)}
        onConfirm={handleClearData}
        title="Clear All Data"
        message="Are you sure you want to delete ALL local data? Companies, employees, and documents will be permanently removed. This action cannot be undone."
        confirmLabel="Clear All Data"
      />
    </div>
  )
}
