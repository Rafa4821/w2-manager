import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Save, Eye, Building2, Users, Calendar, FileText, DollarSign, CheckCircle2 } from 'lucide-react'
import { PageHeader, FormField } from '../../../shared/components'
import { useNotificationStore } from '../../../shared/store'
import { useCompaniesStore } from '../../companies/store/useCompaniesStore'
import { useEmployeesStore } from '../../employees/store/useEmployeesStore'
import { useW2DocumentsStore } from '../store/useW2DocumentsStore'
import { companyRepository } from '../../../shared/repositories/companyRepository'
import { employeeRepository } from '../../../shared/repositories/employeeRepository'
import { w2DocumentRepository } from '../../../shared/repositories/w2DocumentRepository'
import { mockTemplates } from '../../../shared/data'
import { BOX_12_CODES, W2_BOX_LABELS } from '../../../shared/schemas/w2Document'
import { W2Preview } from './W2Preview'

const STEPS = [
  { id: 'company', label: 'Employer', icon: Building2 },
  { id: 'employee', label: 'Employee', icon: Users },
  { id: 'year', label: 'Tax Year', icon: Calendar },
  { id: 'template', label: 'Template', icon: FileText },
  { id: 'wages', label: 'Wages & Tax', icon: DollarSign },
  { id: 'preview', label: 'Review', icon: CheckCircle2 },
]

const CURRENT_YEAR = new Date().getFullYear()
const TAX_YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i)

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
    stateLocal: [{ state: '', employerStateId: '', stateWages: 0, stateTax: 0, localWages: 0, localTax: 0, localityName: '' }],
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
    stateLocal: doc.stateLocal?.length ? doc.stateLocal : [{ state: '', employerStateId: '', stateWages: 0, stateTax: 0, localWages: 0, localTax: 0, localityName: '' }],
    status: doc.status,
    notes: doc.notes || '',
  }
}

export function W2EditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = !!id
  const addNotification = useNotificationStore((s) => s.addNotification)
  const { companies, load: loadCompanies } = useCompaniesStore()
  const { employees, load: loadEmployees } = useEmployeesStore()
  const { create, update, load: loadDocs } = useW2DocumentsStore()

  // Lazy initialization: read from repository directly (no setState in effect)
  const [step, setStep] = useState(() => {
    if (isEditing) {
      const doc = w2DocumentRepository.getById(id)
      return doc ? 4 : 0
    }
    return 0
  })
  const [form, setForm] = useState(() => {
    if (isEditing) {
      const doc = w2DocumentRepository.getById(id)
      if (doc) return docToForm(doc)
    }
    return emptyFormData()
  })
  const [notFound] = useState(() => isEditing && !w2DocumentRepository.getById(id))

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

  const selectedCompany = useMemo(
    () => companies.find((c) => c.id === form.companyId),
    [companies, form.companyId]
  )
  const selectedEmployee = useMemo(
    () => employees.find((e) => e.id === form.employeeId),
    [employees, form.employeeId]
  )
  const companyEmployees = useMemo(
    () => employees.filter((e) => e.companyId === form.companyId && e.status === 'active'),
    [employees, form.companyId]
  )

  const setField = (name, value) => setForm((prev) => ({ ...prev, [name]: value }))
  const setNumField = (name, value) => setForm((prev) => ({ ...prev, [name]: Number(value) || 0 }))

  // ── Box 12 helpers ──
  const addBox12 = () => {
    if (form.box12.length >= 4) return
    setForm((prev) => ({ ...prev, box12: [...prev.box12, { code: '', amount: 0 }] }))
  }
  const updateBox12 = (index, field, value) => {
    setForm((prev) => {
      const arr = [...prev.box12]
      arr[index] = { ...arr[index], [field]: field === 'amount' ? (Number(value) || 0) : value }
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
      arr[index] = { ...arr[index], [field]: field === 'amount' ? (Number(value) || 0) : value }
      return { ...prev, box14: arr }
    })
  }
  const removeBox14 = (index) => {
    setForm((prev) => ({ ...prev, box14: prev.box14.filter((_, i) => i !== index) }))
  }

  // ── State/Local helpers ──
  const updateStateLocal = (index, field, value) => {
    setForm((prev) => {
      const arr = [...prev.stateLocal]
      arr[index] = {
        ...arr[index],
        [field]: ['stateWages', 'stateTax', 'localWages', 'localTax'].includes(field) ? (Number(value) || 0) : value,
      }
      return { ...prev, stateLocal: arr }
    })
  }
  const addStateLocal = () => {
    if (form.stateLocal.length >= 2) return
    setForm((prev) => ({
      ...prev,
      stateLocal: [...prev.stateLocal, { state: '', employerStateId: '', stateWages: 0, stateTax: 0, localWages: 0, localTax: 0, localityName: '' }],
    }))
  }
  const removeStateLocal = (index) => {
    setForm((prev) => ({ ...prev, stateLocal: prev.stateLocal.filter((_, i) => i !== index) }))
  }

  // ── Auto-fill wages ──
  const autoFillFromBox1 = () => {
    const wages = form.box1_wagesTips
    const ssLimit = 168600 // 2024 SS wage base
    setForm((prev) => ({
      ...prev,
      box3_socialSecurityWages: Math.min(wages, ssLimit),
      box4_socialSecurityTax: Math.round(Math.min(wages, ssLimit) * 0.062 * 100) / 100,
      box5_medicareWages: wages,
      box6_medicareTax: Math.round(wages * 0.0145 * 100) / 100,
    }))
  }

  // ── Save ──
  const handleSave = (saveStatus) => {
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
          id: companySnap.id,
          name: companySnap.name,
          ein: companySnap.ein,
          address: companySnap.address,
          address2: companySnap.address2 || '',
          city: companySnap.city,
          state: companySnap.state,
          zipCode: companySnap.zipCode,
          stateEmployerId: companySnap.stateEmployerId || '',
          contactName: companySnap.contactName || '',
        },
        employeeSnapshot: {
          id: employeeSnap.id,
          firstName: employeeSnap.firstName,
          middleInitial: employeeSnap.middleInitial || '',
          lastName: employeeSnap.lastName,
          suffix: employeeSnap.suffix || '',
          ssn: employeeSnap.ssn,
          address: employeeSnap.address,
          address2: employeeSnap.address2 || '',
          city: employeeSnap.city,
          state: employeeSnap.state,
          zipCode: employeeSnap.zipCode,
        },
        // Filter out empty stateLocal entries
        stateLocal: form.stateLocal.filter((sl) => sl.state || sl.stateWages || sl.stateTax || sl.localWages || sl.localTax),
        // Filter out empty box12 entries
        box12: form.box12.filter((b) => b.code),
        box14: form.box14.filter((b) => b.description),
      }

      if (isEditing) {
        update(id, docData)
        addNotification({ type: 'success', title: 'Document Updated', message: `W2 document saved as ${saveStatus}.` })
      } else {
        create(docData)
        addNotification({ type: 'success', title: 'Document Created', message: `W2 document created as ${saveStatus}.` })
      }
      navigate('/w2-documents')
    } catch (err) {
      addNotification({ type: 'error', title: 'Save Error', message: err.message })
    }
  }

  const canProceed = () => {
    switch (step) {
      case 0: return !!form.companyId
      case 1: return !!form.employeeId
      case 2: return !!form.taxYear
      case 3: return true // template is optional
      case 4: return form.box1_wagesTips > 0
      default: return true
    }
  }

  // ── Build document object for preview ──
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

  // ── Render steps ──
  const renderStep = () => {
    switch (step) {
      case 0: return renderCompanyStep()
      case 1: return renderEmployeeStep()
      case 2: return renderYearStep()
      case 3: return renderTemplateStep()
      case 4: return renderWagesStep()
      case 5: return renderPreviewStep()
      default: return null
    }
  }

  // ── Step 1: Select Company ──
  const renderCompanyStep = () => {
    const activeCompanies = companies.filter((c) => c.status === 'active')
    return (
      <div>
        <h3 className="tw:text-lg tw:font-semibold tw:text-gray-900 tw:mb-1">Select Employer</h3>
        <p className="tw:text-sm tw:text-gray-500 tw:mb-5">Choose the employer company for this W-2 document.</p>
        <div className="tw:grid tw:grid-cols-1 md:tw:grid-cols-2 tw:gap-3">
          {activeCompanies.map((c) => (
            <button
              key={c.id}
              onClick={() => { setField('companyId', c.id); setField('employeeId', '') }}
              className={`tw:text-left tw:p-4 tw:rounded-xl tw:border-2 tw:transition ${
                form.companyId === c.id
                  ? 'tw:border-indigo-500 tw:bg-indigo-50'
                  : 'tw:border-gray-200 hover:tw:border-gray-300 tw:bg-white'
              }`}
            >
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
      <p className="tw:text-sm tw:text-gray-500 tw:mb-5">
        Showing active employees of <strong>{selectedCompany?.name}</strong>.
      </p>
      <div className="tw:grid tw:grid-cols-1 md:tw:grid-cols-2 tw:gap-3">
        {companyEmployees.map((e) => (
          <button
            key={e.id}
            onClick={() => setField('employeeId', e.id)}
            className={`tw:text-left tw:p-4 tw:rounded-xl tw:border-2 tw:transition ${
              form.employeeId === e.id
                ? 'tw:border-indigo-500 tw:bg-indigo-50'
                : 'tw:border-gray-200 hover:tw:border-gray-300 tw:bg-white'
            }`}
          >
            <div className="tw:flex tw:items-center tw:gap-3">
              <div className={`tw:flex tw:items-center tw:justify-center tw:h-9 tw:w-9 tw:rounded-full tw:text-xs tw:font-semibold ${
                form.employeeId === e.id ? 'tw:bg-indigo-100 tw:text-indigo-700' : 'tw:bg-gray-100 tw:text-gray-600'
              }`}>
                {e.firstName[0]}{e.lastName[0]}
              </div>
              <div>
                <p className="tw:font-medium tw:text-gray-900">{e.firstName} {e.lastName}</p>
                <p className="tw:text-xs tw:text-gray-500">{e.position || 'No position'} &middot; SSN: {e.ssn}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
      {companyEmployees.length === 0 && (
        <p className="tw:text-center tw:text-gray-500 tw:py-8">No active employees for this company.</p>
      )}
    </div>
  )

  // ── Step 3: Tax Year ──
  const renderYearStep = () => (
    <div>
      <h3 className="tw:text-lg tw:font-semibold tw:text-gray-900 tw:mb-1">Select Tax Year</h3>
      <p className="tw:text-sm tw:text-gray-500 tw:mb-5">Choose the fiscal year for this W-2.</p>
      <div className="tw:grid tw:grid-cols-2 sm:tw:grid-cols-3 md:tw:grid-cols-5 tw:gap-3">
        {TAX_YEARS.map((year) => (
          <button
            key={year}
            onClick={() => setField('taxYear', year)}
            className={`tw:p-4 tw:rounded-xl tw:border-2 tw:text-center tw:font-semibold tw:text-lg tw:transition ${
              form.taxYear === year
                ? 'tw:border-indigo-500 tw:bg-indigo-50 tw:text-indigo-700'
                : 'tw:border-gray-200 hover:tw:border-gray-300 tw:text-gray-700 tw:bg-white'
            }`}
          >
            {year}
          </button>
        ))}
      </div>
      <div className="tw:mt-4">
        <FormField label="Control Number (Box d)" name="controlNumber" value={form.controlNumber} onChange={(_, v) => setField('controlNumber', v)} placeholder="Optional employer reference" />
      </div>
    </div>
  )

  // ── Step 4: Template (optional) ──
  const renderTemplateStep = () => (
    <div>
      <h3 className="tw:text-lg tw:font-semibold tw:text-gray-900 tw:mb-1">Choose a Template</h3>
      <p className="tw:text-sm tw:text-gray-500 tw:mb-5">Optionally select a template. You can skip this step.</p>
      <div className="tw:grid tw:grid-cols-1 md:tw:grid-cols-2 tw:gap-3">
        <button
          onClick={() => setField('templateId', '')}
          className={`tw:text-left tw:p-4 tw:rounded-xl tw:border-2 tw:transition ${
            !form.templateId
              ? 'tw:border-indigo-500 tw:bg-indigo-50'
              : 'tw:border-gray-200 hover:tw:border-gray-300 tw:bg-white'
          }`}
        >
          <p className="tw:font-medium tw:text-gray-900">Blank Form</p>
          <p className="tw:text-xs tw:text-gray-500">Start with an empty W-2 form</p>
        </button>
        {mockTemplates.map((t) => (
          <button
            key={t.id}
            onClick={() => setField('templateId', t.id)}
            className={`tw:text-left tw:p-4 tw:rounded-xl tw:border-2 tw:transition ${
              form.templateId === t.id
                ? 'tw:border-indigo-500 tw:bg-indigo-50'
                : 'tw:border-gray-200 hover:tw:border-gray-300 tw:bg-white'
            }`}
          >
            <p className="tw:font-medium tw:text-gray-900">{t.name}</p>
            <p className="tw:text-xs tw:text-gray-500">{t.description}</p>
          </button>
        ))}
      </div>
    </div>
  )

  // ── Step 5: Wages & Tax (all boxes) ──
  const renderWagesStep = () => (
    <div className="tw:space-y-6">
      <div>
        <h3 className="tw:text-lg tw:font-semibold tw:text-gray-900 tw:mb-1">Wages, Tax & Benefits</h3>
        <p className="tw:text-sm tw:text-gray-500 tw:mb-4">Fill in the W-2 numbered boxes. All amounts in USD.</p>
      </div>

      {/* Boxes 1–6 (main wages) */}
      <section className="tw:bg-white tw:rounded-xl tw:border tw:border-gray-200 tw:p-5">
        <div className="tw:flex tw:items-center tw:justify-between tw:mb-4">
          <h4 className="tw:text-sm tw:font-semibold tw:text-gray-800">Primary Wages & Withholding</h4>
          <button
            type="button"
            onClick={autoFillFromBox1}
            className="tw:text-xs tw:font-medium tw:text-indigo-600 hover:tw:text-indigo-700 tw:transition"
          >
            Auto-calculate SS/Medicare from Box 1
          </button>
        </div>
        <div className="tw:grid tw:grid-cols-1 sm:tw:grid-cols-2 tw:gap-x-4">
          {Object.entries(W2_BOX_LABELS).slice(0, 6).map(([key, label]) => (
            <FormField key={key} label={label} name={key} type="number" value={form[key]} onChange={(_, v) => setNumField(key, v)} placeholder="0.00" />
          ))}
        </div>
      </section>

      {/* Boxes 7–11 */}
      <section className="tw:bg-white tw:rounded-xl tw:border tw:border-gray-200 tw:p-5">
        <h4 className="tw:text-sm tw:font-semibold tw:text-gray-800 tw:mb-4">Additional Compensation</h4>
        <div className="tw:grid tw:grid-cols-1 sm:tw:grid-cols-2 tw:gap-x-4">
          {Object.entries(W2_BOX_LABELS).slice(6).map(([key, label]) => (
            <FormField key={key} label={label} name={key} type="number" value={form[key]} onChange={(_, v) => setNumField(key, v)} placeholder="0.00" />
          ))}
        </div>
      </section>

      {/* Box 12 */}
      <section className="tw:bg-white tw:rounded-xl tw:border tw:border-gray-200 tw:p-5">
        <div className="tw:flex tw:items-center tw:justify-between tw:mb-4">
          <h4 className="tw:text-sm tw:font-semibold tw:text-gray-800">Box 12 — Coded Entries (up to 4)</h4>
          {form.box12.length < 4 && (
            <button type="button" onClick={addBox12} className="tw:text-xs tw:font-medium tw:text-indigo-600 hover:tw:text-indigo-700">+ Add Entry</button>
          )}
        </div>
        {form.box12.length === 0 && <p className="tw:text-sm tw:text-gray-400">No Box 12 entries. Click "Add Entry" to include one.</p>}
        {form.box12.map((entry, i) => (
          <div key={i} className="tw:flex tw:items-end tw:gap-3 tw:mb-3">
            <div className="tw:flex-1">
              <FormField
                label={`12${String.fromCharCode(97 + i)} Code`}
                name={`box12_code_${i}`}
                type="select"
                value={entry.code}
                onChange={(_, v) => updateBox12(i, 'code', v)}
                options={Object.entries(BOX_12_CODES).map(([code, desc]) => ({ value: code, label: `${code} — ${desc.substring(0, 50)}${desc.length > 50 ? '...' : ''}` }))}
                placeholder="Select code"
              />
            </div>
            <div className="tw:w-36">
              <FormField label="Amount" name={`box12_amt_${i}`} type="number" value={entry.amount} onChange={(_, v) => updateBox12(i, 'amount', v)} placeholder="0.00" />
            </div>
            <button type="button" onClick={() => removeBox12(i)} className="tw:mb-4 tw:px-2 tw:py-1 tw:text-xs tw:text-rose-500 hover:tw:text-rose-700 tw:transition">Remove</button>
          </div>
        ))}
      </section>

      {/* Box 13 */}
      <section className="tw:bg-white tw:rounded-xl tw:border tw:border-gray-200 tw:p-5">
        <h4 className="tw:text-sm tw:font-semibold tw:text-gray-800 tw:mb-4">Box 13 — Checkboxes</h4>
        <div className="tw:space-y-3">
          {[
            { key: 'box13_statutoryEmployee', label: 'Statutory employee' },
            { key: 'box13_retirementPlan', label: 'Retirement plan' },
            { key: 'box13_thirdPartySickPay', label: 'Third-party sick pay' },
          ].map(({ key, label }) => (
            <label key={key} className="tw:flex tw:items-center tw:gap-3 tw:cursor-pointer">
              <input
                type="checkbox"
                checked={form[key]}
                onChange={(e) => setField(key, e.target.checked)}
                className="tw:h-4 tw:w-4 tw:rounded tw:border-gray-300 tw:text-indigo-600 focus:tw:ring-indigo-500"
              />
              <span className="tw:text-sm tw:text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </section>

      {/* Box 14 */}
      <section className="tw:bg-white tw:rounded-xl tw:border tw:border-gray-200 tw:p-5">
        <div className="tw:flex tw:items-center tw:justify-between tw:mb-4">
          <h4 className="tw:text-sm tw:font-semibold tw:text-gray-800">Box 14 — Other</h4>
          <button type="button" onClick={addBox14} className="tw:text-xs tw:font-medium tw:text-indigo-600 hover:tw:text-indigo-700">+ Add Entry</button>
        </div>
        {form.box14.length === 0 && <p className="tw:text-sm tw:text-gray-400">No Box 14 entries.</p>}
        {form.box14.map((entry, i) => (
          <div key={i} className="tw:flex tw:items-end tw:gap-3 tw:mb-3">
            <div className="tw:flex-1">
              <FormField label="Description" name={`box14_desc_${i}`} value={entry.description} onChange={(_, v) => updateBox14(i, 'description', v)} placeholder="e.g. Union dues" />
            </div>
            <div className="tw:w-36">
              <FormField label="Amount" name={`box14_amt_${i}`} type="number" value={entry.amount} onChange={(_, v) => updateBox14(i, 'amount', v)} placeholder="0.00" />
            </div>
            <button type="button" onClick={() => removeBox14(i)} className="tw:mb-4 tw:px-2 tw:py-1 tw:text-xs tw:text-rose-500 hover:tw:text-rose-700 tw:transition">Remove</button>
          </div>
        ))}
      </section>

      {/* Boxes 15–20: State & Local */}
      <section className="tw:bg-white tw:rounded-xl tw:border tw:border-gray-200 tw:p-5">
        <div className="tw:flex tw:items-center tw:justify-between tw:mb-4">
          <h4 className="tw:text-sm tw:font-semibold tw:text-gray-800">Boxes 15–20 — State & Local Tax</h4>
          {form.stateLocal.length < 2 && (
            <button type="button" onClick={addStateLocal} className="tw:text-xs tw:font-medium tw:text-indigo-600 hover:tw:text-indigo-700">+ Add State</button>
          )}
        </div>
        {form.stateLocal.map((sl, i) => (
          <div key={i} className="tw:mb-4 tw:p-4 tw:bg-gray-50 tw:rounded-lg">
            <div className="tw:flex tw:items-center tw:justify-between tw:mb-2">
              <span className="tw:text-xs tw:font-semibold tw:text-gray-500 tw:uppercase">State Entry {i + 1}</span>
              {form.stateLocal.length > 1 && (
                <button type="button" onClick={() => removeStateLocal(i)} className="tw:text-xs tw:text-rose-500 hover:tw:text-rose-700">Remove</button>
              )}
            </div>
            <div className="tw:grid tw:grid-cols-2 sm:tw:grid-cols-3 tw:gap-x-4">
              <FormField label="15 — State" name={`sl_state_${i}`} value={sl.state} onChange={(_, v) => updateStateLocal(i, 'state', v)} placeholder="NY" />
              <FormField label="15 — Employer State ID" name={`sl_esid_${i}`} value={sl.employerStateId} onChange={(_, v) => updateStateLocal(i, 'employerStateId', v)} placeholder="State ID number" />
              <FormField label="16 — State Wages" name={`sl_sw_${i}`} type="number" value={sl.stateWages} onChange={(_, v) => updateStateLocal(i, 'stateWages', v)} placeholder="0.00" />
              <FormField label="17 — State Tax" name={`sl_st_${i}`} type="number" value={sl.stateTax} onChange={(_, v) => updateStateLocal(i, 'stateTax', v)} placeholder="0.00" />
              <FormField label="18 — Local Wages" name={`sl_lw_${i}`} type="number" value={sl.localWages} onChange={(_, v) => updateStateLocal(i, 'localWages', v)} placeholder="0.00" />
              <FormField label="19 — Local Tax" name={`sl_lt_${i}`} type="number" value={sl.localTax} onChange={(_, v) => updateStateLocal(i, 'localTax', v)} placeholder="0.00" />
              <FormField label="20 — Locality Name" name={`sl_loc_${i}`} value={sl.localityName} onChange={(_, v) => updateStateLocal(i, 'localityName', v)} placeholder="City / locality" />
            </div>
          </div>
        ))}
      </section>

      {/* Notes */}
      <section className="tw:bg-white tw:rounded-xl tw:border tw:border-gray-200 tw:p-5">
        <h4 className="tw:text-sm tw:font-semibold tw:text-gray-800 tw:mb-4">Notes</h4>
        <textarea
          value={form.notes}
          onChange={(e) => setField('notes', e.target.value)}
          className="tw:w-full tw:px-3 tw:py-2 tw:text-sm tw:border tw:border-gray-200 tw:rounded-lg focus:tw:outline-none focus:tw:ring-2 focus:tw:ring-indigo-500 tw:bg-white tw:min-h-20"
          placeholder="Internal notes about this document..."
        />
      </section>
    </div>
  )

  // ── Step 6: Preview & Save ──
  const renderPreviewStep = () => (
    <div>
      <h3 className="tw:text-lg tw:font-semibold tw:text-gray-900 tw:mb-1">Review & Save</h3>
      <p className="tw:text-sm tw:text-gray-500 tw:mb-5">Review the W-2 form before saving.</p>
      <W2Preview doc={previewDoc} />
      <div className="tw:flex tw:flex-wrap tw:gap-3 tw:mt-6 tw:justify-end">
        <button
          onClick={() => handleSave('draft')}
          className="tw:px-5 tw:py-2.5 tw:text-sm tw:font-medium tw:text-gray-700 tw:bg-white tw:border tw:border-gray-300 tw:rounded-lg hover:tw:bg-gray-50 tw:transition"
        >
          Save as Draft
        </button>
        <button
          onClick={() => handleSave('pending')}
          className="tw:px-5 tw:py-2.5 tw:text-sm tw:font-medium tw:text-amber-700 tw:bg-amber-50 tw:border tw:border-amber-200 tw:rounded-lg hover:tw:bg-amber-100 tw:transition"
        >
          Save as Pending Review
        </button>
        <button
          onClick={() => handleSave('completed')}
          className="tw:px-5 tw:py-2.5 tw:text-sm tw:font-medium tw:text-white tw:bg-indigo-600 tw:rounded-lg hover:tw:bg-indigo-700 tw:transition"
        >
          Mark as Completed
        </button>
      </div>
    </div>
  )

  return (
    <div>
      <PageHeader title={isEditing ? 'Edit W2 Document' : 'New W2 Document'} description="Complete each step to create a W-2 form">
        <button onClick={() => navigate('/w2-documents')} className="tw:flex tw:items-center tw:gap-2 tw:px-4 tw:py-2 tw:text-sm tw:font-medium tw:text-gray-700 tw:bg-white tw:border tw:border-gray-300 tw:rounded-lg hover:tw:bg-gray-50 tw:transition">
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
            <button
              key={s.id}
              onClick={() => { if (isDone || isActive) setStep(i) }}
              className={`tw:flex tw:items-center tw:gap-2 tw:px-3 tw:py-2 tw:rounded-lg tw:text-xs tw:font-medium tw:transition tw:whitespace-nowrap ${
                isActive ? 'tw:bg-indigo-600 tw:text-white' :
                isDone ? 'tw:bg-indigo-50 tw:text-indigo-700 hover:tw:bg-indigo-100 tw:cursor-pointer' :
                'tw:bg-gray-100 tw:text-gray-400'
              }`}
              disabled={!isDone && !isActive}
            >
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
            className="tw:flex tw:items-center tw:gap-2 tw:px-4 tw:py-2 tw:text-sm tw:font-medium tw:text-gray-700 tw:bg-white tw:border tw:border-gray-300 tw:rounded-lg hover:tw:bg-gray-50 tw:transition"
          >
            <ArrowLeft className="tw:h-4 tw:w-4" />
            {step === 0 ? 'Cancel' : 'Previous'}
          </button>
          <div className="tw:flex tw:gap-3">
            {step === 4 && (
              <button
                onClick={() => handleSave('draft')}
                className="tw:flex tw:items-center tw:gap-2 tw:px-4 tw:py-2 tw:text-sm tw:font-medium tw:text-gray-700 tw:bg-white tw:border tw:border-gray-300 tw:rounded-lg hover:tw:bg-gray-50 tw:transition"
              >
                <Save className="tw:h-4 tw:w-4" /> Save Draft
              </button>
            )}
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="tw:flex tw:items-center tw:gap-2 tw:px-4 tw:py-2 tw:text-sm tw:font-medium tw:text-white tw:bg-indigo-600 tw:rounded-lg hover:tw:bg-indigo-700 tw:transition disabled:tw:opacity-50 disabled:tw:cursor-not-allowed"
            >
              {step === 4 ? 'Review' : 'Next'}
              {step === 4 ? <Eye className="tw:h-4 tw:w-4" /> : <ArrowRight className="tw:h-4 tw:w-4" />}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
