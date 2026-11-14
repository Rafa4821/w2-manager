import { useState } from 'react'
import { Library, Star, FileText, Eye, Copy, Search } from 'lucide-react'
import { PageHeader, Badge, Modal } from '../../../shared/components'
import { mockTemplates } from '../../../shared/data'
import { useNotificationStore } from '../../../shared/store'

const categoryLabels = {
  standard: 'Standard',
  'multi-state': 'Multi-State',
  benefits: 'Benefits',
  correction: 'Correction',
  government: 'Government',
}

export function TemplateLibraryPage() {
  const [templates] = useState(mockTemplates)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [previewTemplate, setPreviewTemplate] = useState(null)
  const addNotification = useNotificationStore((s) => s.addNotification)

  const filtered = templates.filter((t) => {
    if (search && !t.name.toLowerCase().includes(search.toLowerCase()) && !t.description.toLowerCase().includes(search.toLowerCase())) return false
    if (categoryFilter && t.category !== categoryFilter) return false
    return true
  })

  const categories = [...new Set(templates.map((t) => t.category))]

  const handleUseTemplate = (template) => {
    addNotification({ type: 'success', title: 'Template Selected', message: `"${template.name}" is ready to use.` })
  }

  return (
    <div>
      <PageHeader title="Template Library" description="Browse and manage W2 document templates" />

      {/* Search & filter bar */}
      <div className="tw:flex tw:flex-col sm:tw:flex-row tw:gap-3 tw:mb-6">
        <div className="tw:relative tw:flex-1">
          <Search className="tw:absolute tw:left-3 tw:top-1/2 tw:-translate-y-1/2 tw:h-4 tw:w-4 tw:text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates..."
            className="tw:w-full tw:pl-9 tw:pr-3 tw:py-2 tw:text-sm tw:border tw:border-gray-200 tw:rounded-lg focus:tw:outline-none focus:tw:ring-2 focus:tw:ring-indigo-500 focus:tw:border-transparent tw:bg-white"
          />
        </div>
        <div className="tw:flex tw:gap-2 tw:flex-wrap">
          <button
            onClick={() => setCategoryFilter('')}
            className={`tw:px-3 tw:py-1.5 tw:text-sm tw:rounded-lg tw:font-medium tw:transition tw:border ${
              !categoryFilter
                ? 'tw:bg-indigo-600 tw:text-white tw:border-indigo-600'
                : 'tw:bg-white tw:text-gray-600 tw:border-gray-200 hover:tw:bg-gray-50'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`tw:px-3 tw:py-1.5 tw:text-sm tw:rounded-lg tw:font-medium tw:transition tw:border ${
                categoryFilter === cat
                  ? 'tw:bg-indigo-600 tw:text-white tw:border-indigo-600'
                  : 'tw:bg-white tw:text-gray-600 tw:border-gray-200 hover:tw:bg-gray-50'
              }`}
            >
              {categoryLabels[cat] || cat}
            </button>
          ))}
        </div>
      </div>

      {/* Template grid */}
      {filtered.length === 0 ? (
        <div className="tw:flex tw:flex-col tw:items-center tw:justify-center tw:py-16 tw:text-center">
          <Library className="tw:h-12 tw:w-12 tw:text-gray-300 tw:mb-4" />
          <h3 className="tw:text-lg tw:font-medium tw:text-gray-900">No templates found</h3>
          <p className="tw:text-sm tw:text-gray-500 tw:mt-1">Try adjusting your search or category filter.</p>
        </div>
      ) : (
        <div className="tw:grid tw:grid-cols-1 md:tw:grid-cols-2 xl:tw:grid-cols-3 tw:gap-4">
          {filtered.map((template) => (
            <div
              key={template.id}
              className="tw:bg-white tw:rounded-xl tw:border tw:border-gray-200 tw:shadow-sm hover:tw:shadow-md tw:transition-all tw:group"
            >
              {/* Card header */}
              <div className="tw:p-5 tw:pb-3">
                <div className="tw:flex tw:items-start tw:justify-between tw:mb-3">
                  <div className="tw:p-2 tw:bg-indigo-50 tw:rounded-lg">
                    <FileText className="tw:h-5 tw:w-5 tw:text-indigo-500" />
                  </div>
                  <div className="tw:flex tw:items-center tw:gap-2">
                    {template.isDefault && (
                      <span className="tw:flex tw:items-center tw:gap-1 tw:text-xs tw:font-medium tw:text-amber-600">
                        <Star className="tw:h-3.5 tw:w-3.5 tw:fill-amber-400 tw:text-amber-400" />
                        Default
                      </span>
                    )}
                    <Badge variant="info">{categoryLabels[template.category] || template.category}</Badge>
                  </div>
                </div>
                <h3 className="tw:text-base tw:font-semibold tw:text-gray-900 tw:mb-1">{template.name}</h3>
                <p className="tw:text-sm tw:text-gray-500 tw:line-clamp-2">{template.description}</p>
              </div>

              {/* Card meta */}
              <div className="tw:px-5 tw:py-3 tw:border-t tw:border-gray-100 tw:flex tw:items-center tw:justify-between tw:text-xs tw:text-gray-400">
                <span>v{template.version} &middot; {template.usageCount} uses</span>
                <span>Updated {template.lastUpdated}</span>
              </div>

              {/* Card actions */}
              <div className="tw:px-5 tw:py-3 tw:border-t tw:border-gray-100 tw:flex tw:gap-2">
                <button
                  onClick={() => setPreviewTemplate(template)}
                  className="tw:flex tw:items-center tw:gap-1.5 tw:px-3 tw:py-1.5 tw:text-xs tw:font-medium tw:text-gray-600 tw:bg-gray-50 tw:rounded-lg hover:tw:bg-gray-100 tw:transition tw:flex-1 tw:justify-center"
                >
                  <Eye className="tw:h-3.5 tw:w-3.5" />
                  Preview
                </button>
                <button
                  onClick={() => handleUseTemplate(template)}
                  className="tw:flex tw:items-center tw:gap-1.5 tw:px-3 tw:py-1.5 tw:text-xs tw:font-medium tw:text-white tw:bg-indigo-600 tw:rounded-lg hover:tw:bg-indigo-700 tw:transition tw:flex-1 tw:justify-center"
                >
                  <Copy className="tw:h-3.5 tw:w-3.5" />
                  Use Template
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview modal */}
      <Modal
        isOpen={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        title={previewTemplate?.name || 'Template Preview'}
        size="lg"
        footer={
          <button
            onClick={() => { handleUseTemplate(previewTemplate); setPreviewTemplate(null) }}
            className="tw:px-4 tw:py-2 tw:text-sm tw:font-medium tw:text-white tw:bg-indigo-600 tw:rounded-lg hover:tw:bg-indigo-700 tw:transition"
          >
            Use This Template
          </button>
        }
      >
        {previewTemplate && (
          <div className="tw:space-y-4">
            <div className="tw:flex tw:items-center tw:gap-3 tw:p-4 tw:bg-gray-50 tw:rounded-lg">
              <FileText className="tw:h-8 tw:w-8 tw:text-indigo-500" />
              <div>
                <p className="tw:font-semibold tw:text-gray-900">{previewTemplate.name}</p>
                <p className="tw:text-sm tw:text-gray-500">{previewTemplate.description}</p>
              </div>
            </div>
            <div className="tw:grid tw:grid-cols-2 tw:gap-4">
              <div className="tw:p-3 tw:bg-gray-50 tw:rounded-lg">
                <p className="tw:text-xs tw:text-gray-500">Category</p>
                <p className="tw:text-sm tw:font-medium tw:text-gray-900">{categoryLabels[previewTemplate.category]}</p>
              </div>
              <div className="tw:p-3 tw:bg-gray-50 tw:rounded-lg">
                <p className="tw:text-xs tw:text-gray-500">Version</p>
                <p className="tw:text-sm tw:font-medium tw:text-gray-900">{previewTemplate.version}</p>
              </div>
              <div className="tw:p-3 tw:bg-gray-50 tw:rounded-lg">
                <p className="tw:text-xs tw:text-gray-500">Times Used</p>
                <p className="tw:text-sm tw:font-medium tw:text-gray-900">{previewTemplate.usageCount}</p>
              </div>
              <div className="tw:p-3 tw:bg-gray-50 tw:rounded-lg">
                <p className="tw:text-xs tw:text-gray-500">Last Updated</p>
                <p className="tw:text-sm tw:font-medium tw:text-gray-900">{previewTemplate.lastUpdated}</p>
              </div>
            </div>
            {/* Simulated W2 form preview */}
            <div className="tw:border tw:border-gray-200 tw:rounded-lg tw:p-4">
              <div className="tw:text-center tw:mb-4">
                <p className="tw:text-xs tw:font-bold tw:text-gray-400 tw:uppercase tw:tracking-wider">Form W-2 Preview</p>
                <p className="tw:text-lg tw:font-bold tw:text-gray-900">Wage and Tax Statement</p>
                <p className="tw:text-xs tw:text-gray-500">Tax Year {previewTemplate.version}</p>
              </div>
              <div className="tw:grid tw:grid-cols-2 tw:gap-2">
                {['Employee SSN', 'Employer EIN', 'Wages & Tips', 'Federal Tax', 'SS Wages', 'SS Tax', 'Medicare Wages', 'Medicare Tax'].map((field) => (
                  <div key={field} className="tw:p-2 tw:border tw:border-dashed tw:border-gray-200 tw:rounded tw:bg-gray-50/50">
                    <p className="tw:text-[10px] tw:text-gray-400 tw:uppercase">{field}</p>
                    <p className="tw:text-sm tw:text-gray-300 tw:mt-0.5">—</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
