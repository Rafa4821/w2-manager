import { createRepository } from './createRepository'
import { employeeSchema, employeeCreateSchema } from '../schemas'

const base = createRepository('employees', {
  schema: employeeSchema,
  createSchema: employeeCreateSchema,
})

export const employeeRepository = {
  ...base,

  getByCompany(companyId) {
    return base.filter((e) => e.companyId === companyId)
  },

  getActive() {
    return base.filter((e) => e.status === 'active')
  },

  getActiveByCompany(companyId) {
    return base.filter((e) => e.companyId === companyId && e.status === 'active')
  },

  searchEmployees(query) {
    return base.search(query, ['firstName', 'lastName', 'email', 'position', 'department', 'ssn'])
  },

  /** Build the snapshot object for embedding in a W2 document. */
  createSnapshot(employeeId) {
    const emp = base.getById(employeeId)
    if (!emp) throw new Error(`Employee not found: ${employeeId}`)
    return {
      id: emp.id,
      firstName: emp.firstName,
      middleInitial: emp.middleInitial || '',
      lastName: emp.lastName,
      suffix: emp.suffix || '',
      ssn: emp.ssn,
      address: emp.address,
      address2: emp.address2 || '',
      city: emp.city,
      state: emp.state,
      zipCode: emp.zipCode,
    }
  },
}
