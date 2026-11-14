import { useState, useEffect } from 'react'
import { Printer, Download, FileText } from 'lucide-react'
import { PageHeader, Badge } from '../../../shared/components'
import { useNotificationStore } from '../../../shared/store'
import { useW2DocumentsStore } from '../../w2-documents/store/useW2DocumentsStore'

export function PdfGeneratorPage() {
  const { documents, load } = useW2DocumentsStore()
  const [selected, setSelected] = useState([])
  const [generating, setGenerating] = useState(false)
  const addNotification = useNotificationStore((s) => s.addNotification)

  useEffect(() => { load() }, [load])

  const completedDocs = documents.filter((d) => d.status === 'completed')

  const toggleSelect = (id) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id])
  }

  const selectAll = () => {
    if (selected.length === completedDocs.length) {
      setSelected([])
    } else {
      setSelected(completedDocs.map((d) => d.id))
    }
  }

  const handleGenerate = () => {
    if (selected.length === 0) {
      addNotification({ type: 'warning', title: 'No Documents Selected', message: 'Please select at least one document to generate.' })
      return
    }
    setGenerating(true)
    setTimeout(() => {
      setGenerating(false)
      addNotification({ type: 'success', title: 'PDFs Generated', message: `${selected.length} PDF(s) generated successfully.` })
      setSelected([])
    }, 1500)
  }

  const getDocName = (doc) => {
    if (doc.employeeSnapshot) return `${doc.employeeSnapshot.firstName} ${doc.employeeSnapshot.lastName}`
    return doc.employeeName || '—'
  }
  const getDocCompany = (doc) => doc.companySnapshot?.name || doc.companyName || '—'
  const getDocWages = (doc) => doc.box1_wagesTips || doc.wagesTips || 0

  return (
    <div>
      <PageHeader title="PDF Generator" description="Generate and download W2 documents as PDF">
        <button
          onClick={handleGenerate}
          disabled={generating || selected.length === 0}
          className="tw:flex tw:items-center tw:gap-2 tw:px-4 tw:py-2 tw:text-sm tw:font-medium tw:text-white tw:bg-indigo-600 tw:rounded-lg hover:tw:bg-indigo-700 tw:transition tw:shadow-sm disabled:tw:opacity-50 disabled:tw:cursor-not-allowed"
        >
          {generating ? (
            <>
              <div className="tw:h-4 tw:w-4 tw:border-2 tw:border-white/30 tw:border-t-white tw:rounded-full tw:animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Printer className="tw:h-4 tw:w-4" />
              Generate {selected.length > 0 ? `(${selected.length})` : 'PDFs'}
            </>
          )}
        </button>
      </PageHeader>

      <div className="tw:flex tw:items-start tw:gap-3 tw:p-4 tw:mb-6 tw:bg-blue-50 tw:border tw:border-blue-100 tw:rounded-lg">
        <FileText className="tw:h-5 tw:w-5 tw:text-blue-500 tw:flex-shrink-0 tw:mt-0.5" />
        <div>
          <p className="tw:text-sm tw:font-medium tw:text-blue-900">Select completed documents to generate PDFs</p>
          <p className="tw:text-xs tw:text-blue-700 tw:mt-0.5">Only completed W2 documents can be exported as PDF. Draft and pending documents must be finalized first.</p>
        </div>
      </div>

      <div className="tw:bg-white tw:rounded-xl tw:border tw:border-gray-200 tw:shadow-sm">
        <div className="tw:flex tw:items-center tw:justify-between tw:px-4 tw:py-3 tw:border-b tw:border-gray-100">
          <label className="tw:flex tw:items-center tw:gap-2 tw:cursor-pointer">
            <input
              type="checkbox"
              checked={selected.length === completedDocs.length && completedDocs.length > 0}
              onChange={selectAll}
              className="tw:h-4 tw:w-4 tw:rounded tw:border-gray-300 tw:text-indigo-600 focus:tw:ring-indigo-500"
            />
            <span className="tw:text-sm tw:font-medium tw:text-gray-700">Select All ({completedDocs.length} available)</span>
          </label>
          {selected.length > 0 && <span className="tw:text-xs tw:font-medium tw:text-indigo-600">{selected.length} selected</span>}
        </div>

        <div className="tw:divide-y tw:divide-gray-50">
          {documents.length === 0 && (
            <div className="tw:px-4 tw:py-8 tw:text-center tw:text-gray-400 tw:text-sm">No documents found. Create W2 documents first.</div>
          )}
          {documents.map((doc) => {
            const isCompleted = doc.status === 'completed'
            const isSelected = selected.includes(doc.id)
            return (
              <div
                key={doc.id}
                className={`tw:flex tw:items-center tw:gap-4 tw:px-4 tw:py-3 tw:transition ${
                  isSelected ? 'tw:bg-indigo-50/50' : 'hover:tw:bg-gray-50/50'
                } ${!isCompleted ? 'tw:opacity-50' : 'tw:cursor-pointer'}`}
                onClick={() => isCompleted && toggleSelect(doc.id)}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  disabled={!isCompleted}
                  onChange={() => toggleSelect(doc.id)}
                  className="tw:h-4 tw:w-4 tw:rounded tw:border-gray-300 tw:text-indigo-600 focus:tw:ring-indigo-500 disabled:tw:opacity-30"
                />
                <div className="tw:flex tw:items-center tw:justify-center tw:h-9 tw:w-9 tw:rounded-lg tw:bg-gray-100 tw:flex-shrink-0">
                  <FileText className="tw:h-4 tw:w-4 tw:text-gray-500" />
                </div>
                <div className="tw:flex-1 tw:min-w-0">
                  <p className="tw:text-sm tw:font-medium tw:text-gray-900">{getDocName(doc)}</p>
                  <p className="tw:text-xs tw:text-gray-500">{getDocCompany(doc)} &middot; Tax Year {doc.taxYear} &middot; ${getDocWages(doc).toLocaleString()}</p>
                </div>
                <Badge variant={doc.status}>{doc.status}</Badge>
                {isCompleted && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      addNotification({ type: 'info', title: 'Download', message: `PDF for ${getDocName(doc)} would download here.` })
                    }}
                    className="tw:p-1.5 tw:rounded-md tw:text-gray-400 hover:tw:text-indigo-600 hover:tw:bg-indigo-50 tw:transition"
                  >
                    <Download className="tw:h-4 tw:w-4" />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
