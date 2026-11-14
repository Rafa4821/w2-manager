import { create } from 'zustand'

export const useW2DocumentsStore = create((set) => ({
  documents: [],
  selectedDocument: null,
  addDocument: (document) =>
    set((state) => ({ documents: [...state.documents, document] })),
  removeDocument: (id) =>
    set((state) => ({
      documents: state.documents.filter((d) => d.id !== id),
    })),
  setSelectedDocument: (document) => set({ selectedDocument: document }),
}))
