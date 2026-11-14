/**
 * PdfViewer — renders PDF bytes onto canvas elements using pdfjs-dist.
 * Supports multi-page display, page navigation, and zoom controls.
 */
import { useEffect, useRef, useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react'
import * as pdfjsLib from 'pdfjs-dist'
import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl

/**
 * Public wrapper — remounts the inner viewer when pdfBytes identity changes,
 * so the inner component starts fresh with loading=true (no setState in effect).
 */
export function PdfViewer({ pdfBytes, initialScale = 1.0 }) {
  const [prev, setPrev] = useState(null)
  const [viewKey, setViewKey] = useState(0)

  // Derive state from props: when pdfBytes changes, bump the key
  if (pdfBytes !== prev) {
    setPrev(pdfBytes)
    setViewKey((k) => k + 1)
  }

  if (!pdfBytes) {
    return (
      <div className="tw:p-8 tw:text-center tw:text-gray-400 tw:text-sm">
        No PDF to display.
      </div>
    )
  }

  return <PdfViewerCore key={viewKey} pdfBytes={pdfBytes} initialScale={initialScale} />
}

/** Inner viewer — mounted once per pdfBytes identity via key. */
function PdfViewerCore({ pdfBytes, initialScale }) {
  const containerRef = useRef(null)
  const pdfDocRef = useRef(null)
  const [numPages, setNumPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [scale, setScale] = useState(initialScale)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const renderPage = useCallback(async (pageNum, pdfDoc, renderScale) => {
    const container = containerRef.current
    if (!container || !pdfDoc) return
    try {
      const page = await pdfDoc.getPage(pageNum)
      const viewport = page.getViewport({ scale: renderScale })
      container.innerHTML = ''
      const canvas = document.createElement('canvas')
      canvas.width = Math.floor(viewport.width)
      canvas.height = Math.floor(viewport.height)
      canvas.style.display = 'block'
      canvas.style.maxWidth = '100%'
      canvas.style.height = 'auto'
      canvas.style.margin = '0 auto'
      canvas.style.boxShadow = '0 2px 12px rgba(0,0,0,0.12)'
      canvas.style.borderRadius = '4px'
      container.appendChild(canvas)
      const ctx = canvas.getContext('2d')
      await page.render({ canvasContext: ctx, viewport }).promise
    } catch (err) {
      setError(`Failed to render page ${pageNum}: ${err.message}`)
    }
  }, [])

  // Load PDF once on mount
  useEffect(() => {
    let cancelled = false
    const loadTask = pdfjsLib.getDocument({ data: pdfBytes })
    loadTask.promise
      .then((pdf) => {
        if (cancelled) { pdf.destroy(); return }
        pdfDocRef.current = pdf
        setNumPages(pdf.numPages)
        setLoading(false)
        renderPage(1, pdf, scale)
      })
      .catch((err) => {
        if (!cancelled) {
          setError(`Failed to load PDF: ${err.message}`)
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
      loadTask.destroy?.()
      if (pdfDocRef.current) { pdfDocRef.current.destroy(); pdfDocRef.current = null }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Re-render when page or scale changes
  useEffect(() => {
    if (pdfDocRef.current && currentPage > 0) {
      renderPage(currentPage, pdfDocRef.current, scale)
    }
  }, [currentPage, scale, renderPage])

  const goTo = (page) => { if (page >= 1 && page <= numPages) setCurrentPage(page) }

  return (
    <div className="tw:flex tw:flex-col tw:gap-3">
      {/* Toolbar */}
      <div className="tw:flex tw:items-center tw:justify-between tw:px-3 tw:py-2 tw:bg-gray-50 tw:rounded-lg tw:border tw:border-gray-200">
        <div className="tw:flex tw:items-center tw:gap-1">
          <button onClick={() => goTo(currentPage - 1)} disabled={currentPage <= 1}
            className="tw:p-1.5 tw:rounded tw:text-gray-600 hover:tw:bg-gray-200 disabled:tw:opacity-30 tw:transition">
            <ChevronLeft className="tw:h-4 tw:w-4" />
          </button>
          <span className="tw:text-sm tw:text-gray-700 tw:min-w-[80px] tw:text-center">
            {currentPage} / {numPages}
          </span>
          <button onClick={() => goTo(currentPage + 1)} disabled={currentPage >= numPages}
            className="tw:p-1.5 tw:rounded tw:text-gray-600 hover:tw:bg-gray-200 disabled:tw:opacity-30 tw:transition">
            <ChevronRight className="tw:h-4 tw:w-4" />
          </button>
        </div>
        <div className="tw:flex tw:items-center tw:gap-1">
          <button onClick={() => setScale((s) => Math.max(0.5, s - 0.25))} disabled={scale <= 0.5}
            className="tw:p-1.5 tw:rounded tw:text-gray-600 hover:tw:bg-gray-200 disabled:tw:opacity-30 tw:transition">
            <ZoomOut className="tw:h-4 tw:w-4" />
          </button>
          <span className="tw:text-xs tw:text-gray-500 tw:min-w-[40px] tw:text-center">
            {Math.round(scale * 100)}%
          </span>
          <button onClick={() => setScale((s) => Math.min(3, s + 0.25))} disabled={scale >= 3}
            className="tw:p-1.5 tw:rounded tw:text-gray-600 hover:tw:bg-gray-200 disabled:tw:opacity-30 tw:transition">
            <ZoomIn className="tw:h-4 tw:w-4" />
          </button>
        </div>
      </div>

      {/* Canvas area */}
      <div className="tw:bg-gray-100 tw:rounded-lg tw:p-4 tw:min-h-[200px] tw:flex tw:items-center tw:justify-center tw:overflow-auto">
        {loading && (
          <div className="tw:flex tw:items-center tw:gap-2 tw:text-gray-500 tw:text-sm">
            <div className="tw:h-4 tw:w-4 tw:border-2 tw:border-gray-300 tw:border-t-indigo-600 tw:rounded-full tw:animate-spin" />
            Loading PDF...
          </div>
        )}
        {error && (
          <div className="tw:text-red-600 tw:text-sm tw:text-center tw:p-4">{error}</div>
        )}
        <div ref={containerRef} className={loading ? 'tw:hidden' : ''} />
      </div>
    </div>
  )
}
