import { create } from 'zustand'
import { employeeRepository } from '../../../shared/repositories'

export const useEmployeesStore = create((set) => ({
  employees: [],
  error: null,

  load() {
    try {
      const employees = employeeRepository.getAll()
      set({ employees, error: null })
    } catch (err) {
      set({ error: err.message })
    }
  },

  create(data) {
    try {
      const created = employeeRepository.create(data)
      set({ employees: employeeRepository.getAll(), error: null })
      return created
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  update(id, data) {
    try {
      const updated = employeeRepository.update(id, data)
      set({ employees: employeeRepository.getAll(), error: null })
      return updated
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  remove(id) {
    try {
      const removed = employeeRepository.remove(id)
      set({ employees: employeeRepository.getAll(), error: null })
      return removed
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  getByCompany(companyId) {
    return employeeRepository.getByCompany(companyId)
  },

  getActiveByCompany(companyId) {
    return employeeRepository.getActiveByCompany(companyId)
  },

  search(query) {
    return employeeRepository.searchEmployees(query)
  },
}))
