import { create } from 'zustand'

export const useCompaniesStore = create((set) => ({
  companies: [],
  selectedCompany: null,
  addCompany: (company) =>
    set((state) => ({ companies: [...state.companies, company] })),
  removeCompany: (id) =>
    set((state) => ({
      companies: state.companies.filter((c) => c.id !== id),
    })),
  setSelectedCompany: (company) => set({ selectedCompany: company }),
}))
