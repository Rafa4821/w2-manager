import { create } from 'zustand'

let nextId = 1

export const useNotificationStore = create((set) => ({
  notifications: [],
  addNotification: ({ type = 'info', title, message, duration = 4000 }) => {
    const id = nextId++
    set((state) => ({
      notifications: [...state.notifications, { id, type, title, message }],
    }))
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }))
      }, duration)
    }
    return id
  },
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}))
