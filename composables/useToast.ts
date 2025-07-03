import { ref } from 'vue'

// Make toasts globally reactive
const globalToasts = ref([])

export interface Toast {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  duration?: number
}

export function useToast() {
  const toasts = globalToasts

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Date.now().toString()
    const duration = toast.duration ?? 5000
    const newToast: Toast = {
      id,
      duration,
      ...toast
    }
    toasts.value.push(newToast)
    // Auto remove after duration
    setTimeout(() => {
      removeToast(id)
    }, duration)
    return id
  }

  const removeToast = (id: string) => {
    const index = toasts.value.findIndex(toast => toast.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  const success = (message: string, duration?: number) => {
    return addToast({ type: 'success', message, duration })
  }

  const error = (message: string, duration?: number) => {
    return addToast({ type: 'error', message, duration })
  }

  const info = (message: string, duration?: number) => {
    return addToast({ type: 'info', message, duration })
  }

  const warning = (message: string, duration?: number) => {
    return addToast({ type: 'warning', message, duration })
  }

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    info,
    warning
  }
} 