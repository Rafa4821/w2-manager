import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Library, Star, FileText, Eye, Search, Layers } from 'lucide-react'
import { PageHeader, Badge, Modal } from '../../../shared/components'
import { useNotificationStore } from '../../../shared/store'
import { getAllTemplates, TemplateRenderer } from '../../../templates'

const categoryLabels = {
  standard: 'Standard',
  'multi-state': 'Multi-State',
  benefits: 'Benefits',
  correction: 'Correction',
  government: 'Government',
  custom: 'Custom',
}

/** Build a fictitious sample document for template previews. */
function sampleDoc() {
  return {
    taxYear: 2024,
    controlNumber: 'DEMO-001',
    box1_wagesTips: 75000,
    box2_federalTaxWithheld: 12500,
    box3_socialSecurityWages: 75000,
    box4_socialSecurityTax: 4650,
    box5_medicareWages: 75000,
    box6_medicareTax: 1087.50,
    box7_socialSecurityTips: 0,
    box8_allocatedTips: 0,
    box10_dependentCareBenefits: 0,
    box11_nonqualifiedPlans: 0,
    box12: [{ code: 'D', amount: 6500 }, { code: 'DD', amount: 8200 }],
    box13_statutoryEmployee: false,
    box13_retirementPlan: true,
    box13_thirdPartySickPay: false,
    box14: [{ description: 'Union dues', amount: 450 }],
    stateLocal: [{ state: 'NY', employerStateId: '12-3456789', stateWages: 75000, stateTax: 3800, localWages: 75000, localTax: 1200, localityName: 'NEW YORK CITY' }],
    companySnapshot: {
      id: 'demo-c', name: 'Acme Technologies Inc.', ein: '12-3456789',
      address: '100 Innovation Drive', address2: 'Suite 400',
      city: 'New York', state: 'NY', zipCode: '10001',
      stateEmployerId: '12-3456789', contactName: 'Jane Smith',
    },
    employeeSnapshot: {
      id: 'demo-e', firstName: 'John', middleInitial: 'A', lastName: 'Doe',
      suffix: '', ssn: '***-**-1234',
      address: '456 Oak Avenue', address2: 'Apt 7B',
      city: 'Brooklyn', state: 'NY', zipCode: '11201',
    },
  }
}

export function TemplateLibraryPage() {
  const registered = useMemo(() => getAllTemplates(), [])
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [previewTemplate, setPreviewTemplate] = useState(null)
  const addNotification = useNotificationStore((s) => s.addNotification)
  const navigate = useNavigate()

  const filtered = registered.filter((t) => {
    const m = t.manifest
    if (search) {
      const q = search.toLowerCase()
      if (!m.name.toLowerCase().includes(q) && !(m.description || '').toLowerCase().includes(q)) return false
    }
    if (categoryFilter && m.category !== categoryFilter) return false
    return true
  })

  const categories = [...new Set(registered.map((t) => t.manifest.category))]

  const handleUseTemplate = (template) => {
    addNotification({ type: 'success', title: 'Template Selected', message: `"${template.manifest.name}" is ready. Create a new W-2 document to use it.` })
    navigate('/w2-documents/new')
  }

  const demo = useMemo(() => sampleDoc(), [])

  return (
    <div>
      <PageHeader title="Template Library" description="Browse registered W-2 document templates">
        <div className="tw:flex tw:items-center tw:gap-2 tw:text-xs tw:text-gray-500">
          <Layers className="tw:h-4 tw:w-4" />
          {registered.length} template{registered.length !== 1 ? 's' : ''} registered
        </div>
      </PageHeader>

      {/* Search & filter bar */}
      <div className="tw:flex tw:flex-col sm:tw:flex-row tw:gap-3 tw:mb-6">
        <div className="tw:relative tw:flex-1">
          <Search className="tw:absolute tw:left-3 tw:top-1/2 tw:-translate-y-1/2 tw:h-4 tw:w-4 tw:text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search templates..."
            className="tw:w-full tw:pl-9 tw:pr-3 tw:py-2 tw:text-sm tw:border tw:border-gray-200 tw:rounded-lg focus:tw:outline-none focus:tw:ring-2 focus:tw:ring-indigo-500 focus:tw:border-transparent tw:bg-white" />
        </div>
        <div className="tw:flex tw:gap-2 tw:flex-wrap">
          <button onClick={() => setCategoryFilter('')}
            className={`tw:px-3 tw:py-1.5 tw:text-sm tw:rounded-lg tw:font-medium tw:transition tw:border ${
              !categoryFilter ? 'tw:bg-indigo-600 tw:text-white tw:border-indigo-600' : 'tw:bg-white tw:text-gray-600 tw:border-gray-200 hover:tw:bg-gray-50'
            }`}>All</button>
          {categories.map((cat) => (
            <button key={cat} onClick={() => setCategoryFilter(cat)}
              className={`tw:px-3 tw:py-1.5 tw:text-sm tw:rounded-lg tw:font-medium tw:transition tw:border ${
                categoryFilter === cat ? 'tw:bg-indigo-600 tw:text-white tw:border-indigo-600' : 'tw:bg-white tw:text-gray-600 tw:border-gray-200 hover:tw:bg-gray-50'
              }`}>{categoryLabels[cat] || cat}</button>
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
          {filtered.map((t) => {
            const m = t.manifest
            return (
              <div key={m.id} className="tw:bg-white tw:rounded-xl tw:border tw:border-gray-200 tw:shadow-sm hover:tw:shadow-md tw:transition-all tw:group">
                <div className="tw:p-5 tw:pb-3">
                  <div className="tw:flex tw:items-start tw:justify-between tw:mb-3">
                    <div className="tw:p-2 tw:bg-indigo-50 tw:rounded-lg">
                      <FileText className="tw:h-5 tw:w-5 tw:text-indigo-500" />
                    </div>
                    <div className="tw:flex tw:items-center tw:gap-2">
                      {m.isDefault && (
                        <span className="tw:flex tw:items-center tw:gap-1 tw:text-xs tw:font-medium tw:text-amber-600">
                          <Star className="tw:h-3.5 tw:w-3.5 tw:fill-amber-400 tw:text-amber-400" /> Default
                        </span>
                      )}
                      <Badge variant="info">{categoryLabels[m.category] || m.category}</Badge>
                    </div>
                  </div>
                  <h3 className="tw:text-base tw:font-semibold tw:text-gray-900 tw:mb-1">{m.name}</h3>
                  <p className="tw:text-sm tw:text-gray-500 tw:line-clamp-2">{m.description}</p>
                </div>
                <div className="tw:px-5 tw:py-3 tw:border-t tw:border-gray-100 tw:flex tw:items-center tw:justify-between tw:text-xs tw:text-gray-400">
                  <span>v{m.version} &middot; {m.pages} page{m.pages !== 1 ? 's' : ''}</span>
                  <span>{m.pageSize.width}&times;{m.pageSize.height} {m.pageSize.unit}</span>
                </div>
                <div className="tw:px-5 tw:py-3 tw:border-t tw:border-gray-100 tw:flex tw:gap-2">
                  <button onClick={() => setPreviewTemplate(t)}
                    className="tw:flex tw:items-center tw:gap-1.5 tw:px-3 tw:py-1.5 tw:text-xs tw:font-medium tw:text-gray-600 tw:bg-gray-50 tw:rounded-lg hover:tw:bg-gray-100 tw:transition tw:flex-1 tw:justify-center">
                    <Eye className="tw:h-3.5 tw:w-3.5" /> Preview
                  </button>
                  <button onClick={() => handleUseTemplate(t)}
                    className="tw:flex tw:items-center tw:gap-1.5 tw:px-3 tw:py-1.5 tw:text-xs tw:font-medium tw:text-white tw:bg-indigo-600 tw:rounded-lg hover:tw:bg-indigo-700 tw:transition tw:flex-1 tw:justify-center">
                    <FileText className="tw:h-3.5 tw:w-3.5" /> Use Template
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Preview modal with live template render */}
      <Modal isOpen={!!previewTemplate} onClose={() => setPreviewTemplate(null)}
        title={previewTemplate?.manifest.name || 'Template Preview'} size="xl"
        footer={
          <div className="tw:flex tw:gap-2">
            <button onClick={() => setPreviewTemplate(null)}
              className="tw:px-4 tw:py-2 tw:text-sm tw:font-medium tw:text-gray-600 tw:bg-gray-100 tw:rounded-lg hover:tw:bg-gray-200 tw:transition">
              Close
            </button>
            <button onClick={() => { handleUseTemplate(previewTemplate); setPreviewTemplate(null) }}
              className="tw:px-4 tw:py-2 tw:text-sm tw:font-medium tw:text-white tw:bg-indigo-600 tw:rounded-lg hover:tw:bg-indigo-700 tw:transition">
              Use This Template
            </button>
          </div>
        }>
        {previewTemplate && (
          <div className="tw:space-y-4">
            <div className="tw:flex tw:items-center tw:gap-3 tw:p-4 tw:bg-gray-50 tw:rounded-lg">
              <FileText className="tw:h-8 tw:w-8 tw:text-indigo-500" />
              <div>
                <p className="tw:font-semibold tw:text-gray-900">{previewTemplate.manifest.name}</p>
                <p className="tw:text-sm tw:text-gray-500">{previewTemplate.manifest.description}</p>
              </div>
            </div>
            <div className="tw:grid tw:grid-cols-3 tw:gap-3">
              <div className="tw:p-3 tw:bg-gray-50 tw:rounded-lg">
                <p className="tw:text-xs tw:text-gray-500">Category</p>
                <p className="tw:text-sm tw:font-medium tw:text-gray-900">{categoryLabels[previewTemplate.manifest.category] || previewTemplate.manifest.category}</p>
              </div>
              <div className="tw:p-3 tw:bg-gray-50 tw:rounded-lg">
                <p className="tw:text-xs tw:text-gray-500">Version</p>
                <p className="tw:text-sm tw:font-medium tw:text-gray-900">{previewTemplate.manifest.version}</p>
              </div>
              <div className="tw:p-3 tw:bg-gray-50 tw:rounded-lg">
                <p className="tw:text-xs tw:text-gray-500">Page Size</p>
                <p className="tw:text-sm tw:font-medium tw:text-gray-900">{previewTemplate.manifest.pageSize.width}&times;{previewTemplate.manifest.pageSize.height} {previewTemplate.manifest.pageSize.unit}</p>
              </div>
            </div>
            {/* Live rendered preview with sample data */}
            <div className="tw:border tw:border-gray-200 tw:rounded-lg tw:overflow-hidden tw:bg-gray-100 tw:p-4">
              <p className="tw:text-[10px] tw:text-gray-400 tw:text-center tw:mb-2 tw:uppercase tw:tracking-wider">Live Preview — Fictitious Sample Data</p>
              <TemplateRenderer templateId={previewTemplate.manifest.id} doc={demo} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
