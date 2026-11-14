import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Save, Eye, Building2, Users, Calendar, FileText, DollarSign, CheckCircle2, AlertTriangle, Info, Download, Loader2 } from 'lucide-react'
import { PageHeader, FormField, CurrencyField } from '../../../shared/components'
import { useNotificationStore } from '../../../shared/store'
import { useCompaniesStore } from '../../companies/store/useCompaniesStore'
import { useEmployeesStore } from '../../employees/store/useEmployeesStore'
import { useW2DocumentsStore } from '../store/useW2DocumentsStore'
import { companyRepository } from '../../../shared/repositories/companyRepository'
import { employeeRepository } from '../../../shared/repositories/employeeRepository'
import { w2DocumentRepository } from '../../../shared/repositories/w2DocumentRepository'
import { BOX_12_CODES } from '../../../shared/schemas/w2Document'
import { getFormWarnings, getSSWageBase } from '../../../shared/schemas/taxYearRules'
import { round2 } from '../../../shared/utils/currency'
import { getAllTemplates, getTemplate, TemplateRenderer } from '../../../templates'
import { generatePdf, createPdfUrl, downloadPdf } from '../../pdf-generator/engine/pdfGenerator'
import { W2Preview } from './W2Preview'

const STEPS = [
  { id: 'company', label: 'Employer', icon: Building2 },
  { id: 'employee', label: 'Employee', icon: Users },
  { id: 'year', label: 'Tax Year', icon: Calendar },
  { id: 'template', label: 'Template', icon: FileText },
  { id: 'wages', label: 'Tax Data', icon: DollarSign },
  { id: 'preview', label: 'Review', icon: CheckCircle2 },
]

const CURRENT_YEAR = new Date().getFullYear()
const TAX_YEARS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR - i)

const EMPTY_STATE_LOCAL = { state: '', employerStateId: '', stateWages: 0, stateTax: 0, localWages: 0, localTax: 0, localityName: '' }

function emptyFormData() {
  return {
    companyId: '',
    employeeId: '',
    taxYear: CURRENT_YEAR,
    templateId: '',
    controlNumber: '',
    box1_wagesTips: 0,
    box2_federalTaxWithheld: 0,
    box3_socialSecurityWages: 0,
    box4_socialSecurityTax: 0,
    box5_medicareWages: 0,
    box6_medicareTax: 0,
    box7_socialSecurityTips: 0,
    box8_allocatedTips: 0,
    box10_dependentCareBenefits: 0,
    box11_nonqualifiedPlans: 0,
    box12: [],
    box13_statutoryEmployee: false,
    box13_retirementPlan: false,
    box13_thirdPartySickPay: false,
    box14: [],
    stateLocal: [{ ...EMPTY_STATE_LOCAL }],
    status: 'draft',
    notes: '',
  }
}

function docToForm(doc) {
  return {
    companyId: doc.companyId,
    employeeId: doc.employeeId,
    taxYear: doc.taxYear,
    templateId: doc.templateId || '',
    controlNumber: doc.controlNumber || '',
    box1_wagesTips: doc.box1_wagesTips || 0,
    box2_federalTaxWithheld: doc.box2_federalTaxWithheld || 0,
    box3_socialSecurityWages: doc.box3_socialSecurityWages || 0,
    box4_socialSecurityTax: doc.box4_socialSecurityTax || 0,
    box5_medicareWages: doc.box5_medicareWages || 0,
    box6_medicareTax: doc.box6_medicareTax || 0,
    box7_socialSecurityTips: doc.box7_socialSecurityTips || 0,
    box8_allocatedTips: doc.box8_allocatedTips || 0,
    box10_dependentCareBenefits: doc.box10_dependentCareBenefits || 0,
    box11_nonqualifiedPlans: doc.box11_nonqualifiedPlans || 0,
    box12: doc.box12 || [],
    box13_statutoryEmployee: doc.box13_statutoryEmployee || false,
    box13_retirementPlan: doc.box13_retirementPlan || false,
    box13_thirdPartySickPay: doc.box13_thirdPartySickPay || false,
    box14: doc.box14 || [],
    stateLocal: doc.stateLocal?.length ? doc.stateLocal : [{ ...EMPTY_STATE_LOCAL }],
    status: doc.status || 'draft',
    notes: doc.notes || '',
  }
}

/** Load a source document for editing or duplicating. */
function loadSourceDoc(id, duplicateId) {
  if (id) return w2DocumentRepository.getById(id)
  if (duplicateId) return w2DocumentRepository.getById(duplicateId)
  return null
}

export function W2EditorPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const duplicateId = searchParams.get('duplicate')
  const navigate = useNavigate()
  const isEditing = !!id
  const isDuplicating = !!duplicateId
  const addNotification = useNotificationStore((s) => s.addNotification)
  const { companies, load: loadCompanies } = useCompaniesStore()
  const { employees, load: loadEmployees } = useEmployeesStore()
  const { create, update, load: loadDocs } = useW2DocumentsStore()

  // Lazy initialization from repository (no setState in effect)
  const [step, setStep] = useState(() => {
    const doc = loadSourceDoc(id, duplicateId)
    return doc ? 4 : 0
  })
  const [form, setForm] = useState(() => {
    const doc = loadSourceDoc(id, duplicateId)
    if (doc) {
      const f = docToForm(doc)
      if (isDuplicating) f.status = 'draft' // duplicates always start as draft
      return f
    }
    return emptyFormData()
  })
  const [errors, setErrors] = useState({})
  const [notFound] = useState(() => (id || duplicateId) && !loadSourceDoc(id, duplicateId))

  useEffect(() => {
    loadCompanies()
    loadEmployees()
    loadDocs()
  }, [loadCompanies, loadEmployees, loadDocs])

  useEffect(() => {
    if (notFound) {
      addNotification({ type: 'error', title: 'Not Found', message: 'Document not found.' })
      navigate('/w2-documents')
    }
  }, [notFound, addNotification, navigate])

  const selectedCompany = useMemo(() => companies.find((c) => c.id === form.companyId), [companies, form.companyId])
  const selectedEmployee = useMemo(() => employees.find((e) => e.id === form.employeeId), [employees, form.employeeId])
  const activeEmployees = useMemo(
    () => employees.filter((e) => e.status === 'active'),
    [employees]
  )
  const ssWageBase = useMemo(() => getSSWageBase(form.taxYear), [form.taxYear])
  const formWarnings = useMemo(() => getFormWarnings(form), [form])

  // ── Field setters with proper decimal rounding ──
  const setField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
  }
  const setCurrencyField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: round2(value) }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  // ── Box 12 helpers ──
  const addBox12 = () => {
    if (form.box12.length >= 4) return
    setForm((prev) => ({ ...prev, box12: [...prev.box12, { code: '', amount: 0 }] }))
  }
  const updateBox12 = (index, field, value) => {
    setForm((prev) => {
      const arr = [...prev.box12]
      arr[index] = { ...arr[index], [field]: field === 'amount' ? round2(value) : value }
      return { ...prev, box12: arr }
    })
  }
  const removeBox12 = (index) => {
    setForm((prev) => ({ ...prev, box12: prev.box12.filter((_, i) => i !== index) }))
  }

  // ── Box 14 helpers ──
  const addBox14 = () => {
    setForm((prev) => ({ ...prev, box14: [...prev.box14, { description: '', amount: 0 }] }))
  }
  const updateBox14 = (index, field, value) => {
    setForm((prev) => {
      const arr = [...prev.box14]
      arr[index] = { ...arr[index], [field]: field === 'amount' ? round2(value) : value }
      return { ...prev, box14: arr }
    })
  }
  const removeBox14 = (index) => {
    setForm((prev) => ({ ...prev, box14: prev.box14.filter((_, i) => i !== index) }))
  }

  // ── State/Local helpers ──
  const updateStateLocal = (index, field, value) => {
    const isNumeric = ['stateWages', 'stateTax', 'localWages', 'localTax'].includes(field)
    setForm((prev) => {
      const arr = [...prev.stateLocal]
      arr[index] = { ...arr[index], [field]: isNumeric ? round2(value) : value }
      return { ...prev, stateLocal: arr }
    })
  }
  const addStateLocal = () => {
    if (form.stateLocal.length >= 2) return
    setForm((prev) => ({ ...prev, stateLocal: [...prev.stateLocal, { ...EMPTY_STATE_LOCAL }] }))
  }
  const removeStateLocal = (index) => {
    setForm((prev) => ({ ...prev, stateLocal: prev.stateLocal.filter((_, i) => i !== index) }))
  }

  // ── Per-step validation ──
  const validateStep = (s) => {
    const e = {}
    switch (s) {
      case 0:
        if (!form.companyId) e.companyId = 'Select an employer to continue.'
        break
      case 1:
        if (!form.employeeId) e.employeeId = 'Select an employee to continue.'
        break
      case 2:
        if (!form.taxYear) e.taxYear = 'Select a tax year.'
        break
      case 4:
        // Only warn if Box 3 exceeds SS base — don't block save
        if (form.box3_socialSecurityWages > ssWageBase) {
          e._warnBox3 = `Box 3 exceeds the ${form.taxYear} SS wage base ($${ssWageBase.toLocaleString()}).`
        }
        break
      default:
        break
    }
    return e
  }

  /** Stricter validation applied when saving as completed. */
  const validateForCompleted = () => {
    const e = {}
    if (!form.companyId) e.companyId = 'Company is required.'
    if (!form.employeeId) e.employeeId = 'Employee is required.'
    if (!form.taxYear) e.taxYear = 'Tax year is required.'
    if (form.box1_wagesTips <= 0) e.box1_wagesTips = 'Box 1 (wages) must be greater than zero for a completed document.'
    return e
  }

  const canProceed = () => {
    const stepErrors = validateStep(step)
    // Ignore soft warnings (keys starting with _warn)
    return Object.keys(stepErrors).filter((k) => !k.startsWith('_warn')).length === 0
  }

  const handleNext = () => {
    const stepErrors = validateStep(step)
    const hardErrors = Object.fromEntries(Object.entries(stepErrors).filter(([k]) => !k.startsWith('_warn')))
    if (Object.keys(hardErrors).length > 0) {
      setErrors(hardErrors)
      return
    }
    setErrors({})
    setStep(step + 1)
  }

  // ── Save ──
  const handleSave = (saveStatus) => {
    // For "completed" status, apply stricter validation
    if (saveStatus === 'completed') {
      const completedErrors = validateForCompleted()
      if (Object.keys(completedErrors).length > 0) {
        setErrors(completedErrors)
        addNotification({ type: 'error', title: 'Validation Error', message: 'Please fix the highlighted fields before marking as completed.' })
        return
      }
    }

    // Draft and pending only need company + employee
    if (!form.companyId || !form.employeeId) {
      addNotification({ type: 'error', title: 'Missing Data', message: 'Company and employee are required even for drafts.' })
      return
    }

    try {
      const companySnap = companyRepository.getById(form.companyId)
      const employeeSnap = employeeRepository.getById(form.employeeId)
      if (!companySnap || !employeeSnap) {
        addNotification({ type: 'error', title: 'Error', message: 'Company or employee not found.' })
        return
      }

      const docData = {
        ...form,
        status: saveStatus,
        companySnapshot: {
          id: companySnap.id, name: companySnap.name, ein: companySnap.ein,
          address: companySnap.address, address2: companySnap.address2 || '',
          city: companySnap.city, state: companySnap.state, zipCode: companySnap.zipCode,
          stateEmployerId: companySnap.stateEmployerId || '', contactName: companySnap.contactName || '',
        },
        employeeSnapshot: {
          id: employeeSnap.id, firstName: employeeSnap.firstName,
          middleInitial: employeeSnap.middleInitial || '', lastName: employeeSnap.lastName,
          suffix: employeeSnap.suffix || '', ssn: employeeSnap.ssn,
          address: employeeSnap.address, address2: employeeSnap.address2 || '',
          city: employeeSnap.city, state: employeeSnap.state, zipCode: employeeSnap.zipCode,
        },
        stateLocal: form.stateLocal.filter((sl) => sl.state || sl.stateWages || sl.stateTax || sl.localWages || sl.localTax),
        box12: form.box12.filter((b) => b.code),
        box14: form.box14.filter((b) => b.description),
      }

      if (isEditing) {
        update(id, docData)
        addNotification({ type: 'success', title: 'Document Updated', message: `W-2 saved as ${saveStatus}.` })
      } else {
        create(docData)
        addNotification({ type: 'success', title: 'Document Created', message: `W-2 created as ${saveStatus}.` })
      }
      navigate('/w2-documents')
    } catch (err) {
      addNotification({ type: 'error', title: 'Save Error', message: err.message })
    }
  }

  // ── Build preview document ──
  const previewDoc = useMemo(() => {
    const comp = selectedCompany || {}
    const emp = selectedEmployee || {}
    return {
      ...form,
      companySnapshot: {
        id: comp.id || '', name: comp.name || '', ein: comp.ein || '',
        address: comp.address || '', address2: comp.address2 || '',
        city: comp.city || '', state: comp.state || '', zipCode: comp.zipCode || '',
        stateEmployerId: comp.stateEmployerId || '', contactName: comp.contactName || '',
      },
      employeeSnapshot: {
        id: emp.id || '', firstName: emp.firstName || '', middleInitial: emp.middleInitial || '',
        lastName: emp.lastName || '', suffix: emp.suffix || '', ssn: emp.ssn || '',
        address: emp.address || '', address2: emp.address2 || '',
        city: emp.city || '', state: emp.state || '', zipCode: emp.zipCode || '',
      },
    }
  }, [form, selectedCompany, selectedEmployee])

  // ═══════════════════════════════════════════════════════════════
  //  STEP RENDERERS
  // ═══════════════════════════════════════════════════════════════

  // ── Step 1: Select Company ──
  const renderCompanyStep = () => {
    const activeCompanies = companies.filter((c) => c.status === 'active')
    return (
      <div>
        <h3 className="tw:text-lg tw:font-semibold tw:text-gray-900 tw:mb-1">Select Employer</h3>
        <p className="tw:text-sm tw:text-gray-500 tw:mb-5">Choose the employer company for this W-2 document.</p>
        {errors.companyId && <p className="tw:text-sm tw:text-rose-600 tw:mb-3">{errors.companyId}</p>}
        <div className="tw:grid tw:grid-cols-1 md:tw:grid-cols-2 tw:gap-3">
          {activeCompanies.map((c) => (
            <button key={c.id} onClick={() => { setField('companyId', c.id); setField('employeeId', '') }}
              className={`tw:text-left tw:p-4 tw:rounded-xl tw:border-2 tw:transition ${
                form.companyId === c.id ? 'tw:border-indigo-500 tw:bg-indigo-50' : 'tw:border-gray-200 hover:tw:border-gray-300 tw:bg-white'
              }`}>
              <div className="tw:flex tw:items-center tw:gap-3">
                <Building2 className={`tw:h-5 tw:w-5 ${form.companyId === c.id ? 'tw:text-indigo-500' : 'tw:text-gray-400'}`} />
                <div>
                  <p className="tw:font-medium tw:text-gray-900">{c.name}</p>
                  <p className="tw:text-xs tw:text-gray-500">EIN: {c.ein} &middot; {c.city}, {c.state}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
        {activeCompanies.length === 0 && (
          <p className="tw:text-center tw:text-gray-500 tw:py-8">No active companies. Add a company first.</p>
        )}
      </div>
    )
  }

  // ── Step 2: Select Employee ──
  const renderEmployeeStep = () => (
    <div>
      <h3 className="tw:text-lg tw:font-semibold tw:text-gray-900 tw:mb-1">Select Employee</h3>
      <p className="tw:text-sm tw:text-gray-500 tw:mb-5">Choose the employee for this W-2 document.</p>
      {errors.employeeId && <p className="tw:text-sm tw:text-rose-600 tw:mb-3">{errors.employeeId}</p>}
      <div className="tw:grid tw:grid-cols-1 md:tw:grid-cols-2 tw:gap-3">
        {activeEmployees.map((e) => {
          const empCompany = companies.find(c => c.id === e.companyId)
          return (
            <button key={e.id} onClick={() => setField('employeeId', e.id)}
              className={`tw:text-left tw:p-4 tw:rounded-xl tw:border-2 tw:transition ${
                form.employeeId === e.id ? 'tw:border-indigo-500 tw:bg-indigo-50' : 'tw:border-gray-200 hover:tw:border-gray-300 tw:bg-white'
              }`}>
              <div className="tw:flex tw:items-center tw:gap-3">
                <div className={`tw:flex tw:items-center tw:justify-center tw:h-9 tw:w-9 tw:rounded-full tw:text-xs tw:font-semibold ${
                  form.employeeId === e.id ? 'tw:bg-indigo-100 tw:text-indigo-700' : 'tw:bg-gray-100 tw:text-gray-600'
                }`}>{e.firstName[0]}{e.lastName[0]}</div>
                <div>
                  <p className="tw:font-medium tw:text-gray-900">{e.firstName} {e.lastName}</p>
                  <p className="tw:text-xs tw:text-gray-500">
                    SSN: {e.ssn}
                    {empCompany ? ` · ${empCompany.name}` : ''}
                  </p>
                </div>
              </div>
            </button>
          )
        })}
      </div>
      {activeEmployees.length === 0 && (
        <p className="tw:text-center tw:text-gray-500 tw:py-8">No active employees. Add an employee first.</p>
      )}
    </div>
  )

  // ── Step 3: Tax Year ──
  const renderYearStep = () => (
    <div>
      <h3 className="tw:text-lg tw:font-semibold tw:text-gray-900 tw:mb-1">Select Tax Year</h3>
      <p className="tw:text-sm tw:text-gray-500 tw:mb-5">Choose the fiscal year for this W-2.</p>
      <div className="tw:grid tw:grid-cols-2 sm:tw:grid-cols-3 md:tw:grid-cols-6 tw:gap-3">
        {TAX_YEARS.map((year) => (
          <button key={year} onClick={() => setField('taxYear', year)}
            className={`tw:p-4 tw:rounded-xl tw:border-2 tw:text-center tw:font-semibold tw:text-lg tw:transition ${
              form.taxYear === year
                ? 'tw:border-indigo-500 tw:bg-indigo-50 tw:text-indigo-700'
                : 'tw:border-gray-200 hover:tw:border-gray-300 tw:text-gray-700 tw:bg-white'
            }`}>{year}</button>
        ))}
      </div>
      <div className="tw:mt-4 tw:p-3 tw:bg-blue-50 tw:border tw:border-blue-100 tw:rounded-lg tw:flex tw:items-start tw:gap-2">
        <Info className="tw:h-4 tw:w-4 tw:text-blue-500 tw:mt-0.5 tw:flex-shrink-0" />
        <p className="tw:text-xs tw:text-blue-700">SS wage base for {form.taxYear}: <strong>${ssWageBase.toLocaleString()}</strong>. Box 3 values above this limit will be flagged.</p>
      </div>
      <div className="tw:mt-4">
        <FormField label="Control Number (Box d — optional)" name="controlNumber" value={form.controlNumber} onChange={(_, v) => setField('controlNumber', v)} placeholder="Employer reference number" />
      </div>
    </div>
  )

  // ── Step 4: Template (ALL templates, independent of tax year) ──
  const renderTemplateStep = () => {
    const allTemplates = getAllTemplates().filter(t => t.manifest.id !== 'demo-w2')
    const defaultTpl = allTemplates.find((t) => t.manifest.isDefault) || allTemplates[0]
    return (
      <div>
        <h3 className="tw:text-lg tw:font-semibold tw:text-gray-900 tw:mb-1">Choose a Template</h3>
        <p className="tw:text-sm tw:text-gray-500 tw:mb-2">
          Select any template regardless of its original year.
          The tax year <strong>{form.taxYear}</strong> will be applied to the document.
        </p>
        <div className="tw:grid tw:grid-cols-1 md:tw:grid-cols-2 tw:gap-3">
          {allTemplates.map((t) => {
            const m = t.manifest
            const isSelected = form.templateId === m.id
            const yearMatch = m.taxYears?.includes(form.taxYear)
            return (
              <button key={m.id} onClick={() => setField('templateId', m.id)}
                className={`tw:text-left tw:p-4 tw:rounded-xl tw:border-2 tw:transition ${
                  isSelected ? 'tw:border-indigo-500 tw:bg-indigo-50' : 'tw:border-gray-200 hover:tw:border-gray-300 tw:bg-white'
                }`}>
                <div className="tw:flex tw:items-center tw:gap-2 tw:mb-1">
                  <p className="tw:font-medium tw:text-gray-900">{m.name}</p>
                  {yearMatch && <span className="tw:text-[10px] tw:bg-green-100 tw:text-green-700 tw:px-1.5 tw:py-0.5 tw:rounded tw:font-medium">Year match</span>}
                  {!yearMatch && <span className="tw:text-[10px] tw:bg-gray-100 tw:text-gray-500 tw:px-1.5 tw:py-0.5 tw:rounded">Year {m.taxYears?.[0] || '?'}</span>}
                </div>
                <p className="tw:text-xs tw:text-gray-500">{m.description}</p>
                {m.pages > 1 && <p className="tw:text-[10px] tw:text-indigo-500 tw:mt-1">{m.pages} pages</p>}
              </button>
            )
          })}
        </div>
        {allTemplates.length === 0 && (
          <p className="tw:text-center tw:text-gray-500 tw:py-8">No templates registered.</p>
        )}

        {(form.templateId || defaultTpl) && (
          <div className="tw:mt-6">
            <h4 className="tw:text-sm tw:font-semibold tw:text-gray-700 tw:mb-2">Template Preview</h4>
            <div className="tw:border tw:border-gray-200 tw:rounded-lg tw:overflow-hidden tw:bg-gray-50 tw:p-4">
              <TemplateRenderer templateId={form.templateId || defaultTpl?.manifest.id} doc={previewDoc} />
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── Step 5: Tax Data (all W-2 boxes) ──
  const renderTaxDataStep = () => (
    <div className="tw:space-y-6">
      <div>
        <h3 className="tw:text-lg tw:font-semibold tw:text-gray-900 tw:mb-1">Tax Data — W-2 Boxes</h3>
        <p className="tw:text-sm tw:text-gray-500 tw:mb-1">Enter the amounts reported by the employer&rsquo;s payroll system. All values in USD.</p>
        <p className="tw:text-xs tw:text-amber-600">This tool does not compute withholding or tax amounts. Enter values exactly as provided by the payroll source.</p>
      </div>

      {errors.box1_wagesTips && (
        <p className="tw:text-sm tw:text-rose-600 tw:p-3 tw:bg-rose-50 tw:rounded-lg">{errors.box1_wagesTips}</p>
      )}

      {/* ─── Group 1: Wages & Earnings (1, 3, 5, 16, 17) ─── */}
      <section className="tw:bg-white tw:rounded-xl tw:border tw:border-gray-200 tw:p-5">
        <h4 className="tw:text-sm tw:font-semibold tw:text-gray-800 tw:mb-1">Wages & Earnings</h4>
        <p className="tw:text-xs tw:text-gray-400 tw:mb-4">Boxes 1, 3, 5, 16, 17 — Total wages, social security wages, medicare wages, and state wages/tax.</p>
        <div className="tw:grid tw:grid-cols-1 sm:tw:grid-cols-2 lg:tw:grid-cols-3 tw:gap-x-4">
          <CurrencyField label="1 — Wages, tips, other compensation" name="box1_wagesTips" value={form.box1_wagesTips} onChange={setCurrencyField} error={errors.box1_wagesTips} />
          <CurrencyField label="3 — Social security wages" name="box3_socialSecurityWages" value={form.box3_socialSecurityWages} onChange={setCurrencyField} />
          <CurrencyField label="5 — Medicare wages and tips" name="box5_medicareWages" value={form.box5_medicareWages} onChange={setCurrencyField} />
        </div>
        {form.box3_socialSecurityWages > ssWageBase && (
          <div className="tw:flex tw:items-center tw:gap-2 tw:mt-2 tw:p-2 tw:bg-amber-50 tw:border tw:border-amber-200 tw:rounded-lg">
            <AlertTriangle className="tw:h-4 tw:w-4 tw:text-amber-500 tw:flex-shrink-0" />
            <p className="tw:text-xs tw:text-amber-700">Box 3 exceeds the {form.taxYear} SS wage base of ${ssWageBase.toLocaleString()}.</p>
          </div>
        )}
        {form.stateLocal.map((sl, i) => (
          <div key={i} className="tw:mt-4 tw:p-3 tw:bg-gray-50 tw:rounded-lg">
            <div className="tw:flex tw:items-center tw:justify-between tw:mb-2">
              <span className="tw:text-xs tw:font-semibold tw:text-gray-500 tw:uppercase">State {i + 1}</span>
              {i === 0 && form.stateLocal.length < 2 && (
                <button type="button" onClick={addStateLocal} className="tw:text-xs tw:font-medium tw:text-indigo-600 hover:tw:text-indigo-700">+ Add State</button>
              )}
              {form.stateLocal.length > 1 && (
                <button type="button" onClick={() => removeStateLocal(i)} className="tw:text-xs tw:text-rose-500 hover:tw:text-rose-700">Remove</button>
              )}
            </div>
            <div className="tw:grid tw:grid-cols-2 sm:tw:grid-cols-3 tw:gap-x-4">
              <FormField label="15 — State" name={`sl_state_${i}`} value={sl.state} onChange={(_, v) => updateStateLocal(i, 'state', v)} placeholder="NY" />
              <FormField label="15 — Employer State ID" name={`sl_esid_${i}`} value={sl.employerStateId} onChange={(_, v) => updateStateLocal(i, 'employerStateId', v)} placeholder="State ID number" />
              <CurrencyField label="16 — State wages" name={`sl_sw_${i}`} value={sl.stateWages} onChange={(_, v) => updateStateLocal(i, 'stateWages', v)} />
              <CurrencyField label="17 — State tax withheld" name={`sl_st_${i}`} value={sl.stateTax} onChange={(_, v) => updateStateLocal(i, 'stateTax', v)} />
            </div>
          </div>
        ))}
      </section>

      {/* ─── Group 2: Tax Withheld (2, 4, 6) ─── */}
      <section className="tw:bg-white tw:rounded-xl tw:border tw:border-gray-200 tw:p-5">
        <h4 className="tw:text-sm tw:font-semibold tw:text-gray-800 tw:mb-1">Tax Withheld</h4>
        <p className="tw:text-xs tw:text-gray-400 tw:mb-4">Boxes 2, 4, 6 — Federal income tax, social security tax, and medicare tax withheld.</p>
        <div className="tw:grid tw:grid-cols-1 sm:tw:grid-cols-3 tw:gap-x-4">
          <CurrencyField label="2 — Federal income tax withheld" name="box2_federalTaxWithheld" value={form.box2_federalTaxWithheld} onChange={setCurrencyField} />
          <CurrencyField label="4 — Social security tax withheld" name="box4_socialSecurityTax" value={form.box4_socialSecurityTax} onChange={setCurrencyField} />
          <CurrencyField label="6 — Medicare tax withheld" name="box6_medicareTax" value={form.box6_medicareTax} onChange={setCurrencyField} />
        </div>
      </section>

      {/* ─── Group 3: Other Fields ─── */}
      <section className="tw:bg-white tw:rounded-xl tw:border tw:border-gray-200 tw:p-5">
        <h4 className="tw:text-sm tw:font-semibold tw:text-gray-800 tw:mb-1">Other Fields</h4>
        <p className="tw:text-xs tw:text-gray-400 tw:mb-4">Tips, benefits, coded entries, checkboxes, local taxes, and other items.</p>

        <div className="tw:grid tw:grid-cols-1 sm:tw:grid-cols-2 tw:gap-x-4 tw:mb-4">
          <CurrencyField label="7 — Social security tips" name="box7_socialSecurityTips" value={form.box7_socialSecurityTips} onChange={setCurrencyField} />
          <CurrencyField label="8 — Allocated tips" name="box8_allocatedTips" value={form.box8_allocatedTips} onChange={setCurrencyField} />
          <CurrencyField label="10 — Dependent care benefits" name="box10_dependentCareBenefits" value={form.box10_dependentCareBenefits} onChange={setCurrencyField} />
          <CurrencyField label="11 — Nonqualified plans" name="box11_nonqualifiedPlans" value={form.box11_nonqualifiedPlans} onChange={setCurrencyField} />
        </div>

        {/* Local taxes (18, 19, 20) */}
        {form.stateLocal.map((sl, i) => (
          <div key={`local-${i}`} className="tw:mb-4 tw:p-3 tw:bg-gray-50 tw:rounded-lg">
            <span className="tw:text-xs tw:font-semibold tw:text-gray-500 tw:uppercase tw:mb-2 tw:block">Local Tax — State {i + 1}</span>
            <div className="tw:grid tw:grid-cols-1 sm:tw:grid-cols-3 tw:gap-x-4">
              <CurrencyField label="18 — Local wages" name={`sl_lw_${i}`} value={sl.localWages} onChange={(_, v) => updateStateLocal(i, 'localWages', v)} />
              <CurrencyField label="19 — Local tax withheld" name={`sl_lt_${i}`} value={sl.localTax} onChange={(_, v) => updateStateLocal(i, 'localTax', v)} />
              <FormField label="20 — Locality name" name={`sl_loc_${i}`} value={sl.localityName} onChange={(_, v) => updateStateLocal(i, 'localityName', v)} placeholder="City / locality" />
            </div>
          </div>
        ))}

        {/* Box 12 */}
        <div className="tw:border-t tw:border-gray-100 tw:pt-4 tw:mt-4">
          <div className="tw:flex tw:items-center tw:justify-between tw:mb-3">
            <h5 className="tw:text-sm tw:font-semibold tw:text-gray-700">Box 12 — Coded Entries</h5>
            {form.box12.length < 4 && (
              <button type="button" onClick={addBox12} className="tw:text-xs tw:font-medium tw:text-indigo-600 hover:tw:text-indigo-700">+ Add Entry</button>
            )}
          </div>
          {form.box12.length === 0 && <p className="tw:text-sm tw:text-gray-400">No Box 12 entries.</p>}
          {form.box12.map((entry, i) => (
            <div key={i} className="tw:flex tw:items-end tw:gap-3 tw:mb-3">
              <div className="tw:flex-1">
                <FormField
                  label={`12${String.fromCharCode(97 + i)} — Code`}
                  name={`box12_code_${i}`}
                  type="select"
                  value={entry.code}
                  onChange={(_, v) => updateBox12(i, 'code', v)}
                  options={Object.entries(BOX_12_CODES).map(([code, desc]) => ({ value: code, label: `${code} — ${desc.length > 55 ? desc.substring(0, 55) + '...' : desc}` }))}
                  placeholder="Select code"
                />
              </div>
              <div className="tw:w-40">
                <CurrencyField label="Amount" name={`box12_amt_${i}`} value={entry.amount} onChange={(_, v) => updateBox12(i, 'amount', v)} />
              </div>
              <button type="button" onClick={() => removeBox12(i)} className="tw:mb-4 tw:px-2 tw:py-1 tw:text-xs tw:text-rose-500 hover:tw:text-rose-700 tw:transition">Remove</button>
            </div>
          ))}
        </div>

        {/* Box 13 */}
        <div className="tw:border-t tw:border-gray-100 tw:pt-4 tw:mt-4">
          <h5 className="tw:text-sm tw:font-semibold tw:text-gray-700 tw:mb-3">Box 13 — Status Checkboxes</h5>
          <div className="tw:flex tw:flex-wrap tw:gap-6">
            {[
              { key: 'box13_statutoryEmployee', label: 'Statutory employee' },
              { key: 'box13_retirementPlan', label: 'Retirement plan' },
              { key: 'box13_thirdPartySickPay', label: 'Third-party sick pay' },
            ].map(({ key, label }) => (
              <label key={key} className="tw:flex tw:items-center tw:gap-2 tw:cursor-pointer">
                <input type="checkbox" checked={form[key]} onChange={(e) => setField(key, e.target.checked)}
                  className="tw:h-4 tw:w-4 tw:rounded tw:border-gray-300 tw:text-indigo-600 focus:tw:ring-indigo-500" />
                <span className="tw:text-sm tw:text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Box 14 */}
        <div className="tw:border-t tw:border-gray-100 tw:pt-4 tw:mt-4">
          <div className="tw:flex tw:items-center tw:justify-between tw:mb-3">
            <h5 className="tw:text-sm tw:font-semibold tw:text-gray-700">Box 14 — Other</h5>
            <button type="button" onClick={addBox14} className="tw:text-xs tw:font-medium tw:text-indigo-600 hover:tw:text-indigo-700">+ Add Entry</button>
          </div>
          {form.box14.length === 0 && <p className="tw:text-sm tw:text-gray-400">No Box 14 entries.</p>}
          {form.box14.map((entry, i) => (
            <div key={i} className="tw:flex tw:items-end tw:gap-3 tw:mb-3">
              <div className="tw:flex-1">
                <FormField label="Description" name={`box14_desc_${i}`} value={entry.description} onChange={(_, v) => updateBox14(i, 'description', v)} placeholder="e.g. Union dues" />
              </div>
              <div className="tw:w-40">
                <CurrencyField label="Amount" name={`box14_amt_${i}`} value={entry.amount} onChange={(_, v) => updateBox14(i, 'amount', v)} />
              </div>
              <button type="button" onClick={() => removeBox14(i)} className="tw:mb-4 tw:px-2 tw:py-1 tw:text-xs tw:text-rose-500 hover:tw:text-rose-700 tw:transition">Remove</button>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Notes ─── */}
      <section className="tw:bg-white tw:rounded-xl tw:border tw:border-gray-200 tw:p-5">
        <h4 className="tw:text-sm tw:font-semibold tw:text-gray-800 tw:mb-1">Internal Notes</h4>
        <p className="tw:text-xs tw:text-gray-400 tw:mb-4">These notes are not printed on the W-2 form.</p>
        <textarea value={form.notes} onChange={(e) => setField('notes', e.target.value)}
          className="tw:w-full tw:px-3 tw:py-2 tw:text-sm tw:border tw:border-gray-200 tw:rounded-lg focus:tw:outline-none focus:tw:ring-2 focus:tw:ring-indigo-500 tw:bg-white tw:min-h-20"
          placeholder="Internal notes about this document..." />
      </section>
    </div>
  )

  // ── PDF generation state ──
  const [pdfState, setPdfState] = useState({ generating: false, pdfUrl: null, pdfBytes: null, filename: '', error: null })

  const handleGeneratePdf = async () => {
    if (!form.templateId) {
      addNotification({ type: 'error', title: 'No Template', message: 'Select a template before generating PDF.' })
      return
    }
    setPdfState({ generating: true, pdfUrl: null, pdfBytes: null, filename: '', error: null })
    try {
      const result = await generatePdf(previewDoc, form.templateId)
      const url = createPdfUrl(result.pdfBytes)
      setPdfState({ generating: false, pdfUrl: url, pdfBytes: result.pdfBytes, filename: result.filename, error: null })
    } catch (err) {
      setPdfState({ generating: false, pdfUrl: null, pdfBytes: null, filename: '', error: err.message })
    }
  }

  const handleDownloadPdf = () => {
    if (pdfState.pdfBytes && pdfState.filename) {
      downloadPdf(pdfState.pdfBytes, pdfState.filename)
    }
  }

  // ── Step 6: Editable Preview & PDF Generation ──
  const renderPreviewStep = () => (
    <div>
      <h3 className="tw:text-lg tw:font-semibold tw:text-gray-900 tw:mb-1">Review, Edit & Generate PDF</h3>
      <p className="tw:text-sm tw:text-gray-500 tw:mb-5">
        Review the document below. Edit any field directly, then generate the final PDF.
      </p>

      {formWarnings.length > 0 && (
        <div className="tw:mb-5 tw:p-4 tw:bg-amber-50 tw:border tw:border-amber-200 tw:rounded-lg">
          <div className="tw:flex tw:items-center tw:gap-2 tw:mb-2">
            <AlertTriangle className="tw:h-4 tw:w-4 tw:text-amber-600" />
            <h4 className="tw:text-sm tw:font-semibold tw:text-amber-800">Warnings</h4>
          </div>
          <ul className="tw:list-disc tw:list-inside tw:space-y-1">
            {formWarnings.map((w, i) => <li key={i} className="tw:text-xs tw:text-amber-700">{w}</li>)}
          </ul>
        </div>
      )}

      {/* Quick-edit panel for key fields */}
      <div className="tw:mb-5 tw:p-4 tw:bg-white tw:border tw:border-gray-200 tw:rounded-xl">
        <h4 className="tw:text-sm tw:font-semibold tw:text-gray-800 tw:mb-3">Quick Edit</h4>
        <div className="tw:grid tw:grid-cols-1 sm:tw:grid-cols-2 lg:tw:grid-cols-3 tw:gap-x-4 tw:gap-y-2">
          <CurrencyField label="Box 1 — Wages" name="box1_wagesTips" value={form.box1_wagesTips} onChange={setCurrencyField} />
          <CurrencyField label="Box 2 — Federal Tax" name="box2_federalTaxWithheld" value={form.box2_federalTaxWithheld} onChange={setCurrencyField} />
          <CurrencyField label="Box 3 — SS Wages" name="box3_socialSecurityWages" value={form.box3_socialSecurityWages} onChange={setCurrencyField} />
          <CurrencyField label="Box 4 — SS Tax" name="box4_socialSecurityTax" value={form.box4_socialSecurityTax} onChange={setCurrencyField} />
          <CurrencyField label="Box 5 — Medicare Wages" name="box5_medicareWages" value={form.box5_medicareWages} onChange={setCurrencyField} />
          <CurrencyField label="Box 6 — Medicare Tax" name="box6_medicareTax" value={form.box6_medicareTax} onChange={setCurrencyField} />
          <FormField label="Control Number" name="controlNumber" value={form.controlNumber} onChange={(_, v) => setField('controlNumber', v)} placeholder="Optional" />
          {form.stateLocal[0] && (
            <>
              <CurrencyField label="Box 16 — State Wages" name="sl_sw_preview" value={form.stateLocal[0].stateWages} onChange={(_, v) => updateStateLocal(0, 'stateWages', v)} />
              <CurrencyField label="Box 17 — State Tax" name="sl_st_preview" value={form.stateLocal[0].stateTax} onChange={(_, v) => updateStateLocal(0, 'stateTax', v)} />
            </>
          )}
        </div>
      </div>

      {/* Template preview */}
      {form.templateId && getTemplate(form.templateId) ? (
        <div className="tw:border tw:border-gray-200 tw:rounded-lg tw:overflow-hidden tw:bg-gray-50 tw:p-4">
          <TemplateRenderer templateId={form.templateId} doc={previewDoc} />
        </div>
      ) : (
        <W2Preview doc={previewDoc} />
      )}

      {/* PDF Generation */}
      <div className="tw:mt-6 tw:p-4 tw:bg-gray-50 tw:border tw:border-gray-200 tw:rounded-xl">
        <div className="tw:flex tw:items-center tw:justify-between tw:mb-3">
          <h4 className="tw:text-sm tw:font-semibold tw:text-gray-800">PDF Generation</h4>
          <div className="tw:flex tw:gap-2">
            <button onClick={handleGeneratePdf} disabled={pdfState.generating || !form.templateId}
              className="tw:flex tw:items-center tw:gap-2 tw:px-4 tw:py-2 tw:text-sm tw:font-medium tw:text-white tw:bg-emerald-600 tw:rounded-lg hover:tw:bg-emerald-700 tw:transition disabled:tw:opacity-50">
              {pdfState.generating ? <Loader2 className="tw:h-4 tw:w-4 tw:animate-spin" /> : <Eye className="tw:h-4 tw:w-4" />}
              {pdfState.generating ? 'Generating...' : 'Generate PDF'}
            </button>
            {pdfState.pdfBytes && (
              <button onClick={handleDownloadPdf}
                className="tw:flex tw:items-center tw:gap-2 tw:px-4 tw:py-2 tw:text-sm tw:font-medium tw:text-white tw:bg-indigo-600 tw:rounded-lg hover:tw:bg-indigo-700 tw:transition">
                <Download className="tw:h-4 tw:w-4" /> Download PDF
              </button>
            )}
          </div>
        </div>
        {pdfState.error && (
          <div className="tw:p-3 tw:bg-rose-50 tw:border tw:border-rose-200 tw:rounded-lg tw:text-sm tw:text-rose-700">{pdfState.error}</div>
        )}
        {pdfState.pdfUrl && (
          <div className="tw:mt-3 tw:border tw:border-gray-300 tw:rounded-lg tw:overflow-hidden" style={{ height: '600px' }}>
            <iframe src={pdfState.pdfUrl} title="PDF Preview" className="tw:w-full tw:h-full" />
          </div>
        )}
      </div>

      {/* Save buttons */}
      <div className="tw:flex tw:flex-wrap tw:gap-3 tw:mt-6 tw:justify-end">
        <button onClick={() => handleSave('draft')}
          className="tw:px-5 tw:py-2.5 tw:text-sm tw:font-medium tw:text-gray-700 tw:bg-white tw:border tw:border-gray-300 tw:rounded-lg hover:tw:bg-gray-50 tw:transition">
          Save as Draft
        </button>
        <button onClick={() => handleSave('pending')}
          className="tw:px-5 tw:py-2.5 tw:text-sm tw:font-medium tw:text-amber-700 tw:bg-amber-50 tw:border tw:border-amber-200 tw:rounded-lg hover:tw:bg-amber-100 tw:transition">
          Save as Pending
        </button>
        <button onClick={() => handleSave('completed')}
          className="tw:px-5 tw:py-2.5 tw:text-sm tw:font-medium tw:text-white tw:bg-indigo-600 tw:rounded-lg hover:tw:bg-indigo-700 tw:transition">
          Mark as Completed
        </button>
      </div>
    </div>
  )

  const renderStep = () => {
    switch (step) {
      case 0: return renderCompanyStep()
      case 1: return renderEmployeeStep()
      case 2: return renderYearStep()
      case 3: return renderTemplateStep()
      case 4: return renderTaxDataStep()
      case 5: return renderPreviewStep()
      default: return null
    }
  }

  // ═══════════════════════════════════════════════════════════════
  //  MAIN RENDER
  // ═══════════════════════════════════════════════════════════════

  const pageTitle = isEditing ? 'Edit W-2 Document' : isDuplicating ? 'Duplicate W-2 Document' : 'New W-2 Document'

  return (
    <div>
      <PageHeader title={pageTitle} description="Complete each step to build a W-2 form">
        <button onClick={() => navigate('/w2-documents')}
          className="tw:flex tw:items-center tw:gap-2 tw:px-4 tw:py-2 tw:text-sm tw:font-medium tw:text-gray-700 tw:bg-white tw:border tw:border-gray-300 tw:rounded-lg hover:tw:bg-gray-50 tw:transition">
          <ArrowLeft className="tw:h-4 tw:w-4" /> Back to Documents
        </button>
      </PageHeader>

      {/* Step indicator */}
      <div className="tw:flex tw:items-center tw:gap-1 tw:mb-6 tw:overflow-x-auto tw:pb-2">
        {STEPS.map((s, i) => {
          const Icon = s.icon
          const isActive = i === step
          const isDone = i < step
          return (
            <button key={s.id}
              onClick={() => { if (isDone || isActive) setStep(i) }}
              className={`tw:flex tw:items-center tw:gap-2 tw:px-3 tw:py-2 tw:rounded-lg tw:text-xs tw:font-medium tw:transition tw:whitespace-nowrap ${
                isActive ? 'tw:bg-indigo-600 tw:text-white' :
                isDone ? 'tw:bg-indigo-50 tw:text-indigo-700 hover:tw:bg-indigo-100 tw:cursor-pointer' :
                'tw:bg-gray-100 tw:text-gray-400'
              }`}
              disabled={!isDone && !isActive}>
              <Icon className="tw:h-3.5 tw:w-3.5" />
              {s.label}
            </button>
          )
        })}
      </div>

      {/* Step content */}
      <div className="tw:mb-6">{renderStep()}</div>

      {/* Navigation */}
      {step < 5 && (
        <div className="tw:flex tw:justify-between tw:pt-4 tw:border-t tw:border-gray-200">
          <button
            onClick={() => step > 0 ? setStep(step - 1) : navigate('/w2-documents')}
            className="tw:flex tw:items-center tw:gap-2 tw:px-4 tw:py-2 tw:text-sm tw:font-medium tw:text-gray-700 tw:bg-white tw:border tw:border-gray-300 tw:rounded-lg hover:tw:bg-gray-50 tw:transition">
            <ArrowLeft className="tw:h-4 tw:w-4" />
            {step === 0 ? 'Cancel' : 'Previous'}
          </button>
          <div className="tw:flex tw:gap-3">
            {step >= 4 && form.companyId && form.employeeId && (
              <button onClick={() => handleSave('draft')}
                className="tw:flex tw:items-center tw:gap-2 tw:px-4 tw:py-2 tw:text-sm tw:font-medium tw:text-gray-700 tw:bg-white tw:border tw:border-gray-300 tw:rounded-lg hover:tw:bg-gray-50 tw:transition">
                <Save className="tw:h-4 tw:w-4" /> Save Draft
              </button>
            )}
            <button onClick={handleNext} disabled={!canProceed()}
              className="tw:flex tw:items-center tw:gap-2 tw:px-4 tw:py-2 tw:text-sm tw:font-medium tw:text-white tw:bg-indigo-600 tw:rounded-lg hover:tw:bg-indigo-700 tw:transition disabled:tw:opacity-50 disabled:tw:cursor-not-allowed">
              {step === 4 ? 'Review' : 'Next'}
              {step === 4 ? <Eye className="tw:h-4 tw:w-4" /> : <ArrowRight className="tw:h-4 tw:w-4" />}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
