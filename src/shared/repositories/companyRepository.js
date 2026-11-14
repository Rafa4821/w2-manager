import { createRepository } from './createRepository'
import { companySchema, companyCreateSchema } from '../schemas'

const base = createRepository('companies', {
  schema: companySchema,
  createSchema: companyCreateSchema,
})

export const companyRepository = {
  ...base,

  getActive() {
    return base.filter((c) => c.status === 'active')
  },

  getByState(state) {
    return base.filter((c) => c.state === state)
  },

  searchCompanies(query) {
    return base.search(query, ['name', 'ein', 'city', 'state', 'email'])
  },

  getEmployeeCount(companyId, employeeRepo) {
    return employeeRepo.filter((e) => e.companyId === companyId).length
  },
}
