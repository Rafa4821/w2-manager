/**
 * PDF Generator Page — select documents, choose templates, generate PDFs,
 * preview and download. Uses pdf-lib for generation and pdfjs-dist for preview.
 *
 * This tool does NOT certify that generated PDFs are suitable for official
 * tax filing. Compliance requires verification with the issuing payroll system.
 */
import { useState, useEffect, useCallback } from 'react'
import {
  Printer, Download, FileText, Eye, AlertTriangle,
  CheckCircle, XCircle, FileDown, MonitorPlay,
} from 'lucide-react'
import { PageHeader, Badge } from '../../../shared/components'
import { useNotificationStore } from '../../../shared/store'
import { useW2DocumentsStore } from '../../w2-documents/store/useW2DocumentsStore'
import { getTemplatesForYear, getTemplate } from '../../../templates'
import { generatePdf, downloadPdf } from '../engine/pdfGenerator'
import { PdfViewer } from './PdfViewer'

export function PdfGeneratorPage() {
  const { documents, load } = useW2DocumentsStore()
  const addNotification = useNotificationStore((s) => s.addNotification)

  const [selected, setSelected] = useState([])
  const [templateOverrides, setTemplateOverrides] = useState({})
  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [results, setResults] = useState([])
  const [previewIdx, setPreviewIdx] = useState(null)
  const [showDisclaimer, setShowDisclaimer] = useState(true)

  useEffect(() => { load() }, [load])

  const completedDocs = documents.filter((d) => d.status === 'completed')

  const toggleSelect = (id) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id])

  const selectAll = () => {
    setSelected(selected.length === completedDocs.length ? [] : completedDocs.map((d) => d.id))
  }

  const getDocName = (doc) =>
    doc.employeeSnapshot ? `${doc.employeeSnapshot.firstName} ${doc.employeeSnapshot.lastName}` : '—'
  const getDocCompany = (doc) => doc.companySnapshot?.name || '—'

  const getTemplateForDoc = useCallback((doc) => {
    if (templateOverrides[doc.id]) return templateOverrides[doc.id]
    if (doc.templateId) return doc.templateId
    const yearTemplates = getTemplatesForYear(doc.taxYear)
    const production = yearTemplates.filter((t) => t.manifest.id !== 'demo-w2')
    return production.length > 0 ? production[0].manifest.id : (yearTemplates[0]?.manifest.id || '')
  }, [templateOverrides])

  const handleGenerate = async () => {
    if (selected.length === 0) {
      addNotification({ type: 'warning', title: 'No Documents', message: 'Select at least one completed document.' })
      return
    }
    setGenerating(true)
    setProgress({ current: 0, total: selected.length })
    setResults([])
    setPreviewIdx(null)

    const newResults = []
    for (let i = 0; i < selected.length; i++) {
      const doc = documents.find((d) => d.id === selected[i])
      if (!doc) continue
      const tid = getTemplateForDoc(doc)
      try {
        const result = await generatePdf(doc, tid)
        newResults.push({ docId: doc.id, doc, success: true, ...result })
      } catch (err) {
        newResults.push({ docId: doc.id, doc, success: false, error: err.message })
      }
      setProgress({ current: i + 1, total: selected.length })
      setResults([...newResults])
    }

    const successCount = newResults.filter((r) => r.success).length
    const failCount = newResults.length - successCount
    if (successCount > 0) {
      addNotification({ type: 'success', title: 'PDFs Generated', message: `${successCount} PDF(s) generated successfully.${failCount ? ` ${failCount} failed.` : ''}` })
    } else {
      addNotification({ type: 'error', title: 'Generation Failed', message: 'All PDF generations failed.' })
    }
    setGenerating(false)
  }

  const handleDownloadAll = () => {
    const successes = results.filter((r) => r.success)
    successes.forEach((r) => downloadPdf(r.pdfBytes, r.filename))
    addNotification({ type: 'info', title: 'Downloads Started', message: `${successes.length} file(s)` })
  }

  const handleHtmlPrint = () => {
    addNotification({ type: 'info', title: 'HTML Print', message: 'Use the Template Library preview and your browser\'s Print function (Ctrl+P) for HTML export.' })
  }

  const previewResult = previewIdx !== null ? results[previewIdx] : null

  return (
    <div>
      <PageHeader title="PDF Generator" description="Generate and download W-2 documents as PDF">
        <div className="tw:flex tw:items-center tw:gap-2">
          <button onClick={handleHtmlPrint}
            className="tw:flex tw:items-center tw:gap-2 tw:px-3 tw:py-2 tw:text-sm tw:font-medium tw:text-gray-700 tw:bg-white tw:border tw:border-gray-300 tw:rounded-lg hover:tw:bg-gray-50 tw:transition tw:shadow-sm">
            <MonitorPlay className="tw:h-4 tw:w-4" /> HTML Print
          </button>
          <button onClick={handleGenerate} disabled={generating || selected.length === 0}
            className="tw:flex tw:items-center tw:gap-2 tw:px-4 tw:py-2 tw:text-sm tw:font-medium tw:text-white tw:bg-indigo-600 tw:rounded-lg hover:tw:bg-indigo-700 tw:transition tw:shadow-sm disabled:tw:opacity-50 disabled:tw:cursor-not-allowed">
            {generating ? (
              <><div className="tw:h-4 tw:w-4 tw:border-2 tw:border-white/30 tw:border-t-white tw:rounded-full tw:animate-spin" /> Generating ({progress.current}/{progress.total})</>
            ) : (
              <><Printer className="tw:h-4 tw:w-4" /> Generate {selected.length > 0 ? `(${selected.length})` : 'PDFs'}</>
            )}
          </button>
        </div>
      </PageHeader>

      {/* Disclaimer */}
      {showDisclaimer && (
        <div className="tw:flex tw:items-start tw:gap-3 tw:p-4 tw:mb-4 tw:bg-amber-50 tw:border tw:border-amber-200 tw:rounded-lg">
          <AlertTriangle className="tw:h-5 tw:w-5 tw:text-amber-500 tw:flex-shrink-0 tw:mt-0.5" />
          <div className="tw:flex-1">
            <p className="tw:text-sm tw:font-medium tw:text-amber-900">PDF output is not certified for official tax filing</p>
            <p className="tw:text-xs tw:text-amber-700 tw:mt-0.5">Generated PDFs are visual representations. Compliance with IRS/SSA filing requirements must be verified independently with the issuing payroll system.</p>
          </div>
          <button onClick={() => setShowDisclaimer(false)} className="tw:text-amber-400 hover:tw:text-amber-600 tw:text-xs">Dismiss</button>
        </div>
      )}

      {/* Info banner */}
      <div className="tw:flex tw:items-start tw:gap-3 tw:p-4 tw:mb-6 tw:bg-blue-50 tw:border tw:border-blue-100 tw:rounded-lg">
        <FileText className="tw:h-5 tw:w-5 tw:text-blue-500 tw:flex-shrink-0 tw:mt-0.5" />
        <div>
          <p className="tw:text-sm tw:font-medium tw:text-blue-900">Select completed documents and assign templates</p>
          <p className="tw:text-xs tw:text-blue-700 tw:mt-0.5">
            Templates with a clean base PDF preserve maximum visual fidelity. Others generate field-only PDFs.
            Only completed W-2 documents can be exported.
          </p>
        </div>
      </div>

      <div className="tw:grid tw:grid-cols-1 lg:tw:grid-cols-3 tw:gap-6">
        {/* Left: document selection */}
        <div className="lg:tw:col-span-2">
          <div className="tw:bg-white tw:rounded-xl tw:border tw:border-gray-200 tw:shadow-sm">
            <div className="tw:flex tw:items-center tw:justify-between tw:px-4 tw:py-3 tw:border-b tw:border-gray-100">
              <label className="tw:flex tw:items-center tw:gap-2 tw:cursor-pointer">
                <input type="checkbox"
                  checked={selected.length === completedDocs.length && completedDocs.length > 0}
                  onChange={selectAll}
                  className="tw:h-4 tw:w-4 tw:rounded tw:border-gray-300 tw:text-indigo-600 focus:tw:ring-indigo-500" />
                <span className="tw:text-sm tw:font-medium tw:text-gray-700">Select All ({completedDocs.length} available)</span>
              </label>
              {selected.length > 0 && <span className="tw:text-xs tw:font-medium tw:text-indigo-600">{selected.length} selected</span>}
            </div>

            <div className="tw:divide-y tw:divide-gray-50">
              {documents.length === 0 && (
                <div className="tw:px-4 tw:py-8 tw:text-center tw:text-gray-400 tw:text-sm">No documents found. Create W-2 documents first.</div>
              )}
              {documents.map((doc) => {
                const isCompleted = doc.status === 'completed'
                const isSelected = selected.includes(doc.id)
                const docTemplate = isCompleted ? getTemplateForDoc(doc) : ''
                const templateInfo = docTemplate ? getTemplate(docTemplate) : null
                const yearTemplates = isCompleted ? getTemplatesForYear(doc.taxYear).filter((t) => t.manifest.id !== 'demo-w2') : []

                return (
                  <div key={doc.id}
                    className={`tw:flex tw:items-center tw:gap-4 tw:px-4 tw:py-3 tw:transition ${isSelected ? 'tw:bg-indigo-50/50' : 'hover:tw:bg-gray-50/50'} ${!isCompleted ? 'tw:opacity-50' : 'tw:cursor-pointer'}`}
                    onClick={() => isCompleted && toggleSelect(doc.id)}>
                    <input type="checkbox" checked={isSelected} disabled={!isCompleted}
                      onChange={() => toggleSelect(doc.id)}
                      className="tw:h-4 tw:w-4 tw:rounded tw:border-gray-300 tw:text-indigo-600 focus:tw:ring-indigo-500 disabled:tw:opacity-30" />
                    <div className="tw:flex tw:items-center tw:justify-center tw:h-9 tw:w-9 tw:rounded-lg tw:bg-gray-100 tw:flex-shrink-0">
                      <FileText className="tw:h-4 tw:w-4 tw:text-gray-500" />
                    </div>
                    <div className="tw:flex-1 tw:min-w-0">
                      <p className="tw:text-sm tw:font-medium tw:text-gray-900">{getDocName(doc)}</p>
                      <p className="tw:text-xs tw:text-gray-500">{getDocCompany(doc)} &middot; {doc.taxYear}</p>
                    </div>
                    {isCompleted && yearTemplates.length > 0 && (
                      <select value={docTemplate}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => { e.stopPropagation(); setTemplateOverrides((p) => ({ ...p, [doc.id]: e.target.value })) }}
                        className="tw:text-xs tw:border tw:border-gray-200 tw:rounded tw:px-2 tw:py-1 tw:bg-white tw:max-w-[180px] tw:truncate">
                        {yearTemplates.map((t) => (
                          <option key={t.manifest.id} value={t.manifest.id}>{t.manifest.name}</option>
                        ))}
                      </select>
                    )}
                    <Badge variant={doc.status}>{doc.status}</Badge>
                    {templateInfo && (
                      <span className="tw:text-[10px] tw:text-gray-400 tw:hidden sm:tw:inline" title={templateInfo.pdfBaseUrl ? 'Base PDF available — high fidelity' : 'No base PDF — field-only output'}>
                        {templateInfo.pdfBaseUrl ? '● Base' : '○ Scratch'}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right: results / preview */}
        <div className="tw:space-y-4">
          {/* Generation results */}
          {results.length > 0 && (
            <div className="tw:bg-white tw:rounded-xl tw:border tw:border-gray-200 tw:shadow-sm">
              <div className="tw:flex tw:items-center tw:justify-between tw:px-4 tw:py-3 tw:border-b tw:border-gray-100">
                <h3 className="tw:text-sm tw:font-semibold tw:text-gray-900">Results</h3>
                {results.filter((r) => r.success).length > 1 && (
                  <button onClick={handleDownloadAll}
                    className="tw:flex tw:items-center tw:gap-1 tw:text-xs tw:text-indigo-600 hover:tw:text-indigo-800 tw:font-medium">
                    <FileDown className="tw:h-3.5 tw:w-3.5" /> Download All
                  </button>
                )}
              </div>
              <div className="tw:divide-y tw:divide-gray-50 tw:max-h-[300px] tw:overflow-auto">
                {results.map((r, idx) => (
                  <div key={r.docId} className="tw:flex tw:items-center tw:gap-3 tw:px-4 tw:py-2.5">
                    {r.success
                      ? <CheckCircle className="tw:h-4 tw:w-4 tw:text-green-500 tw:flex-shrink-0" />
                      : <XCircle className="tw:h-4 tw:w-4 tw:text-red-500 tw:flex-shrink-0" />
                    }
                    <div className="tw:flex-1 tw:min-w-0">
                      <p className="tw:text-xs tw:font-medium tw:text-gray-800 tw:truncate">{r.filename || r.error}</p>
                      {r.success && (
                        <p className="tw:text-[10px] tw:text-gray-400">
                          {r.stats.strategy === 'overlay' ? 'Base PDF' : 'Scratch'} &middot; {r.stats.pages}pg &middot; {r.stats.fieldsDrawn} fields
                          {r.warnings?.length > 0 && ` · ${r.warnings.length} warning(s)`}
                        </p>
                      )}
                      {!r.success && <p className="tw:text-[10px] tw:text-red-500">{r.error}</p>}
                    </div>
                    {r.success && (
                      <div className="tw:flex tw:items-center tw:gap-1">
                        <button onClick={() => setPreviewIdx(idx)} title="Preview"
                          className="tw:p-1 tw:rounded tw:text-gray-400 hover:tw:text-indigo-600 hover:tw:bg-indigo-50 tw:transition">
                          <Eye className="tw:h-3.5 tw:w-3.5" />
                        </button>
                        <button onClick={() => downloadPdf(r.pdfBytes, r.filename)} title="Download"
                          className="tw:p-1 tw:rounded tw:text-gray-400 hover:tw:text-indigo-600 hover:tw:bg-indigo-50 tw:transition">
                          <Download className="tw:h-3.5 tw:w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warnings panel */}
          {previewResult?.warnings?.length > 0 && (
            <div className="tw:bg-amber-50 tw:border tw:border-amber-200 tw:rounded-lg tw:p-3">
              <p className="tw:text-xs tw:font-semibold tw:text-amber-800 tw:mb-1">Warnings</p>
              {previewResult.warnings.map((w, i) => (
                <p key={i} className="tw:text-[11px] tw:text-amber-700">• {w}</p>
              ))}
            </div>
          )}

          {/* PDF Preview */}
          {previewResult?.success && (
            <div className="tw:bg-white tw:rounded-xl tw:border tw:border-gray-200 tw:shadow-sm tw:p-3">
              <div className="tw:flex tw:items-center tw:justify-between tw:mb-3">
                <h3 className="tw:text-sm tw:font-semibold tw:text-gray-900">Preview</h3>
                <button onClick={() => downloadPdf(previewResult.pdfBytes, previewResult.filename)}
                  className="tw:flex tw:items-center tw:gap-1 tw:text-xs tw:text-indigo-600 hover:tw:text-indigo-800 tw:font-medium">
                  <Download className="tw:h-3.5 tw:w-3.5" /> Download
                </button>
              </div>
              <PdfViewer pdfBytes={previewResult.pdfBytes} initialScale={1.0} />
            </div>
          )}

          {/* Empty state */}
          {results.length === 0 && !generating && (
            <div className="tw:bg-white tw:rounded-xl tw:border tw:border-dashed tw:border-gray-200 tw:p-6 tw:text-center">
              <Printer className="tw:h-8 tw:w-8 tw:text-gray-300 tw:mx-auto tw:mb-2" />
              <p className="tw:text-sm tw:text-gray-400">Select documents and click Generate</p>
              <p className="tw:text-xs tw:text-gray-300 tw:mt-1">PDF preview will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
