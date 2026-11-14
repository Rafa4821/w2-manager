/**
 * Data Import / Export — full-featured page with:
 *   - JSON & CSV import with validation, duplicate detection, preview
 *   - JSON & CSV export per entity
 *   - Batch PDF+ZIP generation with progress
 *   - Full backup / restore with overwrite warnings
 *   - Storage info & clear data
 */
import { useState, useRef, useCallback } from 'react'
import {
  Upload, Download, FileJson, FileSpreadsheet, AlertTriangle, Shield,
  ArrowDownUp, CheckCircle, XCircle, Eye, Package, Printer, FileDown,
} from 'lucide-react'
import { PageHeader, ConfirmDialog, Badge } from '../../../shared/components'
import { useNotificationStore } from '../../../shared/store'
import { exportBackup, importBackup, getStorageInfo, clearAllData } from '../../../shared/persistence'
import { companyRepository } from '../../../shared/repositories/companyRepository'
import { employeeRepository } from '../../../shared/repositories/employeeRepository'
import { w2DocumentRepository } from '../../../shared/repositories/w2DocumentRepository'
// Templates are resolved inside batchPdfZip utility
import {
  toCsv, COMPANY_CSV_COLUMNS, EMPLOYEE_CSV_COLUMNS, W2_CSV_COLUMNS, flattenW2ForCsv,
  previewJsonImport, previewCsvImport, commitImport,
  generateBatchZip, downloadBlob,
} from '../utils'

// ── Helpers ──────────────────────────────────────────────────────

function downloadText(content, filename, mime = 'text/plain') {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; document.body.appendChild(a)
  a.click(); document.body.removeChild(a); URL.revokeObjectURL(url)
}

function entityLabel(type) {
  return { companies: 'Companies', employees: 'Employees', w2Documents: 'W-2 Documents' }[type] || type
}

// ── Main Component ───────────────────────────────────────────────

export function DataImportExportPage() {
  const addNotification = useNotificationStore((s) => s.addNotification)
  const fileInputRef = useRef(null)

  // Import state
  const [importMode, setImportMode] = useState(null)     // 'json' | 'csv'
  const [csvEntity, setCsvEntity] = useState('companies') // entity for CSV import
  const [preview, setPreview] = useState(null)            // analysis result
  const [dragOver, setDragOver] = useState(false)

  // Backup/restore state
  const [confirmRestore, setConfirmRestore] = useState(null)
  const [confirmClear, setConfirmClear] = useState(false)
  const [storageInfo, setStorageInfo] = useState(() => getStorageInfo())

  // Batch PDF state
  const [batchGenerating, setBatchGenerating] = useState(false)
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 })
  const [batchResults, setBatchResults] = useState(null)

  const refreshInfo = () => setStorageInfo(getStorageInfo())

  const counts = {
    companies: companyRepository.count(),
    employees: employeeRepository.count(),
    w2Documents: w2DocumentRepository.count(),
  }

  // ── Import Handling ────────────────────────────────────────────

  const processImportFile = useCallback((file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target.result
      const isJson = file.name.endsWith('.json') || importMode === 'json'
      try {
        let analysis
        if (isJson) {
          // Check if it's a backup file
          const parsed = JSON.parse(text)
          if (parsed._backup) {
            setConfirmRestore({ json: text, fileName: file.name })
            return
          }
          analysis = previewJsonImport(text)
        } else {
          analysis = previewCsvImport(text, csvEntity)
        }
        setPreview(analysis)
      } catch (err) {
        addNotification({ type: 'error', title: 'Import Error', message: err.message })
      }
    }
    reader.onerror = () => addNotification({ type: 'error', title: 'Read Error', message: 'Could not read the file.' })
    reader.readAsText(file)
  }, [importMode, csvEntity, addNotification])

  const handleFileDrop = (e) => {
    e.preventDefault(); setDragOver(false)
    processImportFile(e.dataTransfer?.files?.[0])
  }

  const handleFileSelect = (e) => {
    processImportFile(e.target?.files?.[0])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleCommitImport = (includeDuplicates = false) => {
    if (!preview) return
    try {
      const dups = includeDuplicates ? preview.duplicates.map((d) => d.record) : []
      const result = commitImport(preview.entityType, preview.newRecords, includeDuplicates, dups)
      addNotification({ type: 'success', title: 'Import Complete', message: `${result.imported} ${entityLabel(preview.entityType)} imported.` })
      setPreview(null)
      refreshInfo()
    } catch (err) {
      addNotification({ type: 'error', title: 'Import Failed', message: err.message })
    }
  }

  // ── Export Handling ────────────────────────────────────────────

  const handleExportJson = (entity) => {
    const repo = { companies: companyRepository, employees: employeeRepository, w2Documents: w2DocumentRepository }[entity]
    const data = repo.getAll()
    downloadText(JSON.stringify({ [entity]: data }, null, 2), `${entity}_${new Date().toISOString().split('T')[0]}.json`, 'application/json')
    addNotification({ type: 'success', title: 'Exported', message: `${data.length} ${entityLabel(entity)} exported as JSON.` })
  }

  const handleExportCsv = (entity) => {
    const repo = { companies: companyRepository, employees: employeeRepository, w2Documents: w2DocumentRepository }[entity]
    const data = repo.getAll()
    const cols = { companies: COMPANY_CSV_COLUMNS, employees: EMPLOYEE_CSV_COLUMNS, w2Documents: W2_CSV_COLUMNS }[entity]
    const rows = entity === 'w2Documents' ? data.map(flattenW2ForCsv) : data
    downloadText(toCsv(rows, entity === 'w2Documents' ? [...cols, 'companyName', 'employeeName'] : cols), `${entity}_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv')
    addNotification({ type: 'success', title: 'Exported', message: `${data.length} ${entityLabel(entity)} exported as CSV.` })
  }

  const handleExportBackup = () => {
    try {
      downloadText(exportBackup(), `w2manager-backup-${new Date().toISOString().split('T')[0]}.json`, 'application/json')
      addNotification({ type: 'success', title: 'Backup Exported', message: 'Full backup downloaded.' })
    } catch (err) {
      addNotification({ type: 'error', title: 'Export Error', message: err.message })
    }
  }

  // ── Backup Restore ────────────────────────────────────────────

  const handleConfirmRestore = () => {
    if (!confirmRestore) return
    try {
      const result = importBackup(confirmRestore.json)
      addNotification({ type: 'success', title: 'Backup Restored', message: `Imported ${result.companies} companies, ${result.employees} employees, ${result.w2Documents} documents.` })
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

  // ── Batch PDF + ZIP ───────────────────────────────────────────

  const handleBatchPdfZip = async () => {
    const docs = w2DocumentRepository.getAll().filter((d) => d.status === 'completed')
    if (docs.length === 0) {
      addNotification({ type: 'warning', title: 'No Documents', message: 'No completed W-2 documents to export.' })
      return
    }

    setBatchGenerating(true)
    setBatchProgress({ current: 0, total: docs.length })
    setBatchResults(null)

    try {
      const result = await generateBatchZip(docs, null, (current, total, lastResult) => {
        setBatchProgress({ current, total })
        // Pick best template per document
        if (lastResult) setBatchResults((prev) => [...(prev || []), lastResult])
      })

      downloadBlob(result.zipBlob, result.zipFilename)
      setBatchResults(result.results)
      addNotification({
        type: result.failCount === 0 ? 'success' : 'warning',
        title: 'ZIP Generated',
        message: `${result.successCount} PDFs generated, ${result.failCount} failed.`,
      })
    } catch (err) {
      addNotification({ type: 'error', title: 'ZIP Error', message: err.message })
    }
    setBatchGenerating(false)
  }

  // ── Render ────────────────────────────────────────────────────

  return (
    <div>
      <PageHeader title="Import / Export" description="Import, export, backup, and batch-generate W-2 PDFs" />

      {/* Security notice */}
      <div className="tw:flex tw:items-start tw:gap-3 tw:p-4 tw:mb-6 tw:bg-amber-50 tw:border tw:border-amber-200 tw:rounded-lg">
        <Shield className="tw:h-5 tw:w-5 tw:text-amber-600 tw:flex-shrink-0 tw:mt-0.5" />
        <div>
          <p className="tw:text-sm tw:font-medium tw:text-amber-900">LocalStorage is for development only</p>
          <p className="tw:text-xs tw:text-amber-700 tw:mt-0.5">
            Do not store authentic SSN, EIN, or salary data here. All examples use fictitious information.
          </p>
        </div>
      </div>

      {/* ── IMPORT SECTION ─────────────────────────────────────── */}
      <div className="tw:bg-white tw:rounded-xl tw:border tw:border-gray-200 tw:shadow-sm tw:mb-6">
        <div className="tw:flex tw:items-center tw:gap-3 tw:px-5 tw:py-4 tw:border-b tw:border-gray-100">
          <Upload className="tw:h-5 tw:w-5 tw:text-blue-500" />
          <h3 className="tw:text-sm tw:font-semibold tw:text-gray-900">Import Data</h3>
        </div>
        <div className="tw:p-5">
          {/* Import mode selector */}
          <div className="tw:flex tw:items-center tw:gap-3 tw:mb-4">
            <span className="tw:text-xs tw:font-medium tw:text-gray-500">Format:</span>
            <button onClick={() => { setImportMode('json'); setPreview(null) }}
              className={`tw:flex tw:items-center tw:gap-1.5 tw:px-3 tw:py-1.5 tw:text-xs tw:font-medium tw:rounded-lg tw:border tw:transition ${importMode === 'json' ? 'tw:bg-indigo-50 tw:border-indigo-300 tw:text-indigo-700' : 'tw:bg-white tw:border-gray-200 tw:text-gray-600 hover:tw:bg-gray-50'}`}>
              <FileJson className="tw:h-3.5 tw:w-3.5" /> JSON
            </button>
            <button onClick={() => { setImportMode('csv'); setPreview(null) }}
              className={`tw:flex tw:items-center tw:gap-1.5 tw:px-3 tw:py-1.5 tw:text-xs tw:font-medium tw:rounded-lg tw:border tw:transition ${importMode === 'csv' ? 'tw:bg-indigo-50 tw:border-indigo-300 tw:text-indigo-700' : 'tw:bg-white tw:border-gray-200 tw:text-gray-600 hover:tw:bg-gray-50'}`}>
              <FileSpreadsheet className="tw:h-3.5 tw:w-3.5" /> CSV
            </button>
            {importMode === 'csv' && (
              <select value={csvEntity} onChange={(e) => setCsvEntity(e.target.value)}
                className="tw:text-xs tw:border tw:border-gray-200 tw:rounded-lg tw:px-2 tw:py-1.5 tw:bg-white">
                <option value="companies">Companies</option>
                <option value="employees">Employees</option>
                <option value="w2Documents">W-2 Documents</option>
              </select>
            )}
          </div>

          {/* Drop zone */}
          {importMode && !preview && (
            <>
              <input type="file" ref={fileInputRef} accept={importMode === 'json' ? '.json' : '.csv'} onChange={handleFileSelect} className="tw:hidden" />
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
                <p className="tw:text-sm tw:font-medium tw:text-gray-700">Drop a {importMode.toUpperCase()} file here or click to browse</p>
                <p className="tw:text-xs tw:text-gray-500 tw:mt-1">
                  {importMode === 'json'
                    ? 'Accepts entity arrays or W2 Manager backup files'
                    : `CSV with headers matching ${entityLabel(csvEntity)} fields`
                  }
                </p>
              </div>
            </>
          )}

          {!importMode && (
            <p className="tw:text-sm tw:text-gray-400 tw:text-center tw:py-4">Select a format above to begin importing.</p>
          )}

          {/* ── Import Preview ─────────────────────────────────── */}
          {preview && (
            <div className="tw:mt-4 tw:space-y-4">
              <div className="tw:flex tw:items-center tw:justify-between">
                <h4 className="tw:text-sm tw:font-semibold tw:text-gray-900 tw:flex tw:items-center tw:gap-2">
                  <Eye className="tw:h-4 tw:w-4 tw:text-indigo-500" />
                  Import Preview — {entityLabel(preview.entityType)}
                </h4>
                <button onClick={() => setPreview(null)} className="tw:text-xs tw:text-gray-400 hover:tw:text-gray-600">Cancel</button>
              </div>

              {/* Summary cards */}
              <div className="tw:grid tw:grid-cols-2 md:tw:grid-cols-4 tw:gap-3">
                <div className="tw:p-3 tw:bg-gray-50 tw:rounded-lg tw:text-center">
                  <p className="tw:text-lg tw:font-bold tw:text-gray-900">{preview.records.length}</p>
                  <p className="tw:text-xs tw:text-gray-500">Total Records</p>
                </div>
                <div className="tw:p-3 tw:bg-emerald-50 tw:rounded-lg tw:text-center">
                  <p className="tw:text-lg tw:font-bold tw:text-emerald-600">{preview.newRecords.length}</p>
                  <p className="tw:text-xs tw:text-emerald-700">New (valid)</p>
                </div>
                <div className="tw:p-3 tw:bg-amber-50 tw:rounded-lg tw:text-center">
                  <p className="tw:text-lg tw:font-bold tw:text-amber-600">{preview.duplicates.length}</p>
                  <p className="tw:text-xs tw:text-amber-700">Duplicates</p>
                </div>
                <div className="tw:p-3 tw:bg-red-50 tw:rounded-lg tw:text-center">
                  <p className="tw:text-lg tw:font-bold tw:text-red-600">{preview.invalid.length}</p>
                  <p className="tw:text-xs tw:text-red-700">Invalid</p>
                </div>
              </div>

              {/* Duplicates */}
              {preview.duplicates.length > 0 && (
                <div className="tw:bg-amber-50 tw:border tw:border-amber-200 tw:rounded-lg tw:p-3">
                  <p className="tw:text-xs tw:font-semibold tw:text-amber-800 tw:mb-2">Duplicates detected ({preview.duplicates.length})</p>
                  <div className="tw:max-h-[120px] tw:overflow-auto tw:space-y-1">
                    {preview.duplicates.map((d, i) => (
                      <p key={i} className="tw:text-[11px] tw:text-amber-700">• {d.existingKey}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Invalid records */}
              {preview.invalid.length > 0 && (
                <div className="tw:bg-red-50 tw:border tw:border-red-200 tw:rounded-lg tw:p-3">
                  <p className="tw:text-xs tw:font-semibold tw:text-red-800 tw:mb-2">Validation errors ({preview.invalid.length})</p>
                  <div className="tw:max-h-[120px] tw:overflow-auto tw:space-y-1">
                    {preview.invalid.slice(0, 10).map((inv, i) => (
                      <p key={i} className="tw:text-[11px] tw:text-red-700">• {inv.errors.join('; ')}</p>
                    ))}
                    {preview.invalid.length > 10 && (
                      <p className="tw:text-[11px] tw:text-red-500 tw:italic">...and {preview.invalid.length - 10} more</p>
                    )}
                  </div>
                </div>
              )}

              {/* Preview table */}
              {preview.newRecords.length > 0 && (
                <div className="tw:border tw:border-gray-200 tw:rounded-lg tw:overflow-auto tw:max-h-[200px]">
                  <table className="tw:w-full tw:text-xs">
                    <thead className="tw:bg-gray-50 tw:sticky tw:top-0">
                      <tr>
                        {Object.keys(preview.newRecords[0]).slice(0, 6).map((key) => (
                          <th key={key} className="tw:px-3 tw:py-2 tw:text-left tw:font-medium tw:text-gray-600">{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="tw:divide-y tw:divide-gray-50">
                      {preview.newRecords.slice(0, 20).map((r, i) => (
                        <tr key={i} className="hover:tw:bg-gray-50">
                          {Object.values(r).slice(0, 6).map((v, j) => (
                            <td key={j} className="tw:px-3 tw:py-1.5 tw:text-gray-700 tw:truncate tw:max-w-[150px]">{String(v ?? '')}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {preview.newRecords.length > 20 && (
                    <p className="tw:text-[11px] tw:text-gray-400 tw:text-center tw:py-1">Showing 20 of {preview.newRecords.length}</p>
                  )}
                </div>
              )}

              {/* Action buttons */}
              <div className="tw:flex tw:items-center tw:gap-3">
                <button
                  onClick={() => handleCommitImport(false)}
                  disabled={preview.newRecords.length === 0}
                  className="tw:flex tw:items-center tw:gap-2 tw:px-4 tw:py-2 tw:text-sm tw:font-medium tw:text-white tw:bg-indigo-600 tw:rounded-lg hover:tw:bg-indigo-700 tw:transition disabled:tw:opacity-50">
                  <CheckCircle className="tw:h-4 tw:w-4" />
                  Import {preview.newRecords.length} New Records
                </button>
                {preview.duplicates.length > 0 && (
                  <button
                    onClick={() => handleCommitImport(true)}
                    className="tw:flex tw:items-center tw:gap-2 tw:px-4 tw:py-2 tw:text-sm tw:font-medium tw:text-amber-700 tw:bg-amber-50 tw:border tw:border-amber-200 tw:rounded-lg hover:tw:bg-amber-100 tw:transition">
                    Import All (include {preview.duplicates.length} duplicates)
                  </button>
                )}
                <button onClick={() => setPreview(null)}
                  className="tw:px-4 tw:py-2 tw:text-sm tw:text-gray-600 tw:border tw:border-gray-200 tw:rounded-lg hover:tw:bg-gray-50 tw:transition">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="tw:grid tw:grid-cols-1 lg:tw:grid-cols-2 tw:gap-6 tw:mb-6">
        {/* ── EXPORT SECTION ─────────────────────────────────────── */}
        <div className="tw:bg-white tw:rounded-xl tw:border tw:border-gray-200 tw:shadow-sm">
          <div className="tw:flex tw:items-center tw:gap-3 tw:px-5 tw:py-4 tw:border-b tw:border-gray-100">
            <Download className="tw:h-5 tw:w-5 tw:text-emerald-500" />
            <h3 className="tw:text-sm tw:font-semibold tw:text-gray-900">Export Data</h3>
          </div>
          <div className="tw:p-5 tw:space-y-3">
            {[
              { entity: 'companies', count: counts.companies, icon: '🏢' },
              { entity: 'employees', count: counts.employees, icon: '👤' },
              { entity: 'w2Documents', count: counts.w2Documents, icon: '📄' },
            ].map(({ entity, count, icon }) => (
              <div key={entity} className="tw:flex tw:items-center tw:justify-between tw:p-3 tw:rounded-lg tw:border tw:border-gray-100">
                <div className="tw:flex tw:items-center tw:gap-2">
                  <span className="tw:text-base">{icon}</span>
                  <div>
                    <p className="tw:text-sm tw:font-medium tw:text-gray-900">{entityLabel(entity)}</p>
                    <p className="tw:text-xs tw:text-gray-500">{count} records</p>
                  </div>
                </div>
                <div className="tw:flex tw:items-center tw:gap-1.5">
                  <button onClick={() => handleExportJson(entity)} disabled={count === 0}
                    className="tw:flex tw:items-center tw:gap-1 tw:px-2.5 tw:py-1.5 tw:text-xs tw:font-medium tw:text-gray-600 tw:bg-gray-50 tw:border tw:border-gray-200 tw:rounded-lg hover:tw:bg-gray-100 tw:transition disabled:tw:opacity-30">
                    <FileJson className="tw:h-3 tw:w-3" /> JSON
                  </button>
                  <button onClick={() => handleExportCsv(entity)} disabled={count === 0}
                    className="tw:flex tw:items-center tw:gap-1 tw:px-2.5 tw:py-1.5 tw:text-xs tw:font-medium tw:text-gray-600 tw:bg-gray-50 tw:border tw:border-gray-200 tw:rounded-lg hover:tw:bg-gray-100 tw:transition disabled:tw:opacity-30">
                    <FileSpreadsheet className="tw:h-3 tw:w-3" /> CSV
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── BACKUP SECTION ─────────────────────────────────────── */}
        <div className="tw:bg-white tw:rounded-xl tw:border tw:border-gray-200 tw:shadow-sm">
          <div className="tw:flex tw:items-center tw:gap-3 tw:px-5 tw:py-4 tw:border-b tw:border-gray-100">
            <Package className="tw:h-5 tw:w-5 tw:text-violet-500" />
            <h3 className="tw:text-sm tw:font-semibold tw:text-gray-900">Backup &amp; Restore</h3>
          </div>
          <div className="tw:p-5 tw:space-y-3">
            <p className="tw:text-sm tw:text-gray-600">Full JSON backup includes all companies, employees, and documents.</p>
            <button onClick={handleExportBackup}
              className="tw:w-full tw:flex tw:items-center tw:justify-center tw:gap-2 tw:px-4 tw:py-2.5 tw:text-sm tw:font-medium tw:text-white tw:bg-indigo-600 tw:rounded-lg hover:tw:bg-indigo-700 tw:transition">
              <Download className="tw:h-4 tw:w-4" /> Download Full Backup
            </button>
            <p className="tw:text-xs tw:text-gray-400 tw:text-center">Restore by dropping a backup file in the Import section above.</p>
          </div>
        </div>
      </div>

      {/* ── BATCH PDF + ZIP ──────────────────────────────────────── */}
      <div className="tw:bg-white tw:rounded-xl tw:border tw:border-gray-200 tw:shadow-sm tw:mb-6">
        <div className="tw:flex tw:items-center tw:gap-3 tw:px-5 tw:py-4 tw:border-b tw:border-gray-100">
          <Printer className="tw:h-5 tw:w-5 tw:text-indigo-500" />
          <h3 className="tw:text-sm tw:font-semibold tw:text-gray-900">Batch PDF Export</h3>
        </div>
        <div className="tw:p-5">
          <p className="tw:text-sm tw:text-gray-600 tw:mb-4">
            Generate PDFs for all completed W-2 documents and download as a single ZIP file.
            Each document uses the best matching template for its tax year.
          </p>

          {batchGenerating ? (
            <div className="tw:space-y-3">
              <div className="tw:flex tw:items-center tw:gap-3">
                <div className="tw:h-5 tw:w-5 tw:border-2 tw:border-gray-300 tw:border-t-indigo-600 tw:rounded-full tw:animate-spin" />
                <span className="tw:text-sm tw:text-gray-700">Generating {batchProgress.current} / {batchProgress.total}...</span>
              </div>
              <div className="tw:h-2 tw:bg-gray-100 tw:rounded-full tw:overflow-hidden">
                <div className="tw:h-full tw:bg-indigo-500 tw:transition-all tw:duration-300"
                  style={{ width: `${batchProgress.total > 0 ? (batchProgress.current / batchProgress.total) * 100 : 0}%` }} />
              </div>
            </div>
          ) : (
            <button onClick={handleBatchPdfZip} disabled={counts.w2Documents === 0}
              className="tw:flex tw:items-center tw:gap-2 tw:px-4 tw:py-2.5 tw:text-sm tw:font-medium tw:text-white tw:bg-indigo-600 tw:rounded-lg hover:tw:bg-indigo-700 tw:transition disabled:tw:opacity-50">
              <FileDown className="tw:h-4 tw:w-4" /> Generate ZIP ({w2DocumentRepository.count((d) => d.status === 'completed')} completed docs)
            </button>
          )}

          {/* Batch results */}
          {batchResults && !batchGenerating && (
            <div className="tw:mt-4 tw:border tw:border-gray-200 tw:rounded-lg tw:divide-y tw:divide-gray-50 tw:max-h-[200px] tw:overflow-auto">
              {batchResults.map((r, i) => (
                <div key={i} className="tw:flex tw:items-center tw:gap-3 tw:px-4 tw:py-2">
                  {r.success
                    ? <CheckCircle className="tw:h-4 tw:w-4 tw:text-emerald-500 tw:flex-shrink-0" />
                    : <XCircle className="tw:h-4 tw:w-4 tw:text-red-500 tw:flex-shrink-0" />
                  }
                  <span className="tw:text-xs tw:text-gray-700 tw:flex-1 tw:truncate">{r.filename || r.error}</span>
                  {r.success && (
                    <Badge variant="completed">{r.stats?.strategy || 'ok'}</Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── STORAGE INFO ─────────────────────────────────────────── */}
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
            <button onClick={() => setConfirmClear(true)}
              className="tw:flex tw:items-center tw:gap-2 tw:px-4 tw:py-2 tw:text-sm tw:font-medium tw:text-rose-600 tw:bg-white tw:border tw:border-rose-200 tw:rounded-lg hover:tw:bg-rose-50 tw:transition">
              <AlertTriangle className="tw:h-4 tw:w-4" /> Clear All Data
            </button>
          </div>
        </div>
      </div>

      {/* Confirm restore */}
      <ConfirmDialog isOpen={!!confirmRestore} onClose={() => setConfirmRestore(null)} onConfirm={handleConfirmRestore}
        title="Restore Backup"
        message={`Restoring "${confirmRestore?.fileName}" will REPLACE all existing data (${counts.companies} companies, ${counts.employees} employees, ${counts.w2Documents} documents). This cannot be undone.`}
        confirmLabel="Restore Backup" />

      {/* Confirm clear */}
      <ConfirmDialog isOpen={confirmClear} onClose={() => setConfirmClear(false)} onConfirm={handleClearData}
        title="Clear All Data"
        message="Are you sure you want to delete ALL local data? Companies, employees, and documents will be permanently removed."
        confirmLabel="Clear All Data" />
    </div>
  )
}
