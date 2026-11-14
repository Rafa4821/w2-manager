import { create } from 'zustand'

export const useDataImportExportStore = create((set) => ({
  importHistory: [],
  exportHistory: [],
  isProcessing: false,
  addImportRecord: (record) =>
    set((state) => ({ importHistory: [...state.importHistory, record] })),
  addExportRecord: (record) =>
    set((state) => ({ exportHistory: [...state.exportHistory, record] })),
  setIsProcessing: (isProcessing) => set({ isProcessing }),
}))
