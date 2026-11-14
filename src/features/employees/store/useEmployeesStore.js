import { create } from 'zustand'

export const useEmployeesStore = create((set) => ({
  employees: [],
  selectedEmployee: null,
  addEmployee: (employee) =>
    set((state) => ({ employees: [...state.employees, employee] })),
  removeEmployee: (id) =>
    set((state) => ({
      employees: state.employees.filter((e) => e.id !== id),
    })),
  setSelectedEmployee: (employee) => set({ selectedEmployee: employee }),
}))
