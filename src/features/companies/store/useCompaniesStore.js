import { create } from 'zustand'
import { companyRepository } from '../../../shared/repositories'

export const useCompaniesStore = create((set) => ({
  companies: [],
  loading: false,
  error: null,

  load() {
    try {
      const companies = companyRepository.getAll()
      set({ companies, error: null })
    } catch (err) {
      set({ error: err.message })
    }
  },

  create(data) {
    try {
      const created = companyRepository.create(data)
      set({ companies: companyRepository.getAll(), error: null })
      return created
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  update(id, data) {
    try {
      const updated = companyRepository.update(id, data)
      set({ companies: companyRepository.getAll(), error: null })
      return updated
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  remove(id) {
    try {
      const removed = companyRepository.remove(id)
      set({ companies: companyRepository.getAll(), error: null })
      return removed
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  getById(id) {
    return companyRepository.getById(id)
  },

  getActive() {
    return companyRepository.getActive()
  },

  search(query) {
    return companyRepository.searchCompanies(query)
  },
}))
