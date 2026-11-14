import { create } from 'zustand'

export const useTemplateLibraryStore = create((set) => ({
  templates: [],
  selectedTemplate: null,
  addTemplate: (template) =>
    set((state) => ({ templates: [...state.templates, template] })),
  removeTemplate: (id) =>
    set((state) => ({
      templates: state.templates.filter((t) => t.id !== id),
    })),
  setSelectedTemplate: (template) => set({ selectedTemplate: template }),
}))
