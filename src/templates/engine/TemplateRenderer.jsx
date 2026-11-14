/**
 * TemplateRenderer — renders a registered template at real page dimensions
 * with style isolation, preview scaling, and multi-page support.
 *
 * Supports two rendering modes:
 * 1. Page-by-page (default): renderer wraps each page in a sized container
 * 2. Self-contained (manifest.selfContained=true): template handles its own
 *    layout, pages, backgrounds, and scaling internally
 */

import { useMemo, useRef, useEffect, useState } from 'react'
import { getTemplate } from './registry'
import { mapDocumentToTemplate } from './fieldMapper'
import { adaptDocumentForTemplate } from './documentAdapter'

// Convert page dimensions to CSS pixels (96 dpi)
function toPixels(value, unit) {
  switch (unit) {
    case 'mm': return (value / 25.4) * 96
    case 'cm': return (value / 2.54) * 96
    case 'in':
    default:   return value * 96
  }
}

export function TemplateRenderer({ templateId, doc, scale, className = '' }) {
  const containerRef = useRef(null)
  const [autoScale, setAutoScale] = useState(1)
  const template = getTemplate(templateId)

  const isSelfContained = template?.manifest?.selfContained === true

  // Map document data depending on template type
  const mappedData = useMemo(() => {
    if (!template || !doc) return {}
    if (isSelfContained) return adaptDocumentForTemplate(doc)
    return mapDocumentToTemplate(doc, template.mapping)
  }, [template, doc, isSelfContained])

  // Compute real page dimensions in CSS px
  const pageWidthPx = useMemo(() => {
    if (!template) return 816 // 8.5in fallback
    return toPixels(template.manifest.pageSize.width, template.manifest.pageSize.unit)
  }, [template])

  const pageHeightPx = useMemo(() => {
    if (!template) return 1056 // 11in fallback
    return toPixels(template.manifest.pageSize.height, template.manifest.pageSize.unit)
  }, [template])

  // Auto-scale: fit template width to container width
  useEffect(() => {
    if (scale !== undefined && scale !== null) return // manual scale overrides
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const containerWidth = entry.contentRect.width
        if (containerWidth > 0 && pageWidthPx > 0) {
          setAutoScale(Math.min(1, containerWidth / pageWidthPx))
        }
      }
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [scale, pageWidthPx])

  if (!template) {
    return (
      <div className="tw:p-8 tw:text-center tw:text-gray-400 tw:border tw:border-dashed tw:border-gray-200 tw:rounded-lg">
        <p className="tw:text-sm">Template &ldquo;{templateId}&rdquo; not found.</p>
      </div>
    )
  }

  const Component = template.component

  // Self-contained templates handle their own layout, pages, and scaling
  if (isSelfContained) {
    return (
      <div ref={containerRef} className={`tw:overflow-hidden ${className}`}>
        {template.css && <style dangerouslySetInnerHTML={{ __html: template.css }} />}
        <Component data={mappedData} doc={doc} />
      </div>
    )
  }

  // Page-by-page rendering for simple templates
  const effectiveScale = scale ?? autoScale
  const pageCount = template.manifest.pages || 1

  return (
    <div ref={containerRef} className={`tw:overflow-hidden ${className}`}>
      {template.css && (
        <style dangerouslySetInnerHTML={{ __html: template.css }} />
      )}

      {Array.from({ length: pageCount }, (_, pageIndex) => (
        <div
          key={pageIndex}
          className="tw:mx-auto tw:mb-4 last:tw:mb-0"
          style={{
            width: pageWidthPx * effectiveScale,
            height: pageHeightPx * effectiveScale,
            overflow: 'hidden',
          }}
        >
          <div
            className="template-page-root"
            data-template-id={template.manifest.id}
            data-page={pageIndex + 1}
            style={{
              width: pageWidthPx,
              height: pageHeightPx,
              transform: `scale(${effectiveScale})`,
              transformOrigin: 'top left',
              position: 'relative',
              backgroundColor: '#fff',
              boxShadow: effectiveScale < 1 ? '0 1px 4px rgba(0,0,0,0.12)' : 'none',
            }}
          >
            <Component
              data={mappedData}
              doc={doc}
              page={pageIndex + 1}
              totalPages={pageCount}
              manifest={template.manifest}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * TemplatePrintRoot — renders at scale=1 for print/PDF capture.
 */
export function TemplatePrintRoot({ templateId, doc }) {
  const template = getTemplate(templateId)

  const isSelfContained = template?.manifest?.selfContained === true

  const mappedData = useMemo(() => {
    if (!template || !doc) return {}
    if (isSelfContained) return adaptDocumentForTemplate(doc)
    return mapDocumentToTemplate(doc, template.mapping)
  }, [template, doc, isSelfContained])

  const pageWidthPx = useMemo(() => {
    if (!template) return 816
    return toPixels(template.manifest.pageSize.width, template.manifest.pageSize.unit)
  }, [template])

  const pageHeightPx = useMemo(() => {
    if (!template) return 1056
    return toPixels(template.manifest.pageSize.height, template.manifest.pageSize.unit)
  }, [template])

  if (!template) return null

  const Component = template.component

  if (isSelfContained) {
    return (
      <>
        {template.css && <style dangerouslySetInnerHTML={{ __html: template.css }} />}
        <Component data={mappedData} doc={doc} />
      </>
    )
  }

  const pageCount = template.manifest.pages || 1

  return (
    <>
      {template.css && <style dangerouslySetInnerHTML={{ __html: template.css }} />}
      {Array.from({ length: pageCount }, (_, pageIndex) => (
        <div
          key={pageIndex}
          className="template-page-root template-print"
          data-template-id={template.manifest.id}
          data-page={pageIndex + 1}
          style={{
            width: pageWidthPx,
            height: pageHeightPx,
            position: 'relative',
            backgroundColor: '#fff',
            pageBreakAfter: pageIndex < pageCount - 1 ? 'always' : 'auto',
          }}
        >
          <Component
            data={mappedData}
            doc={doc}
            page={pageIndex + 1}
            totalPages={pageCount}
            manifest={template.manifest}
          />
        </div>
      ))}
    </>
  )
}
