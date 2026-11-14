import { create } from 'zustand'
import { w2DocumentRepository } from '../../../shared/repositories'

export const useW2DocumentsStore = create((set) => ({
  documents: [],
  error: null,

  load() {
    try {
      const documents = w2DocumentRepository.getAll()
      set({ documents, error: null })
    } catch (err) {
      set({ error: err.message })
    }
  },

  create(data) {
    try {
      const created = w2DocumentRepository.create(data)
      set({ documents: w2DocumentRepository.getAll(), error: null })
      return created
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  update(id, data) {
    try {
      const updated = w2DocumentRepository.update(id, data)
      set({ documents: w2DocumentRepository.getAll(), error: null })
      return updated
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  remove(id) {
    try {
      const removed = w2DocumentRepository.remove(id)
      set({ documents: w2DocumentRepository.getAll(), error: null })
      return removed
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  getById(id) {
    return w2DocumentRepository.getById(id)
  },

  getByCompany(companyId) {
    return w2DocumentRepository.getByCompany(companyId)
  },

  getByEmployee(employeeId) {
    return w2DocumentRepository.getByEmployee(employeeId)
  },

  getDrafts() {
    return w2DocumentRepository.getDrafts()
  },
}))
