import { create } from 'zustand'

export const usePdfGeneratorStore = create((set) => ({
  generatedPdfs: [],
  isGenerating: false,
  addGeneratedPdf: (pdf) =>
    set((state) => ({ generatedPdfs: [...state.generatedPdfs, pdf] })),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
}))
