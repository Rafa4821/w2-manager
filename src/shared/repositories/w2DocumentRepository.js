import { createRepository } from './createRepository'
import { w2DocumentSchema, w2DocumentCreateSchema } from '../schemas'

const base = createRepository('w2Documents', {
  schema: w2DocumentSchema,
  createSchema: w2DocumentCreateSchema,
})

export const w2DocumentRepository = {
  ...base,

  getByCompany(companyId) {
    return base.filter((d) => d.companyId === companyId)
  },

  getByEmployee(employeeId) {
    return base.filter((d) => d.employeeId === employeeId)
  },

  getByTaxYear(year) {
    return base.filter((d) => d.taxYear === year)
  },

  getByStatus(status) {
    return base.filter((d) => d.status === status)
  },

  getDrafts() {
    return base.filter((d) => d.status === 'draft')
  },

  searchDocuments(query) {
    return base.search(query, [
      'controlNumber',
      'notes',
    ])
  },

  /** Check if a document already exists for this employee + tax year. */
  findDuplicate(employeeId, taxYear, excludeId = null) {
    return base.filter(
      (d) =>
        d.employeeId === employeeId &&
        d.taxYear === taxYear &&
        d.id !== excludeId
    )
  },

  /** Refresh company/employee snapshots on an existing document. */
  refreshSnapshots(docId, companySnapshot, employeeSnapshot) {
    return base.update(docId, { companySnapshot, employeeSnapshot })
  },
}
