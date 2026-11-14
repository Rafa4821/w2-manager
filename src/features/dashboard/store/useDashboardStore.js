import { create } from 'zustand'

export const useDashboardStore = create((set) => ({
  stats: {
    totalCompanies: 0,
    totalEmployees: 0,
    totalW2Documents: 0,
    pendingDocuments: 0,
  },
  setStats: (stats) => set({ stats }),
}))
